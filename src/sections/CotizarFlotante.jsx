import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { IconoWhatsApp } from '../components/Iconos'
import { useCotizacion } from '../lib/cotizacion'
import { EXPO } from '../lib/movimiento'
import { enlaceWhatsApp, mensajeGeneral } from '../lib/whatsapp'

/**
 * Botón flotante «Cotiza tu obra» (brief §5.12), con WhatsApp como acceso secundario.
 * Aparece al pasar la portada (#inicio; sin portada, tras 0,8 pantallas) y se aparta mientras
 * #cotiza o el pie están en pantalla: así nunca tapa «Enviar por WhatsApp». z-flotante (45).
 * STUB de la base, ya funcional; la sección puede pulir el diseño.
 */
export default function CotizarFlotante() {
  const { irACotizar } = useCotizacion()
  const visible = useVisible()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-flotante flex justify-end px-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] md:px-8 md:pb-8">
      <AnimatePresence>
        {visible && (
          <m.div
            key="flotante"
            data-flotante=""
            className="pointer-events-auto flex items-center gap-1.5 rounded-[3px] bg-carbon/80 p-1.5 shadow-profunda ring-1 ring-hueso/10 backdrop-blur-xl"
            initial={{ opacity: 0, y: 32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94, transition: { duration: 0.25, ease: [0.5, 0, 0.75, 0] } }}
            transition={{ duration: 0.7, ease: EXPO }}
          >
            <a
              href={enlaceWhatsApp(mensajeGeneral())}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="grid size-12 shrink-0 place-items-center rounded-[2px] text-hueso ring-1 ring-hueso/15 transition-colors duration-300 hover:bg-hueso hover:text-carbon"
            >
              <IconoWhatsApp className="size-[22px]" />
            </a>
            <button type="button" onClick={() => irACotizar()} className="boton boton-oro !min-h-12 !px-5">
              <span>Cotiza tu obra</span>
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** ¿Toca mostrarlo? Se mide una vez por evento de scroll (pasivo), nada en reposo. */
function useVisible() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      const alto = window.innerHeight
      const inicio = document.getElementById('inicio')
      const paso = inicio ? inicio.getBoundingClientRect().bottom < alto * 0.35 : window.scrollY > alto * 0.8
      const enPantalla = (elemento, margen = 0) => {
        if (!elemento) return false
        const caja = elemento.getBoundingClientRect()
        return caja.top < alto - margen && caja.bottom > margen
      }
      const cotiza = enPantalla(document.getElementById('cotiza'), alto * 0.12)
      const pie = enPantalla(document.querySelector('footer'), 40)
      setVisible(paso && !cotiza && !pie)
    }
    const pedir = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
    }
  }, [])

  return visible
}
