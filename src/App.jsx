import Proveedores from './Proveedores'
import { HAY_INTRO } from './lib/intro'
import { useRutas } from './lib/rutas'
import BarraProgreso from './components/BarraProgreso'
import Cursor from './components/Cursor'
import Grano from './components/Grano'
import Siguiente from './components/Siguiente'
import Intro from './sections/Intro'
import Navegacion from './sections/Navegacion'
import Portada from './sections/Portada'
import Plano from './sections/Plano'
import Cinta from './sections/Cinta'
import Explora from './sections/Explora'
import Servicios from './sections/Servicios'
import Obras from './sections/Obras'
import Proceso from './sections/Proceso'
import Cotiza from './sections/Cotiza'
import Nosotros from './sections/Nosotros'
import Contacto from './sections/Contacto'
import Pie from './sections/Pie'
import CotizarFlotante from './sections/CotizarFlotante'

/**
 * La web en PÁGINAS (src/lib/rutas.jsx): Inicio (portada + «De plano a realidad» + el índice),
 * y una página corta por cada parte, que termina con un gran «Siguiente →». El pie va en todas.
 * Cuándo sale la intro lo decide src/lib/intro.js (la primera visita de la sesión, en cualquier página).
 */
const PAGINAS = {
  inicio: () => (
    <>
      <Portada />
      <Plano />
      <Cinta />
      <Explora />
    </>
  ),
  servicios: () => (
    <>
      <Servicios />
      <Siguiente a="obras" />
    </>
  ),
  obras: () => (
    <>
      <Obras />
      <Siguiente a="proceso" />
    </>
  ),
  proceso: () => (
    <>
      <Proceso />
      <Siguiente a="cotiza" />
    </>
  ),
  cotiza: () => (
    <>
      <Cotiza />
      <Siguiente a="nosotros" />
    </>
  ),
  nosotros: () => (
    <>
      <Nosotros />
      <Siguiente a="contacto" />
    </>
  ),
  contacto: () => (
    <>
      <Contacto />
      <Siguiente a="inicio" texto="Volver al" etiqueta="Volver al inicio" />
    </>
  ),
}

export default function App() {
  return (
    <Proveedores>
      {HAY_INTRO && <Intro />}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-modal focus:rounded-sm focus:bg-oro focus:px-5 focus:py-3 focus:text-carbon"
      >
        Saltar al contenido
      </a>
      <BarraProgreso />
      <Navegacion />
      <Contenido />
      <CotizarFlotante />
      <Grano />
      <Cursor />
    </Proveedores>
  )
}

function Contenido() {
  const { pagina } = useRutas()
  const Pagina = PAGINAS[pagina] ?? PAGINAS.inicio
  return (
    <>
      <main id="contenido" key={pagina}>
        <Pagina />
      </main>
      <Pie />
    </>
  )
}
