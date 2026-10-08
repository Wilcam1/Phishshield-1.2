import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { PreferenciasMovimientoServicio } from '../../../logica/servicios/preferencias-movimiento.servicio';
import { IconoComponente } from '../icono/icono.componente';

export type EstadoEscudo3D = 'reposo' | 'escaneando' | 'bajo' | 'medio' | 'alto' | 'error';

interface ConfiguracionEstado {
  colorPrincipal: number;
  colorEmisivo: number;
  intensidadEmisiva: number;
  colorLuz: number;
  velocidadGiro: number;
  amplitudFlotacion: number;
  frecuenciaFlotacion: number;
}

const CONFIGURACIONES_ESTADO: Record<EstadoEscudo3D, ConfiguracionEstado> = {
  reposo: {
    colorPrincipal: 0x38bdf8, // Cian cielo
    colorEmisivo: 0x0369a1,
    intensidadEmisiva: 0.25,
    colorLuz: 0x38bdf8,
    velocidadGiro: 0.6,
    amplitudFlotacion: 0.06,
    frecuenciaFlotacion: 1.2,
  },
  escaneando: {
    colorPrincipal: 0x60a5fa, // Azul eléctrico vibrante
    colorEmisivo: 0x2563eb,
    intensidadEmisiva: 0.75,
    colorLuz: 0x93c5fd,
    velocidadGiro: 3.5, // Giro rápido en escaneo
    amplitudFlotacion: 0.09,
    frecuenciaFlotacion: 3.0,
  },
  bajo: {
    colorPrincipal: 0x34d399, // Esmeralda seguro
    colorEmisivo: 0x059669,
    intensidadEmisiva: 0.45,
    colorLuz: 0x6ee7b7,
    velocidadGiro: 0.8,
    amplitudFlotacion: 0.05,
    frecuenciaFlotacion: 1.0,
  },
  medio: {
    colorPrincipal: 0xfbbf24, // Ámbar advertencia
    colorEmisivo: 0xd97706,
    intensidadEmisiva: 0.55,
    colorLuz: 0xfcd34d,
    velocidadGiro: 1.1,
    amplitudFlotacion: 0.07,
    frecuenciaFlotacion: 1.8,
  },
  alto: {
    colorPrincipal: 0xf87171, // Carmesí peligro
    colorEmisivo: 0xdc2626,
    intensidadEmisiva: 0.85,
    colorLuz: 0xfca5a5,
    velocidadGiro: 1.6,
    amplitudFlotacion: 0.1,
    frecuenciaFlotacion: 2.4,
  },
  error: {
    colorPrincipal: 0x94a3b8, // Gris slate
    colorEmisivo: 0x475569,
    intensidadEmisiva: 0.15,
    colorLuz: 0xcbd5e1,
    velocidadGiro: 0.3,
    amplitudFlotacion: 0.03,
    frecuenciaFlotacion: 0.8,
  },
};

