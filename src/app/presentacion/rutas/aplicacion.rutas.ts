import { Routes } from '@angular/router';
import { autenticacionGuardia } from '../../logica/guardias/autenticacion.guardia';

export const RUTAS_APLICACION: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'analizador',
  },
  {
    path: 'analizador',
    loadComponent: () =>
      import('../paginas/analizador/analizador.pagina').then(
        (m) => m.AnalizadorPaginaComponente
      ),
    title: 'PhishShield — Verificador de URLs',
  },
  {
    path: 'panel-soc',
    loadComponent: () =>
      import('../paginas/panel-soc/panel-soc.pagina').then(
        (m) => m.PanelSocPaginaComponente
      ),
    canActivate: [autenticacionGuardia],
    title: 'PhishShield — Centro de Operaciones SOC',
  },
  {
    path: 'arquitectura',
    loadComponent: () =>
      import('../paginas/arquitectura/arquitectura.pagina').then(
        (m) => m.ArquitecturaPaginaComponente
      ),
    title: 'PhishShield — Trazador de Flujo y Arquitectura de Capas',
  },
  {
    path: '**',
    redirectTo: 'analizador',
  },
];
