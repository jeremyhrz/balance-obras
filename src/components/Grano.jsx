import clsx from 'clsx'

/**
 * Textura de grano muy liviana (ruido SVG de 180 px en mosaico, clase .grano de index.css).
 * No captura el puntero y es decorativa.
 *
 *   <Grano />                                   toda la pantalla, fija, encima del contenido (z 30, bajo la navegación)
 *   <Grano fijo={false} opacidad={0.08} />      dentro de un contenedor `relative` (una foto, una tarjeta)
 *   <Grano vivo />                              además «tiembla» como película (5 saltos por segundo, con transform)
 *
 * App.jsx y el modo aislado ya montan uno global: no hace falta otro en cada sección.
 */
export default function Grano({ fijo = true, opacidad = 0.05, vivo = false, className }) {
  return (
    <div
      aria-hidden="true"
      className={clsx('grano', fijo ? 'fixed inset-0 z-grano' : 'absolute inset-0', vivo && 'grano--vivo', className)}
      style={{ opacity: opacidad }}
    />
  )
}
