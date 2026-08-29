import { useEffect, useState } from 'react'

// Cuando el teclado del celular aparece, el navegador reduce el "viewport
// visual" pero un elemento con position:fixed sigue midiéndose contra el
// viewport de LAYOUT (el de antes de abrir el teclado). El elemento "cree"
// que todo cabe y no deja hacer scroll, aunque el teclado tape media
// pantalla. Este hook devuelve el alto y el desplazamiento reales de lo que
// se ve, para que un contenedor fijo pueda ajustarse a ellos.
//
// `active` permite activar el listener solo mientras el modal que lo usa
// está abierto, para no dejar listeners de sobra el resto del tiempo.
export default function useVisualViewport(active = true) {
  const getSnapshot = () => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    return {
      height: vv?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 0),
      offsetTop: vv?.offsetTop ?? 0,
    }
  }

  const [viewport, setViewport] = useState(getSnapshot)

  useEffect(() => {
    if (!active) return
    const vv = window.visualViewport
    setViewport(getSnapshot())
    if (!vv) return

    const update = () => setViewport(getSnapshot())
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])

  return viewport
}
