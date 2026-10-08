// decisionEngine.js
// --------------------
// Motor de decisión y priorización de riesgo (Punto 5).
// Combina el score del motor forense (forensicEngine) y la probabilidad del modelo
// Random Forest (servicio ML) para asignar un nivel de riesgo (ALTO, MEDIO, BAJO).
//
// Configuración básica (puede sobrescribirse en tiempo de ejecución):
//   - mlWeight: peso aplicado a la probabilidad de phishing devuelta por el modelo.
//   - scoreFloor: puntuación mínima que fuerza al menos riesgo MEDIO.
//   - highThreshold, mediumThreshold: límites de puntuación total para los niveles.
//
// Exporta la función principal `evaluateRisk` que recibe:
//   - forensicResult: objeto devuelto por `runAllValidations` (score, features, details).
//   - mlResult: objeto `{ prediction: 0|1, phishing_probability: number (0‑1) }`.
//   - options (opcional) con los parámetros de configuración.
// Devuelve:
//   {
//     totalScore: number,
//     riskLevel: "ALTO"|"MEDIO"|"BAJO",
//     details: [...],
//     appliedFloor: boolean
//   }

/** Default configuration */
const DEFAULT_OPTIONS = {
  mlWeight: 10, // peso multiplicador para la probabilidad ML
  scoreFloor: 5, // puntuación mínima que eleva a al menos MEDIO
  highThreshold: 20,
  mediumThreshold: 10,
};

/**
 * Calcula el score combinado y determina el nivel de riesgo.
 * @param {Object} forensicResult Resultado del motor forense.
 * @param {Object} mlResult Resultado del modelo ML.
 * @param {Object} [options] Configuración opcional.
 * @returns {Object} Evaluación de riesgo.
 */
export function evaluateRisk(forensicResult, mlResult, options = {}) {
  const cfg = { ...DEFAULT_OPTIONS, ...options };

  // Score forense ya está normalizado (≈0‑30). Convertimos la probabilidad ML a una escala
  // comparable mediante multiplicación por mlWeight.
  const mlScore = (mlResult.phishing_probability || 0) * cfg.mlWeight;

  // Score total antes de aplicar floor.
  let totalScore = forensicResult.score + mlScore;
  let appliedFloor = false;

  // Aplicar regla de piso: si el score forense < scoreFloor, elevar totalScore al menos a
  // (scoreFloor + mlScore) para evitar que un bajo score forense haga que el riesgo sea bajo
  // pese a una alta probabilidad ML.
  if (forensicResult.score < cfg.scoreFloor) {
    totalScore = Math.max(totalScore, cfg.scoreFloor + mlScore);
    appliedFloor = true;
  }

  // Determinar nivel de riesgo según umbrales.
  let riskLevel;
  if (totalScore >= cfg.highThreshold) {
    riskLevel = "ALTO";
  } else if (totalScore >= cfg.mediumThreshold) {
    riskLevel = "MEDIO";
  } else {
    riskLevel = "BAJO";
  }

  // Compilamos detalles útiles para el frontend.
  const details = [];
  details.push(`Score forense = ${forensicResult.score}`);
  details.push(`Probabilidad ML = ${mlResult.phishing_probability?.toFixed(3) ?? "N/A"}`);
  details.push(`Score ML ponderado = ${mlScore.toFixed(2)}`);
  details.push(`Score total = ${totalScore.toFixed(2)}`);
  if (appliedFloor) details.push(`Regla de piso aplicada (score forense < ${cfg.scoreFloor})`);

  return {
    totalScore: Number(totalScore.toFixed(2)),
    riskLevel,
    details,
    appliedFloor,
  };
}

/**
 * Helper para transformar la respuesta del micro‑servicio ML.
 * Expected format: { prediction: 0|1, phishing_probability: number }.
 */
export function normalizeMlResult(raw) {
  if (!raw) return { prediction: null, phishing_probability: 0 };
  return {
    prediction: raw.prediction,
    phishing_probability: typeof raw.phishing_probability === "number" ? raw.phishing_probability : 0,
  };
}

/**
 * Ejemplo de uso (para pruebas unitarias):
 *
 * import { evaluateRisk, normalizeMlResult } from './decisionEngine.js';
 * const forensic = { score: 12, details: [], features: {} };
 * const mlRaw = { prediction: 1, phishing_probability: 0.78 };
 * const ml = normalizeMlResult(mlRaw);
 * const result = evaluateRisk(forensic, ml);
 * console.log(result);
 */
