import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-indicador-estado-motor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicador-estado-motor.componente.html',
  styleUrl: './indicador-estado-motor.componente.scss',
})
export class IndicadorEstadoMotorComponente {
  @Input() enLinea = true;
  @Input() version = '2.0.0';
}
