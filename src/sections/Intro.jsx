import { useEffect, useRef, useState } from 'react'
import { animate, m, useMotionValue, useTransform } from 'framer-motion'
import LineaLaser from '../components/LineaLaser'
import Logo from '../components/Logo'
import Polvo from '../components/Polvo'
import Reticula from '../components/Reticula'
import { terminarIntro } from '../lib/intro'
import { useMenosMovimiento } from '../lib/movimiento'
import { useBloquearScroll } from '../lib/scroll'

const BARRIDO_S = 0.55 // lo que tarda el láser en cruzar la pantalla
const TOPE_S = 2.2 // red de seguridad: pase lo que pase, a los 2,2 s empieza el barrido

/**
 * Intro «la obra arranca» (brief §5.1). VERSIÓN DE LA BASE: funcional y ≤ 2 s, para probar el
 * armado del logo; la sección de Intro puede pulirla o reescribirla entera (mismo archivo, mismo
 * export default). Solo sale en la 1.ª visita de la sesión (src/lib/intro.js).
 *
 * Retícula de plano que se traza → el logo SE ARMA (<Logo construir>: vigas de oro, concreto que
 * cae y asienta con una nube de <Polvo>, BALANCE letra a letra) → una <LineaLaser> barre la
 * pantalla de arriba abajo y la cortina se recorta con ella, destapando la portada (que ya estaba
 * pintada debajo). Se salta con un toque, la rueda o una tecla. Con «reducir movimiento»: el logo
 * aparece quieto y la cortina se funde.
 */
export default function Intro() {
  const menos = useMenosMovimiento()
  const [fase, setFase] = useState('armado') // armado → barrido → fin
  const barrido = useMotionValue(0)
  const recorte = useTransform(barrido, (v) => `inset(${(v * 100).toFixed(2)}% 0% 0% 0%)`)
  const polvo = useRef(null)
  const barrer = () => setFase((f) => (f === 'armado' ? 'barrido' : f))

  useBloquearScroll(fase === 'armado')

  // El barrido: avisa a la portada y a la navegación, y recorta la cortina detrás del láser.
  useEffect(() => {
    if (fase !== 'barrido') return undefined
    terminarIntro()
    if (menos) {
      const t = window.setTimeout(() => setFase('fin'), 400)
      return () => window.clearTimeout(t)
    }
    const control = animate(barrido, 1, { duration: BARRIDO_S, ease: [0.65, 0, 0.35, 1], onComplete: () => setFase('fin') })
    return () => control.stop()
  }, [fase, menos, barrido])

  // Saltar: cualquier toque, la rueda o una tecla. Y la red de seguridad.
  useEffect(() => {
    if (fase !== 'armado') return undefined
    const eventos = ['pointerdown', 'wheel', 'touchmove', 'keydown']
    eventos.forEach((e) => window.addEventListener(e, barrer, { passive: true }))
    const tope = window.setTimeout(barrer, TOPE_S * 1000)
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, barrer))
      window.clearTimeout(tope)
    }
  }, [fase])

  if (fase === 'fin') return null

  return (
    <div
      aria-hidden="true"
      data-intro=""
      className="fixed inset-0 z-intro"
      style={{ pointerEvents: fase === 'armado' ? 'auto' : 'none' }}
    >
      <m.div
        className="absolute inset-0 overflow-hidden bg-carbon"
        style={{ clipPath: menos ? undefined : recorte }}
        animate={menos && fase === 'barrido' ? { opacity: 0 } : undefined}
        transition={{ duration: 0.35 }}
      >
        <Reticula alMontar trazar ejes cruces desvanecer="bordes" opacidad={0.9} />
        <div className="absolute inset-0 grid place-items-center px-8">
          <Logo
            construir
            retraso={0.15}
            velocidad={1.15}
            className="h-auto w-[min(76vw,28rem)]"
            alAsentar={(_, elemento) => polvo.current?.rafagaEn(elemento?.getBoundingClientRect(), { fuerza: 1.3, cantidad: 44 })}
            alTerminar={barrer}
          />
        </div>
        <Polvo ref={polvo} modo="rafaga" />
      </m.div>
      {fase === 'barrido' && !menos && <LineaLaser posicion={barrido} intensidad={1.4} />}
    </div>
  )
}
