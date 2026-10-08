import { AnalisisMapeador } from './analisis.mapeador';
import { AnalisisRespuestaDto } from '../dto/analisis.dto';

describe('AnalisisMapeador', () => {
  it('debe normalizar los niveles de riesgo correctamente', () => {
    expect(AnalisisMapeador.normalizarRiesgo('ALTO')).toBe('alto');
    expect(AnalisisMapeador.normalizarRiesgo('danger')).toBe('alto');
    expect(AnalisisMapeador.normalizarRiesgo('medio')).toBe('medio');
    expect(AnalisisMapeador.normalizarRiesgo('warning')).toBe('medio');
    expect(AnalisisMapeador.normalizarRiesgo('bajo')).toBe('bajo');
    expect(AnalisisMapeador.normalizarRiesgo('safe')).toBe('bajo');
    expect(AnalisisMapeador.normalizarRiesgo('')).toBe('bajo');
  });

  it('debe transformar AnalisisRespuestaDto a modelo de dominio ResultadoAnalisis', () => {
    const dto: AnalisisRespuestaDto = {
      url: 'https://ejemplo-banco-falso.xyz/login',
      riesgo: 'alto',
      puntuacion: 8.5,
      probabilidad_ml: 0.95,
      indicadores: ['Typosquatting detectado', 'TLD sospechoso'],
      inspeccion_ssl: {
        valido: true,
        emisor: "Let's Encrypt",
        dias_antiguedad: 2,
        es_reciente: true,
      },
      inspeccion_dom: {
        analizado: true,
        titulo: 'Portal de Ingreso',
        tienePassword: true,
        campos_sensibles: ['password'],
      },
    };

    const resultado = AnalisisMapeador.dtoAResultadoDominio(dto);

    expect(resultado.url).toBe(dto.url);
    expect(resultado.riesgo).toBe('alto');
    expect(resultado.puntuacion).toBe(8.5);
    expect(resultado.probabilidadAprendizajeAutomatico).toBe(0.95);
    expect(resultado.indicadores.length).toBe(2);
    expect(resultado.inspeccionSsl?.esReciente).toBe(true);
    expect(resultado.inspeccionDom?.tieneCampoClave).toBe(true);
  });
});
