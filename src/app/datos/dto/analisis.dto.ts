export interface InspeccionSslDto {
  tieneSsl?: boolean;
  valido?: boolean;
  emisor?: string;
  dias_antiguedad?: number;
  diasActivo?: number;
  es_reciente?: boolean;
  esReciente?: boolean;
  esAutofirmado?: boolean;
  autorizado?: boolean;
}

export interface InspeccionDomDto {
  analizado?: boolean;
  titulo?: string;
  marcaEnTitulo?: boolean;
  tiene_formulario_login?: boolean;
  tienePassword?: boolean;
  tieneTarjeta?: boolean;
  campos_sensibles?: string[];
}

export interface FactoresPuntuacionDto {
  base?: number;
  typosquatting?: number;
  ml_ponderado?: number;
  ssl_sospechoso?: number;
  dom_credenciales?: number;
  score_floor_aplicado?: boolean;
}

export interface QuizDto {
  pregunta?: string;
  opciones?: string[];
  respuesta_correcta?: number;
  explicacion?: string;
}

export interface AsistenteIaDto {
  fuente?: string;
  explicacion?: string;
  resumen_ia?: string;
  recomendacion?: string;
  recomendacion_ia?: string;
  cuestionario?: QuizDto[];
  quiz_interactivo?: QuizDto;
}

export interface AnalisisRespuestaDto {
  url: string;
  riesgo: string;
  puntuacion: number;
  probabilidad_ml?: number | null;
  indicadores: string[];
  factores_puntuacion?: FactoresPuntuacionDto;
  inspeccion_ssl?: InspeccionSslDto;
  inspeccion_dom?: InspeccionDomDto;
  asistente_ia?: AsistenteIaDto;
  timestamp?: string;
  error?: string;
}

export interface SolicitudAnalisisDto {
  url: string;
}

export interface RespuestaReporteDto {
  success?: boolean;
  exito?: boolean;
  mensaje?: string;
}
