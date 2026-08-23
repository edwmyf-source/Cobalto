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
      background: 'radial-gradient(circle at 30% 20%, #123a7a 0%, #0B2E68 45%, #081F4A 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{`
        @keyframes cbo-wipe {
          0%   { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes cbo-line-grow {
          0%   { width: 0; }
          100% { width: 90px; }
        }
        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cbo-fade-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes cbo-dot-blink {
          0%, 100% { opacity: .25; transform: scale(.85); }
          50%      { opacity: 1;   transform: scale(1); }
        }
        @keyframes cbo-blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(4%, 6%) scale(1.08); }
        }
        @keyframes cbo-blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-5%, -4%) scale(1.1); }
        }
        @keyframes cbo-orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cbo-orbit-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes cbo-hex-draw {
          0%   { stroke-dashoffset: 900; opacity: 0; }
          15%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes cbo-node-pulse {
          0%, 100% { opacity: .35; }
          50%      { opacity: 1; }
        }

        /* ── Fondo: dos manchas de marca, grandes, cubriendo casi toda la pantalla ── */
        .cbo-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.55;
        }
        .cbo-blob-red {
          width: 70vmax; height: 70vmax;
          top: -25vmax; left: -20vmax;
          background: radial-gradient(circle, rgba(230,57,70,0.55) 0%, rgba(230,57,70,0) 70%);
          animation: cbo-blob-drift-1 9s ease-in-out infinite;
        }
        .cbo-blob-blue {
          width: 80vmax; height: 80vmax;
          bottom: -30vmax; right: -25vmax;
          background: radial-gradient(circle, rgba(44,107,212,0.55) 0%, rgba(44,107,212,0) 70%);
          animation: cbo-blob-drift-2 10s ease-in-out infinite;
        }

        /* ── Anillos orbitando detrás del wordmark: motivo molecular ── */
        .cbo-orbits {
          position: absolute;
          top: 50%; left: 50%;
          width: min(92vw, 640px);
          height: min(92vw, 640px);
          transform: translate(-50%, -50%);
          opacity: 0;
          animation: cbo-fade-in 900ms ease-out 100ms both;
        }
        .cbo-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(156, 190, 238, 0.22);
        }
        .cbo-ring-1 { inset: 6%;  animation: cbo-orbit-spin 22s linear infinite; }
        .cbo-ring-2 { inset: 16%; border-color: rgba(230,57,70,0.20); animation: cbo-orbit-spin-rev 18s linear infinite; }
        .cbo-ring-3 { inset: 26%; animation: cbo-orbit-spin 26s linear infinite; }
        .cbo-node {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          background: #9CBEEE; top: -4px; left: 50%; margin-left: -4px;
          box-shadow: 0 0 12px 2px rgba(156,190,238,0.6);
          animation: cbo-node-pulse 2.4s ease-in-out infinite;
        }
        .cbo-ring-2 .cbo-node { background: var(--brand-red, #E63946); box-shadow: 0 0 12px 2px rgba(230,57,70,0.6); animation-delay: .5s; }
        .cbo-ring-3 .cbo-node { background: #2C6BD4; box-shadow: 0 0 12px 2px rgba(44,107,212,0.6); animation-delay: 1s; }

        /* ── Hexágono de fondo, grande, dibujándose ── */
        .cbo-hex-wrap {
          position: absolute;
          top: 50%; left: 50%;
          width: min(100vw, 760px);
          height: min(100vw, 760px);
          transform: translate(-50%, -50%);
        }
        .cbo-hex-path {
          fill: none;
          stroke: rgba(156, 190, 238, 0.28);
          stroke-width: 1;
          stroke-dasharray: 900;
          animation: cbo-hex-draw 2.2s ease-out 200ms both;
        }

        /* ── Contenido central ── */
        .cbo-content { position: relative; z-index: 2; text-align: center; padding: 0 24px; }

        .cbo-eyebrow {
          color: #9CBEEE;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 28px;
          opacity: 0;
          animation: cbo-fade-up 500ms ease-out 150ms both;
        }

        .cbo-word {
          position: relative;
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: clamp(42px, 12vw, 72px);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #fff;
          text-shadow: 0 0 60px rgba(156,190,238,0.35);
        }
        .cbo-word b { color: var(--brand-red, #E63946); font-weight: 900; }
        .cbo-wipe {
          position: absolute;
          inset: 0;
          color: #fff;
          background: #0B2E68;
          animation: cbo-wipe 1050ms cubic-bezier(.65,0,.35,1) 400ms both;
        }
        .cbo-wipe b { color: #fff; }

        .cbo-line {
          height: 3px;
          background: var(--brand-red, #E63946);
          margin: 30px auto 0;
          width: 0;
          animation: cbo-line-grow 550ms ease-out 1.3s both;
          box-shadow: 0 0 16px rgba(230,57,70,0.7);
        }

        .cbo-tag {
          margin-top: 26px;
          color: #fff;
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: clamp(15px, 4vw, 19px);
          font-weight: 500;
          line-height: 1.7;
          text-align: center;
          max-width: 320px;
          opacity: 0;
          animation: cbo-fade-up 550ms ease-out 1.5s both;
        }
        .cbo-tag b { color: #9CBEEE; font-weight: 800; }

        .cbo-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 36px;
          opacity: 0;
          animation: cbo-fade-in 350ms ease-out 1.75s both;
        }
        .cbo-dots em {
          width: 8px; height: 8px; border-radius: 50%;
          background: #6B87B8;
          display: inline-block;
          animation: cbo-dot-blink 1.3s ease-in-out infinite;
        }
        .cbo-dots em:nth-child(2) { animation-delay: .2s; background: #2C6BD4; }
        .cbo-dots em:nth-child(3) { animation-delay: .4s; background: var(--brand-red, #E63946); }
      `}</style>

      {/* Fondo grande: manchas de color */}
      <div className="cbo-blob cbo-blob-red" />
      <div className="cbo-blob cbo-blob-blue" />

      {/* Hexágono grande dibujándose de fondo */}
      <div className="cbo-hex-wrap">
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <polygon className="cbo-hex-path" points="100,10 180,55 180,145 100,190 20,145 20,55" />
        </svg>
      </div>

      {/* Anillos orbitando */}
      <div className="cbo-orbits">
        <div className="cbo-ring cbo-ring-1"><div className="cbo-node" /></div>
        <div className="cbo-ring cbo-ring-2"><div className="cbo-node" /></div>
        <div className="cbo-ring cbo-ring-3"><div className="cbo-node" /></div>
      </div>

      {/* Contenido */}
      <div className="cbo-content">
        <div className="cbo-eyebrow">Bienvenido a</div>

        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
          <div className="cbo-word">Red<b>Cobalto</b></div>
          <div className="cbo-wipe cbo-word">Red<b>Cobalto</b></div>
        </div>

        <div className="cbo-line" />

        <div className="cbo-tag">
          Punto de encuentro de la<br /><b>industria química</b>
        </div>

        <div className="cbo-dots"><em /><em /><em /></div>
      </div>
    </div>
  )
}
