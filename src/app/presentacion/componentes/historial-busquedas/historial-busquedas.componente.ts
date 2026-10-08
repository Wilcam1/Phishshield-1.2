import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElementoHistorialLocal } from '../../../datos/modelos/analisis.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';
import { RiesgoColorTuberia } from '../../tuberias/riesgo-color.tuberia';

@Component({
  selector: 'app-historial-busquedas',
  standalone: true,
  imports: [CommonModule, RiesgoColorTuberia, FormatoFechaTuberia],
  templateUrl: './historial-busquedas.componente.html',
  styleUrl: './historial-busquedas.componente.scss',
})
export class HistorialBusquedasComponente {
  @Input({ required: true }) historial: ElementoHistorialLocal[] = [];

  @Output() alSeleccionarUrl = new EventEmitter<string>();
  @Output() alLimpiar = new EventEmitter<void>();

  seleccionar(url: string): void {
    this.alSeleccionarUrl.emit(url);
  }

  limpiar(): void {
    if (confirm('¿Deseas vaciar tu historial de análisis recientes?')) {
      this.alLimpiar.emit();
    }
  }
}
