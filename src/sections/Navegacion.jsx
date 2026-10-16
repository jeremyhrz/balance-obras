import { useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion'
import { X } from 'lucide-react'
import { IconoWhatsApp } from '../components/Iconos'
import Logo from '../components/Logo'
import Magnetico from '../components/Magnetico'
import Reticula from '../components/Reticula'
import { BALANCE } from '../data/balance.js'
import { ENLACES } from '../data/secciones'
import { useCotizacion } from '../lib/cotizacion'
import { useAtraparFoco } from '../lib/foco'
import { useIntroTerminada } from '../lib/intro'
import { EXPO } from '../lib/movimiento'
import { alClicAncla, irA, useBloquearScroll } from '../lib/scroll'
import { useSeccionActiva } from '../lib/seccionActiva'
import { enlaceWhatsApp, mensajeGeneral } from '../lib/whatsapp'

/**
 * Navegación (brief §5.2): barra fija con el logo horizontal y «Cotiza tu obra» siempre visible; se
 * esconde al bajar y vuelve al subir. En escritorio ancho, los enlaces con la sección activa en oro.
 * En el resto, un botón abre el MENÚ a pantalla completa: retícula de plano de fondo, enlaces enormes
 * numerados que entran escalonados, y WhatsApp abajo. Esc cierra, el foco queda dentro y el scroll se bloquea.
 */
export default function Navegacion() {
  const listo = useIntroTerminada()
  const { irACotizar } = useCotizacion()
  const activa = useSeccionActiva()
  const [oculta, setOculta] = useState(false)
  const [solida, setSolida] = useState(false)
  const [menu, setMenu] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? y)
    setSolida(y > 24)
    if (y < 160) setOculta(false)
    else if (delta > 6) setOculta(true)
    else if (delta < -6) setOculta(false)
  })

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-nav"
        initial={false}
        animate={{ y: oculta && !menu ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EXPO }}
      >
        <div
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 border-b border-hueso/[0.07] bg-carbon/80 backdrop-blur-xl transition-opacity duration-500',
            solida ? 'opacity-100' : 'opacity-0',
          )}
        />
        <m.div
          className="contenedor relative flex h-16 items-center justify-between gap-3 lg:h-20"
          initial={{ opacity: 0, y: -18 }}
          animate={listo ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.3 }}
        >
          <a href="#inicio" onClick={alClicAncla} aria-label="Balance Obras Civiles, ir al inicio" className="-ml-1 shrink-0 p-1">
            <Logo variante="horizontal" subtitulo={false} titulo={null} className="h-6 w-auto xs:h-7 lg:h-9" />
          </a>

          <nav aria-label="Secciones" className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {ENLACES.map((enlace) => (
                <li key={enlace.id}>
                  <a
                    href={`#${enlace.id}`}
                    onClick={alClicAncla}
                    aria-current={activa === enlace.id ? 'true' : undefined}
                    className={clsx(
                      'etiqueta relative block py-2 transition-colors duration-300 hover:text-oro-claro',
                      activa === enlace.id ? 'text-oro' : 'text-hueso/75',
                    )}
                  >
                    {enlace.corto}
                    <span
                      aria-hidden="true"
                      className={clsx('absolute inset-x-0 -bottom-0.5 h-px origin-left bg-oro transition-transform duration-500 ease-expo', activa === enlace.id ? 'scale-x-100' : 'scale-x-0')}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Magnetico fuerza={0.25}>
              <a
                href="#cotiza"
                onClick={(evento) => {
                  evento.preventDefault()
                  irACotizar()
                }}
                className="boton boton-oro boton-chico"
              >
                <span className="sm:hidden">Cotizar</span>
                <span className="hidden sm:inline">Cotiza tu obra</span>
              </a>
            </Magnetico>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Abrir el menú"
              aria-expanded={menu}
              className="flex size-11 flex-col items-center justify-center gap-[5px] rounded-[2px] ring-1 ring-hueso/15 transition-colors hover:ring-oro/60 xl:hidden"
            >
              <span className="h-px w-5 bg-hueso" />
              <span className="h-px w-5 bg-hueso" />
              <span className="h-px w-3 self-end bg-oro" style={{ marginRight: 12 }} />
            </button>
          </div>
        </m.div>
      </m.header>

      <AnimatePresence>{menu && <MenuMovil alCerrar={() => setMenu(false)} activa={activa} />}</AnimatePresence>
    </>
  )
}

function MenuMovil({ alCerrar, activa }) {
  const panel = useRef(null)
  useBloquearScroll(true)
  useAtraparFoco(panel, true, alCerrar)

  const ir = (id) => (evento) => {
    evento.preventDefault()
    alCerrar()
    setTimeout(() => irA(`#${id}`), 420)
  }

  return (
    <m.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      tabIndex={-1}
      className="fixed inset-0 z-menu flex flex-col overflow-hidden bg-plano-profundo outline-none"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: EXPO }}
    >
      <Reticula variante="plano" ejes cruces opacidad={0.7} />
      <div className="contenedor relative flex h-16 shrink-0 items-center justify-between">
        <Logo variante="horizontal" subtitulo={false} titulo={null} className="h-6 w-auto xs:h-7" />
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar el menú"
          className="flex size-11 items-center justify-center rounded-full text-hueso ring-1 ring-hueso/25 transition-colors hover:bg-hueso/10"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <nav aria-label="Secciones" className="contenedor relative flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-6">
        <ul className="space-y-1.5">
          {ENLACES.map((enlace, i) => (
            <li key={enlace.id} className="overflow-hidden">
              <m.a
                href={`#${enlace.id}`}
                onClick={ir(enlace.id)}
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.7, ease: EXPO, delay: 0.25 + i * 0.05 }}
                className={clsx(
                  'flex items-baseline gap-4 py-1 font-display text-menu font-extrabold uppercase leading-none transition-colors',
                  activa === enlace.id ? 'text-oro' : 'text-hueso hover:text-oro-claro',
                )}
              >
                <span className="anotacion w-7 shrink-0 text-plano-linea">{enlace.numero}</span>
                {enlace.corto}
              </m.a>
            </li>
          ))}
        </ul>
      </nav>

      <m.div
        className="contenedor relative flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-plano-linea/25 py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="anotacion text-plano-linea">{BALANCE.lema}</p>
        <a
          href={enlaceWhatsApp(mensajeGeneral())}
          target="_blank"
          rel="noopener noreferrer"
          className="etiqueta inline-flex min-h-[44px] items-center gap-2 text-hueso hover:text-oro-claro"
        >
          <IconoWhatsApp className="size-4" /> WhatsApp
        </a>
      </m.div>
    </m.div>
  )
}
