import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { NivelRiesgo } from '../../../datos/modelos/analisis.modelo';
import { PreferenciasMovimientoServicio } from '../../../logica';

@Component({
  selector: 'app-medidor-riesgo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medidor-riesgo.componente.html',
  styleUrl: './medidor-riesgo.componente.scss',
})

export class MedidorRiesgoComponente implements OnChanges {
  @Input({ required: true }) puntuacion = 0;
  @Input({ required: true }) riesgo: NivelRiesgo = 'bajo';

  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);

  readonly puntuacionAnimada = signal(0);
  readonly porcentajeLlenado = signal(0);

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['puntuacion']) {
      this.animarMedidor();
    }
  }

  private animarMedidor(): void {
    const destino = Math.min(Math.max(this.puntuacion, 0), 10);

    if (this.preferenciasMovimiento.reduceMovimiento()) {
      this.puntuacionAnimada.set(destino);
      this.porcentajeLlenado.set(destino * 10);
      return;
    }

    const duracion = 900;
    const inicio = performance.now();

    const paso = (ahora: number) => {
      const transcurrido = ahora - inicio;
      const progreso = Math.min(transcurrido / duracion, 1);
      const curva = 1 - Math.pow(1 - progreso, 3);

      const valorActual = destino * curva;
      this.puntuacionAnimada.set(Number(valorActual.toFixed(1)));
      this.porcentajeLlenado.set(Math.round(valorActual * 10));

      if (progreso < 1) {
        requestAnimationFrame(paso);
      }
    };

    requestAnimationFrame(paso);
  }
}
