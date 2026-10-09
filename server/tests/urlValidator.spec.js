import { describe, it, expect } from 'vitest';
import UrlSecurityValidator from '../security/urlValidator.js';

describe('UrlSecurityValidator (SSRF Protection Tests)', () => {
  it('debe permitir dominios públicos legítimos', () => {
    const res = UrlSecurityValidator.validarUrl('https://bancolombia.com/personas');
    expect(res.valida).toBe(true);
    expect(res.hostname).toBe('bancolombia.com');
  });

  it('debe bloquear localhost y 127.0.0.1', () => {
    const r1 = UrlSecurityValidator.validarUrl('http://localhost:3000/admin');
    const r2 = UrlSecurityValidator.validarUrl('http://127.0.0.1:8080');
    expect(r1.valida).toBe(false);
    expect(r2.valida).toBe(false);
    expect(r1.motivo).toContain('SSRF');
  });

  it('debe bloquear rangos privados RFC 1918 (10.x, 192.168.x, 172.16-31.x)', () => {
    const r1 = UrlSecurityValidator.validarUrl('http://10.0.0.1/status');
    const r2 = UrlSecurityValidator.validarUrl('http://192.168.1.1/router');
    const r3 = UrlSecurityValidator.validarUrl('http://172.20.10.2');
    expect(r1.valida).toBe(false);
    expect(r2.valida).toBe(false);
    expect(r3.valida).toBe(false);
  });

  it('debe bloquear dirección de AWS / Cloud Metadata (169.254.169.254)', () => {
    const res = UrlSecurityValidator.validarUrl('http://169.254.169.254/latest/meta-data/');
    expect(res.valida).toBe(false);
    expect(res.motivo).toContain('SSRF');
  });

  it('debe bloquear protocolos peligrosos (file://, gopher://, ftp://)', () => {
    const r1 = UrlSecurityValidator.validarUrl('file:///etc/passwd');
    const r2 = UrlSecurityValidator.validarUrl('ftp://ftp.server.com');
    expect(r1.valida).toBe(false);
    expect(r2.valida).toBe(false);
  });

  it('debe bloquear entradas no válidas o vacías', () => {
    expect(UrlSecurityValidator.validarUrl('').valida).toBe(false);
    expect(UrlSecurityValidator.validarUrl(null).valida).toBe(false);
    expect(UrlSecurityValidator.validarUrl(':::bad-url:::').valida).toBe(false);
  });
});
