import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { PreferenciasMovimientoServicio } from '../../logica';

@Directive({
  selector: '[appLuzCursor]',
  standalone: true,
})
export class LuzCursorDirectiva {
  @Input() colorLuz?: string;

  private readonly elementoRef = inject(ElementRef<HTMLElement>);
  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);


  @HostListener('mousemove', ['$event'])
  alMoverCursor(evento: MouseEvent): void {
    if (this.preferenciasMovimiento.reduceMovimiento()) return;

    const rect = this.elementoRef.nativeElement.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    this.elementoRef.nativeElement.style.setProperty('--x', `${x}px`);
    this.elementoRef.nativeElement.style.setProperty('--y', `${y}px`);
    if (this.colorLuz) {
      this.elementoRef.nativeElement.style.setProperty('--color-spotlight', this.colorLuz);
    }
  }

  @HostListener('mouseenter')
  alEntrarCursor(): void {
    if (this.preferenciasMovimiento.reduceMovimiento()) return;
    this.elementoRef.nativeElement.style.setProperty('--opacidad-luz', '1');
    if (this.colorLuz) {
      this.elementoRef.nativeElement.style.setProperty('--color-spotlight', this.colorLuz);
    }
  }


  @HostListener('mouseleave')
  alSalirCursor(): void {
    this.elementoRef.nativeElement.style.setProperty('--opacidad-luz', '0');
  }
}
