import { useEffect, useRef } from 'react'
import CobaltoMark from './CobaltoMark'

// Primera vez por sesión del navegador: 4s. En recargas siguientes: 3s.
const SPLASH_SEEN_KEY = 'cobalto-splash-seen'

export default function BrandSplash({ onDone }) {
  const doneRef = useRef(false)

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1' } catch {}
    const duration = seen ? 3000 : 4000
    try { sessionStorage.setItem(SPLASH_SEEN_KEY, '1') } catch {}
    const t = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onDone() }
    }, duration)
    return () => clearTimeout(t)
  }, [onDone])

  const skip = () => {
    if (!doneRef.current) { doneRef.current = true; onDone() }
  }

  return (
    <div onClick={skip} style={{
      position: 'fixed', inset: 0, zIndex: 100, cursor: 'pointer', overflow: 'hidden',
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '0 32px',
    }}>
      <style>{`
        /* ═══ Opción "Puro": solo marca, nombre y frase. Centrado, sin más
           estímulo visual — la pantalla dura ~3s, cualquier elemento extra
           compite por atención en vez de dejar la marca en la cabeza. ═══ */

        @keyframes cbo-mark-in {
          0%   { opacity: 0; transform: scale(0.55); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cbo-mark-bounce {
          0%, 100% { transform: translateY(0)     scaleY(1);    }
          18%      { transform: translateY(-16px) scaleY(1.06); }
          36%      { transform: translateY(0)     scaleY(0.90); }
          50%      { transform: translateY(-7px)  scaleY(1.03); }
          66%      { transform: translateY(0)     scaleY(0.96); }
          78%      { transform: translateY(-2px)  scaleY(1);    }
        }
        .cbo-mark {
          display: inline-flex;
          opacity: 0;
          /* Entra con rebote elástico y, al terminar, sigue rebotando en
             bucle: la marca queda "viva" mientras carga la app. */
          animation:
            cbo-mark-in 700ms cubic-bezier(0.34,1.56,0.64,1) both,
            cbo-mark-bounce 2.1s ease-out 700ms infinite;
        }

        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cbo-word {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: clamp(36px, 11.5vw, 58px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-top: 22px;
          opacity: 0;
          animation: cbo-fade-up 600ms cubic-bezier(0.16,1,0.3,1) 500ms both;
        }
        /* Misma convención de color que en Topbar, AppLayout y AuthScreen:
           "Red" siempre en rojo de marca, "Cobalto" en azul marino. */
        .cbo-word .cbo-red     { color: var(--brand-red, #E63946); }
        .cbo-word .cbo-cobalto { color: var(--accent-deep, #0B2E68); }
        .cbo-word .cbo-dot     { color: var(--accent, #1A5AC8); }

        .cbo-tag {
          margin-top: 14px;
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: clamp(14px, 4vw, 17px);
          line-height: 1.5;
          font-weight: 500;
          color: var(--text-secondary, #475569);
          max-width: 30ch;
          opacity: 0;
          animation: cbo-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 950ms both;
        }
        .cbo-tag b { color: var(--accent, #1A5AC8); font-weight: 700; }

        @media (prefers-reduced-motion: reduce) {
          .cbo-mark, .cbo-word, .cbo-tag {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
          .cbo-mark { animation-iteration-count: 1 !important; }
        }
      `}</style>

      <div className="cbo-mark">
        <CobaltoMark size={92} rounded="rounded-2xl" />
      </div>

      <div className="cbo-word">
        <span className="cbo-red">Red</span><span className="cbo-cobalto">Cobalto</span><span className="cbo-dot">.</span>
      </div>

      <div className="cbo-tag">
        El lugar donde la <b>industria química</b> se conecta
      </div>
    </div>
  )
}
