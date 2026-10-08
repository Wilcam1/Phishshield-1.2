import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, signal, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-visor-captura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-captura.componente.html',
  styleUrl: './visor-captura.componente.scss',
})
export class VisorCapturaComponente implements OnChanges, OnDestroy {
  @Input({ required: true }) urlCaptura = '';
  @Input() urlDestino = '';

  private static readonly cacheUrlsCargadas = new Set<string>();

  readonly estaCargando = signal(true);
  readonly tieneError = signal(false);
  readonly segundosEsperando = signal(0);
  readonly urlCapturaEfectiva = signal('');

  private temporizadorSegundos: ReturnType<typeof setInterval> | null = null;

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['urlCaptura'] && this.urlCaptura) {
      if (VisorCapturaComponente.cacheUrlsCargadas.has(this.urlCaptura)) {
        this.urlCapturaEfectiva.set(this.urlCaptura);
        this.estaCargando.set(false);
        this.tieneError.set(false);
        this.detenerTemporizador();
      } else {
        this.urlCapturaEfectiva.set(this.urlCaptura);
        this.estaCargando.set(true);
        this.tieneError.set(false);
        this.iniciarTemporizador();
      }
    }
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  alCargarImagen(): void {
    this.estaCargando.set(false);
    this.tieneError.set(false);
    this.detenerTemporizador();
    if (this.urlCaptura) {
      VisorCapturaComponente.cacheUrlsCargadas.add(this.urlCaptura);
    }
  }

  alFallarImagen(): void {
    this.estaCargando.set(false);
    this.tieneError.set(true);
    this.detenerTemporizador();
  }

  reintentar(): void {
    if (!this.urlCaptura) return;
    this.estaCargando.set(true);
    this.tieneError.set(false);
    const separador = this.urlCaptura.includes('?') ? '&' : '?';
    const nuevaUrl = `${this.urlCaptura}${separador}_t=${Date.now()}`;
    this.urlCapturaEfectiva.set(nuevaUrl);
    this.iniciarTemporizador();
  }

  private iniciarTemporizador(): void {
    this.detenerTemporizador();
    this.segundosEsperando.set(0);
    this.temporizadorSegundos = setInterval(() => {
      this.segundosEsperando.update((s) => s + 1);
    }, 1000);
  }

  private detenerTemporizador(): void {
    if (this.temporizadorSegundos) {
      clearInterval(this.temporizadorSegundos);
      this.temporizadorSegundos = null;
    }
  }
}
