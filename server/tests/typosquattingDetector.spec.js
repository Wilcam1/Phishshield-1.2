import { describe, it, expect } from 'vitest';
import TyposquattingDetector from '../analyzers/typosquattingDetector.js';

describe('TyposquattingDetector (Backend Unit Tests)', () => {
  const detector = new TyposquattingDetector();

  it('no debe marcar un dominio legítimo conocido como suplantación', () => {
    const res = detector.detectar('www.bancolombia.com');
    expect(res.detectado).toBe(false);
  });

  it('debe detectar typosquatting por omisión o sustitución de caracteres (banc0lombia)', () => {
    const res = detector.detectar('banc0lombia.com');
    expect(res.detectado).toBe(true);
    expect(res.bancoImitado).toBe('bancolombia');
    expect(res.indicadores.length).toBeGreaterThan(0);
  });

  it('debe detectar typosquatting con nombre de PayPal en dominio no oficial', () => {
    const res = detector.detectar('paypal-security-login.xyz');
    expect(res.detectado).toBe(true);
    expect(res.bancoImitado).toBe('paypal');
  });

  it('debe detectar un dominio registrado en la blacklist local', () => {
    const res = detector.detectar('secure-bancolombia-login.com');
    expect(res.detectado).toBe(true);
    expect(res.indicadores.some(i => i.includes('lista negra'))).toBe(true);
  });
});
