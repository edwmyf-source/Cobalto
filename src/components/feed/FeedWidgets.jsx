import { useState, useEffect } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'
import { supabase } from '../../api/supabase'

export default function FeedWidgets() {
  const [widgets, setWidgets] = useState([])

  useEffect(() => {
    supabase
      .from('feed_widgets')
      .select('*')
      .eq('activo', true)
      .order('orden')
      .limit(3)
      .then(({ data }) => { if (data) setWidgets(data) })
      .catch(() => {})
  }, [])

  if (!widgets.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Descubre</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Contenido destacado para ti</p>
        </div>
        <Sparkles size={16} style={{ color: 'var(--accent-violet)' }} />
      </div>

      {widgets.map((w, index) => (
        <article key={w.id} className="overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-card)' }}>
          {w.imagen_url ? (
            <img src={w.imagen_url} alt={w.titulo} loading="lazy" decoding="async"
              className="w-full object-cover" style={{ aspectRatio: index === 0 ? '16/10' : '1/1' }} />
          ) : (
            <div className="w-full flex items-center justify-center relative overflow-hidden"
              style={{ aspectRatio: index === 0 ? '16/10' : '1/1', background: w.imagen_gradient || 'linear-gradient(135deg, #162A4A, #2457C5)' }}>
              <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 25% 25%, #fff 0, transparent 35%), radial-gradient(circle at 80% 70%, #fff 0, transparent 28%)' }} />
              <span className="relative text-4xl">{w.imagen_emoji || '✨'}</span>
            </div>
          )}

          <div className="p-4">
            <p className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              Destacado
            </p>
            <p className="text-[14px] font-semibold leading-5" style={{ color: 'var(--text-primary)' }}>
              {w.titulo}
            </p>
            <a href={w.btn_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 mt-3 px-3.5 rounded-btn text-[12px] font-semibold transition-all hover:-translate-y-px"
              style={{ background: w.btn_color || 'var(--accent-soft)', color: w.btn_text_color || 'var(--accent)', border: `1px solid ${w.btn_color ? 'transparent' : 'var(--accent-soft)'}` }}>
              {w.btn_texto || 'Ver más'}
              <ExternalLink size={12} />
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}
