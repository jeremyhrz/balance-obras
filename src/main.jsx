import { Component, StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import Proveedores from './Proveedores'
import BarraProgreso from './components/BarraProgreso'
import Cursor from './components/Cursor'
import Grano from './components/Grano'
import './index.css'

/**
 * Arranque. Dos modos:
 * - Normal: la página completa (App.jsx). Se importa en diferido para que el modo aislado no
 *   dependa de ella; en producción vite.config.js lo junta todo en un solo archivo.
 * - Aislado, solo en desarrollo, ?solo=Portada,Servicios: monta solo esas secciones de
 *   src/sections/ (o de src/dev/, p. ej. ?solo=Muestrario), con todos los proveedores, el grano,
 *   la barra de progreso y el cursor, aunque otra sección esté a medias o rota.
 *   Ej.: /?solo=Plano   ·   /?solo=Navegacion,Portada,Plano   ·   /?solo=Intro,Portada
 * Parámetros: ?sinintro=1 salta la intro en el modo normal; ?intro=1 la fuerza (src/lib/intro.js).
 */

const raiz = createRoot(document.getElementById('root'))
const solo = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('solo') : null

if (import.meta.env.DEV && solo) {
  raiz.render(
    <StrictMode>
      <ModoAislado nombres={solo.split(',').map((n) => n.trim()).filter(Boolean)} />
    </StrictMode>,
  )
} else {
  import('./App.jsx').then(({ default: App }) =>
    raiz.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
}

const MODULOS = import.meta.env.DEV ? import.meta.glob(['./sections/*.jsx', './dev/*.jsx']) : {}
const RUTAS = Object.fromEntries(Object.keys(MODULOS).map((ruta) => [ruta.slice(ruta.lastIndexOf('/') + 1, -'.jsx'.length), ruta]))

function ModoAislado({ nombres }) {
  const conocidas = Object.keys(RUTAS)
  const desconocidas = nombres.filter((n) => !conocidas.includes(n))
  if (desconocidas.length) {
    console.warn(`?solo=: no existen ${desconocidas.join(', ')}. Hay: ${conocidas.join(', ')}`)
  }
  return (
    <Proveedores>
      {nombres
        .filter((n) => conocidas.includes(n))
        .map((n) => (
          <Aislar key={n} nombre={n}>
            <Suspense fallback={null}>
              <SeccionDiferida nombre={n} />
            </Suspense>
          </Aislar>
        ))}
      <BarraProgreso />
      <Grano />
      <Cursor />
    </Proveedores>
  )
}

const diferidas = {}
function SeccionDiferida({ nombre }) {
  diferidas[nombre] ??= lazy(MODULOS[RUTAS[nombre]])
  const Seccion = diferidas[nombre]
  return <Seccion />
}

/** Si una sección revienta, se ve el error en su sitio y las demás siguen funcionando. */
class Aislar extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <pre className="m-4 whitespace-pre-wrap rounded-sm bg-red-900/40 p-4 text-sm text-hueso">
        {`${this.props.nombre}: ${error.message}`}
      </pre>
    )
  }
}
