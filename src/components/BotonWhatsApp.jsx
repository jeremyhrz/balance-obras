import clsx from 'clsx'
import Magnetico from './Magnetico'
import { IconoWhatsApp } from './Iconos'
import { enlaceWhatsApp, mensajeGeneral } from '../lib/whatsapp'

// Nombres de clase COMPLETOS: Tailwind solo emite las clases que ve escritas tal cual.
const VARIANTES = { linea: 'boton-linea', oro: 'boton-oro', hueso: 'boton-hueso' }

/**
 * Botón que abre WhatsApp con el mensaje ya escrito (por defecto, mensajeGeneral()). Sin número
 * confirmado, abre WhatsApp para elegir el chat (lo resuelve enlaceWhatsApp en src/lib/whatsapp.js).
 *
 *   <BotonWhatsApp />                                                          «Escríbenos», borde fino
 *   <BotonWhatsApp variante="oro" mensaje={mensajeCotizacion(datos)}>Enviar por WhatsApp</BotonWhatsApp>
 *   <BotonWhatsApp mensaje={mensajeServicio('remodelacion')} magnetico />      atraído por el cursor (escritorio)
 *
 * `variante`: 'linea' (secundaria, por defecto) · 'oro' (principal) · 'hueso' (sobre fotos).
 * `chico`: 40 px de alto. Las demás props van al <a> (onClick, aria-label…).
 */
export default function BotonWhatsApp({
  mensaje,
  children = 'Escríbenos',
  variante = 'linea',
  chico = false,
  icono = true,
  magnetico = false,
  className,
  ...resto
}) {
  const boton = (
    <a
      href={enlaceWhatsApp(mensaje ?? mensajeGeneral())}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('boton', VARIANTES[variante] ?? VARIANTES.linea, chico && 'boton-chico', className)}
      {...resto}
    >
      {icono && <IconoWhatsApp className="size-[1.25em] shrink-0" />}
      <span>{children}</span>
    </a>
  )
  return magnetico ? <Magnetico>{boton}</Magnetico> : boton
}
