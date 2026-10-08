import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { PreferenciasMovimientoServicio } from '../../logica';

@Directive({
  selector: '[appInclinacion3d]',
  standalone: true,
})
export class Inclinacion3dDirectiva {
  @Input() anguloMaximo = 7; // Grados máximos (6° a 8° por especificación)

  private readonly elementoRef = inject(ElementRef<HTMLElement>);
  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);

  private rafId: number | null = null;

  @HostListener('mousemove', ['$event'])
  alMoverCursor(evento: MouseEvent): void {
    if (this.preferenciasMovimiento.debeDesactivarEfectos3D()) return;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      const el = this.elementoRef.nativeElement;
      const rect = el.getBoundingClientRect();
      const centroX = rect.left + rect.width / 2;
      const centroY = rect.top + rect.height / 2;

      const offsetX = (evento.clientX - centroX) / (rect.width / 2);
      const offsetY = (evento.clientY - centroY) / (rect.height / 2);

      const rotacionY = offsetX * this.anguloMaximo;
      const rotacionX = -offsetY * this.anguloMaximo;

      el.style.transform = `perspective(1000px) rotateX(${rotacionX.toFixed(2)}deg) rotateY(${rotacionY.toFixed(2)}deg) translateZ(4px)`;
      el.style.transition = 'transform 100ms var(--resorte-critico)';
    });
  }

  @HostListener('mouseleave')
  alSalirCursor(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    const el = this.elementoRef.nativeElement;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    el.style.transition = 'transform 450ms var(--resorte-critico)';
  }
}
