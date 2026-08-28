import { useState, useEffect } from 'react'
import { BadgeCheck, Lock, MessageCircle, Gift, Users, FlaskConical, Zap, Building2, MapPin, ArrowRight } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import LoginForm from './LoginForm'
import Footer from '../layout/Footer'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'
import CobaltoMark from '../shared/CobaltoMark'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../legal/LegalContent'

// Ventajas con iconografía consistente: misma familia (lucide), mismo tamaño
// y mismo grosor de trazo en las cuatro.
const ADVANTAGES = [
  { icon: BadgeCheck,    title: 'Perfiles reales', sub: 'Sabes con quién hablas' },
  { icon: MessageCircle, title: 'Chat seguro',     sub: 'Contacto directo'       },
  { icon: Gift,          title: 'Gratis',          sub: 'Sin costos ocultos'     },
  { icon: Lock,          title: 'Privado',         sub: 'Tus datos protegidos'   },
]

// Las métricas crecen con el tiempo. Por debajo de 10.000 se muestra el número
// exacto (más creíble); por encima se compacta para que no desborde la caja.
const formatMetric = (n) => {
  const v = n ?? 0
  if (v < 10000) return v.toLocaleString('es-CO')
  const decimals = v < 100000 ? 1 : 0
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: decimals }).format(v)
}

// Barra superior: solo el logo. Un único CTA vive en el hero (y se repite,
// con el mismo texto, al final): evita la mezcla "Entrar" arriba / "Unirse"
// abajo / "Crear cuenta" al fondo que hacía confusa la pantalla anterior.
function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(18px)', borderColor: 'var(--border-soft)' }}>
      <div className="max-w-6xl mx-auto h-[72px] flex items-center px-4 md:px-6">
        <RedCobaltoLogo size="md" />
      </div>
    </header>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA 1 — Bienvenida. Versión rica: hero + marca en escritorio + fila
