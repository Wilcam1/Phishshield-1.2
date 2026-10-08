import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, signal } from '@angular/core';
import { IconoComponente } from '../icono/icono.componente';
import { LuzCursorDirectiva } from '../../directivas/luz-cursor.directiva';

export type IdentificadorCapa = 'presentacion' | 'logica' | 'datos' | 'microservicios';

export interface PasoFlujo {
  numero: number;
  capaOrigen: IdentificadorCapa;
  capaDestino: IdentificadorCapa;
  titulo: string;
  subtitulo: string;
  archivoResponsable: string;
  descripcion: string;
  codigoSnippet: string;
  payloadEjemplo: string;
  reglaArquitectura: string;
}

export interface InformacionCapa {
  id: IdentificadorCapa;
  nombre: string;
  subtitulo: string;
  icono: string;
  color: string;
  responsabilidades: string[];
  archivosClave: string[];
  importacionesPermitidas: string[];
  importacionesProhibidas: string[];
}

@Component({
  selector: 'app-visor-flujo-arquitectura',
  standalone: true,
  imports: [CommonModule, IconoComponente, LuzCursorDirectiva],
  templateUrl: './visor-flujo-arquitectura.componente.html',
  styleUrl: './visor-flujo-arquitectura.componente.scss',
})
export class VisorFlujoArquitecturaComponente implements OnDestroy {

  readonly pasoActualIndex = signal<number>(0);
  readonly estaReproduciendo = signal<boolean>(false);
  readonly capaSeleccionadaParaInspeccion = signal<IdentificadorCapa | null>(null);
  readonly urlSeleccionada = signal<string>('https://banco-login-falso.xyz/login');

  private temporizadorReproduccion: ReturnType<typeof setInterval> | null = null;

  readonly capasInfo: Record<IdentificadorCapa, InformacionCapa> = {
    presentacion: {
      id: 'presentacion',
      nombre: 'Capa de Presentación (Front-End)',
      subtitulo: 'Componentes Standalone, Signals & UI Apple Design',
      icono: '🖥️',
      color: 'var(--color-primario)',
      responsabilidades: [
        'Renderizar interfaz gráfica reactiva y accesible (WAI-ARIA).',
        'Capturar interacciones del usuario y emitir eventos.',
        'Reflejar estados de carga, éxito y error mediante Signals.',
        'Aplicar diseño de interfaces fluidas (skill apple-design).',
      ],
      archivosClave: [
        'analizador.pagina.ts',
        'barra-busqueda.componente.ts',
        'tarjeta-veredicto.componente.ts',
        'panel-soc.pagina.ts',
      ],
      importacionesPermitidas: ['logica/servicios', 'logica/estado', 'datos/modelos'],
      importacionesProhibidas: ['datos/repositorios', 'datos/dto', 'datos/mapeadores', '@angular/common/http'],
    },
    logica: {
      id: 'logica',
      nombre: 'Capa de Lógica de Negocio',
      subtitulo: 'Orquestación, Reglas Heurísticas y Estado Reactivo',
      icono: '⚙️',
      color: '#ff9500',
      responsabilidades: [
        'Validar sintaxis, estructura y protocolos de URLs.',
        'Orquestar peticiones y coordinar caché de búsquedas.',
        'Calcular recomendaciones adaptativas y nivel pedagógico.',
        'Gestionar estado reactivo global con Angular Signals.',
      ],
      archivosClave: [
        'analisis.servicio.ts',
        'motor-consejos.servicio.ts',
        'administracion.servicio.ts',
        'notificacion.servicio.ts',
      ],
      importacionesPermitidas: ['datos/repositorios', 'datos/modelos'],
      importacionesProhibidas: ['presentacion/*', '@angular/common/http (directo en componentes)'],
    },
    datos: {
      id: 'datos',
      nombre: 'Capa de Acceso a Datos',
      subtitulo: 'Repositorios, Contratos DTO y Mapeadores Tipados',
      icono: '🗄️',
      color: '#30d158',
      responsabilidades: [
        'Único punto del frontend autorizado para inyectar HttpClient.',
        'Definir DTOs que modelan las respuestas reales de las APIs.',
        'Mapear respuestas externas a modelos de dominio en español.',
        'Aislar el resto del sistema de cambios en contratos de backend.',
      ],
      archivosClave: [
        'analisis.repositorio.ts',
        'analisis.mapeador.ts',
        'analisis.dto.ts',
        'analisis.modelo.ts',
      ],
      importacionesPermitidas: ['@angular/common/http', 'datos/modelos', 'datos/dto'],
      importacionesProhibidas: ['presentacion/*', 'logica/* (no depende de capas superiores)'],
    },
    microservicios: {
      id: 'microservicios',
      nombre: 'Ecosistema de Microservicios',
      subtitulo: 'Motores de Inteligencia Artificial y Heurística',
      icono: '📡',
      color: '#bf5af2',
      responsabilidades: [
        'API Gateway Express :3001: 19 heurísticas y capturas DOM headless.',
        'Microservicio ML :8000: Random Forest con 15 features y Entropía.',
        'Microservicio IA :6000: Explicación pedagógica y micro-quizzes.',
      ],
      archivosClave: [
        'server.js (Express Gateway :3001)',
        'main.py (FastAPI Random Forest :8000)',
        'app.py (FastAPI Generative AI :6000)',
      ],
      importacionesPermitidas: ['Independiente de la UI / Arquitectura desacoplada'],
      importacionesProhibidas: ['Acceso directo sin pasar por el Repositorio Angular'],
    },
  };

