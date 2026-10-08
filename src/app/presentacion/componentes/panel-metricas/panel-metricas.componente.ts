import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstadisticasSoc } from '../../../datos/modelos/estadisticas.modelo';

export type FiltroCategoriaKpi = 'todas' | 'alto' | 'medio' | 'bajo' | 'reportes';

@Component({
  selector: 'app-panel-metricas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-metricas.componente.html',
  styleUrl: './panel-metricas.componente.scss',
})
export class PanelMetricasComponente {
  @Input() estadisticas: EstadisticasSoc | null = null;
  @Input() modoAdmin = false;

  @Output() alSeleccionarFiltro = new EventEmitter<FiltroCategoriaKpi>();
  @Output() alActualizar = new EventEmitter<void>();

  seleccionar(filtro: FiltroCategoriaKpi): void {
    this.alSeleccionarFiltro.emit(filtro);
  }

  actualizar(): void {
    this.alActualizar.emit();
  }
}
