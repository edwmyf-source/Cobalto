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
      background: 'linear-gradient(165deg, var(--accent-deep, #0B2E68) 0%, #0D3670 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '0 32px',
    }}>
      <style>{`
        /* ═══ Fondo de marca a toda pantalla, logo como ícono de app: la
           misma sensación con la que abre una app nativa (WhatsApp,
           Instagram), en vez de una página web con fondo blanco. ═══ */

        @keyframes cbo-hero-in {
          0%   { opacity: 0;    transform: scale(0.85); }
          100% { opacity: 0.09; transform: scale(1);    }
        }
        .cbo-hero {
          position: absolute;
          width: clamp(220px, 62vw, 380px);
          aspect-ratio: 1 / 1;
          opacity: 0;
          animation: cbo-hero-in 1300ms cubic-bezier(0.16,1,0.3,1) both;
          pointer-events: none;
          z-index: 1;
        }
        .cbo-hero--tl {
          top: clamp(-100px, -22vw, -70px);
          left: clamp(-100px, -22vw, -70px);
        }
        .cbo-hero--br {
          bottom: clamp(-100px, -22vw, -70px);
          right: clamp(-100px, -22vw, -70px);
          animation-delay: 220ms;
        }

        @keyframes cbo-mark-in {
          0%   { opacity: 0; transform: scale(0.55); }
          100% { opacity: 1; transform: scale(1); }
        }
        /* Respiración suave en vez de rebote: se siente más calmada y
           acorde al tono editorial del isotipo gigante de fondo. */
        @keyframes cbo-mark-breathe {
          0%, 100% { transform: scale(1);    opacity: 1;    }
          50%      { transform: scale(1.06); opacity: 0.92; }
        }
        .cbo-mark {
          display: inline-flex;
          opacity: 0;
          position: relative;
          z-index: 2;
          animation:
            cbo-mark-in 700ms cubic-bezier(0.34,1.56,0.64,1) both,
            cbo-mark-breathe 2.6s ease-in-out 700ms infinite;
        }

        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cbo-word {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: clamp(38px, 12vw, 60px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1;
          margin-top: 22px;
          opacity: 0;
          animation: cbo-fade-up 620ms cubic-bezier(0.16,1,0.3,1) 420ms both;
        }
        /* Sobre fondo navy: "Red" mantiene el rojo de marca (sigue leyéndose
           perfecto), "Cobalto" pasa a blanco para contrastar con el fondo. */
        .cbo-word .cbo-red     { color: var(--brand-red, #E63946); }
        .cbo-word .cbo-cobalto { color: #FFFFFF; }
        .cbo-word .cbo-dot     { color: #8FB4FF; }

        .cbo-tag {
          margin-top: 14px;
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: clamp(14px, 4vw, 17px);
          line-height: 1.5;
          font-weight: 500;
          color: rgba(255,255,255,0.72);
          max-width: 30ch;
          opacity: 0;
          animation: cbo-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 950ms both;
        }
        .cbo-tag b { color: #8FB4FF; font-weight: 700; }

        @media (prefers-reduced-motion: reduce) {
          .cbo-hero, .cbo-mark, .cbo-word, .cbo-tag {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
          .cbo-mark { animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* Isotipo gigante y transparente, recortado en dos esquinas opuestas:
          enmarca el contenido central sin ser protagonista. */}
      <div className="cbo-hero cbo-hero--tl" aria-hidden="true">
        <CobaltoMark size="100%" rounded="rounded-none" dark />
      </div>
      <div className="cbo-hero cbo-hero--br" aria-hidden="true">
        <CobaltoMark size="100%" rounded="rounded-none" dark />
      </div>

      <div className="cbo-mark">
        <CobaltoMark size={80} rounded="rounded-none" dark />
      </div>

      <div className="cbo-word" style={{ position: 'relative', zIndex: 2 }}>
        <span className="cbo-red">Red</span><span className="cbo-cobalto">Cobalto</span><span className="cbo-dot">.</span>
      </div>

      <div className="cbo-tag" style={{ position: 'relative', zIndex: 2 }}>
        El lugar donde la <b>industria química</b> se conecta
      </div>
    </div>
  )
}
