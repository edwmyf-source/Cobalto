import { useEffect, useRef } from 'react'
import CobaltoMark from './CobaltoMark'

// Primera vez por sesión del navegador: 4s. En recargas siguientes: 3s.
const SPLASH_SEEN_KEY = 'cobalto-splash-seen'

// Nodos de red: puntos y líneas abstractas que sugieren conexión entre
// personas, sin recurrir a iconografía de laboratorio. Coordenadas en
// porcentaje para que la composición aguante cualquier tamaño de pantalla.
const NODES = [
  { x: 62, y: 15, s: 7, to: { x: 79, y: 7 },  delay: 1500 },
  { x: 79, y: 7,  s: 5,                        delay: 1610 },
  { x: 11, y: 78, s: 6, to: { x: 33, y: 85 }, delay: 1720 },
  { x: 33, y: 85, s: 4,                        delay: 1830 },
]

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
    }}>
      <style>{`
        /* ═══════════ Línea de tiempo (≈3 s) ═══════════
           0.0–1.4s  el isotipo gigante entra desde la esquina inferior derecha
           0.2–1.1s  el isotipo pequeño baja y se asienta arriba a la izquierda
           0.85s     aparece el wordmark
           1.20s     aparece el mensaje
           1.50s+    se tejen los nodos de conexión
           1.65s     crece la barra roja y la pantalla queda lista
           ═══════════════════════════════════════════════ */

        @keyframes cbo-fade-up {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cbo-bar-grow {
          0%   { width: 0; }
          100% { width: 76px; }
        }
        @keyframes cbo-node-in {
          0%   { opacity: 0; transform: scale(0); }
          100% { opacity: 0.55; transform: scale(1); }
        }
        @keyframes cbo-line-in {
          0%   { opacity: 0; width: 0; }
          100% { opacity: 0.4; }
        }

        /* ── Isotipo gigante saliendo de cuadro: elemento gráfico de fondo ── */
        @keyframes cbo-hero-in {
          0%   { opacity: 0;    transform: translate(70px, 70px) scale(0.75); }
          100% { opacity: 0.13; transform: translate(0, 0) scale(1); }
        }
        .cbo-hero {
          position: absolute;
          /* Ampliado ~28% para compensar que el SVG ocupa el 78% de su
             contenedor: así el arco realmente sale de cuadro. */
          width: clamp(410px, 118vw, 715px);
          aspect-ratio: 1 / 1;
          right: clamp(-190px, -44vw, -140px);
          bottom: clamp(-180px, -41vw, -130px);
          opacity: 0;
          animation: cbo-hero-in 1400ms cubic-bezier(0.16,1,0.3,1) both;
          pointer-events: none;
        }

        /* ── Isotipo pequeño: la marca "aterrizando" arriba a la izquierda ── */
        @keyframes cbo-mark-in {
          0%   { opacity: 0; transform: translateY(-26px) scale(0.6); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cbo-mark {
          display: inline-flex;
          opacity: 0;
          /* Entra con rebote y, al terminar, arranca el rebote en bucle que
             ya teníamos: la marca sigue "viva" mientras carga la app. */
          animation:
            cbo-mark-in 900ms cubic-bezier(0.34,1.56,0.64,1) 200ms both,
            cbo-mark-bounce 2.1s ease-out 1200ms infinite;
        }
        @keyframes cbo-mark-bounce {
          0%, 100% { transform: translateY(0)     scaleY(1);    }
          18%      { transform: translateY(-16px) scaleY(1.06); }
          36%      { transform: translateY(0)     scaleY(0.90); }
          50%      { transform: translateY(-7px)  scaleY(1.03); }
          66%      { transform: translateY(0)     scaleY(0.96); }
          78%      { transform: translateY(-2px)  scaleY(1);    }
        }

        /* ── Bloque de texto, alineado a la izquierda (registro editorial) ── */
        .cbo-block {
          position: absolute;
          left: clamp(26px, 7vw, 76px);
          right: clamp(26px, 7vw, 76px);
          top: clamp(150px, 33vh, 300px);
          z-index: 2;
        }
        .cbo-word {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: clamp(38px, 11vw, 76px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          opacity: 0;
          animation: cbo-fade-up 620ms cubic-bezier(0.16,1,0.3,1) 850ms both;
        }
        /* Misma convención de color que en Topbar, AppLayout y AuthScreen:
           "Red" siempre en rojo de marca, "Cobalto" en azul marino. */
        .cbo-word .cbo-red     { color: var(--brand-red, #E63946); }
        .cbo-word .cbo-cobalto { color: var(--accent-deep, #0B2E68); }
        .cbo-word .cbo-dot     { color: var(--accent, #1A5AC8); }

        .cbo-tag {
          margin-top: clamp(14px, 3.5vw, 22px);
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: clamp(15px, 4.2vw, 22px);
          line-height: 1.5;
          font-weight: 500;
          color: var(--text-secondary, #475569);
          max-width: 30ch;
          opacity: 0;
          animation: cbo-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 1200ms both;
        }
        .cbo-tag b { color: var(--accent, #1A5AC8); font-weight: 700; }

        .cbo-bar {
          margin-top: clamp(20px, 5vw, 30px);
          height: 4px;
          width: 0;
          background: var(--brand-red, #E63946);
          border-radius: 2px;
          animation: cbo-bar-grow 500ms cubic-bezier(0.16,1,0.3,1) 1650ms both;
        }

        /* ── Nodos de conexión ── */
        .cbo-node {
          position: absolute;
          border-radius: 50%;
          background: var(--accent, #1A5AC8);
          opacity: 0;
          animation: cbo-node-in 700ms ease-out both;
        }
        .cbo-line {
          position: absolute;
          height: 1px;
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(26,90,200,0.5), rgba(26,90,200,0));
          opacity: 0;
          animation: cbo-line-in 800ms cubic-bezier(0.16,1,0.3,1) both;
        }

        /* En escritorio el texto se corre a la derecha del isotipo pequeño,
           aprovechando el ancho en vez de dejar la mitad de la pantalla vacía. */
        @media (min-width: 900px) {
          .cbo-block { top: clamp(200px, 34vh, 320px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cbo-hero, .cbo-mark, .cbo-word, .cbo-tag, .cbo-bar,
          .cbo-node, .cbo-line {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
          .cbo-mark { animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* Isotipo gigante de fondo, saliendo por la esquina inferior derecha */}
      <div className="cbo-hero" aria-hidden="true">
        <CobaltoMark size="100%" rounded="rounded-none" />
      </div>

      {/* Nodos de red: sugieren conexión, sin iconografía de laboratorio */}
      {NODES.map((n, i) => {
        const line = n.to && (() => {
          const dx = n.to.x - n.x, dy = n.to.y - n.y
          return {
            len: Math.hypot(dx, dy),
            ang: Math.atan2(dy, dx) * 180 / Math.PI,
          }
        })()
        return (
          <span key={i} aria-hidden="true">
            <span className="cbo-node"
              style={{ width: n.s, height: n.s, left: `${n.x}%`, top: `${n.y}%`,
                       animationDelay: `${n.delay}ms` }} />
            {line && (
              <span className="cbo-line"
                style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${line.len}%`,
                         transform: `rotate(${line.ang}deg)`,
                         animationDelay: `${n.delay + 160}ms` }} />
            )}
          </span>
        )
      })}

      {/* Isotipo pequeño arriba a la izquierda */}
      <div style={{ position: 'absolute', top: 'clamp(56px, 12vh, 110px)',
                    left: 'clamp(26px, 7vw, 76px)', zIndex: 2 }}>
        <div className="cbo-mark">
          <CobaltoMark size="clamp(64px, 17vw, 96px)" rounded="rounded-2xl" />
        </div>
      </div>

      {/* Wordmark + mensaje */}
      <div className="cbo-block">
        <div className="cbo-word">
          <span className="cbo-red">Red</span><span className="cbo-cobalto">Cobalto</span><span className="cbo-dot">.</span>
        </div>
        <div className="cbo-tag">
          El lugar donde la <b>industria química</b> se conecta
        </div>
        <div className="cbo-bar" />
      </div>
    </div>
  )
}
