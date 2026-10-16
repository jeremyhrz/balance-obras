import { useRef } from 'react'
import { m, useInView } from 'framer-motion'
import Contador from '../components/Contador'
import Foto from '../components/Foto'
import Revelar from '../components/Revelar'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { BALANCE, CIFRAS, NOSOTROS } from '../data/balance.js'
import { useMenosMovimiento } from '../lib/movimiento'

/**
 * Nosotros (#nosotros, brief §5.10): «El balance entre costo, tiempo y calidad». Un NIVEL DE
 * BURBUJA llega torcido y se equilibra al entrar en pantalla (la burbuja se centra con un resorte):
 * el nombre de la marca hecho objeto. Debajo, los tres pilares; al lado, la obra (foto referencial)
 * con las cifras que dio Jeremy (+10 años, cientos de proyectos). Nombre y foto del ingeniero: POR
 * CONFIRMAR en balance.js (si llegan, se muestran solos).
 */
export default function Nosotros() {
  const nivel = useRef(null)
  const visto = useInView(nivel, { once: true, amount: 0.6 })
  const menos = useMenosMovimiento()
  const equilibrado = visto || menos
  const experiencia = CIFRAS.find((c) => c.id === 'experiencia')
  const proyectos = CIFRAS.find((c) => c.id === 'proyectos')
  const nombre = BALANCE.ingeniero.nombre

  return (
    <section id="nosotros" className="relative overflow-hidden">
      <div className="contenedor seccion grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
        <div>
          <Rotulo id="nosotros" />
          <TextoDividido como="h2" texto={NOSOTROS.titulo} className="titulo-seccion mt-6" />
          <Revelar como="p" className="mt-6 max-w-xl text-hueso/80">{NOSOTROS.texto}</Revelar>

          {/* El nivel de burbuja */}
          <div ref={nivel} className="mt-12 max-w-xl">
            <m.div
              initial={false}
              animate={{ rotate: equilibrado ? 0 : -5 }}
              transition={{ type: 'spring', stiffness: 60, damping: 7, mass: 1.1, delay: 0.25 }}
              className="relative h-16 rounded-[3px] bg-[linear-gradient(180deg,#E8CC8E_0%,#C9A45C_45%,#8A6A33_100%)] p-[3px] shadow-profunda"
              aria-hidden="true"
            >
              <div className="relative flex h-full items-center justify-center rounded-[2px] bg-hormigon">
                {/* marcas de la regla */}
                <div className="absolute inset-x-3 bottom-1 flex justify-between">
                  {Array.from({ length: 25 }, (_, i) => (
                    <span key={i} className={i % 6 === 0 ? 'h-2.5 w-px bg-hueso/40' : 'h-1.5 w-px bg-hueso/15'} />
                  ))}
                </div>
                {/* el tubo con la burbuja */}
                <div className="relative h-7 w-[46%] overflow-hidden rounded-full bg-[linear-gradient(180deg,rgba(201,224,170,0.35),rgba(150,190,110,0.18))] ring-1 ring-hueso/25">
                  <span className="absolute inset-y-0 left-[calc(50%-1.65rem)] w-px bg-carbon/70" />
                  <span className="absolute inset-y-0 left-[calc(50%+1.65rem)] w-px bg-carbon/70" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <m.span
                      initial={false}
                      animate={{ x: equilibrado ? 0 : 58 }}
                      transition={{ type: 'spring', stiffness: 70, damping: 8, delay: 0.3 }}
                      className="block h-4 w-12 rounded-full bg-[radial-gradient(ellipse_at_40%_35%,rgba(255,255,255,0.95),rgba(236,234,229,0.55)_55%,rgba(236,234,229,0.2))]"
                    />
                  </span>
                </div>
              </div>
            </m.div>
            <ul className="mt-6 grid grid-cols-3 gap-4">
              {NOSOTROS.pilares.map((p, i) => (
                <Revelar como="li" key={p.id} retraso={0.15 + i * 0.08} className="border-t border-oro/40 pt-3">
                  <p className="etiqueta text-oro">{p.nombre}</p>
                  <p className="mt-2 text-sm text-hueso/75">{p.texto}</p>
                </Revelar>
              ))}
            </ul>
          </div>
        </div>

        {/* La obra y las cifras */}
        <figure className="relative">
          <Foto
            id={BALANCE.ingeniero.foto ?? 'equipo-obreros'}
            uso={BALANCE.ingeniero.foto ? undefined : 'tarjeta'}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/5] rounded-[2px]"
            imgClassName="object-cover"
            posicionEtiqueta="arriba-derecha"
            revelar
            parallax={0.08}
          />
          <figcaption className="relative -mt-20 ml-auto w-[88%] rounded-[2px] bg-carbon/90 p-6 ring-1 ring-hueso/10 backdrop-blur md:-mt-24 md:p-7">
            <p className="etiqueta text-oro">{nombre ? `Ing. ${nombre}` : BALANCE.ingeniero.titulo}</p>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <div>
                <p className="font-marca text-[clamp(2rem,6vw,3rem)] leading-none text-hueso">
                  {experiencia?.valor ? <Contador valor={experiencia.valor} prefijo={experiencia.prefijo} /> : experiencia?.cifra}
                </p>
                <p className="anotacion mt-2 text-concreto">{experiencia?.etiqueta}</p>
              </div>
              <div>
                <p className="font-marca text-[clamp(1.4rem,4.4vw,2.1rem)] leading-[1.35] text-hueso">{proyectos?.cifra}</p>
                <p className="anotacion mt-2 text-concreto">{proyectos?.etiqueta}</p>
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
