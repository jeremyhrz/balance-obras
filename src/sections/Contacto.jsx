import { useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import BotonWhatsApp from '../components/BotonWhatsApp'
import Logo from '../components/Logo'
import Rotulo from '../components/Rotulo'
import { Enfasis } from '../components/TextoDividido'
import { BALANCE, CONTACTO, CREDITO, DERECHOS } from '../data/balance.js'
import { useAtraparFoco } from '../lib/foco'
import { creditosDeFotos } from '../lib/fotos'
import { EXPO } from '../lib/movimiento'
import { useBloquearScroll } from '../lib/scroll'
import { enlaceCredito } from '../lib/whatsapp'

/**
 * Contacto y pie (#contacto, brief §5.11) — STUB de la base, ya funcional: WhatsApp, los datos que
 * estén confirmados (correo, ciudad, Instagram: null = no se muestran), el wordmark BALANCE
 * gigante con textura de concreto y el triángulo dorado, «© 2026 Balance Obras Civiles», el
 * enlace «Créditos de imágenes» (modal con autor, licencia y fuente de cada foto referencial,
 * desde src/data/fotos.json) y «Diseño y desarrollo: Jeremy Heras» → su WhatsApp.
 * FALTA (sección Contacto): el diseño definitivo.
 */
export default function Contacto() {
  const [creditos, setCreditos] = useState(false)
  const datos = [
    BALANCE.whatsapp.visible && { rotulo: 'WhatsApp', valor: BALANCE.whatsapp.visible },
    BALANCE.correo && { rotulo: 'Correo', valor: BALANCE.correo, href: `mailto:${BALANCE.correo}` },
    { rotulo: 'Ubicación', valor: BALANCE.ubicacion.texto },
    BALANCE.instagram.url && { rotulo: 'Instagram', valor: `@${BALANCE.instagram.usuario}`, href: BALANCE.instagram.url },
  ].filter(Boolean)

  return (
    <section id="contacto" className="relative overflow-hidden">
      <div className="contenedor seccion">
        <Rotulo id="contacto" />
        <Enfasis como="h2" texto={CONTACTO.titulo} className="titulo-seccion mt-6 block max-w-[14ch]" />
        <p className="mt-6 max-w-xl text-hueso/80">{CONTACTO.texto}</p>
        <BotonWhatsApp variante="oro" magnetico className="mt-8">
          Escríbenos por WhatsApp
        </BotonWhatsApp>
        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {datos.map((d) => (
            <div key={d.rotulo} className="border-t border-hueso/10 pt-4">
              <dt className="etiqueta text-concreto">{d.rotulo}</dt>
              <dd className="mt-2 text-hueso">
                {d.href ? (
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="hover:text-oro-claro">
                    {d.valor}
                  </a>
                ) : (
                  d.valor
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="border-t border-hueso/[0.07]">
        <div className="contenedor pt-12">
          <Logo variante="palabra" textura titulo="Balance" className="h-auto w-full" />
          <div className="flex flex-col gap-3 py-8 text-sm text-concreto md:flex-row md:items-center md:justify-between">
            <p>{DERECHOS}</p>
            <button type="button" onClick={() => setCreditos(true)} className="self-start underline-offset-4 hover:text-hueso hover:underline md:self-auto">
              Créditos de imágenes
            </button>
            <a href={enlaceCredito()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-oro-claro">
              {CREDITO.texto} <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>{creditos && <ModalCreditos alCerrar={() => setCreditos(false)} />}</AnimatePresence>
    </section>
  )
}

/** Modal «Créditos de imágenes»: autor, licencia y fuente de cada foto referencial. */
function ModalCreditos({ alCerrar }) {
  const panel = useRef(null)
  const lista = creditosDeFotos()
  useBloquearScroll(true)
  useAtraparFoco(panel, true, alCerrar)

  return (
    <div className="fixed inset-0 z-modal grid place-items-end md:place-items-center">
      <m.div
        className="absolute inset-0 bg-carbon/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={alCerrar}
      />
      <m.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-creditos"
        tabIndex={-1}
        className="relative max-h-[85svh] w-full overflow-hidden bg-hormigon ring-1 ring-hueso/10 md:max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: EXPO }}
      >
        <div className="flex items-center justify-between border-b border-hueso/10 px-6 py-4">
          <h2 id="titulo-creditos" className="etiqueta text-oro">
            Créditos de imágenes
          </h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="grid size-10 place-items-center text-hueso/70 hover:text-hueso">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <div data-lenis-prevent className="max-h-[calc(85svh-4.5rem)] overflow-y-auto px-6 py-5">
          <p className="text-sm text-hueso/75">
            Las fotos marcadas como «Imagen referencial» son de ejemplo, de bancos de imágenes libres, mientras llegan
            las de nuestras obras.
          </p>
          {lista.length ? (
            <ul className="mt-5 divide-y divide-hueso/10">
              {lista.map((c) => (
                <li key={c.id} className="py-3 text-sm">
                  <p className="text-hueso">{c.alt || c.id}</p>
                  <p className="mt-1 text-concreto">
                    {[c.autor && `Foto: ${c.autor}`, c.licencia, c.fuente].filter(Boolean).join(' · ')}
                    {c.url && (
                      <>
                        {' · '}
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-hueso">
                          Ver original
                        </a>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-concreto">Todavía no hay imágenes de terceros en la página.</p>
          )}
        </div>
      </m.div>
    </div>
  )
}
