import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { PreferenciasMovimientoServicio } from '../../logica';

@Directive({
  selector: '[appMagnetico]',
  standalone: true,
})
export class MagneticoDirectiva {
  @Input() desplazamientoMaximo = 6; // Máximo 6 px según especificación

  private readonly elementoRef = inject(ElementRef<HTMLElement>);
  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);

  @HostListener('mousemove', ['$event'])
  alMoverCursor(evento: MouseEvent): void {
    if (this.preferenciasMovimiento.reduceMovimiento()) return;

    const el = this.elementoRef.nativeElement;
    const rect = el.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    const deltaX = (evento.clientX - centroX) / (rect.width / 2);
    const deltaY = (evento.clientY - centroY) / (rect.height / 2);

    const moverX = deltaX * this.desplazamientoMaximo;
    const moverY = deltaY * this.desplazamientoMaximo;

    el.style.transform = `translate3d(${moverX.toFixed(1)}px, ${moverY.toFixed(1)}px, 0)`;
    el.style.transition = 'transform 120ms ease-out';
  }

  @HostListener('mouseleave')
  alSalirCursor(): void {
    const el = this.elementoRef.nativeElement;
    el.style.transform = 'translate3d(0, 0, 0)';
    el.style.transition = 'transform 350ms var(--resorte-critico)';
  }
}
