import { useState, useEffect } from 'react'
import { Gift, Rocket, BadgeCheck, Lock, MessageCircle, FlaskConical, Users, Zap, Building2, MapPin } from 'lucide-react'
import { getCommunityStats } from '../../api/stats'
import LoginForm from './LoginForm'
import ResetForm from './ResetForm'
import Footer from '../layout/Footer'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'
import CobaltoMark from '../shared/CobaltoMark'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../legal/LegalContent'

// Ventajas con iconografía consistente: misma familia (lucide), mismo tamaño
// y mismo grosor de trazo en las seis.
const ADVANTAGES = [
  { icon: Gift,          title: 'Gratis',          sub: 'Sin costos ocultos'     },
  { icon: Rocket,        title: 'Rápido',          sub: 'En segundos'            },
  { icon: BadgeCheck,    title: 'Perfiles reales', sub: 'Sabes con quién hablas' },
  { icon: Lock,          title: 'Privado',         sub: 'Datos protegidos'       },
  { icon: MessageCircle, title: 'Chat seguro',     sub: 'Contacto interno'       },
  { icon: FlaskConical,  title: 'Química',         sub: 'Industria y lab'        },
]

// Las métricas crecen con el tiempo. Por debajo de 10.000 se muestra el número
// exacto (más creíble y concreto); por encima se compacta ("12 mil") para que
// no desborde la tarjeta en móvil ni pierda legibilidad.
const formatMetric = (n) => {
  const v = n ?? 0
  if (v < 10000) return v.toLocaleString('es-CO')
  const decimals = v < 100000 ? 1 : 0
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: decimals }).format(v)
}

// Barra superior mínima: solo la marca. El formulario ya está siempre visible
// más abajo, así que no hace falta ningún botón aquí — un único llamado a la
// acción (el del formulario) es justo el problema que veníamos a resolver.
function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(18px)', borderColor: 'var(--border-soft)' }}>
      <div className="max-w-6xl mx-auto h-[64px] flex items-center px-4 md:px-6">
        <RedCobaltoLogo size="md" />
      </div>
    </header>
  )
}

