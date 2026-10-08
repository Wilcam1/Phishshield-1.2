import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SesionEstado } from '../estado/sesion.estado';

export function autenticacionInterceptor(
  peticion: HttpRequest<unknown>,
  siguiente: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const sesionEstado = inject(SesionEstado);
  const token = sesionEstado.token();

  if (token) {
    const peticionClonada = peticion.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return siguiente(peticionClonada);
  }

  return siguiente(peticion);
}
