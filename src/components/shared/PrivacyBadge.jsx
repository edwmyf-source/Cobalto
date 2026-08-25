import { Lock, Eye } from 'lucide-react'

export default function PrivacyBadge({ variant = 'private' }) {
  if (variant === 'private') {
    return (
      <span className="inline-flex items-center gap-1 bg-[var(--success-bg)] text-[var(--success)] text-[10px] font-medium px-1.5 py-0.5 rounded">
        <Lock size={9} /> Privado
      </span>
    )
  }
  if (variant === 'public') {
    return (
      <span className="inline-flex items-center gap-1 bg-[var(--accent)]/10 text-[var(--accent-deep)] text-[10px] font-medium px-1.5 py-0.5 rounded">
        <Eye size={9} /> Público
      </span>
    )
  }
  if (variant === 'domain') {
    return (
      <span className="inline-flex items-center gap-1 bg-[var(--accent)]/10 text-[var(--accent-deep)] text-[10px] font-medium px-1.5 py-0.5 rounded">
        <Eye size={9} /> Dominio público
      </span>
    )
  }
  return null
}
