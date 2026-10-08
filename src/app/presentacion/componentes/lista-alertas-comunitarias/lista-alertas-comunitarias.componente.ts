import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReporteComunitario } from '../../../datos/modelos/administracion.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';

@Component({
  selector: 'app-lista-alertas-comunitarias',
  standalone: true,
  imports: [CommonModule, FormatoFechaTuberia],
  templateUrl: './lista-alertas-comunitarias.componente.html',
  styleUrl: './lista-alertas-comunitarias.componente.scss',
})
export class ListaAlertasComunitariasComponente {
  @Input() reportes: ReporteComunitario[] = [];
  @Input() estaCargando = false;

  @Output() alDescartar = new EventEmitter<string>();
  @Output() alExportarJson = new EventEmitter<void>();

  descartar(url: string): void {
    if (confirm(`¿Descartar alerta comunitaria de "${url}"?`)) {
      this.alDescartar.emit(url);
    }
  }

  exportar(): void {
    this.alExportarJson.emit();
  }
}
