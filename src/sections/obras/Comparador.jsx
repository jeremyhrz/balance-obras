import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Foto from '../../components/Foto'
import { useMenosMovimiento } from '../../lib/movimiento'

/**
 * Comparador arrastrable: la misma foto en versión plano (izquierda) y real (derecha), con un
 * divisor que se arrastra con el dedo o el ratón (o con las flechas del teclado). Hoy compara
 * «Plano / Obra»; cuando lleguen fotos reales de remodelaciones sirve tal cual de «Antes / Después»
 * (pásale `antes` y `despues` como ids de foto).
 * Arrastre con eventos de puntero (sin el `drag` de framer, que no está en domAnimation).
 */
export default function Comparador({
  foto = 'arquitectura-fachada',
  antes,
  despues,
  etiquetaAntes = 'Plano',
  etiquetaDespues = 'Obra',
  className = '',
}) {
  const marco = useRef(null)
  const [valor, setValor] = useState(0.5)
  const arrastrando = useRef(false)
  const visto = useInView(marco, { once: true, amount: 0.5 })
  const menos = useMenosMovimiento()
  const [tocado, setTocado] = useState(false)

  // Al verse por primera vez, el divisor hace un recorrido corto para enseñar que se arrastra.
  useEffect(() => {
    if (!visto || menos || tocado) return
    const control = animate(0.5, [0.5, 0.2, 0.8, 0.5], {
      duration: 2.4,
      ease: 'easeInOut',
      delay: 0.3,
      onUpdate: (v) => setValor(v),
    })
    return () => control.stop()
  }, [visto, menos, tocado])

  const moverA = useCallback((clientX) => {
    const caja = marco.current?.getBoundingClientRect()
    if (!caja) return
    setValor(Math.min(1, Math.max(0, (clientX - caja.left) / caja.width)))
  }, [])

  const alBajar = (e) => {
    setTocado(true)
    arrastrando.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    moverA(e.clientX)
  }
  const alMover = (e) => arrastrando.current && moverA(e.clientX)
  const alSoltar = () => { arrastrando.current = false }
  const alTeclear = (e) => {
    const paso = e.shiftKey ? 0.1 : 0.03
    if (e.key === 'ArrowLeft') { setTocado(true); setValor((v) => Math.max(0, v - paso)); e.preventDefault() }
    if (e.key === 'ArrowRight') { setTocado(true); setValor((v) => Math.min(1, v + paso)); e.preventDefault() }
  }

  const idAntes = antes ?? foto
  const idDespues = despues ?? foto
  const usoAntes = antes ? undefined : 'plano'
  const porcentaje = `${(valor * 100).toFixed(2)}%`

  return (
    <div
      ref={marco}
      className={`relative select-none overflow-hidden rounded-[2px] bg-hormigon ring-1 ring-hueso/10 touch-pan-y ${className}`}
      onPointerDown={alBajar}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      onPointerCancel={alSoltar}
      data-cursor="Arrastra"
    >
      {/* La obra (derecha) ocupa todo; el plano (izquierda) se recorta con el divisor. */}
      <Foto id={idDespues} sizes="(min-width: 1024px) 70vw, 100vw" className="block" etiqueta={false} draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 calc(100% - ${porcentaje}) 0 0)` }} aria-hidden="true">
        <Foto id={idAntes} uso={usoAntes} sizes="(min-width: 1024px) 70vw, 100vw" rellenar etiqueta={false} alt="" draggable={false} />
      </div>

      <span className="etiqueta pointer-events-none absolute left-3 top-3 rounded-[2px] bg-plano/80 px-2.5 py-1.5 text-plano-linea backdrop-blur-sm md:left-5 md:top-5">
        {etiquetaAntes}
      </span>
      <span className="etiqueta pointer-events-none absolute right-3 top-3 rounded-[2px] bg-carbon/70 px-2.5 py-1.5 text-oro backdrop-blur-sm md:right-5 md:top-5">
        {etiquetaDespues}
      </span>

      {/* Divisor con su asa (role slider para teclado y lectores de pantalla). */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: porcentaje }}>
        <span className="absolute inset-y-0 -left-px w-0.5 bg-oro shadow-laser" />
        <span
          role="slider"
          tabIndex={0}
          aria-label={`Comparar ${etiquetaAntes.toLowerCase()} y ${etiquetaDespues.toLowerCase()}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(valor * 100)}
          onKeyDown={alTeclear}
          className="pointer-events-auto absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-carbon/80 text-oro ring-1 ring-oro/70 backdrop-blur-md"
        >
          <ChevronLeft className="size-4" strokeWidth={1.5} />
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </span>
      </div>
    </div>
  )
}
