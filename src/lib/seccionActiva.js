import { useEffect, useState } from 'react'
import { SECCIONES } from '../data/secciones'

const ANCLAS = SECCIONES.map((s) => s.id)

/**
 * Id de la sección que cruza la línea del 40 % de la pantalla (null en la portada o fuera de
 * todas), para marcar la activa en la navegación y en el menú. Mide en cada scroll, una vez por
 * cuadro: funciona aunque las secciones se monten tarde (modo aislado ?solo=) o cambien de alto
 * (la sección fijada de «De plano a realidad»).
 *   const activa = useSeccionActiva()      // 'servicios' | 'obras' | … | null
 */
export function useSeccionActiva() {
  const [activa, setActiva] = useState(null)
  useEffect(() => {
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      const linea = window.innerHeight * 0.4
      let actual = null
      for (const id of ANCLAS) {
        const caja = document.getElementById(id)?.getBoundingClientRect()
        if (caja && caja.top <= linea && caja.bottom > linea) actual = id
      }
      setActiva(actual === 'inicio' ? null : actual)
    }
    const pedir = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      window.cancelAnimationFrame(cuadro)
    }
  }, [])
  return activa
}
