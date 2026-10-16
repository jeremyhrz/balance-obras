import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { buscarTipoObra } from '../data/balance.js'
import { navegar } from './rutas'

/**
 * Estado compartido del cotizador: qué tipo de obra está elegido y cómo llevar a alguien a
 * #cotiza con un tipo ya marcado desde cualquier sección (Servicios, Obras, la navegación, el
 * botón flotante, la portada).
 *
 *   const { tipoId, tipo, elegirTipo, irACotizar, peticion } = useCotizacion()
 *   <button onClick={() => irACotizar('remodelacion')}>Cotizar una remodelación</button>  marca el tipo y lleva a /cotiza
 *   <button onClick={() => irACotizar()}>Cotiza tu obra</button>                           solo lleva a /cotiza
 *
 * - `tipoId`: id de TIPOS_OBRA (los de SERVICIOS + 'otro') o null · `tipo`: el objeto o null.
 * - `elegirTipo(id)`: marca un tipo (null lo desmarca) sin mover el scroll: lo usa el paso 1.
 * - `irACotizar(id?)`: con id, lo marca y sube `peticion`; luego lleva a la página /cotiza (con la cortina).
 *   Pásala directo a onClick sin miedo: si recibe el evento en vez de un id, lo ignora.
 * - `peticion`: número que sube cada vez que otra sección pide cotizar un tipo concreto. El
 *   asistente lo escucha (useEffect sobre `peticion`) para saltar directo al paso 2 (ubicación).
 */

const ContextoCotizacion = createContext(null)

export function ProveedorCotizacion({ children }) {
  const [tipoId, setTipoId] = useState(null)
  const [peticion, setPeticion] = useState(0)

  const elegirTipo = useCallback((id) => {
    setTipoId(typeof id === 'string' && buscarTipoObra(id) ? id : null)
  }, [])

  const irACotizar = useCallback((id) => {
    if (typeof id === 'string' && buscarTipoObra(id)) {
      setTipoId(id)
      setPeticion((n) => n + 1)
    }
    navegar('cotiza')
  }, [])

  const valor = useMemo(
    () => ({ tipoId, tipo: tipoId ? buscarTipoObra(tipoId) : null, elegirTipo, irACotizar, peticion }),
    [tipoId, elegirTipo, irACotizar, peticion],
  )

  return <ContextoCotizacion.Provider value={valor}>{children}</ContextoCotizacion.Provider>
}

/** Ver arriba. Fuera de <ProveedorCotizacion> avisa en desarrollo y solo sabe bajar a #cotiza. */
export function useCotizacion() {
  const contexto = useContext(ContextoCotizacion)
  if (contexto) return contexto
  if (import.meta.env?.DEV) console.warn('useCotizacion(): falta <ProveedorCotizacion> (está en src/Proveedores.jsx)')
  return SIN_PROVEEDOR
}

const SIN_PROVEEDOR = {
  tipoId: null,
  tipo: null,
  elegirTipo: () => {},
  irACotizar: () => navegar('cotiza'),
  peticion: 0,
}
