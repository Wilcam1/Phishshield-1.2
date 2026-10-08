/**
 * forensicEngine.js
 * -----------------
 * Motor de análisis forense y heurístico multicapa para PhishShield.
 * Este módulo implementa 19 validaciones técnicas sobre una URL para determinar su nivel de riesgo.
 * Cada función evaluadora devuelve un objeto:
 *   { aprobado: boolean, puntuacion: number, detalle: string, caracteristicas?: object }
 */

import { URL } from 'url';
import fetch from 'node-fetch';
import levenshtein from 'fast-levenshtein';
import punycode from 'punycode/';
import forge from 'node-forge';
import puppeteer from 'puppeteer';

/**
 * Calcula la entropía de Shannon de una cadena de texto (indicador de DGA / aleatoriedad).
 * @param {string} cadena Cadena de entrada (ej. nombre de dominio).
 * @returns {number} Entropía calculada en bits.
 */
export function calcularEntropiaShannon(cadena) {
  const frecuencias = {};
  for (const caracter of cadena) {
    frecuencias[caracter] = (frecuencias[caracter] || 0) + 1;
  }
  const longitud = cadena.length;
  let entropia = 0;
  for (const cantidad of Object.values(frecuencias)) {
    const probabilidad = cantidad / longitud;
    entropia -= probabilidad * Math.log2(probabilidad);
  }
  return entropia;
}

/**
 * Validación 1: Análisis estructural básico de la URL.
 * @param {string} cadenaUrl URL completa a analizar.
 */
export function analisisEstructural(cadenaUrl) {
  try {
    const objetoUrl = new URL(cadenaUrl);
    const resultado = {
      aprobado: true,
      puntuacion: 0,
      detalle: `Esquema: ${objetoUrl.protocol}, host: ${objetoUrl.hostname}, puerto: ${objetoUrl.port || 'predeterminado'}, ruta: ${objetoUrl.pathname}`,
      caracteristicas: {
        esquema: objetoUrl.protocol.replace(':', ''),
        nombreHost: objetoUrl.hostname,
        puerto: objetoUrl.port || (objetoUrl.protocol === 'https:' ? '443' : '80'),
        longitudRuta: objetoUrl.pathname.length,
        longitudConsulta: objetoUrl.search.length,
        longitudTotal: objetoUrl.href.length,
      },
    };

    // Penalizar si el dominio supera los 63 caracteres estándar
    if (objetoUrl.hostname.length > 63) {
      resultado.puntuacion += 2;
      resultado.detalle += ' | Dominio demasiado largo (>63)';
    }

    // Penalizar si la URL completa excede 100 caracteres
    if (objetoUrl.href.length > 100) {
      resultado.puntuacion += 1;
      resultado.detalle += ' | URL demasiado larga (>100)';
    }

    return resultado;
  } catch (error) {
    return {
      aprobado: false,
      puntuacion: 5,
      detalle: `URL inválida: ${error.message}`,
      caracteristicas: {},
    };
  }
}

/**
 * Validación 2: Detección de typosquatting mediante distancia Levenshtein.
 * @param {string} nombreHost Nombre de host del dominio.
 * @param {Array<string>} listaBlanca Dominios legítimos de referencia.
 */
export async function deteccionTyposquatting(nombreHost, listaBlanca = []) {
  let distanciaMinima = Infinity;
  for (const dominioLegitimo of listaBlanca) {
    const distancia = levenshtein.get(nombreHost, dominioLegitimo);
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
    }
    if (distanciaMinima === 0) break;
  }

  const sospechoso = distanciaMinima > 0 && distanciaMinima <= 2;
  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 3 : 0,
    detalle: `Distancia Levenshtein mínima = ${distanciaMinima}`,
  };
}

/**
 * Validación 3: Detección de homógrafos Unicode / Punycode.
 * @param {string} nombreHost Nombre de host.
 */
export function deteccionHomografosUnicode(nombreHost) {
  const esAscii = /^[\x00-\x7F]+$/.test(nombreHost);
  const tienePunycode = nombreHost.startsWith('xn--');
  const sospechoso = !esAscii || tienePunycode;

  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 4 : 0,
    detalle: sospechoso ? 'Caracteres Unicode / Punycode detectados' : 'Host únicamente ASCII',
  };
}

/**
 * Validación 4: Detección de uso de dirección IP en lugar de dominio.
 * @param {string} nombreHost Nombre de host.
 */
export function deteccionDireccionIp(nombreHost) {
  const patronIp = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const esIp = patronIp.test(nombreHost);

  return {
    aprobado: !esIp,
    puntuacion: esIp ? 3 : 0,
    detalle: esIp ? 'El host es una dirección IP directa' : 'El host es un nombre de dominio',
  };
}

