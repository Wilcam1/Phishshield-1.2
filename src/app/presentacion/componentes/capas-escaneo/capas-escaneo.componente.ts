import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { IconoComponente, NombreIcono } from '../icono/icono.componente';

export type EstadoCapaEscaneo = 'pendiente' | 'en_progreso' | 'completada';

export interface CapaEscaneoInfo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: NombreIcono;
  estado: EstadoCapaEscaneo;
}

@Component({
  selector: 'app-capas-escaneo',
  standalone: true,
  imports: [CommonModule, IconoComponente],
  templateUrl: './capas-escaneo.componente.html',
  styleUrl: './capas-escaneo.componente.scss',
})
export class CapasEscaneoComponente implements OnInit, OnChanges, OnDestroy {
  @Input() escaneando = false;
  @Input() set activo(val: boolean) {
    this.escaneando = val;
  }
  get activo(): boolean {
    return this.escaneando;
  }
  @Input() urlObjetivo = '';

  readonly capas = signal<CapaEscaneoInfo[]>([
    {
      id: 'heuristica',
      nombre: 'Heurística de Sintaxis y Typosquatting',
      descripcion: '19 reglas de inspección léxica, punycode y caracteres',
      icono: 'lupa',
      estado: 'pendiente',
    },
    {
      id: 'ssl',
      nombre: 'Inspección Criptográfica SSL / TLS',
      descripcion: 'Verificación de emisor X.509 y antigüedad del certificado',
      icono: 'candado',
      estado: 'pendiente',
    },
    {
      id: 'ml',
      nombre: 'Inferencia Machine Learning (Random Forest)',
      descripcion: 'Evaluación del vector de 15 features probabilísticas',
      icono: 'cpu',
      estado: 'pendiente',
    },
    {
      id: 'dom',
      nombre: 'Análisis DOM Headless y Detección de Formularios',
      descripcion: 'Búsqueda de trampas de credenciales y marcas suplantadas',
      icono: 'ojo',
      estado: 'pendiente',
    },
    {
      id: 'reputacion',
      nombre: 'Entropía de Shannon y Listas Negras Globales',
      descripcion: 'Cálculo de aleatoriedad del dominio y listas de amenaza',
      icono: 'red',
      estado: 'pendiente',
    },
  ]);

  readonly indicePasoActivo = computed(() => {
    const lista = this.capas();
    const idxEnProgreso = lista.findIndex((c) => c.estado === 'en_progreso');
    if (idxEnProgreso !== -1) return idxEnProgreso + 1;
    const totalCompletadas = lista.filter((c) => c.estado === 'completada').length;
    return Math.min(lista.length, totalCompletadas + 1);
  });

  readonly porcentajeProgreso = computed(() => {
    const lista = this.capas();
    const completadas = lista.filter((c) => c.estado === 'completada').length;
    const enProgreso = lista.some((c) => c.estado === 'en_progreso') ? 0.5 : 0;
    return Math.min(100, Math.round(((completadas + enProgreso) / lista.length) * 100));
  });

  private temporizadores: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    if (this.escaneando || this.activo) {
      this.iniciarSecuenciaEscaneo();
    }
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['escaneando'] || cambios['activo']) {
      const estaActivo = this.escaneando || this.activo;
      if (estaActivo) {
        this.iniciarSecuenciaEscaneo();
      } else {
        this.completarTodoInmediato();
      }
    }
  }

  ngOnDestroy(): void {
    this.limpiarTemporizadores();
  }

  private iniciarSecuenciaEscaneo(): void {
    this.limpiarTemporizadores();

    // Resetear a pendiente
    this.actualizarEstadoTodas('pendiente');

    const lista = this.capas();
    const duracionPaso = 340; // ms entre fases forenses

    lista.forEach((_, idx) => {
      // Pasa a en_progreso
      const t1 = setTimeout(() => {
        this.actualizarEstadoCapa(idx, 'en_progreso');
      }, idx * duracionPaso);
      this.temporizadores.push(t1);

      // Pasa a completada
      const t2 = setTimeout(() => {
        this.actualizarEstadoCapa(idx, 'completada');
      }, (idx + 1) * duracionPaso);
      this.temporizadores.push(t2);
    });
  }

  private completarTodoInmediato(): void {
    this.limpiarTemporizadores();
    this.actualizarEstadoTodas('completada');
  }

  private actualizarEstadoCapa(indice: number, nuevoEstado: EstadoCapaEscaneo): void {
    this.capas.update((actuales) => {
      return actuales.map((capa, i) => (i === indice ? { ...capa, estado: nuevoEstado } : capa));
    });
  }

  private actualizarEstadoTodas(nuevoEstado: EstadoCapaEscaneo): void {
    this.capas.update((actuales) => actuales.map((c) => ({ ...c, estado: nuevoEstado })));
  }

  private limpiarTemporizadores(): void {
    this.temporizadores.forEach((t) => clearTimeout(t));
    this.temporizadores = [];
  }
}

