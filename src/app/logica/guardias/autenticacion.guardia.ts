import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionEstado } from '../estado/sesion.estado';

export const autenticacionGuardia: CanActivateFn = () => {
  const sesionEstado = inject(SesionEstado);
  const enrutador = inject(Router);

  if (sesionEstado.estaAutenticado()) {
    return true;
  }

  enrutador.navigate(['/analizador']);
  return false;
};
