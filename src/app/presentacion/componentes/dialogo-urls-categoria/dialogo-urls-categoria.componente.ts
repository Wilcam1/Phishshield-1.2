import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElementoHistorialGlobal, ReporteComunitario } from '../../../datos/modelos/administracion.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';
import { RiesgoColorTuberia } from '../../tuberias/riesgo-color.tuberia';
import { IconoComponente } from '../icono/icono.componente';

@Component({
  selector: 'app-dialogo-urls-categoria',
  standalone: true,
  imports: [CommonModule, RiesgoColorTuberia, FormatoFechaTuberia, IconoComponente],
  templateUrl: './dialogo-urls-categoria.componente.html',
  styleUrl: './dialogo-urls-categoria.componente.scss',
})

export class DialogoUrlsCategoriaComponente {
  @Input() visible = false;
  @Input() titulo = 'URLs Analizadas';
  @Input() elementosHistorial: ElementoHistorialGlobal[] = [];
  @Input() reportes: ReporteComunitario[] = [];
  @Input() esModoReportes = false;

  @Output() alCerrar = new EventEmitter<void>();

  cerrar(): void {
    this.alCerrar.emit();
  }

  alHacerClicFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrar();
    }
  }
}
