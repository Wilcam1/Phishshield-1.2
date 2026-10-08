import {
  AnalisisRespuestaDto,
  AsistenteIaDto,
  FactoresPuntuacionDto,
  InspeccionDomDto,
  InspeccionSslDto,
  QuizDto,
} from '../dto/analisis.dto';
import {
  AsistenteEducativo,
  FactoresPuntuacion,
  InspeccionDom,
  InspeccionSsl,
  NivelRiesgo,
  PreguntaCuestionario,
  ResultadoAnalisis,
} from '../modelos/analisis.modelo';

export class AnalisisMapeador {
  static normalizarRiesgo(riesgo?: string): NivelRiesgo {
    const normalizado = (riesgo || '').toLowerCase().trim();
    if (normalizado === 'alto' || normalizado === 'danger' || normalizado === 'peligro') {
      return 'alto';
    }
    if (normalizado === 'medio' || normalizado === 'warning' || normalizado === 'advertencia') {
      return 'medio';
    }
    return 'bajo';
  }

  static mapearInspeccionSsl(dto?: InspeccionSslDto): InspeccionSsl | undefined {
    if (!dto) return undefined;
    return {
      tieneSsl: dto.tieneSsl ?? dto.valido ?? false,
      esValido: dto.valido ?? dto.autorizado ?? true,
      emisor: dto.emisor,
      diasActivo: dto.diasActivo ?? dto.dias_antiguedad,
      esReciente: dto.esReciente ?? dto.es_reciente ?? false,
      esAutofirmado: dto.esAutofirmado ?? false,
      esConfiable: dto.autorizado ?? true,
    };
  }

  static mapearInspeccionDom(dto?: InspeccionDomDto): InspeccionDom | undefined {
    if (!dto) return undefined;
    return {
      fueAnalizado: dto.analizado ?? true,
      titulo: dto.titulo,
      marcaEnTitulo: dto.marcaEnTitulo ?? false,
      tieneFormularioLogin: dto.tiene_formulario_login ?? dto.tienePassword ?? false,
      tieneCampoClave: dto.tienePassword ?? false,
      tieneCampoTarjeta: dto.tieneTarjeta ?? false,
      camposSensibles: dto.campos_sensibles || [],
    };
  }

  static mapearFactoresPuntuacion(dto?: FactoresPuntuacionDto): FactoresPuntuacion | undefined {
    if (!dto) return undefined;
    return {
      base: dto.base ?? 0,
      suplantacionIdentidad: dto.typosquatting ?? 0,
      aprendizajeAutomaticoPonderado: dto.ml_ponderado ?? 0,
      sslSospechoso: dto.ssl_sospechoso ?? 0,
      credencialesDom: dto.dom_credenciales ?? 0,
      pisoSeguridadAplicado: dto.score_floor_aplicado ?? false,
    };
  }

  static mapearCuestionario(quiz?: QuizDto): PreguntaCuestionario | undefined {
    if (!quiz || !quiz.pregunta) return undefined;
    return {
      pregunta: quiz.pregunta,
      opciones: quiz.opciones || [],
      respuestaCorrecta: quiz.respuesta_correcta ?? 0,
      explicacion: quiz.explicacion,
    };
  }

  static mapearAsistenteEducativo(dto?: AsistenteIaDto): AsistenteEducativo | undefined {
    if (!dto) return undefined;

    const quizRaw = dto.quiz_interactivo || (dto.cuestionario && dto.cuestionario.length > 0 ? dto.cuestionario[0] : undefined);

    return {
      fuente: dto.fuente || 'PhishShield AI Engine',
      resumenExplicativo: dto.resumen_ia || dto.explicacion || '',
      recomendacion: dto.recomendacion_ia || dto.recomendacion || 'Proceda con precaución.',
      cuestionario: AnalisisMapeador.mapearCuestionario(quizRaw),
    };
  }

  static dtoAResultadoDominio(dto: AnalisisRespuestaDto): ResultadoAnalisis {
    return {
      url: dto.url,
      riesgo: AnalisisMapeador.normalizarRiesgo(dto.riesgo),
      puntuacion: typeof dto.puntuacion === 'number' ? dto.puntuacion : 0,
      probabilidadAprendizajeAutomatico:
        typeof dto.probabilidad_ml === 'number' ? dto.probabilidad_ml : null,
      indicadores: Array.isArray(dto.indicadores) ? dto.indicadores : [],
      factoresPuntuacion: AnalisisMapeador.mapearFactoresPuntuacion(dto.factores_puntuacion),
      inspeccionSsl: AnalisisMapeador.mapearInspeccionSsl(dto.inspeccion_ssl),
      inspeccionDom: AnalisisMapeador.mapearInspeccionDom(dto.inspeccion_dom),
      asistenteEducativo: AnalisisMapeador.mapearAsistenteEducativo(dto.asistente_ia),
      consejos: [], // Se computan o enriquecen en la capa lógica
      marcaTiempo: dto.timestamp || new Date().toISOString(),
    };
  }
}
