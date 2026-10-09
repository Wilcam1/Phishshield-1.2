import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredencialesAdministrador } from '../../../datos/modelos/administracion.modelo';
import { AdministracionServicio } from '../../../logica/servicios/administracion.servicio';
import { AnalisisServicio } from '../../../logica/servicios/analisis.servicio';
import { NotificacionServicio } from '../../../logica/servicios/notificacion.servicio';
import { SesionEstado } from '../../../logica/estado/sesion.estado';
import { PreferenciasMovimientoServicio } from '../../../logica/servicios/preferencias-movimiento.servicio';
import {
  AsistenteEducativoComponente,
  BarraBusquedaComponente,
  CapasEscaneoComponente,
  CuestionarioInteractivoComponente,
  DesgloseTecnicoComponente,
  DialogoAutenticacionAdminComponente,
  DialogoUrlsCategoriaComponente,
  Escudo3dComponente,
  EstadoEscudo3D,
  FiltroCategoriaKpi,
  HistorialBusquedasComponente,
  IconoComponente,
  IndicadorEstadoMotorComponente,
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
    CapasEscaneoComponente,
    Escudo3dComponente,
    IconoComponente,
    TarjetaVeredictoComponente,
    VisorCapturaComponente,
    AsistenteEducativoComponente,
    CuestionarioInteractivoComponente,
    DesgloseTecnicoComponente,
    ListaConsejosComponente,
    ZonaPruebasComponente,
    HistorialBusquedasComponente,
    PanelMetricasComponente,
    IndicadorEstadoMotorComponente,
    DialogoAutenticacionAdminComponente,
    DialogoUrlsCategoriaComponente,
    SelectorTemaComponente,
    NotificacionFlotanteComponente,
  ],
  templateUrl: './analizador.pagina.html',
  styleUrl: './analizador.pagina.scss',
})
export class AnalizadorPaginaComponente implements OnInit, OnDestroy {
  readonly servicioAnalisis = inject(AnalisisServicio);
  readonly servicioAdmin = inject(AdministracionServicio);
  readonly servicioNotif = inject(NotificacionServicio);
  readonly sesionEstado = inject(SesionEstado);
  readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);
  private readonly enrutador = inject(Router);

  mostrarAvisoEducativo = true;
  modalLoginVisible = false;
  modalCategoriaVisible = false;
  tituloModalCategoria = '';
  filtroActualCategoria: FiltroCategoriaKpi = 'todas';
  urlParaBarra = '';
  private temporizadorTipeo?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.servicioAdmin.cargarEstadisticasPublicas().subscribe();
  }

  ngOnDestroy(): void {
    if (this.temporizadorTipeo) {
      clearInterval(this.temporizadorTipeo);
    }
  }

  get estadoEscudo3D(): EstadoEscudo3D {
    if (this.servicioAnalisis.estaCargando()) {
      return 'escaneando';
    }
    const resultado = this.servicioAnalisis.resultadoActual();
    if (!resultado) {
      return this.servicioAnalisis.mensajeError() ? 'error' : 'reposo';
    }
    if (resultado.riesgo === 'alto') return 'alto';
    if (resultado.riesgo === 'medio') return 'medio';
    return 'bajo';
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
          // Actualizar inmediatamente las estadísticas del SOC para que el acumulado suba en vivo
          this.servicioAdmin.cargarEstadisticasPublicas().subscribe();
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
        if (res.exito) {
          this.servicioAdmin.cargarEstadisticasPublicas().subscribe();
        }
      },
    });
  }

  cargarUrlDemo(url: string): void {
    if (this.temporizadorTipeo) {
      clearInterval(this.temporizadorTipeo);
      this.temporizadorTipeo = undefined;
    }

    if (this.preferenciasMovimiento.reduceMovimiento()) {
      this.urlParaBarra = url;
      this.analizarUrl(url);
      return;
    }

    // Efecto de tipeo dinámico
    this.urlParaBarra = '';
    let indice = 0;
    const totalCaracteres = url.length;
    const retardoPorCaracter = Math.max(10, Math.floor(320 / totalCaracteres));

    this.temporizadorTipeo = setInterval(() => {
      indice++;
      this.urlParaBarra = url.slice(0, indice);
      if (indice >= totalCaracteres) {
        clearInterval(this.temporizadorTipeo);
        this.temporizadorTipeo = undefined;
        setTimeout(() => {
          this.analizarUrl(url);
        }, 120);
      }
    }, retardoPorCaracter);
  }


  irAArquitectura(): void {
    this.enrutador.navigate(['/arquitectura']);
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
