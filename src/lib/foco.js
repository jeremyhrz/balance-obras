import { useEffect, useRef } from 'react'

const ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Atrapa el foco del teclado dentro de `ref` mientras `activo` sea true (modales, cajones, menú):
 * enfoca el primer control, Tab da la vuelta dentro, Escape llama a `alEscapar` y, al cerrar,
 * el foco vuelve a donde estaba. Al contenedor ponle tabIndex={-1} por si no tiene controles.
 */
export function useAtraparFoco(ref, activo, alEscapar) {
  const escapar = useRef(alEscapar)
  escapar.current = alEscapar

  useEffect(() => {
    const contenedor = ref.current
    if (!activo || !contenedor) return undefined
    const previo = document.activeElement
    const visibles = () =>
      [...contenedor.querySelectorAll(ENFOCABLES)].filter((el) => el.getClientRects().length > 0)

    ;(visibles()[0] ?? contenedor).focus({ preventScroll: true })

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') {
        escapar.current?.()
        return
      }
      if (evento.key !== 'Tab') return
      const lista = visibles()
      if (!lista.length) {
        evento.preventDefault()
        return
      }
      const primero = lista[0]
      const ultimo = lista[lista.length - 1]
      if (evento.shiftKey && (document.activeElement === primero || !contenedor.contains(document.activeElement))) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && (document.activeElement === ultimo || !contenedor.contains(document.activeElement))) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      if (previo instanceof HTMLElement) previo.focus({ preventScroll: true })
    }
  }, [activo, ref])
}
