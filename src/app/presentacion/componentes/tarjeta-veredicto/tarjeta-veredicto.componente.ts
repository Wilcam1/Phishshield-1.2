import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultadoAnalisis } from '../../../datos/modelos/analisis.modelo';
import { FormatoFechaTuberia } from '../../tuberias/formato-fecha.tuberia';
import { RiesgoColorTuberia } from '../../tuberias/riesgo-color.tuberia';

@Component({
  selector: 'app-tarjeta-veredicto',
  standalone: true,
  imports: [CommonModule, RiesgoColorTuberia, FormatoFechaTuberia],
  templateUrl: './tarjeta-veredicto.componente.html',
  styleUrl: './tarjeta-veredicto.componente.scss',
})
export class TarjetaVeredictoComponente {
  @Input({ required: true }) resultado!: ResultadoAnalisis;

  @Output() alCopiar = new EventEmitter<void>();

  estaCopiado = false;

  get porcentajePuntuacion(): number {
    return Math.min(Math.max(this.resultado.puntuacion * 10, 0), 100);
  }

  get tituloVeredicto(): string {
    switch (this.resultado.riesgo) {
      case 'bajo':
        return 'Enlace Aparentemente Legítimo';
      case 'medio':
        return 'Potencial Riesgo o Prácticas Sospechosas';
      case 'alto':
        return 'Alerta Crítica: Alta Probabilidad de Phishing';
    }
  }

  get resumenVeredicto(): string {
    switch (this.resultado.riesgo) {
      case 'bajo':
        return 'Los motores heurísticos y de inteligencia no detectaron señales de suplantación bancaria ni técnicas activas de engaño.';
      case 'medio':
        return 'Se identificaron patrones atípicos como subdominios compuestos o falta de historial comprobado. Procede con prudencia.';
      case 'alto':
        return 'Múltiples validaciones forenses coinciden con tácticas activas de estafa o suplantación de identidad. No introduzcas credenciales.';
    }
  }

  copiarAlPortapapeles(): void {
    const texto = [
      '🛡️ PhishShield — Resultado de Análisis Forense',
      '────────────────────────────────────────',
      `URL:        ${this.resultado.url}`,
      `Riesgo:     ${this.resultado.riesgo.toUpperCase()}`,
      `Puntuación: ${this.resultado.puntuacion}/10`,
      this.resultado.indicadores.length > 0
        ? `\nIndicadores detectados (${this.resultado.indicadores.length}):\n` +
          this.resultado.indicadores.map((i) => `• ${i}`).join('\n')
        : 'Sin indicadores sospechosos detectados.',
      '────────────────────────────────────────',
      `Verificado: ${new Date(this.resultado.marcaTiempo).toLocaleString('es-CO')}`,
    ].join('\n');

    navigator.clipboard?.writeText(texto).then(() => {
      this.estaCopiado = true;
      this.alCopiar.emit();
      setTimeout(() => {
        this.estaCopiado = false;
      }, 2000);
    });
  }
}
