import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { m } from 'framer-motion'
import clsx from 'clsx'
import { seccion } from '../data/secciones'
import { VIGA, useMenosMovimiento } from './movimiento'
import { irA, subirDeGolpe } from './scroll'

/**
 * Páginas separadas (cada una con su URL: /obras, /cotiza…) sin librería de rutas: History API y
 * una CORTINA de transición con la línea láser. Al navegar: la cortina sube y tapa (0,55 s), se
 * cambia la página y el scroll vuelve arriba, y la cortina sigue subiendo y destapa (0,6 s).
 * Atrás/adelante del navegador hacen lo mismo. Con «reducir movimiento», el cambio es inmediato.
 * En Vercel, vercel.json reescribe estas rutas a index.html (en desarrollo, Vite ya lo hace).
 *
 *   const { pagina, navegar } = useRutas()     → pagina: 'inicio' | 'servicios' | …
 *   navegar('obras')                            → también fuera de React: import { navegar } from '../lib/rutas'
 *   <Enlace a="obras">Ver obras</Enlace>         → src/components/Enlace.jsx
 */

export const PAGINAS = [
  { id: 'inicio', ruta: '/', titulo: 'Balance Obras Civiles · Ingeniería, construcción y remodelación' },
  { id: 'servicios', ruta: '/servicios', titulo: 'Servicios · Balance Obras Civiles' },
  { id: 'obras', ruta: '/obras', titulo: 'Obras · Balance Obras Civiles' },
  { id: 'proceso', ruta: '/proceso', titulo: 'Proceso · Balance Obras Civiles' },
  { id: 'nosotros', ruta: '/nosotros', titulo: 'Nosotros · Balance Obras Civiles' },
  { id: 'cotiza', ruta: '/cotiza', titulo: 'Cotiza tu obra · Balance Obras Civiles' },
  { id: 'contacto', ruta: '/contacto', titulo: 'Contacto · Balance Obras Civiles' },
]

/** La página de una ruta ('/obras', '/obras/' → 'obras'); cualquier otra → 'inicio'. */
export function paginaDe(ruta) {
  const limpia = (ruta || '/').replace(/\/+$/, '') || '/'
  return (PAGINAS.find((p) => p.ruta === limpia) ?? PAGINAS[0]).id
}

/** La ruta de una página ('obras' → '/obras'). */
export function rutaDe(id) {
  return (PAGINAS.find((p) => p.id === id) ?? PAGINAS[0]).ruta
}

const Contexto = createContext(null)
let navegarGlobal = () => {}

/** Navega desde cualquier sitio (también fuera del árbol de React: cotizacion.jsx lo usa). */
export function navegar(id, opciones) {
  navegarGlobal(id, opciones)
}