/**
 * Validación 5: Conteo de subdominios.
 * @param {string} nombreHost Nombre de host.
 */
export function conteoSubdominios(nombreHost) {
  const partes = nombreHost.split('.');
  const subdominios = Math.max(0, partes.length - 2);
  const sospechoso = subdominios > 2;

  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 2 : 0,
    detalle: `Subdominios detectados: ${subdominios}`,
    caracteristicas: { subdominios },
  };
}

/**
 * Validación 6: Detección de guiones múltiples en el host.
 * @param {string} nombreHost Nombre de host.
 */
export function guionesMultiples(nombreHost) {
  const cantidadGuiones = (nombreHost.match(/-/g) || []).length;
  const sospechoso = cantidadGuiones > 2;

  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 2 : 0,
    detalle: `Guiones en host: ${cantidadGuiones}`,
  };
}

/**
 * Validación 7: Detección de números en el dominio.
 * @param {string} nombreHost Nombre de host.
 */
export function dominioNumerico(nombreHost) {
  const contieneNumero = /\d/.test(nombreHost);

  return {
    aprobado: !contieneNumero,
    puntuacion: contieneNumero ? 1 : 0,
    detalle: contieneNumero ? 'Contiene dígitos numéricos' : 'Sin dígitos numéricos',
  };
}

/**
 * Validación 8: Detección de parámetros sensibles en la consulta.
 * @param {URL} objetoUrl Objeto URL analizado.
 */
export function parametrosSensibles(objetoUrl) {
  const palabrasSensibles = ['password', 'pwd', 'token', 'auth', 'ssn', 'login', 'user', 'pass', 'account', 'clave', 'contrasena'];
  if (!objetoUrl.search) {
    return { aprobado: true, puntuacion: 0, detalle: 'Sin parámetros en consulta' };
  }

  const parametros = new URLSearchParams(objetoUrl.search);
  const encontrados = [];
  for (const palabra of palabrasSensibles) {
    if (parametros.has(palabra)) encontrados.push(palabra);
  }

  const sospechoso = encontrados.length > 0;
  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 3 : 0,
    detalle: sospechoso ? `Parámetros sensibles encontrados: ${encontrados.join(', ')}` : 'Sin parámetros sensibles',
  };
}

/**
 * Validación 9: Conteo de parámetros en consulta.
 * @param {URL} objetoUrl Objeto URL.
 */
export function conteoParametros(objetoUrl) {
  if (!objetoUrl.search) {
    return { aprobado: true, puntuacion: 0, detalle: '0 parámetros en consulta' };
  }

  const cantidad = new URLSearchParams(objetoUrl.search).size;
  const sospechoso = cantidad > 5;

  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 1 : 0,
    detalle: `${cantidad} parámetros en consulta`,
    caracteristicas: { cantidadParametros: cantidad },
  };
}

/**
 * Validación 10: Longitud de la ruta.
 * @param {URL} objetoUrl Objeto URL.
 */
export function longitudRuta(objetoUrl) {
  const longitud = objetoUrl.pathname.length;
  const sospechoso = longitud > 50;

  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 1 : 0,
    detalle: `Longitud de ruta: ${longitud} caracteres`,
    caracteristicas: { longitudRuta: longitud },
  };
}

/**
 * Validación 11: Detección de cadenas de redirecciones sospechosas.
 * @param {string} cadenaUrl URL inicial.
 * @param {number} maximoRedirecciones Límite tolerado de saltos.
 */
export async function cadenaRedirecciones(cadenaUrl, maximoRedirecciones = 3) {
  let contadorRedirecciones = 0;
  let urlActual = cadenaUrl;

  try {
    while (contadorRedirecciones < maximoRedirecciones) {
      const respuesta = await fetch(urlActual, { method: 'HEAD', redirect: 'manual' });
      if (respuesta.status >= 300 && respuesta.status < 400 && respuesta.headers.get('location')) {
        urlActual = new URL(respuesta.headers.get('location'), urlActual).href;
        contadorRedirecciones++;
      } else {
        break;
      }
    }
  } catch (error) {
    // Si no responde se asume fallo de conexión
  }

  const sospechoso = contadorRedirecciones >= maximoRedirecciones;
  return {
    aprobado: !sospechoso,
    puntuacion: sospechoso ? 2 : 0,
    detalle: `Redirecciones encadenadas: ${contadorRedirecciones}`,
  };
}

/**
 * Validación 12: Inspección de certificado SSL/TLS.
 * @param {string} nombreHost Nombre de host.
 */
