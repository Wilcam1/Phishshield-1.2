import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElementoHistorialGlobal } from '../../../datos/modelos/administracion.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';
import { RiesgoColorTuberia } from '../../tuberias/riesgo-color.tuberia';
import { IconoComponente } from '../icono/icono.componente';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';

@Component({
  selector: 'app-drawer-incidente',
  standalone: true,
  imports: [CommonModule, RiesgoColorTuberia, FormatoFechaTuberia, IconoComponente, LuzCursorDirectiva],
  templateUrl: './drawer-incidente.componente.html',
  styleUrl: './drawer-incidente.componente.scss',
})

export class DrawerIncidenteComponente {
  @Input() elemento: ElementoHistorialGlobal | null = null;
  @Input() set incidente(valor: ElementoHistorialGlobal | null) {
    this.elemento = valor;
  }
  @Input() visible = false;
  @Input() urlCaptura = '';

  @Output() alCerrar = new EventEmitter<void>();
  @Output() alEliminar = new EventEmitter<string>();

  estaCopiado = false;

  cerrar(): void {
    this.alCerrar.emit();
  }

  eliminar(): void {
    if (this.elemento && confirm(`¿Deseas dar de baja el incidente "${this.elemento.url}"?`)) {
      this.alEliminar.emit(this.elemento.url);
      this.cerrar();
    }
  }

  copiarUrl(): void {
    if (!this.elemento) return;
    navigator.clipboard?.writeText(this.elemento.url).then(() => {
      this.estaCopiado = true;
      setTimeout(() => (this.estaCopiado = false), 2000);
    });
  }

  alHacerClicFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrar();
    }
  }
}
