import { effect, inject, Injectable, signal } from '@angular/core';
import { AlmacenamientoLocalFuente } from '../../datos/fuentes/almacenamiento-local.fuente';
import { CLAVE_ALMACENAMIENTO_TEMA } from '../../nucleo/constantes/configuracion.constante';

export type ModoTema = 'claro' | 'oscuro';

@Injectable({
  providedIn: 'root',
})
export class TemaEstado {
  private readonly almacenamiento = inject(AlmacenamientoLocalFuente);

  private readonly temaInicial: ModoTema = (() => {
    const guardado = this.almacenamiento.obtenerTexto(CLAVE_ALMACENAMIENTO_TEMA);
    if (guardado === 'oscuro' || guardado === 'claro') {
      return guardado;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'oscuro';
    }
    return 'claro';
  })();

  private readonly temaSenal = signal<ModoTema>(this.temaInicial);

  readonly tema = this.temaSenal.asReadonly();

  constructor() {
    effect(() => {
      const temaActual = this.temaSenal();
      this.almacenamiento.guardarItem(CLAVE_ALMACENAMIENTO_TEMA, temaActual);
      if (typeof document !== 'undefined') {
        const cuerpo = document.body;
        if (temaActual === 'oscuro') {
          cuerpo.classList.add('modo-oscuro');
          cuerpo.classList.remove('modo-claro');
        } else {
          cuerpo.classList.add('modo-claro');
          cuerpo.classList.remove('modo-oscuro');
        }
      }
    });
  }

  alternarTema(): void {
    this.temaSenal.update((actual) => (actual === 'oscuro' ? 'claro' : 'oscuro'));
  }

  establecerTema(nuevoTema: ModoTema): void {
    this.temaSenal.set(nuevoTema);
  }
}
