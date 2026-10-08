import {
  EstadisticasRespuestaDto,
  HistorialItemDto,
  ReporteItemDto,
} from '../dto/administracion.dto';
import {
  ElementoHistorialGlobal,
  ReporteComunitario,
} from '../modelos/administracion.modelo';
import { EstadisticasSoc } from '../modelos/estadisticas.modelo';
import { AnalisisMapeador } from './analisis.mapeador';

export class AdministracionMapeador {
  static mapearEstadisticas(dto: EstadisticasRespuestaDto): EstadisticasSoc {
    const alto = dto.distribucion_riesgo?.alto ?? dto.riesgo_alto ?? 0;
    const medio = dto.distribucion_riesgo?.medio ?? dto.riesgo_medio ?? 0;
    const bajo = dto.distribucion_riesgo?.bajo ?? dto.riesgo_bajo ?? 0;
    const total = dto.total_analisis ?? dto.total_analizados ?? (alto + medio + bajo);

    return {
      totalAnalizados: total,
      distribucionRiesgo: {
        alto,
        medio,
        bajo,
      },
      totalReportesComunidad: dto.reportes_comunidad ?? 0,
      fechaActualizacion: new Date().toISOString(),
    };
  }

  static mapearReporte(item: ReporteItemDto | string): ReporteComunitario {
    if (typeof item === 'string') {
      return {
        url: item,
        reportero: 'Comunidad',
        marcaTiempo: new Date().toISOString(),
      };
    }
    return {
      url: item.url || item.dominio || '',
      reportero: item.reportero || 'Comunidad',
      marcaTiempo: item.timestamp || new Date().toISOString(),
    };
  }

  static mapearHistorialGlobal(item: HistorialItemDto): ElementoHistorialGlobal {
    return {
      id: item.id,
      url: item.url,
      riesgo: AnalisisMapeador.normalizarRiesgo(item.riesgo),
      puntuacion: typeof item.puntuacion === 'number' ? item.puntuacion : 0,
      marcaTiempo: item.timestamp || new Date().toISOString(),
    };
  }
}
