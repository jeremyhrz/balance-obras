import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import Foto from '../components/Foto'
import { Icono } from '../components/Iconos'
import Revelar from '../components/Revelar'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { SERVICIOS } from '../data/balance.js'
import { useCotizacion } from '../lib/cotizacion'

/**
 * Servicios (#servicios, brief §5.6). Escritorio: cinco paneles en acordeón horizontal; el que tiene
 * el cursor (o el foco) se abre con su foto, su texto y «Cotizar este servicio». Teléfono y tableta:
 * tarjetas apiladas con foto que se revelan al bajar. «Cotizar» preselecciona el tipo en #cotiza.
 */

// Foto referencial de cada servicio (ids de src/data/fotos.json; usos «tarjeta» 4:5 y «ancho» 21:9).
const FOTOS = {
  ingenieria: 'estructura-acero',
  construccion: 'estructura-encofrado',
  remodelacion: 'remodelacion-bano',
  asfaltado: 'asfaltado-pavimentadora',
  arquitectura: 'planos-mesa',
}

export default function Servicios() {
  const { irACotizar } = useCotizacion()
  const [abierto, setAbierto] = useState(SERVICIOS[0].id)

  return (
    <section id="servicios" className="relative">
      <div className="contenedor seccion">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rotulo id="servicios" />
            <TextoDividido como="h1" texto={'Lo que\n*construimos*'} className="titulo-pagina mt-6" />
          </div>
          <Revelar como="p" className="texto-lead max-w-md lg:text-right">
            De la ingeniería al <em>último acabado</em>, con supervisión en cada etapa.
          </Revelar>
        </div>

        {/* ── Escritorio: acordeón horizontal */}
        <ul className="mt-14 hidden h-[34rem] gap-2 lg:flex">
          {SERVICIOS.map((s) => {
            const activo = abierto === s.id
            return (
              <li
                key={s.id}
                onMouseEnter={() => setAbierto(s.id)}
                onFocus={() => setAbierto(s.id)}
                className={clsx(
                  'group relative min-w-0 overflow-hidden rounded-[2px] ring-1 ring-hueso/10 transition-[flex-grow] duration-700 ease-expo',
                  activo ? 'flex-[4.2]' : 'flex-1',
                )}
              >
                <Foto
                  id={FOTOS[s.id]}
                  uso="tarjeta"
                  rellenar
                  sizes="45vw"
                  posicionEtiqueta="arriba-derecha"
                  etiqueta={activo}
                  imgClassName={clsx('transition-transform duration-[1.4s] ease-expo', activo ? 'scale-100' : 'scale-110')}
                />
                <span aria-hidden="true" className={clsx('absolute inset-0 transition-colors duration-700', activo ? 'bg-gradient-to-t from-carbon via-carbon/55 to-carbon/10' : 'bg-carbon/75')} />

                {/* Cerrado: número y nombre en vertical */}
                <span aria-hidden={activo} className={clsx('absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-between py-6 transition-opacity duration-300', activo ? 'opacity-0' : 'opacity-100')}>
                  <Icono nombre={s.icono} className="size-8 text-oro" grosor={1.25} />
                  <span className="titulo-bloque min-h-0 whitespace-nowrap text-[clamp(0.95rem,1.15vw,1.1rem)] text-hueso [writing-mode:vertical-rl] [transform:rotate(180deg)]">{s.nombre}</span>
                  <span className="anotacion text-concreto">{s.numero}</span>
                </span>

                {/* Abierto: el detalle */}
                <div className={clsx('absolute inset-x-0 bottom-0 p-8 transition-all duration-700 ease-expo', activo ? 'translate-y-0 opacity-100 delay-150' : 'pointer-events-none translate-y-6 opacity-0')}>
                  <div className="flex items-center gap-3">
                    <Icono nombre={s.icono} className="size-9 text-oro" grosor={1.25} />
                    <span className="anotacion text-oro">{s.numero} / 05</span>
                  </div>
                  <h3 className="titulo-seccion mt-4 text-[clamp(1.6rem,2.4vw,2.4rem)]">{s.titulo}</h3>
                  <p className="texto-serif mt-3 max-w-md text-hueso/85">{s.descripcion}</p>
                  {s.etiquetas?.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {s.etiquetas.map((e) => (
                        <li key={e} className="anotacion rounded-[2px] px-2 py-1 text-hueso/70 ring-1 ring-hueso/15">{e}</li>
                      ))}
                    </ul>
                  )}
                  <button type="button" onClick={() => irACotizar(s.id)} className="boton boton-oro boton-chico mt-6" tabIndex={activo ? 0 : -1}>
                    <span>Cotizar este servicio</span>
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        {/* ── Teléfono y tableta: tarjetas apiladas con foto */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:hidden">
          {SERVICIOS.map((s, i) => (
            <Revelar como="li" key={s.id} retraso={(i % 2) * 0.06} className="overflow-hidden rounded-[2px] bg-hormigon ring-1 ring-hueso/10">
              <div className="relative">
                <Foto id={FOTOS[s.id]} uso="ancho" sizes="(min-width: 640px) 50vw, 100vw" className="block aspect-[16/9]" imgClassName="object-cover" posicionEtiqueta="arriba-derecha" revelar />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-hormigon via-hormigon/10 to-transparent" />
                <span className="absolute bottom-3 left-4 flex items-center gap-2">
                  <Icono nombre={s.icono} trazar retraso={0.2} className="size-8 text-oro" grosor={1.25} />
                  <span className="anotacion text-oro">{s.numero}</span>
                </span>
              </div>
              <div className="p-5">
                <h3 className="titulo-bloque">{s.titulo}</h3>
                <p className="texto-serif mt-2 text-hueso/80">{s.descripcion}</p>
                <button
                  type="button"
                  onClick={() => irACotizar(s.id)}
                  className="etiqueta mt-5 inline-flex min-h-[44px] items-center gap-2 text-oro transition-colors hover:text-oro-claro"
                >
                  Cotizar este servicio <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  )
}
