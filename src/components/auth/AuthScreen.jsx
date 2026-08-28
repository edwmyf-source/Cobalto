import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import LoginForm from './LoginForm'
import Footer from '../layout/Footer'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'
import CobaltoMark from '../shared/CobaltoMark'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../legal/LegalContent'

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA 1 — Bienvenida.
// Explica qué es RedCobalto y por qué vale la pena entrar. Un solo botón:
// "Únete a la comunidad". El acceso (Google / código) vive en la pantalla 2.
//
// Móvil: todo apilado y centrado, con el botón cerca del mensaje (no
// forzado al fondo) para que la relación pregunta→respuesta sea inmediata.
// Escritorio: split horizontal — la marca a la izquierda con peso visual
// propio, el mensaje y el CTA a la derecha, alineados a la izquierda para
// una sensación más "de plataforma" que de afiche centrado.
// ══════════════════════════════════════════════════════════════════════════
function ContextScreen({ onContinue }) {
  return (
    <div className="min-h-app flex flex-col justify-center px-[22px] md:px-[43px] lg:px-[72px] py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(170deg, var(--surface) 0%, var(--accent-softer) 100%)' }}>

      {/* Círculos de fondo: mismo lenguaje visual del splash de carga. Puramente
          decorativos, por eso quedan detrás del contenido y ocultos a lectores. */}
      <div className="absolute rounded-full pointer-events-none" aria-hidden="true"
        style={{ width: 420, height: 420, top: -170, right: -190, background: 'var(--accent-soft)', opacity: 0.5 }} />
      <div className="absolute rounded-full pointer-events-none" aria-hidden="true"
        style={{ width: 300, height: 300, bottom: -130, left: -140, border: '1.5px solid var(--border)', opacity: 0.7 }} />

      <div className="w-full max-w-4xl mx-auto relative
        flex flex-col items-center text-center
        md:grid md:grid-cols-[0.85fr_1.15fr] md:gap-14 lg:gap-20 md:items-center md:text-left">

        {/* ── Marca: protagonista arriba en móvil, columna izquierda en escritorio ── */}
        <div className="flex flex-col items-center md:items-start">
          <CobaltoMark size="clamp(78px, 9vw, 132px)" />

          <p className="font-extrabold leading-none mt-5 md:mt-7"
            style={{ letterSpacing: '-0.04em', fontSize: 'clamp(32px, 9.5vw, 42px)' }}>
            <span style={{ color: 'var(--brand-red)' }}>RED</span><span style={{ color: 'var(--accent-deep)' }}>COBALTO</span>
          </p>

          <p className="mt-2 font-bold uppercase hidden md:block"
            style={{ color: 'var(--text-tertiary)', fontSize: 11.5, letterSpacing: '0.16em' }}>
            Industria química · Colombia
          </p>
        </div>

        {/* ── Mensaje + CTA: cerca uno del otro, sin bloques largos de texto ── */}
        <div className="mt-9 md:mt-0 flex flex-col items-center md:items-start max-w-[340px] md:max-w-none">

          <h1 className="font-extrabold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.18, fontSize: 'clamp(24px, 6.8vw, 38px)' }}>
            Punto de encuentro de la{' '}
            <span style={{ color: 'var(--accent)' }}>industria química</span>{' '}
            en Colombia
          </h1>

          <p className="mt-5 leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontSize: 'clamp(14.5px, 3.9vw, 17px)', maxWidth: 420 }}>
            Conecta con profesionales, técnicos, tecnólogos, empresas y
            proveedores del sector químico. Comparte conocimiento, encuentra
            oportunidades y haz parte de una comunidad donde la industria se
            conecta, colabora y crece.
          </p>

          <button onClick={onContinue}
            className="w-full md:w-auto mt-8 inline-flex items-center justify-center gap-2 rounded-btn font-extrabold px-8
              transition-all duration-[160ms] ease-premium active:scale-[0.98] hover:brightness-110"
            style={{ background: 'var(--accent-deep)', color: '#fff', boxShadow: 'var(--shadow-raised)',
                     height: 'clamp(48px, 13.1vw, 56px)', fontSize: 'clamp(15px, 3.9vw, 16.5px)' }}>
            Únete a la comunidad <ArrowRight size={19} strokeWidth={2.5} />
          </button>
        </div>
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
