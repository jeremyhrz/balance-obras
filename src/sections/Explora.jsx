import { useRef, useState } from 'react'
import { AnimatePresence, m, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Enlace from '../components/Enlace'
import Foto from '../components/Foto'
import Revelar from '../components/Revelar'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { EXPO, usePunteroFino } from '../lib/movimiento'

/**
 * El índice de la portada: las páginas de la web como una lista editorial grande. En escritorio,
 * al pasar el cursor por una fila, su foto flota junto al cursor; en el teléfono, cada fila lleva su
 * miniatura. Así la portada termina con un mapa claro en vez de un scroll infinito.
 */
const PAGINAS = [
  { id: 'servicios', numero: '02', nombre: 'Servicios', texto: 'Ingeniería, construcción, remodelación y *asfaltado*.', foto: 'estructura-encofrado' },
  { id: 'obras', numero: '03', nombre: 'Obras', texto: 'Proyectos que hablan por *sí solos*.', foto: 'estructura-columnas-losas' },
  { id: 'proceso', numero: '04', nombre: 'Proceso', texto: 'De la primera visita a la entrega, *a plomo*.', foto: 'planos-mesa' },
  { id: 'cotiza', numero: '05', nombre: 'Cotiza', texto: 'Cinco pasos y la ficha de tu obra *por WhatsApp*.', foto: 'maquinaria-excavadora' },
  { id: 'nosotros', numero: '06', nombre: 'Nosotros', texto: 'El balance entre *costo, tiempo y calidad*.', foto: 'equipo-obreros' },
]

function ConEnfasis({ texto }) {
  return texto.split('*').map((trozo, i) => (i % 2 ? <em key={i}>{trozo}</em> : trozo))
}

export default function Explora() {
  const fino = usePunteroFino()
  const lista = useRef(null)
  const [encima, setEncima] = useState(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 })

  const mover = (e) => {
    const caja = lista.current?.getBoundingClientRect()
    if (!caja) return
    x.set(Math.min(e.clientX - caja.left, caja.width - 320))
    y.set(Math.max(170, Math.min(e.clientY - caja.top, caja.height - 40)))
  }

  return (
    <section id="explora" className="relative">
      <div className="contenedor seccion">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rotulo texto="Explora Balance" />
            <TextoDividido como="h2" texto={'Todo lo que\n*hacemos*'} className="titulo-seccion mt-6" />
          </div>
          <Revelar como="p" className="texto-lead max-w-md lg:text-right">
            Elige <em>por dónde empezar</em>.
          </Revelar>
        </div>

        <ul ref={lista} className="relative mt-12 border-t border-hueso/10" onPointerMove={fino ? mover : undefined} onPointerLeave={() => setEncima(null)}>
          {PAGINAS.map((p, i) => (
            <Revelar como="li" key={p.id} retraso={i * 0.05} className="relative z-10 border-b border-hueso/10">
              <Enlace
                a={p.id}
                onPointerEnter={() => setEncima(p.id)}
                data-cursor="Ir"
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 md:gap-8 md:py-7"
              >
                <span className="anotacion w-8 text-oro md:w-12">{p.numero}</span>
                <span className="min-w-0">
                  <span className="titulo-display block text-[clamp(1.5rem,6.6vw,6.5rem)] text-hueso transition-[color,transform] duration-500 ease-expo group-hover:translate-x-3 group-hover:text-oro-claro">
                    {p.nombre}
                  </span>
                  <span className="texto-serif mt-1 block text-hueso/70">
                    <ConEnfasis texto={p.texto} />
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <Foto id={p.foto} uso="tarjeta" sizes="80px" etiqueta={false} alt="" className="hidden aspect-[4/5] w-14 rounded-[2px] sm:max-lg:block" imgClassName="object-cover" />
                  <span className="grid size-11 place-items-center rounded-full text-oro ring-1 ring-oro/50 transition-all duration-500 group-hover:rotate-45 group-hover:bg-oro group-hover:text-carbon md:size-14">
                    <ArrowUpRight className="size-5" strokeWidth={1.5} />
                  </span>
                </span>
              </Enlace>
            </Revelar>
          ))}

          {/* Escritorio: la foto de la fila sigue al cursor */}
          {fino && (
            <m.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-0 hidden lg:block" style={{ x: sx, y: sy }}>
              <AnimatePresence>
                {encima && (
                  <m.div
                    key={encima}
                    initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.45, ease: EXPO }}
                    className="absolute left-[2.5rem] -top-[10rem] w-[16rem] overflow-hidden rounded-[2px] shadow-profunda ring-1 ring-hueso/15"
                  >
                    <Foto id={PAGINAS.find((p) => p.id === encima).foto} uso="tarjeta" sizes="300px" className="aspect-[4/5]" imgClassName="object-cover brightness-[.72]" posicionEtiqueta="abajo-izquierda" />
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          )}
        </ul>
      </div>
    </section>
  )
}
