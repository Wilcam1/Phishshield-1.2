import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { PreguntaCuestionario } from '../../../datos/modelos/analisis.modelo';

@Component({
  selector: 'app-cuestionario-interactivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuestionario-interactivo.componente.html',
  styleUrl: './cuestionario-interactivo.componente.scss',
})
export class CuestionarioInteractivoComponente implements OnChanges {
  @Input({ required: true }) pregunta!: PreguntaCuestionario;

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
