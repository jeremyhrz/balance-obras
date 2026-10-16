import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { m, useScroll, useTransform } from 'framer-motion'
import EtiquetaReferencial from './EtiquetaReferencial'
import { datosFoto } from '../lib/fotos'
import { VISTA, transicion, useMenosMovimiento } from '../lib/movimiento'

/**
 * Foto optimizada de src/data/fotos.json (la genera scripts/optimizar_fotos.py):
 * <picture> con AVIF + WebP, srcset por anchos (480/768/1200/1920, nunca agrandados), width/height
 * reales (sin saltos de diseño) y un fondo sobre el que la foto se funde: el placeholder borroso si
 * la foto lo trae (solo las que se ven al cargar, como la portada) o su color medio.
 * Si la foto es REFERENCIAL (así viene en el manifiesto) lleva la etiqueta «Imagen referencial».
 *
 *   <Foto id="obra-fachada" sizes="(min-width: 1024px) 40vw, 90vw" />
 *   <div className="relative h-svh"><Foto id="portada-obra" movil="vertical" rellenar prioridad /></div>
 *   <Foto id="obra-losa" revelar parallax={0.12} vineta />
 *
 * - `sizes`: cuánto mide en pantalla; elige la variante justa (por defecto, todo el ancho).
 * - `prioridad`: SOLO la foto principal de la portada (sin lazy, fetchpriority alta).
 * - `rellenar`: ocupa todo su padre (absolute inset-0); el padre necesita `relative` y alto propio.
 * - `uso`: usa el recorte «id@uso» de fotos_config.json (p. ej. uso="tarjeta"), si existe.
 * - `movil`: recorte para pantallas de menos de 768 px («id@movil»): dirección de arte (una
 *   portada horizontal en escritorio y vertical en el teléfono). Úsalo con `rellenar`.
 * - `revelar`: al entrar en pantalla se destapa de abajo arriba (clip-path) mientras se asienta.
 * - `parallax`: fracción de desplazamiento con el scroll (0,08–0,2 queda elegante).
 * - `posicion`: object-position, p. ej. "50% 30%" · `vineta`: oscurece los bordes.
 * - `etiqueta` (true): la de «Imagen referencial» si la foto lo es; `false` la quita (p. ej. si la
 *   tarjeta ya la pone en otro sitio) · `posicionEtiqueta`: 'abajo-izquierda' (por defecto), etc.
 * - `proporcion`: '4:5'. Solo se usa si la foto TODAVÍA no está en el manifiesto: se pinta un
 *   recuadro de plano de esa proporción en vez de nada (y en desarrollo dice qué id falta).
 * - `alt`: por defecto, el del manifiesto. Pasa alt="" si es decorativa.
 * El resto de props van a la envoltura (data-cursor, onClick, aria-*…).
 */
