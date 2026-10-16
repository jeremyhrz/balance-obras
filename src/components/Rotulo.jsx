import clsx from 'clsx'
import { rotulo } from '../data/secciones'

/**
 * Numeración editorial de una sección, con su filete dorado: «—— 02 — SERVICIOS».
 * Sale de src/data/secciones.js, así todas las secciones numeran igual.
 *
 *   <Rotulo id="servicios" />
 *   <Rotulo id="cotiza" className="justify-center" filete={false} />
 *   <Rotulo texto="Ficha técnica" />           un rótulo libre con el mismo estilo
 *   <Rotulo id="plano" tono="plano" />         en azul de plano (sobre fondo de plano)
 */
export default function Rotulo({ id, texto, filete = true, tono = 'oro', como: Elemento = 'p', className }) {
  const color = tono === 'plano' ? 'text-plano-linea' : tono === 'hueso' ? 'text-hueso/70' : 'text-oro'
  const linea = tono === 'plano' ? 'bg-plano-linea/70' : tono === 'hueso' ? 'bg-hueso/40' : 'bg-oro/70'
  return (
    <Elemento className={clsx('etiqueta flex items-center gap-3', color, className)}>
      {filete && <span aria-hidden="true" className={clsx('h-px w-8 shrink-0 md:w-12', linea)} />}
      <span>{texto ?? rotulo(id)}</span>
    </Elemento>
  )
}
