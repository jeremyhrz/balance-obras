import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import BotonWhatsApp from '../components/BotonWhatsApp'
import { Icono } from '../components/Iconos'
import Reticula from '../components/Reticula'
import Revelar from '../components/Revelar'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { PLAZOS, REFERENCIAS_TAMANO, TAMANO, TIPOS_OBRA, buscarPlazo, buscarTipoObra } from '../data/balance.js'
import { useCotizacion } from '../lib/cotizacion'
import { POSICIONES, formatearArea, posicionDesdeTamano, tamanoDesdePosicion } from '../lib/medidas'
import { EXPO } from '../lib/movimiento'
import { mensajeCotizacion } from '../lib/whatsapp'

/**
 * Cotiza tu obra (#cotiza, brief §5.9): asistente de cinco pasos (tipo → ubicación → m² → plazo →
 * detalles y nombre) que va llenando una FICHA TÉCNICA y termina en «Enviar por WhatsApp» con el
 * mensaje de mensajeCotizacion() (solo con lo que se llenó). Si otra sección pide un tipo
 * («Cotizar este servicio»), llega marcado y salta al paso 2.
 */

const PASOS = ['Tipo de obra', 'Ubicación', 'Tamaño', 'Plazo', 'Detalles']

function referenciaDe(m2) {
  let mejor = REFERENCIAS_TAMANO[0]
  for (const r of REFERENCIAS_TAMANO) if (Math.abs(Math.log(r.m2) - Math.log(m2)) < Math.abs(Math.log(mejor.m2) - Math.log(m2))) mejor = r
  return mejor
}

