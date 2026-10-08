import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-visor-captura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-captura.componente.html',
  styleUrl: './visor-captura.componente.scss',
})
export class VisorCapturaComponente implements OnChanges {
  @Input({ required: true }) urlCaptura = '';
  @Input() urlDestino = '';

  estaCargando = true;
  tieneError = false;

  ngOnChanges(): void {
    if (this.urlCaptura) {
      this.estaCargando = true;
      this.tieneError = false;
    }
  }

  alCargarImagen(): void {
    this.estaCargando = false;
    this.tieneError = false;
  }

  alFallarImagen(): void {
    this.estaCargando = false;
    this.tieneError = true;
  }
}
