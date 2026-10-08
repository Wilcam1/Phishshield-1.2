import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENTORNO } from '../../nucleo/entornos/entorno';
import {
  CambioContrasenaPeticionDto,
  HistorialItemDto,
  InicioSesionPeticionDto,
  InicioSesionRespuestaDto,
  ReporteItemDto,
} from '../dto/administracion.dto';
import { AdministracionMapeador } from '../mapeadores/administracion.mapeador';
import {
  CredencialesAdministrador,
  ElementoHistorialGlobal,
  ReporteComunitario,
  RespuestaAutenticacion,
  SolicitudCambioContrasena,
} from '../modelos/administracion.modelo';

@Injectable({
  providedIn: 'root',
})
export class AdministracionRepositorio {
  private readonly clienteHttp = inject(HttpClient);
  private readonly urlBase = ENTORNO.urlBaseApi;

  iniciarSesion(credenciales: CredencialesAdministrador): Observable<RespuestaAutenticacion> {
    const cuerpo: InicioSesionPeticionDto = {
      username: credenciales.usuario,
      password: credenciales.contrasena,
      usuario: credenciales.usuario,
      contrasena: credenciales.contrasena,
    };

    return this.clienteHttp
      .post<InicioSesionRespuestaDto>(`${this.urlBase}/api/login`, cuerpo)
      .pipe(
        map((dto) => {
          const exito = dto.success ?? dto.exito ?? false;
          return {
            exito,
            token: dto.token,
            mensajeError: dto.error || dto.mensaje,
          };
        })
      );
  }

  obtenerReportes(): Observable<ReporteComunitario[]> {
    return this.clienteHttp
      .get<(ReporteItemDto | string)[]>(`${this.urlBase}/api/admin/export/reportes`)
      .pipe(
        map((items) =>
          Array.isArray(items)
            ? items.map((item) => AdministracionMapeador.mapearReporte(item))
            : []
        )
      );
  }

  obtenerHistorialCompleto(): Observable<ElementoHistorialGlobal[]> {
    return this.clienteHttp
      .get<HistorialItemDto[]>(`${this.urlBase}/api/admin/export/historial`)
      .pipe(
        map((items) =>
          Array.isArray(items)
            ? items.map((item) => AdministracionMapeador.mapearHistorialGlobal(item))
            : []
        )
      );
  }

  eliminarReporte(dominioOUrl: string): Observable<{ exito: boolean }> {
    return this.clienteHttp
      .delete<{ success?: boolean; exito?: boolean }>(`${this.urlBase}/api/admin/reportar`, {
        body: { dominio: dominioOUrl, url: dominioOUrl },
      })
      .pipe(
        map((res) => ({
          exito: res.success ?? res.exito ?? true,
        }))
      );
  }

  eliminarRegistroHistorial(url: string): Observable<{ exito: boolean }> {
    return this.clienteHttp
      .delete<{ success?: boolean; exito?: boolean }>(`${this.urlBase}/api/admin/historial`, {
        body: { url },
      })
      .pipe(
        map((res) => ({
          exito: res.success ?? res.exito ?? true,
        }))
      );
  }

  cambiarContrasena(
    solicitud: SolicitudCambioContrasena
  ): Observable<{ exito: boolean; mensaje?: string }> {
    const cuerpo: CambioContrasenaPeticionDto = {
      oldPassword: solicitud.contrasenaActual,
      contrasenaAnterior: solicitud.contrasenaActual,
      newPassword: solicitud.nuevaContrasena,
      contrasenaNueva: solicitud.nuevaContrasena,
    };

    return this.clienteHttp
      .post<{ success?: boolean; exito?: boolean; error?: string; mensaje?: string }>(
        `${this.urlBase}/api/admin/change-password`,
        cuerpo
      )
      .pipe(
        map((res) => ({
          exito: res.success ?? res.exito ?? false,
          mensaje: res.error || res.mensaje,
        }))
      );
  }
}
