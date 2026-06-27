import { Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="page-enter flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      <h2 className="font-bold text-xl text-ink-900 mb-2">¿Necesitas ayuda?</h2>
      <p className="text-sm text-ink-500 mb-6">Escríbenos y te responderemos lo antes posible.</p>
      <a href="mailto:edwmyf@gmail.com"
         className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl">
        <Mail size={16} /> Contactar soporte
      </a>
    </div>
  )
}
