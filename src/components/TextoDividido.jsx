import { Fragment } from 'react'
import clsx from 'clsx'
import { m } from 'framer-motion'
import { EXPO, VISTA, useMenosMovimiento } from '../lib/movimiento'
import { partirEnfasis, textoPlano } from '../lib/texto'

/**
 * Titular que entra por palabras (o letras) subiendo desde una máscara.
 *
 *   <TextoDividido como="h1" texto="Construimos *con balance*" className="titulo-display" />
 *   <TextoDividido texto="BALANCE" por="letra" alVer={false} retraso={0.4} />
 *   <TextoDividido como="h1" texto={'Construimos\n*con balance*'} claseEnfasis="texto-oro" />
 *
 * - *asteriscos* = énfasis: oro (clase `enfasis`, cámbiala con `claseEnfasis`, p. ej. "texto-oro").
 * - Un salto de línea en el texto ('\n') fuerza el renglón ahí.
 * - `alVer` (true): anima al entrar en pantalla; con false, al montar.
 * - `escalon`: segundos entre palabras/letras (por defecto 0,06 / 0,035).
 * El texto completo queda para lectores de pantalla; los trozos animados van aria-hidden.
 */
export default function TextoDividido({
  texto,
  como = 'span',
  por = 'palabra',
  retraso = 0,
  escalon,
  duracion = 0.95,
  alVer = true,
  claseEnfasis = 'enfasis',
  className,
  ...resto
}) {
  const menos = useMenosMovimiento()
  const Contenedor = m[como]
  const pieza = menos
    ? { oculto: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : { oculto: { y: '120%' }, visible: { y: '0%', transition: { duration: duracion, ease: EXPO } } }

  // Palabras con su énfasis; los espacios quedan como texto normal para que el renglón corte bien
  // y cada salto de línea se vuelve un <br>.
  const palabras = partirEnfasis(texto).flatMap(({ texto: tramo, enfasis }) =>
    tramo
      .split(SEPARADOR)
      .filter(Boolean)
      .map((p) => ({ p, enfasis })),
  )

  const disparo = alVer ? { whileInView: 'visible', viewport: VISTA } : { animate: 'visible' }

  return (
    <Contenedor
      className={className}
      initial="oculto"
      {...disparo}
      variants={{ oculto: {}, visible: { transition: { staggerChildren: escalon ?? (por === 'letra' ? 0.035 : 0.06), delayChildren: retraso } } }}
      {...resto}
    >
      <span className="sr-only">{textoPlano(texto)}</span>
      <span aria-hidden="true">
        {palabras.map(({ p, enfasis }, i) =>
          p === SALTO ? (
            <br key={i} />
          ) : /^\s+$/.test(p) ? (
            <Fragment key={i}> </Fragment>
          ) : por === 'letra' ? (
            <span key={i} className={clsx('inline-block whitespace-nowrap', enfasis && claseEnfasis)}>
              {[...p].map((letra, j) => (
                <span key={j} className="mascara">
                  <m.span className="inline-block" variants={pieza}>
                    {letra}
                  </m.span>
                </span>
              ))}
            </span>
          ) : (
            <span key={i} className="mascara">
              <m.span className={clsx('inline-block', enfasis && claseEnfasis)} variants={pieza}>
                {p}
              </m.span>
            </span>
          ),
        )}
      </span>
    </Contenedor>
  )
}

const SALTO = '\n'
// Corta en saltos de línea (que se conservan como pieza) y en espacios (que no sean saltos).
const SEPARADOR = /(\n|[^\S\n]+)/

/**
 * Texto con los *énfasis* de balance.js en oro, sin animación ('\n' = salto de línea).
 *   <Enfasis como="h2" texto={NOSOTROS.titulo} className="titulo-seccion" />
 *   <Enfasis texto="El balance entre *costo, tiempo y calidad*." claseEnfasis="texto-oro" />
 */
export function Enfasis({ texto, como: Elemento = 'span', claseEnfasis = 'enfasis', className }) {
  const conSaltos = (tramo) => tramo.split(SALTO).flatMap((linea, j) => (j ? [<br key={`br${j}`} />, linea] : [linea]))
  return (
    <Elemento className={className}>
      {partirEnfasis(texto).map(({ texto: tramo, enfasis }, i) =>
        enfasis ? (
          <em key={i} className={claseEnfasis}>
            {conSaltos(tramo)}
          </em>
        ) : (
          <Fragment key={i}>{conSaltos(tramo)}</Fragment>
        ),
      )}
    </Elemento>
  )
}
