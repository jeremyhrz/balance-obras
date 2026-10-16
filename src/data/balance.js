/**
 * Datos de Balance — Obras Civiles: el ÚNICO lugar con información del negocio.
 * Fuente: lo que contó Jeremy Heras (hermano del ingeniero) y el logo, al 16 de octubre de 2026.
 * NO se inventan nombres de proyectos, clientes, cifras exactas, premios ni testimonios: lo único
 * cuantitativo confirmado es «más de 10 años» y «cientos de proyectos».
 * Lo que no sabemos con certeza lleva «// POR CONFIRMAR». Mientras un dato sea null, la UI no lo
 * muestra (o usa el texto de reserva que se indica).
 *
 * Este archivo, src/data/obras.js y src/lib/{whatsapp,medidas,texto}.js son JS puro (sin JSX ni
 * nada de Vite) e importan con extensión «.js»: así se prueban con node. Mantenlo así.
 *
 * *asteriscos* en un texto = énfasis: <TextoDividido> y <Enfasis> los pintan en oro;
 * textoPlano() (src/lib/texto.js) los quita.
 */

export const BALANCE = {
  nombre: 'Balance Obras Civiles',
  marca: 'BALANCE', // el wordmark
  rubro: 'Obras civiles',
  lema: 'Ingeniería · Construcción · Remodelación', // el del logo
  ingeniero: {
    nombre: null, // POR CONFIRMAR: nombre y apellido. Sin él, la UI dice «Ingeniero civil» y deja el marcador.
    titulo: 'Ingeniero civil',
    foto: null, // POR CONFIRMAR: id de src/data/fotos.json cuando llegue su retrato
  },
  experiencia: {
    texto: 'Más de 10 años', // dicho por Jeremy
    cifra: '+10',
    unidad: 'años',
    anios: null, // POR CONFIRMAR: años exactos (no mostrar otro número que «+10» hasta tenerlo)
  },
  proyectos: {
    texto: 'Cientos de proyectos', // dicho por Jeremy
    cifra: 'Cientos',
    unidad: 'de proyectos',
    numero: null, // POR CONFIRMAR: número aproximado (no mostrar ninguna cifra hasta tenerlo)
  },
  ubicacion: {
    ciudad: null, // POR CONFIRMAR
    estado: null, // POR CONFIRMAR
    pais: 'Venezuela',
    texto: 'Venezuela', // POR CONFIRMAR: «Ciudad, Estado» cuando se confirme (es lo que se muestra)
    zonaDeTrabajo: null, // POR CONFIRMAR: dónde acepta obras (¿todo el país?, ¿una región?)
  },
  whatsapp: {
    numero: null, // POR CONFIRMAR: formato wa.me, sin «+» ni espacios: '58412XXXXXXX'. Es la ÚNICA constante a cambiar.
    visible: null, // POR CONFIRMAR: cómo se escribe en pantalla: '+58 412-XXX XXXX'
  },
  correo: null, // POR CONFIRMAR
  instagram: { usuario: null, url: null }, // POR CONFIRMAR: { usuario: 'balance…', url: 'https://www.instagram.com/…/' }
  sitio: 'https://balance-obras.vercel.app', // el mismo de vite.config.js (SITIO)
}

/** Las dos cifras que se pueden mostrar (portada, nosotros). `valor` solo si se puede contar. */
export const CIFRAS = [
  { id: 'experiencia', cifra: '+10', valor: 10, prefijo: '+', etiqueta: 'años de experiencia' },
  { id: 'proyectos', cifra: 'Cientos', valor: null, prefijo: '', etiqueta: 'de proyectos' },
]

/**
 * Servicios, en el orden del brief (§5.6). Descripciones GENERALES: la lista exacta y el alcance
 * de cada uno están POR CONFIRMAR con el ingeniero (no inventar especialidades).
 * - `nombre`: el que va en el cotizador y en WhatsApp («• Tipo: Remodelación»).
 * - `icono`: clave de ICONOS en src/components/Iconos.jsx · `foto`: id de src/data/fotos.json o null.
 */
