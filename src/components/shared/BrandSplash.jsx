import { useEffect, useRef } from 'react'

// Primera vez por sesión del navegador: 3s. En recargas siguientes: 1s.
const SPLASH_SEEN_KEY = 'cobalto-splash-seen'

export default function BrandSplash({ onDone }) {
  const doneRef = useRef(false)

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1' } catch {}
    const duration = seen ? 1000 : 3000
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
      position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer', overflow: 'hidden',
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{`
        @keyframes cbo-circle-in {
          0%   { opacity: 0; transform: translateY(-50%) translateX(-30px); }
          100% { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes cbo-scale-in {
          0%   { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cbo-bar-grow {
          0%   { width: 0; }
          100% { width: 64px; }
        }

        /* ── Geometría de fondo: círculo grande y sutil, desplazado a la
           izquierda, en un gris-azulado casi imperceptible sobre blanco. ── */
        .cbo-geo-circle {
          position: absolute;
          width: 135%;
          aspect-ratio: 1 / 1;
          left: -38%;
          top: 50%;
          border-radius: 50%;
          background: #F1F4FA;
          opacity: 0;
          animation: cbo-circle-in 1600ms cubic-bezier(0.16,1,0.3,1) 0ms both;
        }
        .cbo-geo-ring {
          position: absolute;
          width: 100%;
          aspect-ratio: 1 / 1;
          left: -46%;
          top: 38%;
          border-radius: 50%;
          border: 1px solid rgba(11,46,104,0.05);
          opacity: 0;
          animation: cbo-circle-in 1800ms cubic-bezier(0.16,1,0.3,1) 120ms both;
        }

        /* ── Contenido central ── */
        .cbo-content { position: relative; z-index: 2; text-align: center; padding: 0 28px; }

        .cbo-word {
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: clamp(38px, 11.5vw, 58px);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1;
          opacity: 0;
          transform: scale(0.96);
          animation: cbo-scale-in 650ms cubic-bezier(0.16,1,0.3,1) 250ms both;
        }
        /* Misma convención de color que en Topbar, AppLayout y AuthScreen:
           "Red" siempre en rojo de marca, "Cobalto" en azul marino. */
        .cbo-word .cbo-red { color: var(--brand-red, #E63946); }
        .cbo-word .cbo-cobalto { color: var(--accent-deep, #0B2E68); }
        .cbo-word .cbo-dot { color: var(--accent, #1A5AC8); }

        .cbo-tag {
          margin-top: 22px;
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: clamp(14px, 4vw, 17px);
          line-height: 1.6;
          text-align: center;
        }
        .cbo-tag span { display: block; opacity: 0; }
        .cbo-tag-line1 {
          color: var(--text-secondary, #475569);
          font-weight: 500;
          transform: translateY(8px);
          animation: cbo-fade-up 450ms cubic-bezier(0.16,1,0.3,1) 650ms both;
        }
        .cbo-tag-line2 {
          color: var(--accent, #1A5AC8);
          font-weight: 700;
          transform: translateY(8px);
          animation: cbo-fade-up 450ms cubic-bezier(0.16,1,0.3,1) 820ms both;
        }

        .cbo-bar {
          margin: 28px auto 0;
          height: 3px;
          width: 0;
          background: var(--brand-red, #E63946);
          border-radius: 2px;
          animation: cbo-bar-grow 460ms cubic-bezier(0.16,1,0.3,1) 1150ms both;
        }
      `}</style>

      {/* Geometría de fondo */}
      <div className="cbo-geo-ring" />
      <div className="cbo-geo-circle" />

      {/* Contenido */}
      <div className="cbo-content">
        <div className="cbo-word">
          <span className="cbo-red">Red</span><span className="cbo-cobalto">Cobalto</span><span className="cbo-dot">.</span>
        </div>

        <div className="cbo-tag">
          <span className="cbo-tag-line1">Punto de encuentro de la</span>
          <span className="cbo-tag-line2">industria química</span>
        </div>

        <div className="cbo-bar" />
      </div>
    </div>
  )
}
