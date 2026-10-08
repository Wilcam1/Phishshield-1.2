import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ResultadoAnalisis } from '../../../datos/modelos/analisis.modelo';

export interface ElementoDetalle {
  etiqueta: string;
  valor: string;
  estado: 'seguro' | 'advertencia' | 'peligro';
}

@Component({
  selector: 'app-desglose-tecnico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './desglose-tecnico.componente.html',
  styleUrl: './desglose-tecnico.componente.scss',
})
export class DesgloseTecnicoComponente {
  @Input({ required: true }) resultado!: ResultadoAnalisis;

  estaExpandido = false;

  alternarExpandido(): void {
    this.estaExpandido = !this.estaExpandido;
  }

  get listaDetalles(): ElementoDetalle[] {
    const detalles: ElementoDetalle[] = [];

    let objetoUrl: URL | null = null;
    try {
      objetoUrl = new URL(
        this.resultado.url.startsWith('http')
          ? this.resultado.url
          : `https://${this.resultado.url}`
      );
    } catch {
      // Ignorar error de parsing
    }

    const dominio = objetoUrl ? objetoUrl.hostname : this.resultado.url;
    const protocolo = objetoUrl ? objetoUrl.protocol.replace(':', '') : 'HTTP';
    const tieneSubdominios = objetoUrl ? objetoUrl.hostname.split('.').length > 2 : false;
    const esHttps = protocolo.toLowerCase() === 'https';

    detalles.push({
      etiqueta: 'Dominio Analizado',
      valor: dominio,
      estado: 'seguro',
    });

    detalles.push({
      etiqueta: 'Protocolo de Red',
      valor: protocolo.toUpperCase(),
      estado: esHttps ? 'seguro' : 'advertencia',
    });

    detalles.push({
      etiqueta: 'Subdominios Anidados',
      valor: tieneSubdominios ? 'Sí (Múltiples)' : 'No (Estándar)',
      estado: tieneSubdominios ? 'advertencia' : 'seguro',
    });

    detalles.push({
      etiqueta: 'Longitud de Enlace',
      valor: `${this.resultado.url.length} caracteres (${this.resultado.url.length > 50 ? 'Extensa' : 'Normal'})`,
      estado: this.resultado.url.length > 50 ? 'advertencia' : 'seguro',
    });

    detalles.push({
      etiqueta: 'Puntuación Total',
      valor: `${this.resultado.puntuacion}/10`,
      estado:
        this.resultado.puntuacion <= 3
          ? 'seguro'
          : this.resultado.puntuacion <= 6
            ? 'advertencia'
            : 'peligro',
    });

    if (this.resultado.probabilidadAprendizajeAutomatico !== null) {
      const prob = this.resultado.probabilidadAprendizajeAutomatico;
      const textoPorcentaje = `${(prob <= 1 ? prob * 100 : prob).toFixed(1)}%`;
      detalles.push({
        etiqueta: 'Probabilidad ML (Random Forest)',
        valor: textoPorcentaje,
        estado: prob > 0.5 ? 'peligro' : 'seguro',
      });
    }

    if (this.resultado.inspeccionSsl) {
      const ssl = this.resultado.inspeccionSsl;
      detalles.push({
        etiqueta: 'Certificado Criptográfico SSL',
        valor: ssl.esAutofirmado
          ? 'Autofirmado (Inseguro)'
          : ssl.esValido
            ? `Válido (${ssl.emisor || 'Emisor Reconocido'})`
            : 'Sin SSL o No Confiable',
        estado: ssl.esValido && !ssl.esAutofirmado ? 'seguro' : 'peligro',
      });

      if (ssl.diasActivo !== undefined) {
        detalles.push({
          etiqueta: 'Antigüedad Certificado SSL',
          valor: `${ssl.diasActivo} días (${ssl.esReciente ? 'Reciente < 30 días' : 'Estable'})`,
          estado: ssl.esReciente ? 'advertencia' : 'seguro',
        });
      }
    }

    if (this.resultado.inspeccionDom && this.resultado.inspeccionDom.fueAnalizado) {
      const dom = this.resultado.inspeccionDom;
      if (dom.titulo) {
        detalles.push({
          etiqueta: 'Título Capturado en DOM',
          valor: dom.titulo,
          estado: dom.marcaEnTitulo ? 'peligro' : 'seguro',
        });
      }

      if (dom.tieneCampoClave || dom.tieneCampoTarjeta) {
        detalles.push({
          etiqueta: 'Formularios Sensibles Detectados',
          valor: dom.tieneCampoTarjeta ? 'Captura de Tarjeta/CVV' : 'Formulario de Contraseña',
          estado: 'peligro',
        });
      }
    }

    return detalles;
  }
}
