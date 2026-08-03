import { useNavigate } from 'react-router-dom'
import { LegalLayout, TerminosContent, PrivacidadContent, LEGAL_UPDATED } from '../components/legal/LegalContent'

// Mismas páginas legales, pero dentro de la app para quien ya inició sesión.
// El contenido vive en un solo lugar (LegalContent) y se reutiliza aquí.
export function TerminosPage() {
  const navigate = useNavigate()
  return (
    <div className="page-enter">
      <LegalLayout title="Términos y Condiciones" updated={LEGAL_UPDATED} onBack={() => navigate(-1)}>
        <TerminosContent />
      </LegalLayout>
    </div>
  )
}

export function PrivacidadPage() {
  const navigate = useNavigate()
  return (
    <div className="page-enter">
      <LegalLayout title="Política de Privacidad y Tratamiento de Datos" updated={LEGAL_UPDATED} onBack={() => navigate(-1)}>
        <PrivacidadContent />
      </LegalLayout>
    </div>
  )
}
