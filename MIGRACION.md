# 🔄 Registro de Migración y Equivalencias: MIGRACION.md

Este documento detalla la tabla de equivalencias técnicas entre el código original y la nueva arquitectura en Angular con nombres 100% en español.

---

## 1. Tabla General de Equivalencias de Archivos y Responsabilidades

| Elemento Original | Capa Nueva | Ruta y Archivo Nuevo | Identificador / Clase Nueva | Razón del Cambio |
| :--- | :--- | :--- | :--- | :--- |
| `apiClient.js` (`analyzeUrl`, `reportUrl`, `getStats`) | **Datos** | `datos/repositorios/analisis.repositorio.ts` | `AnalisisRepositorio` | Desacopla el acceso HTTP al analizador y estadísticas. Solo maneja llamadas remotas y mapeo. |
| `apiClient.js` (`adminLogin`, `adminGetReports`, etc.) | **Datos** | `datos/repositorios/administracion.repositorio.ts` | `AdministracionRepositorio` | Centraliza los endpoints administrativos protegidos por token. |
| *Payload crudo de API* | **Datos** | `datos/dto/analisis.dto.ts` | `AnalisisRespuestaDto`, `SolicitudAnalisisDto` | Contratos tipados del backend con tolerancia a variaciones en nombres de claves. |
| *Payload de auditoría y login* | **Datos** | `datos/dto/administracion.dto.ts` | `InicioSesionPeticionDto`, `EstadisticasRespuestaDto` | Contratos de petición y respuesta de administración. |
| *Objetos anónimos JS* | **Datos** | `datos/modelos/analisis.modelo.ts` | `ResultadoAnalisis`, `InspeccionSsl`, `InspeccionDom` | Modelos de dominio puros e inmutables usados en la UI y lógica. |
| *Objetos admin anónimos* | **Datos** | `datos/modelos/administracion.modelo.ts` | `CredencialesAdministrador`, `ElementoHistorialGlobal` | Modelos puros para auditoría, reportes y sesión. |
| *Objetos stats anónimos* | **Datos** | `datos/modelos/estadisticas.modelo.ts` | `EstadisticasSoc`, `DistribucionRiesgo` | Modelos de métricas del centro de operaciones. |
| *Parseo disperso en UI* | **Datos** | `datos/mapeadores/analisis.mapeador.ts` | `AnalisisMapeador` | Mapeo puro de DTOs a modelos de dominio, aislando cambios del backend. |
| *Transformaciones admin* | **Datos** | `datos/mapeadores/administracion.mapeador.ts` | `AdministracionMapeador` | Transforma respuestas de auditoría a modelos en español. |
| `storage.js` | **Datos** | `datos/fuentes/almacenamiento-local.fuente.ts` | `AlmacenamientoLocalFuente` | Acceso seguro y tipado a `localStorage` que previene excepciones en SSR/entornos sin ventana. |
| `app.js` (`analyzeUrl`, `reportUrl`) | **Lógica** | `logica/servicios/analisis.servicio.ts` | `AnalisisServicio` | Orquesta el análisis, estado reactivo (`signal`), enriquecimiento con consejos y guardado local. |
| `adminManager.js` (control y KPIs) | **Lógica** | `logica/servicios/administracion.servicio.ts` | `AdministracionServicio` | Orquesta sesión, auditoría, KPIs en vivo y exportaciones a CSV y JSON. |
| `tipsEngine.js` | **Lógica** | `logica/servicios/motor-consejos.servicio.ts` | `MotorConsejosServicio` | Reglas de negocio puras para asociar indicadores con consejos pedagógicos. |
| *Token en instancia de clase* | **Lógica** | `logica/estado/sesion.estado.ts` | `SesionEstado` | Señales reactivas (`token`, `estaAutenticado`) sincronizadas con almacenamiento seguro. |
| *Tema en clase body directa* | **Lógica** | `logica/estado/tema.estado.ts` | `TemaEstado` | Señal reactiva (`tema`, `alternarTema`) con sincronización en `localStorage` y `prefers-color-scheme`. |
| *Sin guardias (modal oculto)* | **Lógica** | `logica/guardias/autenticacion.guardia.ts` | `autenticacionGuardia` | Protege la ruta `/panel-soc` redirigiendo al analizador si no hay sesión activa. |
| *Encabezados manuales fetch* | **Lógica** | `logica/interceptores/autenticacion.interceptor.ts` | `autenticacionInterceptor` | Inyecta automáticamente el encabezado `Authorization: Bearer <token>`. |
| *Validación regex en input* | **Lógica** | `logica/validadores/contrasena.validador.ts` | `evaluarSeguridadContrasena` | Validador reactivo de 4 criterios de seguridad (longitud, mayúscula, número y símbolo). |
| *Validación URL en UI* | **Lógica** | `logica/validadores/url.validador.ts` | `validadorUrl` | Validador tipado de estructuras de URL seguras. |
| `styles.css` (variables root) | **Presentación** | `presentacion/diseno/tokens.scss` | Tokens SCSS (`--color-fondo`, etc.) | Tokens de diseño de Apple Design: translucidez, física de resortes y escala óptica. |
| `uiManager.js` (input URL) | **Presentación** | `presentacion/componentes/barra-busqueda/` | `BarraBusquedaComponente` | Componente delgado de entrada de enlace con estados de carga y botón de limpiar. |
| `uiManager.js` (veredicto, score) | **Presentación** | `presentacion/componentes/tarjeta-veredicto/` | `TarjetaVeredictoComponente` | Renderizado de veredicto con medidor animado y acción de copiar resultado. |
| `uiManager.js` (screenshot) | **Presentación** | `presentacion/componentes/visor-captura/` | `VisorCapturaComponente` | Visualizador de captura de página con notas sobre técnicas antibot. |
| `uiManager.js` (explicación IA) | **Presentación** | `presentacion/componentes/asistente-educativo/` | `AsistenteEducativoComponente` | Tarjeta con explicación adaptativa y recomendación. |
| `uiManager.js` (micro quiz) | **Presentación** | `presentacion/componentes/cuestionario-interactivo/` | `CuestionarioInteractivoComponente` | Desafío interactivo de 30 segundos con feedback instantáneo y retroalimentación. |
| `uiManager.js` (detalles grid) | **Presentación** | `presentacion/componentes/desglose-tecnico/` | `DesgloseTecnicoComponente` | Acordeón fluido con las 19 validaciones y detalles SSL/DOM. |
| `tipsEngine.js` (renderizado tips) | **Presentación** | `presentacion/componentes/lista-consejos/` | `ListaConsejosComponente` | Tarjetas didácticas con animación de entrada física escalonada. |
| `index.html` (botones de demo) | **Presentación** | `presentacion/componentes/zona-pruebas/` | `ZonaPruebasComponente` | Botones de demostración rápida interactiva para casos típicos. |
| `uiManager.js` (historial) | **Presentación** | `presentacion/componentes/historial-busquedas/` | `HistorialBusquedasComponente` | Lista interactiva de búsquedas recientes con acción de reanálisis y limpieza. |
| `index.html` (darkToggle) | **Presentación** | `presentacion/componentes/selector-tema/` | `SelectorTemaComponente` | Botón físico con rotación y resorte para alternar modo claro/oscuro. |
| `uiManager.js` (`showNotification`) | **Presentación** | `presentacion/componentes/notificacion-flotante/` | `NotificacionFlotanteComponente` | Notificación estilo Apple flotante (Dynamic Island). |
| `index.html` (panel de estadísticas) | **Presentación** | `presentacion/componentes/panel-metricas/` | `PanelMetricasComponente` | Tarjetas KPI interactivas para análisis de tendencias. |
| `adminManager.js` (gráfico donut) | **Presentación** | `presentacion/componentes/grafico-distribucion-riesgo/` | `GraficoDistribucionRiesgoComponente` | Donut reactivo con gradiente cónico y porcentajes calculados. |
| `adminManager.js` (modal login) | **Presentación** | `presentacion/componentes/dialogo-autenticacion-admin/` | `DialogoAutenticacionAdminComponente` | Modal de login accesible con validación. |
| `adminManager.js` (modal cambio clave)| **Presentación** | `presentacion/componentes/dialogo-cambio-contrasena/` | `DialogoCambioContrasenaComponente` | Modal interactivo con validación de requisitos en tiempo real. |
| `index.html` (modal URLs) | **Presentación** | `presentacion/componentes/dialogo-urls-categoria/` | `DialogoUrlsCategoriaComponente` | Modal para explorar URLs filtradas según el KPI pulsado. |
| `adminManager.js` (tabla global) | **Presentación** | `presentacion/componentes/tabla-historial-global/` | `TablaHistorialGlobalComponente` | Tabla con auditoría completa, eliminación y exportación a CSV. |
| `adminManager.js` (reportes) | **Presentación** | `presentacion/componentes/lista-alertas-comunitarias/` | `ListaAlertasComunitariasComponente` | Lista de reportes comunitarios con descarte de falsos positivos y exportación a JSON. |
| `index.html` (SPA monolítica) | **Presentación** | `presentacion/paginas/analizador/` | `AnalizadorPaginaComponente` | Vista pública principal ruteable en `/analizador`. |
| `adminDashboardModal` | **Presentación** | `presentacion/paginas/panel-soc/` | `PanelSocPaginaComponente` | Vista privada ruteable en `/panel-soc`. |

