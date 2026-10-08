import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: '[appAtajoTeclado]',
  standalone: true,
})
export class AtajoTecladoDirectiva {
  private readonly elemento = inject(ElementRef<HTMLElement>);

  @Input('appAtajoTeclado') tecla = 'k';
  @Input() requiereControl = true;

  @HostListener('window:keydown', ['$event'])
  alPresionarTecla(evento: KeyboardEvent): void {
    const teclaCoincide = evento.key.toLowerCase() === this.tecla.toLowerCase();
    const modificadorActivo = this.requiereControl
      ? evento.ctrlKey || evento.metaKey
      : true;

    if (teclaCoincide && modificadorActivo) {
      evento.preventDefault();
      this.elemento.nativeElement.focus();
    }
  }
}
