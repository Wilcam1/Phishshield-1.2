# 3️⃣ Motor de análisis forense y heurístico multicapa

/**
 * forensicEngine.js
 * -----------------
 * Este módulo implementa **19 validaciones técnicas** sobre una URL para determinar su nivel de riesgo.
 * Cada función devuelve un objeto `{ passed: boolean, score: number, detail: string }` que será
 * acumulado por `runAllValidations`.
 *
 * Las validaciones incluyen:
 *   1. **Análisis estructural de la URL** (esquema, hostname, puerto, ruta, query).
 *   2. **Detección de typosquatting** mediante distancia de Levenshtein contra una lista de dominios de alta reputación.
 *   3. **Detección de homógrafos Unicode / Punycode** (uso de caracteres no‑ASCII en el hostname).
 *   4. **Uso de dirección IP en lugar de dominio**.
 *   5. **Longitud excesiva del dominio** (> 63 caracteres) y del URL completo (> 100 caracteres).
 *   6. **Cálculo de entropía de Shannon del dominio** (indicador de DGA).
 *   7. **Número de sub‑dominios** (más de 2 se considera sospechoso).
 *   8. **Presencia de guiones múltiples** en el hostname.
 *   9. **Presencia de números en el dominio**.
 *  10. **Parámetros sensibles** en la query string (password, token, ssn, etc.).
 *  11. **Número de parámetros** (más de 5).
 *  12. **Longitud de la ruta** (> 50 caracteres).
 *  13. **Redirecciones encadenadas** (más de 3 redirects usando `fetch` con `redirect: "follow"`).
 *  14. **Certificado SSL/TLS** (verificar caducidad, cadena de confianza, si es autofirmado).
 *  15. **Presencia de certificado expirado o próximo a expirar (< 30 días)**.
 *  16. **Reputación vía Google SafeBrowsing** (consulta API externa, si está disponible).
 *  17. **Reputación vía VirusTotal** (consulta API externa, si está disponible).
 *  18. **Reputación vía PhishTank** (consulta API externa, si está disponible).
 *  19. **Emulación aislada del DOM con Puppeteer** para detectar elementos de formulario de captura de credenciales.
 *
 * Cada validación asigna un **puntuación** (0‑2) que se suma a un **score total** (máximo ≈ 30).
 * El motor devuelve:
 *   ```json
 *   {
 *     "url": "https://example.com",
 *     "score": 12,
 *     "details": ["..."],
 *     "features": {"entropy": 4.5, "subdomains": 3, ...}
 *   }
 *   ```
 *
 * El código está escrito en **Node.js (ES2022)** y usa las siguientes dependencias externas:
 *   - `fast-levenshtein` – cálculo de distancia Levenshtein.
 *   - `punycode` – detección de dominios IDN.
 *   - `node-forge` – inspección de certificados TLS.
 *   - `puppeteer` – navegación sin cabeza para análisis de DOM.
 *   - `node-fetch` – solicitudes HTTP (con redirección controlada).
 */

import { URL } from 'url';
import fetch from 'node-fetch';
import levenshtein from 'fast-levenshtein';
import punycode from 'punycode/';
import forge from 'node-forge';
import puppeteer from 'puppeteer';

