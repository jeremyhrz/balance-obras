import { useEffect, useImperativeHandle, useRef } from 'react'
import clsx from 'clsx'
import { useMenosMovimiento } from '../lib/movimiento'

/**
 * Polvo de obra en un <canvas> liviano (brief §3 y §5.1). Dos modos:
 *  - 'ambiente': motas finas que flotan despacio, como polvo a contraluz (portada, fotos grandes).
 *  - 'rafaga': nada en reposo; cada llamada a rafaga() levanta una nube que se abre y se asienta
 *    (las piezas del logo que caen en la intro, un bloque que se apila…).
 *
 *   <div className="relative"><Polvo /></div>                                  ambiente, llena al padre
 *   <Polvo cantidad={20} color="201 164 92" />                                  menos motas, doradas
 *   const polvo = useRef(null)
 *   <Polvo ref={polvo} modo="rafaga" className="!fixed inset-0 z-intro" />
 *   polvo.current?.rafaga({ x: 180, y: 420, ancho: 120 })                     px desde la esquina del lienzo
 *   polvo.current?.rafagaEn(elemento.getBoundingClientRect(), { fuerza: 1.3 })  en el borde de abajo de una caja
 *
 * - `color`: canales RGB separados por espacios ('236 234 229' = hueso, por defecto).
 * - `cantidad`: motas del ambiente (por defecto, según el área: 18 en un teléfono, ~60 en escritorio).
 * - rafaga({ x, y, ancho = 80, cantidad = 36, fuerza = 1 }): nube (y algunas esquirlas finas) a lo
 *   largo del segmento de `ancho` px centrado en (x, y).
 * Va en absolute inset-0 (el padre necesita `relative`); no captura el puntero y es decorativo.
 * Se detiene fuera de pantalla y con la pestaña oculta; con «reducir movimiento» no se dibuja y
 * rafaga() no hace nada. Densidad de píxeles máxima 1,5: barato hasta en un teléfono modesto.
 */
export default function Polvo({ ref, modo = 'ambiente', cantidad, color = '236 234 229', className, style }) {
  const lienzo = useRef(null)
  const menos = useMenosMovimiento()
  const motor = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      rafaga: (opciones) => motor.current?.rafaga(opciones),
      rafagaEn: (caja, opciones) => motor.current?.rafagaEn(caja, opciones),
    }),
    [],
  )

  useEffect(() => {
    const canvas = lienzo.current
    if (!canvas || menos) return undefined
    const m = crearMotor(canvas, { modo, cantidad, color })
    motor.current = m
    return () => {
      m.destruir()
      motor.current = null
    }
  }, [menos, modo, cantidad, color])

  if (menos) return null
  return <canvas ref={lienzo} aria-hidden="true" className={clsx('pointer-events-none absolute inset-0 size-full', className)} style={style} />
}