export const SERVICIOS = [
  {
    id: 'ingenieria',
    numero: '01',
    nombre: 'Ingeniería',
    titulo: 'Ingeniería',
    descripcion: 'Estudio, cálculo y planificación técnica para que cada obra arranque sobre bases firmes.',
    etiquetas: ['Estudios', 'Cálculo', 'Supervisión'], // POR CONFIRMAR
    icono: 'regla',
    foto: null,
  },
  {
    id: 'construccion',
    numero: '02',
    nombre: 'Construcción',
    titulo: 'Construcción',
    descripcion: 'Obras nuevas de principio a fin: de la fundación a la entrega, con supervisión en cada etapa.',
    etiquetas: ['Obra nueva', 'Estructura', 'Fundaciones'], // POR CONFIRMAR
    icono: 'grua',
    foto: null,
  },
  {
    id: 'remodelacion',
    numero: '03',
    nombre: 'Remodelación',
    titulo: 'Remodelación',
    descripcion: 'Remodelaciones y ampliaciones de espacios que ya existen, con el orden y el cuidado que piden.',
    etiquetas: ['Viviendas', 'Locales', 'Ampliaciones'], // POR CONFIRMAR
    icono: 'llana',
    foto: null,
  },
  {
    id: 'asfaltado',
    numero: '04',
    nombre: 'Asfaltado y vialidad',
    titulo: 'Asfaltado y vialidad',
    descripcion: 'Asfaltado y obras de vialidad, con la preparación de base y la compactación que pide el tránsito.',
    etiquetas: ['Asfaltado', 'Vialidad', 'Exteriores'], // POR CONFIRMAR
    icono: 'rodillo',
    foto: null,
  },
  {
    id: 'arquitectura',
    numero: '05',
    nombre: 'Proyectos arquitectónicos',
    titulo: 'Proyectos arquitectónicos',
    descripcion: 'Diseño y planos del proyecto, para que veas tu obra antes de poner el primer bloque.',
    etiquetas: ['Diseño', 'Planos', 'Anteproyecto'], // POR CONFIRMAR
    icono: 'plano',
    foto: null,
  },
]

/** El servicio con ese id (o undefined). */
export function buscarServicio(id) {
  return SERVICIOS.find((s) => s.id === id)
}

/** Tipos de obra del cotizador (paso 1): los servicios y «Otro». El id es el de SERVICIOS. */
export const TIPOS_OBRA = [
  ...SERVICIOS.map(({ id, nombre, icono }) => ({ id, nombre, icono })),
  { id: 'otro', nombre: 'Otro tipo de obra', icono: 'casco' },
]

export function buscarTipoObra(id) {
  return TIPOS_OBRA.find((t) => t.id === id)
}

/** Plazos del cotizador (paso 4). `nombre` es lo que va en el mensaje («• Plazo: 1 a 3 meses»). */
export const PLAZOS = [
  { id: 'pronto', nombre: 'Lo antes posible' },
  { id: '1-3', nombre: '1 a 3 meses' },
  { id: '3-6', nombre: '3 a 6 meses' },
  { id: '6+', nombre: 'Más de 6 meses' },
  { id: 'sin-fecha', nombre: 'Aún no lo sé' },
]

export function buscarPlazo(id) {
  return PLAZOS.find((p) => p.id === id)
}

/**
 * Control deslizante del tamaño (paso 3), en m², con escala logarítmica (src/lib/medidas.js):
 * de un baño a un estacionamiento sin que los tamaños chicos queden apretados en un extremo.
 */
export const TAMANO = { min: 5, max: 5000, inicial: 120, unidad: 'm²' }

/** Referencias para orientar a quien no sabe cuántos m² tiene (medidas típicas, no de obras reales). */
export const REFERENCIAS_TAMANO = [
  { m2: 6, texto: 'Un baño' },
  { m2: 70, texto: 'Un apartamento' },
  { m2: 150, texto: 'Una casa' },
  { m2: 1000, texto: 'Un estacionamiento' },
]

/** Lo que dice la portada (§5.3). */
export const PORTADA = {
  titulo: 'Construimos *con balance*', // en dos renglones: «CONSTRUIMOS / CON BALANCE»
  bajada: 'Ingeniería · Construcción · Remodelación',
  texto: 'Del plano a la obra terminada: ingeniería, construcción y remodelación con el balance justo entre costo, tiempo y calidad.',
}

