import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PreferenciasMovimientoServicio {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  readonly reduceMovimiento = signal<boolean>(false);
  readonly soportaWebGl = signal<boolean>(true);
  readonly esDispositivoMovil = signal<boolean>(false);

  constructor() {
    if (this.esNavegador) {
      this.inicializarEscuchadores();
      this.evaluarCapacidadesHardware();
    }
  }

  private inicializarEscuchadores(): void {
    const consultaMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduceMovimiento.set(consultaMedia.matches);

    consultaMedia.addEventListener('change', (e) => {
      this.reduceMovimiento.set(e.matches);
    });

    const consultaTactil = window.matchMedia('(pointer: coarse)');
    this.esDispositivoMovil.set(consultaTactil.matches || window.innerWidth < 768);
  }

  private evaluarCapacidadesHardware(): void {
    try {
      const lienzo = document.createElement('canvas');
      const contexto = lienzo.getContext('webgl') || lienzo.getContext('experimental-webgl');
      this.soportaWebGl.set(!!contexto);
    } catch {
      this.soportaWebGl.set(false);
    }
  }

  debeDesactivarEfectos3D(): boolean {
    return this.reduceMovimiento() || !this.soportaWebGl();
  }
}
