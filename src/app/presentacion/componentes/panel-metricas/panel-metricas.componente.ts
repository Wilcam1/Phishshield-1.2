import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { EstadisticasSoc } from '../../../datos/modelos/estadisticas.modelo';
import { PreferenciasMovimientoServicio } from '../../../logica';
import { Inclinacion3dDirectiva } from '../../directivas/inclinacion-3d.directiva';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';
import { IconoComponente } from '../icono/icono.componente';

export type FiltroCategoriaKpi = 'todas' | 'alto' | 'medio' | 'bajo' | 'reportes';

@Component({
  selector: 'app-panel-metricas',
  standalone: true,
  imports: [CommonModule, Inclinacion3dDirectiva, LuzCursorDirectiva, IconoComponente],
  templateUrl: './panel-metricas.componente.html',
  styleUrl: './panel-metricas.componente.scss',
})
export class PanelMetricasComponente implements OnChanges {
  @Input() estadisticas: EstadisticasSoc | null = null;
  @Input() modoAdmin = false;

  @Output() alSeleccionarFiltro = new EventEmitter<FiltroCategoriaKpi>();
  @Output() alActualizar = new EventEmitter<void>();

  private readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);

  readonly totalAnalizadoAnimado = signal(0);
  readonly riesgoAltoAnimado = signal(0);
  readonly riesgoMedioAnimado = signal(0);
  readonly riesgoBajoAnimado = signal(0);
  readonly reportesAnimado = signal(0);

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['estadisticas']) {
      this.animarContadores();
    }
  }

  seleccionar(filtro: FiltroCategoriaKpi): void {
    this.alSeleccionarFiltro.emit(filtro);
  }

  actualizar(): void {
    this.alActualizar.emit();
  }

  private animarContadores(): void {
    const stats = this.estadisticas;
    const destinoTotal = stats?.totalAnalizados ?? 0;
    const destinoAlto = stats?.distribucionRiesgo?.alto ?? 0;
    const destinoMedio = stats?.distribucionRiesgo?.medio ?? 0;
    const destinoBajo = stats?.distribucionRiesgo?.bajo ?? 0;
    const destinoReportes = stats?.totalReportesComunidad ?? 0;

    if (this.preferenciasMovimiento.reduceMovimiento()) {
      this.totalAnalizadoAnimado.set(destinoTotal);
      this.riesgoAltoAnimado.set(destinoAlto);
      this.riesgoMedioAnimado.set(destinoMedio);
      this.riesgoBajoAnimado.set(destinoBajo);
      this.reportesAnimado.set(destinoReportes);
      return;
    }

    const duracion = 900; // ms
    const inicio = performance.now();

    const pasoAnimacion = (tiempoActual: number) => {
      const transcurrido = tiempoActual - inicio;
      const progreso = Math.min(transcurrido / duracion, 1);
      // Easing de salida cúbico
      const curva = 1 - Math.pow(1 - progreso, 3);

      this.totalAnalizadoAnimado.set(Math.round(destinoTotal * curva));
      this.riesgoAltoAnimado.set(Math.round(destinoAlto * curva));
      this.riesgoMedioAnimado.set(Math.round(destinoMedio * curva));
      this.riesgoBajoAnimado.set(Math.round(destinoBajo * curva));
      this.reportesAnimado.set(Math.round(destinoReportes * curva));

      if (progreso < 1) {
        requestAnimationFrame(pasoAnimacion);
      }
    };

    requestAnimationFrame(pasoAnimacion);
  }
}
