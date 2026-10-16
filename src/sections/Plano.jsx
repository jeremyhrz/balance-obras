import { useRef, useState } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion'
import clsx from 'clsx'
import Contador from '../components/Contador'
import Foto from '../components/Foto'
import Reticula from '../components/Reticula'
import Rotulo from '../components/Rotulo'
import { PASOS_PLANO } from '../data/balance.js'
import { useDerivado, useMapeo } from '../lib/mapeo'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'
import Edificio from './plano/Edificio'

/**
 * «De plano a realidad» (#plano, brief §5.4) — LA ESTRELLA. Una sección alta con un escenario fijo
 * (sticky) que se cuenta con el scroll: el plano se traza, la estructura se levanta piso a piso,
 * llegan los acabados mientras el fondo pasa del azul de plano al carbón, y al final la obra real
 * aparece primero en su versión de plano y después terminada. A un lado, los cinco pasos y el
 * contador «Obra al 0 % → 100 %». Todo cuelga de un único MotionValue (avance del scroll).
 */

// Dónde empieza cada paso (en el avance 0–1 de la sección).
const INICIOS = [0, 0.18, 0.3, 0.56, 0.77]
const RECORTE = (v) => `inset(${v}% 0 0 0)`

export default function Plano() {
  const menos = useMenosMovimiento()
  return menos ? <PlanoQuieto /> : <PlanoAnimado />
}

