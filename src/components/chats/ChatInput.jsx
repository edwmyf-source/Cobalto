import { useState } from 'react'
import { Send, Zap, Plane, ShieldCheck } from 'lucide-react'
import Spinner from '../shared/Spinner'

export default function ChatInput({ onSend, sending }) {
  const [msg, setMsg] = useState('')
  const [availability, setAvailability] = useState('immediate')

  const submit = () => {
    if (!msg.trim() || sending) return
    onSend(msg.trim(), availability)
    setMsg('')
  }

  return (
    <div className="px-4 py-3 border-t border-ink-300 bg-white space-y-2">
      {/* Recordatorio de privacidad */}
      <div className="flex items-center gap-1.5 text-[10px] text-ink-500">
        <ShieldCheck size={10} className="text-brand-600" />
        Solo el comprador verá tu propuesta. Otros vendedores no pueden ver tus precios.
      </div>

      {/* Selector de disponibilidad */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ink-500 font-medium">Disponibilidad:</span>
        <button type="button" onClick={() => setAvailability('immediate')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
            availability === 'immediate'
              ? 'bg-success-500/15 text-success-700 border border-success-500/30'
              : 'bg-white text-ink-500 border border-ink-300'
          }`}>
          <Zap size={11} />
          Inmediata
        </button>
        <button type="button" onClick={() => setAvailability('import')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
            availability === 'import'
              ? 'bg-warn-50 text-warn-700 border border-warn-500/30'
              : 'bg-white text-ink-500 border border-ink-300'
          }`}>
          <Plane size={11} />
          Por importación
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Describe tu propuesta: precio, disponibilidad, condiciones..."
          rows={2}
          className="flex-1 px-3 py-2 rounded-2xl border border-ink-300 text-[13px] resize-none focus:outline-none focus:border-brand-600"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        />
        <button onClick={submit} disabled={!msg.trim() || sending}
          className="h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl px-4 flex items-center gap-1.5 text-[13px] font-medium disabled:opacity-50 transition-colors">
          {sending ? <Spinner size={14} /> : <><Send size={13} /> Enviar</>}
        </button>
      </div>
    </div>
  )
}
