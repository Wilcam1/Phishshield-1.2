import { Injectable, signal } from '@angular/core';

export interface DatosNotificacion {
  mensaje: string;
  tipo: 'exito' | 'error' | 'advertencia';
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionServicio {
  private readonly notificacionSenal = signal<DatosNotificacion | null>(null);
  readonly notificacion = this.notificacionSenal.asReadonly();

  private contador = 0;
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  mostrar(mensaje: string, tipo: 'exito' | 'error' | 'advertencia' = 'exito', duracionMs = 4000): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }

    const id = ++this.contador;
    this.notificacionSenal.set({ mensaje, tipo, id });

    this.temporizador = setTimeout(() => {
      if (this.notificacionSenal()?.id === id) {
        this.notificacionSenal.set(null);
      }
    }, duracionMs);
  }

  cerrar(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
    this.notificacionSenal.set(null);
  }
}
