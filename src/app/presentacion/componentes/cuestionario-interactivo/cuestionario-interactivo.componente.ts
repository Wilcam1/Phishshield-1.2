import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges } from '@angular/core';
import { PreguntaCuestionario } from '../../../datos/modelos/analisis.modelo';
import { PreferenciasMovimientoServicio } from '../../../logica/servicios/preferencias-movimiento.servicio';
import { IconoComponente } from '../icono/icono.componente';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';

@Component({
  selector: 'app-cuestionario-interactivo',
  standalone: true,
  imports: [CommonModule, IconoComponente, LuzCursorDirectiva],
  templateUrl: './cuestionario-interactivo.componente.html',
  styleUrl: './cuestionario-interactivo.componente.scss',
})
export class CuestionarioInteractivoComponente implements OnChanges {
  @Input({ required: true }) pregunta!: PreguntaCuestionario;

  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);

  indiceSeleccionado: number | null = null;
  haRespondido = false;

  ngOnChanges(): void {
    this.indiceSeleccionado = null;
    this.haRespondido = false;
  }

  seleccionarOpcion(indice: number): void {
    if (this.haRespondido) return;
    this.indiceSeleccionado = indice;
    this.haRespondido = true;

    if (indice === this.pregunta.respuestaCorrecta && !this.preferenciasMovimiento.reduceMovimiento()) {
      this.lanzarConfetiCelebracion();
    }
  }

  private async lanzarConfetiCelebracion(): Promise<void> {
    try {
      const moduloConfetti = await import('canvas-confetti');
      const confetti = moduloConfetti.default;
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#34d399', '#818cf8', '#fcd34d'],
        disableForReducedMotion: true,
      });
    } catch {
      // Ignorar fallo suave si canvas-confetti no puede instanciarse
    }
  }

  esCorrecto(indice: number): boolean {
    return this.haRespondido && indice === this.pregunta.respuestaCorrecta;
  }

  esIncorrecto(indice: number): boolean {
    return (
      this.haRespondido &&
      this.indiceSeleccionado === indice &&
      indice !== this.pregunta.respuestaCorrecta
    );
  }

  obtenerLetraOpcion(indice: number): string {
    return String.fromCharCode(65 + indice);
  }
}

