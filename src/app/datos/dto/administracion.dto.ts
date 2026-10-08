export interface InicioSesionPeticionDto {
  username?: string;
  usuario?: string;
  password?: string;
  contrasena?: string;
}

export interface InicioSesionRespuestaDto {
  success?: boolean;
  exito?: boolean;
  token?: string;
  error?: string;
  mensaje?: string;
}

export interface ReporteItemDto {
  url?: string;
  dominio?: string;
  reportero?: string;
  timestamp?: string;
}

export interface HistorialItemDto {
  id?: string;
  url: string;
  riesgo: string;
  puntuacion: number;
  timestamp?: string;
}

export interface EstadisticasRespuestaDto {
  total_analizados?: number;
  total_analisis?: number;
  riesgo_alto?: number;
  riesgo_medio?: number;
  riesgo_bajo?: number;
  reportes_comunidad?: number;
  distribucion_riesgo?: {
    alto?: number;
    medio?: number;
    bajo?: number;
  };
}

export interface CambioContrasenaPeticionDto {
  oldPassword?: string;
  contrasenaAnterior?: string;
  newPassword?: string;
  contrasenaNueva?: string;
}
