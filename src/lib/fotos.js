import fotos from '../data/fotos.json'
import videos from '../data/videos.json'
import { CREDITOS } from '../data/creditos.js'

/**
 * Acceso a los manifiestos que escribe scripts/optimizar_fotos.py (no los edites a mano):
 *   src/data/fotos.json   id → { ancho, alto, proporcion, anchos[], base, placeholder?, color, alt,
 *                                 referencial? }
 *   src/data/videos.json  id → { mp4?, webm?, poster (id de foto), ancho, alto }
 *   src/data/creditos.js  CREDITOS: título, autor, licencia y fuente de cada foto referencial
 * Ids: los de scripts/fotos_config.json («arquitectura-fachada»), sus recortes por uso
 * («arquitectura-fachada@tarjeta», «…@plano») y las fotos de obras reales por carpeta
 * («obras/<idObra>/<archivo sin extensión>»). Los recortes @uso no repiten el alt ni «referencial»
 * de su foto base (fotos.json viaja dentro del JS): datosFoto() los completa.
 */

/** Datos de una foto (con `uso`, su recorte alternativo si existe) o null. */
export function datosFoto(id, uso) {
  if (!id) return null
  const datos = (uso && fotos[`${id}@${uso}`]) || fotos[id]
  if (!datos) return null
  const base = fotos[id.split('@')[0]]
  return base && base !== datos ? { alt: base.alt, referencial: base.referencial, ...datos } : datos
}

export function hayFoto(id) {
  return Boolean(id && fotos[id])
}

/** Ids de las fotos de una obra real, por su carpeta fotos_originales/obras/<idObra>/ (en orden de archivo). */
export function fotosDeCarpeta(idObra) {
  const prefijo = `obras/${idObra}/`
  return Object.keys(fotos)
    .filter((id) => id.startsWith(prefijo) && !id.includes('@'))
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

/** Datos de un video o null. */
export function datosVideo(id) {
  return (id && videos[id]) || null
}

/**
 * Créditos de las fotos referenciales, para el modal «Créditos de imágenes» (= CREDITOS de
 * src/data/creditos.js, que genera scripts/optimizar_fotos.py desde
 * fotos_originales/referenciales/creditos.json): uno por foto de origen, solo las que se usan.
 *   [{ id, titulo, autor, licencia, licenciaUrl, fuente, fuenteUrl }]
 */
export function creditosDeFotos() {
  return CREDITOS
}