// de métricas + ventajas + CTA final. Un solo texto de botón en toda la
// pantalla ("Únete a la comunidad"), sin importar cuántas veces se repita.
// ══════════════════════════════════════════════════════════════════════════
function Landing({ stats, onContinue }) {
  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-8 md:gap-12">

      {/* ── Hero ── */}
      <section className="md:flex md:items-center md:gap-12">
        <div className="md:flex-1">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--brand-red)' }} />
            <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>COMUNIDAD PROFESIONAL</span>
          </div>

          <h1 className="text-left font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 0.96 }}>
            <span className="block" style={{ fontSize: 'clamp(30px, 9.5vw, 54px)' }}>Punto de encuentro</span>
            <span className="block mt-2" style={{ color: 'var(--accent)', fontSize: 'clamp(19px, 5.8vw, 32px)' }}>
              de la industria química en Colombia
            </span>
          </h1>

          <p className="mt-6 leading-relaxed max-w-[520px]" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15px, 4vw, 18px)' }}>
            Conecta con profesionales, técnicos, tecnólogos, empresas y
            proveedores del sector químico. Comparte conocimiento, encuentra
            oportunidades y haz parte de una comunidad donde la industria se
            conecta, colabora y crece.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <span className="font-extrabold" style={{ color: 'var(--brand-red)', fontSize: 'clamp(15px, 4vw, 19px)' }}>Conecta</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent)', fontSize: 'clamp(15px, 4vw, 19px)' }}>Comparte</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent-violet)', fontSize: 'clamp(15px, 4vw, 19px)' }}>Crece</span>
          </div>

          <button onClick={onContinue}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-btn font-extrabold h-[52px] px-8 text-[15.5px]
              transition-all duration-[160ms] ease-premium active:scale-[0.98] hover:brightness-110"
            style={{ background: 'var(--accent-deep)', color: '#fff', boxShadow: 'var(--shadow-raised)' }}>
            Únete a la comunidad <ArrowRight size={19} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Marca: llena el vacío de la derecha en escritorio ── */}
        <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:w-[360px] flex-shrink-0">
          <div className="relative flex items-center justify-center w-full">
            {/* Círculo sutil de fondo, mismo lenguaje visual que el splash */}
            <div className="absolute rounded-full" aria-hidden="true"
              style={{ width: 300, height: 300, background: 'var(--accent-softer)' }} />
            <div className="absolute rounded-full" aria-hidden="true"
              style={{ width: 230, height: 230, border: '1px solid var(--border-soft)' }} />
            <div className="relative flex flex-col items-center gap-5">
              <CobaltoMark size={104} rounded="rounded-[28px]" />
              <div className="text-center">
                <p className="font-extrabold leading-none" style={{ letterSpacing: '-0.03em', fontSize: 34 }}>
                  <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
                </p>
                <p className="t-eyebrow mt-2.5" style={{ color: 'var(--text-tertiary)' }}>
                  INDUSTRIA QUÍMICA · COLOMBIA
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Métricas: fila completa bajo el hero ── */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: Users,          value: stats.members,        label: 'Miembros'      },
          { icon: FlaskConical,   value: stats.posts,          label: 'Publicaciones' },
          { icon: Zap,            value: stats.interactions,   label: 'Interacciones' },
          { icon: MessageCircle,  value: stats.comments,       label: 'Comentarios'   },
          { icon: Building2,      value: stats.companies,      label: 'Empresas'      },
          { icon: MapPin,         value: stats.cities,         label: 'Ciudades'      },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-card p-3 md:p-4 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
            <Icon size={18} strokeWidth={2} style={{ color: 'var(--accent)' }} />
            <p className="font-extrabold leading-none mt-2 tnum"
              style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)', fontSize: 'clamp(20px, 5.3vw, 30px)' }}>
              {formatMetric(value)}
            </p>
            <p className="text-[10px] md:text-[11px] mt-1 uppercase font-extrabold leading-tight"
              style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Ventajas ── */}
      <section>
        <h2 className="t-eyebrow mb-4" style={{ color: 'var(--text-tertiary)' }}>
          ¿Por qué Red Cobalto?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ADVANTAGES.map(({ icon: Icon, title, sub }) => (
            <div key={title}
              className="rounded-card p-4 transition-all duration-[160ms] ease-premium hover:shadow-card-hover"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)' }}>
              <span className="flex items-center justify-center w-11 h-11 rounded-input mb-3"
                style={{ background: 'var(--accent-soft)' }}>
                <Icon size={22} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
              </span>
              <p className="text-[15px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-[13px] mt-1 leading-snug" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final: mismo texto y misma acción que el de arriba, solo
           repetido como recordatorio al final de una página larga. No es un
           segundo camino distinto — es el mismo botón. ── */}
      <section className="py-12 px-6 text-center rounded-panel border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--accent-deep), #223B68)', borderColor: 'rgba(36,87,197,0.18)', boxShadow: 'var(--shadow-raised)' }}>
        <div className="absolute -right-2 -top-2 opacity-[0.12]"><RedCobaltoLogo size="xl" dark markOnly /></div>
        <h2 className="text-[20px] md:text-[26px] font-extrabold text-white max-w-[480px] mx-auto leading-snug"
          style={{ letterSpacing: '-0.02em' }}>
          Únete a la comunidad química de Colombia
        </h2>
        <button onClick={onContinue}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-btn font-extrabold h-[52px] px-8 text-[15.5px]
            transition-all duration-[160ms] ease-premium active:scale-[0.98]"
          style={{ background: '#ffffff', color: 'var(--accent-deep)', boxShadow: 'var(--shadow-card)' }}>
          Únete a la comunidad <ArrowRight size={19} strokeWidth={2.5} />
        </button>
      </section>
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
    <div className="flex-1 flex items-start md:items-center justify-center px-6 py-10 md:py-12"
      style={{ background: 'var(--bg-app)' }}>
      <div className="w-full max-w-[360px]">

        <div className="flex flex-col items-center text-center mb-8">
          <CobaltoMark size="clamp(46px, 13.6vw, 56px)" />
          <h1 className="font-extrabold mt-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em', fontSize: 'clamp(19px, 5.3vw, 22px)' }}>
            Entrar a Cobalto
          </h1>
          <p className="t-body-sm mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
            Con Google o con un código a tu correo
          </p>
        </div>

        {children}

        <button onClick={onBack}
          className="mt-7 mx-auto block text-[13px] font-bold transition-opacity active:opacity-60"
          style={{ color: 'var(--text-tertiary)' }}>
          ← Volver
        </button>
      </div>
    </div>
  )
}

export default function AuthScreen() {
  const [mode, setMode] = useState('landing') // landing | access | terminos | privacidad
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
      <TopBar />

      {mode === 'terminos' ? (
        <LegalLayout title="Términos y Condiciones" updated={LEGAL_UPDATED} onBack={() => setMode('landing')}>
          <TerminosContent />
        </LegalLayout>
      ) : mode === 'privacidad' ? (
        <LegalLayout title="Política de Privacidad y Tratamiento de Datos" updated={LEGAL_UPDATED} onBack={() => setMode('landing')}>
          <PrivacidadContent />
        </LegalLayout>
      ) : mode === 'landing' ? (
        <Landing stats={stats} onContinue={() => setMode('access')} />
      ) : (
        <AccessScreen onBack={() => setMode('landing')}>
          <LoginForm />
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
