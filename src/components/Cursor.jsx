import { useEffect, useState } from 'react'
import { m, useMotionValue, useSpring } from 'framer-motion'
import { SUAVE, useMenosMovimiento, usePunteroFino } from '../lib/movimiento'

const INTERACTIVOS = 'a, button, [role="button"], label, summary, select'

/**
 * Cursor propio (solo escritorio con ratón): un punto pegado al puntero y un aro que lo persigue
 * con resorte, en modo «diferencia» (se ve sobre claro y sobre oscuro). Sobre enlaces y botones el
 * aro crece; sobre un elemento con `data-cursor="Ver"` (o cualquier palabra corta) aparece un
 * círculo de oro con ese texto.
 *   <figure data-cursor="Ver">…</figure>      <div data-cursor="Arrastra">…</div>
 * En el teléfono y con «reducir movimiento» no existe: queda el cursor del sistema.
 */
export default function Cursor() {
  const fino = usePunteroFino()
  const menos = useMenosMovimiento()
  return fino && !menos ? <CursorActivo /> : null
}

function CursorActivo() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const resorte = { stiffness: 260, damping: 28, mass: 0.6 }
  const aroX = useSpring(x, resorte)
  const aroY = useSpring(y, resorte)
  const [visible, setVisible] = useState(false)
  const [modo, setModo] = useState({ tipo: 'normal', texto: '' })

  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.add('con-cursor')
    const mover = (evento) => {
      x.set(evento.clientX)
      y.set(evento.clientY)
      setVisible(true)
    }
    const sobre = (evento) => {
      const objetivo = evento.target instanceof Element ? evento.target : null
      const conTexto = objetivo?.closest('[data-cursor]')
      if (conTexto?.dataset.cursor) setModo({ tipo: 'texto', texto: conTexto.dataset.cursor })
      else if (objetivo?.closest(INTERACTIVOS)) setModo({ tipo: 'enlace', texto: '' })
      else setModo({ tipo: 'normal', texto: '' })
    }
    const salir = (evento) => {
      if (!evento.relatedTarget) setVisible(false)
    }
    const ocultar = () => setVisible(false)

    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('pointerover', sobre, { passive: true })
    document.addEventListener('pointerout', salir, { passive: true })
    window.addEventListener('blur', ocultar)
    return () => {
      raiz.classList.remove('con-cursor')
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerover', sobre)
      document.removeEventListener('pointerout', salir)
      window.removeEventListener('blur', ocultar)
    }
  }, [x, y])

  const conTexto = modo.tipo === 'texto'
  const transicion = { duration: 0.35, ease: SUAVE }
  const capa = 'pointer-events-none fixed inset-0 z-cursor transition-opacity duration-300'

  return (
    <>
      {/* Capa en «diferencia»: el modo de fusión va en el elemento fijo para mezclarse con la página. */}
      <div aria-hidden="true" className={`${capa} mix-blend-difference`} style={{ opacity: visible ? 1 : 0 }}>
        <m.div className="absolute left-0 top-0" style={{ x: aroX, y: aroY }}>
          <m.div
            className="absolute -left-[17px] -top-[17px] size-[34px] rounded-full border border-white"
            initial={false}
            animate={{ scale: modo.tipo === 'enlace' ? 1.65 : 1, opacity: conTexto ? 0 : 1 }}
            transition={transicion}
          />
        </m.div>
        <m.div className="absolute left-0 top-0" style={{ x, y }}>
          <m.div
            className="absolute -left-[3px] -top-[3px] size-1.5 rounded-full bg-white"
            initial={false}
            animate={{ scale: modo.tipo === 'normal' ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </m.div>
      </div>
      {/* Círculo con texto («Ver», «Arrastra»…), sin fusión para que se lea. */}
      <div aria-hidden="true" className={capa} style={{ opacity: visible ? 1 : 0 }}>
        <m.div className="absolute left-0 top-0" style={{ x: aroX, y: aroY }}>
          <m.div
            className="absolute -left-[42px] -top-[42px] grid size-[84px] place-items-center rounded-full bg-oro shadow-lg"
            initial={false}
            animate={{ scale: conTexto ? 1 : 0.2, opacity: conTexto ? 1 : 0 }}
            transition={transicion}
          >
            <span className="etiqueta text-[10px] text-carbon">{modo.texto}</span>
          </m.div>
        </m.div>
      </div>
    </>
  )
}
