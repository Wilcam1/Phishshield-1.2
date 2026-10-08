import { Pipe, PipeTransform } from '@angular/core';
import { NivelRiesgo } from '../../datos/modelos/analisis.modelo';

@Pipe({
  name: 'riesgoColor',
  standalone: true,
})
export class RiesgoColorTuberia implements PipeTransform {
  transform(riesgo?: NivelRiesgo | string | null): string {
    const normalizado = (riesgo || '').toLowerCase();
    switch (normalizado) {
      case 'bajo':
      case 'safe':
      case 'seguro':
        return 'seguro';
      case 'medio':
      case 'warning':
      case 'advertencia':
        return 'advertencia';
      case 'alto':
      case 'danger':
      case 'peligro':
        return 'peligro';
      default:
        return 'advertencia';
    }
  }
}
