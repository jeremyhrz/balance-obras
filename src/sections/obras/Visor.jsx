import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import BotonWhatsApp from '../../components/BotonWhatsApp'
import EtiquetaReferencial from '../../components/EtiquetaReferencial'
import Foto from '../../components/Foto'
import Video from '../../components/Video'
import { categoriaDe, detalleObra, nombreObra } from '../../data/obras.js'
import { useCotizacion } from '../../lib/cotizacion'
import { useAtraparFoco } from '../../lib/foco'
import { EXPO } from '../../lib/movimiento'
import { useBloquearScroll } from '../../lib/scroll'
import { mensajeObra } from '../../lib/whatsapp'

/**
 * Visor a pantalla completa de una obra: galería deslizable (scroll-snap: el dedo la arrastra
 * sola), flechas y teclado (← →), contador, video si la obra lo trae, descripción y dos salidas
 * («Cotizar algo parecido» por WhatsApp y «Cotiza tu obra»). Esc cierra, el foco queda atrapado y
 * el scroll de la página se bloquea.
 */
export default function Visor({ obra, alCerrar }) {
  const panel = useRef(null)
  const pista = useRef(null)
  const [indice, setIndice] = useState(0)
  const { irACotizar } = useCotizacion()
  useBloquearScroll(true)
  useAtraparFoco(panel, true, alCerrar)

  const medios = [...(obra.video ? [{ tipo: 'video', id: obra.video }] : []), ...obra.fotos.map((id) => ({ tipo: 'foto', id }))]
  const total = medios.length

  const irA = (i) => {
    const destino = Math.max(0, Math.min(total - 1, i))
    const el = pista.current?.children[destino]
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  // El índice sigue al scroll de la pista (lo mueva el dedo, las flechas o el teclado).
  useEffect(() => {
    const p = pista.current
    if (!p) return
    const alDesplazar = () => setIndice(Math.round(p.scrollLeft / Math.max(1, p.clientWidth)))
    p.addEventListener('scroll', alDesplazar, { passive: true })
    return () => p.removeEventListener('scroll', alDesplazar)
  }, [])

  const alTeclear = (e) => {
    if (e.key === 'ArrowRight') { irA(indice + 1); e.preventDefault() }
    if (e.key === 'ArrowLeft') { irA(indice - 1); e.preventDefault() }
  }

  const categoria = categoriaDe(obra)
  const detalle = detalleObra(obra)

  return (
    <m.div
      className="fixed inset-0 z-visor flex flex-col bg-carbon/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <m.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visor-titulo"
        tabIndex={-1}
        onKeyDown={alTeclear}
        className="flex h-full flex-col outline-none"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.6, ease: EXPO }}
      >
        <header className="contenedor flex items-start justify-between gap-4 pt-5 md:pt-8">
          <div className="min-w-0">
            <p className="etiqueta text-oro">{categoria?.nombre}</p>
            <h2 id="visor-titulo" className="titulo-bloque mt-2 text-hueso">{nombreObra(obra)}</h2>
            {detalle && <p className="anotacion mt-1 text-concreto">{detalle}</p>}
          </div>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-hueso ring-1 ring-hueso/20 transition-colors hover:bg-hueso/10"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </header>

        <div className="relative mt-4 min-h-0 flex-1 md:mt-6">
          <ul
            ref={pista}
            data-lenis-prevent
            className="sin-barra flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          >
            {medios.map((medio, i) => (
              <li key={medio.id} className="relative h-full w-full shrink-0 snap-start snap-always px-[var(--margen)]">
                <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center">
                  {medio.tipo === 'video' ? (
                    <Video id={medio.id} controles className="max-h-full w-full" />
                  ) : (
                    <Foto
                      id={medio.id}
                      sizes="(min-width: 1024px) 80vw, 100vw"
                      className="h-full w-full !bg-transparent !bg-none [&_img]:object-contain [&_img]:!bg-transparent"
                      etiqueta={false}
                      prioridad={i === 0}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => irA(indice - 1)}
                disabled={indice === 0}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-carbon/70 text-hueso ring-1 ring-hueso/20 backdrop-blur transition-opacity disabled:opacity-30 md:flex lg:left-6"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => irA(indice + 1)}
                disabled={indice >= total - 1}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-carbon/70 text-hueso ring-1 ring-hueso/20 backdrop-blur transition-opacity disabled:opacity-30 md:flex lg:right-6"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        <footer className="contenedor grid gap-4 pb-6 pt-4 md:grid-cols-[1fr_auto] md:items-end md:pb-8">
          <div>
            <div className="flex items-center gap-3">
              <p className="anotacion text-oro" aria-live="polite">
                {String(indice + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </p>
              {total > 1 && (
                <div className="flex gap-1.5" aria-hidden="true">
                  {medios.map((medio, i) => (
                    <span key={medio.id} className={`h-0.5 w-6 transition-colors ${i === indice ? 'bg-oro' : 'bg-hueso/20'}`} />
                  ))}
                </div>
              )}
              {obra.referencial && <EtiquetaReferencial enLinea />}
            </div>
            <p className="texto-serif mt-3 max-w-2xl text-hueso/85">{obra.descripcion}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BotonWhatsApp variante="linea" chico mensaje={mensajeObra(obra)}>Algo parecido</BotonWhatsApp>
            <button
              type="button"
              className="boton boton-oro boton-chico"
              onClick={() => { alCerrar(); setTimeout(() => irACotizar(obra.categoria), 60) }}
            >
              <span>Cotiza tu obra</span>
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </footer>
      </m.div>
    </m.div>
  )
}
