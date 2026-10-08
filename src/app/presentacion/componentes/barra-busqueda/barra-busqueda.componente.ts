import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtajoTecladoDirectiva } from '../../directivas/atajo-teclado.directiva';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';
import { MagneticoDirectiva } from '../../directivas/magnetico.directiva';
import { IconoComponente } from '../icono/icono.componente';

@Component({
  selector: 'app-barra-busqueda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AtajoTecladoDirectiva,
    LuzCursorDirectiva,
    MagneticoDirectiva,
    IconoComponente,
  ],
  templateUrl: './barra-busqueda.componente.html',
  styleUrl: './barra-busqueda.componente.scss',
})
export class BarraBusquedaComponente implements OnChanges {
  @Input() estaCargando = false;
  @Input() valorInicial = '';

  @Output() alAnalizar = new EventEmitter<string>();
  @Output() alReportar = new EventEmitter<string>();

  url = '';
  readonly fuePegado = signal(false);
  readonly atajoActivo = signal(false);

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

  alPegar(): void {
    this.fuePegado.set(true);
    setTimeout(() => this.fuePegado.set(false), 600);
  }

  get esFormatoValido(): boolean {
    if (!this.url.trim()) return false;
    const limpia = this.url.trim().toLowerCase();
    return limpia.includes('.') && (limpia.startsWith('http://') || limpia.startsWith('https://') || !limpia.includes(' '));
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