  readonly listaPasos: PasoFlujo[] = [
    {
      numero: 1,
      capaOrigen: 'presentacion',
      capaDestino: 'logica',
      titulo: '1. Disparo de Evento en Presentación',
      subtitulo: 'El usuario ingresa la URL y pulsa "Analizar Sitio Web"',
      archivoResponsable: 'barra-busqueda.componente.ts → analizador.pagina.ts',
      descripcion:
        'El componente de presentación emite un evento `@Output() alBuscarUrl`. La página captura el evento y delega la ejecución al servicio inyectado mediante `inject(AnalisisServicio).analizarUrl(...)`. La vista pasa a estado reactivo cargando.',
      codigoSnippet: `// presentacion/paginas/analizador/analizador.pagina.ts
ejecutarAnalisis(url: string): void {
  this.servicioAnalisis.analizarUrl(url).subscribe({
    next: (resultado) => this.resultadoActual.set(resultado),
    error: (err) => this.servicioNotif.mostrar('Error al analizar', 'error')
  });
}`,
      payloadEjemplo: `{ urlIngresada: "https://banco-login-falso.xyz/login" }`,
      reglaArquitectura: 'El componente no contiene lógica de negocio ni peticiones HTTP directas.',
    },
    {
      numero: 2,
      capaOrigen: 'logica',
      capaDestino: 'datos',
      titulo: '2. Orquestación y Validación de Negocio',
      subtitulo: 'El servicio valida formato y solicita acceso a datos',
      archivoResponsable: 'analisis.servicio.ts',
      descripcion:
        'El servicio de lógica verifica que la URL no esté vacía, aplica formato seguro con protocolo https:// por defecto y llama al repositorio de datos `analisisRepositorio.analizarUrl(...)`. Además actualiza el signal `estaCargando.set(true)`.',
      codigoSnippet: `// logica/servicios/analisis.servicio.ts
analizarUrl(urlBruta: string): Observable<ResultadoAnalisis> {
  const urlSanitizada = this.normalizarUrl(urlBruta);
  this.estaCargando.set(true);
  return this.repositorio.analizarUrl(urlSanitizada).pipe(
    tap(resultado => this.guardarEnHistorial(resultado)),
    finalize(() => this.estaCargando.set(false))
  );
}`,
      payloadEjemplo: `{ urlSanitizada: "https://banco-login-falso.xyz/login", estaCargando: true }`,
      reglaArquitectura: 'La capa lógica no interactúa directamente con HttpClient ni manipula el DOM.',
    },
    {
      numero: 3,
      capaOrigen: 'datos',
      capaDestino: 'microservicios',
      titulo: '3. Emisión HTTP hacia los Microservicios',
      subtitulo: 'El Repositorio emite la petición HTTP POST /api/analizar',
      archivoResponsable: 'analisis.repositorio.ts',
      descripcion:
        'El repositorio inyecta HttpClient (`inject(HttpClient)`) y realiza la petición HTTP al Backend Gateway (puerto 3001). Espera la respuesta tipada en el contrato de red DTO `AnalisisRespuestaDto`.',
      codigoSnippet: `// datos/repositorios/analisis.repositorio.ts
analizarUrl(url: string): Observable<ResultadoAnalisis> {
  return this.http.post<AnalisisRespuestaDto>(
    \`\${this.urlBase}/analizar\`,
    { url }
  ).pipe(
    map(dto => this.mapeador.aModeloDominio(dto))
  );
}`,
      payloadEjemplo: `POST http://localhost:3001/api/analizar
Body: { "url": "https://banco-login-falso.xyz/login" }`,
      reglaArquitectura: 'El Repositorio es el único lugar de toda la aplicación que utiliza HttpClient.',
    },
    {
      numero: 4,
      capaOrigen: 'microservicios',
      capaDestino: 'datos',
      titulo: '4. Pipeline Heurístico + ML + IA',
      subtitulo: 'Inferencia de 15 features, Puppeteer y respuesta JSON',
      archivoResponsable: 'Microservicios (:3001, :8000, :6000)',
      descripcion:
        'El Gateway Node.js ejecuta Puppeteer para capturar screenshot y analizar DOM. Consulta el microservicio ML (:8000) calculando entropía de Shannon del dominio. El microservicio IA (:6000) genera recomendaciones pedagógicas. Retorna el payload JSON.',
      codigoSnippet: `// Backend JSON Response (analisis.dto.ts)
{
  "score": 9.4,
  "risk": "alto",
  "threatType": "phishing_bancario",
  "heuristics": { "entropy": 4.82, "punycode": false, "sslValid": false },
  "explanation": "Se detecta falsificación de marca bancaria...",
  "screenshotUrl": "/screenshots/captura_falsa_123.jpg"
}`,
      payloadEjemplo: `{ "score": 9.4, "risk": "alto", "heuristics": 19, "mlEntropy": 4.82 }`,
      reglaArquitectura: 'Los microservicios son agnósticos a la UI y retornan contratos estables.',
    },
    {
      numero: 5,
      capaOrigen: 'datos',
      capaDestino: 'logica',
      titulo: '5. Mapeo y Normalización Tipada en Español',
      subtitulo: 'Transformación del contrato DTO en Modelo de Dominio',
      archivoResponsable: 'analisis.mapeador.ts',
      descripcion:
        'El mapeador toma los campos en inglés del backend (`score`, `risk`, `threatType`) y los traduce de forma inmutable a propiedades en español del dominio (`puntuacion`, `riesgo`, `tipoAmenaza`). La capa lógica recibe únicamente el modelo limpio.',
      codigoSnippet: `// datos/mapeadores/analisis.mapeador.ts
aModeloDominio(dto: AnalisisRespuestaDto): ResultadoAnalisis {
  return {
    url: dto.url,
    puntuacion: dto.score,
    riesgo: this.mapearRiesgo(dto.risk),
    tipoAmenaza: dto.threatType || 'sospechoso',
    recomendaciones: dto.recommendations || [],
    marcaTiempo: new Date().toISOString()
  };
}`,
      payloadEjemplo: `{ url: "...", puntuacion: 9.4, riesgo: "alto", tipoAmenaza: "phishing_bancario" }`,
      reglaArquitectura: 'Los DTOs quedan confinados en la capa de datos; la lógica nunca ve los DTOs crudos.',
    },
    {
      numero: 6,
      capaOrigen: 'logica',
      capaDestino: 'presentacion',
      titulo: '6. Actualización Reactiva de Signals y Renderizado UI',
      subtitulo: 'La UI recibe el modelo y ejecuta animaciones Apple Design',
      archivoResponsable: 'analizador.pagina.ts → tarjeta-veredicto.componente.ts',
      descripcion:
        'El `AnalisisServicio` emite el `ResultadoAnalisis` al suscriptor del componente. El signal `resultadoActual.set(...)` se actualiza de inmediato, detonando el renderizado de la tarjeta de veredicto con física de resorte y badges de severidad.',
      codigoSnippet: `// presentacion/componentes/tarjeta-veredicto/tarjeta-veredicto.componente.ts
@Component({ ... })
export class TarjetaVeredictoComponente {
  @Input() resultado!: ResultadoAnalisis;
  // Plantilla reactiva con @switch (resultado.riesgo)
  // Aplica tokens de diseno: --color-peligro, --radio-grande
}`,
      payloadEjemplo: `Signal Actualizado: resultadoActual() = { riesgo: "alto", puntuacion: 9.4 }`,
      reglaArquitectura: 'Front desacoplado: La vista es puramente declarativa y reactiva.',
    },
  ];