export async function inspeccionSsl(nombreHost) {
  return new Promise((resolver) => {
    import('tls').then((moduloTls) => {
      const socket = moduloTls.connect(443, nombreHost, { rejectUnauthorized: false, servername: nombreHost }, () => {
        const certificado = socket.getPeerCertificate(true);
        socket.end();

        if (!certificado || Object.keys(certificado).length === 0) {
          return resolver({
            aprobado: false,
            puntuacion: 4,
            detalle: 'No se obtuvo certificado TLS/SSL',
          });
        }

        const ahora = Date.now();
        const fechaFin = new Date(certificado.valid_to).getTime();
        const diasParaExpirar = (fechaFin - ahora) / (1000 * 60 * 60 * 24);
        const esAutofirmado = !certificado.issuerCertificate || certificado.issuerCertificate === certificado;

        const problemas = [];
        if (esAutofirmado) problemas.push('autofirmado');
        if (diasParaExpirar < 0) problemas.push('expirado');
        else if (diasParaExpirar < 30) problemas.push('próximo a expirar (<30 días)');

        const puntuacion = problemas.length * 2;
        resolver({
          aprobado: problemas.length === 0,
          puntuacion,
          detalle: problemas.length ? `Problemas de certificado: ${problemas.join(', ')}` : 'Certificado SSL/TLS válido',
        });
      });

      socket.on('error', () => {
        resolver({ aprobado: false, puntuacion: 3, detalle: 'Error de conexión TLS/SSL' });
      });
      socket.setTimeout(5000, () => {
        socket.destroy();
        resolver({ aprobado: false, puntuacion: 2, detalle: 'Tiempo de espera agotado al verificar TLS' });
      });
    }).catch(() => {
      resolver({ aprobado: false, puntuacion: 2, detalle: 'Módulo TLS no disponible' });
    });
  });
}

/**
 * Validaciones 13-15: Consulta de reputación externa (SafeBrowsing, VirusTotal, PhishTank).
 * @param {string} cadenaUrl URL objetivo.
 * @param {object} clavesApi Objeto con claves opcionales de API.
 */