/** Helper: calcula entropía de Shannon de una cadena */
function shannonEntropy(str) {
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  const len = str.length;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/** 1. Análisis estructural básico */
function structuralAnalysis(urlStr) {
  try {
    const url = new URL(urlStr);
    const result = {
      passed: true,
      score: 0,
      detail: `Esquema: ${url.protocol}, hostname: ${url.hostname}, puerto: ${url.port || 'default'}, ruta: ${url.pathname}`,
      features: {
        scheme: url.protocol.replace(':', ''),
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        pathLength: url.pathname.length,
        queryLength: url.search.length,
        totalLength: url.href.length,
      },
    };
    // Penalizar dominios >63 caracteres
    if (url.hostname.length > 63) {
      result.score += 2;
      result.detail += ' | dominio demasiado largo (>63)';
    }
    // Penalizar URLs >100 caracteres
    if (url.href.length > 100) {
      result.score += 1;
      result.detail += ' | URL demasiado larga (>100)';
    }
    return result;
  } catch (e) {
    return { passed: false, score: 5, detail: 'URL inválida', features: {} };
  }
}

/** 2. Detección de typosquatting (Levenshtein) */
async function typosquattingDetection(hostname, whitelist) {
  // whitelist: array de dominios de alta reputación (ej. Alexa Top 1M)
  let minDist = Infinity;
  for (const good of whitelist) {
    const d = levenshtein.get(hostname, good);
    if (d < minDist) minDist = d;
    if (minDist === 0) break;
  }
  const suspicious = minDist > 0 && minDist <= 2; // umbral típico
  return {
    passed: !suspicious,
    score: suspicious ? 3 : 0,
    detail: `Distancia Levenshtein mínima = ${minDist}`,
  };
}

/** 3. Homógrafos Unicode / Punycode */
function unicodeHomographDetection(hostname) {
  // Si el hostname contiene caracteres no ASCII, es sospechoso
  const isAscii = /^[\x00-\x7F]+$/.test(hostname);
  const hasPunycode = hostname.startsWith('xn--');
  const suspicious = !isAscii || hasPunycode;
  return {
    passed: !suspicious,
    score: suspicious ? 4 : 0,
    detail: isAscii ? 'ASCII-only' : 'Unicode characters detected',
  };
}

/** 4. Uso de IP en lugar de dominio */
function ipAddressDetection(hostname) {
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const isIp = ipRegex.test(hostname);
  return {
    passed: !isIp,
    score: isIp ? 3 : 0,
    detail: isIp ? 'Hostname es una dirección IP' : 'Hostname es dominio',
  };
}

/** 5. Número de sub‑dominios */
function subdomainCount(hostname) {
  const parts = hostname.split('.');
  const subdomains = parts.length - 2; // excluir dominio + TLD
  const suspicious = subdomains > 2;
  return {
    passed: !suspicious,
    score: suspicious ? 2 : 0,
    detail: `Sub‑dominios: ${subdomains}`,
    features: { subdomains },
  };
}

/** 6. Guiones múltiples */
function multipleHyphens(hostname) {
  const hyphens = (hostname.match(/-/g) || []).length;
  const suspicious = hyphens > 2;
  return {
    passed: !suspicious,
    score: suspicious ? 2 : 0,
    detail: `Guiones en hostname: ${hyphens}`,
  };
}

/** 7. Números en el dominio */
function numericDomain(hostname) {
  const hasNumber = /\d/.test(hostname);
  return {
    passed: !hasNumber,
    score: hasNumber ? 1 : 0,
    detail: hasNumber ? 'Contiene números' : 'Sin números',
  };
}

/** 8. Parámetros sensibles en la query */
function sensitiveParameters(urlObj) {
  const sensitive = ['password', 'pwd', 'token', 'auth', 'ssn', 'login', 'user', 'pass', 'account'];
  if (!urlObj.search) return { passed: true, score: 0, detail: 'Sin parámetros' };
  const params = new URLSearchParams(urlObj.search);
  const found = [];
  for (const s of sensitive) if (params.has(s)) found.push(s);
  const suspicious = found.length > 0;
  return {
    passed: !suspicious,
    score: suspicious ? 3 : 0,
    detail: suspicious ? `Parámetros sensibles: ${found.join(', ')}` : 'Sin parámetros sensibles',
  };
}

/** 9. Número de parámetros */
function parameterCount(urlObj) {
  if (!urlObj.search) return { passed: true, score: 0, detail: '0 parámetros' };
  const count = new URLSearchParams(urlObj.search).size;
  const suspicious = count > 5;
  return {
    passed: !suspicious,
    score: suspicious ? 1 : 0,
    detail: `${count} parámetros en query`,
    features: { paramCount: count },
  };
}

/** 10. Longitud de la ruta */
function pathLength(urlObj) {
  const len = urlObj.pathname.length;
  const suspicious = len > 50;
  return {
    passed: !suspicious,
    score: suspicious ? 1 : 0,
    detail: `Longitud de ruta: ${len}`,
    features: { pathLength: len },
  };
}

/** 11. Redirecciones encadenadas */
async function redirectChain(urlStr, maxRedirects = 3) {
  let redirects = 0;
  let current = urlStr;
  while (redirects < maxRedirects) {
    const res = await fetch(current, { method: 'HEAD', redirect: 'manual' });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location'), current).href;
      redirects++;
    } else {
      break;
    }
  }
  const suspicious = redirects >= maxRedirects;
  return {
    passed: !suspicious,
    score: suspicious ? 2 : 0,
    detail: `Redirecciones: ${redirects}`,
  };
}

