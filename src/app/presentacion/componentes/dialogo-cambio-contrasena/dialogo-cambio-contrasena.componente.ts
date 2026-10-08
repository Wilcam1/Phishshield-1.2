import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SolicitudCambioContrasena } from '../../../datos/modelos/administracion.modelo';
import {
  evaluarSeguridadContrasena,
  EvaluacionContrasena,
} from '../../../logica/validadores/contrasena.validador';

@Component({
  selector: 'app-dialogo-cambio-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialogo-cambio-contrasena.componente.html',
  styleUrl: './dialogo-cambio-contrasena.componente.scss',
})
export class DialogoCambioContrasenaComponente {
  @Input() visible = false;
  @Input() estaCargando = false;
  @Input() mensajeError: string | null = null;

  @Output() alCambiarContrasena = new EventEmitter<SolicitudCambioContrasena>();
  @Output() alCerrar = new EventEmitter<void>();

  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';

  get evaluacion(): EvaluacionContrasena {
    return evaluarSeguridadContrasena(this.nuevaContrasena);
  }

  get coincidenContrasenas(): boolean {
    return (
      Boolean(this.nuevaContrasena) &&
      this.nuevaContrasena === this.confirmarContrasena
    );
  }

  get formularioEsValido(): boolean {
    return (
      Boolean(this.contrasenaActual) &&
      this.evaluacion.esCompletamenteValida &&
      this.coincidenContrasenas &&
      !this.estaCargando
    );
  }

  cerrar(): void {
    this.contrasenaActual = '';
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
    this.alCerrar.emit();
  }

  alHacerClicFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrar();
    }
  }

  enviar(): void {
    if (!this.formularioEsValido) return;

    this.alCambiarContrasena.emit({
      contrasenaActual: this.contrasenaActual,
      nuevaContrasena: this.nuevaContrasena,
    });
  }
}
