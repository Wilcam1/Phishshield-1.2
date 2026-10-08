import { MotorConsejosServicio } from './motor-consejos.servicio';

describe('MotorConsejosServicio', () => {
  let servicio: MotorConsejosServicio;

  beforeEach(() => {
    servicio = new MotorConsejosServicio();
  });

  it('debe generar consejos coincidentes según los indicadores forenses', () => {
    const consejos = servicio.generarConsejos({
      riesgo: 'alto',
      indicadores: ['Typosquatting detectado', 'Protocolo HTTP inseguro'],
    });

    expect(consejos.length).toBeGreaterThanOrEqual(2);
    const titulos = consejos.map((c) => c.titulo);
    expect(titulos).toContain('👀 Suplantación de Identidad');
    expect(titulos).toContain('🔒 Falta de Cifrado');
  });

  it('debe proporcionar un consejo genérico si no hay indicadores específicos', () => {
    const consejosBajo = servicio.generarConsejos({
      riesgo: 'bajo',
      indicadores: [],
    });

    expect(consejosBajo.length).toBe(1);
    expect(consejosBajo[0].tipo).toBe('seguro');
  });
});
