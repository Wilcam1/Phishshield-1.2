import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { AlmacenamientoLocalFuente } from '../../datos/fuentes/almacenamiento-local.fuente';
import { ElementoHistorialLocal, ResultadoAnalisis } from '../../datos/modelos/analisis.modelo';
import { AnalisisRepositorio } from '../../datos/repositorios/analisis.repositorio';
import {
  CLAVE_ALMACENAMIENTO_HISTORIAL,
  LIMITE_HISTORIAL_LOCAL,
} from '../../nucleo/constantes/configuracion.constante';
import { MotorConsejosServicio } from './motor-consejos.servicio';

@Injectable({
  providedIn: 'root',
})
export class AnalisisServicio {
  private readonly repositorio = inject(AnalisisRepositorio);
  private readonly motorConsejos = inject(MotorConsejosServicio);
  private readonly almacenamiento = inject(AlmacenamientoLocalFuente);

  private readonly resultadoActualSenal = signal<ResultadoAnalisis | null>(null);
  private readonly estaCargandoSenal = signal<boolean>(false);
  private readonly mensajeErrorSenal = signal<string | null>(null);
  private readonly urlActualSenal = signal<string>('');

  private readonly historialLocalSenal = signal<ElementoHistorialLocal[]>(
    this.almacenamiento.obtenerItem<ElementoHistorialLocal[]>(
      CLAVE_ALMACENAMIENTO_HISTORIAL,
      []
    )
  );

  readonly resultadoActual = this.resultadoActualSenal.asReadonly();
  readonly estaCargando = this.estaCargandoSenal.asReadonly();
  readonly mensajeError = this.mensajeErrorSenal.asReadonly();
  readonly urlActual = this.urlActualSenal.asReadonly();
  readonly historialLocal = this.historialLocalSenal.asReadonly();

  analizarUrl(url: string): Observable<ResultadoAnalisis | null> {
    const urlLimpia = url.trim();
    if (!urlLimpia) {
      this.mensajeErrorSenal.set('Por favor, ingresa una URL válida.');
      return of(null);
    }

    this.urlActualSenal.set(urlLimpia);
    this.estaCargandoSenal.set(true);
    this.mensajeErrorSenal.set(null);

    return this.repositorio.analizarUrl(urlLimpia).pipe(
      map((resultado) => {
        const consejos = this.motorConsejos.generarConsejos(resultado);
        return {
          ...resultado,
          consejos,
        };
      }),
      tap((resultadoConConsejos) => {
        this.resultadoActualSenal.set(resultadoConConsejos);
        this.guardarEnHistorialLocal(urlLimpia, resultadoConConsejos.riesgo);
      }),
      catchError((error: Error) => {
        const mensaje = error.message || 'No fue posible completar el análisis forense.';
        this.mensajeErrorSenal.set(mensaje);
        return of(null);
      }),
      finalize(() => {
        this.estaCargandoSenal.set(false);
      })
    );
  }

  reportarUrl(url: string): Observable<{ exito: boolean; mensaje: string }> {
    const urlLimpia = url.trim();
    if (!urlLimpia) {
      return of({
        exito: false,
        mensaje: 'Ingresa una URL antes de emitir un reporte.',
      });
    }

    return this.repositorio.reportarUrl(urlLimpia).pipe(
      catchError((error: Error) =>
        of({
          exito: false,
          mensaje: error.message || 'Error al reportar la URL.',
        })
      )
    );
  }

  limpiarResultado(): void {
    this.resultadoActualSenal.set(null);
    this.mensajeErrorSenal.set(null);
    this.urlActualSenal.set('');
  }

  limpiarHistorialLocal(): void {
    this.almacenamiento.eliminarItem(CLAVE_ALMACENAMIENTO_HISTORIAL);
    this.historialLocalSenal.set([]);
  }

  obtenerUrlCaptura(url: string): string {
    return this.repositorio.construirUrlCaptura(url);
  }

  private guardarEnHistorialLocal(url: string, riesgo: ResultadoAnalisis['riesgo']): void {
    const actual = this.historialLocalSenal();
    const filtrado = actual.filter((item) => item.url !== url);
    const nuevoElemento: ElementoHistorialLocal = {
      url,
      riesgo,
      fecha: new Date().toISOString(),
    };
    const actualizado = [nuevoElemento, ...filtrado].slice(0, LIMITE_HISTORIAL_LOCAL);

    this.historialLocalSenal.set(actualizado);
    this.almacenamiento.guardarItem(CLAVE_ALMACENAMIENTO_HISTORIAL, actualizado);
  }
}
