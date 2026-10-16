import { ArrowRight } from 'lucide-react'
import { seccion } from '../data/secciones'
import Enlace from './Enlace'

/**
 * El final de cada página: «Siguiente → OBRAS» enorme, para seguir el recorrido sin scroll infinito.
 * Al pasar el cursor, un barrido de oro llena el bloque y la flecha avanza. En el teléfono la flecha
 * va en la fila de la etiqueta, para que el nombre tenga todo el ancho. `data-siguiente`: el botón
 * flotante se aparta mientras este bloque está en pantalla.
 *
 *   <Siguiente a="obras" />
 *   <Siguiente a="inicio" texto="Volver al" etiqueta="Volver al inicio" />
 */
export default function Siguiente({ a, texto = 'Siguiente', etiqueta }) {
  const datos = seccion(a)
  const nombre = a === 'inicio' ? 'Inicio' : datos?.corto ?? datos?.nombre
  const flecha = (
    <ArrowRight className="size-5 md:size-8" strokeWidth={1.25} />
  )
  return (
    <section data-siguiente="" aria-label={etiqueta ?? `${texto} ${nombre}`} className="border-t border-hueso/[0.07]">
      <Enlace a={a} className="group relative block overflow-hidden focus-visible:outline-none">
        {/* barrido de oro */}
        <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-[linear-gradient(135deg,#E8CC8E,#C9A45C_45%,#8A6A33)] transition-transform duration-700 ease-expo group-hover:scale-y-100 group-focus-visible:scale-y-100" />
        <span className="contenedor relative flex items-end justify-between gap-6 py-12 md:py-16">
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-4">
              <span className="etiqueta flex items-center gap-3 text-oro transition-colors duration-500 group-hover:text-carbon">
                <span aria-hidden="true" className="h-px w-8 bg-current md:w-12" />
                {texto}
                {datos?.numero && <span className="anotacion opacity-70">{datos.numero}</span>}
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full text-oro ring-1 ring-oro/60 transition-all duration-500 group-hover:translate-x-1 group-hover:bg-carbon group-hover:ring-carbon md:hidden">
                {flecha}
              </span>
            </span>
            <span className="titulo-display mt-4 block text-[clamp(2rem,8.4vw,8.5rem)] text-hueso transition-colors duration-500 group-hover:text-carbon">
              {nombre}
            </span>
          </span>
          <span className="mb-2 hidden size-20 shrink-0 place-items-center rounded-full text-oro ring-1 ring-oro/60 transition-all duration-500 group-hover:translate-x-2 group-hover:bg-carbon group-hover:ring-carbon md:grid">
            {flecha}
          </span>
        </span>
      </Enlace>
    </section>
  )
}