  readonly pasoActual = computed(() => this.listaPasos[this.pasoActualIndex()]);

  readonly capaActivaOrigen = computed(() => this.pasoActual().capaOrigen);
  readonly capaActivaDestino = computed(() => this.pasoActual().capaDestino);

  ngOnDestroy(): void {
    this.detenerReproduccion();
  }

  iniciarReproduccion(): void {
    if (this.estaReproduciendo()) return;
    this.estaReproduciendo.set(true);

    this.temporizadorReproduccion = setInterval(() => {
      const siguiente = (this.pasoActualIndex() + 1) % this.listaPasos.length;
      this.pasoActualIndex.set(siguiente);
    }, 3200);
  }

  pausarReproduccion(): void {
    this.detenerReproduccion();
  }

  reiniciarFlujo(): void {
    this.detenerReproduccion();
    this.pasoActualIndex.set(0);
  }

  pasoSiguiente(): void {
    this.detenerReproduccion();
    const siguiente = (this.pasoActualIndex() + 1) % this.listaPasos.length;
    this.pasoActualIndex.set(siguiente);
  }

  pasoAnterior(): void {
    this.detenerReproduccion();
    const anterior = (this.pasoActualIndex() - 1 + this.listaPasos.length) % this.listaPasos.length;
    this.pasoActualIndex.set(anterior);
  }

  irAPaso(index: number): void {
    this.detenerReproduccion();
    this.pasoActualIndex.set(index);
  }

  inspeccionarCapa(capa: IdentificadorCapa): void {
    this.capaSeleccionadaParaInspeccion.set(capa);
  }

  cerrarInspeccionCapa(): void {
    this.capaSeleccionadaParaInspeccion.set(null);
  }

  alHacerClicFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrarInspeccionCapa();
    }
  }

  establecerUrlEjemplo(url: string): void {
    this.urlSeleccionada.set(url);
    this.reiniciarFlujo();
  }

  private detenerReproduccion(): void {
    if (this.temporizadorReproduccion) {
      clearInterval(this.temporizadorReproduccion);
      this.temporizadorReproduccion = null;
    }
    this.estaReproduciendo.set(false);
  }
}
