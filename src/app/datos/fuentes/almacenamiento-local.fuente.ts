import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AlmacenamientoLocalFuente {
  obtenerItem<T>(clave: string, valorPorDefecto: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return valorPorDefecto;
      }
      const valorSerializado = window.localStorage.getItem(clave);
      if (valorSerializado === null) {
        return valorPorDefecto;
      }
      return JSON.parse(valorSerializado) as T;
    } catch {
      return valorPorDefecto;
    }
  }

  obtenerTexto(clave: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return window.localStorage.getItem(clave);
    } catch {
      return null;
    }
  }

  guardarItem<T>(clave: string, valor: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const valorSerializado = typeof valor === 'string' ? valor : JSON.stringify(valor);
      window.localStorage.setItem(clave, valorSerializado);
      return true;
    } catch {
      return false;
    }
  }

  eliminarItem(clave: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.removeItem(clave);
      return true;
    } catch {
      return false;
    }
  }
}
