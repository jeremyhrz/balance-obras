import { ArrowRight } from 'lucide-react'
import BotonWhatsApp from '../components/BotonWhatsApp'
import Enlace from '../components/Enlace'
import EtiquetaReferencial from '../components/EtiquetaReferencial'
import Foto from '../components/Foto'
import Revelar from '../components/Revelar'
import Rotulo from '../components/Rotulo'
import TextoDividido, { Enfasis } from '../components/TextoDividido'
import { BALANCE, CONTACTO } from '../data/balance.js'

/**
 * Contacto (página /contacto, brief §5.11): la ciudad con sus grúas al anochecer, «¿Hablamos de tu
 * obra?», WhatsApp y el cotizador, y los datos CONFIRMADOS (correo, ciudad, Instagram: si están en
 * null en balance.js, no se muestran). El pie va aparte (Pie.jsx), en todas las páginas.
 */
export default function Contacto() {
  const datos = [
    BALANCE.whatsapp.visible && { rotulo: 'WhatsApp', valor: BALANCE.whatsapp.visible },
    BALANCE.correo && { rotulo: 'Correo', valor: BALANCE.correo, href: `mailto:${BALANCE.correo}` },
    { rotulo: 'Ubicación', valor: BALANCE.ubicacion.texto },
    BALANCE.instagram.url && { rotulo: 'Instagram', valor: `@${BALANCE.instagram.usuario}`, href: BALANCE.instagram.url },
  ].filter(Boolean)

  return (
    <section id="contacto" className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden pb-16 pt-32 md:pb-24">
      <Foto id="portada-gruas-hora-azul" uso="ancho" movil="movil" rellenar alt="" className="-z-10" etiqueta={false} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-carbon via-carbon/70 to-carbon/30" />
      <EtiquetaReferencial posicion="abajo-derecha" />
      <div className="contenedor">
        <Rotulo id="contacto" />
        <TextoDividido como="h1" texto={CONTACTO.titulo} className="titulo-display mt-6 max-w-[14ch] text-[clamp(2.2rem,9vw,7rem)]" />
        <Revelar>
          <Enfasis como="p" texto={CONTACTO.texto} className="texto-lead mt-6 max-w-2xl" />
        </Revelar>
        <Revelar className="mt-10 flex flex-wrap gap-3">
          <BotonWhatsApp variante="oro" magnetico>Escríbenos por WhatsApp</BotonWhatsApp>
          <Enlace a="cotiza" className="boton boton-linea">
            <span>Cotiza tu obra</span>
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Enlace>
        </Revelar>
        <dl className="mt-14 grid gap-6 sm:grid-cols-3">
          {datos.map((d) => (
            <div key={d.rotulo} className="border-t border-hueso/15 pt-4">
              <dt className="etiqueta text-concreto">{d.rotulo}</dt>
              <dd className="texto-serif mt-2 text-hueso">
                {d.href ? (
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="hover:text-oro-claro">{d.valor}</a>
                ) : (
                  d.valor
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
