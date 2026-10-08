import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredencialesAdministrador } from '../../../datos/modelos/administracion.modelo';
import { AdministracionServicio } from '../../../logica/servicios/administracion.servicio';
import { AnalisisServicio } from '../../../logica/servicios/analisis.servicio';
import { NotificacionServicio } from '../../../logica/servicios/notificacion.servicio';
import { SesionEstado } from '../../../logica/estado/sesion.estado';
import {
  AsistenteEducativoComponente,
  BarraBusquedaComponente,
  CuestionarioInteractivoComponente,
  DesgloseTecnicoComponente,
  DialogoAutenticacionAdminComponente,
  DialogoUrlsCategoriaComponente,
  FiltroCategoriaKpi,
  HistorialBusquedasComponente,
  ListaConsejosComponente,
  NotificacionFlotanteComponente,
  PanelMetricasComponente,
  SelectorTemaComponente,
  TarjetaVeredictoComponente,
  VisorCapturaComponente,
  ZonaPruebasComponente,
} from '../../componentes';

@Component({
  selector: 'app-analizador-pagina',
  standalone: true,
  imports: [
    CommonModule,
    BarraBusquedaComponente,
    TarjetaVeredictoComponente,
    VisorCapturaComponente,
    AsistenteEducativoComponente,
    CuestionarioInteractivoComponente,
    DesgloseTecnicoComponente,
    ListaConsejosComponente,
    ZonaPruebasComponente,
    HistorialBusquedasComponente,
    PanelMetricasComponente,
    DialogoAutenticacionAdminComponente,
    DialogoUrlsCategoriaComponente,
    SelectorTemaComponente,
    NotificacionFlotanteComponente,
  ],
  templateUrl: './analizador.pagina.html',
  styleUrl: './analizador.pagina.scss',
})
export class AnalizadorPaginaComponente implements OnInit {
  readonly servicioAnalisis = inject(AnalisisServicio);
  readonly servicioAdmin = inject(AdministracionServicio);
  readonly servicioNotif = inject(NotificacionServicio);
  readonly sesionEstado = inject(SesionEstado);
  private readonly enrutador = inject(Router);

  mostrarAvisoEducativo = true;
  modalLoginVisible = false;
  modalCategoriaVisible = false;
  tituloModalCategoria = '';
  filtroActualCategoria: FiltroCategoriaKpi = 'todas';
  urlParaBarra = '';

  ngOnInit(): void {
    this.servicioAdmin.cargarEstadisticasPublicas().subscribe();
  }

  cerrarAvisoEducativo(): void {
    this.mostrarAvisoEducativo = false;
  }

  analizarUrl(url: string): void {
    this.urlParaBarra = url;
    this.servicioAnalisis.analizarUrl(url).subscribe({
      next: (resultado) => {
        if (resultado) {
          this.servicioNotif.mostrar('Análisis forense completado con éxito', 'exito');
        } else if (this.servicioAnalisis.mensajeError()) {
          this.servicioNotif.mostrar(this.servicioAnalisis.mensajeError()!, 'error');
        }
      },
    });
  }

  reportarUrl(url: string): void {
    this.servicioAnalisis.reportarUrl(url).subscribe({
      next: (res) => {
        this.servicioNotif.mostrar(res.mensaje, res.exito ? 'exito' : 'error');
      },
    });
  }

  cargarUrlDemo(url: string): void {
    this.urlParaBarra = url;
    this.analizarUrl(url);
  }

  abrirPanelAdmin(): void {
    if (this.sesionEstado.estaAutenticado()) {
      this.enrutador.navigate(['/panel-soc']);
    } else {
      this.modalLoginVisible = true;
    }
  }

  iniciarSesionAdmin(credenciales: CredencialesAdministrador): void {
    this.servicioAdmin.iniciarSesion(credenciales).subscribe({
      next: (res) => {
        if (res.exito) {
          this.modalLoginVisible = false;
          this.servicioNotif.mostrar('Sesión autorizada. Accediendo al SOC...', 'exito');
          this.enrutador.navigate(['/panel-soc']);
        } else {
          this.servicioNotif.mostrar(res.mensajeError || 'Credenciales inválidas', 'error');
        }
      },
    });
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

    // Cargar historial para alimentar el modal
    this.servicioAdmin.cargarDatosCompletosPanel().subscribe();
  }

  get itemsHistorialFiltrados() {
    const todos = this.servicioAdmin.historial();
    if (this.filtroActualCategoria === 'todas') return todos;
    return todos.filter((h) => h.riesgo === this.filtroActualCategoria);
  }
}
