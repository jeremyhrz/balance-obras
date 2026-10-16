import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { ProveedorCotizacion } from './lib/cotizacion'
import { ProveedorRutas } from './lib/rutas'
import { ProveedorScroll } from './lib/scroll'

/**
 * Todo lo que las secciones comparten. Lo usan App.jsx y el modo aislado (?solo=) de main.jsx.
 * reducedMotion="user": con «reducir movimiento», framer-motion apaga los desplazamientos.
 *
 * LazyMotion + domAnimation: los componentes animados son `m.div`, `m.path`… (NO `motion.*`).
 * El bundle trae animaciones, variantes, exit (AnimatePresence, también mode="popLayout"),
 * whileInView, hover/tap/focus y useScroll/useTransform, pero NO el código de layout
 * (`layout`, `layoutId`) ni el de arrastre (`drag`): son 13 KB gzip que el presupuesto de JS
 * (≤ 180 KB) no se puede permitir. Esas props no dan error: simplemente no hacen nada.
 * Para un layout animado usa useFlip (src/lib/flip.js); para arrastrar, eventos de puntero.
 * `strict`: en desarrollo, un `motion.*` olvidado revienta con un aviso claro en vez de inflar el
 * bundle sin avisar.
 */
export default function Proveedores({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <ProveedorScroll>
          <ProveedorRutas>
            <ProveedorCotizacion>{children}</ProveedorCotizacion>
          </ProveedorRutas>
        </ProveedorScroll>
      </MotionConfig>
    </LazyMotion>
  )
}
