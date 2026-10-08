import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElementoHistorialGlobal } from '../../../datos/modelos/administracion.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';
import { RiesgoColorTuberia } from '../../tuberias/riesgo-color.tuberia';

@Component({
  selector: 'app-tabla-historial-global',
  standalone: true,
  imports: [CommonModule, RiesgoColorTuberia, FormatoFechaTuberia],
  templateUrl: './tabla-historial-global.componente.html',
  styleUrl: './tabla-historial-global.componente.scss',
})
export class TablaHistorialGlobalComponente {
  @Input() historial: ElementoHistorialGlobal[] = [];
  @Input() estaCargando = false;

  @Output() alEliminar = new EventEmitter<string>();
  @Output() alExportarCsv = new EventEmitter<void>();

  eliminar(url: string): void {
    if (confirm(`¿Confirmas eliminar el registro forense de "${url}"?`)) {
      this.alEliminar.emit(url);
    }
  }

  exportar(): void {
    this.alExportarCsv.emit();
  }
}