export async function reputacionExterna(cadenaUrl, clavesApi = {}) {
  const resultados = [];

  // Google Safe Browsing
  if (clavesApi.safeBrowsing) {
    try {
      const respuesta = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${clavesApi.safeBrowsing}`, {
        method: 'POST',
        body: JSON.stringify({
          client: { clientId: 'phishshield', clientVersion: '1.2' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: cadenaUrl }],
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const datosJson = await respuesta.json();
      const esAmenaza = Boolean(datosJson.matches && datosJson.matches.length > 0);
      resultados.push({
        fuente: 'Google Safe Browsing',
        aprobado: !esAmenaza,
        puntuacion: esAmenaza ? 5 : 0,
        detalle: esAmenaza ? 'Marcada como amenaza por Google' : 'Limpia en Google Safe Browsing',
      });
    } catch (_) {
      // Ignorar fallo de API externa
    }
  }

  // VirusTotal
  if (clavesApi.virusTotal) {
    try {
      const respuesta = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        body: new URLSearchParams({ url: cadenaUrl }),
        headers: { 'x-apikey': clavesApi.virusTotal },
      });
      const datosJson = await respuesta.json();
      const estadisticas = datosJson?.data?.attributes?.last_analysis_stats;
      const maliciosos = estadisticas?.malicious || 0;
      resultados.push({
        fuente: 'VirusTotal',
        aprobado: maliciosos === 0,
        puntuacion: maliciosos > 0 ? 4 : 0,
        detalle: maliciosos > 0 ? `Detectada por ${maliciosos} motores en VirusTotal` : 'Limpia en VirusTotal',
      });
    } catch (_) {
      // Ignorar fallo de API externa
    }
  }

  // PhishTank
  if (clavesApi.phishTank) {
    try {
      const respuesta = await fetch('https://checkurl.phishtank.com/checkurl/', {
        method: 'POST',
        body: new URLSearchParams({ url: cadenaUrl, format: 'json', app_key: clavesApi.phishTank }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const datosJson = await respuesta.json();
      const estaEnBaseDatos = Boolean(datosJson?.results?.in_database);
      resultados.push({
        fuente: 'PhishTank',
        aprobado: !estaEnBaseDatos,
        puntuacion: estaEnBaseDatos ? 4 : 0,
        detalle: estaEnBaseDatos ? 'Presente en base de datos de PhishTank' : 'No registrada en PhishTank',
      });
    } catch (_) {
      // Ignorar fallo de API externa
    }
  }

  return resultados;
}

/**
 * Validación 16-19: Emulación aislada del DOM con Puppeteer (captura de credenciales, formularios sospechosos).
 * @param {string} cadenaUrl URL objetivo.
 */
export async function analisisDomPuppeteer(cadenaUrl) {
  let navegador = null;
  try {
    navegador = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const pagina = await navegador.newPage();
    await pagina.goto(cadenaUrl, { waitUntil: 'networkidle2', timeout: 12000 });

    const formularios = await pagina.$$eval('form', (elementosFormulario) =>
      elementosFormulario.map((formulario) => ({
        accion: formulario.action,
        metodo: formulario.method,
        entradas: Array.from(formulario.elements).map((elemento) => elemento.name || elemento.id || ''),
      }))
    );

    const formulariosSospechosos = formularios.filter((formulario) =>
      formulario.entradas.some((nombre) => /pass|pwd|clave|token|login|email|cedula|identificacion/i.test(nombre))
    );

    await navegador.close();
    navegador = null;

    const sospechoso = formulariosSospechosos.length > 0;
    return {
      aprobado: !sospechoso,
      puntuacion: sospechoso ? 4 : 0,
      detalle: sospechoso
        ? `Formularios de recolección de credenciales detectados (${formulariosSospechosos.length})`
        : 'Sin formularios sospechosos en el DOM',
    };
  } catch (error) {
    if (navegador) {
      try {
        await navegador.close();
      } catch (_) {}
    }
    return {
      aprobado: true,
      puntuacion: 0,
      detalle: `Emulación DOM omitida: ${error.message}`,
    };
  }
}

/**
 * Ejecuta el conjunto completo de validaciones forenses y heurísticas.
 * @param {string} cadenaUrl URL a evaluar.
 * @param {Array<string>} listaBlanca Lista de dominios de alta reputación.
 * @param {object} clavesApi Claves para APIs de inteligencia de amenazas.
 * @returns {Promise<object>} Resumen consolidado del análisis forense.
 */
export async function ejecutarTodasValidaciones(cadenaUrl, listaBlanca = [], clavesApi = {}) {
  const objetoUrl = new URL(cadenaUrl);
  const resultados = [];

  // Ejecución secuencial y ordenada de validaciones técnicas
  resultados.push(analisisEstructural(cadenaUrl));
  resultados.push(await deteccionTyposquatting(objetoUrl.hostname, listaBlanca));
  resultados.push(deteccionHomografosUnicode(objetoUrl.hostname));
  resultados.push(deteccionDireccionIp(objetoUrl.hostname));
  resultados.push(conteoSubdominios(objetoUrl.hostname));
  resultados.push(guionesMultiples(objetoUrl.hostname));
  resultados.push(dominioNumerico(objetoUrl.hostname));
  resultados.push(parametrosSensibles(objetoUrl));
  resultados.push(conteoParametros(objetoUrl));
  resultados.push(longitudRuta(objetoUrl));
  resultados.push(await cadenaRedirecciones(cadenaUrl));
  resultados.push(await inspeccionSsl(objetoUrl.hostname));

  const reputaciones = await reputacionExterna(cadenaUrl, clavesApi);
  resultados.push(...reputaciones);

  const resultadoDom = await analisisDomPuppeteer(cadenaUrl);
  resultados.push(resultadoDom);

  // Consolidación de puntuaciones, detalles y vector de características
  let puntuacionTotal = 0;
  const detalles = [];
  const caracteristicas = {};

  for (const item of resultados) {
    puntuacionTotal += item.puntuacion || 0;
    if (item.detalle) detalles.push(item.detalle);
    if (item.caracteristicas) Object.assign(caracteristicas, item.caracteristicas);
  }

  // Cálculo de entropía de Shannon del nombre de host
  const entropiaCalculada = calcularEntropiaShannon(objetoUrl.hostname.replace(/\./g, ''));
  caracteristicas.entropia = Number(entropiaCalculada.toFixed(4));
  if (entropiaCalculada > 4.5) {
    puntuacionTotal += 2;
    detalles.push(`Alta entropía en dominio (${entropiaCalculada.toFixed(2)} bits, indicio DGA)`);
  }

  return {
    url: cadenaUrl,
    puntuacionTotal,
    detalles,
    caracteristicas,
    // Alias de compatibilidad
    score: puntuacionTotal,
    details: detalles,
    features: caracteristicas,
  };
}

// Alias de compatibilidad para integración con librerías externas
export const runAllValidations = ejecutarTodasValidaciones;
export const shannonEntropy = calcularEntropiaShannon;
