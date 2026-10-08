import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ConsejoSeguridad } from '../../../datos/modelos/analisis.modelo';

@Component({
  selector: 'app-lista-consejos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-consejos.componente.html',
  styleUrl: './lista-consejos.componente.scss',
})
export class ListaConsejosComponente {
  @Input({ required: true }) consejos: ConsejoSeguridad[] = [];
}
