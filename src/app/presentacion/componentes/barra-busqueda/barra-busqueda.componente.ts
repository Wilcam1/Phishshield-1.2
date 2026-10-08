import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtajoTecladoDirectiva } from '../../directivas/atajo-teclado.directiva';

@Component({
  selector: 'app-barra-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule, AtajoTecladoDirectiva],
  templateUrl: './barra-busqueda.componente.html',
  styleUrl: './barra-busqueda.componente.scss',
})
export class BarraBusquedaComponente implements OnChanges {
  @Input() estaCargando = false;
  @Input() valorInicial = '';

  @Output() alAnalizar = new EventEmitter<string>();
  @Output() alReportar = new EventEmitter<string>();

  url = '';

  ngOnChanges(): void {
    if (this.valorInicial) {
      this.url = this.valorInicial;
    }
  }

  establecerUrl(nuevaUrl: string): void {
    this.url = nuevaUrl;
  }

  limpiar(): void {
    this.url = '';
  }

  emitirAnalisis(): void {
    const urlLimpia = this.url.trim();
    if (urlLimpia && !this.estaCargando) {
      this.alAnalizar.emit(urlLimpia);
    }
  }

  emitirReporte(): void {
    const urlLimpia = this.url.trim();
    if (urlLimpia) {
      this.alReportar.emit(urlLimpia);
    }
  }

  alPresionarEnter(evento: KeyboardEvent): void {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      this.emitirAnalisis();
    }
  }
}
