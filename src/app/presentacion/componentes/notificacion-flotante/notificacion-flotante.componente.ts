import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificacionServicio } from '../../../logica/servicios/notificacion.servicio';

@Component({
  selector: 'app-notificacion-flotante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-flotante.componente.html',
  styleUrl: './notificacion-flotante.componente.scss',
})
export class NotificacionFlotanteComponente {
  readonly servicio = inject(NotificacionServicio);
}
