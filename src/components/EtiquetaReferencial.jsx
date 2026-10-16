import clsx from 'clsx'

// Clases COMPLETAS por posición (Tailwind solo ve nombres escritos tal cual).
const POSICIONES = {
  'abajo-izquierda': 'bottom-2 left-2 md:bottom-3 md:left-3',
  'abajo-derecha': 'bottom-2 right-2 md:bottom-3 md:right-3',
  'arriba-izquierda': 'top-2 left-2 md:top-3 md:left-3',
  'arriba-derecha': 'top-2 right-2 md:top-3 md:right-3',
}

/**
 * Etiqueta discreta «Imagen referencial» (brief §1.5) sobre una foto de ejemplo. <Foto> ya la pone
 * sola si la foto es referencial; úsala a mano en una tarjeta, el visor o un video.
 *
 *   <div className="relative">…<EtiquetaReferencial /></div>
 *   <EtiquetaReferencial posicion="arriba-derecha" />          'abajo-izquierda' (por defecto) · 'abajo-derecha' · 'arriba-…'
 *   <EtiquetaReferencial enLinea />                             sin posición absoluta (en un pie de foto, el visor…)
 *
 * El padre necesita `relative` (salvo con `enLinea`). Es texto real: lo leen los lectores de pantalla.
 */
export default function EtiquetaReferencial({ texto = 'Imagen referencial', posicion = 'abajo-izquierda', enLinea = false, className }) {
  return (
    <span
      className={clsx(
        'etiqueta pointer-events-none z-[2] inline-flex items-center gap-1.5 rounded-[2px] bg-carbon/65 px-2 py-1 !text-[0.5625rem] !tracking-[0.14em] text-hueso/85 ring-1 ring-hueso/10 backdrop-blur-sm',
        !enLinea && 'absolute',
        !enLinea && (POSICIONES[posicion] ?? POSICIONES['abajo-izquierda']),
        className,
      )}
    >
      <span aria-hidden="true" className="size-1 shrink-0 rotate-45 bg-oro" />
      {texto}
    </span>
  )
}
