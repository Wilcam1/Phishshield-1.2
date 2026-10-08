import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Inclinacion3dDirectiva } from '../../directivas/inclinacion-3d.directiva';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';
import { IconoComponente, NombreIcono } from '../icono/icono.componente';

export interface EscenarioPrueba {
  titulo: string;
  url: string;
  icono: NombreIcono;
  categoria: 'seguro' | 'advertencia' | 'peligro';
}

@Component({
  selector: 'app-zona-pruebas',
  standalone: true,
  imports: [CommonModule, Inclinacion3dDirectiva, LuzCursorDirectiva, IconoComponente],
  templateUrl: './zona-pruebas.componente.html',
  styleUrl: './zona-pruebas.componente.scss',
})
export class ZonaPruebasComponente {
  @Output() alSeleccionarUrl = new EventEmitter<string>();

  readonly escenarios: EscenarioPrueba[] = [
    {
      titulo: 'Banco Genuino',
      url: 'https://www.bancolombia.com/personas/beneficios/tarjeta-debito',
      icono: 'verificado',
      categoria: 'seguro',
    },
    {
      titulo: 'Tienda Operativa',
      url: 'https://www.shein.com.co/user/auth/login?direction=nav',
      icono: 'candado',
      categoria: 'seguro',
    },
    {
      titulo: 'Subdominios Múltiples',
      url: 'https://login.bancolombia.verificacion.secure.com/',
      icono: 'red',
      categoria: 'advertencia',
    },
    {
      titulo: 'Guiones y Parámetros',
      url: 'https://envios-gratis-hoy-ofertas.com/login?password=abc',
      icono: 'enlace',
      categoria: 'advertencia',
    },
    {
      titulo: 'Dirección IP Directa',
      url: 'http://192.168.1.1/login',
      icono: 'terminal',
      categoria: 'peligro',
    },
    {
      titulo: 'Typosquatting (Suplantación)',
      url: 'https://secure-bancolombia-login.com/verificar',
      icono: 'alerta',
      categoria: 'peligro',
    },
  ];

  seleccionar(url: string): void {
    this.alSeleccionarUrl.emit(url);
  }
}
