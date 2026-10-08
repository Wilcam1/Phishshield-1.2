import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { ElementoHistorialGlobal } from '../../../datos/modelos/administracion.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';
import { RiesgoColorTuberia } from '../../tuberias/riesgo-color.tuberia';

export type FiltroSeveridad = 'todos' | 'alto' | 'medio' | 'bajo';

@Component({
  selector: 'app-tabla-historial-global',
  standalone: true,
  imports: [CommonModule, RiesgoColorTuberia, FormatoFechaTuberia],
  templateUrl: './tabla-historial-global.componente.html',
  styleUrl: './tabla-historial-global.componente.scss',
})
export class TablaHistorialGlobalComponente {
  private readonly historialEntrada = signal<ElementoHistorialGlobal[]>([]);

  @Input()
  set historial(valor: ElementoHistorialGlobal[]) {
    this.historialEntrada.set(valor || []);
  }
  get historial(): ElementoHistorialGlobal[] {
    return this.historialEntrada();
  }

  @Input() estaCargando = false;

  @Output() alEliminar = new EventEmitter<string>();
  @Output() alExportarCsv = new EventEmitter<void>();
  @Output() alSeleccionarIncidente = new EventEmitter<ElementoHistorialGlobal>();

  readonly terminoBusqueda = signal('');
  readonly filtroSeveridad = signal<FiltroSeveridad>('todos');
  readonly paginaActual = signal(1);
  readonly tamanoPagina = 8;

  readonly elementosFiltrados = computed(() => {
    const elementos = this.historialEntrada();
    const busqueda = this.terminoBusqueda().toLowerCase().trim();
    const filtro = this.filtroSeveridad();

    return elementos.filter((elem) => {
      const coincideBusqueda = !busqueda || elem.url.toLowerCase().includes(busqueda);
      const coincideFiltro =
        filtro === 'todos' ||
        (filtro === 'alto' && (elem.riesgo.toLowerCase().includes('alt') || elem.riesgo.toLowerCase().includes('crit'))) ||
        (filtro === 'medio' && elem.riesgo.toLowerCase().includes('med')) ||
        (filtro === 'bajo' && elem.riesgo.toLowerCase().includes('baj'));

      return coincideBusqueda && coincideFiltro;
    });
  });

  readonly totalPaginas = computed(() => {
    const total = this.elementosFiltrados().length;
    return Math.max(1, Math.ceil(total / this.tamanoPagina));
  });

  readonly elementosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina;
    return this.elementosFiltrados().slice(inicio, inicio + this.tamanoPagina);
  });

  actualizarBusqueda(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
    this.paginaActual.set(1);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
    this.paginaActual.set(1);
  }

  establecerFiltro(filtro: FiltroSeveridad): void {
    this.filtroSeveridad.set(filtro);
    this.paginaActual.set(1);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  seleccionar(item: ElementoHistorialGlobal): void {
    this.alSeleccionarIncidente.emit(item);
  }

  eliminar(evento: Event, url: string): void {
    evento.stopPropagation();
    if (confirm(`¿Confirmas eliminar el registro forense de "${url}"?`)) {
      this.alEliminar.emit(url);
    }
  }

  exportar(): void {
    this.alExportarCsv.emit();
  }
}
