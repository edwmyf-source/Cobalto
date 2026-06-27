import { Lock, Eye } from 'lucide-react'

export default function PrivacyBadge({ variant = 'private' }) {
  if (variant === 'private') {
    return (
      <span className="inline-flex items-center gap-1 bg-success-50 text-success-500 text-[10px] font-medium px-1.5 py-0.5 rounded">
        <Lock size={9} /> Privado
      </span>
    )
  }
  if (variant === 'public') {
    return (
      <span className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
        <Eye size={9} /> Público
      </span>
    )
  }
  if (variant === 'domain') {
    return (
      <span className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
        <Eye size={9} /> Dominio público
      </span>
    )
  }
  return null
}
