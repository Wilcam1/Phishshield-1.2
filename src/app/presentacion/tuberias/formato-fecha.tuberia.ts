import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true,
})
export class FormatoFechaTuberia implements PipeTransform {
  transform(
    fechaIso?: string | null,
    modo: 'completa' | 'corta' | 'hora' = 'completa'
  ): string {
    if (!fechaIso) return 'Reciente';
    try {
      const fecha = new Date(fechaIso);
      if (isNaN(fecha.getTime())) return fechaIso;

      if (modo === 'hora') {
        return fecha.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }

      if (modo === 'corta') {
        return fecha.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        });
      }

      return fecha.toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return fechaIso;
    }
  }
}
