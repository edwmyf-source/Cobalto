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
      position:'fixed', inset:0, zIndex:9999, cursor:'pointer', overflow:'hidden',
      background:'#0B2E68', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
    }}>
      <style>{`
        @keyframes cbo-wipe {
          0%   { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes cbo-line-grow {
          0%   { width: 0; }
          100% { width: 78px; }
        }
        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(14px); }
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

        .cbo-eyebrow {
          color: #9CBEEE;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 24px;
          opacity: 0;
          animation: cbo-fade-up 450ms ease-out 100ms both;
        }

        .cbo-word {
          position: relative;
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: 46px;
          font-weight: 900;
          letter-spacing: -0.025em;
          line-height: 1;
          color: #fff;
        }
        .cbo-word b { color: var(--brand-red, #E63946); font-weight: 900; }
        .cbo-wipe {
          position: absolute;
          inset: 0;
          color: #fff;
          background: #0B2E68;
          animation: cbo-wipe 950ms cubic-bezier(.65,0,.35,1) 350ms both;
        }
        .cbo-wipe b { color: #fff; }

        .cbo-line {
          height: 3px;
          background: var(--brand-red, #E63946);
          margin: 26px auto 0;
          width: 0;
          animation: cbo-line-grow 550ms ease-out 1.15s both;
        }

        .cbo-tag {
          margin-top: 24px;
          color: #fff;
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.7;
          text-align: center;
          max-width: 260px;
          opacity: 0;
          animation: cbo-fade-up 550ms ease-out 1.35s both;
        }
        .cbo-tag b { color: #9CBEEE; font-weight: 800; }

        .cbo-dots {
          display: flex;
          justify-content: center;
          gap: 9px;
          margin-top: 32px;
          opacity: 0;
          animation: cbo-fade-in 350ms ease-out 1.6s both;
        }
        .cbo-dots em {
          width: 7px; height: 7px; border-radius: 50%;
          background: #6B87B8;
          display: inline-block;
          animation: cbo-dot-blink 1.3s ease-in-out infinite;
        }
        .cbo-dots em:nth-child(2) { animation-delay: .2s; background: #2C6BD4; }
        .cbo-dots em:nth-child(3) { animation-delay: .4s; background: var(--brand-red, #E63946); }
      `}</style>

      <div style={{ textAlign: 'center', padding: '0 24px' }}>
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
