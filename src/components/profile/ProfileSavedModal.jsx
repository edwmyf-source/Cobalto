import { Check } from 'lucide-react'

// A diferencia de un toast (que desaparece solo), este modal se queda en
// pantalla hasta que la persona toca "Aceptar" — para que la confirmación
// de guardado sea imposible de pasar por alto.
export default function ProfileSavedModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 overflow-y-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 64px)', paddingBottom: 24,
        background: 'rgba(15,23,42,0.32)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="perfil-guardado-title">
      <div className="modal-enter rounded-modal w-full max-w-sm p-6 text-center"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="rounded-full inline-flex items-center justify-center mb-4"
          style={{ width: 52, height: 52, background: 'var(--success-bg)' }}>
          <Check size={26} strokeWidth={2.2} style={{ color: 'var(--success)' }} />
        </div>

        <h2 id="perfil-guardado-title" className="t-h4 mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Cambios guardados
        </h2>

        <p className="t-body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Tu información se actualizó con éxito.
        </p>

        <button onClick={onClose} autoFocus
          className="w-full h-[44px] rounded-btn text-[14px] font-semibold text-white transition-all duration-[160ms] active:scale-[0.98]"
          style={{ background: 'var(--accent-deep)' }}>
          Aceptar
        </button>
      </div>
    </div>
  )
}
