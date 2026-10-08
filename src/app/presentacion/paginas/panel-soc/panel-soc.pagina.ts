import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ElementoHistorialGlobal,
  ReporteComunitario,
  SolicitudCambioContrasena,
} from '../../../datos/modelos/administracion.modelo';
import { AdministracionServicio } from '../../../logica/servicios/administracion.servicio';
import { NotificacionServicio } from '../../../logica/servicios/notificacion.servicio';
import {
  DialogoCambioContrasenaComponente,
  DialogoUrlsCategoriaComponente,
  DrawerIncidenteComponente,
  FiltroCategoriaKpi,
  GraficoDistribucionRiesgoComponente,
  ListaAlertasComunitariasComponente,
  NotificacionFlotanteComponente,
  PanelMetricasComponente,
  SelectorTemaComponente,
  TablaHistorialGlobalComponente,
  TelemetriaServiciosComponente,
  VisorFlujoArquitecturaComponente,
} from '../../componentes';

export type PestanaSoc = 'general' | 'auditoria' | 'alertas' | 'telemetria' | 'arquitectura';

@Component({
  selector: 'app-panel-soc-pagina',
  standalone: true,
  imports: [
    CommonModule,
    PanelMetricasComponente,
    TablaHistorialGlobalComponente,
    GraficoDistribucionRiesgoComponente,
    ListaAlertasComunitariasComponente,
    DialogoCambioContrasenaComponente,
    DialogoUrlsCategoriaComponente,
    DrawerIncidenteComponente,
    TelemetriaServiciosComponente,
    VisorFlujoArquitecturaComponente,
    SelectorTemaComponente,
    NotificacionFlotanteComponente,
  ],
  templateUrl: './panel-soc.pagina.html',
  styleUrl: './panel-soc.pagina.scss',
})
export class PanelSocPaginaComponente implements OnInit {
  readonly servicioAdmin = inject(AdministracionServicio);
  readonly servicioNotif = inject(NotificacionServicio);
  private readonly enrutador = inject(Router);

  readonly pestanaActiva = signal<PestanaSoc>('general');
  readonly sidebarColapsado = signal(false);
  readonly incidenteSeleccionado = signal<ElementoHistorialGlobal | null>(null);

  modalSeguridadVisible = false;
  modalCategoriaVisible = false;
  tituloModalCategoria = '';
  filtroActualCategoria: FiltroCategoriaKpi = 'todas';

  readonly totalIncidentesCriticos = computed(() => {
    return this.servicioAdmin.historial().filter((h) =>
      h.riesgo.toLowerCase().includes('alt') || h.riesgo.toLowerCase().includes('crit')
    ).length;
  });

  readonly totalAlertasPendientes = computed(() => {
    return this.servicioAdmin.reportes().length;
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.servicioAdmin.cargarDatosCompletosPanel().subscribe({
      next: () => {
        this.servicioNotif.mostrar('Telemetría y datos SOC actualizados', 'exito');
      },
      error: () => {
        this.servicioNotif.mostrar('Error al sincronizar datos del servidor', 'error');
      },
    });
  }

  establecerPestana(pestana: PestanaSoc): void {
    this.pestanaActiva.set(pestana);
  }

  alternarSidebar(): void {
    this.sidebarColapsado.update((prev) => !prev);
  }

  abrirInspectorIncidente(incidente: ElementoHistorialGlobal): void {
    this.incidenteSeleccionado.set(incidente);
  }

  abrirInspectorDesdeReporte(reporte: ReporteComunitario): void {
    const itemAdaptado: ElementoHistorialGlobal = {
      url: reporte.url,
      riesgo: 'alto',
      puntuacion: 9.0,
      marcaTiempo: reporte.marcaTiempo,
    };
    this.incidenteSeleccionado.set(itemAdaptado);
  }

  cerrarInspector(): void {
    this.incidenteSeleccionado.set(null);
  }

  volverAlAnalizador(): void {
    this.enrutador.navigate(['/analizador']);
  }

  cerrarSesion(): void {
    this.servicioAdmin.cerrarSesion();
    this.servicioNotif.mostrar('Sesión cerrada correctamente', 'exito');
    this.enrutador.navigate(['/analizador']);
  }

  abrirModalSeguridad(): void {
    this.modalSeguridadVisible = true;
  }

  cambiarContrasena(solicitud: SolicitudCambioContrasena): void {
    this.servicioAdmin.cambiarContrasena(solicitud).subscribe({
      next: (res) => {
        if (res.exito) {
          this.modalSeguridadVisible = false;
          this.servicioNotif.mostrar('Contraseña actualizada con éxito', 'exito');
        } else {
          this.servicioNotif.mostrar(res.mensaje || 'Error al actualizar contraseña', 'error');
        }
      },
    });
  }

  descartarReporte(url: string): void {
    this.servicioAdmin.descartarReporte(url).subscribe({
      next: (exito) => {
        if (exito) {
          this.servicioNotif.mostrar('Alerta descartada del sistema', 'exito');
          if (this.incidenteSeleccionado()?.url === url) {
            this.cerrarInspector();
          }
        } else {
          this.servicioNotif.mostrar('No fue posible descartar la alerta', 'error');
        }
      },
    });
  }

  eliminarRegistro(url: string): void {
    this.servicioAdmin.eliminarRegistroHistorial(url).subscribe({
      next: (exito) => {
        if (exito) {
          this.servicioNotif.mostrar('Registro eliminado de la auditoría', 'exito');
          if (this.incidenteSeleccionado()?.url === url) {
            this.cerrarInspector();
          }
        } else {
          this.servicioNotif.mostrar('No fue posible eliminar el registro', 'error');
        }
      },
    });
  }

  exportarCsv(): void {
    const exito = this.servicioAdmin.exportarHistorialCsv();
    if (exito) {
      this.servicioNotif.mostrar('Historial exportado a CSV', 'exito');
    } else {
      this.servicioNotif.mostrar('No hay registros para exportar', 'advertencia');
    }
  }

  exportarJson(): void {
    const exito = this.servicioAdmin.exportarReportesJson();
    if (exito) {
      this.servicioNotif.mostrar('Reportes exportados a JSON', 'exito');
    } else {
      this.servicioNotif.mostrar('No hay alertas para exportar', 'advertencia');
    }
  }

  abrirModalCategoria(filtro: FiltroCategoriaKpi): void {
    this.filtroActualCategoria = filtro;
    const titulos: Record<FiltroCategoriaKpi, string> = {
      todas: '🔍 Todas las URLs Analizadas',
      alto: '🔴 URLs de Riesgo Alto',
      medio: '🟡 URLs de Riesgo Medio',
      bajo: '🟢 URLs de Riesgo Bajo',
      reportes: '📥 Reportes Comunitarios',
    };
    this.tituloModalCategoria = titulos[filtro] || 'URLs Analizadas';
    this.modalCategoriaVisible = true;
  }

  get itemsHistorialFiltrados() {
    const todos = this.servicioAdmin.historial();
    if (this.filtroActualCategoria === 'todas') return todos;
    return todos.filter((h) => h.riesgo === this.filtroActualCategoria);
  }
}
