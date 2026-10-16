import { useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import Enlace from '../components/Enlace'
import Logo from '../components/Logo'
import { CREDITO, DERECHOS } from '../data/balance.js'
import { ENLACES } from '../data/secciones'
import { useAtraparFoco } from '../lib/foco'
import { creditosDeFotos } from '../lib/fotos'
import { EXPO } from '../lib/movimiento'
import { useBloquearScroll } from '../lib/scroll'
import { enlaceCredito } from '../lib/whatsapp'

/**
 * El pie de TODAS las páginas: el wordmark BALANCE gigante con textura de concreto, los enlaces a
 * las páginas, «© 2026 Balance Obras Civiles», «Créditos de imágenes» (modal con autor, licencia y
 * fuente de cada foto referencial) y «Diseño y desarrollo: Jeremy Heras» → su WhatsApp.
 */
export default function Pie() {
  const [creditos, setCreditos] = useState(false)
  return (
    <footer className="relative border-t border-hueso/[0.07]">
      <div className="contenedor pt-12 md:pt-16">
        <nav aria-label="Páginas" className="mb-10">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {ENLACES.map((e) => (
              <li key={e.id}>
                <Enlace a={e.id} className="etiqueta inline-flex min-h-[44px] items-center text-hueso/60 transition-colors hover:text-oro-claro aria-[current=page]:text-oro">
                  {e.corto}
                </Enlace>
              </li>
            ))}
          </ul>
        </nav>
        <Logo variante="palabra" textura titulo="Balance" className="h-auto w-full" />
        <div className="flex flex-col gap-3 py-8 text-sm text-concreto md:flex-row md:items-center md:justify-between">
          <p>{DERECHOS}</p>
          <button type="button" onClick={() => setCreditos(true)} className="inline-flex min-h-[44px] items-center self-start underline-offset-4 hover:text-hueso hover:underline md:self-auto">
            Créditos de imágenes
          </button>
          <a href={enlaceCredito()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1 hover:text-oro-claro">
            {CREDITO.texto} <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </div>
      <AnimatePresence>{creditos && <ModalCreditos alCerrar={() => setCreditos(false)} />}</AnimatePresence>
    </footer>
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
      <m.div className="absolute inset-0 bg-carbon/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={alCerrar} />
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
          <h2 id="titulo-creditos" className="etiqueta text-oro">Créditos de imágenes</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="grid size-10 place-items-center text-hueso/70 hover:text-hueso">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <div data-lenis-prevent className="max-h-[calc(85svh-4.5rem)] overflow-y-auto px-6 py-5">
          <p className="text-sm text-hueso/75">
            Las fotos marcadas como «Imagen referencial» son de ejemplo, de bancos de imágenes libres, mientras llegan las de
            nuestras obras. Imágenes modificadas (recorte, color y ocultado de marcas).
          </p>
          {lista.length ? (
            <ul className="mt-5 divide-y divide-hueso/10">
              {lista.map((c) => (
                <li key={c.id} className="py-3 text-sm">
                  <p className="text-hueso">{c.titulo || c.alt || c.id}</p>
                  <p className="mt-1 text-concreto">
                    {[c.autor && `Foto: ${c.autor}`].filter(Boolean).join(' · ')}
                    {c.licencia && (
                      <>
                        {' · '}
                        {c.licenciaUrl ? (
                          <a href={c.licenciaUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-hueso">{c.licencia}</a>
                        ) : (
                          c.licencia
                        )}
                      </>
                    )}
                    {(c.fuenteUrl || c.url) && (
                      <>
                        {' · '}
                        <a href={c.fuenteUrl || c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-hueso">
                          {c.fuente || 'Ver original'}
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
