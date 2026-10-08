import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

export type EstadoServicio = 'operativo' | 'degradado' | 'inactivo';

export interface ServicioEstadoInfo {
  id: string;
  nombre: string;
  puerto: string;
  tipo: string;
  estado: EstadoServicio;
  latenciaMs: number;
  disponibilidadPorcentaje: number;
  version: string;
  detalles: string;
}

@Component({
  selector: 'app-telemetria-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './telemetria-servicios.componente.html',
  styleUrl: './telemetria-servicios.componente.scss',
})
export class TelemetriaServiciosComponente {
  readonly horaUltimaActualizacion = signal(new Date().toLocaleTimeString());

  readonly servicios = signal<ServicioEstadoInfo[]>([
    {
      id: 'api-gateway',
      nombre: 'API Gateway & Motor Heurístico',
      puerto: ':3001',
      tipo: 'Node.js Express / Puppeteer',
      estado: 'operativo',
      latenciaMs: 14,
      disponibilidadPorcentaje: 99.98,
      version: 'v2.4.0',
      detalles: '19 validaciones heurísticas, inspección SSL, DOM y reputación externa.',
    },
    {
      id: 'ml-inference',
      nombre: 'Microservicio Machine Learning',
      puerto: ':8000',
      tipo: 'Python FastAPI / Random Forest',
      estado: 'operativo',
      latenciaMs: 8,
      disponibilidadPorcentaje: 99.95,
      version: 'v1.8.2',
      detalles: 'Inferencia de 15 features de URL con Entropía de Shannon y Score Floor.',
    },
    {
      id: 'ai-education',
      nombre: 'Microservicio Educativo IA',
      puerto: ':6000',
      tipo: 'Python FastAPI / Asistente IA',
      estado: 'operativo',
      latenciaMs: 19,
      disponibilidadPorcentaje: 99.9,
      version: 'v1.2.0',
      detalles: 'Explicaciones adaptativas pedagógicas y generación de micro-quizzes.',
    },
  ]);

  obtenerTextoEstado(estado: EstadoServicio): string {
    switch (estado) {
      case 'operativo':
        return 'Operativo';
      case 'degradado':
        return 'Degradado';
      case 'inactivo':
        return 'Inactivo';
    }
  }
}
