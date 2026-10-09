import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENTORNO } from '../../nucleo/entornos/entorno';
import {
  AnalisisRespuestaDto,
  RespuestaReporteDto,
  SolicitudAnalisisDto,
} from '../dto/analisis.dto';
import {
  EstadisticasRespuestaDto,
  HistorialItemDto,
} from '../dto/administracion.dto';
import { AdministracionMapeador } from '../mapeadores/administracion.mapeador';
import { AnalisisMapeador } from '../mapeadores/analisis.mapeador';
import { ElementoHistorialGlobal } from '../modelos/administracion.modelo';
import { ResultadoAnalisis } from '../modelos/analisis.modelo';
import { EstadisticasSoc } from '../modelos/estadisticas.modelo';

@Injectable({
  providedIn: 'root',
})
export class AnalisisRepositorio {
  private readonly clienteHttp = inject(HttpClient);
  private readonly urlBase = ENTORNO.urlBaseApi;

  analizarUrl(url: string): Observable<ResultadoAnalisis> {
    const cuerpo: SolicitudAnalisisDto = { url };
    return this.clienteHttp
      .post<AnalisisRespuestaDto>(`${this.urlBase}/analizar`, cuerpo)
      .pipe(
        map((dto) => {
          if (dto.error) {
            throw new Error(dto.error);
          }
          return AnalisisMapeador.dtoAResultadoDominio(dto);
        })
      );
  }

  reportarUrl(url: string): Observable<{ exito: boolean; mensaje: string }> {
    return this.clienteHttp
      .post<RespuestaReporteDto>(`${this.urlBase}/reportar`, { url })
      .pipe(
        map((dto) => ({
          exito: dto.success ?? dto.exito ?? true,
          mensaje: dto.mensaje || 'URL reportada correctamente a la comunidad',
        }))
      );
  }

  obtenerEstadisticas(): Observable<EstadisticasSoc> {
    return this.clienteHttp
      .get<EstadisticasRespuestaDto>(`${this.urlBase}/estadisticas`)
      .pipe(map((dto) => AdministracionMapeador.mapearEstadisticas(dto)));
  }

  obtenerHistorial(limite = 500): Observable<ElementoHistorialGlobal[]> {
    return this.clienteHttp
      .get<HistorialItemDto[]>(`${this.urlBase}/historial?limite=${limite}`)
      .pipe(
        map((items) =>
          Array.isArray(items)
            ? items.map((item) => AdministracionMapeador.mapearHistorialGlobal(item))
            : []
        )
      );
  }

  obtenerReportesPublicos(): Observable<ReporteComunitario[]> {
    return this.clienteHttp
      .get<(ReporteItemDto | string)[]>(`${this.urlBase}/reportes`)
      .pipe(
        map((items) =>
          Array.isArray(items)
            ? items.map((item) => AdministracionMapeador.mapearReporte(item))
            : []
        )
      );
  }

  construirUrlCaptura(url: string): string {
    return `${this.urlBase}/api/screenshot?url=${encodeURIComponent(url)}`;
  }
}
