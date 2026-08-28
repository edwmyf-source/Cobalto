import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import LoginForm from './LoginForm'
import ResetForm from './ResetForm'
import Footer from '../layout/Footer'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'
import CobaltoMark from '../shared/CobaltoMark'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../legal/LegalContent'

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA 1 — Contexto.
// Presenta la marca y explica qué es RedCobalto. Un solo botón: "Continuar".
// No hay formulario aquí: el acceso vive en la pantalla 2, para que nunca
// haya dos llamados a la acción que digan cosas distintas.
// El bloque de marca queda centrado vertical y horizontalmente; el botón se
// ancla abajo, separado del contenido.
// ══════════════════════════════════════════════════════════════════════════
function ContextScreen({ onContinue }) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8"
      style={{ background: 'linear-gradient(170deg, var(--surface) 0%, var(--accent-softer) 100%)' }}>

      {/* Bloque central: crece y centra su contenido en el espacio disponible */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-[360px] flex flex-col items-center">

          <CobaltoMark size={92} />

          <p className="font-extrabold leading-none mt-5"
            style={{ letterSpacing: '-0.035em', fontSize: 'clamp(30px, 8.6vw, 38px)' }}>
            <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
          </p>

          <p className="mt-2 font-bold uppercase"
            style={{ color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.13em' }}>
            Industria química · Colombia
          </p>

          <h1 className="font-bold mt-6"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.028em', lineHeight: 1.22, fontSize: 'clamp(21px, 5.9vw, 25px)' }}>
            Punto de encuentro de la industria química
          </h1>

          <p className="mt-3 leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 3.5vw, 14px)' }}>
            La comunidad profesional del sector. Conecta con laboratorios,
            proveedores y colegas; comparte información técnica, normatividad
            y oportunidades.
          </p>

          <div className="mt-5 flex items-center gap-2.5 flex-wrap justify-center text-[13px]">
            <span className="font-extrabold" style={{ color: 'var(--brand-red)' }}>Conecta</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent)' }}>Comparte</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-extrabold" style={{ color: 'var(--accent-violet)' }}>Crece</span>
          </div>
        </div>
      </div>

      {/* Botón anclado abajo */}
      <div className="w-full max-w-[360px] mx-auto pt-8">
        <button onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 rounded-btn font-extrabold h-[50px] text-[15px]
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
        <ContextScreen onContinue={() => setMode('access')} />
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
