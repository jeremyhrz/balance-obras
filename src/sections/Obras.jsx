import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import Foto from '../components/Foto'
import Reticula from '../components/Reticula'
import Revelar from '../components/Revelar'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { OBRAS, categoriaDe, categoriasConObras, nombreObra, obrasPorCategoria } from '../data/obras.js'
import { useFlip } from '../lib/flip'
import Comparador from './obras/Comparador'
import Visor from './obras/Visor'

/**
 * Obras (#obras, brief §5.7): portafolio con filtros (layout animado con useFlip), tarjetas con
 * «Imagen referencial», visor a pantalla completa y el comparador «Plano / Obra».
 * Las obras salen de src/data/obras.js (hoy, de ejemplo; README → «Cómo agregar una obra nueva»).
 */
export default function Obras() {
  const [filtro, setFiltro] = useState('todas')
  const [abierta, setAbierta] = useState(null)
  const grilla = useRef(null)
  useFlip(grilla, filtro)

  const categorias = categoriasConObras()
  const visibles = obrasPorCategoria(filtro)
  const hayReferenciales = OBRAS.some((o) => o.referencial)

  return (
    <section id="obras" className="relative isolate overflow-hidden">
      <Reticula desvanecer="abajo" opacidad={0.6} />
      <div className="contenedor seccion relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rotulo id="obras" />
            <TextoDividido como="h2" texto={'Obras que\n*hablan*'} className="titulo-seccion mt-6" />
          </div>
          <Revelar como="p" className="max-w-md text-hueso/75 lg:text-right">
            Construcción, remodelación, asfaltado y proyectos arquitectónicos. Toca una obra para verla completa.
          </Revelar>
        </div>

        <div role="group" aria-label="Filtrar obras por tipo" className="sin-barra -mx-[var(--margen)] mt-10 flex gap-2 overflow-x-auto px-[var(--margen)] pb-1">
          {categorias.map((c) => {
            const activa = filtro === c.id
            const cuantas = obrasPorCategoria(c.id).length
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={activa}
                onClick={() => setFiltro(c.id)}
                className={clsx(
                  'etiqueta flex shrink-0 items-center gap-2 rounded-[2px] px-3.5 py-2.5 ring-1 transition-colors duration-300',
                  activa ? 'bg-oro text-carbon ring-oro' : 'text-hueso/75 ring-hueso/15 hover:text-hueso hover:ring-hueso/40',
                )}
              >
                {c.nombre}
                <span className={clsx('anotacion', activa ? 'text-carbon/70' : 'text-concreto')}>{String(cuantas).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>

        <ul ref={grilla} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {visibles.map((obra, i) => {
            const grande = obra.destacada && filtro === 'todas'
            return (
              <li key={obra.id} data-flip={obra.id} className={clsx(grande && 'sm:col-span-2')}>
                <button
                  type="button"
                  onClick={() => setAbierta(obra)}
                  data-cursor="Ver"
                  className="group relative block w-full overflow-hidden rounded-[2px] text-left ring-1 ring-hueso/10 focus-visible:ring-oro"
                  aria-label={`Ver ${nombreObra(obra)}`}
                >
                  <Foto
                    id={obra.fotos[0]}
                    uso={grande ? 'ancho' : 'tarjeta'}
                    sizes={grande ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
                    className={clsx('block transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.04]', grande ? 'aspect-[4/5] sm:aspect-[21/9]' : 'aspect-[4/5]')}
                    imgClassName="object-cover"
                    posicionEtiqueta="arriba-izquierda"
                    revelar
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
                    <span className="min-w-0">
                      <span className="etiqueta block text-oro">{categoriaDe(obra)?.nombre}</span>
                      <span className="titulo-bloque mt-2 block text-hueso">{obra.nombre}</span>
                      <span className="anotacion mt-2 block text-concreto-claro">
                        {String(i + 1).padStart(2, '0')} · {obra.fotos.length} fotos{obra.referencial ? ' · Proyecto de ejemplo' : ''}
                      </span>
                    </span>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full text-oro ring-1 ring-oro/50 transition-all duration-500 group-hover:rotate-45 group-hover:bg-oro group-hover:text-carbon">
                      <ArrowUpRight className="size-5" strokeWidth={1.5} />
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {hayReferenciales && (
          <p className="anotacion mt-6 text-concreto">
            Imágenes referenciales: aquí irán las fotos de las obras de Balance.
          </p>
        )}

        <div className="mt-20 grid gap-8 lg:mt-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
          <div>
            <Rotulo texto="Del plano a la obra" />
            <TextoDividido como="h3" texto={'Arrastra y\n*compara*'} className="titulo-seccion mt-6 lg:text-[clamp(2rem,3.6vw,3.4rem)]" />
            <Revelar como="p" className="mt-6 max-w-md text-hueso/75">
              A la izquierda, el plano; a la derecha, la obra. Cuando lleguen las fotos reales, este mismo comparador
              mostrará el antes y el después de cada remodelación.
            </Revelar>
          </div>
          <Revelar>
            <Comparador foto="arquitectura-fachada" className="aspect-[3/2]" />
          </Revelar>
        </div>
      </div>

      <AnimatePresence>{abierta && <Visor key={abierta.id} obra={abierta} alCerrar={() => setAbierta(null)} />}</AnimatePresence>
    </section>
  )
}
