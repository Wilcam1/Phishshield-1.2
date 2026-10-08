import { evaluarSeguridadContrasena } from './contrasena.validador';

describe('evaluarSeguridadContrasena', () => {
  it('debe rechazar contraseñas cortas o sin requisitos completos', () => {
    const evaluacion = evaluarSeguridadContrasena('abc');
    expect(evaluacion.longitudValida).toBe(false);
    expect(evaluacion.esCompletamenteValida).toBe(false);
  });

  it('debe validar contraseñas que cumplan los cuatro criterios de seguridad', () => {
    const evaluacion = evaluarSeguridadContrasena('Segura12@');
    expect(evaluacion.longitudValida).toBe(true);
    expect(evaluacion.tieneMayuscula).toBe(true);
    expect(evaluacion.tieneNumero).toBe(true);
    expect(evaluacion.tieneEspecial).toBe(true);
    expect(evaluacion.esCompletamenteValida).toBe(true);
  });
});
