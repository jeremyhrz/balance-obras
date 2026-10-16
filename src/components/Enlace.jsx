import { rutaDe, useRutas } from '../lib/rutas'

/**
 * Enlace a otra página de la web (<a href="/obras">): navega con la cortina de transición y respeta
 * abrir en otra pestaña (Ctrl/⌘/clic central) porque el href es real.
 *
 *   <Enlace a="obras" className="boton boton-linea"><span>Ver obras</span></Enlace>
 *   <Enlace a="cotiza" alNavegar={cerrarMenu}>Cotiza</Enlace>
 */
export default function Enlace({ a, alNavegar, children, onClick, ...resto }) {
  const { navegar, pagina } = useRutas()
  return (
    <a
      href={rutaDe(a)}
      aria-current={pagina === a ? 'page' : undefined}
      onClick={(evento) => {
        onClick?.(evento)
        if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
        evento.preventDefault()
        alNavegar?.()
        navegar(a)
      }}
      {...resto}
    >
      {children}
    </a>
  )
}
