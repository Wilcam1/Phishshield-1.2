export interface Entorno {
  produccion: boolean;
  urlBaseApi: string;
  nombreAplicacion: string;
  version: string;
}

export const ENTORNO: Entorno = {
  produccion: false,
  urlBaseApi: 'http://localhost:3001',
  nombreAplicacion: 'PhishShield — Verificador de URLs y Panel SOC',
  version: '2.0.0',
};
