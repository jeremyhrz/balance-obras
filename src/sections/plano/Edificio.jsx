import { m } from 'framer-motion'
import { useMapeo } from '../../lib/mapeo'

/**
 * El edificio de «De plano a realidad», dibujado en SVG y animado por un MotionValue `p` (0–1, el
 * avance del scroll de la sección). Fases:
 *   A 0,00–0,30  plano: ejes, cotas, contorno, losas y ventanas se TRAZAN (pathLength)
 *   B 0,30–0,56  estructura: columnas que crecen y losas que se tienden, nivel por nivel
 *   C 0,56–0,76  acabados: vidrios, barandas, aleta y marquesina de oro; las líneas del plano se apagan
 * La foto (fase D) la pone la sección encima. Todo es transform/opacity/pathLength: nada re-renderiza.
 * Geometría (viewBox 400 × 470): suelo en y = 410, niveles de 70 de alto, ejes A–E cada 70 desde
 * x = 90; las cotas viven a la izquierda (x < 70) para no tocar el edificio.
 */

const EJES = [90, 160, 230, 300, 370]
const IZQ = EJES[0] - 6 // borde izquierdo de las losas (vuelan 6 px)
// Nivel: y de su losa (arriba), y de su piso (abajo) y el último eje que ocupa (terrazas escalonadas).
const NIVELES = [
  { arriba: 340, abajo: 410, hasta: 370 },
  { arriba: 270, abajo: 340, hasta: 370 },
  { arriba: 200, abajo: 270, hasta: 300 },
  { arriba: 130, abajo: 200, hasta: 230 },
]
const COTAS = [
  { y: 410, texto: 'N+0.00' },
  { y: 340, texto: 'N+3.20' },
  { y: 270, texto: 'N+6.40' },
  { y: 200, texto: 'N+9.60' },
  { y: 130, texto: 'N+12.80' },
]
const LINEA = '#6FA4DB'

function useRango(p, a, b) {
  return useMapeo(p, [a, b], [0, 1], { clamp: true })
}

/** Un trazo de plano que se dibuja entre a y b y se apaga en la fase de acabados. Con `guion`
 *  (líneas de eje punteadas) aparece con opacidad, porque pathLength usa su propio dasharray. */
function Trazo({ p, d, a, b, ancho = 1, guion, opacidadFinal = 0.22 }) {
  const largo = useRango(p, a, b)
  const opacidad = useMapeo(p, [a, a + 0.005, 0.6, 0.76], [0, 1, 1, opacidadFinal], { clamp: true })
  const opacidadGuion = useMapeo(p, [a, b, 0.6, 0.76], [0, 0.9, 0.9, opacidadFinal], { clamp: true })
  return (
    <m.path
      d={d}
      fill="none"
      stroke={LINEA}
      strokeWidth={ancho}
      strokeDasharray={guion}
      vectorEffect="non-scaling-stroke"
      style={guion ? { opacity: opacidadGuion } : { pathLength: largo, opacity: opacidad }}
    />
  )
}

/** Concreto que crece desde abajo (columna) o se tiende de izquierda a derecha (losa). */
function Pieza({ p, x, y, w, h, a, b, tender = false }) {
  const escala = useRango(p, a, b)
  const tono = useMapeo(p, [0.56, 0.72], ['#A9ADB0', '#DCDEDF'], { clamp: true })
  return (
    <m.rect
      x={x}
      y={y}
      width={w}
      height={h}
      style={tender ? { scaleX: escala, originX: 0, fill: tono } : { scaleY: escala, originY: 1, fill: tono }}
    />
  )
}

function Vidrio({ p, x, y, w, h, a }) {
  const opacidad = useRango(p, a, a + 0.06)
  return <m.rect x={x} y={y} width={w} height={h} fill="url(#plano-vidrio)" style={{ opacity: opacidad }} />
}

// ── Las piezas se calculan una vez (son datos, no estado).
const TRAZOS = (() => {
  const t = []
  EJES.forEach((x, i) => t.push({ d: `M${x} 96 V424`, a: 0.01 + i * 0.012, b: 0.1 + i * 0.012, ancho: 0.6, guion: '3 4' }))
  t.push({ d: 'M40 412 H392', a: 0.04, b: 0.14, ancho: 1 })
  t.push({ d: `M${IZQ} 410 V122 H236 V192 H306 V262 H376 V410 Z`, a: 0.06, b: 0.2, ancho: 1.4 })
  NIVELES.forEach((n, i) => t.push({ d: `M${IZQ} ${n.arriba} H${n.hasta + 6}`, a: 0.1 + i * 0.02, b: 0.18 + i * 0.02, ancho: 1 }))
  NIVELES.forEach((n, i) => {
    for (let x = EJES[0]; x < n.hasta; x += 70) {
      const puerta = i === 0 && x === EJES[2]
      const [y0, y1] = puerta ? [n.arriba + 20, n.abajo] : [n.arriba + 14, n.abajo - 12]
      const desfase = (x - EJES[0]) / 4000
      t.push({ d: `M${x + 10} ${y0} H${x + 60} V${y1} H${x + 10} Z`, a: 0.14 + i * 0.025 + desfase, b: 0.24 + i * 0.025 + desfase, ancho: 0.8 })
    }
  })
  // Cotas: la vertical de niveles (a la izquierda) y la horizontal de abajo, con sus marcas.
  t.push({ d: 'M18 410 V130', a: 0.08, b: 0.2, ancho: 0.8 })
  COTAS.forEach((c, i) => t.push({ d: `M13 ${c.y} H23`, a: 0.1 + i * 0.015, b: 0.13 + i * 0.015, ancho: 0.8 }))
  t.push({ d: `M${EJES[0]} 440 H${EJES[4]} M${EJES[0]} 435 V445 M${EJES[4]} 435 V445`, a: 0.12, b: 0.24, ancho: 0.8 })
  return t
})()

