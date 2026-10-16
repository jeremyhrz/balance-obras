import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useInView } from 'framer-motion'
import { Play } from 'lucide-react'
import Foto from './Foto'
import { datosVideo } from '../lib/fotos'
import { useMenosMovimiento } from '../lib/movimiento'

/**
 * Video de obra con póster (src/data/videos.json, lo genera scripts/optimizar_fotos.py a partir de
 * fotos_originales/obras/<id>/<nombre>.mp4|webm + <nombre>.jpg como póster). La portada también
 * está preparada para usarlo (brief §5.3).
 *
 *   <div className="relative aspect-video"><Video id="obras/edificio/recorrido" rellenar /></div>
 *   <Video id="…" controles autoplay={false} />            en el visor: con controles, sin arrancar solo
 *   <Video fuente={{ mp4: '/videos/portada.mp4', poster: 'portada-obra' }} rellenar prioridad />
 *
 * Por defecto: silenciado, en bucle e inline; arranca al entrar en pantalla y se pausa al salir
 * (no gasta datos ni batería fuera de vista). Mientras carga se ve el póster (una <Foto>). Con
 * «reducir movimiento» no arranca solo: queda el póster con un botón ▶. Sin datos, solo el póster
 * (o el recuadro de plano de <Foto>). El resto de props van a la envoltura.
 */
export default function Video({
  id,
  fuente,
  rellenar = false,
  autoplay = true,
  controles = false,
  prioridad = false,
  sizes = '100vw',
  posicion,
  etiqueta = true,
  className,
  ...resto
}) {
  const datos = fuente ?? datosVideo(id)
  const ref = useRef(null)
  const video = useRef(null)
  const menos = useMenosMovimiento()
  const enPantalla = useInView(ref, { amount: 0.2 })
  const [reproduciendo, setReproduciendo] = useState(false)
  const [pedido, setPedido] = useState(false) // el visitante pulsó ▶ (con «reducir movimiento»)
  const automatico = autoplay && !controles && (!menos || pedido)

  useEffect(() => {
    const v = video.current
    if (!v || !automatico) return
    if (enPantalla) v.play().catch(() => {})
    else v.pause()
  }, [enPantalla, automatico])

  const proporcion = datos?.ancho && datos?.alto ? `${datos.ancho} / ${datos.alto}` : undefined

  return (
    <div
      ref={ref}
      className={clsx('foto', rellenar && 'foto--rellenar', className)}
      style={rellenar ? undefined : { aspectRatio: proporcion ?? '16 / 9' }}
      {...resto}
    >
      {datos?.poster && (
        <Foto id={datos.poster} rellenar alt="" sizes={sizes} prioridad={prioridad} posicion={posicion} etiqueta={etiqueta} />
      )}
      {datos && (datos.mp4 || datos.webm) && (
        <video
          ref={video}
          className={clsx(
            'absolute inset-0 size-full object-cover transition-opacity duration-700',
            reproduciendo || controles ? 'opacity-100' : 'opacity-0',
          )}
          style={posicion ? { objectPosition: posicion } : undefined}
          muted={!controles}
          loop={!controles}
          playsInline
          controls={controles}
          preload={enPantalla || prioridad ? 'metadata' : 'none'}
          onPlaying={() => setReproduciendo(true)}
          aria-label={datos.alt || undefined}
        >
          {datos.webm && <source src={datos.webm} type="video/webm" />}
          {datos.mp4 && <source src={datos.mp4} type="video/mp4" />}
        </video>
      )}
      {menos && autoplay && !controles && !pedido && datos && (datos.mp4 || datos.webm) && (
        <button
          type="button"
          onClick={() => {
            setPedido(true)
            video.current?.play().catch(() => {})
          }}
          className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-carbon/70 text-hueso ring-1 ring-hueso/20 backdrop-blur"
          aria-label="Reproducir el video"
        >
          <Play className="size-6" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
