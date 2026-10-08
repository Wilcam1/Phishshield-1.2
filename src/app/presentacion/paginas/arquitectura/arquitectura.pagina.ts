import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IconoComponente,
  NotificacionFlotanteComponente,
  SelectorTemaComponente,
  VisorFlujoArquitecturaComponente,
} from '../../componentes';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';

@Component({
  selector: 'app-arquitectura-pagina',
  standalone: true,
  imports: [
    CommonModule,
    IconoComponente,
    LuzCursorDirectiva,
    VisorFlujoArquitecturaComponente,
    SelectorTemaComponente,
    NotificacionFlotanteComponente,
  ],
  templateUrl: './arquitectura.pagina.html',
  styleUrl: './arquitectura.pagina.scss',
})

export class ArquitecturaPaginaComponente {
  private readonly enrutador = inject(Router);

  volverAlAnalizador(): void {
    this.enrutador.navigate(['/analizador']);
  }

  irAlPanelSoc(): void {
    this.enrutador.navigate(['/panel-soc']);
  }
}
