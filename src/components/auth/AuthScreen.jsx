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

      {/* Isotipo gigante y tenue saliendo por la esquina inferior derecha:
          elemento gráfico de marca en vez de círculos genéricos. Compensado
          en tamaño porque el SVG ocupa el 78% de su contenedor. */}
      <div className="absolute pointer-events-none" aria-hidden="true"
        style={{ width: 'clamp(400px, 112vw, 760px)', aspectRatio: '1 / 1',
                 right: 'clamp(-185px, -42vw, -150px)',
                 bottom: 'clamp(-175px, -40vw, -140px)',
                 opacity: 0.11 }}>
        <CobaltoMark size="100%" rounded="rounded-none" />
      </div>

      {/* Nodos de conexión: sugieren comunidad, sin iconografía de laboratorio */}
      {[
        { x: 66, y: 13, s: 7, to: { x: 82, y: 6 } },
        { x: 82, y: 6,  s: 5 },
        { x: 9,  y: 80, s: 6, to: { x: 29, y: 87 } },
        { x: 29, y: 87, s: 4 },
      ].map((n, i) => {
        const line = n.to && {
          len: Math.hypot(n.to.x - n.x, n.to.y - n.y),
          ang: Math.atan2(n.to.y - n.y, n.to.x - n.x) * 180 / Math.PI,
        }
        return (
          <span key={i} aria-hidden="true" className="hidden sm:block">
            <span className="absolute rounded-full pointer-events-none"
              style={{ width: n.s, height: n.s, left: `${n.x}%`, top: `${n.y}%`,
                       background: 'var(--accent)', opacity: 0.5 }} />
            {line && (
              <span className="absolute pointer-events-none"
                style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${line.len}%`, height: 1,
                         transformOrigin: 'left center', transform: `rotate(${line.ang}deg)`,
                         background: 'linear-gradient(90deg, rgba(36,87,197,0.45), rgba(36,87,197,0))' }} />
            )}
          </span>
        )
      })}

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
