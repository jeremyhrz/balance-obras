import { useEffect, useId, useRef } from 'react'
import { m } from 'framer-motion'
import {
  COMPOSICION,
  FILETES,
  ISOTIPO,
  LEMA,
  LETRAS,
  PUNTOS_LEMA,
  SUBTITULO,
  SUBTITULO_HORIZONTAL,
  TRIANGULO,
} from './logoTrazos'
import { CAIDA, EXPO, useMenosMovimiento } from '../lib/movimiento'

/**
 * Logo de Balance — Obras Civiles en SVG (recreado de la maqueta; los trazos están en logoTrazos.js).
 *
 *   <Logo className="w-72" />                                    completo: isotipo, BALANCE, — OBRAS CIVILES —, lema
 *   <Logo variante="horizontal" className="h-9 w-auto" />        barra de navegación: isotipo + BALANCE + OBRAS CIVILES
 *   <Logo variante="horizontal" subtitulo={false} />             … sin «OBRAS CIVILES» (BALANCE centrado)
 *   <Logo variante="isotipo" className="size-12" />              solo la «B» de piezas
 *   <Logo variante="palabra" textura className="w-full" />       solo BALANCE con su triángulo (el gigante del pie)
 *   <Logo construir alAsentar={(pieza, el) => …} alTerminar={…} />   se ARMA: ver abajo
 *
 * Dale ancho O alto con className (la otra medida sale de la proporción: PROPORCIONES[variante]).
 * Props:
 * - `lema` (completo, true): con «INGENIERÍA • CONSTRUCCIÓN • REMODELACIÓN».
 * - `subtitulo` (horizontal, true): con «OBRAS CIVILES» debajo de BALANCE.
 * - `relieve` (true): canto oscuro detrás de cada pieza, como la maqueta 3D. Quítalo en tamaños
 *   diminutos si ensucia.
 * - `textura` (false): poros en el concreto y vetas en el oro (filtros SVG). Solo en tamaños
 *   grandes y estáticos (el pie, la intro ya armada); no en la barra.
 * - `monocromo` (false): todo de currentColor, sin degradados ni relieve (sobre fotos, sellos).
 * - `titulo` ('Balance Obras Civiles'): nombre accesible; null = decorativo (dentro de un enlace
 *   que ya tiene su aria-label).
 *
 * `construir` (para la intro): los dos bloques de oro entran deslizándose como vigas, las dos
 * piezas de concreto caen y asientan con un rebote, BALANCE sube letra a letra, el triángulo se
 * levanta, los filetes se trazan y aparecen los textos. ≈ DURACION_ARMADO (1,5 s) a `velocidad` 1.
 * - `retraso` (s) antes de empezar · `velocidad` (1): 1,25 = 25 % más rápido.
 * - `alAsentar(pieza, elemento)`: cuando cada pieza de concreto TOCA (pieza = 'concretoInferior' |
 *   'concretoSuperior'; elemento = su <g>, para getBoundingClientRect() y soltar el polvo ahí).
 * - `alTerminar()`: cuando el armado terminó (también se llama sin `construir`, al montar).
 * Con «reducir movimiento» todo aparece con un fundido corto y no hay alAsentar.
 */

export const DURACION_ARMADO = 1.5

const cajaDe = (c) => c.join(' ')
/** Ancho / alto de cada variante (para reservar el espacio antes de que cargue). */
export const PROPORCIONES = Object.fromEntries(
  Object.entries(COMPOSICION).map(([nombre, c]) => [nombre, c.caja[2] / c.caja[3]]),
)

// Grueso del canto (relieve) en unidades de cada parte.
const RELIEVE_ISOTIPO = { x: 2.2, y: 3 }
const RELIEVE_PALABRA = { x: 1.6, y: 2.4 }

