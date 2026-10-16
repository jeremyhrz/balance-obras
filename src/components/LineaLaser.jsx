import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { animate, isMotionValue, m, useMotionValue, useSpring } from 'framer-motion'
import { useMenosMovimiento } from '../lib/movimiento'

/**
 * Línea láser de nivel (brief §5.1 y §5.3): un hilo de luz dorada con su halo, marcas en los
 * extremos y, si se pide, la lectura del nivel («N+1.24»). Ocupa el ancho de su padre (que
 * necesita `relative` y alto propio) y se mueve con transform: no provoca reflujo.
 *
 *   <LineaLaser posicion={0.62} />                                   quieta, al 62 % del alto del padre
 *   <LineaLaser posicion={barrido} />                                sigue a un MotionValue 0–1 (la intro lo anima
 *                                                                    y recorta la cortina con el mismo valor)
 *   <LineaLaser barrer duracion={0.7} alTerminar={…} />              barre de arriba abajo una vez, sola
 *   const { posicion, giro } = useNivelPuntero(refPortada)
 *   <LineaLaser posicion={posicion} giro={giro} lectura etiqueta="Nivel láser" />   el detalle interactivo de la portada
 *
 * - `posicion`: número o MotionValue de 0 (arriba) a 1 (abajo) · `giro`: grados (número o MotionValue).
 * - `barrer` (+ `desde`, `hasta`, `duracion`, `retraso`, `alTerminar`): animación de barrido propia.
 * - `lectura`: muestra «N±x.xx» que cambia con la altura (formatoLectura(p) para otro texto).
 * - `etiqueta`: texto fijo pequeño sobre el extremo izquierdo («Nivel láser»).
 * - `intensidad` (1): multiplica el halo (0,5 más discreto, 1,5 para la intro).
 * Decorativa (aria-hidden). Con «reducir movimiento», `barrer` salta al final y llama a alTerminar.
 */
export default function LineaLaser({
  posicion = 0.5,
  giro = 0,
  barrer = false,
  desde = 0,
  hasta = 1,
  duracion = 0.8,
  retraso = 0,
  alTerminar,
  lectura = false,
  formatoLectura = lecturaNivel,
  etiqueta,
  intensidad = 1,
  className,
}) {
  const ref = useRef(null)
  const lecturaRef = useRef(null)
  const menos = useMenosMovimiento()
  const alto = useMotionValue(0)
  const propia = useMotionValue(barrer ? desde : typeof posicion === 'number' ? posicion : 0.5)
  const fuente = barrer ? propia : isMotionValue(posicion) ? posicion : propia
  const giroFuente = useMotionValue(typeof giro === 'number' ? giro : 0)
  const rotacion = isMotionValue(giro) ? giro : giroFuente
  const y = useMotionValue(0)
  const avisar = useRef(alTerminar)
  avisar.current = alTerminar

  // Posición o giro como número: se copian al valor propio.
  useEffect(() => {
    if (!barrer && typeof posicion === 'number') propia.set(posicion)
  }, [barrer, posicion, propia])
  useEffect(() => {
    if (typeof giro === 'number') giroFuente.set(giro)
  }, [giro, giroFuente])

  // Altura en píxeles = posición (0–1) × alto del padre. Se recalcula a mano (y no con
  // useTransform) para que el doble montaje de StrictMode no deje la línea pegada arriba.
  useEffect(() => {
    const actualizar = () => y.set(fuente.get() * alto.get())
    actualizar()
    const a = fuente.on('change', actualizar)
    const b = alto.on('change', actualizar)
    return () => {
      a()
      b()
    }
  }, [fuente, alto, y])

  // Alto del padre (para pasar de 0–1 a píxeles).
  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return undefined
    const observador = new ResizeObserver(([e]) => alto.set(e.contentRect.height))
    observador.observe(nodo)
    alto.set(nodo.getBoundingClientRect().height)
    return () => observador.disconnect()
  }, [alto])

  // Barrido propio.
  useEffect(() => {
    if (!barrer) return undefined
    if (menos) {
      propia.set(hasta)
      const t = window.setTimeout(() => avisar.current?.(), 50)
      return () => window.clearTimeout(t)
    }
    propia.set(desde)
    const control = animate(propia, hasta, {
      duration,
      delay: retraso,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => avisar.current?.(),
    })
    return () => control.stop()
  }, [barrer, desde, hasta, duracion, retraso, menos, propia])

  // Lectura del nivel, escrita directo en el DOM.
  useEffect(() => {
    const nodo = lecturaRef.current
    if (!nodo) return undefined
    nodo.textContent = formatoLectura(fuente.get())
    return fuente.on('change', (p) => {
      nodo.textContent = formatoLectura(p)
    })
  }, [fuente, formatoLectura, lectura])

  return (
    <div ref={ref} aria-hidden="true" className={clsx('pointer-events-none absolute inset-0', className)}>
      <m.div className="absolute inset-x-0 top-0" style={{ y }}>
        <m.div className="relative" style={{ rotate: rotacion }}>
          {/* Halo ancho y suave */}
          <div
            className="absolute inset-x-0 top-0 h-10 -translate-y-1/2"
            style={{
              background: `linear-gradient(to bottom, transparent, rgb(232 204 142 / ${0.13 * intensidad}) 50%, transparent)`,
            }}
          />
          {/* El hilo del láser, con su resplandor */}
          <div
            className="absolute inset-x-0 top-0 h-px -translate-y-1/2 bg-oro-claro"
            style={{ boxShadow: `0 0 ${10 * intensidad}px ${1 * intensidad}px rgb(232 204 142 / 0.6), 0 0 2px rgb(255 248 230 / 0.9)` }}
          />
          {/* Marcas de los extremos */}
          <span className="absolute left-[var(--margen)] top-0 h-3 w-px -translate-y-1/2 bg-oro-claro/90" />
          <span className="absolute right-[var(--margen)] top-0 h-3 w-px -translate-y-1/2 bg-oro-claro/90" />
          <span className="absolute left-[calc(var(--margen)-3px)] top-0 size-[7px] -translate-y-1/2 rotate-45 border border-oro-claro/90" />
          {etiqueta && (
            <span className="anotacion absolute bottom-2 left-[calc(var(--margen)+12px)] uppercase tracking-[0.18em] text-oro-claro/85">
              {etiqueta}
            </span>
          )}
          {lectura && (
            <span ref={lecturaRef} className="anotacion absolute bottom-2 right-[calc(var(--margen)+10px)] text-oro-claro" />
          )}
        </m.div>
      </m.div>
    </div>
  )
}

