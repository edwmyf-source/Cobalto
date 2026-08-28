import { useState, useEffect } from 'react'
import { Gift, Rocket, BadgeCheck, Lock, MessageCircle, FlaskConical, Users, Building2, ArrowRight } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import LoginForm from './LoginForm'
import ResetForm from './ResetForm'
import Footer from '../layout/Footer'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'
import CobaltoMark from '../shared/CobaltoMark'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../legal/LegalContent'

// Ventajas con iconografía consistente: misma familia (lucide), mismo tamaño
// y mismo grosor de trazo.
const ADVANTAGES = [
  { icon: BadgeCheck,    title: 'Perfiles reales', sub: 'Sabes con quién hablas' },
  { icon: MessageCircle, title: 'Chat seguro',     sub: 'Contacto directo'       },
  { icon: Gift,          title: 'Gratis',          sub: 'Sin costos ocultos'     },
  { icon: Lock,          title: 'Privado',         sub: 'Tus datos protegidos'   },
]

// Las métricas crecen con el tiempo. Por debajo de 10.000 se muestra el número
// exacto (más creíble); por encima se compacta para que no desborde en móvil.
const formatMetric = (n) => {
  const v = n ?? 0
  if (v < 10000) return v.toLocaleString('es-CO')
  const decimals = v < 100000 ? 1 : 0
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: decimals }).format(v)
}

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA 1 — Contexto.
// Presenta la marca y explica qué es RedCobalto. Un solo botón: "Continuar".
// No hay formulario aquí: el acceso vive en la pantalla 2, para que nunca
// haya dos llamados a la acción que digan cosas distintas.
// ══════════════════════════════════════════════════════════════════════════
function ContextScreen({ stats, onContinue }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(170deg, var(--surface) 0%, var(--accent-softer) 100%)' }}>
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">

        <CobaltoMark size={72} rounded="rounded-[20px]" />

        <p className="font-extrabold leading-none mt-5" style={{ letterSpacing: '-0.03em', fontSize: 'clamp(26px, 7.4vw, 34px)' }}>
          <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
        </p>

        <h1 className="font-extrabold mt-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2, fontSize: 'clamp(19px, 5.2vw, 24px)' }}>
          Punto de encuentro de la<br />industria química
        </h1>

        <p className="mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13.5px, 3.6vw, 15px)' }}>
          La comunidad profesional del sector químico en Colombia. Conecta con
          laboratorios, proveedores y colegas; comparte información técnica,
          normatividad y oportunidades.
        </p>

        <div className="mt-4 flex items-center gap-2.5 flex-wrap justify-center">
          <span className="font-extrabold text-[14px]" style={{ color: 'var(--brand-red)' }}>Conecta</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="font-extrabold text-[14px]" style={{ color: 'var(--accent)' }}>Comparte</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="font-extrabold text-[14px]" style={{ color: 'var(--accent-violet)' }}>Crece</span>
        </div>

        {/* Métricas reales de la comunidad: dan contexto de tamaño y actividad */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-7">
          {[
            { icon: Users,        value: stats.members,   label: 'Miembros'      },
            { icon: FlaskConical, value: stats.posts,     label: 'Publicaciones' },
            { icon: Building2,    value: stats.companies, label: 'Empresas'      },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-card p-3 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
              <Icon size={15} strokeWidth={2} style={{ color: 'var(--accent)' }} />
              <p className="font-extrabold leading-none mt-1.5 tnum"
                style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)', fontSize: 19 }}>
                {formatMetric(value)}
              </p>
              <p className="text-[9px] mt-1 uppercase font-extrabold leading-tight"
                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Ventajas en dos columnas: contexto sin alargar demasiado la pantalla */}
        <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
          {ADVANTAGES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="rounded-card p-3 border flex items-start gap-2.5 text-left"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
              <span className="flex items-center justify-center w-8 h-8 rounded-input flex-shrink-0"
                style={{ background: 'var(--accent-soft)' }}>
                <Icon size={16} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onContinue}
          className="w-full mt-7 inline-flex items-center justify-center gap-2 rounded-btn font-extrabold h-[48px] text-[15px]
            transition-all duration-[160ms] ease-premium active:scale-[0.98]"
          style={{ background: 'var(--accent-deep)', color: '#fff', boxShadow: 'var(--shadow-raised)' }}>
          Continuar <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA 2 — Acceso.
// Solo el formulario, sin ruido de marketing. Un único camino: Google o
// código al correo (que sirve igual para cuenta nueva o existente).
// ══════════════════════════════════════════════════════════════════════════
function AccessScreen({ children, onBack }) {
  return (
    <div className="flex-1 flex items-start md:items-center justify-center px-4 py-8 md:py-12"
      style={{ background: 'radial-gradient(circle at top, rgba(36,87,197,0.06), transparent 34%), var(--bg-app)' }}>
      <div className="w-full max-w-[400px]">
        <div className="rounded-panel p-6 md:p-7 border relative overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-modal)' }}>
          <div className="absolute inset-x-0 top-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, var(--brand-red), var(--accent), var(--accent-violet))' }} />

          <div className="flex items-center gap-3 mb-6 mt-1">
            <CobaltoMark size={38} rounded="rounded-[11px]" />
            <div>
              <p className="t-body-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>Entrar a Cobalto</p>
              <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Con Google o con un código a tu correo</p>
            </div>
          </div>

          {children}
        </div>

        <button onClick={onBack}
          className="mt-5 mx-auto block text-[13px] font-bold hover:underline"
          style={{ color: 'var(--accent-deep)' }}>
          ← Volver
        </button>
      </div>
    </div>
  )
}

export default function AuthScreen() {
  const [mode, setMode] = useState('context') // context | access | reset | terminos | privacidad
  // El estado inicial debe incluir TODAS las métricas que se renderizan: en el
  // primer render (antes de que responda la consulta) una clave faltante seria
  // undefined, y undefined.toLocaleString() rompe la pantalla completa.
  const [stats, setStats] = useState({ members: 0, posts: 0, interactions: 0, comments: 0, companies: 0, cities: 0 })

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {})
  }, [])

  const isLegal = mode === 'terminos' || mode === 'privacidad'

  return (
    <div className="min-h-app flex flex-col" style={{ background: 'var(--bg-app)' }}>

      {/* La barra superior solo aparece fuera de la pantalla de contexto: ahí
          la marca ya es el protagonista y repetirla arriba sería redundante. */}
      {mode !== 'context' && (
        <header className="sticky top-0 z-40 w-full border-b"
          style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(18px)', borderColor: 'var(--border-soft)' }}>
          <div className="max-w-6xl mx-auto h-[64px] flex items-center px-4 md:px-6">
            <button onClick={() => setMode('context')} aria-label="Volver al inicio">
              <RedCobaltoLogo size="md" />
            </button>
          </div>
        </header>
      )}

      {mode === 'terminos' ? (
        <LegalLayout title="Términos y Condiciones" updated={LEGAL_UPDATED} onBack={() => setMode('context')}>
          <TerminosContent />
        </LegalLayout>
      ) : mode === 'privacidad' ? (
        <LegalLayout title="Política de Privacidad y Tratamiento de Datos" updated={LEGAL_UPDATED} onBack={() => setMode('context')}>
          <PrivacidadContent />
        </LegalLayout>
      ) : mode === 'context' ? (
        <ContextScreen stats={stats} onContinue={() => setMode('access')} />
      ) : (
        <AccessScreen onBack={() => setMode('context')}>
          {mode === 'reset'
            ? <ResetForm onSwitchLogin={() => setMode('access')} />
            : <LoginForm onSwitchReset={() => setMode('reset')} />}
        </AccessScreen>
      )}

      {!isLegal && (
        <Footer
          onTerminos={() => { setMode('terminos'); window.scrollTo({ top: 0 }) }}
          onPrivacidad={() => { setMode('privacidad'); window.scrollTo({ top: 0 }) }}
        />
      )}
    </div>
  )
}