/** «De plano a realidad» (§5.4): los cinco pasos que acompañan el dibujo, con su anotación de plano. */
export const PASOS_PLANO = [
  {
    numero: '01',
    titulo: 'Estudio y diseño',
    texto: 'Escuchamos lo que necesitas, medimos el terreno y lo llevamos al papel.',
    anotacion: 'Escala 1:100',
  },
  {
    numero: '02',
    titulo: 'Ingeniería y cálculo',
    texto: 'Cada viga y cada columna se calculan antes de vaciar el primer metro de concreto.',
    anotacion: 'Ø12 @ 20 cm',
  },
  {
    numero: '03',
    titulo: 'Construcción',
    texto: 'Fundaciones, columnas y losas, piso a piso y con supervisión en obra.',
    anotacion: 'N+3.20',
  },
  {
    numero: '04',
    titulo: 'Acabados',
    texto: 'Fachada, vidrio, pisos y detalles: donde la obra toma su carácter.',
    anotacion: 'Fachada principal',
  },
  {
    numero: '05',
    titulo: 'Entrega',
    texto: 'Recorremos la obra contigo y te la entregamos lista para usar.',
    anotacion: 'Obra al 100 %',
  },
]

/** La cinta técnica (§5.5), en este orden. */
export const CINTA = ['Ingeniería', 'Construcción', 'Remodelación', 'Asfaltado', 'Proyectos arquitectónicos']

/** Proceso de trabajo (§5.8). Textos generales: el detalle de cada paso está POR CONFIRMAR. */
export const PROCESO = [
  { numero: '01', titulo: 'Visita y diagnóstico', texto: 'Vamos al sitio, medimos y escuchamos qué quieres lograr.' },
  { numero: '02', titulo: 'Propuesta y presupuesto', texto: 'Te presentamos el alcance, los tiempos y un presupuesto claro antes de empezar.' },
  { numero: '03', titulo: 'Ingeniería y diseño', texto: 'Planos y cálculos: la obra se resuelve en el papel antes de mover la primera pala.' },
  { numero: '04', titulo: 'Ejecución con supervisión', texto: 'Construimos con supervisión de ingeniería en cada etapa y te mantenemos al tanto del avance.' },
  { numero: '05', titulo: 'Entrega', texto: 'Revisamos la obra contigo, detalle por detalle, y te la entregamos terminada.' },
]

/** Nosotros (§5.10). Los textos de los pilares están POR CONFIRMAR con el ingeniero. */
export const NOSOTROS = {
  titulo: 'El balance entre *costo, tiempo y calidad*',
  texto:
    'Más de 10 años y cientos de proyectos nos enseñaron que una buena obra no sacrifica ninguno de los tres: se planifica para cumplir con los tres.',
  pilares: [
    { id: 'costo', nombre: 'Costo', texto: 'Un presupuesto claro antes de empezar, para que sepas en qué se invierte cada parte.' }, // POR CONFIRMAR
    { id: 'tiempo', nombre: 'Tiempo', texto: 'Plazos realistas y seguimiento del avance en cada etapa.' }, // POR CONFIRMAR
    { id: 'calidad', nombre: 'Calidad', texto: 'Procesos supervisados por ingeniería, de la fundación a los acabados.' }, // POR CONFIRMAR
  ],
}

/** Contacto (§5.11). */
export const CONTACTO = {
  titulo: '¿Hablamos de *tu obra*?',
  texto: 'Escríbenos por WhatsApp, cuéntanos qué tienes en mente y coordinamos una visita.',
}

/** Anotaciones de plano para decorar (retícula, cotas, portada). Genéricas: no describen obras reales. */
export const ANOTACIONES = ['N+0.00', 'N+3.20', 'N+6.40', 'Ø12 @ 20 cm', 'Escala 1:100', 'Losa e = 20 cm', 'Viga 30 × 50', 'Col. 40 × 40', 'Eje A-3']

/** Pie de página. */
export const DERECHOS = '© 2026 Balance Obras Civiles'

/** Crédito del pie: «Diseño y desarrollo: Jeremy Heras» → su WhatsApp con el mensaje ya escrito. */
export const CREDITO = {
  texto: 'Diseño y desarrollo: Jeremy Heras',
  whatsapp: '584127162731',
  mensaje: 'Hola Jeremy, vi la página de Balance',
}