export default function Cotiza() {
  const { tipoId, elegirTipo, peticion } = useCotizacion()
  const [paso, setPaso] = useState(0)
  const [sentido, setSentido] = useState(1)
  const [ubicacion, setUbicacion] = useState('')
  const [tamano, setTamano] = useState(TAMANO.inicial)
  const [sinTamano, setSinTamano] = useState(false)
  const [plazo, setPlazo] = useState(null)
  const [detalles, setDetalles] = useState('')
  const [nombre, setNombre] = useState('')
  const tarjeta = useRef(null)

  // Si llega un tipo desde Servicios u Obras, salta al paso 2.
  useEffect(() => {
    if (peticion > 0 && tipoId) { setSentido(1); setPaso(1) }
  }, [peticion, tipoId])

  const ir = (n) => {
    setSentido(n > paso ? 1 : -1)
    setPaso(Math.max(0, Math.min(PASOS.length - 1, n)))
  }
  const elegir = (id) => {
    elegirTipo(id)
    setTimeout(() => ir(1), 220)
  }

  const datos = {
    tipo: tipoId,
    ubicacion: ubicacion.trim(),
    tamano: sinTamano ? null : tamano,
    plazo,
    detalles: detalles.trim(),
    nombre: nombre.trim(),
  }
  const mensaje = mensajeCotizacion(datos)
  const listo = Boolean(tipoId)

  const ficha = [
    ['Tipo', buscarTipoObra(tipoId)?.nombre],
    ['Ubicación', datos.ubicacion],
    ['Tamaño aprox.', datos.tamano ? formatearArea(datos.tamano) : sinTamano ? 'Por definir' : null],
    ['Plazo', buscarPlazo(plazo)?.nombre],
    ['Detalles', datos.detalles],
    ['Nombre', datos.nombre],
  ]

  return (
    <section id="cotiza" className="relative isolate overflow-hidden">
      <Reticula variante="oro" desvanecer="bordes" opacidad={0.8} />
      <div className="contenedor seccion relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rotulo id="cotiza" />
            <TextoDividido como="h2" texto={'Cotiza tu\n*obra*'} className="titulo-seccion mt-6" claseEnfasis="texto-oro" />
          </div>
          <Revelar como="p" className="max-w-md text-hueso/75 lg:text-right">
            Cinco pasos y armamos la ficha de tu obra. Te llega lista a WhatsApp para coordinar una visita.
          </Revelar>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
          {/* ── Asistente */}
          <div ref={tarjeta} className="relative overflow-hidden rounded-[2px] bg-hormigon/90 p-5 ring-1 ring-hueso/10 backdrop-blur md:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="etiqueta text-oro">Paso {paso + 1} de {PASOS.length} · {PASOS[paso]}</p>
              {paso > 0 && (
                <button type="button" onClick={() => ir(paso - 1)} className="etiqueta inline-flex items-center gap-1.5 text-hueso/70 hover:text-hueso">
                  <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Atrás
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden="true">
              {PASOS.map((p, i) => (
                <span key={p} className="h-0.5 overflow-hidden bg-hueso/10">
                  <span className={clsx('block h-full bg-oro transition-transform duration-500 ease-expo', i <= paso ? 'scale-x-100' : 'scale-x-0')} style={{ transformOrigin: 'left' }} />
                </span>
              ))}
            </div>

            <div className="relative mt-8 min-h-[19rem] md:min-h-[17rem]">
              <AnimatePresence mode="popLayout" initial={false} custom={sentido}>
                <m.div
                  key={paso}
                  custom={sentido}
                  initial={{ opacity: 0, x: sentido * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: sentido * -30 }}
                  transition={{ duration: 0.45, ease: EXPO }}
                >
                  {paso === 0 && (
                    <fieldset>
                      <legend className="titulo-bloque text-hueso">¿Qué quieres construir?</legend>
                      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {TIPOS_OBRA.map((t) => {
                          const activo = tipoId === t.id
                          return (
                            <button
                              key={t.id}
                              type="button"
                              aria-pressed={activo}
                              onClick={() => elegir(t.id)}
                              className={clsx(
                                'group flex min-h-[6.5rem] flex-col items-start justify-between gap-3 rounded-[2px] p-4 text-left ring-1 transition-colors duration-300',
                                activo ? 'bg-oro text-carbon ring-oro' : 'text-hueso ring-hueso/15 hover:bg-hueso/[0.04] hover:ring-oro/60',
                              )}
                            >
                              <Icono nombre={t.icono} className={clsx('size-7', activo ? 'text-carbon' : 'text-oro')} grosor={1.25} />
                              <span className="text-sm font-semibold leading-tight">{t.nombre}</span>
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>
                  )}

                  {paso === 1 && (
                    <div>
                      <label htmlFor="cotiza-ubicacion" className="titulo-bloque text-hueso">¿Dónde es la obra?</label>
                      <input
                        id="cotiza-ubicacion"
                        type="text"
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && ir(2)}
                        placeholder="Ciudad o zona, p. ej. Valencia, Naguanagua"
                        maxLength={80}
                        autoComplete="address-level2"
                        className="mt-6 w-full border-b border-hueso/25 bg-transparent py-3 text-lg text-hueso outline-none transition-colors placeholder:text-hueso/35 focus:border-oro"
                      />
                      <div className="mt-8 flex flex-wrap gap-3">
                        <button type="button" onClick={() => ir(2)} className="boton boton-oro boton-chico">
                          <span>{ubicacion.trim() ? 'Siguiente' : 'Prefiero no decirlo'}</span>
                          <ArrowRight className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )}

                  {paso === 2 && (
                    <div>
                      <label htmlFor="cotiza-tamano" className="titulo-bloque text-hueso">¿Qué tamaño tiene, más o menos?</label>
                      <div className="mt-6 flex items-end justify-between gap-4">
                        <p className={clsx('font-marca text-[clamp(1.9rem,8vw,3.2rem)] leading-none transition-opacity', sinTamano ? 'text-hueso/30' : 'text-oro')}>
                          {formatearArea(tamano)}
                        </p>
                        <p className="anotacion pb-1 text-right text-concreto">≈ {referenciaDe(tamano).texto}</p>
                      </div>
                      <input
                        id="cotiza-tamano"
                        type="range"
                        min={0}
                        max={POSICIONES}
                        value={posicionDesdeTamano(tamano)}
                        onChange={(e) => { setSinTamano(false); setTamano(tamanoDesdePosicion(+e.target.value)) }}
                        aria-valuetext={formatearArea(tamano)}
                        className="deslizador-oro mt-6 w-full"
                      />
                      <div className="anotacion mt-2 flex justify-between text-hueso/40">
                        <span>{formatearArea(TAMANO.min)}</span>
                        <span>{formatearArea(TAMANO.max)}</span>
                      </div>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <button type="button" onClick={() => ir(3)} className="boton boton-oro boton-chico">
                          <span>Siguiente</span>
                          <ArrowRight className="size-4" strokeWidth={1.5} />
                        </button>
                        <button type="button" onClick={() => { setSinTamano(true); ir(3) }} className="boton boton-linea boton-chico">
                          <span>No lo sé todavía</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paso === 3 && (
                    <fieldset>
                      <legend className="titulo-bloque text-hueso">¿Para cuándo la necesitas?</legend>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {PLAZOS.map((pl) => (
                          <button
                            key={pl.id}
                            type="button"
                            aria-pressed={plazo === pl.id}
                            onClick={() => { setPlazo(pl.id); setTimeout(() => ir(4), 200) }}
                            className={clsx('boton boton-chico', plazo === pl.id ? 'boton-oro' : 'boton-linea')}
                          >
                            <span>{pl.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {paso === 4 && (
                    <div className="grid gap-6">
                      <div>
                        <label htmlFor="cotiza-detalles" className="titulo-bloque text-hueso">Cuéntanos un poco más</label>
                        <textarea
                          id="cotiza-detalles"
                          rows={3}
                          maxLength={500}
                          value={detalles}
                          onChange={(e) => setDetalles(e.target.value)}
                          placeholder="Qué quieres hacer, en qué estado está hoy, cualquier detalle que ayude."
                          className="mt-4 w-full resize-none rounded-[2px] bg-carbon/60 p-3 text-hueso outline-none ring-1 ring-hueso/15 transition placeholder:text-hueso/35 focus:ring-oro"
                        />
                      </div>
                      <div>
                        <label htmlFor="cotiza-nombre" className="etiqueta text-concreto">Tu nombre (opcional)</label>
                        <input
                          id="cotiza-nombre"
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          maxLength={60}
                          autoComplete="name"
                          className="mt-2 w-full border-b border-hueso/25 bg-transparent py-2.5 text-hueso outline-none transition-colors focus:border-oro"
                        />
                      </div>
                      <BotonWhatsApp variante="oro" mensaje={mensaje} className="w-full justify-center lg:hidden">
                        Enviar por WhatsApp
                      </BotonWhatsApp>
                    </div>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Ficha técnica */}
          <aside aria-label="Ficha técnica de tu obra" className="lg:sticky lg:top-[calc(var(--alto-nav)+2rem)] lg:self-start">
            <div className="relative rounded-[2px] border border-dashed border-oro/50 bg-carbon/80 p-5 backdrop-blur md:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-hueso/10 pb-4">
                <p className="etiqueta text-oro">Ficha técnica</p>
                <p className="anotacion text-concreto">Solicitud de presupuesto</p>
              </div>
              <dl className="divide-y divide-hueso/[0.07]">
                {ficha.map(([clave, valor]) => (
                  <div key={clave} className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
                    <dt className="anotacion pt-0.5 text-concreto">{clave}</dt>
                    <dd className={clsx('min-w-0 break-words text-sm', valor ? 'text-hueso' : 'text-hueso/25')}>{valor || '—'}</dd>
                  </div>
                ))}
              </dl>
              <BotonWhatsApp variante="oro" mensaje={mensaje} className={clsx('mt-5 w-full justify-center', !listo && 'pointer-events-none opacity-40')} aria-disabled={!listo}>
                Enviar por WhatsApp
              </BotonWhatsApp>
              <p className="anotacion mt-3 text-center text-hueso/45">
                {listo ? 'Te llega con todo lo que llenaste.' : 'Elige el tipo de obra para empezar.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