// ── Hero + formulario en split: titular a la izquierda, tarjeta de acceso a
// la derecha. En móvil se apila: primero el titular (compacto), luego la
// tarjeta. El formulario está siempre a la vista, sin ningún clic previo.
function HeroSplit({ stats, formSlot }) {
  return (
    <section className="max-w-6xl w-full mx-auto px-4 md:px-6 pt-8 pb-10 md:pt-14 md:pb-16">
      <div className="md:grid md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:items-center">

        {/* ── Columna izquierda: titular ── */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--brand-red)' }} />
            <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>COMUNIDAD PROFESIONAL</span>
          </div>

          <h1 className="text-left font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
            <span className="block" style={{ fontSize: 'clamp(34px, 8.6vw, 58px)' }}>Punto de</span>
            <span className="block" style={{ fontSize: 'clamp(34px, 8.6vw, 58px)' }}>encuentro</span>
            <span className="block mt-2" style={{ color: 'var(--accent)', fontSize: 'clamp(19px, 4.6vw, 30px)' }}>
              de la industria química.
            </span>
          </h1>

          <p className="mt-6 leading-relaxed max-w-[460px]" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15px, 3.4vw, 18px)' }}>
            Conecta con profesionales, laboratorios y proveedores del sector químico en Colombia.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <span className="font-extrabold" style={{ color: 'var(--brand-red)', fontSize: 'clamp(15px, 3.4vw, 18px)' }}>Conecta</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent)', fontSize: 'clamp(15px, 3.4vw, 18px)' }}>Comparte</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent-violet)', fontSize: 'clamp(15px, 3.4vw, 18px)' }}>Crece</span>
          </div>

          {/* Métricas: solo 3, discretas, dan confianza sin competir con la tarjeta */}
          <div className="hidden md:grid grid-cols-3 gap-3 mt-10 max-w-[420px]">
            {[
              { icon: Users,        value: stats.members, label: 'Miembros'      },
              { icon: FlaskConical, value: stats.posts,   label: 'Publicaciones' },
              { icon: Building2,    value: stats.companies, label: 'Empresas'    },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-card p-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
                <Icon size={15} strokeWidth={2} style={{ color: 'var(--accent)' }} />
                <p className="font-extrabold leading-none mt-1.5 tnum" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)', fontSize: 20 }}>
                  {formatMetric(value)}
                </p>
                <p className="text-[9.5px] mt-0.5 uppercase font-extrabold" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha: tarjeta de acceso, siempre visible ── */}
        <div className="mt-10 md:mt-0 flex justify-center md:justify-end">
          <div className="relative w-full max-w-[400px]">
            {/* Círculos decorativos detrás de la tarjeta, mismo lenguaje del splash */}
            <div className="absolute -z-10 rounded-full" aria-hidden="true"
              style={{ width: 260, height: 260, top: -40, right: -50, background: 'var(--accent-softer)' }} />
            <div className="absolute -z-10 rounded-full" aria-hidden="true"
              style={{ width: 180, height: 180, bottom: -30, left: -40, border: '1px solid var(--border-soft)' }} />

            <div className="rounded-panel p-6 md:p-7 border relative"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-modal)' }}>
              <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-panel"
                style={{ background: 'linear-gradient(90deg, var(--brand-red), var(--accent), var(--accent-violet))' }} />
              <div className="flex items-center gap-3 mb-6">
                <CobaltoMark size={38} rounded="rounded-[11px]" />
                <div>
                  <p className="t-body-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>Entrar a Cobalto</p>
                  <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Con Google o con un código a tu correo</p>
                </div>
              </div>
              {formSlot}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AuthScreen() {
  const [mode, setMode] = useState('main') // main | reset | terminos | privacidad
  // El estado inicial debe incluir TODAS las métricas que se renderizan: en el
  // primer render (antes de que responda la consulta) una clave faltante seria
  // undefined, y undefined.toLocaleString() rompe la pantalla completa.
  const [stats, setStats] = useState({ members: 0, posts: 0, interactions: 0, comments: 0, companies: 0, cities: 0 })

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-app flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <TopBar />

      {mode === 'terminos' ? (
        <LegalLayout title="Términos y Condiciones" updated={LEGAL_UPDATED} onBack={() => setMode('main')}>
          <TerminosContent />
        </LegalLayout>
      ) : mode === 'privacidad' ? (
        <LegalLayout title="Política de Privacidad y Tratamiento de Datos" updated={LEGAL_UPDATED} onBack={() => setMode('main')}>
          <PrivacidadContent />
        </LegalLayout>
      ) : (
        <>
          <HeroSplit
            stats={stats}
            formSlot={
              mode === 'reset'
                ? <ResetForm onSwitchLogin={() => setMode('main')} />
                : <LoginForm onSwitchReset={() => setMode('reset')} />
            }
          />

          {/* ── Ventajas: contenido informativo debajo del pliegue, sin CTA
               propio — el único llamado a la acción de la página ya está
               arriba, en la tarjeta. ── */}
          <section className="max-w-6xl w-full mx-auto px-4 md:px-6 pb-14">
            <h2 className="t-eyebrow mb-4" style={{ color: 'var(--text-tertiary)' }}>
              ¿Por qué Red Cobalto?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ADVANTAGES.map(({ icon: Icon, title, sub }) => (
                <div key={title}
                  className="rounded-card p-4 transition-all duration-[160ms] ease-premium hover:shadow-card-hover"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)' }}>
                  <span className="flex items-center justify-center w-11 h-11 rounded-input mb-3"
                    style={{ background: 'var(--accent-soft)' }}>
                    <Icon size={24} strokeWidth={2} style={{ color: 'var(--accent-deep)' }} />
                  </span>
                  <p className="text-[15px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-[13px] mt-1 leading-snug" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </section>

          <Footer
            onTerminos={() => { setMode('terminos'); window.scrollTo({ top: 0 }) }}
            onPrivacidad={() => { setMode('privacidad'); window.scrollTo({ top: 0 }) }}
          />
        </>
      )}
    </div>
  )
}
