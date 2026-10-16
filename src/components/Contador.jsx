import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'
import { formatearEntero } from '../lib/texto'

/**
 * Número que sube hasta `valor` la primera vez que entra en pantalla, o que sigue a un valor en
 * movimiento (el avance de la obra ligado al scroll).
 *
 *   <Contador valor={10} prefijo="+" />                         → «+10» (cuenta de 0 a 10)
 *   <Contador valor={1200} sufijo=" m²" duracion={1.2} retraso={0.2} />
 *   <Contador movimiento={avance} sufijo=" %" />                → sigue a un MotionValue (0–100) sin animar por su cuenta
 *   <Contador valor={0.35} formato={(n) => `${Math.round(n * 100)} %`} />
 *
 * Escribe directo en el DOM (sin re-render por cuadro). Lectores de pantalla: el valor final; con
 * `movimiento`, el número visible (no se anuncia en cada cambio).
 */
export default function Contador({
  valor = 0,
  movimiento,
  formato = (n) => formatearEntero(n),
  prefijo = '',
  sufijo = '',
  duracion = 1.8,
  retraso = 0,
  className,
}) {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const menos = useMenosMovimiento()
  const formatoRef = useRef(formato)
  formatoRef.current = formato
  const escribir = (n) => `${prefijo}${formatoRef.current(n)}${sufijo}`

  // Con un MotionValue: escribe cada cambio, sin animación propia.
  useEffect(() => {
    const nodo = ref.current
    if (!nodo || !movimiento) return undefined
    nodo.textContent = escribir(movimiento.get())
    return movimiento.on('change', (n) => {
      nodo.textContent = escribir(n)
    })
  }, [movimiento]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sin él: cuenta de 0 a `valor` al entrar en pantalla.
  useEffect(() => {
    const nodo = ref.current
    if (!nodo || movimiento) return undefined
    if (!visto || menos) {
      nodo.textContent = escribir(visto || menos ? valor : 0)
      return undefined
    }
    const control = animate(0, valor, {
      duration: duracion,
      delay: retraso,
      ease: EXPO,
      onUpdate: (n) => {
        nodo.textContent = escribir(n)
      },
    })
    return () => control.stop()
  }, [visto, menos, valor, duracion, retraso, movimiento]) // eslint-disable-line react-hooks/exhaustive-deps

  const inicial = movimiento ? movimiento.get() : menos ? valor : 0
  return (
    <span className={className}>
      {!movimiento && <span className="sr-only">{`${prefijo}${formato(valor)}${sufijo}`}</span>}
      <span ref={ref} aria-hidden={movimiento ? undefined : 'true'} className="tabular-nums">
        {`${prefijo}${formato(inicial)}${sufijo}`}
      </span>
    </span>
  )
}
