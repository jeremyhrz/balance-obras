import { useRef, useState } from 'react'
import { m, useMotionValueEvent, useScroll } from 'framer-motion'
import clsx from 'clsx'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { PROCESO } from '../data/balance.js'
import { useDerivado, useMapeo } from '../lib/mapeo'
import { useMenosMovimiento } from '../lib/movimiento'

/**
 * Proceso (#proceso, brief §5.8): «Paso a paso, a plomo». Una plomada cuelga de su cable dorado y
 * BAJA con el scroll por la línea de los cinco pasos; cada paso se enciende cuando la plomada llega.
 * Todo cuelga del avance del scroll de la lista (MotionValues: nada re-renderiza salvo el paso activo).
 */

const ALTURA = (v) => `${v * 100}%`

export default function Proceso() {
  const lista = useRef(null)
  const menos = useMenosMovimiento()
  const { scrollYProgress } = useScroll({ target: lista, offset: ['start 72%', 'end 55%'] })
  const avance = useMapeo(scrollYProgress, [0, 1], [0, 1])
  const alto = useDerivado(avance, ALTURA)
  const [activo, setActivo] = useState(menos ? PROCESO.length - 1 : -1)
  useMotionValueEvent(avance, 'change', (v) => {
    const i = Math.min(PROCESO.length - 1, Math.floor(v * PROCESO.length + 0.15)) // se enciende al llegar la plomada
    setActivo((a) => (a === i ? a : i))
  })

  return (
    <section id="proceso" className="relative overflow-hidden bg-hormigon">
      <div className="contenedor seccion grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-[calc(var(--alto-nav)+3rem)] lg:self-start">
          <Rotulo id="proceso" />
          <TextoDividido como="h1" texto={'Paso a paso,\n*a plomo*'} className="titulo-pagina mt-6" />
          <p className="texto-lead mt-6 max-w-md">
            Una obra derecha se construye <em>en orden</em>. Así trabajamos, de la primera visita a la entrega.
          </p>
        </div>

        <ol ref={lista} className="relative pl-14 md:pl-20">
          {/* Cable y plomada */}
          <span aria-hidden="true" className="absolute bottom-2 left-[18px] top-2 w-px bg-hueso/12 md:left-[26px]" />
          <m.span
            aria-hidden="true"
            className="absolute left-[18px] top-2 w-px bg-gradient-to-b from-oro-claro via-oro to-oro-medio md:left-[26px]"
            style={{ height: menos ? '100%' : alto }}
          >
            <span className="absolute -bottom-[26px] left-1/2 -translate-x-1/2">
              <Plomada />
            </span>
          </m.span>

          {PROCESO.map((paso, i) => {
            const encendido = i <= activo
            return (
              <li key={paso.numero} className="relative pb-14 last:pb-2 md:pb-20">
                <span
                  aria-hidden="true"
                  className={clsx(
                    'absolute -left-[42px] top-1 flex size-[13px] rotate-45 items-center justify-center border transition-all duration-500 md:-left-[60px]',
                    encendido ? 'border-oro bg-oro shadow-oro' : 'border-hueso/30 bg-hormigon',
                  )}
                />
                <p className={clsx('anotacion transition-colors duration-500', encendido ? 'text-oro' : 'text-concreto')}>
                  {paso.numero} / 05
                </p>
                <h3 className={clsx('titulo-bloque mt-2 transition-colors duration-500', encendido ? 'text-hueso' : 'text-hueso/45')}>
                  {paso.titulo}
                </h3>
                <p className={clsx('texto-serif mt-2 max-w-xl transition-colors duration-500', encendido ? 'text-hueso/85' : 'text-hueso/35')}>
                  {paso.texto}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/** La plomada: cono de latón con su anilla, como la del albañil. */
function Plomada() {
  return (
    <svg viewBox="0 0 24 34" className="block h-[30px] w-[22px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]" focusable="false">
      <defs>
        <linearGradient id="plomada-oro" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8A6A33" />
          <stop offset="0.35" stopColor="#E8CC8E" />
          <stop offset="0.6" stopColor="#C9A45C" />
          <stop offset="1" stopColor="#8A6A33" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="3" r="2.2" fill="none" stroke="#C9A45C" strokeWidth="1.2" />
      <rect x="7" y="5.5" width="10" height="5" rx="1" fill="url(#plomada-oro)" />
      <path d="M5 11 H19 L12 33 Z" fill="url(#plomada-oro)" />
    </svg>
  )
}
