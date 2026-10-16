import { useEffect, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import { m, useInView } from 'framer-motion'
import { useMenosMovimiento } from '../lib/movimiento'

// Colores de cada variante: línea fina, línea mayor, textos de los ejes y cruces.
const TONOS = {
  carbon: { fina: 'rgb(236 234 229 / 0.045)', mayor: 'rgb(236 234 229 / 0.085)', texto: 'rgb(236 234 229 / 0.42)', cruz: 'rgb(201 164 92 / 0.55)', fondo: null },
  plano: { fina: 'rgb(111 164 219 / 0.13)', mayor: 'rgb(111 164 219 / 0.3)', texto: '#6FA4DB', cruz: 'rgb(111 164 219 / 0.75)', fondo: '#0D2742' },
  oro: { fina: 'rgb(201 164 92 / 0.06)', mayor: 'rgb(201 164 92 / 0.14)', texto: 'rgb(201 164 92 / 0.7)', cruz: 'rgb(201 164 92 / 0.7)', fondo: null },
}

const MASCARAS = {
  bordes: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 35%, transparent 100%)',
  abajo: 'linear-gradient(to bottom, #000 45%, transparent 100%)',
  arriba: 'linear-gradient(to top, #000 45%, transparent 100%)',
  lados: 'linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)',
}

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Retícula de plano de fondo (brief §3): líneas finas cada `paso` px y una marcada cada `mayor`
 * finas; con `ejes`, los ejes estructurales rotulados en círculos (A, B, C… arriba y 1, 2, 3… a la
 * izquierda), y con `cruces`, cruces de referencia en los cruces de las líneas marcadas.
 *
 *   <section className="relative"><Reticula /> …</section>                  sobre carbón, muy tenue
 *   <Reticula variante="plano" ejes cruces />                               fondo azul de plano con sus líneas
 *   <Reticula trazar desvanecer="bordes" />                                  las líneas se trazan al entrar en pantalla
 *   <Reticula variante="oro" paso={32} mayor={4} opacidad={0.6} />
 *
 * - `variante`: 'carbon' (líneas hueso, sin fondo) · 'plano' (pinta el azul #0D2742 y líneas
 *   #6FA4DB) · 'oro' (líneas doradas, sin fondo).
 * - `trazar`: las verticales crecen de arriba abajo y las horizontales de izquierda a derecha
 *   (clip-path), una vez, al entrar en pantalla; `alMontar` lo hace al montar (la intro).
 * - `desvanecer`: 'bordes' | 'abajo' | 'arriba' | 'lados' — se funde con el fondo (mask-image).
 * Va en absolute inset-0 (el padre necesita `relative`), no captura el puntero y es decorativa.
 */
export default function Reticula({
  variante = 'carbon',
  paso = 24,
  mayor = 5,
  ejes = false,
  cruces = false,
  trazar = false,
  alMontar = false,
  retraso = 0,
  desvanecer = false,
  opacidad = 1,
  className,
  style,
}) {
  const ref = useRef(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const visto = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const menos = useMenosMovimiento()
  const medida = useMedida(ref, ejes)
  const tono = TONOS[variante] ?? TONOS.carbon
  const modulo = paso * mayor
  const encendida = alMontar || visto

  const capa = (direccion) => ({
    backgroundImage: `linear-gradient(${direccion}, ${tono.mayor} 1px, transparent 1px), linear-gradient(${direccion}, ${tono.fina} 1px, transparent 1px)`,
    backgroundSize: `${modulo}px ${modulo}px, ${paso}px ${paso}px`,
  })

  const animar = trazar && !menos
  const dibujo = (oculto, inicio) =>
    animar
      ? {
          initial: { clipPath: oculto },
          animate: encendida ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined,
          transition: { duration: 1.5, ease: [0.65, 0, 0.35, 1], delay: retraso + inicio },
        }
      : trazar
        ? { initial: { opacity: 0 }, animate: encendida ? { opacity: 1 } : undefined, transition: { duration: 0.6, delay: retraso } }
        : {}

  const mascara = MASCARAS[desvanecer]

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{
        backgroundColor: tono.fondo ?? undefined,
        opacity: opacidad,
        WebkitMaskImage: mascara,
        maskImage: mascara,
        ...style,
      }}
    >
      <m.div className="absolute inset-0" style={capa('to right')} {...dibujo('inset(0% 0% 100% 0%)', 0)} />
      <m.div className="absolute inset-0" style={capa('to bottom')} {...dibujo('inset(0% 100% 0% 0%)', 0.15)} />

      {cruces && (
        <m.svg
          className="absolute inset-0 size-full"
          initial={animar ? { opacity: 0 } : false}
          animate={animar && encendida ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: retraso + 0.7 }}
        >
          <defs>
            <pattern id={`cruz-${uid}`} width={modulo} height={modulo} patternUnits="userSpaceOnUse" patternTransform={`translate(${-modulo / 2} ${-modulo / 2})`}>
              <path d={`M${modulo / 2 - 5} ${modulo / 2}h10M${modulo / 2} ${modulo / 2 - 5}v10`} stroke={tono.cruz} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#cruz-${uid})`} />
        </m.svg>
      )}

      {ejes && medida.ancho > 0 && (
        <m.div
          className="absolute inset-0"
          initial={animar ? { opacity: 0 } : false}
          animate={animar && encendida ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: retraso + 0.9 }}
        >
          {Array.from({ length: Math.floor(medida.ancho / modulo) }, (_, i) => i + 1).map((i) => (
            <Burbuja key={`c${i}`} x={i * modulo} y={14} color={tono.texto}>
              {LETRAS[(i - 1) % LETRAS.length]}
            </Burbuja>
          ))}
          {Array.from({ length: Math.floor(medida.alto / modulo) }, (_, i) => i + 1).map((i) => (
            <Burbuja key={`f${i}`} x={14} y={i * modulo} color={tono.texto}>
              {i}
            </Burbuja>
          ))}
        </m.div>
      )}
    </div>
  )
}

/** Círculo de eje con su rótulo, centrado en (x, y). */
function Burbuja({ x, y, color, children }) {
  return (
    <span
      className="anotacion absolute grid size-[18px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border !text-[7px] !tracking-normal"
      style={{ left: x, top: y, color, borderColor: color }}
    >
      {children}
    </span>
  )
}

/** Ancho y alto del elemento (solo si se necesitan: los ejes). */
function useMedida(ref, activo) {
  const [medida, setMedida] = useState({ ancho: 0, alto: 0 })
  useEffect(() => {
    const nodo = ref.current
    if (!activo || !nodo) return undefined
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      setMedida((m) => (m.ancho === Math.round(width) && m.alto === Math.round(height) ? m : { ancho: Math.round(width), alto: Math.round(height) }))
    })
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [ref, activo])
  return medida
}