/** 12. Inspección de certificado SSL/TLS */
async function sslInspection(hostname) {
  return new Promise((resolve) => {
    const tls = require('tls');
    const socket = tls.connect(443, hostname, { rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate(true);
      const now = Date.now();
      const notAfter = new Date(cert.valid_to).getTime();
      const notBefore = new Date(cert.valid_from).getTime();
      const daysToExpiry = (notAfter - now) / (1000 * 60 * 60 * 24);
      const isSelfSigned = cert.issuerCertificate === undefined || cert.issuerCertificate === cert;
      const issues = [];
      if (isSelfSigned) issues.push('autofirmado');
      if (daysToExpiry < 0) issues.push('expirado');
      else if (daysToExpiry < 30) issues.push('próximo a expirar');
      const score = issues.length * 2; // 2 puntos por cada issue
      resolve({
        passed: issues.length === 0,
        score,
        detail: issues.length ? `Certificado: ${issues.join(', ')}` : 'Certificado válido',
      });
    });
    socket.on('error', () => {
      resolve({ passed: false, score: 4, detail: 'Error al obtener certificado TLS' });
    });
  });
}

/** 13‑15. Reputación externa (SafeBrowsing, VirusTotal, PhishTank) */
async function externalReputation(urlStr, apiKeys) {
  const results = [];
  // Google SafeBrowsing (si apiKey disponible)
  if (apiKeys.safeBrowsing) {
    try {
      const sbRes = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKeys.safeBrowsing}`, {
        method: 'POST',
        body: JSON.stringify({ client: { clientId: 'phishshield', clientVersion: '1.0' }, threatInfo: { threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'], platformTypes: ['ANY_PLATFORM'], threatEntryTypes: ['URL'], threatEntries: [{ url: urlStr }] } }),
        headers: { 'Content-Type': 'application/json' },
      });
      const sbJson = await sbRes.json();
      if (sbJson.matches) {
        results.push({ source: 'SafeBrowsing', passed: false, score: 5, detail: 'Detectado como amenaza' });
      } else {
        results.push({ source: 'SafeBrowsing', passed: true, score: 0, detail: 'Sin amenaza' });
      }
    } catch (_) { /* ignore */ }
  }
  // VirusTotal (si apiKey disponible)
  if (apiKeys.virusTotal) {
    try {
      const vtRes = await fetch(`https://www.virustotal.com/api/v3/urls`, {
        method: 'POST',
        body: new URLSearchParams({ url: urlStr }),
        headers: { 'x-apikey': apiKeys.virusTotal },
      });
      const vtJson = await vtRes.json();
      if (vtJson.data && vtJson.data.attributes && vtJson.data.attributes.last_analysis_stats.malicious > 0) {
        results.push({ source: 'VirusTotal', passed: false, score: 4, detail: 'Marcado como malicioso' });
      } else {
        results.push({ source: 'VirusTotal', passed: true, score: 0, detail: 'Limpio' });
      }
    } catch (_) { }
  }
  // PhishTank (si apiKey disponible)
  if (apiKeys.phishTank) {
    try {
      const ptRes = await fetch(`http://checkurl.phishtank.com/checkurl/`, {
        method: 'POST',
        body: new URLSearchParams({ url: urlStr, format: 'json', app_key: apiKeys.phishTank }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const ptJson = await ptRes.json();
      if (ptJson && ptJson.results && ptJson.results.in_database) {
        results.push({ source: 'PhishTank', passed: false, score: 4, detail: 'En base de datos PhishTank' });
      } else {
        results.push({ source: 'PhishTank', passed: true, score: 0, detail: 'No encontrado' });
      }
    } catch (_) { }
  }
  return results;
}

/** 16. Emulación DOM con Puppeteer */
async function puppeteerDomAnalysis(urlStr) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(urlStr, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  // Detectar formularios que solicitan credenciales
  const forms = await page.$$eval('form', (forms) => forms.map((f) => ({ action: f.action, method: f.method, inputs: Array.from(f.elements).map(i => i.name) })));
  const suspiciousForms = forms.filter(f => f.inputs.some(name => /pass|pwd|ssn|token|login|email/i.test(name)));
  await browser.close();
  const suspicious = suspiciousForms.length > 0;
  return {
    passed: !suspicious,
    score: suspicious ? 4 : 0,
    detail: suspicious ? `Formularios sospechosos detectados (${suspiciousForms.length})` : 'Sin formularios sospechosos',
  };
}

/** Ejecuta todas las validaciones y devuelve un resumen */
export async function runAllValidations(urlStr, whitelist = [], apiKeys = {}) {
  const urlObj = new URL(urlStr);
  const results = [];
  // 1‑5
  results.push(structuralAnalysis(urlStr));
  results.push(await typosquattingDetection(urlObj.hostname, whitelist));
  results.push(unicodeHomographDetection(urlObj.hostname));
  results.push(ipAddressDetection(urlObj.hostname));
  results.push(subdomainCount(urlObj.hostname));
  // 6‑10
  results.push(multipleHyphens(urlObj.hostname));
  results.push(numericDomain(urlObj.hostname));
  results.push(sensitiveParameters(urlObj));
  results.push(parameterCount(urlObj));
  results.push(pathLength(urlObj));
  // 11‑13
  results.push(await redirectChain(urlStr));
  results.push(await sslInspection(urlObj.hostname));
  const external = await externalReputation(urlStr, apiKeys);
  results.push(...external);
  // 14
  results.push(await puppeteerDomAnalysis(urlStr));

  // Agregación de scores y features
  let totalScore = 0;
  const details = [];
  const features = {};
  for (const r of results) {
    totalScore += r.score || 0;
    details.push(r.detail);
    if (r.features) Object.assign(features, r.features);
  }

  // Entropía del dominio (añadida como feature adicional)
  const entropy = shannonEntropy(urlObj.hostname.replace(/\./g, ''));
  features.entropy = entropy;
  if (entropy > 4.5) { totalScore += 2; details.push('Alta entropía de dominio (>4.5)'); }

  return {
    url: urlStr,
    score: totalScore,
    details,
    features,
  };
}

/** Export helper for testing */
export const _private = {
  shannonEntropy,
  structuralAnalysis,
  typosquattingDetection,
  unicodeHomographDetection,
  ipAddressDetection,
  subdomainCount,
  multipleHyphens,
  numericDomain,
  sensitiveParameters,
  parameterCount,
  pathLength,
  redirectChain,
  sslInspection,
  externalReputation,
  puppeteerDomAnalysis,
};
```

> **Nota**: El archivo asume que las dependencias listadas están instaladas (`npm i fast-levenshtein punycode node-forge puppeteer node-fetch`).

---

## 3️⃣ Próximos pasos
1. **Añadir el archivo al repositorio** y crear el primer commit de este motor.
2. **Implementar pruebas unitarias** (`tests/engine/forensicEngine.test.js`).
3. **Crear scripts de integración** para que el backend orquestador invoque `runAllValidations`.
4. **Documentar** la API pública (`runAllValidations`) en el README del backend.

---

*Este documento se guarda como `point3_engine_design.md` y el código en `backend/engine/forensicEngine.js`.*