export default function Foto({
  id,
  alt,
  sizes = '100vw',
  prioridad = false,
  rellenar = false,
  uso,
  movil,
  revelar = false,
  parallax = 0,
  posicion,
  vineta = false,
  etiqueta = true,
  posicionEtiqueta = 'abajo-izquierda',
  proporcion,
  className,
  imgClassName,
  style,
  onLoad,
  ...resto
}) {
  const datos = datosFoto(id, uso)
  const datosMovil = movil ? datosFoto(`${id}@${movil}`) : null
  const menos = useMenosMovimiento()
  const [cargada, setCargada] = useState(false)

  // Si la foto ya estaba en caché, `load` puede llegar antes que React: se revisa al montar.
  const refImagen = useCallback((img) => {
    if (img?.complete && img.naturalWidth > 0) setCargada(true)
  }, [])

  if (!datos) {
    if (import.meta.env.DEV && id) console.warn(`<Foto>: no existe la foto «${id}${uso ? `@${uso}` : ''}» en src/data/fotos.json`)
    const [a, b] = String(proporcion ?? '4:3').split(':').map(Number)
    return (
      <div
        className={clsx('foto foto--pendiente', rellenar && 'foto--rellenar', className)}
        style={{ aspectRatio: rellenar ? undefined : `${a || 4} / ${b || 3}`, ...style }}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        {...resto}
      >
        {import.meta.env.DEV && (
          <span className="anotacion absolute left-2 top-2 text-plano-linea/80">Foto pendiente: {id}</span>
        )}
      </div>
    )
  }

  const srcset = (d, formato) => d.anchos.map((a) => `${d.base}-${a}.${formato} ${a}w`).join(', ')
  const mediano = datos.anchos.find((a) => a >= 768) ?? datos.anchos[datos.anchos.length - 1]

  const imagen = (
    <picture>
      {datosMovil && (
        <>
          <source media="(max-width: 767px)" type="image/avif" srcSet={srcset(datosMovil, 'avif')} sizes={sizes} />
          <source media="(max-width: 767px)" type="image/webp" srcSet={srcset(datosMovil, 'webp')} sizes={sizes} />
        </>
      )}
      <source type="image/avif" srcSet={srcset(datos, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(datos, 'webp')} sizes={sizes} />
      <img
        ref={refImagen}
        src={`${datos.base}-${mediano}.webp`}
        width={datos.ancho}
        height={datos.alto}
        alt={alt ?? datos.alt ?? ''}
        loading={prioridad ? 'eager' : 'lazy'}
        fetchPriority={prioridad ? 'high' : undefined}
        decoding="async"
        draggable={false}
        className={clsx('foto__img', (cargada || prioridad) && 'is-cargada', imgClassName)}
        style={posicion ? { objectPosition: posicion } : undefined}
        onLoad={(evento) => {
          setCargada(true)
          onLoad?.(evento)
        }}
      />
    </picture>
  )

  // Placeholder borroso solo si la foto lo trae (las que se ven al cargar); si no, su color medio.
  const borroso = (datosMovil && typeof window !== 'undefined' && window.innerWidth < 768 ? datosMovil : datos).placeholder
  const conRevelado = revelar && !menos
  const Envoltura = conRevelado ? m.div : 'div'
  const propsRevelado = conRevelado
    ? {
        initial: { clipPath: 'inset(100% 0% 0% 0%)' },
        whileInView: { clipPath: 'inset(0% 0% 0% 0%)' },
        viewport: VISTA,
        transition: transicion({ duration: 1.2 }),
      }
    : {}

  return (
    <Envoltura
      className={clsx('foto', rellenar && 'foto--rellenar', vineta && 'foto--vineta', className)}
      style={{
        aspectRatio: rellenar ? undefined : `${datos.ancho} / ${datos.alto}`,
        backgroundImage: borroso ? `url(${borroso})` : undefined,
        backgroundColor: datos.color,
        ...style,
      }}
      {...propsRevelado}
      {...resto}
    >
      {parallax && !menos ? (
        <CapaParallax fuerza={parallax} asentar={conRevelado}>
          {imagen}
        </CapaParallax>
      ) : conRevelado ? (
        <m.div
          className="foto__capa"
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          viewport={VISTA}
          transition={transicion({ duration: 1.4 })}
        >
          {imagen}
        </m.div>
      ) : (
        <div className="foto__capa">{imagen}</div>
      )}
      {etiqueta && datos.referencial && <EtiquetaReferencial posicion={posicionEtiqueta} />}
    </Envoltura>
  )
}

/** Desplaza la foto con el scroll (agrandada lo justo para no destapar los bordes). */
function CapaParallax({ fuerza, asentar, children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-fuerza * 100}%`, `${fuerza * 100}%`])
  const escalaBase = 1 + fuerza * 2
  return (
    <div ref={ref} className="foto__capa">
      <m.div
        className="foto__capa"
        style={{ y, scale: asentar ? undefined : escalaBase }}
        initial={asentar ? { scale: escalaBase * 1.15 } : false}
        whileInView={asentar ? { scale: escalaBase } : undefined}
        viewport={VISTA}
        transition={transicion({ duration: 1.4 })}
      >
        {children}
      </m.div>
    </div>
  )
}
