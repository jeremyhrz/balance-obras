import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Lenguaje de movimiento de Balance: las cosas SE CONSTRUYEN (líneas que se trazan, bloques que
 * se apilan, vigas que se deslizan). Todo anima transform, opacity, clip-path o stroke-dashoffset.
 * Con «reducir movimiento», <MotionConfig reducedMotion="user"> (Proveedores.jsx) apaga los
 * desplazamientos y quedan fundidos; lo que no sea transform (clip-path, pathLength, canvas,
 * autoplay) hay que resolverlo a mano con useMenosMovimiento().
 */

export const EXPO = [0.16, 1, 0.3, 1] // entradas: rápido y se posa suave
export const SUAVE = [0.22, 1, 0.36, 1] // respuestas a la interacción
export const VIGA = [0.65, 0, 0.35, 1] // una pieza pesada que se desliza: arranca y frena con peso
export const CAIDA = [0.55, 0, 0.9, 0.35] // cae acelerando (gravedad), para encadenar con un rebote

/** Resortes de framer-motion (transition={RESORTE.asentar}). */
export const RESORTE = {
  asentar: { type: 'spring', stiffness: 520, damping: 24, mass: 1 }, // pieza que cae y asienta con un rebote
  suave: { type: 'spring', stiffness: 170, damping: 26, mass: 0.8 }, // seguir al cursor, balanzas
  nivel: { type: 'spring', stiffness: 90, damping: 9, mass: 1.2 }, // burbuja de nivel / balanza que oscila
}

export const DURACION = {
  revelado: 1, // textos y fotos que aparecen (0,7–1,2 s)
  trazo: 1.2, // líneas, cotas y planos que se dibujan
  interaccion: 0.3, // respuesta a un toque o al cursor (0,25–0,4 s)
}

/** Opciones de `viewport` para whileInView: una sola vez, un poco antes del borde inferior. */
export const VISTA = { once: true, margin: '0px 0px -12% 0px' }

export const transicion = (extra) => ({ duration: DURACION.revelado, ease: EXPO, ...extra })

/** Variantes con estados `oculto` → `visible`. */
export const variantes = {
  // Sube y aparece.
  aparecer: {
    oculto: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: transicion() },
  },
  // Texto que sube desde una máscara (el padre lleva overflow hidden: clase .mascara).
  mascara: {
    oculto: { y: '120%' },
    visible: { y: '0%', transition: transicion() },
  },
  // Contenedor de foto que se destapa de abajo hacia arriba…
  foto: {
    oculto: { clipPath: 'inset(100% 0% 0% 0%)' },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: transicion({ duration: 1.2 }) },
  },
  // …mientras la foto de dentro se asienta de 1,2 a 1.
  fotoInterior: {
    oculto: { scale: 1.2 },
    visible: { scale: 1, transition: transicion({ duration: 1.4 }) },
  },
  // Bloque que se apila: cae un poco y asienta con un rebote corto.
  apilar: {
    oculto: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { ...RESORTE.asentar, opacity: { duration: 0.25 } } },
  },
  // Viga que entra deslizándose desde la izquierda.
  viga: {
    oculto: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: VIGA } },
  },
  // Línea que se traza de izquierda a derecha (dale origin-left).
  trazo: {
    oculto: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: DURACION.trazo, ease: VIGA } },
  },
  // Solo fundido (la alternativa con «reducir movimiento»).
  fundido: {
    oculto: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  },
}

/** Padre que escalona a sus hijos: `variants={escalonar(0.06)}`. */
export const escalonar = (escalon = 0.06, retraso = 0) => ({
  oculto: {},
  visible: { transition: { staggerChildren: escalon, delayChildren: retraso } },
})

/** true si el visitante pidió reducir el movimiento. */
export function useMenosMovimiento() {
  return useReducedMotion() ?? false
}

/** true en escritorio con ratón o trackpad (puntero fino que puede hacer hover). */
export function usePunteroFino() {
  return useMedia('(pointer: fine) and (hover: hover)')
}

/** true mientras la consulta de medios se cumpla: useMedia('(min-width: 1024px)'). */
export function useMedia(consulta) {
  const [cumple, setCumple] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const medio = window.matchMedia(consulta)
    const cambiar = () => setCumple(medio.matches)
    cambiar()
    medio.addEventListener('change', cambiar)
    return () => medio.removeEventListener('change', cambiar)
  }, [consulta])
  return cumple
}