function crearMotor(canvas, { modo, cantidad, color }) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(1.5, window.devicePixelRatio || 1)
  let ancho = 0
  let alto = 0
  let cuadro = 0
  let ultimo = 0
  let visible = true
  let particulas = []
  const azar = (a, b) => a + Math.random() * (b - a)

  // Mota difusa pre-dibujada: drawImage es mucho más barato que un degradado por partícula.
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = 32
  const sctx = sprite.getContext('2d')
  const degradado = sctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  degradado.addColorStop(0, `rgb(${color} / 1)`)
  degradado.addColorStop(0.45, `rgb(${color} / 0.45)`)
  degradado.addColorStop(1, `rgb(${color} / 0)`)
  sctx.fillStyle = degradado
  sctx.fillRect(0, 0, 32, 32)

  const mota = () => ({
    x: azar(0, ancho),
    y: azar(0, alto),
    vx: azar(-0.012, 0.012),
    vy: azar(-0.02, -0.004),
    r: azar(0.5, 1.7),
    a: azar(0.12, 0.5),
    fase: azar(0, Math.PI * 2),
    vida: Infinity,
  })

  const poblarAmbiente = () => {
    const n = cantidad ?? Math.round(Math.min(64, Math.max(18, (ancho * alto) / 22000)))
    particulas = Array.from({ length: n }, mota)
  }

  const medir = () => {
    const caja = canvas.getBoundingClientRect()
    ancho = Math.max(1, caja.width)
    alto = Math.max(1, caja.height)
    canvas.width = Math.round(ancho * dpr)
    canvas.height = Math.round(alto * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (modo === 'ambiente') poblarAmbiente()
  }

  const paso = (ahora) => {
    cuadro = 0
    const dt = Math.min(48, ahora - (ultimo || ahora)) / 16.67 // en «cuadros de 60 Hz»
    ultimo = ahora
    ctx.clearRect(0, 0, ancho, alto)
    const vivas = []
    for (const p of particulas) {
      if (modo === 'ambiente') {
        p.fase += 0.012 * dt
        p.x += (p.vx + Math.sin(p.fase) * 0.05) * dt * 4
        p.y += p.vy * dt * 4
        if (p.y < -4) Object.assign(p, mota(), { y: alto + 4 })
        if (p.x < -4) p.x = ancho + 4
        if (p.x > ancho + 4) p.x = -4
        ctx.globalAlpha = p.a * (0.65 + 0.35 * Math.sin(p.fase * 1.7))
        ctx.drawImage(sprite, p.x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4)
        vivas.push(p)
      } else {
        p.edad += dt
        if (p.edad >= p.vida) continue
        const frenado = 0.935 ** dt
        p.vx *= frenado
        p.vy = p.vy * frenado + 0.006 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.r += p.crece * dt
        const t = p.edad / p.vida
        ctx.globalAlpha = p.a * (t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88)
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
        vivas.push(p)
      }
    }
    ctx.globalAlpha = 1
    particulas = vivas
    if (modo === 'ambiente' ? visible : particulas.length) pedir()
  }

  const pedir = () => {
    if (!cuadro) cuadro = window.requestAnimationFrame(paso)
  }

  const rafaga = ({ x, y, ancho: largo = 80, cantidad: n = 36, fuerza = 1 } = {}) => {
    if (x == null || y == null) return
    const escala = Math.min(1.6, Math.max(0.8, largo / 80))
    for (let i = 0; i < n; i += 1) {
      const lugar = azar(-0.5, 0.5)
      const fina = i % 4 === 0 // una de cada cuatro: esquirla fina y rápida; el resto, nube
      particulas.push({
        x: x + lugar * largo * 1.1,
        y: y + azar(-4, 2),
        vx: (lugar * (fina ? 4.4 : 3.2) + azar(-0.8, 0.8)) * fuerza,
        vy: -azar(fina ? 0.8 : 0.3, fina ? 2.6 : 1.7) * fuerza,
        r: fina ? azar(0.8, 1.6) : azar(4, 10) * escala,
        crece: fina ? 0 : azar(0.08, 0.22),
        a: fina ? azar(0.5, 0.85) : azar(0.2, 0.48),
        edad: 0,
        vida: fina ? azar(26, 46) : azar(46, 92),
      })
    }
    ultimo = 0
    pedir()
  }

  const rafagaEn = (caja, opciones = {}) => {
    if (!caja) return
    const propia = canvas.getBoundingClientRect()
    rafaga({ x: caja.left + caja.width / 2 - propia.left, y: caja.bottom - propia.top, ancho: caja.width, ...opciones })
  }

  medir()
  const redimension = new ResizeObserver(() => {
    medir()
    pedir()
  })
  redimension.observe(canvas)

  // El ambiente solo se anima a la vista y con la pestaña al frente.
  const enPantalla = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting && !document.hidden
    if (visible) pedir()
  })
  enPantalla.observe(canvas)
  const alCambiarPestana = () => {
    visible = !document.hidden
    if (visible) pedir()
  }
  document.addEventListener('visibilitychange', alCambiarPestana)

  if (modo === 'ambiente') pedir()

  return {
    rafaga,
    rafagaEn,
    destruir: () => {
      window.cancelAnimationFrame(cuadro)
      redimension.disconnect()
      enPantalla.disconnect()
      document.removeEventListener('visibilitychange', alCambiarPestana)
    },
  }
}