---

## 2. Equivalencias de Variables y Métodos

| Identificador Original | Equivalente en la Nueva Arquitectura | Capa |
| :--- | :--- | :--- |
| `analyzeUrl(url)` | `analizarUrl(url: string)` | `Logica (AnalisisServicio)` / `Datos (AnalisisRepositorio)` |
| `reportUrl(url)` | `reportarUrl(url: string)` | `Logica (AnalisisServicio)` / `Datos (AnalisisRepositorio)` |
| `getStats()` | `obtenerEstadisticas()` | `Datos (AnalisisRepositorio)` |
| `getHistory(limit)` | `obtenerHistorial(limite)` | `Datos (AnalisisRepositorio)` |
| `adminLogin(u, p)` | `iniciarSesion(credenciales)` | `Logica (AdministracionServicio)` |
| `adminGetReports()` | `obtenerReportes()` | `Datos (AdministracionRepositorio)` |
| `adminGetHistory()` | `obtenerHistorialCompleto()` | `Datos (AdministracionRepositorio)` |
| `adminDeleteReport(d)` | `descartarReporte(dominio)` | `Logica (AdministracionServicio)` |
| `adminDeleteHistory(u)` | `eliminarRegistroHistorial(url)`| `Logica (AdministracionServicio)` |
| `adminChangePassword(o, n)` | `cambiarContrasena(solicitud)` | `Logica (AdministracionServicio)` |
| `exportReportsJson()` | `exportarReportesJson()` | `Logica (AdministracionServicio)` |
| `exportHistoryCsv()` | `exportarHistorialCsv()` | `Logica (AdministracionServicio)` |
| `generateTips(result)` | `generarConsejos(analisis)` | `Logica (MotorConsejosServicio)` |
| `saveToHistory(url, risk)` | `guardarEnHistorialLocal(url, riesgo)` | `Logica (AnalisisServicio)` |
| `clearHistory()` | `limpiarHistorialLocal()` | `Logica (AnalisisServicio)` |
| `showNotification(msg, type)` | `mostrar(mensaje, tipo)` | `Logica (NotificacionServicio)` |
| `token` | `token()` (Signal de lectura) | `Logica (SesionEstado)` |
