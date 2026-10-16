import Proveedores from './Proveedores'
import { HAY_INTRO } from './lib/intro'
import BarraProgreso from './components/BarraProgreso'
import Cursor from './components/Cursor'
import Grano from './components/Grano'
import Intro from './sections/Intro'
import Navegacion from './sections/Navegacion'
import Portada from './sections/Portada'
import Plano from './sections/Plano'
import Cinta from './sections/Cinta'
import Servicios from './sections/Servicios'
import Obras from './sections/Obras'
import Proceso from './sections/Proceso'
import Cotiza from './sections/Cotiza'
import Nosotros from './sections/Nosotros'
import Contacto from './sections/Contacto'
import CotizarFlotante from './sections/CotizarFlotante'

/** La página completa, en el orden del brief (§5). Cuándo sale la intro lo decide src/lib/intro.js. */
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
      <main id="contenido">
        <Portada />
        <Plano />
        <Cinta />
        <Servicios />
        <Obras />
        <Proceso />
        <Cotiza />
        <Nosotros />
      </main>
      <Contacto />
      <CotizarFlotante />
      <Grano />
      <Cursor />
    </Proveedores>
  )
}
