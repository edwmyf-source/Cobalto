import { useEffect, useRef, useState } from 'react'

// El splash completo (2.4s) solo se muestra una vez por sesion del navegador.
// En recargas (F5) dura 700ms — suficiente para tapar el arranque sin frenar al usuario.
const SPLASH_SEEN_KEY = 'cobalto-splash-seen'

export default function BrandSplash({ onDone }) {
  const doneRef = useRef(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1' } catch {}
    const duration = seen ? 700 : 2400
    try { sessionStorage.setItem(SPLASH_SEEN_KEY, '1') } catch {}

    // Animar barra de carga hasta 100% a lo largo del splash
    const start = Date.now()
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100)
      setProgress(pct)
      if (pct >= 100) clearInterval(tick)
    }, 16)

    const t = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onDone() }
    }, duration)
    return () => { clearTimeout(t); clearInterval(tick) }
  }, [onDone])

  const skip = () => {
    if (!doneRef.current) { doneRef.current = true; onDone() }
  }

  return (
    <div onClick={skip} style={{
      position:'fixed', inset:0, zIndex:9999, cursor:'pointer', overflow:'hidden',
      background:'radial-gradient(circle at 50% 40%, #002B5C 0%, #001A3D 60%, #000A1F 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
    }}>
      <style>{`
        @keyframes rh-pop {
          0%   { opacity:0; transform:scale(0.4) rotate(-10deg); }
          55%  { opacity:1; transform:scale(1.15) rotate(2deg); }
          80%  { transform:scale(0.95) rotate(-1deg); }
          100% { opacity:1; transform:scale(1) rotate(0deg); }
        }
        @keyframes rh-label {
          0%,45% { opacity:0; transform:translateY(14px); letter-spacing:0.5em; }
          100%   { opacity:1; transform:translateY(0);    letter-spacing:0.32em; }
        }
        @keyframes rh-tag {
          0%,70% { opacity:0; transform:translateY(8px); }
          100%   { opacity:0.7; transform:translateY(0); }
        }
        @keyframes ring-spin {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes ring-spin-rev {
          from { transform:rotate(0deg); }
          to   { transform:rotate(-360deg); }
        }
        @keyframes orbit {
          from { transform:rotate(0deg)   translateX(90px) rotate(0deg); }
          to   { transform:rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 0 8px rgba(126,182,255,0.10), 0 0 60px 20px rgba(126,182,255,0.25), 0 20px 60px rgba(0,26,61,0.6); }
          50%     { box-shadow: 0 0 0 14px rgba(126,182,255,0.20), 0 0 100px 30px rgba(126,182,255,0.45), 0 20px 60px rgba(0,26,61,0.6); }
        }
        @keyframes shimmer {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(300%); }
        }
        @keyframes float-particle {
          0%,100% { transform:translateY(0) scale(1); opacity:0.4; }
          50%     { transform:translateY(-14px) scale(1.15); opacity:1; }
        }
        .ring-outer {
          position:absolute; width:220px; height:220px; border-radius:50%;
          border:1.5px dashed rgba(126,182,255,0.55);
          animation: ring-spin 6s linear infinite;
        }
        .ring-inner {
          position:absolute; width:170px; height:170px; border-radius:50%;
          border:2px solid rgba(126,182,255,0.30);
          border-top-color: rgba(126,182,255,0.85);
          border-right-color: rgba(126,182,255,0.75);
          animation: ring-spin-rev 2.2s linear infinite;
        }
        .rh-mark {
          width:110px; height:110px; background:linear-gradient(135deg,#2F80ED 0%,#001A3D 90%);
          border-radius:28px;
          display:flex; align-items:center; justify-content:center;
          animation: rh-pop 700ms cubic-bezier(.22,.9,.25,1.1) both, glow-pulse 2.2s ease-in-out infinite 700ms;
          position:relative; z-index:2;
          border:2px solid rgba(126,182,255,0.4);
        }
        .rh-mark::before {
          content:''; position:absolute; inset:0; border-radius:28px; overflow:hidden;
          background:linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
          background-size:200% 100%;
          animation: shimmer 2.4s ease-in-out infinite 800ms;
          mix-blend-mode: overlay;
        }
        .rh-atom {
          position:absolute; top:50%; left:50%;
          width:14px; height:14px; margin:-7px 0 0 -7px;
          z-index:1;
        }
        .rh-atom .dot {
          width:14px; height:14px; border-radius:50%;
          background:#7EB6FF;
          box-shadow:0 0 12px #7EB6FF, 0 0 24px rgba(126,182,255,0.6);
        }
        .rh-atom:nth-child(3) { animation: orbit 3.2s linear infinite; }
        .rh-atom:nth-child(4) { animation: orbit 3.2s linear infinite -1.06s; }
        .rh-atom:nth-child(5) { animation: orbit 3.2s linear infinite -2.13s; }
        .rh-atom:nth-child(4) .dot { background:#FFB703; box-shadow:0 0 12px #FFB703, 0 0 24px rgba(255,183,3,0.5); }
        .rh-atom:nth-child(5) .dot { background:#A7D8FF; box-shadow:0 0 12px #A7D8FF, 0 0 24px rgba(167,216,255,0.6); }
        .rh-label {
          color:white; font-weight:800; font-size:22px; letter-spacing:0.32em;
          font-family:system-ui,sans-serif; margin-top:36px;
          animation: rh-label 900ms cubic-bezier(.22,.9,.25,1.1) both;
        }
        .rh-tagline {
          color:#7EB6FF; font-weight:500; font-size:11px; letter-spacing:0.15em;
          font-family:system-ui,sans-serif; margin-top:6px;
          animation: rh-tag 1400ms ease both;
          text-transform:uppercase;
        }
        .rh-bar {
          margin-top:24px; width:180px; height:4px; border-radius:2px;
          background:rgba(126,182,255,0.15); overflow:hidden; position:relative;
        }
        .rh-bar-fill {
          height:100%; border-radius:2px; position:relative; overflow:hidden;
          background:linear-gradient(90deg,#2F80ED,#7EB6FF,#FFB703);
          transition: width 100ms linear;
        }
        .rh-bar-fill::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
          background-size:200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        .particles { position:absolute; inset:0; pointer-events:none; }
        .particle {
          position:absolute; width:6px; height:6px; border-radius:50%;
          background:#7EB6FF; opacity:0.5;
          animation: float-particle 3.2s ease-in-out infinite;
        }
        .particle:nth-child(1) { top:22%; left:18%; animation-delay: 0s;    background:#7EB6FF; }
        .particle:nth-child(2) { top:32%; left:82%; animation-delay: 0.6s;  background:#A7D8FF; }
        .particle:nth-child(3) { top:68%; left:12%; animation-delay: 1.2s;  background:#FFB703; }
        .particle:nth-child(4) { top:78%; left:78%; animation-delay: 1.8s;  background:#7EB6FF; }
        .particle:nth-child(5) { top:15%; left:52%; animation-delay: 0.3s;  background:#A7D8FF; width:4px; height:4px; }
        .particle:nth-child(6) { top:85%; left:48%; animation-delay: 2.4s;  background:#FFB703; width:4px; height:4px; }
      `}</style>

      {/* Particulas de fondo */}
      <div className="particles">
        <div className="particle" /><div className="particle" /><div className="particle" />
        <div className="particle" /><div className="particle" /><div className="particle" />
      </div>

      {/* Centro: anillos giratorios + orbitas + logo */}
      <div style={{ position:'relative', width:240, height:240, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="ring-outer" />
        <div className="ring-inner" />
        <div className="rh-atom"><div className="dot" /></div>
        <div className="rh-atom"><div className="dot" /></div>
        <div className="rh-atom"><div className="dot" /></div>
        <div className="rh-mark">
          <span style={{ color:'white', fontWeight:800, fontSize:48, fontFamily:'system-ui,sans-serif', position:'relative', zIndex:1 }}>Co</span>
        </div>
      </div>

      {/* Nombre y tagline */}
      <div className="rh-label">COBALTO</div>
      <div className="rh-tagline">Punto de encuentro quimico</div>

      {/* Barra de carga */}
      <div className="rh-bar">
        <div className="rh-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
