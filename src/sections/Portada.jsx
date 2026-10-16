import { useRef } from 'react'
import { m } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import EtiquetaReferencial from '../components/EtiquetaReferencial'
import Foto from '../components/Foto'
import LineaLaser, { useNivelPuntero } from '../components/LineaLaser'
import Magnetico from '../components/Magnetico'
import Polvo from '../components/Polvo'
import Reticula from '../components/Reticula'
import Enlace from '../components/Enlace'
import TextoDividido, { Enfasis } from '../components/TextoDividido'
import { CIFRAS, PORTADA } from '../data/balance.js'
import { useCotizacion } from '../lib/cotizacion'
import { useIntroTerminada } from '../lib/intro'
import { EXPO, usePunteroFino } from '../lib/movimiento'
import { alClicAncla } from '../lib/scroll'

/**
 * Portada (#inicio, brief §5.3) — STUB de la base: foto a pantalla completa (todavía el recuadro
 * de plano: falta la foto «portada» en fotos.json), retícula, polvo ambiente, la línea láser que
 * sigue al cursor / la inclinación, titular, bajada, cifras y los dos botones.
 * FALTA (sección Portada): la foto o el video real con su gradación, las cotas que se trazan, el
 * indicador de scroll definitivo y el pulido de la entrada tras la intro.
 */
export default function Portada() {
  const ref = useRef(null)
  const listo = useIntroTerminada()
  const { irACotizar } = useCotizacion()
  const fino = usePunteroFino()
  // Con dedo, la línea vive en la franja libre de arriba; con ratón, sigue al cursor.
  const { posicion, giro } = useNivelPuntero(ref, fino ? { inicial: 0.7 } : { inicial: 0.2, rango: [0.12, 0.26] })
  const entrar = (retraso) => ({
    initial: { opacity: 0, y: 24 },
    animate: listo ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: EXPO, delay: retraso },
  })

  return (
    <section id="inicio" ref={ref} className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden pb-14 pt-28 lg:pb-20">
      <Foto id="portada" movil="movil" rellenar prioridad alt="" proporcion="16:9" vineta etiqueta={false} className="-z-10" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-carbon via-carbon/55 to-carbon/20" />
      <Reticula trazar desvanecer="bordes" opacidad={0.8} />
      <Polvo />
      <LineaLaser posicion={posicion} giro={giro} lectura={fino} etiqueta={fino ? 'Nivel láser' : undefined} intensidad={0.7} />
      <EtiquetaReferencial posicion="abajo-derecha" />

      <div className="contenedor relative">
        <m.p className="etiqueta text-oro" {...entrar(0.1)}>
          {PORTADA.bajada}
        </m.p>
        {listo && <TextoDividido como="h1" texto={PORTADA.titulo} alVer={false} retraso={0.15} className="titulo-display mt-5 max-w-[14ch]" />}
        {!listo && <h1 className="titulo-display mt-5 max-w-[14ch] opacity-0">{PORTADA.titulo.replace(/\*/g, '')}</h1>}
        <m.div {...entrar(0.45)}>
          <Enfasis como="p" texto={PORTADA.texto} className="texto-lead mt-6 max-w-xl" />
        </m.div>
        <m.div className="mt-8 flex flex-wrap items-center gap-3" {...entrar(0.6)}>
          <Magnetico>
            <button type="button" onClick={() => irACotizar()} className="boton boton-oro">
              <span>Cotiza tu obra</span>
            </button>
          </Magnetico>
          <Enlace a="obras" className="boton boton-linea">
            <span>Ver obras</span>
          </Enlace>
        </m.div>
        <m.dl className="mt-10 flex gap-10 border-t border-hueso/10 pt-6" {...entrar(0.75)}>
          {CIFRAS.map((c) => (
            <div key={c.id}>
              <dt className="sr-only">{c.etiqueta}</dt>
              <dd className="font-marca text-2xl text-hueso md:text-3xl">{c.cifra}</dd>
              <dd className="etiqueta mt-2 text-concreto">{c.etiqueta}</dd>
            </div>
          ))}
        </m.dl>
      </div>

      <m.a
        href="#plano"
        onClick={alClicAncla}
        aria-label="Bajar a «De plano a realidad»"
        className="absolute bottom-6 right-[var(--margen)] hidden size-12 place-items-center rounded-full text-hueso/70 ring-1 ring-hueso/20 md:grid"
        {...entrar(0.9)}
      >
        <ArrowDown className="size-5" strokeWidth={1.5} />
      </m.a>
    </section>
  )
}
