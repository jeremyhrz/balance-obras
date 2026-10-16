/**
 * Las anclas de la página, en orden (brief §4). Una sola fuente para la navegación, el menú del
 * teléfono y la numeración editorial de cada sección («02 — Servicios»: <Rotulo id="servicios" />).
 * `menu`: si sale en el menú. `corto`: el nombre para la barra de escritorio.
 * JS puro.
 */
export const SECCIONES = [
  { id: 'inicio', nombre: 'Inicio', corto: 'Inicio', numero: null, menu: false },
  { id: 'plano', nombre: 'De plano a realidad', corto: 'Plano', numero: '01', menu: true },
  { id: 'servicios', nombre: 'Servicios', corto: 'Servicios', numero: '02', menu: true },
  { id: 'obras', nombre: 'Obras', corto: 'Obras', numero: '03', menu: true },
  { id: 'proceso', nombre: 'Proceso', corto: 'Proceso', numero: '04', menu: true },
  { id: 'cotiza', nombre: 'Cotiza tu obra', corto: 'Cotiza', numero: '05', menu: true },
  { id: 'nosotros', nombre: 'Nosotros', corto: 'Nosotros', numero: '06', menu: true },
  { id: 'contacto', nombre: 'Contacto', corto: 'Contacto', numero: '07', menu: true },
]

/** Las que van en el menú, en orden. */
export const ENLACES = SECCIONES.filter((s) => s.menu)

/** La sección con ese id (o undefined). */
export function seccion(id) {
  return SECCIONES.find((s) => s.id === id)
}

/** «02 — Servicios» (con raya). Sin número, solo el nombre. */
export function rotulo(id) {
  const s = seccion(id)
  if (!s) return ''
  return s.numero ? `${s.numero} — ${s.nombre}` : s.nombre
}