// Momentos del armado (s, a velocidad 1).
const T = {
  oroInferior: 0,
  oroSuperior: 0.12,
  concretoInferior: 0.3,
  concretoSuperior: 0.48,
  caida: 0.72, // duración de cada caída con su rebote
  impacto: 0.62, // fracción de la caída en la que toca
  letras: 0.62,
  escalonLetras: 0.045,
  triangulo: 1.06,
  filetes: 0.98,
  subtitulo: 1.02,
  lema: 1.16,
}

export default function Logo({
  variante = 'completo',
  lema = true,
  subtitulo = true,
  relieve = true,
  textura = false,
  monocromo = false,
  construir = false,
  retraso = 0,
  velocidad = 1,
  alAsentar,
  alTerminar,
  titulo = 'Balance Obras Civiles',
  className,
  style,
}) {
  const menos = useMenosMovimiento()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (nombre) => `bal-${nombre}-${uid}`
  const url = (nombre) => `url(#${id(nombre)})`
  const armar = construir && !menos
  const fundir = construir && menos
  const conRelieve = relieve && !monocromo
  const conTextura = textura && !monocromo

  const piezaInferior = useRef(null)
  const piezaSuperior = useRef(null)
  const avisos = useRef({ alAsentar, alTerminar })
  avisos.current = { alAsentar, alTerminar }

  // Avisos del armado: el impacto de cada pieza de concreto y el final.
  useEffect(() => {
    const tiempos = []
    const en = (s, fn) => tiempos.push(window.setTimeout(fn, Math.max(0, s) * 1000))
    if (armar) {
      const t = (x) => retraso + x / velocidad
      const conIsotipo = variante !== 'palabra'
      if (conIsotipo) {
        en(t(T.concretoInferior + T.caida * T.impacto), () =>
          avisos.current.alAsentar?.('concretoInferior', piezaInferior.current),
        )
        en(t(T.concretoSuperior + T.caida * T.impacto), () =>
          avisos.current.alAsentar?.('concretoSuperior', piezaSuperior.current),
        )
      }
      en(t(conIsotipo ? DURACION_ARMADO : 1), () => avisos.current.alTerminar?.())
    } else {
      en(fundir ? retraso + 0.45 : 0, () => avisos.current.alTerminar?.())
    }
    return () => tiempos.forEach((t) => window.clearTimeout(t))
  }, [armar, fundir, retraso, velocidad, variante])

  const comp = COMPOSICION[variante] ?? COMPOSICION.completo
  let caja = comp.caja
  if (variante === 'completo' && !lema) caja = [caja[0], caja[1], caja[2], comp.palabra.y + 182]
  const accesible = titulo ? { role: 'img', 'aria-label': titulo } : { 'aria-hidden': true, focusable: 'false' }

  // ── Animaciones (solo con `construir`) ──
  const t = (x) => retraso + x / velocidad
  const dur = (x) => x / velocidad
  const fundido = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay: retraso } }
  const anim = (deArmado) => (armar ? deArmado : fundir ? fundido : {})

  const viga = (desde, inicio) =>
    anim({
      initial: { ...desde, opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      transition: {
        x: { duration: dur(0.72), ease: [0.7, 0, 0.15, 1], delay: t(inicio) },
        y: { duration: dur(0.72), ease: [0.7, 0, 0.15, 1], delay: t(inicio) },
        opacity: { duration: dur(0.18), delay: t(inicio) },
      },
    })

  const caida = (altura, inicio) =>
    anim({
      initial: { y: -altura, opacity: 0 },
      animate: { y: [-altura, 0, -9, 0], opacity: 1 },
      transition: {
        y: { duration: dur(T.caida), times: [0, T.impacto, 0.8, 1], ease: [CAIDA, 'easeOut', 'easeIn'], delay: t(inicio) },
        opacity: { duration: dur(0.15), delay: t(inicio) },
      },
    })

  const enPalabra = variante === 'palabra' ? 0 : T.letras
  const letra = (i) =>
    anim({
      initial: { y: 118 },
      animate: { y: 0 },
      transition: { duration: dur(0.62), ease: EXPO, delay: t(enPalabra + i * T.escalonLetras) },
    })

  const aparecer = (inicio, y = 10) =>
    anim({
      initial: { opacity: 0, y },
      animate: { opacity: 1, y: 0 },
      transition: { duration: dur(0.6), ease: EXPO, delay: t(inicio) },
    })

  const trazar = (inicio, origen) =>
    anim({
      initial: { scaleX: 0 },
      animate: { scaleX: 1 },
      transition: { duration: dur(0.6), ease: [0.65, 0, 0.35, 1], delay: t(inicio) },
      style: { transformBox: 'fill-box', transformOrigin: origen },
    })

  const levantar = (inicio) =>
    anim({
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: {
        scale: { type: 'spring', stiffness: 380, damping: 16, delay: t(inicio) },
        opacity: { duration: dur(0.15), delay: t(inicio) },
      },
      style: { transformBox: 'fill-box', transformOrigin: '50% 100%' },
    })

  // ── Pinturas ──
  const pintura = (nombre) => (monocromo ? 'currentColor' : url(nombre))
  const filtro = (nombre) => (conTextura ? url(nombre) : undefined)

  // Una pieza del isotipo: canto (relieve) + cara.
  const pieza = (d, cara, canto, tex) => (
    <>
      {conRelieve && <path d={d} fill={canto} transform={`translate(${RELIEVE_ISOTIPO.x} ${RELIEVE_ISOTIPO.y})`} />}
      <path d={d} fill={cara} filter={filtro(tex)} />
    </>
  )

  const isotipo = comp.isotipo && (
    <g transform={`translate(${comp.isotipo.x} ${comp.isotipo.y}) scale(${comp.isotipo.escala})`}>
      <m.g {...viga({ x: -150 }, T.oroInferior)}>
        {pieza(ISOTIPO.oroInferior, pintura('oro'), '#5E4520', 'cepillado')}
        {!monocromo && <path d={ISOTIPO.oroInferior} fill={url('brillo')} />}
      </m.g>
      <m.g {...viga({ x: -124, y: 78 }, T.oroSuperior)}>
        {pieza(ISOTIPO.oroSuperior, pintura('oro'), '#5E4520', 'cepillado')}
        {!monocromo && <path d={ISOTIPO.oroSuperior} fill={url('brillo')} />}
      </m.g>
      <m.g ref={piezaInferior} {...caida(240, T.concretoInferior)}>
        {pieza(ISOTIPO.concretoInferior, pintura('concreto'), '#3A3D3F', 'poros')}
      </m.g>
      <m.g ref={piezaSuperior} {...caida(210, T.concretoSuperior)}>
        {pieza(ISOTIPO.concretoSuperior, pintura('concreto'), '#3A3D3F', 'poros')}
      </m.g>
    </g>
  )

  const conSubtitulo = variante === 'completo' || (variante === 'horizontal' && subtitulo)
  const posPalabra = variante === 'horizontal' && !subtitulo ? comp.palabraSola : comp.palabra
  const palabra = posPalabra && (
    <g transform={`translate(${posPalabra.x} ${posPalabra.y})`}>
      <g clipPath={armar ? url('ventana') : undefined}>
        {LETRAS.map((l, i) => (
          <m.g key={i} {...letra(i)}>
            {conRelieve && (
              <path
                d={l.d}
                fill="#36393B"
                fillRule="evenodd"
                transform={`translate(${RELIEVE_PALABRA.x} ${RELIEVE_PALABRA.y})`}
              />
            )}
            <path d={l.d} fill={pintura('letras')} fillRule="evenodd" filter={filtro('poros')} />
          </m.g>
        ))}
      </g>
      <m.path d={TRIANGULO} fill={pintura('oroTexto')} {...levantar(variante === 'palabra' ? 0.42 : T.triangulo)} />

      {conSubtitulo && variante === 'completo' && (
        <>
          {FILETES.map((f, i) => (
            <m.rect
              key={i}
              x={f.x1}
              y={f.y - 1.5}
              width={f.x2 - f.x1}
              height={3}
              fill={monocromo ? 'currentColor' : '#C9A45C'}
              {...trazar(T.filetes, i === 0 ? '100% 50%' : '0% 50%')}
            />
          ))}
          <m.path d={SUBTITULO} fill={pintura('oroTexto')} {...aparecer(T.subtitulo)} />
        </>
      )}
      {conSubtitulo && variante === 'horizontal' && (
        <m.path d={SUBTITULO_HORIZONTAL} fill={monocromo ? 'currentColor' : '#C9A45C'} {...aparecer(T.subtitulo, 6)} />
      )}
      {variante === 'completo' && lema && (
        <m.g {...aparecer(T.lema, 6)}>
          <path d={LEMA} fill={monocromo ? 'currentColor' : '#ECEAE5'} opacity={monocromo ? 1 : 0.92} />
          {PUNTOS_LEMA.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={monocromo ? 'currentColor' : '#C9A45C'} />
          ))}
        </m.g>
      )}
    </g>
  )

  return (
    <svg
      viewBox={cajaDe(caja)}
      className={className}
      style={style}
      overflow={armar ? 'visible' : undefined}
      {...accesible}
    >
      {armar && (
        <defs>
          {/* Ventana de las letras: suben desde debajo de la línea base sin verse fuera de ella. */}
          <clipPath id={id('ventana')}>
            <rect x="-20" y="-60" width="900" height="164" />
          </clipPath>
        </defs>
      )}
      {!monocromo && (
        <defs>
          {/* Oro cepillado: el degradado del brief en diagonal, con un brillo que cruza el fuste. */}
          <linearGradient id={id('oro')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="62" y2="161">
            <stop offset="0" stopColor="#F0DAA6" />
            <stop offset="0.16" stopColor="#E8CC8E" />
            <stop offset="0.42" stopColor="#C9A45C" />
            <stop offset="0.7" stopColor="#B08A45" />
            <stop offset="1" stopColor="#8A6A33" />
          </linearGradient>
          <linearGradient id={id('brillo')} gradientUnits="userSpaceOnUse" x1="0" y1="18" x2="52" y2="128">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.4" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.47" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('concreto')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="161">
            <stop offset="0" stopColor="#DFE1E2" />
            <stop offset="0.55" stopColor="#B9BCBE" />
            <stop offset="1" stopColor="#929597" />
          </linearGradient>
          <linearGradient id={id('letras')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
            <stop offset="0" stopColor="#DFE1E2" />
            <stop offset="0.6" stopColor="#B9BCBE" />
            <stop offset="1" stopColor="#9A9DA0" />
          </linearGradient>
          <linearGradient id={id('oroTexto')} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E8CC8E" />
            <stop offset="0.55" stopColor="#C9A45C" />
            <stop offset="1" stopColor="#A9843F" />
          </linearGradient>
          {conTextura && (
            <>
              {/* Poros del concreto: motas oscuras dispersas, solo dentro de la pieza. */}
              <filter id={id('poros')} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="ruido" />
                <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 1.32" result="motas" />
                <feComposite in="motas" in2="SourceGraphic" operator="in" result="dentro" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="dentro" />
                </feMerge>
              </filter>
              {/* Vetas del oro cepillado: rayas horizontales finas y claras. */}
              <filter id={id('cepillado')} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.008 0.9" numOctaves="2" seed="9" result="ruido" />
                <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.4" result="vetas" />
                <feComposite in="vetas" in2="SourceGraphic" operator="in" result="dentro" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="dentro" />
                </feMerge>
              </filter>
            </>
          )}
        </defs>
      )}
      {isotipo}
      {palabra}
    </svg>
  )
}
