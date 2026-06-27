// Logo de marca: símbolo del Litio (Li), tono violeta oscuro.
export default function LitioMark({ size = 32, rounded = 'rounded-2xl' }) {
  return (
    <div
      className={`${rounded} flex items-center justify-center flex-shrink-0 select-none`}
      style={{ width: size, height: size, background: '#4c1d8f' }}
    >
      <span style={{ fontSize: size * 0.46 }} className="text-white font-bold leading-none">Li</span>
    </div>
  )
}
