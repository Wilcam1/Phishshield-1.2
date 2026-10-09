import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import {
  CredencialesAdministrador,
  ElementoHistorialGlobal,
  ReporteComunitario,
  RespuestaAutenticacion,
  SolicitudCambioContrasena,
} from '../../datos/modelos/administracion.modelo';
import { EstadisticasSoc } from '../../datos/modelos/estadisticas.modelo';
import { AdministracionRepositorio } from '../../datos/repositorios/administracion.repositorio';
import { AnalisisRepositorio } from '../../datos/repositorios/analisis.repositorio';
import { SesionEstado } from '../estado/sesion.estado';

@Injectable({
  providedIn: 'root',
})
export class AdministracionServicio {
  private readonly repositorioAdmin = inject(AdministracionRepositorio);
  private readonly repositorioAnalisis = inject(AnalisisRepositorio);
  private readonly sesionEstado = inject(SesionEstado);

  private readonly estadisticasSenal = signal<EstadisticasSoc | null>(null);
  private readonly reportesSenal = signal<ReporteComunitario[]>([]);
  private readonly historialSenal = signal<ElementoHistorialGlobal[]>([]);
  private readonly estaCargandoSenal = signal<boolean>(false);
  private readonly mensajeErrorSenal = signal<string | null>(null);

  readonly estadisticas = this.estadisticasSenal.asReadonly();
  readonly reportes = this.reportesSenal.asReadonly();
  readonly historial = this.historialSenal.asReadonly();
  readonly estaCargando = this.estaCargandoSenal.asReadonly();
  readonly mensajeError = this.mensajeErrorSenal.asReadonly();

  iniciarSesion(credenciales: CredencialesAdministrador): Observable<RespuestaAutenticacion> {
    this.estaCargandoSenal.set(true);
    this.mensajeErrorSenal.set(null);

    return this.repositorioAdmin.iniciarSesion(credenciales).pipe(
      tap((respuesta) => {
        if (respuesta.exito && respuesta.token) {
          this.sesionEstado.establecerToken(respuesta.token);
        } else {
          this.mensajeErrorSenal.set(respuesta.mensajeError || 'Credenciales incorrectas');
        }
      }),
      catchError((error: Error) => {
        const errorMsg = error.message || 'Error en autenticación';
        this.mensajeErrorSenal.set(errorMsg);
        return of({ exito: false, mensajeError: errorMsg });
      }),
      finalize(() => {
        this.estaCargandoSenal.set(false);
      })
    );
  }

  cerrarSesion(): void {
    this.sesionEstado.cerrarSesion();
  }

  cargarEstadisticasPublicas(): Observable<EstadisticasSoc | null> {
    return this.repositorioAnalisis.obtenerEstadisticas().pipe(
      tap((est) => this.estadisticasSenal.set(est)),
      catchError(() => of(null))
    );
  }

  cargarHistorialPublico(limite = 500): Observable<ElementoHistorialGlobal[]> {
    this.estaCargandoSenal.set(true);
    return this.repositorioAnalisis.obtenerHistorial(limite).pipe(
      tap((historial) => {
        this.historialSenal.set(historial);
        this.estaCargandoSenal.set(false);
      }),
      catchError(() => {
        this.estaCargandoSenal.set(false);
        return of([]);
      })
    );
  }

  cargarReportesPublicos(): Observable<ReporteComunitario[]> {
    return this.repositorioAnalisis.obtenerReportesPublicos().pipe(
      tap((reportes) => this.reportesSenal.set(reportes)),
      catchError(() => of([]))
    );
  }

  cargarDatosCompletosPanel(): Observable<boolean> {
    this.estaCargandoSenal.set(true);
    this.mensajeErrorSenal.set(null);

    return this.repositorioAdmin.obtenerReportes().pipe(
      tap((reportes) => this.reportesSenal.set(reportes)),
      catchError(() => of([])),
      tap(() => {
        this.repositorioAdmin.obtenerHistorialCompleto().subscribe({
          next: (historial) => {
            this.historialSenal.set(historial);
            // Si las estadísticas aún no están o se deben sincronizar con el historial
            const alto = historial.filter((h) => h.riesgo === 'alto').length;
            const medio = historial.filter((h) => h.riesgo === 'medio').length;
            const bajo = historial.filter((h) => h.riesgo === 'bajo').length;
            const total = historial.length;
            this.estadisticasSenal.set({
              totalAnalizados: total,
              distribucionRiesgo: { alto, medio, bajo },
              totalReportesComunidad: this.reportesSenal().length,
              fechaActualizacion: new Date().toISOString(),
            });
            this.estaCargandoSenal.set(false);
          },
          error: (err) => {
            this.mensajeErrorSenal.set(err.message || 'Error al obtener historial');
            this.estaCargandoSenal.set(false);
          },
        });
      }),
      map(() => true)
    );
  }

  descartarReporte(dominioOUrl: string): Observable<boolean> {
    return this.repositorioAdmin.eliminarReporte(dominioOUrl).pipe(
      tap((res) => {
        if (res.exito) {
          this.reportesSenal.update((lista) => lista.filter((r) => r.url !== dominioOUrl));
        }
      }),
      map((res) => res.exito),
      catchError(() => of(false))
    );
  }

  eliminarRegistroHistorial(url: string): Observable<boolean> {
    return this.repositorioAdmin.eliminarRegistroHistorial(url).pipe(
      tap((res) => {
        if (res.exito) {
          this.historialSenal.update((lista) => lista.filter((h) => h.url !== url));
        }
      }),
      map((res) => res.exito),
      catchError(() => of(false))
    );
  }

  cambiarContrasena(solicitud: SolicitudCambioContrasena): Observable<{ exito: boolean; mensaje?: string }> {
    return this.repositorioAdmin.cambiarContrasena(solicitud);
  }

  exportarReportesJson(): boolean {
    const reportes = this.reportesSenal();
    if (reportes.length === 0) return false;

    const contenido = JSON.stringify(reportes, null, 2);
    this.descargarArchivo(contenido, 'reportes_phishing.json', 'application/json');
    return true;
  }

  exportarHistorialCsv(): boolean {
    const historial = this.historialSenal();
    if (historial.length === 0) return false;

    const encabezados = 'Fecha,URL,Puntuacion,Riesgo\n';
    const filas = historial
      .map((item) => {
        const urlEscapada = `"${item.url.replace(/"/g, '""')}"`;
        return `${item.marcaTiempo},${urlEscapada},${item.puntuacion},${item.riesgo}`;
      })
      .join('\n');

    this.descargarArchivo(`\uFEFF${encabezados}${filas}`, 'historial_analisis_soc.csv', 'text/csv');
    return true;
  }

  private descargarArchivo(contenido: string, nombreArchivo: string, tipoMime: string): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([contenido], { type: `${tipoMime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const ancla = document.createElement('a');
    ancla.href = url;
    ancla.download = nombreArchivo;
    document.body.appendChild(ancla);
    ancla.click();
    ancla.remove();
    URL.revokeObjectURL(url);
  }
}
