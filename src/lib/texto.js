/**
 * Utilidades para los textos de src/data/balance.js, que marcan el énfasis con *asteriscos*.
 * JS puro (se prueba con node).
 */

/** Separa «Construimos *con balance*» en tramos [{ texto, enfasis }]. */
export function partirEnfasis(texto) {
  return String(texto ?? '')
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((tramo) =>
      tramo.startsWith('*') && tramo.endsWith('*')
        ? { texto: tramo.slice(1, -1), enfasis: true }
        : { texto: tramo, enfasis: false },
    )
}

/** El texto sin los asteriscos (para aria-label, alt, mensajes…). */
export function textoPlano(texto) {
  return String(texto ?? '').replace(/\*/g, '')
}

/** 1200 → «1.200» (separador de miles venezolano, escrito a mano: igual en todos los navegadores). */
export function formatearEntero(numero) {
  const n = Math.round(Number(numero) || 0)
  const signo = n < 0 ? '-' : ''
  return signo + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
