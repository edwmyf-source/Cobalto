const SAFE_PREFIXES = [
  'Email o contraseña',
  'Confirma tu email',
  'Este email ya está',
  'La contraseña debe',
  'Formato de email',
  'Revisa tu email',
  'No tienes permiso',
  'Este registro ya existe',
]

export function safeErrorMessage(err) {
  const msg = err?.message || String(err)
  if (SAFE_PREFIXES.some(p => msg.startsWith(p))) return msg
  if (msg.includes('duplicate key')) return 'Este registro ya existe.'
  if (msg.includes('violates foreign key')) return 'Referencia inválida.'
  if (msg.includes('network') || msg.includes('fetch')) return 'Error de conexión. Intenta de nuevo.'
  if (msg.includes('row-level security') || msg.includes('RLS') || msg.includes('policy')) {
    return `Error de permisos en la base de datos (${msg}). Verifica las políticas RLS en Supabase.`
  }
  if (msg.includes('column') && msg.includes('does not exist')) {
    return 'Falta una columna en la base de datos. Ejecuta el SQL de configuración.'
  }
  // En desarrollo mostrar error real para debugging
  if (import.meta.env.DEV) {
    return `Error: ${msg}`
  }
  // TEMPORAL: mostrar error real para diagnóstico en producción
  return `Error: ${msg}`
}