/** 0,5 → «N±0.00»; arriba sube, abajo baja (±3 m en todo el alto). */
export function lecturaNivel(p) {
  const metros = (0.5 - Number(p || 0)) * 6
  if (Math.abs(metros) < 0.005) return 'N±0.00'
  return `N${metros > 0 ? '+' : '−'}${Math.abs(metros).toFixed(2)}`
}

/**
 * Para el detalle interactivo de la portada: con ratón, la altura sigue al cursor sobre `ref`;
 * en el teléfono, la línea se mantiene a nivel contra la inclinación del aparato (giro, ±10°)
 * cuando el navegador lo permite sin pedir permiso (Android); si no, flota despacio.
 *   const { posicion, giro } = useNivelPuntero(refPortada, { inicial: 0.62 })
 * Devuelve MotionValues con resorte. Con «reducir movimiento», quietos en `inicial`.
 */
export function useNivelPuntero(ref, { inicial = 0.6, rango = [0.18, 0.86] } = {}) {
  const menos = useMenosMovimiento()
  const objetivo = useMotionValue(inicial)
  const inclinacion = useMotionValue(0)
  const posicion = useSpring(objetivo, { stiffness: 120, damping: 22, mass: 0.6 })
  const giro = useSpring(inclinacion, { stiffness: 90, damping: 14, mass: 0.8 })
  const [minimo, maximo] = rango

  useEffect(() => {
    if (menos) {
      objetivo.set(inicial)
      inclinacion.set(0)
      return undefined
    }
    const fino = window.matchMedia('(pointer: fine)').matches
    const limitar = (v) => Math.min(maximo, Math.max(minimo, v))
    let cuadro = 0
    let conSensor = false
    let aLaVista = true

    const mover = (e) => {
      const caja = ref.current?.getBoundingClientRect()
      if (!caja || e.clientY < caja.top || e.clientY > caja.bottom) return
      objetivo.set(limitar((e.clientY - caja.top) / caja.height))
    }
    const orientar = (e) => {
      if (e.gamma == null) return
      conSensor = true
      inclinacion.set(Math.max(-10, Math.min(10, -e.gamma * 0.6)))
      if (e.beta != null) objetivo.set(limitar(inicial + (e.beta - 55) / 160))
    }
    // Sin cursor ni sensor: flota despacio alrededor de `inicial` (solo a la vista).
    const t0 = performance.now()
    const flotar = (ahora) => {
      cuadro = 0
      if (!aLaVista || conSensor) return
      objetivo.set(limitar(inicial + Math.sin((ahora - t0) / 1900) * 0.035))
      cuadro = window.requestAnimationFrame(flotar)
    }
    const observador = new IntersectionObserver(([e]) => {
      aLaVista = e.isIntersecting
      if (aLaVista && !fino && !cuadro) cuadro = window.requestAnimationFrame(flotar)
    })
    if (ref.current) observador.observe(ref.current)

    if (fino) window.addEventListener('pointermove', mover, { passive: true })
    else {
      window.addEventListener('deviceorientation', orientar, { passive: true })
      cuadro = window.requestAnimationFrame(flotar)
    }
    return () => {
      observador.disconnect()
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('deviceorientation', orientar)
      window.cancelAnimationFrame(cuadro)
    }
  }, [menos, inicial, minimo, maximo, objetivo, inclinacion, ref])

  return { posicion, giro }
}
