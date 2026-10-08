import { NivelRiesgo } from './analisis.modelo';

export interface CredencialesAdministrador {
  usuario: string;
  contrasena: string;
}

export interface RespuestaAutenticacion {
  exito: boolean;
  token?: string;
  mensajeError?: string;
}

export interface ReporteComunitario {
  url: string;
  reportero: string;
  marcaTiempo: string;
}

export interface ElementoHistorialGlobal {
  id?: string;
  url: string;
  riesgo: NivelRiesgo;
  puntuacion: number;
  marcaTiempo: string;
}

export interface SolicitudCambioContrasena {
  contrasenaActual: string;
  nuevaContrasena: string;
}
