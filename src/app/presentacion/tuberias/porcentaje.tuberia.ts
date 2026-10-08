import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'porcentaje',
  standalone: true,
})
export class PorcentajeTuberia implements PipeTransform {
  transform(valor?: number | null, decimales = 1): string {
    if (valor === null || valor === undefined) return 'N/A';
    const numero = Number(valor);
    if (isNaN(numero)) return 'N/A';
    const porcentaje = numero <= 1 ? numero * 100 : numero;
    return `${porcentaje.toFixed(decimales)}%`;
  }
}
