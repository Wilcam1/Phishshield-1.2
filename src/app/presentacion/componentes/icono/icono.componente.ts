import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type NombreIcono =
  | 'escudo'
  | 'escudo-alerta'
  | 'escudo-exito'
  | 'lupa'
  | 'copiar'
  | 'copiado'
  | 'alerta'
  | 'peligro'
  | 'candado'
  | 'candado-abierto'
  | 'servidor'
  | 'cpu'
  | 'red'
  | 'terminal'
  | 'reloj'
  | 'ojo'
  | 'papelera'
  | 'descargar'
  | 'refrescar'
  | 'enlace'
  | 'cerrar'
  | 'chevron-abajo'
  | 'chevron-arriba'
  | 'bombilla'
  | 'ia-robot'
  | 'verificado';

@Component({
  selector: 'app-icono',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icono.componente.html',
  styleUrl: './icono.componente.scss',
})
export class IconoComponente {
  @Input({ required: true }) nombre!: NombreIcono;
  @Input() tamano = 20; // Tamaño en píxeles
  @Input() trazo = 1.75; // Grosor de línea consistente
  @Input() color = 'currentColor';
}
