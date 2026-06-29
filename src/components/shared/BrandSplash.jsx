import { useEffect } from 'react'

export default function BrandSplash({ onDone }) {
  useEffect(() => {
    // 400ms: suficiente para la animación, no bloquea el arranque
    const t = setTimeout(onDone, 400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div onClick={onDone}
      className="fixed inset-0 z-50 flex items-center justify-center bg-sidebar cursor-pointer overflow-hidden">

      <style>{`
        @keyframes litioMarkPop {
          0%   { opacity: 0; transform: scale(.6) rotate(-8deg); }
          60%  { opacity: 1; transform: scale(1.08) rotate(0deg); }
          80%  { opacity: 1; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes litioLabelIn {
          0%   { opacity: 0; transform: translateY(8px); }
          50%  { opacity: 0; }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col items-center gap-4">
        <div
          className="rounded-[28px] flex items-center justify-center shadow-2xl"
          style={{ width: 96, height: 96, background: '#4c1d8f', animation: 'litioMarkPop 400ms cubic-bezier(.22,.9,.25,1.1) forwards' }}
        >
          <span className="text-white font-extrabold" style={{ fontSize: 42 }}>Li</span>
        </div>
        <span
          className="font-bold text-white tracking-[0.3em]"
          style={{ fontSize: 18, animation: 'litioLabelIn 400ms ease forwards' }}
        >
          LITIO
        </span>
      </div>
    </div>
  )
}