function PlanoAnimado() {
  const seccion = useRef(null)
  const { scrollYProgress: p } = useScroll({ target: seccion, offset: ['start start', 'end end'] })
  const [paso, setPaso] = useState(0)
  const [fotosListas, setFotosListas] = useState(false)
  useMotionValueEvent(p, 'change', (v) => {
    let i = 0
    INICIOS.forEach((inicio, j) => { if (v >= inicio) i = j })
    setPaso((actual) => (actual === i ? actual : i))
    // Las fotos de la fase D se montan al llegar a la estructura (no en la primera carga) y se quedan.
    if (v > 0.4) setFotosListas(true)
  })

  const fondo = useMapeo(p, [0, 0.55, 0.76], ['#0D2742', '#0D2742', '#111213'])
  const reticula = useMapeo(p, [0.55, 0.76], [1, 0.12])
  const porcentaje = useMapeo(p, [0, 0.95], [0, 100], { clamp: true })
  const barra = useMapeo(p, [0, 0.95], [0, 1], { clamp: true })
  // Fase D: la obra real, primero en plano y luego terminada (se destapa de abajo arriba).
  const fotoPlano = useMapeo(p, [0.76, 0.82], [0, 1], { clamp: true })
  const destape = useMapeo(p, [0.83, 0.94], [100, 0], { clamp: true })
  const recorte = useDerivado(destape, RECORTE)
  const escalaFoto = useMapeo(p, [0.83, 1], [1.12, 1])
  const dibujo = useMapeo(p, [0.8, 0.9], [1, 0])
  const colorTexto = useMapeo(p, [0.55, 0.76], ['#6FA4DB', '#C9A45C'])

  const actual = PASOS_PLANO[paso]

  return (
    <section id="plano" ref={seccion} className="relative h-[360svh] lg:h-[390vh]" aria-labelledby="plano-titulo">
      <m.div className="sticky top-0 flex h-svh flex-col overflow-hidden" style={{ backgroundColor: fondo }}>
        <m.div className="absolute inset-0" style={{ opacity: reticula }}>
          <Reticula variante="plano" ejes cruces opacidad={0.9} />
        </m.div>

        <div className="contenedor relative flex min-h-0 flex-1 flex-col pb-5 pt-[calc(var(--alto-nav)+0.75rem)] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-14 lg:pb-10">
          {/* ── Texto: rótulo, título y pasos */}
          <div className="relative z-10 lg:self-center">
            <Rotulo id="plano" tono="plano" />
            <h2 id="plano-titulo" className="titulo-seccion mt-3 text-[clamp(1.6rem,7.6vw,4.6rem)] lg:mt-6 lg:text-[clamp(3rem,4.9vw,4.4rem)]">
              De plano a <m.span style={{ color: colorTexto }}>realidad</m.span>
            </h2>

            {/* Teléfono: solo el paso actual, que cambia con un barrido */}
            <div className="relative mt-3 h-[7.25rem] lg:hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div
                  key={actual.numero}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: EXPO }}
                  className="absolute inset-x-0 top-0"
                >
                  <p className="anotacion text-plano-linea">{actual.numero} / 05 · {actual.anotacion}</p>
                  <h3 className="titulo-bloque mt-1.5 text-hueso">{actual.titulo}</h3>
                  <p className="texto-serif mt-1 text-hueso/85">{actual.texto}</p>
                </m.div>
              </AnimatePresence>
            </div>

            {/* Escritorio: los cinco pasos, con el actual encendido */}
            <ol className="mt-10 hidden space-y-1 lg:block">
              {PASOS_PLANO.map((pp, i) => {
                const activo = i === paso
                const hecho = i < paso
                return (
                  <li
                    key={pp.numero}
                    className={clsx(
                      'grid grid-cols-[3rem_1fr] gap-x-4 border-l py-3 pl-5 transition-all duration-500',
                      activo ? 'border-oro opacity-100' : hecho ? 'border-hueso/25 opacity-60' : 'border-hueso/10 opacity-35',
                    )}
                  >
                    <span className={clsx('anotacion pt-1', activo ? 'text-oro' : 'text-concreto')}>{pp.numero}</span>
                    <span>
                      <span className="titulo-bloque block text-hueso">{pp.titulo}</span>
                      <span
                        className={clsx(
                          'texto-serif block overflow-hidden text-hueso/80 transition-all duration-500',
                          activo ? 'mt-2 max-h-24 opacity-100' : 'max-h-0 opacity-0',
                        )}
                      >
                        {pp.texto}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* ── Escenario: el edificio y la obra real encima */}
          <div className="relative mt-2 min-h-0 flex-1 lg:mt-0 lg:h-[78vh] lg:flex-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative aspect-[400/470] h-full max-h-full max-w-full">
                <m.div className="absolute inset-0" style={{ opacity: dibujo }}>
                  <Edificio p={p} className="size-full overflow-visible" />
                </m.div>
                {fotosListas && (
                <m.div className="absolute inset-[3%] overflow-hidden rounded-[2px]" style={{ opacity: fotoPlano }}>
                  <Foto id="arquitectura-edificio" uso="movil-plano" rellenar etiqueta={false} alt="" sizes="(min-width: 1024px) 40vw, 80vw" />
                  <m.div className="absolute inset-0" style={{ clipPath: recorte }}>
                    <m.div className="absolute inset-0" style={{ scale: escalaFoto }}>
                      <Foto id="arquitectura-edificio" uso="movil" rellenar posicionEtiqueta="arriba-derecha" sizes="(min-width: 1024px) 40vw, 80vw" />
                    </m.div>
                  </m.div>
                </m.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Avance de la obra */}
        <div className="contenedor relative pb-5 lg:pb-8">
          <div className="flex items-end justify-between gap-4">
            <p className="etiqueta text-hueso/70">Obra al</p>
            <p className="font-marca text-[clamp(1.6rem,6vw,3rem)] leading-none text-oro">
              <Contador movimiento={porcentaje} formato={(n) => Math.round(n)} sufijo=" %" />
            </p>
          </div>
          <div className="mt-3 h-px w-full bg-hueso/15">
            <m.div className="h-px w-full origin-left bg-oro" style={{ scaleX: barra }} />
          </div>
          <ol className="mt-2 flex justify-between" aria-hidden="true">
            {PASOS_PLANO.map((pp, i) => (
              <li key={pp.numero} className={clsx('anotacion transition-colors duration-300', i <= paso ? 'text-oro' : 'text-hueso/30')}>
                {pp.numero}
              </li>
            ))}
          </ol>
        </div>

        {/* Para lectores de pantalla: los cinco pasos completos */}
        <ol className="sr-only">
          {PASOS_PLANO.map((pp) => (
            <li key={pp.numero}>{pp.numero}. {pp.titulo}: {pp.texto}</li>
          ))}
        </ol>
      </m.div>
    </section>
  )
}

/** Con «reducir movimiento»: la obra terminada y los cinco pasos, sin escenario fijo. */
function PlanoQuieto() {
  return (
    <section id="plano" className="relative overflow-hidden bg-carbon" aria-labelledby="plano-titulo">
      <div className="contenedor seccion grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Rotulo id="plano" />
          <h2 id="plano-titulo" className="titulo-seccion mt-6">De plano a <span className="enfasis">realidad</span></h2>
          <ol className="mt-10 space-y-5">
            {PASOS_PLANO.map((pp) => (
              <li key={pp.numero} className="border-l border-oro/40 pl-5">
                <p className="anotacion text-oro">{pp.numero} · {pp.anotacion}</p>
                <h3 className="titulo-bloque mt-1">{pp.titulo}</h3>
                <p className="mt-1 text-sm text-hueso/75">{pp.texto}</p>
              </li>
            ))}
          </ol>
        </div>
        <Foto id="arquitectura-edificio" uso="movil" className="mx-auto aspect-[9/16] max-h-[80vh]" sizes="(min-width: 1024px) 40vw, 90vw" />
      </div>
    </section>
  )
}
