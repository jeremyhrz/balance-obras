import CintaInfinita from '../components/Cinta'
import { Destello } from '../components/Iconos'
import { CINTA } from '../data/balance.js'

/**
 * Cinta técnica (brief §5.5) — STUB de la base: una franja de concreto con los cinco rubros en
 * Archivo expandida y destellos de oro; acelera, cambia de sentido y se sesga con el scroll (lo
 * hace <CintaInfinita>). FALTA (sección Cinta): el diseño definitivo (p. ej. dos franjas, cotas,
 * anotaciones de plano).
 */
export default function Cinta() {
  return (
    <section aria-label="Lo que hacemos" className="relative overflow-hidden border-y border-hueso/[0.07] textura-concreto py-6 md:py-8">
      <CintaInfinita
        elementos={CINTA}
        velocidad={2.6}
        className="font-display text-[clamp(1.6rem,6vw,3.6rem)] font-extrabold uppercase leading-none"
        claseElemento="tracking-[0.02em] text-hueso"
        separador={<Destello className="size-[0.42em] text-oro" />}
        claseSeparador="inline-flex items-center !px-[0.55em]"
      />
    </section>
  )
}
