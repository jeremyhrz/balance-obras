import { useEffect, useMemo } from 'react'
import { transform, useMotionValue } from 'framer-motion'

/**
 * Como useTransform, pero a prueba de la trampa de StrictMode (ver API de la base, §9): el valor se
 * recalcula en un efecto suscrito a `fuente`, así el doble montaje de desarrollo no lo deja
 * congelado. Para las animaciones ligadas al scroll de «De plano a realidad».
 *
 *   const opacidad = useMapeo(avance, [0.2, 0.4], [0, 1])          // rangos, con clamp
 *   const recorte = useDerivado(destape, (v) => `inset(${v}% 0 0 0)`) // cualquier función
 */
export function useMapeo(fuente, entrada, salida, opciones) {
  const clave = JSON.stringify([entrada, salida, opciones])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapa = useMemo(() => transform(entrada, salida, { clamp: true, ...opciones }), [clave])
  return useDerivado(fuente, mapa)
}

export function useDerivado(fuente, funcion) {
  const valor = useMotionValue(funcion(fuente.get()))
  useEffect(() => {
    const actualizar = () => valor.set(funcion(fuente.get()))
    actualizar()
    return fuente.on('change', actualizar)
  }, [fuente, funcion, valor])
  return valor
}
