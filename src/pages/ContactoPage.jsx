import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Send, Copy, Check, MessageSquareText, Clock, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/shared/Toast'
import { Card, Panel, Button } from '../components/ui'

const CONTACT_EMAIL = 'info@redcobalto.com'

const inputCls = 'w-full px-4 py-3 rounded-input text-[16px] transition-all duration-[160ms] ease-premium'
const inputStyle = {
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  boxShadow: 'inset 0 0 0 1px var(--border)',
}

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

  const [asunto, setAsunto] = useState(ASUNTOS[0])
  const [mensaje, setMensaje] = useState('')
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
    <div className="page-enter max-w-lg mx-auto p-6">

      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 t-body-sm font-medium mb-6 transition-colors duration-[160ms]"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
        <ArrowLeft size={16} strokeWidth={2} /> Volver
      </button>

      <h1 className="t-h1" style={{ color: 'var(--text-primary)' }}>Contáctanos</h1>
      <p className="t-body mt-2 mb-8" style={{ color: 'var(--text-secondary)' }}>
        ¿Tienes una duda, encontraste un problema o quieres proponernos algo? Escríbenos.
      </p>

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
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
        <label className="t-label block mb-2" style={{ color: 'var(--text-secondary)' }}>
          Asunto
        </label>
        <select value={asunto} onChange={e => setAsunto(e.target.value)}
          className={`${inputCls} mb-4`} style={inputStyle}>
          {ASUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label className="t-label block mb-2" style={{ color: 'var(--text-secondary)' }}>
          Mensaje
        </label>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
          rows={5} placeholder="Cuéntanos en qué podemos ayudarte"
          className={`${inputCls} resize-none`} style={{ ...inputStyle, minHeight: 120 }} />

        <p className="t-caption mt-2 mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Se abrirá tu aplicación de correo con el mensaje listo para enviar.
        </p>

        <Button fullWidth icon={Send} onClick={enviarCorreo} disabled={!mensaje.trim()}>
          Enviar mensaje
        </Button>
      </Card>

    </div>
  )
}
