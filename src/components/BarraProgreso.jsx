import { m, useScroll, useSpring } from 'framer-motion'

/** Hilo de oro con el progreso de lectura, arriba del todo (z 41, sobre la navegación). */
export default function BarraProgreso() {
  const { scrollYProgress } = useScroll()
  const escala = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-progreso h-[2px] origin-left bg-oro"
      style={{ scaleX: escala }}
    />
  )
}
