import { useState, useEffect, useRef } from 'react'

/**
 * Oculta un elemento al bajar y lo vuelve a mostrar al subir (como LinkedIn).
 *
 * @param {object}  opts
 * @param {number}  opts.threshold   Píxeles de scroll necesarios para reaccionar.
 *                                   Evita que la barra tiemble con micro-movimientos.
 * @param {number}  opts.topOffset   Por debajo de este scroll la barra siempre se ve.
 * @param {boolean} opts.disabled    Fuerza que permanezca visible (ej: menú abierto).
 * @param {any}     opts.resetKey    Al cambiar, vuelve a mostrar (ej: cambio de ruta).
 * @returns {boolean} visible
 */
export default function useHideOnScroll({ threshold = 8, topOffset = 60, disabled = false, resetKey = null } = {}) {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const ticking = useRef(false)

  // Al navegar a otra pantalla la barra siempre reaparece: si el scroll quedara
  // en una posición baja no se dispararía ningún evento y quedaría escondida.
  useEffect(() => {
    setVisible(true)
    lastY.current = typeof window !== 'undefined' ? (window.scrollY || 0) : 0
  }, [resetKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    lastY.current = window.scrollY || 0

    const update = () => {
      const y = window.scrollY || 0
      const doc = document.documentElement

      // Si la página casi no tiene scroll, no tiene sentido esconder nada.
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable < 120) {
        setVisible(true)
        lastY.current = y
        ticking.current = false
        return
      }

      // Cerca del inicio siempre visible.
      if (y < topOffset) {
        setVisible(true)
        lastY.current = y
        ticking.current = false
        return
      }

      // Al final de la página también, para no dejar contenido tapado.
      if (y + window.innerHeight >= doc.scrollHeight - 8) {
        setVisible(true)
        lastY.current = y
        ticking.current = false
        return
      }

      const delta = y - lastY.current
      if (Math.abs(delta) > threshold) {
        setVisible(delta < 0)   // subiendo → mostrar; bajando → ocultar
        lastY.current = y
      }
      ticking.current = false
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, topOffset])

  // Mientras esté deshabilitado (menú abierto, etc.) se mantiene a la vista.
  return disabled ? true : visible
}
