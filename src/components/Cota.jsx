import { useRef } from 'react'
import clsx from 'clsx'
import { m, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useMenosMovimiento } from '../lib/movimiento'

const TONOS = {
  oro: { linea: 'bg-oro/80', texto: 'text-oro' },
  plano: { linea: 'bg-plano-linea/80', texto: 'text-plano-linea' },
  hueso: { linea: 'bg-hueso/50', texto: 'text-hueso/80' },
}

/**
 * Línea de cota de plano (brief §3): dos marcas en los extremos, la línea entre ellas y la medida
 * en el centro. Se TRAZA desde el centro hacia los extremos al entrar en pantalla, o siguiendo un
 * MotionValue (el scroll de «De plano a realidad»).
 *
 *   <Cota medida="12,40 m" className="w-full" />                          horizontal: ocupa el ancho que le des
 *   <Cota medida="N+3.20" orientacion="vertical" className="h-64" />      vertical: ocupa el alto que le des
 *   <Cota medida="8,00 m" progreso={avance} />                            dibujada por un MotionValue 0–1
 *   <Cota medida="Ø12 @ 20 cm" tono="plano" remate="flecha" retraso={0.4} />
 *
 * - `tono`: 'oro' (por defecto) · 'plano' (sobre el azul de plano) · 'hueso'.
 * - `remate`: 'barra' (trazo oblicuo de arquitectura, por defecto) · 'flecha'.
 * - `lado`: dónde va la medida — 'arriba' (por defecto) | 'abajo' en horizontal; 'izquierda' |
 *   'derecha' en vertical (se lee de abajo arriba).
 * - `alMontar`: se traza al montar, sin esperar a verse · `retraso` / `duracion` en segundos.
 * Es decorativa para los lectores de pantalla salvo que pases `etiquetaAccesible`.
 */
export default function Cota({
  medida,
  orientacion = 'horizontal',
  tono = 'oro',
  remate = 'barra',
  lado,
  progreso,
  alMontar = false,
  retraso = 0,
  duracion = 1.1,
  etiquetaAccesible,
  className,
}) {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const menos = useMenosMovimiento()
  const vertical = orientacion === 'vertical'
  const colores = TONOS[tono] ?? TONOS.oro
  const encendida = alMontar || visto
  const dondeTexto = lado ?? (vertical ? 'izquierda' : 'arriba')

  // Con `progreso`, todo sale de ese valor; si no, de whileInView/animate.
  const completo = useMotionValue(1)
  const fuente = progreso ?? completo
  const escala = useTransform(fuente, [0, 1], [0, 1])
  const marcas = useTransform(fuente, [0.8, 1], [0, 1])
  const texto = useTransform(fuente, [0.45, 0.9], [0, 1])

  const ligado = Boolean(progreso)
  const animar = !ligado && !menos
  const ejeEscala = vertical ? 'scaleY' : 'scaleX'

  const linea = ligado
    ? { style: { [ejeEscala]: escala } }
    : animar
      ? {
          initial: { [ejeEscala]: 0 },
          animate: encendida ? { [ejeEscala]: 1 } : undefined,
          transition: { duration: duracion, ease: [0.65, 0, 0.35, 1], delay: retraso },
        }
      : {}
  const aparecer = (extra = 0) =>
    ligado
      ? { style: { opacity: marcas } }
      : animar
        ? {
            initial: { opacity: 0, scale: 0.4 },
            animate: encendida ? { opacity: 1, scale: 1 } : undefined,
            transition: { duration: 0.35, delay: retraso + duracion * 0.8 + extra },
          }
        : {}
  const rotulo = ligado
    ? { style: { opacity: texto } }
    : animar
      ? {
          initial: { opacity: 0, y: vertical ? 0 : dondeTexto === 'abajo' ? -6 : 6 },
          animate: encendida ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.6, delay: retraso + duracion * 0.45 },
        }
      : {}

  const Marca = remate === 'flecha' ? Flecha : Barra

  return (
    <div
      ref={ref}
      role={etiquetaAccesible ? 'img' : undefined}
      aria-label={etiquetaAccesible}
      aria-hidden={etiquetaAccesible ? undefined : true}
      className={clsx('pointer-events-none relative', vertical ? 'w-6' : 'h-6', className)}
    >
      {/* Líneas de referencia de los extremos. Lo animado es un ancla de tamaño 0 en el extremo
          (escala desde ahí); el trazo de dentro se centra con translate sin que framer lo pise. */}
      <m.span className={clsx('absolute size-0', vertical ? 'left-1/2 top-0' : 'left-0 top-1/2')} {...aparecer()}>
        <span className={clsx('absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2', colores.linea, vertical ? 'h-px w-3.5' : 'h-3.5 w-px')} />
      </m.span>
      <m.span className={clsx('absolute size-0', vertical ? 'bottom-0 left-1/2' : 'right-0 top-1/2')} {...aparecer(0.05)}>
        <span className={clsx('absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2', colores.linea, vertical ? 'h-px w-3.5' : 'h-3.5 w-px')} />
      </m.span>
      {/* La línea de cota, que crece desde el centro */}
      <m.span
        className={clsx('absolute origin-center', colores.linea, vertical ? 'inset-y-0 left-1/2 w-px' : 'inset-x-0 top-1/2 h-px')}
        {...linea}
      />
      {/* Remates */}
      <m.span className={clsx('absolute size-0', vertical ? 'left-1/2 top-0' : 'left-0 top-1/2')} {...aparecer()}>
        <Marca color={colores.linea} vertical={vertical} inicio />
      </m.span>
      <m.span className={clsx('absolute size-0', vertical ? 'bottom-0 left-1/2' : 'right-0 top-1/2')} {...aparecer(0.05)}>
        <Marca color={colores.linea} vertical={vertical} />
      </m.span>
      {/* La medida: el <span> de fuera la coloca (translate/rotate de Tailwind); el de dentro se anima. */}
      {medida && (
        <span
          className={clsx(
            'anotacion absolute',
            colores.texto,
            vertical
              ? clsx('top-1/2 [writing-mode:vertical-rl]', dondeTexto === 'derecha' ? 'left-[calc(50%+6px)] -translate-y-1/2' : 'right-[calc(50%+6px)] -translate-y-1/2 rotate-180')
              : clsx('left-1/2 -translate-x-1/2', dondeTexto === 'abajo' ? 'top-[calc(50%+6px)]' : 'bottom-[calc(50%+5px)]'),
          )}
        >
          <m.span className="block" {...rotulo}>
            {medida}
          </m.span>
        </span>
      )}
    </div>
  )
}

/** Trazo oblicuo de arquitectura (45°), centrado en el extremo. */
function Barra({ color }) {
  return <span className={clsx('absolute left-0 top-0 block h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45', color)} />
}

/** Punta de flecha hacia afuera (la punta, en el extremo). */
function Flecha({ color, vertical, inicio }) {
  const giro = vertical ? (inicio ? '-rotate-90' : 'rotate-90') : inicio ? 'rotate-180' : ''
  return (
    <span className={clsx('absolute left-0 top-0 block size-0', giro)}>
      <span className={clsx('absolute -left-2 top-0 block h-px w-2 origin-right rotate-[28deg]', color)} />
      <span className={clsx('absolute -left-2 top-0 block h-px w-2 origin-right -rotate-[28deg]', color)} />
    </span>
  )
}
