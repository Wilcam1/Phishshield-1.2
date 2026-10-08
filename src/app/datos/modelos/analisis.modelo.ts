export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

export interface InspeccionSsl {
  tieneSsl: boolean;
  esValido: boolean;
  emisor?: string;
  diasActivo?: number;
  esReciente?: boolean;
  esAutofirmado?: boolean;
  esConfiable?: boolean;
}

export interface InspeccionDom {
  fueAnalizado: boolean;
  titulo?: string;
  marcaEnTitulo?: boolean;
  tieneFormularioLogin?: boolean;
  tieneCampoClave?: boolean;
  tieneCampoTarjeta?: boolean;
  camposSensibles: string[];
}

export interface FactoresPuntuacion {
  base: number;
  suplantacionIdentidad: number;
  aprendizajeAutomaticoPonderado: number;
  sslSospechoso: number;
  credencialesDom: number;
  pisoSeguridadAplicado: boolean;
}

export interface PreguntaCuestionario {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number; // Índice 0 a 3
  explicacion?: string;
}

export interface AsistenteEducativo {
  fuente: string;
  resumenExplicativo: string;
  recomendacion: string;
  cuestionario?: PreguntaCuestionario;
}

export interface ConsejoSeguridad {
  palabraClave?: string;
  titulo: string;
  texto: string;
  tipo: 'seguro' | 'advertencia' | 'peligro';
}

export interface ResultadoAnalisis {
  url: string;
  riesgo: NivelRiesgo;
  puntuacion: number;
  probabilidadAprendizajeAutomatico: number | null;
  indicadores: string[];
  factoresPuntuacion?: FactoresPuntuacion;
  inspeccionSsl?: InspeccionSsl;
  inspeccionDom?: InspeccionDom;
  asistenteEducativo?: AsistenteEducativo;
  consejos: ConsejoSeguridad[];
  marcaTiempo: string;
}

export interface ElementoHistorialLocal {
  url: string;
  riesgo: NivelRiesgo;
  fecha: string;
}