export function ProveedorRutas({ children }) {
  const menos = useMenosMovimiento()
  const [pagina, setPagina] = useState(() => paginaDe(typeof window === 'undefined' ? '/' : window.location.pathname))
  const [fase, setFase] = useState('quieta') // quieta → cubriendo → descubriendo → quieta
  const destino = useRef(pagina)

  const aplicar = useCallback((id) => {
    setPagina(id)
    document.title = (PAGINAS.find((p) => p.id === id) ?? PAGINAS[0]).titulo
    subirDeGolpe()
  }, [])

  const ir = useCallback(
    (id, { reemplazar = false, desdeHistorial = false } = {}) => {
      const objetivo = PAGINAS.some((p) => p.id === id) ? id : 'inicio'
      if (!desdeHistorial) {
        const url = rutaDe(objetivo) + window.location.search
        // Durante una transición, un segundo clic reemplaza en vez de apilar (sin entradas fantasma).
        if (reemplazar || fase !== 'quieta') window.history.replaceState({ pagina: objetivo }, '', url)
        else if (objetivo !== paginaDe(window.location.pathname)) window.history.pushState({ pagina: objetivo }, '', url)
      }
      if (objetivo === destino.current && fase === 'quieta') {
        irA(0) // misma página: solo vuelve arriba
        return
      }
      destino.current = objetivo
      if (menos) aplicar(objetivo)
      else setFase('cubriendo')
    },
    [aplicar, fase, menos],
  )

  useEffect(() => {
    navegarGlobal = ir
  }, [ir])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    // Una ruta que no existe muestra la portada: que la barra de direcciones lo diga.
    if (paginaDe(window.location.pathname) === 'inicio' && window.location.pathname !== '/') {
      window.history.replaceState({ pagina: 'inicio' }, '', '/' + window.location.search)
    }
    document.title = (PAGINAS.find((p) => p.id === pagina) ?? PAGINAS[0]).titulo
    const alVolver = () => ir(paginaDe(window.location.pathname), { desdeHistorial: true })
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ir])

  const alTerminarCortina = () => {
    if (fase === 'cubriendo') {
      aplicar(destino.current)
      // Un cuadro para que la página nueva se pinte arriba antes de destapar.
      requestAnimationFrame(() => setFase('descubriendo'))
    } else if (fase === 'descubriendo') {
      setFase('quieta')
    }
  }

  // Al cambiar de página (no en la primera carga), el foco va al título: el lector de pantalla la anuncia.
  const anterior = useRef(pagina)
  useEffect(() => {
    if (anterior.current === pagina) return
    anterior.current = pagina
    const titulo = document.querySelector('main h1, main h2')
    if (titulo) {
      if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1')
      titulo.focus({ preventScroll: true })
    }
  }, [pagina])

  const valor = useMemo(() => ({ pagina, navegar: ir, fase }), [pagina, ir, fase])

  return (
    <Contexto.Provider value={valor}>
      {children}
      <Cortina fase={fase} destino={destino.current} alTerminar={alTerminarCortina} />
    </Contexto.Provider>
  )
}

export function useRutas() {
  const contexto = useContext(Contexto)
  return contexto ?? { pagina: 'inicio', navegar: () => {}, fase: 'quieta' }
}

/** La cortina: panel carbón que sube con un hilo láser dorado en el borde y el nombre del destino. */
function Cortina({ fase, destino, alTerminar }) {
  const activa = fase !== 'quieta'
  const datos = seccion(destino === 'inicio' ? 'inicio' : destino)
  const nombre = destino === 'inicio' ? 'Inicio' : datos?.nombre ?? ''
  const numero = datos?.numero
  return (
    <m.div
      aria-hidden="true"
      className={clsx('fixed inset-0 z-[95] flex items-center justify-center bg-carbon', activa ? 'pointer-events-auto' : 'pointer-events-none')}
      initial={false}
      animate={{ y: fase === 'cubriendo' ? '0%' : fase === 'descubriendo' ? '-100%' : '100%' }}
      transition={fase === 'quieta' ? { duration: 0 } : { duration: fase === 'cubriendo' ? 0.55 : 0.6, ease: VIGA }}
      onAnimationComplete={alTerminar}
      style={{ visibility: activa ? 'visible' : 'hidden' }}
    >
      {/* Hilo láser en el borde que avanza (arriba al tapar, abajo al destapar) */}
      <span className="absolute inset-x-0 top-0 h-px bg-oro shadow-laser" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-oro shadow-laser" />
      <span className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#6FA4DB_1px,transparent_1px),linear-gradient(#6FA4DB_1px,transparent_1px)] [background-size:24px_24px]" />
      <m.span
        className="relative text-center"
        initial={false}
        animate={{ opacity: fase === 'cubriendo' ? 1 : 0, y: fase === 'cubriendo' ? 0 : -16 }}
        transition={{ duration: 0.35, delay: fase === 'cubriendo' ? 0.2 : 0 }}
      >
        {numero && <span className="texto-serif block text-2xl italic text-oro-claro">{numero}</span>}
        <span className="titulo-display mt-2 block text-[clamp(2.4rem,10vw,8rem)] text-hueso">{nombre}</span>
      </m.span>
    </m.div>
  )
}
