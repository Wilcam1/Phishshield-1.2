import { describe, it, expect } from 'vitest';
import UrlAnalyzer from '../analyzers/urlAnalyzer.js';

describe('UrlAnalyzer (Backend Unit Tests)', () => {
  const analyzer = new UrlAnalyzer();

  it('debe extraer características de una URL segura estándar con analyze()', () => {
    const res = analyzer.analyze('https://www.google.com/search?q=cybersecurity');
    expect(res.dominio).toBe('www.google.com');
    expect(res.protocolo).toBe('https');
    expect(res.esHTTPS).toBe(true);
    expect(res.esIP).toBe(false);
    expect(res.subdominios).toBe(1); // www
    expect(res.tieneGuionesMultiples).toBe(false);
  });

  it('debe detectar una dirección IP como hostname', () => {
    const res = analyzer.analyze('http://192.168.1.50/login.php');
    expect(res.esIP).toBe(true);
    expect(res.esHTTPS).toBe(false);
    expect(res.dominio).toBe('192.168.1.50');
  });

  it('debe detectar múltiples subdominios sospechosos', () => {
    const res = analyzer.analyze('http://login.secure.update.account.verification.bancolombia.phish-site.com');
    expect(res.subdominios).toBeGreaterThan(3);
    expect(res.tieneGuionesMultiples || res.subdominios > 2).toBe(true);
  });

  it('debe detectar parámetros sensibles en el query string', () => {
    const res = analyzer.analyze('https://ejemplo.com/auth?user=juan&password=123&token=abc');
    expect(res.parametrosSensibles).toContain('password');
    expect(res.parametrosSensibles).toContain('token');
    expect(res.parametrosSensibles).toContain('user');
  });

  it('debe manejar URLs sin protocolo agregando https por defecto', () => {
    const res = analyzer.analyze('davivienda.com');
    expect(res.dominio).toBe('davivienda.com');
    expect(res.esHTTPS).toBe(true);
  });
});
