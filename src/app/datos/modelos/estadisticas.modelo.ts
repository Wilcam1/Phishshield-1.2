export interface DistribucionRiesgo {
  alto: number;
  medio: number;
  bajo: number;
}

export interface EstadisticasSoc {
  totalAnalizados: number;
  distribucionRiesgo: DistribucionRiesgo;
  totalReportesComunidad: number;
  fechaActualizacion: string;
}
