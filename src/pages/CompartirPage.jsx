import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Cuando alguien comparte algo hacia RedCobalto desde LinkedIn, WhatsApp,
// Facebook, etc. (usando el "share_target" del manifest de la PWA), el
// sistema operativo trae aquí a la persona con el título/texto/enlace que
// compartió. Esta pantalla nunca publica nada sola: solo traduce esos datos
// y abre el cuadro de publicar ya con el contenido puesto, para que la
// persona revise y confirme con un toque.
export default function CompartirPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('titulo') || ''
    const x = params.get('texto') || ''
    const u = params.get('enlace') || ''
    const q = new URLSearchParams({ publish: '1' })
    if (t) q.set('t', t)
    if (x) q.set('x', x)
    if (u) q.set('u', u)
    navigate(`/feed?${q.toString()}`, { replace: true })
  }, [navigate])

  return null
}
