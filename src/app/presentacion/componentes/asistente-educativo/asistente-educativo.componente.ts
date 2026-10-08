import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AsistenteEducativo } from '../../../datos/modelos/analisis.modelo';

@Component({
  selector: 'app-asistente-educativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistente-educativo.componente.html',
  styleUrl: './asistente-educativo.componente.scss',
})
export class AsistenteEducativoComponente {
  @Input({ required: true }) asistente!: AsistenteEducativo;
}
