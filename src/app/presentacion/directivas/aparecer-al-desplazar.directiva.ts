import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { PreferenciasMovimientoServicio } from '../../logica';

@Directive({
  selector: '[appAparecerAlDesplazar]',
  standalone: true,
})
export class AparecerAlDesplazarDirectiva implements OnInit {
  @Input() retrasoMs = 0;
  @Input() distanciaPx = 20;

  private readonly elementoRef = inject(ElementRef<HTMLElement>);
  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);

  ngOnInit(): void {
    const el = this.elementoRef.nativeElement;

    if (this.preferenciasMovimiento.reduceMovimiento()) {
      el.style.opacity = '1';
      return;
    }

    el.style.opacity = '0';
    el.style.transform = `translateY(${this.distanciaPx}px)`;
    el.style.transition = `opacity 500ms var(--curva-desaceleracion) ${this.retrasoMs}ms, transform 500ms var(--resorte-critico) ${this.retrasoMs}ms`;

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observador.unobserve(el);
          }
        }
      },
      { threshold: 0.15 }
    );

    observador.observe(el);
  }
}
