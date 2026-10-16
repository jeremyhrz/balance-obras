import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Layout animado (FLIP) sin el paquete de layout de framer-motion: cuando cambia `clave` (el
 * filtro activo del portafolio, el orden de una lista…), los hijos de `ref` marcados con
 * data-flip="<id estable>" que ya estaban se DESLIZAN de su sitio viejo al nuevo, y los que
 * aparecen entran con un fundido y una escala corta. Solo transform y opacity, con la Web
 * Animations API del navegador (0 KB de librería). Con «reducir movimiento» no anima.
 *
 *   const grilla = useRef(null)
 *   useFlip(grilla, filtro)
 *   <ul ref={grilla} className="grid …">
 *     {visibles.map((obra) => <li key={obra.id} data-flip={obra.id}>…</li>)}
 *   </ul>
 *
 * Los que SALEN desaparecen al instante; si quieres que se vayan con animación, envuélvelos en
 * <AnimatePresence mode="popLayout"> con su `exit` (los saca del flujo y el resto se acomoda).
 * Opciones: { duracion = 0.7 (s), curva = 'cubic-bezier(0.16, 1, 0.3, 1)', escalonar = 0.03 (s entre entradas) }.
 */
export function useFlip(ref, clave, { duracion = 0.7, curva = 'cubic-bezier(0.16, 1, 0.3, 1)', escalonar = 0.03 } = {}) {
  const anteriores = useRef(new Map())
  const primera = useRef(true)

  useLayoutEffect(() => {
    const contenedor = ref.current
    if (!contenedor) return
    const elementos = [...contenedor.querySelectorAll('[data-flip]')]
    // Una animación a medias movería la medida: se cancelan antes de medir.
    for (const el of elementos) el.getAnimations?.().forEach((a) => a.cancel())
    const ahora = medir(contenedor, elementos)
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!primera.current && !reducir && typeof Element.prototype.animate === 'function') {
      let nuevos = 0
      for (const el of elementos) {
        const antes = anteriores.current.get(el.dataset.flip)
        const despues = ahora.get(el.dataset.flip)
        if (antes) {
          const dx = antes.x - despues.x
          const dy = antes.y - despues.y
          const sx = despues.ancho ? antes.ancho / despues.ancho : 1
          const sy = despues.alto ? antes.alto / despues.alto : 1
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) continue
          el.animate(
            [
              { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
              { transformOrigin: '0 0', transform: 'none' },
            ],
            { duration: duracion * 1000, easing: curva },
          )
        } else {
          el.animate(
            [
              { opacity: 0, transform: 'scale(0.94)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: duracion * 1000, easing: curva, delay: nuevos * escalonar * 1000, fill: 'backwards' },
          )
          nuevos += 1
        }
      }
    }
    primera.current = false
    anteriores.current = ahora
  }, [ref, clave, duracion, curva, escalonar])

  // Si el contenedor cambia de tamaño (giro del teléfono, ventana), se vuelve a medir sin animar.
  useEffect(() => {
    const contenedor = ref.current
    if (!contenedor) return undefined
    const observador = new ResizeObserver(() => {
      anteriores.current = medir(contenedor, [...contenedor.querySelectorAll('[data-flip]')])
    })
    observador.observe(contenedor)
    return () => observador.disconnect()
  }, [ref])
}

/** Posición y tamaño de cada elemento, relativos al contenedor (el scroll no les afecta). */
function medir(contenedor, elementos) {
  const base = contenedor.getBoundingClientRect()
  return new Map(
    elementos.map((el) => {
      const caja = el.getBoundingClientRect()
      return [el.dataset.flip, { x: caja.left - base.left, y: caja.top - base.top, ancho: caja.width, alto: caja.height }]
    }),
  )
}
