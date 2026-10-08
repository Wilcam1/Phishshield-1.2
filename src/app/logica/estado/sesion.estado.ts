import { computed, inject, Injectable, signal } from '@angular/core';
import { AlmacenamientoLocalFuente } from '../../datos/fuentes/almacenamiento-local.fuente';
import { CLAVE_ALMACENAMIENTO_TOKEN } from '../../nucleo/constantes/configuracion.constante';

@Injectable({
  providedIn: 'root',
})
export class SesionEstado {
  private readonly almacenamiento = inject(AlmacenamientoLocalFuente);

  private readonly tokenSenal = signal<string | null>(
    this.almacenamiento.obtenerTexto(CLAVE_ALMACENAMIENTO_TOKEN)
  );

  readonly token = this.tokenSenal.asReadonly();
  readonly estaAutenticado = computed(() => Boolean(this.tokenSenal()));

  establecerToken(token: string | null): void {
    if (token) {
      this.almacenamiento.guardarItem(CLAVE_ALMACENAMIENTO_TOKEN, token);
    } else {
      this.almacenamiento.eliminarItem(CLAVE_ALMACENAMIENTO_TOKEN);
    }
    this.tokenSenal.set(token);
  }

  cerrarSesion(): void {
    this.establecerToken(null);
  }
}
