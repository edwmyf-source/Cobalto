import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Send, Copy, Check, MessageSquareText, Clock, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { Card, Panel, Button } from '../components/ui'
import { hoverProps } from '../lib/hover'

const CONTACT_EMAIL = 'info@redcobalto.com'

const inputCls = 'w-full px-4 py-3 rounded-input text-[16px] transition-all duration-[160ms] ease-premium'
const inputStyle = {
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  boxShadow: 'inset 0 0 0 1px var(--border)',
}

// Todos los motivos al mismo nivel, sin destacar ninguno: la página se percibe
// como un canal transparente de contacto, no como una vitrina de venta.
const ASUNTOS = [
  'Tengo una duda',
  'Reportar un problema',
  'Sugerencia',
  'Quiero anunciarme',
  'Otro',
]

export default function ContactoPage() {
  const navigate = useNavigate()
  const { profile, session } = useAuth()
  const toast = useToast()

  // Si se llegó aquí desde "Reportar" en un mensaje de error, la URL trae el
  // asunto y el mensaje ya armados con el contexto real del problema.
  const params = new URLSearchParams(window.location.search)
  const prefillAsunto = params.get('asunto')
  const prefillMensaje = params.get('mensaje')

  const [asunto, setAsunto] = useState(prefillAsunto && ASUNTOS.includes(prefillAsunto) ? prefillAsunto : ASUNTOS[0])
  const [mensaje, setMensaje] = useState(prefillMensaje || '')
  const [copied, setCopied] = useState(false)

  const nombre = profile?.full_name || ''
  const correo = (() => {
    const raw = session?.user?.email || ''
    // El registro exprés por celular usa un correo interno que no debe mostrarse.
    return raw.endsWith('@phone.redcobalto.com') ? '' : raw
  })()

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      toast('Correo copiado', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('No se pudo copiar. Selecciónalo manualmente.', 'error')
    }
  }

  // Abre el cliente de correo del dispositivo con todo prellenado.
  const enviarCorreo = () => {
    if (!mensaje.trim()) {
      toast('Escribe tu mensaje antes de enviarlo.', 'error')
      return
    }
    const cuerpo = [
      mensaje.trim(),
      '',
      '—',
      nombre && `Enviado por: ${nombre}`,
      correo && `Correo: ${correo}`,
      profile?.phone && `Celular: ${profile.phone}`,
    ].filter(Boolean).join('\n')

    const url = `mailto:${CONTACT_EMAIL}`
      + `?subject=${encodeURIComponent(`[Cobalto] ${asunto}`)}`
      + `&body=${encodeURIComponent(cuerpo)}`

    window.location.href = url
  }

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10">

      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 t-body-sm font-medium mb-6 transition-colors duration-[160ms]"
        style={{ color: 'var(--text-tertiary)' }}
        {...hoverProps(
          e => e.currentTarget.style.color = 'var(--text-secondary)',
          e => e.currentTarget.style.color = 'var(--text-tertiary)',
        )}>
        <ArrowLeft size={16} strokeWidth={2} /> Volver
      </button>

      <div className="mb-8 rounded-panel p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgba(36,87,197,0.08), rgba(230,57,70,0.06) 55%, rgba(255,255,255,0.9))', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
            <MessageSquareText size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p className="t-caption font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--accent-deep)' }}>REDCOBALTO</p>
            <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>Estamos para ayudarte</p>
          </div>
        </div>
        <h1 className="t-h1" style={{ color: 'var(--text-primary)' }}>Hablemos</h1>
      <p className="t-body mt-2" style={{ color: 'var(--text-secondary)' }}>
        ¿Tienes una duda, encontraste un problema o quieres proponernos algo? Escríbenos.
      </p>
      </div>

      {/* ── Correo corporativo ── */}
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-input flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-soft)' }}>
            <Mail size={18} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Correo</p>
            <p className="t-body-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {CONTACT_EMAIL}
            </p>
          </div>
          <button onClick={copyEmail} aria-label="Copiar correo"
            className="flex-shrink-0 w-9 h-9 rounded-input flex items-center justify-center transition-colors duration-[160ms]"
            style={{ color: copied ? 'var(--success)' : 'var(--text-tertiary)' }}
            {...hoverProps(
              e => e.currentTarget.style.background = 'var(--bg-subtle)',
              e => e.currentTarget.style.background = 'transparent',
            )}>
            {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={2} />}
          </button>
        </div>
      </Card>

      {/* ── Datos adicionales ── */}
      <Panel className="p-5 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MapPin size={16} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
          <div>
            <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Ubicación</p>
            <p className="t-body-sm" style={{ color: 'var(--text-primary)' }}>Colombia</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={16} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
          <div>
            <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Tiempo de respuesta</p>
            <p className="t-body-sm" style={{ color: 'var(--text-primary)' }}>Normalmente dentro de 24 horas hábiles</p>
          </div>
        </div>
      </Panel>

      {/* ── Escribir directamente ── */}
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareText size={16} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
        <h2 className="t-h4" style={{ color: 'var(--text-primary)' }}>Escríbenos directamente</h2>
      </div>

      <Card className="p-5">
        <label htmlFor="contacto-asunto" className="t-label block mb-2" style={{ color: 'var(--text-secondary)' }}>
          Asunto
        </label>
        <select id="contacto-asunto" value={asunto} onChange={e => setAsunto(e.target.value)}
          className={`${inputCls} mb-4`} style={inputStyle}>
          {ASUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label htmlFor="contacto-mensaje" className="t-label block mb-2" style={{ color: 'var(--text-secondary)' }}>
          Mensaje
        </label>
        <textarea id="contacto-mensaje" value={mensaje} onChange={e => setMensaje(e.target.value)}
          rows={5} placeholder="Cuéntanos en qué podemos ayudarte"
          className={`${inputCls} resize-none`} style={{ ...inputStyle, minHeight: 120 }} />

        <p className="t-caption mt-2 mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Se abrirá tu aplicación de correo con el mensaje listo para enviar.
        </p>

        <Button fullWidth icon={Send} onClick={enviarCorreo} disabled={!mensaje.trim()}>
          Enviar mensaje
        </Button>
      </Card>

      {/* Acceso a los documentos legales desde dentro de la app */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-8">
        <button onClick={() => navigate('/terminos')}
          className="t-caption font-medium hover:underline" style={{ color: 'var(--text-tertiary)' }}>
          Términos y Condiciones
        </button>
        <button onClick={() => navigate('/privacidad')}
          className="t-caption font-medium hover:underline" style={{ color: 'var(--text-tertiary)' }}>
          Política de Privacidad
        </button>
      </div>

    </div>
  )
}
