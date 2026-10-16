import { Children, cloneElement, isValidElement, useRef } from 'react'
import clsx from 'clsx'
import { useInView } from 'framer-motion'

/**
 * Iconos propios de obra. Toman el color del texto; dales tamaño con className («size-8»). Son
 * decorativos (aria-hidden): el texto de al lado o un aria-label dice qué son.
 *
 * Oficio (línea, 24×24, trazo 1,5 que cambia con `grosor`):
 *   <IconoCasco /> · <IconoGrua /> · <IconoRodillo /> · <IconoLlana /> · <IconoPlano /> · <IconoRegla /> · <IconoNivel />
 *   <Icono nombre="grua" className="size-10" />          por clave (las de SERVICIOS[].icono en balance.js)
 *   <Icono nombre="llana" trazar retraso={0.2} />        se DIBUJA trazo a trazo al entrar en pantalla (una vez)
 * Marcas: <IconoWhatsApp /> (relleno) · <IconoInstagram /> (línea).
 * Separador de la cinta: <Destello className="size-[0.45em]" /> (estrella de cuatro puntas, relleno).
 * Para lo demás (flechas, cerrar, correo, ubicación…) usa lucide-react con strokeWidth={1.5}:
 * las flechas → y ✦ NO están en las fuentes de la página.
 */

const FORMAS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'])

/** Marca cada trazo para que se dibuje (pathLength=1 y su número de orden en --i). */
function marcarTrazos(hijos, cuenta) {
  return Children.map(hijos, (hijo) => {
    if (!isValidElement(hijo)) return hijo
    if (hijo.type === 'g') return cloneElement(hijo, {}, marcarTrazos(hijo.props.children, cuenta))
    if (!FORMAS.has(hijo.type) || hijo.props.fill === 'currentColor') return hijo
    const i = cuenta.n
    cuenta.n += 1
    return cloneElement(hijo, {
      pathLength: 1,
      className: clsx('icono__trazo', hijo.props.className),
      style: { ...hijo.props.style, '--i': i },
    })
  })
}

function Linea({ className, grosor = 1.5, trazar = false, retraso = 0, children }) {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={clsx(trazar && 'icono-trazable', trazar && visto && 'is-trazado', className)}
      style={trazar ? { '--retraso': `${retraso}s` } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {trazar ? marcarTrazos(children, { n: 0 }) : children}
    </svg>
  )
}

/** Casco de obra: copa, cresta y ala. */
export function IconoCasco(props) {
  return (
    <Linea {...props}>
      <path d="M4.6 16.4a7.4 7.4 0 0 1 14.8 0" />
      <path d="M10.2 9.6V7.9a1.8 1.8 0 0 1 3.6 0v1.7" />
      <path d="M8.3 11.2 9 16.4M15.7 11.2 15 16.4" />
      <rect x="2.5" y="16.4" width="19" height="2.6" rx="1.3" />
    </Linea>
  )
}

/** Grúa torre: mástil reticulado, pluma, contrapluma, tirantes, carro y gancho. */
export function IconoGrua(props) {
  return (
    <Linea {...props}>
      <path d="M7.2 21.2V6.3M10.2 21.2V6.3" />
      <path d="M7.2 18.2l3-3M7.2 15.2l3-3M7.2 12.2l3-3M7.2 9.2l3-2.9" />
      <path d="M2.6 6.3h19" />
      <path d="M8.7 2.6 2.6 6.3M8.7 2.6 21.6 6.3" />
      <path d="M17.6 6.3v5.4" />
      <path d="M17.6 11.7c0 1.4 1.7 1.8 1.7 3a1.7 1.7 0 0 1-3.4.2" />
      <path d="M4.8 21.2h7.8" />
    </Linea>
  )
}

/** Rodillo compactador de asfalto: tambor delantero, cabina y rueda trasera. */
export function IconoRodillo(props) {
  return (
    <Linea {...props}>
      <circle cx="6.6" cy="16.2" r="4.1" />
      <circle cx="6.6" cy="16.2" r="1.2" />
      <path d="M2.4 11.6h7.6l1.7 3H21v3.4h-2.4" />
      <circle cx="16.6" cy="18.1" r="1.9" />
      <path d="M13.6 14.6V7.4h5.6l.9 7.2" />
      <path d="M12.8 7.4h7.3" />
    </Linea>
  )
}

