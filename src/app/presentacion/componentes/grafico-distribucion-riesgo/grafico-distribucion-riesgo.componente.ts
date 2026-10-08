import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DistribucionRiesgo } from '../../../datos/modelos/estadisticas.modelo';

@Component({
  selector: 'app-grafico-distribucion-riesgo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-distribucion-riesgo.componente.html',
  styleUrl: './grafico-distribucion-riesgo.componente.scss',
})
export class GraficoDistribucionRiesgoComponente {
  @Input() distribucion: DistribucionRiesgo = { alto: 0, medio: 0, bajo: 0 };

  get total(): number {
    return (
      (this.distribucion.bajo || 0) +
      (this.distribucion.medio || 0) +
      (this.distribucion.alto || 0)
    );
  }

  get porcentajeBajo(): number {
    if (this.total === 0) return 0;
    return Math.round(((this.distribucion.bajo || 0) / this.total) * 100);
  }

  get porcentajeMedio(): number {
    if (this.total === 0) return 0;
    return Math.round(((this.distribucion.medio || 0) / this.total) * 100);
  }

  get porcentajeAlto(): number {
    if (this.total === 0) return 0;
    return Math.round(((this.distribucion.alto || 0) / this.total) * 100);
  }

  get estiloGradiente(): string {
    if (this.total === 0) {
      return 'conic-gradient(var(--color-fondo-entrada) 0deg 360deg)';
    }

    const gradosBajo = (this.distribucion.bajo / this.total) * 360;
    const gradosMedio = gradosBajo + (this.distribucion.medio / this.total) * 360;

    return `conic-gradient(
      var(--color-seguro) 0deg ${gradosBajo}deg,
      var(--color-advertencia) ${gradosBajo}deg ${gradosMedio}deg,
      var(--color-peligro) ${gradosMedio}deg 360deg
    )`;
  }
}
