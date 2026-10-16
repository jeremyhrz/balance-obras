/**
 * Prueba con node que los mensajes de WhatsApp salgan EXACTOS (brief §5.9), con y sin número.
 * Uso (desde la raíz):  node scripts/probar_whatsapp.mjs     (o npm run test:whatsapp)
 * Sale con código 1 si algo no coincide.
 */
import assert from 'node:assert/strict'
import { BALANCE } from '../src/data/balance.js'
import {
  HAY_NUMERO,
  enlaceCredito,
  enlaceWhatsApp,
  mensajeCotizacion,
  mensajeGeneral,
  mensajeObra,
  mensajeServicio,
} from '../src/lib/whatsapp.js'
import { formatearArea, posicionDesdeTamano, tamanoDesdePosicion } from '../src/lib/medidas.js'

let pruebas = 0
const prueba = (nombre, fn) => {
  fn()
  pruebas += 1
  console.log(`  ✓ ${nombre}`)
}
const decodificar = (url) => decodeURIComponent(url.slice(url.indexOf('?text=') + '?text='.length))

console.log(`Número de WhatsApp en balance.js: ${BALANCE.whatsapp.numero ?? 'null (POR CONFIRMAR)'}`)

prueba('cotización completa, en el formato exacto del brief', () => {
  const texto = mensajeCotizacion({
    tipo: 'remodelacion',
    ubicacion: '  Valencia,   Carabobo ',
    tamano: 120,
    plazo: '1-3',
    detalles: 'Ampliar la cocina\ny cambiar el piso.',
    nombre: 'Carlos',
  })
  assert.equal(
    texto,
    [
      'Hola, Balance Obras Civiles 👷 Quiero cotizar una obra:',
      '• Tipo: Remodelación',
      '• Ubicación: Valencia, Carabobo',
      '• Tamaño aprox.: 120 m²',
      '• Plazo: 1 a 3 meses',
      '• Detalles: Ampliar la cocina y cambiar el piso.',
      '• Nombre: Carlos',
      '¿Podemos coordinar una visita?',
    ].join('\n'),
  )
})

prueba('solo lo que se llenó (tipo y tamaño), con miles a la venezolana', () => {
  assert.equal(
    mensajeCotizacion({ tipo: 'asfaltado', tamano: 1200 }),
    'Hola, Balance Obras Civiles 👷 Quiero cotizar una obra:\n• Tipo: Asfaltado y vialidad\n• Tamaño aprox.: 1.200 m²\n¿Podemos coordinar una visita?',
  )
})

prueba('sin nada: saludo y cierre', () => {
  assert.equal(mensajeCotizacion(), 'Hola, Balance Obras Civiles 👷 Quiero cotizar una obra:\n¿Podemos coordinar una visita?')
  assert.equal(mensajeCotizacion({ tipo: '', ubicacion: '   ', tamano: 0, nombre: null }), mensajeCotizacion())
})

prueba('tipo, plazo y tamaño escritos a mano', () => {
  const texto = mensajeCotizacion({ tipo: 'Galpón industrial', plazo: 'En diciembre', tamano: '300' })
  assert.match(texto, /\n• Tipo: Galpón industrial\n/)
  assert.match(texto, /\n• Tamaño aprox\.: 300 m²\n/)
  assert.match(texto, /\n• Plazo: En diciembre\n/)
  assert.match(mensajeCotizacion({ tamano: '80 m2' }), /• Tamaño aprox\.: 80 m2\n/)
  assert.equal(mensajeCotizacion({ tipo: { id: 'otro', nombre: 'Otro tipo de obra' } }).split('\n')[1], '• Tipo: Otro tipo de obra')
})

prueba('enlace SIN número: wa.me/?text= (WhatsApp deja elegir el chat)', () => {
  const texto = mensajeCotizacion({ tipo: 'construccion', nombre: 'Ana & José' })
  const url = enlaceWhatsApp(texto, null)
  assert.ok(url.startsWith('https://wa.me/?text='), url)
  assert.equal(decodificar(url), texto)
  assert.ok(!/[\s&#?]/.test(url.slice('https://wa.me/?text='.length)), 'todo va codificado con encodeURIComponent')
})

prueba('enlace CON número (se limpian «+», espacios y guiones)', () => {
  const url = enlaceWhatsApp('Hola', '+58 412-123.4567')
  assert.equal(url, 'https://wa.me/584121234567?text=Hola')
})

prueba('enlace por defecto: el número de balance.js (o el selector de chats si es null)', () => {
  const url = enlaceWhatsApp(mensajeGeneral())
  if (HAY_NUMERO) assert.ok(url.startsWith(`https://wa.me/${String(BALANCE.whatsapp.numero).replace(/\D/g, '')}?text=`))
  else assert.ok(url.startsWith('https://wa.me/?text='))
})

prueba('mensaje general y de servicio', () => {
  assert.equal(mensajeGeneral(), 'Hola, Balance Obras Civiles 👷 Vi su página web y quiero más información.')
  assert.equal(mensajeServicio('remodelacion'), 'Hola, Balance Obras Civiles 👷 Vi su página web y quiero información sobre *Remodelación*.')
  assert.equal(mensajeServicio({ nombre: 'Ingeniería' }), 'Hola, Balance Obras Civiles 👷 Vi su página web y quiero información sobre *Ingeniería*.')
})

prueba('mensaje de una obra de ejemplo', () => {
  assert.equal(
    mensajeObra({ nombre: 'Edificio residencial', referencial: true }),
    'Hola, Balance Obras Civiles 👷 Vi en su página la obra «Edificio residencial · Proyecto de ejemplo» y quiero cotizar algo parecido.',
  )
})

prueba('crédito del pie: WhatsApp de Jeremy con su mensaje', () => {
  assert.equal(enlaceCredito(), 'https://wa.me/584127162731?text=Hola%20Jeremy%2C%20vi%20la%20p%C3%A1gina%20de%20Balance')
})

prueba('deslizador de m²: extremos, ida y vuelta, formato', () => {
  assert.equal(tamanoDesdePosicion(0), 5)
  assert.equal(tamanoDesdePosicion(1000), 5000)
  for (const m2 of [10, 60, 120, 450, 1200, 3000]) {
    const vuelta = tamanoDesdePosicion(posicionDesdeTamano(m2))
    assert.ok(Math.abs(vuelta - m2) / m2 < 0.06, `${m2} → ${vuelta}`)
  }
  assert.equal(formatearArea(2500), '2.500 m²')
})

console.log(`\n${pruebas} pruebas, todas bien.`)