const PIEZAS = (() => {
  const piezas = []
  NIVELES.forEach((n, i) => {
    const inicio = 0.3 + i * 0.065
    EJES.filter((x) => x <= n.hasta).forEach((x, j) =>
      piezas.push({ x: x - 4, y: n.arriba, w: 8, h: n.abajo - n.arriba, a: inicio + j * 0.006, b: inicio + 0.03 + j * 0.006 }),
    )
    piezas.push({ x: IZQ, y: n.arriba - 8, w: n.hasta + 6 - IZQ, h: 8, a: inicio + 0.03, b: inicio + 0.06, tender: true })
  })
  return piezas
})()

const VIDRIOS = (() => {
  const v = []
  NIVELES.forEach((n, i) => {
    for (let x = EJES[0]; x < n.hasta; x += 70) {
      const puerta = i === 0 && x === EJES[2]
      v.push({ x: x + 10, y: puerta ? n.arriba + 20 : n.arriba + 14, w: 50, h: puerta ? n.abajo - n.arriba - 20 : n.abajo - n.arriba - 26, a: 0.57 + i * 0.03 })
    }
  })
  return v
})()

export default function Edificio({ p, className }) {
  const aleta = useRango(p, 0.6, 0.7)
  const marquesina = useRango(p, 0.66, 0.72)
  const barandas = useRango(p, 0.62, 0.72)
  const textos = useMapeo(p, [0.1, 0.16, 0.6, 0.76], [0, 1, 1, 0.25], { clamp: true })
  const ejesTexto = useMapeo(p, [0.02, 0.08, 0.6, 0.76], [0, 1, 1, 0.25], { clamp: true })

  return (
    <svg viewBox="0 0 400 470" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="plano-vidrio" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B5266" />
          <stop offset="0.45" stopColor="#16222D" />
          <stop offset="1" stopColor="#0B1218" />
        </linearGradient>
        <linearGradient id="plano-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8CC8E" />
          <stop offset="0.45" stopColor="#C9A45C" />
          <stop offset="1" stopColor="#8A6A33" />
        </linearGradient>
      </defs>

      {/* Ejes A–E y niveles: el texto del plano */}
      <m.g style={{ opacity: ejesTexto }} fill={LINEA} fontFamily="Michroma, sans-serif" fontSize="9" textAnchor="middle">
        {EJES.map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={84} r={9} fill="none" stroke={LINEA} strokeWidth="0.8" />
            <text x={x} y={87.5}>{'ABCDE'[i]}</text>
          </g>
        ))}
      </m.g>
      <m.g style={{ opacity: textos }} fill={LINEA} fontFamily="Michroma, sans-serif" fontSize="7">
        {COTAS.map((c) => (
          <text key={c.y} x={24} y={c.y - 5}>{c.texto}</text>
        ))}
        <text x={(EJES[0] + EJES[4]) / 2} y={458} textAnchor="middle">EJE A — EJE E</text>
      </m.g>

      {/* Estructura y acabados (debajo de los trazos, que se apagan al final) */}
      {PIEZAS.map((pz, i) => <Pieza key={`p${i}`} p={p} {...pz} />)}
      {VIDRIOS.map((v, i) => <Vidrio key={`v${i}`} p={p} {...v} />)}

      {/* Barandas de las terrazas escalonadas y de la azotea */}
      <m.path
        d={`M236 192 H306 M236 180 H306 M306 262 H376 M306 250 H376 M${IZQ} 122 H236 M${IZQ} 110 H236`}
        fill="none"
        stroke="#ECEAE5"
        strokeWidth="1.2"
        style={{ pathLength: barandas }}
      />
      {/* Aleta de oro (como la pieza dorada del logo) y marquesina de la entrada */}
      <m.rect x={72} y={110} width={8} height={300} fill="url(#plano-oro)" style={{ scaleY: aleta, originY: 1 }} />
      <m.rect x={EJES[2] + 6} y={355} width={58} height={4} fill="url(#plano-oro)" style={{ scaleX: marquesina, originX: 0.5 }} />

      {TRAZOS.map((t, i) => <Trazo key={`t${i}`} p={p} {...t} />)}
    </svg>
  )
}
