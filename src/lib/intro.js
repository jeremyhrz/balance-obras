import { useSyncExternalStore } from 'react'

/**
 * ¿Hay intro en esta carga? Solo la primera visita de la sesión y nunca con ?sinintro=1.
 * En el modo aislado (?solo=), solo si se pidió «Intro». ?intro=1 la fuerza siempre.
 * Se decide una vez al cargar y se anota en la sesión: al recargar ya no sale.
 *
 * La Intro llama a terminarIntro() cuando la portada empieza a destaparse (o si la tocan para
 * saltarla); la portada y la navegación esperan a useIntroTerminada() para hacer su entrada.
 */

const CLAVE = 'balance:intro-vista'
const RED_DE_SEGURIDAD_MS = 2600 // si la intro no avisa, la página no se queda esperando

function decidir() {
  if (typeof window === 'undefined') return false
  const parametros = new URLSearchParams(window.location.search)
  // ?intro=1 la fuerza (para enseñarla o probarla aunque la sesión ya la haya visto).
  if (parametros.get('intro') === '1') return true
  const solo = parametros.get('solo')
  if (solo) return solo.split(',').map((n) => n.trim()).includes('Intro')
  if (parametros.has('sinintro')) return false
  try {
    if (window.sessionStorage.getItem(CLAVE)) return false
    window.sessionStorage.setItem(CLAVE, '1')
  } catch {
    // sin sessionStorage: la intro sale (es corta y se puede saltar)
  }
  return true
}

export const HAY_INTRO = decidir()

let terminada = !HAY_INTRO
const oyentes = new Set()

/** Avisa a quien espera la intro (portada, navegación…). Llamarla de más no hace nada. */
export function terminarIntro() {
  if (terminada) return
  terminada = true
  oyentes.forEach((avisar) => avisar())
}

if (HAY_INTRO) window.setTimeout(terminarIntro, RED_DE_SEGURIDAD_MS)

const suscribir = (avisar) => {
  oyentes.add(avisar)
  return () => oyentes.delete(avisar)
}

/** true cuando la intro ya terminó (o si no hay intro). */
export function useIntroTerminada() {
  return useSyncExternalStore(suscribir, () => terminada)
}