@Component({
  selector: 'app-escudo-3d',
  standalone: true,
  imports: [CommonModule, IconoComponente],
  templateUrl: './escudo-3d.componente.html',
  styleUrls: ['./escudo-3d.componente.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Escudo3dComponente implements AfterViewInit, OnChanges, OnDestroy {
  @Input() estado: EstadoEscudo3D = 'reposo';
  @Input() altura = 320;

  @ViewChild('contenedorLienzo', { static: false })
  private readonly contenedorLienzo!: ElementRef<HTMLDivElement>;

  readonly preferenciasMovimiento = inject(PreferenciasMovimientoServicio);
  private readonly ngZone = inject(NgZone);

  // Three.js instancias
  private escena?: THREE.Scene;
  private camara?: THREE.PerspectiveCamera;
  private renderizador?: THREE.WebGLRenderer;
  private grupoEscudo?: THREE.Group;
  private materialEscudo?: THREE.MeshPhysicalMaterial;
  private materialBorde?: THREE.MeshStandardMaterial;
  private materialNucleo?: THREE.MeshPhysicalMaterial;
  private luzPuntual?: THREE.PointLight;
  private luzBorde?: THREE.PointLight;

  private idAnimacion?: number;
  private observadorRedimension?: ResizeObserver;

  // Estado del mouse e interpolación
  private ratonObjetivo = { x: 0, y: 0 };
  private ratonActual = { x: 0, y: 0 };
  private tiempoInicio = performance.now();

  ngAfterViewInit(): void {
    if (!this.preferenciasMovimiento.debeDesactivarEfectos3D()) {
      this.ngZone.runOutsideAngular(() => {
        this.inicializarEscenaThree();
        this.iniciarBucleAnimacion();
        this.configurarEscuchadores();
      });
    }
  }


  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['estado'] && this.materialEscudo) {
      this.actualizarMaterialSegunEstado();
    }
  }

  ngOnDestroy(): void {
    if (this.idAnimacion) {
      cancelAnimationFrame(this.idAnimacion);
    }
    this.observadorRedimension?.disconnect();
    this.destruirRecursosThree();
  }

  get mostrarFallback2D(): boolean {
    return this.preferenciasMovimiento.debeDesactivarEfectos3D();
  }

  private inicializarEscenaThree(): void {
    const contenedor = this.contenedorLienzo?.nativeElement;
    if (!contenedor) return;

    const ancho = contenedor.clientWidth || 320;
    const alto = this.altura;

    // Escena
    this.escena = new THREE.Scene();

    // Cámara
    this.camara = new THREE.PerspectiveCamera(42, ancho / alto, 0.1, 100);
    this.camara.position.set(0, 0, 4.4);

    // Renderizador con antialias y soporte para transparencia alpha
    this.renderizador = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderizador.setSize(ancho, alto);
    this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderizador.toneMappingExposure = 1.25;

    contenedor.appendChild(this.renderizador.domElement);

    // Iluminación cinemática
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.7);
    this.escena.add(luzAmbiente);

    const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.8);
    luzDireccional.position.set(3, 4, 3);
    this.escena.add(luzDireccional);

    this.luzPuntual = new THREE.PointLight(0x38bdf8, 2.8, 12);
    this.luzPuntual.position.set(0, 0.5, 2.5);
    this.escena.add(this.luzPuntual);

    this.luzBorde = new THREE.PointLight(0x60a5fa, 2.2, 10);
    this.luzBorde.position.set(-2.5, -1, -1.5);
    this.escena.add(this.luzBorde);

    // Crear geometría procedural del escudo
    this.construirEscudoProcedural();
    this.actualizarMaterialSegunEstado();
  }

  private construirEscudoProcedural(): void {
    if (!this.escena) return;

    this.grupoEscudo = new THREE.Group();

    // Forma exterior del escudo
    const formaEscudo = new THREE.Shape();
    formaEscudo.moveTo(0, 1.25);
    formaEscudo.quadraticCurveTo(0.48, 1.3, 0.88, 1.05);
    formaEscudo.quadraticCurveTo(0.95, 0.35, 0.82, 0.05);
    formaEscudo.quadraticCurveTo(0.62, -0.68, 0, -1.3);
    formaEscudo.quadraticCurveTo(-0.62, -0.68, -0.82, 0.05);
    formaEscudo.quadraticCurveTo(-0.95, 0.35, -0.88, 1.05);
    formaEscudo.quadraticCurveTo(-0.48, 1.3, 0, 1.25);

    const opcionesExtrusion: THREE.ExtrudeGeometryOptions = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    const geometriaEscudo = new THREE.ExtrudeGeometry(formaEscudo, opcionesExtrusion);
    geometriaEscudo.center();

    // Material físico de vidrio esmerilado con brillo metálico (estilo Apple)
    this.materialEscudo = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.35,
      roughness: 0.18,
      transmission: 0.45,
      thickness: 0.8,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.95,
    });

    const mallaEscudo = new THREE.Mesh(geometriaEscudo, this.materialEscudo);
    this.grupoEscudo.add(mallaEscudo);

    // Marco exterior (anillo de refuerzo de titanio sutil)
    const opcionesBorde: THREE.ExtrudeGeometryOptions = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    };
    const geometriaBorde = new THREE.ExtrudeGeometry(formaEscudo, opcionesBorde);
    geometriaBorde.center();

    this.materialBorde = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: false,
    });

    const mallaBorde = new THREE.Mesh(geometriaBorde, this.materialBorde);
    mallaBorde.scale.set(1.04, 1.04, 0.7);
    mallaBorde.position.z = -0.06;
    this.grupoEscudo.add(mallaBorde);

    // Núcleo central del escudo (emblema de verificación geométrico)
    const formaNucleo = new THREE.Shape();
    formaNucleo.moveTo(0, 0.6);
    formaNucleo.lineTo(0.42, 0.35);
    formaNucleo.lineTo(0.38, -0.15);
    formaNucleo.lineTo(0, -0.65);
    formaNucleo.lineTo(-0.38, -0.15);
    formaNucleo.lineTo(-0.42, 0.35);
    formaNucleo.closePath();

    const geometriaNucleo = new THREE.ExtrudeGeometry(formaNucleo, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    geometriaNucleo.center();

    this.materialNucleo = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.12,
      clearcoat: 1.0,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.92,
    });

    const mallaNucleo = new THREE.Mesh(geometriaNucleo, this.materialNucleo);
    mallaNucleo.position.z = 0.16;
    mallaNucleo.scale.set(0.72, 0.72, 0.72);
    this.grupoEscudo.add(mallaNucleo);

    this.escena.add(this.grupoEscudo);
  }

  private actualizarMaterialSegunEstado(): void {
    if (!this.materialEscudo || !this.materialNucleo || !this.luzPuntual) return;

    const config = CONFIGURACIONES_ESTADO[this.estado] || CONFIGURACIONES_ESTADO.reposo;

    this.materialEscudo.color.setHex(config.colorPrincipal);
    this.materialEscudo.emissive.setHex(config.colorEmisivo);
    this.materialEscudo.emissiveIntensity = config.intensidadEmisiva;

    this.materialNucleo.emissive.setHex(config.colorPrincipal);
    this.materialNucleo.emissiveIntensity = Math.min(1.0, config.intensidadEmisiva * 1.3);

    this.luzPuntual.color.setHex(config.colorLuz);
    this.luzPuntual.intensity = 2.0 + config.intensidadEmisiva * 1.5;

    if (this.luzBorde) {
      this.luzBorde.color.setHex(config.colorPrincipal);
    }
  }

  private iniciarBucleAnimacion(): void {
    const animar = () => {
      this.idAnimacion = requestAnimationFrame(animar);

      const ahora = (performance.now() - this.tiempoInicio) * 0.001;
      const config = CONFIGURACIONES_ESTADO[this.estado] || CONFIGURACIONES_ESTADO.reposo;

      // Suavizado de mouse con amortiguamiento crítico
      this.ratonActual.x += (this.ratonObjetivo.x - this.ratonActual.x) * 0.06;
      this.ratonActual.y += (this.ratonObjetivo.y - this.ratonActual.y) * 0.06;

      if (this.grupoEscudo) {
        // Flotación senoidal suave
        const elevacionFlotacion =
          Math.sin(ahora * config.frecuenciaFlotacion) * config.amplitudFlotacion;
        this.grupoEscudo.position.y = elevacionFlotacion;

        if (this.estado === 'escaneando') {
          // Rotación continua acelerada en escaneo
          this.grupoEscudo.rotation.y += 0.045;
          this.grupoEscudo.rotation.x =
            Math.sin(ahora * 2.5) * 0.08 + this.ratonActual.y * 0.12;
          this.grupoEscudo.rotation.z = Math.cos(ahora * 2.0) * 0.05;
        } else {
          // Parallax suave al cursor (máximo ~12 grados = 0.21 radianes)
          const maxRadianes = 0.21;
          const objetivoRotY = this.ratonActual.x * maxRadianes;
          const objetivoRotX = -this.ratonActual.y * maxRadianes;

          this.grupoEscudo.rotation.y += (objetivoRotY - this.grupoEscudo.rotation.y) * 0.08;
          this.grupoEscudo.rotation.x += (objetivoRotX - this.grupoEscudo.rotation.x) * 0.08;
          this.grupoEscudo.rotation.z = Math.sin(ahora * 0.8) * 0.02;
        }
      }

      if (this.renderizador && this.escena && this.camara) {
        this.renderizador.render(this.escena, this.camara);
      }
    };

    animar();
  }

  private configurarEscuchadores(): void {
    const contenedor = this.contenedorLienzo?.nativeElement;
    if (!contenedor) return;

    // Escuchar movimiento de ratón en toda la ventana para respuesta cinemática inmersiva
    const manejarMovimientoMouse = (evento: MouseEvent) => {
      const mitadAncho = window.innerWidth * 0.5;
      const mitadAlto = window.innerHeight * 0.5;
      // Normalizado de -1 a 1
      this.ratonObjetivo.x = (evento.clientX - mitadAncho) / mitadAncho;
      this.ratonObjetivo.y = (evento.clientY - mitadAlto) / mitadAlto;
    };

    window.addEventListener('mousemove', manejarMovimientoMouse, { passive: true });

    // Observar redimensionamiento del contenedor
    this.observadorRedimension = new ResizeObserver((entradas) => {
      for (const entrada of entradas) {
        const nuevoAncho = entrada.contentRect.width;
        if (nuevoAncho > 0 && this.camara && this.renderizador) {
          this.camara.aspect = nuevoAncho / this.altura;
          this.camara.updateProjectionMatrix();
          this.renderizador.setSize(nuevoAncho, this.altura);
        }
      }
    });

    this.observadorRedimension.observe(contenedor);
  }

  private destruirRecursosThree(): void {
    if (this.grupoEscudo) {
      this.grupoEscudo.traverse((objeto) => {
        if (objeto instanceof THREE.Mesh) {
          objeto.geometry?.dispose();
          if (Array.isArray(objeto.material)) {
            objeto.material.forEach((m) => m.dispose());
          } else {
            objeto.material?.dispose();
          }
        }
      });
    }

    this.renderizador?.dispose();
  }
}
