/**
 * Portafolio de obras (sección #obras). JS puro (sin JSON ni Vite): se prueba con node.
 *
 * HOY: obras de EJEMPLO con fotos referenciales (las agrega quien arma la sección de Obras).
 * Cuando lleguen las reales del ingeniero: README.md → «Cómo agregar una obra nueva».
 *
 * Cada obra:
 * {
 *   id: 'edificio-residencial',      // único, minúsculas y guiones. En las reales es también su carpeta:
 *                                    //   fotos_originales/obras/<id>/ (scripts/optimizar_fotos.py la procesa sola)
 *   nombre: 'Edificio residencial',  // de ejemplo: SU TIPO, nunca un nombre inventado (nombreObra() le suma
 *                                    //   «· Proyecto de ejemplo»). Las reales: el nombre que dé el ingeniero.
 *   categoria: 'construccion',       // id de CATEGORIAS (los mismos de SERVICIOS en balance.js)
 *   ubicacion: null,                 // 'Valencia, Carabobo'. null en las de ejemplo (no se inventa)
 *   anio: null,                      // 2024. null en las de ejemplo
 *   descripcion: '…',                // una o dos frases, sin cifras ni clientes inventados
 *   fotos: ['ref-edificio-1', …],    // ids de src/data/fotos.json, en orden; la PRIMERA es la portada.
 *                                    //   Reales: 'obras/<id>/<archivo sin extensión>' (o fotosDeCarpeta(id), ver src/lib/fotos.js)
 *   video: null,                     // id de src/data/videos.json (MP4/WebM + póster), opcional
 *   antesDespues: null,              // { antes: idFoto, despues: idFoto } opcional: el comparador arrastrable
 *                                    //   lo muestra como «Antes / Después» (sin él, «Plano / Obra» con la portada)
 *   referencial: true,               // true = de ejemplo: «Imagen referencial» en cada foto y «Proyecto de ejemplo»
 *   destacada: false,                // opcional: la que abre el portafolio (tarjeta grande)
 * }
 */

/** Filtros del portafolio. 'todas' no es una categoría de obra: es el filtro que muestra todo. */
export const CATEGORIAS = [
  { id: 'todas', nombre: 'Todas' },
  { id: 'construccion', nombre: 'Construcción' },
  { id: 'remodelacion', nombre: 'Remodelación' },
  { id: 'asfaltado', nombre: 'Asfaltado y vialidad' },
  { id: 'arquitectura', nombre: 'Proyectos arquitectónicos' },
  { id: 'ingenieria', nombre: 'Ingeniería' },
]

/** Las obras, en el orden en que se muestran. */
export const OBRAS = [
  {
    id: 'edificio-multifamiliar',
    nombre: 'Edificio multifamiliar',
    categoria: 'construccion',
    ubicacion: null,
    anio: null,
    descripcion: 'Estructura de concreto armado levantada piso a piso: encofrado, acero de refuerzo y vaciado de losas con supervisión de ingeniería.',
    fotos: ['estructura-columnas-losas', 'estructura-encofrado', 'equipo-obreros'],
    video: null,
    antesDespues: null,
    referencial: true,
    destacada: true,
  },
  {
    id: 'estructura-concreto-armado',
    nombre: 'Estructura de concreto armado',
    categoria: 'construccion',
    ubicacion: null,
    anio: null,
    descripcion: 'Armado de acero y control del refuerzo según los planos de cálculo, antes de cada vaciado.',
    fotos: ['equipo-armador', 'estructura-acero'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
  {
    id: 'remodelacion-cocina',
    nombre: 'Remodelación de cocina',
    categoria: 'remodelacion',
    ubicacion: null,
    anio: null,
    descripcion: 'Cocina abierta con isla: redistribución, instalaciones nuevas y acabados de principio a fin.',
    fotos: ['remodelacion-cocina', 'remodelacion-cocina-isla'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
  {
    id: 'remodelacion-apartamento',
    nombre: 'Remodelación de apartamento',
    categoria: 'remodelacion',
    ubicacion: null,
    anio: null,
    descripcion: 'Renovación de sala y baño: pisos, iluminación, mobiliario fijo y acabados.',
    fotos: ['remodelacion-sala', 'remodelacion-bano'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
  {
    id: 'asfaltado-carretera',
    nombre: 'Asfaltado de carretera',
    categoria: 'asfaltado',
    ubicacion: null,
    anio: null,
    descripcion: 'Carpeta asfáltica nueva con pavimentadora y compactación, señalización incluida.',
    fotos: ['asfaltado-via-nueva', 'asfaltado-pavimentadora', 'equipo-ingenieros-planos'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
  {
    id: 'vialidad-urbana',
    nombre: 'Vialidad urbana',
    categoria: 'asfaltado',
    ubicacion: null,
    anio: null,
    descripcion: 'Movimiento de tierra, base y asfaltado de vialidad urbana con maquinaria pesada.',
    fotos: ['asfaltado-compactadora', 'maquinaria-retroexcavadora', 'maquinaria-excavadora'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
  {
    id: 'vivienda-unifamiliar',
    nombre: 'Vivienda unifamiliar',
    categoria: 'arquitectura',
    ubicacion: null,
    anio: null,
    descripcion: 'Proyecto arquitectónico de vivienda: del diseño y los planos a la obra terminada.',
    fotos: ['arquitectura-casa', 'planos-mesa'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
  {
    id: 'diseno-fachada',
    nombre: 'Diseño de fachada',
    categoria: 'arquitectura',
    ubicacion: null,
    anio: null,
    descripcion: 'Fachada residencial de líneas limpias: diseño, detalles constructivos y ejecución.',
    fotos: ['arquitectura-fachada', 'planos-herramientas'],
    video: null,
    antesDespues: null,
    referencial: true,
  },
]

/** La obra con ese id (o undefined). */
export function buscarObra(id) {
  return OBRAS.find((o) => o.id === id)
}

/** La categoría (objeto de CATEGORIAS) de una obra o de un id de categoría. */
export function categoriaDe(obraOCategoria) {
  const id = typeof obraOCategoria === 'string' ? obraOCategoria : obraOCategoria?.categoria
  return CATEGORIAS.find((c) => c.id === id)
}

/** Las obras de una categoría ('todas' o vacío → todas). */
export function obrasPorCategoria(categoria, obras = OBRAS) {
  return !categoria || categoria === 'todas' ? obras : obras.filter((o) => o.categoria === categoria)
}

/** Solo las categorías que tienen al menos una obra (y 'todas'): para no mostrar filtros vacíos. */
export function categoriasConObras(obras = OBRAS) {
  return CATEGORIAS.filter((c) => c.id === 'todas' || obras.some((o) => o.categoria === c.id))
}

/** «Edificio residencial · Proyecto de ejemplo» si es referencial; si no, su nombre. */
export function nombreObra(obra) {
  if (!obra) return ''
  return obra.referencial ? `${obra.nombre} · Proyecto de ejemplo` : obra.nombre
}

/** «Valencia, Carabobo · 2024» con lo que haya (vacío en las de ejemplo). */
export function detalleObra(obra) {
  return [obra?.ubicacion, obra?.anio].filter(Boolean).join(' · ')
}
