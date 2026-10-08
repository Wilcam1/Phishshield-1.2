import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CredencialesAdministrador } from '../../../datos/modelos/administracion.modelo';

@Component({
  selector: 'app-dialogo-autenticacion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialogo-autenticacion-admin.componente.html',
  styleUrl: './dialogo-autenticacion-admin.componente.scss',
})
export class DialogoAutenticacionAdminComponente {
  @Input() visible = false;
  @Input() estaCargando = false;
  @Input() mensajeError: string | null = null;

  @Output() alIniciarSesion = new EventEmitter<CredencialesAdministrador>();
  @Output() alCerrar = new EventEmitter<void>();

  usuario = '';
  contrasena = '';

  cerrar(): void {
    this.usuario = '';
    this.contrasena = '';
    this.alCerrar.emit();
  }

  alHacerClicFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrar();
    }
  }

  enviar(): void {
    if (!this.usuario.trim() || !this.contrasena.trim() || this.estaCargando) {
      return;
    }
    this.alIniciarSesion.emit({
      usuario: this.usuario.trim(),
      contrasena: this.contrasena.trim(),
    });
  }
}
