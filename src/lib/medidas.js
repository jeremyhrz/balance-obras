import { TAMANO } from '../data/balance.js'
import { formatearEntero } from './texto.js'

/**
 * El control deslizante del tamaño del cotizador (paso 3), en escala logarítmica: la posición
 * (0–1000) se reparte entre TAMANO.min y TAMANO.max de modo que 10, 100 y 1.000 m² queden
 * igual de separados. Los valores se redondean a números «de obra» (5, 10, 25, 50…).
 * JS puro (se prueba con node).
 *
 *   <input type="range" min={0} max={POSICIONES} value={posicionDesdeTamano(m2)}
 *          onChange={(e) => setM2(tamanoDesdePosicion(+e.target.value))} />
 *   formatearArea(1200)   → '1.200 m²'
 */

export const POSICIONES = 1000

const lnMin = Math.log(TAMANO.min)
const lnMax = Math.log(TAMANO.max)

/** Redondea a un paso que crece con el tamaño: 5 (hasta 50), 10 (hasta 200), 25, 50, 100, 250. */
export function redondearTamano(m2) {
  const v = Math.min(TAMANO.max, Math.max(TAMANO.min, Number(m2) || TAMANO.min))
  const paso = v <= 50 ? 5 : v <= 200 ? 10 : v <= 500 ? 25 : v <= 1000 ? 50 : v <= 2500 ? 100 : 250
  return Math.min(TAMANO.max, Math.max(TAMANO.min, Math.round(v / paso) * paso))
}

/** Posición del deslizador (0–POSICIONES) → m² redondeados. */
export function tamanoDesdePosicion(posicion) {
  const t = Math.min(1, Math.max(0, Number(posicion) / POSICIONES))
  return redondearTamano(Math.exp(lnMin + t * (lnMax - lnMin)))
}

/** m² → posición del deslizador (0–POSICIONES). */
export function posicionDesdeTamano(m2) {
  const v = Math.min(TAMANO.max, Math.max(TAMANO.min, Number(m2) || TAMANO.min))
  return Math.round(((Math.log(v) - lnMin) / (lnMax - lnMin)) * POSICIONES)
}

/** 1200 → '1.200 m²' (espacio normal antes de la unidad). */
export function formatearArea(m2) {
  return `${formatearEntero(m2)} ${TAMANO.unidad}`
}
