import { BALANCE, CREDITO, buscarPlazo, buscarServicio, buscarTipoObra } from '../data/balance.js'
import { nombreObra } from '../data/obras.js'
import { formatearArea } from './medidas.js'

/**
 * Mensajes de WhatsApp de Balance. Se abren como https://wa.me/<número>?text=… con el texto ya
 * escrito (encodeURIComponent), listo para que el cliente solo pulse «Enviar».
 * SIN número confirmado (BALANCE.whatsapp.numero = null) el enlace es https://wa.me/?text=…:
 * WhatsApp se abre con el mensaje y deja elegir el chat. Cuando haya número, se cambia SOLO en
 * src/data/balance.js. JS puro: scripts/probar_whatsapp.mjs comprueba los textos EXACTOS con node.
 *
 *   <a href={enlaceWhatsApp(mensajeCotizacion(datos))} target="_blank" rel="noopener noreferrer">
 */

export const SALUDO = 'Hola, Balance Obras Civiles 👷'

/** Enlace wa.me con el mensaje. `numero` en formato internacional sin «+» (por defecto, el de Balance). */
export function enlaceWhatsApp(texto = '', numero = BALANCE.whatsapp.numero) {
  const digitos = String(numero ?? '').replace(/\D/g, '')
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`
}

/** true si ya hay número de WhatsApp confirmado (si no, los botones abren el selector de chats). */
export const HAY_NUMERO = Boolean(String(BALANCE.whatsapp.numero ?? '').replace(/\D/g, ''))

/** Texto de un campo libre: sin saltos ni espacios de más y con un máximo de caracteres. */
export function limpiarTexto(texto, maximo = 300) {
  return String(texto ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximo)
    .trim()
}

/** Nombre del tipo de obra: acepta el id de TIPOS_OBRA, el objeto o el nombre ya escrito. */
function nombreTipo(tipo) {
  if (!tipo) return ''
  if (typeof tipo === 'string') return buscarTipoObra(tipo)?.nombre ?? limpiarTexto(tipo, 60)
  return tipo.nombre ?? ''
}

/** Nombre del plazo: acepta el id de PLAZOS, el objeto o el texto. */
function nombrePlazo(plazo) {
  if (!plazo) return ''
  if (typeof plazo === 'string') return buscarPlazo(plazo)?.nombre ?? limpiarTexto(plazo, 60)
  return plazo.nombre ?? ''
}

/** Tamaño: un número de m² → «1.200 m²»; un texto se deja como está (si no trae unidad, se le pone). */
function textoTamano(tamano) {
  if (tamano == null || tamano === '') return ''
  if (typeof tamano === 'number') return Number.isFinite(tamano) && tamano > 0 ? formatearArea(tamano) : ''
  const t = limpiarTexto(tamano, 30)
  if (!t) return ''
  return /m²|m2|metros/i.test(t) ? t : `${t} m²`
}

/**
 * La cotización armada en el asistente (brief §5.9), con SOLO lo que se llenó:
 *   Hola, Balance Obras Civiles 👷 Quiero cotizar una obra:
 *   • Tipo: Remodelación
 *   • Ubicación: Valencia, Carabobo
 *   • Tamaño aprox.: 120 m²
 *   • Plazo: 1 a 3 meses
 *   • Detalles: Ampliar la cocina y cambiar el piso.
 *   • Nombre: Carlos
 *   ¿Podemos coordinar una visita?
 * `tipo` y `plazo`: id, objeto o texto · `tamano`: número de m² (o texto) · el resto, texto.
 */
export function mensajeCotizacion({ tipo, ubicacion, tamano, plazo, detalles, nombre } = {}) {
  const lineas = [`${SALUDO} Quiero cotizar una obra:`]
  const campos = [
    ['Tipo', nombreTipo(tipo)],
    ['Ubicación', limpiarTexto(ubicacion, 80)],
    ['Tamaño aprox.', textoTamano(tamano)],
    ['Plazo', nombrePlazo(plazo)],
    ['Detalles', limpiarTexto(detalles, 500)],
    ['Nombre', limpiarTexto(nombre, 60)],
  ]
  for (const [rotulo, valor] of campos) if (valor) lineas.push(`• ${rotulo}: ${valor}`)
  lineas.push('¿Podemos coordinar una visita?')
  return lineas.join('\n')
}

/** «Hola, Balance Obras Civiles 👷 Vi su página web y quiero más información.» (botón general). */
export function mensajeGeneral() {
  return `${SALUDO} Vi su página web y quiero más información.`
}

/** «… Vi su página web y quiero información sobre *Remodelación*.» (id, objeto o nombre). */
export function mensajeServicio(servicio) {
  const nombre = typeof servicio === 'string' ? buscarServicio(servicio)?.nombre ?? servicio : servicio?.nombre
  return `${SALUDO} Vi su página web y quiero información sobre *${nombre ?? ''}*.`
}

/** «… Vi en su página la obra «Edificio residencial · Proyecto de ejemplo» y quiero cotizar algo parecido.» */
export function mensajeObra(obra) {
  return `${SALUDO} Vi en su página la obra «${nombreObra(obra)}» y quiero cotizar algo parecido.`
}

/** Enlace del crédito del pie («Diseño y desarrollo: Jeremy Heras»). */
export function enlaceCredito() {
  return enlaceWhatsApp(CREDITO.mensaje, CREDITO.whatsapp)
}
