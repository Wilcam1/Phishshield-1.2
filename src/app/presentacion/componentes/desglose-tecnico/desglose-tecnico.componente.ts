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

    const urlBruta = this.resultado.url || '';
    let objetoUrl: URL | null = null;
    try {
      objetoUrl = new URL(
        urlBruta.startsWith('http') ? urlBruta : `https://${urlBruta}`
      );
    } catch {
      // Ignorar error de parsing
    }

    const dominio = objetoUrl ? objetoUrl.hostname : urlBruta;
    const protocolo = objetoUrl ? objetoUrl.protocol.replace(':', '') : 'HTTP';
    const tieneSubdominio = objetoUrl ? objetoUrl.hostname.split('.').length > 2 : false;
    const esHttps = protocolo.toLowerCase() === 'https';
    const longitudUrl = urlBruta.length;
    const caracteresEspeciales = (urlBruta.match(/[^a-zA-Z0-9.:/]/g) || []).length;

    // 1. Dominio analizado
    detalles.push({
      etiqueta: 'Dominio analizado',
      valor: dominio,
      estado: 'seguro',
    });

    // 2. Protocolo
    detalles.push({
      etiqueta: 'Protocolo',
      valor: protocolo.toUpperCase(),
      estado: esHttps ? 'seguro' : 'advertencia',
    });

    // 3. Subdominios
    detalles.push({
      etiqueta: 'Subdominios',
      valor: tieneSubdominio ? 'Sí' : 'No',
      estado: tieneSubdominio ? 'advertencia' : 'seguro',
    });

    // 4. Longitud de URL
    detalles.push({
      etiqueta: 'Longitud de URL',
      valor: longitudUrl > 50 ? 'Larga' : 'Normal',
      estado: longitudUrl > 50 ? 'advertencia' : 'seguro',
    });

    // 5. Caracteres especiales
    detalles.push({
      etiqueta: 'Caracteres especiales',
      valor: `${caracteresEspeciales}`,
      estado: 'seguro',
    });

    // 6. Nivel de riesgo
    const nivelRiesgoTexto = this.resultado.riesgo.toUpperCase();
    detalles.push({
      etiqueta: 'Nivel de riesgo',
      valor: nivelRiesgoTexto,
      estado:
        this.resultado.riesgo === 'alto'
          ? 'peligro'
          : this.resultado.riesgo === 'medio'
            ? 'advertencia'
            : 'seguro',
    });

    // 7. Puntuación de Riesgo
    detalles.push({
      etiqueta: 'Puntuación de Riesgo',
      valor: `${this.resultado.puntuacion}/10`,
      estado:
        this.resultado.puntuacion <= 3
          ? 'seguro'
          : this.resultado.puntuacion <= 7
            ? 'advertencia'
            : 'peligro',
    });

    // 8. Probabilidad IA (ML)
    const probMl = this.resultado.probabilidadAprendizajeAutomatico;
    const tieneProbMl = probMl !== null && probMl !== undefined;
    const textoMl = tieneProbMl
      ? `${(probMl <= 1 ? probMl * 100 : probMl).toFixed(1)}%`
      : 'N/A';
    detalles.push({
      etiqueta: 'Probabilidad IA (ML)',
      valor: textoMl,
      estado: tieneProbMl && probMl > 0.5 ? 'peligro' : 'seguro',
    });

    // 9. 🔒 Certificado SSL
    if (this.resultado.inspeccionSsl) {
      const ssl = this.resultado.inspeccionSsl;
      if (ssl.tieneSsl) {
        const textoSsl = ssl.esAutofirmado
          ? 'Autofirmado'
          : ssl.esConfiable || ssl.esValido
            ? `Válido (${ssl.emisor || 'Emisor Reconocido'})`
            : 'No confiable';

        detalles.push({
          etiqueta: '🔒 Certificado SSL',
          valor: textoSsl,
          estado: (ssl.esConfiable || ssl.esValido) && !ssl.esAutofirmado
            ? (ssl.esReciente ? 'advertencia' : 'seguro')
            : 'peligro',
        });

        // 10. 📅 Antigüedad SSL
        detalles.push({
          etiqueta: '📅 Antigüedad SSL',
          valor: ssl.diasActivo !== undefined ? `${ssl.diasActivo} días` : 'N/A',
          estado: ssl.esReciente ? 'advertencia' : 'seguro',
        });
      } else {
        detalles.push({
          etiqueta: '🔒 Certificado SSL',
          valor: 'Sin SSL / Inseguro',
          estado: 'peligro',
        });
      }
    } else {
      detalles.push({
        etiqueta: '🔒 Certificado SSL',
        valor: esHttps ? 'Válido' : 'Sin SSL / Inseguro',
        estado: esHttps ? 'seguro' : 'peligro',
      });
    }

    // 11. 📄 Título de la página
    if (this.resultado.inspeccionDom && this.resultado.inspeccionDom.fueAnalizado && this.resultado.inspeccionDom.titulo) {
      const titulo = this.resultado.inspeccionDom.titulo;
      const tituloCorto = titulo.length > 30 ? titulo.substring(0, 30) + '...' : titulo;
      detalles.push({
        etiqueta: '📄 Título de la página',
        valor: tituloCorto,
        estado: this.resultado.inspeccionDom.marcaEnTitulo ? 'peligro' : 'seguro',
      });
    } else {
      detalles.push({
        etiqueta: '📄 Título de la página',
        valor: 'No detectado',
        estado: 'seguro',
      });
    }

    return detalles;
  }
}
