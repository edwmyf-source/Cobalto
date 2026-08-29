import { useState, useEffect } from 'react'
import { BadgeCheck, Lock, MessageCircle, Gift, ArrowRight, Users, Share2, TrendingUp } from 'lucide-react'
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

// Barra superior: logo a la izquierda, un único botón "Ingresar" a la
// derecha (estilo outline, discreto). El acceso real (Google/código) vive
// en la pantalla 2 — este botón solo navega hasta ahí.
function TopBar({ onLogin }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(18px)', borderColor: 'var(--border-soft)' }}>
      <div className="max-w-6xl mx-auto h-[72px] flex items-center justify-between px-4 md:px-6">
        <RedCobaltoLogo size="md" />
        <button onClick={onLogin}
          className="inline-flex items-center justify-center rounded-btn font-bold h-10 px-5 text-[13.5px] transition-all active:scale-[0.97]"
          style={{ background: 'var(--brand-red)', color: '#fff', border: 'none' }}>
          Ingresar
        </button>
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
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-10 md:gap-14 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative md:flex md:items-center md:gap-12">

        {/* Gráfico: el propio logo, agrandado — "círculo incompleto, una
            parte roja, una parte azul" es literalmente el isotipo de marca.
            Visible en todos los tamaños (antes solo aparecía en escritorio),
            detrás y a la derecha del texto. */}
        <div className="absolute pointer-events-none" aria-hidden="true"
          style={{ top: '2%', right: 'clamp(-390px, -39vw, -161px)', width: 'clamp(322px, 78vw, 780px)', opacity: 0.9, zIndex: 0 }}>
          <CobaltoMark size="100%" rounded="rounded-none" />
        </div>
        {/* Puntos suaves: textura geométrica discreta, no decoración genérica */}
        <div className="absolute pointer-events-none hidden md:block" aria-hidden="true"
          style={{ right: 20, bottom: -10, width: 120, height: 90,
                   backgroundImage: 'radial-gradient(var(--border) 1.5px, transparent 1.5px)',
                   backgroundSize: '14px 14px', opacity: 0.7, zIndex: 0 }} />

        <div className="md:flex-1 md:max-w-[560px] relative" style={{ zIndex: 1 }}>
          <h1 className="text-left font-extrabold max-w-[64%] sm:max-w-none" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.04 }}>
            <span className="block" style={{ fontSize: 'clamp(35px, 10.1vw, 58.5px)' }}>El punto de encuentro</span>
            <span className="block" style={{ color: 'var(--accent)', fontSize: 'clamp(35px, 10.1vw, 58.5px)' }}>
              de la industria química
            </span>
            <span className="block" style={{ color: 'var(--accent)', fontSize: 'clamp(35px, 10.1vw, 58.5px)' }}>
              en Colombia
            </span>
          </h1>

          <span className="block rounded-full mt-5" style={{ width: 46, height: 4, background: 'var(--brand-red)' }} />

          <p className="mt-6 leading-relaxed max-w-[480px]" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15.3px, 4.1vw, 17.5px)' }}>
            Busca, comparte y encuentra: información, proveedores, vacantes,
            eventos y profesionales del sector químico.
          </p>
          <p className="mt-4 leading-relaxed max-w-[480px]" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15.3px, 4.1vw, 17.5px)' }}>
            Todo lo que tu trabajo necesita, en una sola comunidad de la
            industria química en Colombia.
          </p>

          <div className="mt-6 flex items-center gap-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-extrabold" style={{ color: 'var(--brand-red)', fontSize: 'clamp(15px, 4vw, 18px)' }}>
              <Users size={18} strokeWidth={2.3} /> Conecta
            </span>
            <span className="inline-flex items-center gap-1.5 font-extrabold" style={{ color: 'var(--accent)', fontSize: 'clamp(15px, 4vw, 18px)' }}>
              <Share2 size={18} strokeWidth={2.3} /> Comparte
            </span>
            <span className="inline-flex items-center gap-1.5 font-extrabold" style={{ color: 'var(--accent-violet)', fontSize: 'clamp(15px, 4vw, 18px)' }}>
              <TrendingUp size={18} strokeWidth={2.3} /> Crece
            </span>
          </div>

          <button onClick={onContinue}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-btn font-extrabold h-[52px] px-8 text-[15.5px]
              transition-all duration-[160ms] ease-premium active:scale-[0.98] hover:brightness-110"
            style={{ background: 'var(--accent-deep)', color: '#fff', boxShadow: 'var(--shadow-raised)' }}>
            Únete a la comunidad <ArrowRight size={19} strokeWidth={2.5} />
          </button>
        </div>
      </section>

      {/* ── Estadísticas: una sola tarjeta flotante, grid 3×2, con icono
           circular pastel por dato — se siente a comunidad, no a dashboard. ── */}
      <section className="rounded-panel p-5 md:p-7 border relative"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-modal)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
          {[
            { icon: Users,          value: stats.members,      label: 'Miembros',      bg: 'var(--error-bg)',   fg: 'var(--error)'         },
            { icon: BadgeCheck,     value: stats.posts,        label: 'Publicaciones', bg: 'var(--accent-soft)', fg: 'var(--accent)'        },
            { icon: MessageCircle,  value: stats.interactions, label: 'Interacciones', bg: '#F1EEFC',            fg: 'var(--accent-violet)' },
            { icon: Share2,         value: stats.comments,     label: 'Comentarios',   bg: 'var(--success-bg)', fg: 'var(--success)'        },
            { icon: TrendingUp,     value: stats.companies,    label: 'Empresas',      bg: 'var(--warning-bg)', fg: 'var(--warning)'        },
            { icon: BadgeCheck,     value: stats.cities,       label: 'Ciudades',      bg: 'var(--accent-softer)', fg: 'var(--accent-deep)' },
          ].map(({ icon: Icon, value, label, bg, fg }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 38, height: 38, background: bg }}>
                <Icon size={17} strokeWidth={2.2} style={{ color: fg }} />
              </span>
              <div className="min-w-0">
                <p className="font-extrabold leading-none tnum"
                  style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)', fontSize: 'clamp(17px, 4.2vw, 22px)' }}>
                  {formatMetric(value)}
                </p>
                <p className="text-[10px] mt-1 uppercase font-extrabold leading-tight truncate"
                  style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ventajas: en móvil, tarjetas en grid (no fila que se envuelve mal);
           en escritorio, fila con separadores verticales ── */}
      <section className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-0 sm:items-center justify-center md:justify-start">
        {ADVANTAGES.map(({ icon: Icon, title }, i) => (
          <span key={title} className="inline-flex items-center justify-center sm:justify-start rounded-card sm:rounded-none py-3 sm:py-0 border sm:border-0"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)' }}>
            {i > 0 && <span className="hidden sm:block mr-5" style={{ width: 1, height: 18, background: 'var(--border)' }} />}
            <span className="inline-flex items-center gap-2">
              <Icon size={17} strokeWidth={2} style={{ color: 'var(--accent)' }} />
              <span className="text-[13.5px] font-bold" style={{ color: 'var(--text-secondary)' }}>{title}</span>
            </span>
          </span>
        ))}
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
      <TopBar onLogin={() => setMode('access')} />

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
