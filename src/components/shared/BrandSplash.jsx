import { useEffect, useRef } from 'react'

// Primera vez por sesión del navegador: 2.5s. En recargas siguientes: 400ms.
const SPLASH_SEEN_KEY = 'cobalto-splash-seen'

export default function BrandSplash({ onDone }) {
  const doneRef = useRef(false)

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1' } catch {}
    const duration = seen ? 400 : 2500
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
          100% { width: 60px; }
        }
        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .cbo-word {
          position: relative;
          font-family: Manrope, system-ui, -apple-system, sans-serif;
          font-size: 44px;
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #fff;
        }
        .cbo-word b {
          color: var(--brand-red, #E63946);
          font-weight: 900;
        }
        /* Capa de "revelado": mismo texto encima, recortado por clip-path
           que crece de izquierda a derecha, dando el efecto de barrido. */
        .cbo-wipe {
          position: absolute;
          inset: 0;
          color: #fff;
          background: #0B2E68;
          animation: cbo-wipe 900ms cubic-bezier(.65,0,.35,1) 300ms both;
        }
        .cbo-wipe b { color: #fff; }

        .cbo-line {
          height: 2px;
          background: var(--brand-red, #E63946);
          margin: 16px auto 0;
          width: 0;
          animation: cbo-line-grow 500ms ease-out 1.1s both;
        }
        .cbo-sub {
          margin-top: 14px;
          color: #9CBEEE;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-align: center;
          opacity: 0;
          animation: cbo-fade-up 500ms ease-out 1.3s both;
        }
      `}</style>

      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
          <div className="cbo-word">Red<b>Cobalto</b></div>
          <div className="cbo-wipe cbo-word">Red<b>Cobalto</b></div>
        </div>
        <div className="cbo-line" />
        <div className="cbo-sub">Industria química</div>
      </div>
    </div>
  )
}
