export const domainOf = (email) => {
  if (!email) return ''
  const p = email.split('@')
  return p.length === 2 ? `@${p[1]}` : ''
}

export const maskedEmail = (email) => {
  const d = domainOf(email)
  return d ? `xxxxx${d}` : 'xxxxx@****'
}

// Genera un número de 5 dígitos determinista a partir del userId
export const generateIdentityNumber = (seed = '') => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const abs = Math.abs(hash) % 90000 + 10000
  return String(abs)
}

// 2 opciones: 'real' (nombre completo) o 'anon' (Usuario-NNNNN)
export const publicName = (profile) => {
  if (!profile) return 'Usuario'
  if (profile.identity_mode === 'real' && profile.full_name) {
    return profile.full_name
  }
  const num = profile.identity_number || generateIdentityNumber(profile.id || '')
  return `Usuario-${num}`
}

export const timeAgo = (iso) => {
  if (!iso) return ''
  const d = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (d < 0)      return 'ahora'
  if (d < 60)     return 'hace un momento'
  if (d < 3600)   return `hace ${Math.floor(d/60)} min`
  if (d < 86400)  return `hace ${Math.floor(d/3600)} h`
  return `hace ${Math.floor(d/86400)} d`
}

export const sortCats = (cats) =>
  [...cats].sort((a, b) => {
    const aOther = /^otros?/i.test(a.name)
    const bOther = /^otros?/i.test(b.name)
    if (aOther && !bOther) return 1
    if (!aOther && bOther) return -1
    return a.name.localeCompare(b.name, 'es')
  })

// Puntos del quiz (0-500) renderizados con emojis de números: 250 -> 2️⃣5️⃣0️⃣
const DIGIT_EMOJI = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']
export const ptsEmoji = (pts) =>
  String(Math.max(0, Math.min(500, Math.round(Number(pts) || 0))))
    .split('').map(d => DIGIT_EMOJI[+d]).join('')
