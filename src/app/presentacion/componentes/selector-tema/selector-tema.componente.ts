import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TemaEstado } from '../../../logica/estado/tema.estado';

@Component({
  selector: 'app-selector-tema',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-tema.componente.html',
  styleUrl: './selector-tema.componente.scss',
})
export class SelectorTemaComponente {
  readonly temaEstado = inject(TemaEstado);

  alternarTema(): void {
    this.temaEstado.alternarTema();
  }
}
