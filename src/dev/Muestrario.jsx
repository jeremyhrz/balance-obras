import { useRef, useState } from 'react'
import BotonWhatsApp from '../components/BotonWhatsApp'
import Contador from '../components/Contador'
import Cota from '../components/Cota'
import EtiquetaReferencial from '../components/EtiquetaReferencial'
import Foto from '../components/Foto'
import { Destello, ICONOS, IconoInstagram, IconoWhatsApp } from '../components/Iconos'
import LineaLaser from '../components/LineaLaser'
import Logo from '../components/Logo'
import Polvo from '../components/Polvo'
import Reticula from '../components/Reticula'
import Rotulo from '../components/Rotulo'
import TextoDividido from '../components/TextoDividido'
import { ANOTACIONES, PORTADA } from '../data/balance.js'

/**
 * Muestrario de la base (SOLO desarrollo, nunca lo importa App.jsx): /?solo=Muestrario
 * Enseña de un vistazo el logo, los tokens y las piezas compartidas para revisarlas en una captura.
 * /?solo=Muestrario&armar=1 arma el logo completo al cargar (para ver `construir`).
 */
export default function Muestrario() {
  const armar = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('armar')
  const polvo = useRef(null)
  const [vuelta, setVuelta] = useState(0)

  return (
    <div className="space-y-20 pb-24 pt-10">
      <section className="contenedor space-y-8">
        <Rotulo texto="Logo · completo" />
        <div className="relative grid place-items-center overflow-hidden bg-[#262627] py-10">
          <Logo key={vuelta} construir={armar || vuelta > 0} className="h-auto w-[min(82vw,30rem)]" alAsentar={(_, el) => polvo.current?.rafagaEn(el?.getBoundingClientRect())} />
          <Polvo ref={polvo} modo="rafaga" />
          <button type="button" onClick={() => setVuelta((v) => v + 1)} className="boton boton-linea boton-chico absolute bottom-3 right-3">
            <span>Armar</span>
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid place-items-center bg-carbon py-8 ring-1 ring-hueso/10">
            <Logo textura className="h-auto w-[min(70vw,22rem)]" />
            <p className="anotacion mt-3 text-concreto">textura</p>
          </div>
          <div className="grid place-items-center bg-hueso py-8 text-carbon">
            <Logo monocromo className="h-auto w-[min(70vw,22rem)]" />
            <p className="anotacion mt-3">monocromo</p>
          </div>
        </div>
      </section>

      <section className="contenedor space-y-6">
        <Rotulo texto="Logo · horizontal, isotipo y palabra" />
        <div className="flex flex-wrap items-center gap-8 bg-carbon/60 p-6 ring-1 ring-hueso/10">
          <Logo variante="horizontal" className="h-9 w-auto" />
          <Logo variante="horizontal" subtitulo={false} className="h-7 w-auto" />
          <Logo variante="horizontal" subtitulo={false} className="h-6 w-auto" />
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <Logo variante="isotipo" className="h-40 w-auto" />
          <Logo variante="isotipo" textura className="h-40 w-auto" />
          <Logo variante="isotipo" className="h-12 w-auto" />
          <Logo variante="isotipo" className="h-8 w-auto" />
          <Logo variante="isotipo" relieve={false} className="size-6" />
        </div>
        <Logo variante="palabra" textura className="h-auto w-full" />
      </section>

      <section className="contenedor space-y-6">
        <Rotulo id="servicios" />
        <TextoDividido como="h1" texto={PORTADA.titulo} alVer={false} className="titulo-display" />
        <h2 className="titulo-seccion">
          De plano a <span className="texto-oro">realidad</span>
        </h2>
        <h3 className="titulo-bloque">Proyectos arquitectónicos</h3>
        <p className="font-display text-4xl font-black uppercase">Ancho por defecto</p>
        <p className="titulo-display texto-concreto">Balance</p>
        <p className="max-w-xl text-lg">
          Texto en Inter: ingeniería, construcción y remodelación. <span className="text-concreto">Secundario en concreto.</span>{' '}
          <span className="enfasis">Énfasis en oro.</span>
        </p>
        <p className="etiqueta text-oro">Etiqueta en Michroma · Obra al 100 %</p>
        <div className="flex flex-wrap gap-4 text-plano-linea">
          {ANOTACIONES.map((a) => (
            <span key={a} className="anotacion">
              {a}
            </span>
          ))}
        </div>
        <span className="filete w-40" />
        <div className="flex flex-wrap gap-3">
          <a href="#cotiza" className="boton boton-oro">
            <span>Cotiza tu obra</span>
          </a>
          <a href="#obras" className="boton boton-linea">
            <span>Ver obras</span>
          </a>
          <BotonWhatsApp />
          <BotonWhatsApp variante="hueso">Sobre foto</BotonWhatsApp>
          <button type="button" className="boton boton-oro boton-chico">
            <span>Cotiza tu obra</span>
          </button>
        </div>
        <p className="font-marca text-4xl">
          <Contador valor={10} prefijo="+" /> <span className="text-concreto">años</span>
        </p>
      </section>

      <section className="contenedor space-y-6">
        <Rotulo texto="Iconos (se trazan)" />
        <div className="flex flex-wrap items-center gap-8 text-oro">
          {Object.entries(ICONOS).map(([nombre, Icono], i) => (
            <figure key={nombre} className="flex flex-col items-center gap-2">
              <Icono className="size-16" grosor={1.25} trazar retraso={i * 0.1} />
              <Icono className="size-6" />
              <figcaption className="anotacion text-concreto">{nombre}</figcaption>
            </figure>
          ))}
          <Destello className="size-6" />
          <IconoWhatsApp className="size-8 text-hueso" />
          <IconoInstagram className="size-8 text-hueso" />
        </div>
      </section>

      <section className="contenedor space-y-6">
        <Rotulo texto="Retícula, cotas y láser" />
        <div className="relative h-80 overflow-hidden">
          <Reticula variante="plano" ejes cruces trazar />
          <div className="relative space-y-10 p-10">
            <Cota medida="12,40 m" tono="plano" className="w-full max-w-md" />
            <Cota medida="8,00 m" tono="plano" remate="flecha" lado="abajo" className="w-64" />
          </div>
          <div className="absolute bottom-8 right-10 h-48">
            <Cota medida="N+3.20" orientacion="vertical" tono="plano" className="h-full" />
          </div>
        </div>
        <div className="relative h-72 overflow-hidden bg-carbon ring-1 ring-hueso/10">
          <Reticula trazar desvanecer="bordes" />
          <Polvo />
          <LineaLaser posicion={0.6} lectura etiqueta="Nivel láser" />
        </div>
      </section>

      <section className="contenedor space-y-6">
        <Rotulo texto="Fotos, texturas y etiqueta" />
        <div className="grid gap-4 md:grid-cols-3">
          <Foto id="no-existe" proporcion="4:5" />
          <div className="relative aspect-[4/5] textura-concreto">
            <EtiquetaReferencial />
          </div>
          <div className="relative aspect-[4/5] bg-plano">
            <Reticula variante="plano" />
            <EtiquetaReferencial posicion="arriba-derecha" />
          </div>
        </div>
      </section>
    </div>
  )
}
