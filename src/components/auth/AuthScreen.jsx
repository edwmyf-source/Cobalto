import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import LoginForm from './LoginForm'
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
    <div className="min-h-app flex flex-col px-6 py-9 relative overflow-hidden"
      style={{ background: 'linear-gradient(170deg, var(--surface) 0%, var(--accent-softer) 100%)' }}>

      {/* Círculos de fondo: mismo lenguaje visual del splash de carga. Puramente
          decorativos, por eso quedan detrás del contenido y ocultos a lectores. */}
      <div className="absolute rounded-full pointer-events-none" aria-hidden="true"
        style={{ width: 420, height: 420, top: -170, right: -190, background: 'var(--accent-soft)', opacity: 0.5 }} />
      <div className="absolute rounded-full pointer-events-none" aria-hidden="true"
        style={{ width: 300, height: 300, bottom: -130, left: -140, border: '1.5px solid var(--border)', opacity: 0.7 }} />

      {/* Contenido repartido en la altura: la marca ocupa el tercio superior,
          el mensaje el central, y el espacio flexible entre grupos evita que
          todo quede apiñado al centro. */}
      <div className="flex-1 flex flex-col items-center text-center relative">
        <div className="w-full max-w-[380px] flex-1 flex flex-col items-center">

          <div className="flex-[0.8]" />

          <CobaltoMark size="clamp(84px, 25.2vw, 104px)" className="mark-bounce" />

          <p className="font-extrabold leading-none mt-5"
            style={{ letterSpacing: '-0.04em', fontSize: 'clamp(36px, 10.4vw, 46px)' }}>
            <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
          </p>

          <div className="flex-1" />

          <h1 className="font-extrabold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 1.16, fontSize: 'clamp(26px, 7.3vw, 32px)' }}>
            Punto de encuentro de la{' '}
            <span style={{ color: 'var(--accent)' }}>industria química</span>{' '}
            en Colombia
          </h1>

          <div className="flex-[0.45]" />

          <p className="leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontSize: 'clamp(14.5px, 3.9vw, 16px)' }}>
            Todo el sector químico del país, reunido en un mismo espacio.
          </p>

          <div className="flex-[1.1]" />
        </div>
      </div>

      {/* Botón anclado abajo */}
      <div className="w-full max-w-[380px] mx-auto pb-[4vh] relative">
        <button onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 rounded-btn font-extrabold
            transition-all duration-[160ms] ease-premium active:scale-[0.98]"
          style={{ background: 'var(--accent-deep)', color: '#fff', boxShadow: 'var(--shadow-raised)',
                   height: 'clamp(48px, 13.1vw, 54px)', fontSize: 'clamp(15px, 3.9vw, 16px)' }}>
          Continuar <ArrowRight size={19} strokeWidth={2.5} />
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
    <div className="flex-1 flex items-start md:items-center justify-center px-6 py-10 md:py-12"
      style={{ background: 'var(--bg-app)' }}>
      <div className="w-full max-w-[360px]">

        {/* Encabezado centrado, sin tarjeta: el formulario respira sobre el
            fondo en vez de vivir dentro de una caja con borde y sombra. */}
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
  const [mode, setMode] = useState('context') // context | access | reset | terminos | privacidad
  const isLegal = mode === 'terminos' || mode === 'privacidad'

  return (
    // En modo contexto la propia ContextScreen ya ocupa el alto de la ventana,
    // así que el contenedor no debe forzar otra pantalla completa: si no, el
    // pie de página quedaría a dos scrolls de distancia en vez de justo debajo.
    <div className={`${mode === 'context' ? '' : 'min-h-app'} flex flex-col`} style={{ background: 'var(--bg-app)' }}>

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
