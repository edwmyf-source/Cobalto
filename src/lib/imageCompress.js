// ─────────────────────────────────────────────────────────────────────────────
// Compresión de imágenes en el navegador antes de subir.
//
// Motivación: el plan Free de Supabase no ofrece transformación de imágenes en
// el servidor. Comprimir en cliente ahorra ancho de banda tanto en subida como
// en bajada (todos los usuarios que abran el post reciben una versión liviana)
// y reduce el consumo de storage — sin costo adicional.
//
// Estrategia: si la foto entra dentro del tamaño y peso objetivo, se sube tal
// cual. Si no, se redimensiona en un <canvas> y se re-encodifica a JPEG con
// calidad 0.82. Perceptualmente idéntico, ~70-90% menos peso.
// PNG con transparencia se conserva como PNG para no perder el canal alfa.
// GIF y otros formatos animados se dejan intactos.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_DIMENSION   = 1600   // px: ancho o alto máximo del lado mayor
const QUALITY         = 0.82   // JPEG quality (0-1)
const SKIP_UNDER_KB   = 300    // no vale la pena comprimir imágenes ya pequeñas

/**
 * Comprime una imagen si es grande. Devuelve un File nuevo o el original.
 * Nunca lanza: si algo falla (formato raro, memoria, etc.) devuelve el original.
 */
export async function compressImage(file) {
  if (!file || !file.type?.startsWith('image/')) return file
  if (file.type === 'image/gif') return file        // animaciones intactas
  if (file.size < SKIP_UNDER_KB * 1024) return file // ya es pequeña

  try {
    const bitmap = await readBitmap(file)
    const { width, height } = fitInside(bitmap.width, bitmap.height, MAX_DIMENSION)

    // Si además de estar en tamaño ya cabe, no re-encodificar cuando el peso
    // baja poco: recodificar un JPEG ya optimizado a veces lo agranda.
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)

    // PNG con posible transparencia: mantener PNG (calidad se ignora en PNG).
    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, QUALITY)
    )
    if (!blob) return file
    if (blob.size >= file.size) return file  // no mejoró, quedarnos con el original

    const newName = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, outType === 'image/png' ? '.png' : '.jpg')
    return new File([blob], newName, { type: outType, lastModified: Date.now() })
  } catch {
    return file
  }
}

// Escala manteniendo aspecto para que el lado mayor no supere `max`.
function fitInside(w, h, max) {
  if (w <= max && h <= max) return { width: w, height: h }
  const ratio = w > h ? max / w : max / h
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) }
}

// createImageBitmap es más rápido y no bloquea el hilo principal; fallback a
// <img> por si el navegador es muy viejo (o si Safari falla con algún tipo).
async function readBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file) } catch { /* fallback */ }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}
