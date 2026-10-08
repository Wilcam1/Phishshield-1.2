/**
 * decisionEngine.js
 * -----------------
 * Motor de decisión y priorización de riesgo para PhishShield (Punto 5).
 * Combina la puntuación forense (forensicEngine) con la probabilidad inferida por el
 * modelo Random Forest (servicio ML) para determinar el nivel de riesgo final
 * (ALTO, MEDIO, BAJO), aplicando la regla de piso (Score Floor).
 */

/** Configuración de ponderaciones y umbrales por defecto */
export const OPCIONES_POR_DEFECTO = {
  pesoMl: 10,           // Factor multiplicador sobre la probabilidad de phishing [0.0 - 1.0]
  pisoPuntuacion: 5,     // Puntuación mínima de seguridad requerida ante sospecha
  umbralAlto: 20,       // Límite para clasificar como riesgo ALTO
  umbralMedio: 10,      // Límite para clasificar como riesgo MEDIO
};

/**
 * Evalúa el riesgo consolidado de una URL analizada.
 * @param {object} resultadoForense Objeto con puntuación y características del análisis forense.
 * @param {object} resultadoMl Objeto con la predicción y probabilidad del microservicio ML.
 * @param {object} [opcionesPersonalizadas] Opciones de configuración para sobrescribir umbrales.
 * @returns {object} Evaluación completa de riesgo con nivel, detalles y regla de piso.
 */
export function evaluarRiesgo(resultadoForense, resultadoMl, opcionesPersonalizadas = {}) {
  const configuracion = { ...OPCIONES_POR_DEFECTO, ...opcionesPersonalizadas };

  const puntuacionForense = resultadoForense?.puntuacionTotal ?? resultadoForense?.score ?? 0;
  const probabilidadMl = resultadoMl?.probabilidadPhishing ?? resultadoMl?.phishing_probability ?? 0;

  // Ponderación de la probabilidad devuelta por el modelo ML
  const puntuacionMl = probabilidadMl * configuracion.pesoMl;

  let puntuacionTotal = puntuacionForense + puntuacionMl;
  let pisoAplicado = false;

  // Regla de piso (Score Floor): si la heurística forense es baja pero el modelo predice alto riesgo,
  // se eleva la puntuación al piso mínimo configurado para evitar falsos negativos críticos.
  if (puntuacionForense < configuracion.pisoPuntuacion && probabilidadMl >= 0.5) {
    puntuacionTotal = Math.max(puntuacionTotal, configuracion.pisoPuntuacion + puntuacionMl);
    pisoAplicado = true;
  }

  // Determinación del nivel de riesgo en función de los umbrales
  let nivelRiesgo;
  if (puntuacionTotal >= configuracion.umbralAlto) {
    nivelRiesgo = 'ALTO';
  } else if (puntuacionTotal >= configuracion.umbralMedio) {
    nivelRiesgo = 'MEDIO';
  } else {
    nivelRiesgo = 'BAJO';
  }

  // Generación de detalles descriptivos para el panel SOC
  const detalles = [
    `Puntuación forense base: ${puntuacionForense}`,
    `Probabilidad inferida por ML: ${(probabilidadMl * 100).toFixed(1)}%`,
    `Puntuación ML ponderada: ${puntuacionMl.toFixed(2)}`,
    `Puntuación combinada total: ${puntuacionTotal.toFixed(2)}`,
  ];

  if (pisoAplicado) {
    detalles.push(`Regla de piso aplicada: elevada al mínimo de ${configuracion.pisoPuntuacion} por discrepancia`);
  }

  return {
    puntuacionTotal: Number(puntuacionTotal.toFixed(2)),
    nivelRiesgo,
    detalles,
    pisoAplicado,
    // Compatibilidad retroactiva
    totalScore: Number(puntuacionTotal.toFixed(2)),
    riskLevel: nivelRiesgo,
    details: detalles,
    appliedFloor: pisoAplicado,
  };
}

/**
 * Normaliza la respuesta sin procesar devuelta por el microservicio de Machine Learning.
 * @param {object} respuestaBruta Objeto JSON devuelto por la API FastAPI.
 * @returns {object} Formato normalizado en español.
 */
export function normalizarResultadoMl(respuestaBruta) {
  if (!respuestaBruta) {
    return { prediccion: null, probabilidadPhishing: 0 };
  }

  const prediccion = respuestaBruta.prediccion ?? respuestaBruta.prediction ?? 0;
  const probabilidadPhishing =
    typeof respuestaBruta.probabilidadPhishing === 'number'
      ? respuestaBruta.probabilidadPhishing
      : typeof respuestaBruta.phishing_probability === 'number'
      ? respuestaBruta.phishing_probability
      : 0;

  return {
    prediccion,
    probabilidadPhishing,
    // Compatibilidad
    prediction: prediccion,
    phishing_probability: probabilidadPhishing,
  };
}

// Alias de compatibilidad
export const evaluateRisk = evaluarRiesgo;
export const normalizeMlResult = normalizarResultadoMl;
