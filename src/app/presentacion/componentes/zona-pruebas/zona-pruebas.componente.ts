import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

export interface EscenarioPrueba {
  titulo: string;
  url: string;
  icono: string;
  categoria: 'seguro' | 'advertencia' | 'peligro';
}

@Component({
  selector: 'app-zona-pruebas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zona-pruebas.componente.html',
  styleUrl: './zona-pruebas.componente.scss',
})
export class ZonaPruebasComponente {
  @Output() alSeleccionarUrl = new EventEmitter<string>();

  readonly escenarios: EscenarioPrueba[] = [
    {
      titulo: 'Banco Genuino',
      url: 'https://www.bancolombia.com/personas/beneficios/tarjeta-debito',
      icono: '🏦',
      categoria: 'seguro',
    },
    {
      titulo: 'Tienda Operativa',
      url: 'https://www.shein.com.co/user/auth/login?direction=nav',
      icono: '🛍️',
      categoria: 'seguro',
    },
    {
      titulo: 'Subdominios Múltiples',
      url: 'https://login.bancolombia.verificacion.secure.com/',
      icono: '🔗',
      categoria: 'advertencia',
    },
    {
      titulo: 'Guiones y Parámetros',
      url: 'https://envios-gratis-hoy-ofertas.com/login?password=abc',
      icono: '🔄',
      categoria: 'advertencia',
    },
    {
      titulo: 'Dirección IP Directa',
      url: 'http://192.168.1.1/login',
      icono: '📟',
      categoria: 'peligro',
    },
    {
      titulo: 'Typosquatting (Suplantación)',
      url: 'https://secure-bancolombia-login.com/verificar',
      icono: '👀',
      categoria: 'peligro',
    },
  ];

  seleccionar(url: string): void {
    this.alSeleccionarUrl.emit(url);
  }
}