/** Llana de albañil: la hoja y el mango. */
export function IconoLlana(props) {
  return (
    <Linea {...props}>
      <path d="M3.2 16.2h17.6a.9.9 0 0 1 .9.9v1.9a.9.9 0 0 1-.9.9H3.2a.9.9 0 0 1-.9-.9v-1.9a.9.9 0 0 1 .9-.9Z" />
      <path d="M12 16.2v-4.4" />
      <path d="M8.2 8.4h7.6a1.7 1.7 0 0 1 0 3.4H8.2a1.7 1.7 0 0 1 0-3.4Z" />
      <path d="M5.4 22.4c1.6-.9 3.4-.9 5 0" />
    </Linea>
  )
}

/** Plano de arquitectura: hoja con la planta de una casa y su cota. */
export function IconoPlano(props) {
  return (
    <Linea {...props}>
      <path d="M5.2 3.2h13.6a1.4 1.4 0 0 1 1.4 1.4v14.8a1.4 1.4 0 0 1-1.4 1.4H5.2a1.4 1.4 0 0 1-1.4-1.4V4.6a1.4 1.4 0 0 1 1.4-1.4Z" />
      <path d="M7.4 17.4v-7.6h9.2v7.6Z" />
      <path d="M12.6 9.8v3.6M7.4 13.4h3.4" />
      <path d="M7.4 6.4h9.2M7.4 5.6v1.6M16.6 5.6v1.6" />
    </Linea>
  )
}

/** Escalímetro / regla en diagonal, con sus marcas. */
export function IconoRegla(props) {
  return (
    <Linea {...props}>
      <path d="M2.9 16.6 16.6 2.9a.9.9 0 0 1 1.3 0l3.2 3.2a.9.9 0 0 1 0 1.3L7.4 21.1a.9.9 0 0 1-1.3 0l-3.2-3.2a.9.9 0 0 1 0-1.3Z" />
      <path d="M6.2 13.3l1.9 1.9M8.6 10.9l1.2 1.2M11 8.5l1.9 1.9M13.4 6.1l1.2 1.2M15.8 3.7l1.9 1.9" />
    </Linea>
  )
}

/** Nivel de burbuja: la regla y la ampolla con la burbuja centrada. */
export function IconoNivel(props) {
  return (
    <Linea {...props}>
      <rect x="1.8" y="8.6" width="20.4" height="6.8" rx="1.2" />
      <rect x="8.6" y="10.4" width="6.8" height="3.2" rx="1.6" />
      <path d="M10.7 10.4v3.2M13.3 10.4v3.2" />
      <circle cx="12" cy="12" r="0.55" fill="currentColor" stroke="none" />
    </Linea>
  )
}

/** Clave → componente (las claves de SERVICIOS[].icono y TIPOS_OBRA[].icono en src/data/balance.js). */
export const ICONOS = {
  casco: IconoCasco,
  grua: IconoGrua,
  rodillo: IconoRodillo,
  llana: IconoLlana,
  plano: IconoPlano,
  regla: IconoRegla,
  nivel: IconoNivel,
}

/** <Icono nombre="grua" className="size-8" grosor={1.25} trazar /> */
export function Icono({ nombre, ...props }) {
  const Componente = ICONOS[nombre]
  if (!Componente) {
    if (import.meta.env.DEV) console.warn(`<Icono>: no existe «${nombre}». Hay: ${Object.keys(ICONOS).join(', ')}`)
    return null
  }
  return <Componente {...props} />
}

/** Estrella de cuatro puntas (el «✦» de la cinta, que las fuentes no traen). */
export function Destello({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 1.5c.7 6.6 3.9 9.8 10.5 10.5-6.6.7-9.8 3.9-10.5 10.5-.7-6.6-3.9-9.8-10.5-10.5C8.1 11.3 11.3 8.1 12 1.5Z" />
    </svg>
  )
}

export function IconoWhatsApp({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12.04 2C6.57 2 2.13 6.43 2.13 11.9c0 1.75.46 3.45 1.33 4.95L2.05 22l5.3-1.39a9.9 9.9 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.43 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.83 9.83 0 0 0 12.04 2Zm0 18.13h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.14.83.84-3.06-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.26-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.31c-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.47-.29Z" />
    </svg>
  )
}

export function IconoInstagram({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
