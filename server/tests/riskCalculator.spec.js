import { describe, it, expect } from 'vitest';
import RiskCalculator from '../analyzers/riskCalculator.js';

describe('RiskCalculator (Backend Unit Tests)', () => {
  const calculator = new RiskCalculator();

  it('debe calcular riesgo bajo cuando no hay factores de amenaza y el sitio es legítimo', () => {
    const res = calculator.calcular(
      [], // indicadores
      { esHTTPS: true, subdominios: 0, longitudTotal: 25 }, // caracteristicas
      [], // verificacionesExternas
      null, // mlResult
      { analizado: true, tieneSsl: true, diasActivo: 300, autorizado: true, esReciente: false }, // sslResult
      { analizado: true, tienePassword: false, tieneTarjeta: false } // domResult
    );

    const nivelRiesgo = calculator.determinarRiesgo(res.puntuacion);
    expect(nivelRiesgo).toBe('bajo');
    expect(res.puntuacion).toBeLessThanOrEqual(3);
  });

  it('debe activar Score Floor crítico si fue reportado manualmente o detectado por SafeBrowsing / VirusTotal', () => {
    const res = calculator.calcular(
      ['Dominio sospechoso'],
      { esHTTPS: true, subdominios: 1, longitudTotal: 40 },
      ['reportado_manualmente'],
      null,
      { analizado: true, tieneSsl: true, diasActivo: 100 },
      { analizado: true, tienePassword: false }
    );

    const nivelRiesgo = calculator.determinarRiesgo(res.puntuacion);
    expect(nivelRiesgo).toBe('alto');
    expect(res.puntuacion).toBeGreaterThanOrEqual(8);
  });

  it('debe aumentar severidad si una página captura datos de tarjetas de crédito o contraseñas', () => {
    const res = calculator.calcular(
      ['Formulario sospechoso'],
      { esHTTPS: false, subdominios: 2, longitudTotal: 60 },
      [],
      null,
      { analizado: false },
      { analizado: true, tieneTarjeta: true, tienePassword: true, metaRefresh: true }
    );

    const nivelRiesgo = calculator.determinarRiesgo(res.puntuacion);
    expect(nivelRiesgo).toBe('alto');
    expect(res.puntuacion).toBeGreaterThanOrEqual(7);
  });
});
