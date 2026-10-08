import { RiesgoColorTuberia } from './riesgo-color.tuberia';

describe('RiesgoColorTuberia', () => {
  const tuberia = new RiesgoColorTuberia();

  it('debe transformar los diferentes niveles de riesgo en clases semánticas', () => {
    expect(tuberia.transform('bajo')).toBe('seguro');
    expect(tuberia.transform('safe')).toBe('seguro');
    expect(tuberia.transform('medio')).toBe('advertencia');
    expect(tuberia.transform('warning')).toBe('advertencia');
    expect(tuberia.transform('alto')).toBe('peligro');
    expect(tuberia.transform('danger')).toBe('peligro');
  });
});
