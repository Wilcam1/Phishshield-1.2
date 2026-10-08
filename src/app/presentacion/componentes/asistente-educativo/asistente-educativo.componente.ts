import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AsistenteEducativo } from '../../../datos/modelos/analisis.modelo';

import { MarkdownSeguroTuberia } from '../../tuberias/markdown-seguro.tuberia';

@Component({
  selector: 'app-asistente-educativo',
  standalone: true,
  imports: [CommonModule, MarkdownSeguroTuberia],
  templateUrl: './asistente-educativo.componente.html',
  styleUrl: './asistente-educativo.componente.scss',
})
export class AsistenteEducativoComponente {
  @Input({ required: true }) asistente!: AsistenteEducativo;
}
