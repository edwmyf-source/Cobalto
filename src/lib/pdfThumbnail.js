// ─────────────────────────────────────────────────────────────────────────────
// Miniatura de PDF: renderiza la primera página en un <canvas> y la convierte
// en una imagen JPEG, para que un PDF se vea en el feed como una foto de
// portada en vez de solo un ícono con el nombre del archivo.
//
// Usa pdf.js (la misma librería que Chrome y Firefox usan internamente para
// mostrar PDFs), así que corre entera en el navegador — no hace falta ningún
// servidor de conversión. Si algo falla (PDF protegido, corrupto, muy
// pesado), se resuelve a null y el post sigue publicándose sin miniatura,
// cayendo al ícono de siempre.
// ─────────────────────────────────────────────────────────────────────────────
// pdf.js pesa ~500KB minificado. Se carga solo la primera vez que alguien
// sube un PDF, en vez de venir incluido en el paquete principal — así nadie
// descarga esa librería si nunca adjunta un PDF.
let pdfjsLibPromise = null
async function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjsLib, workerModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default
      return pdfjsLib
    })
  }
  return pdfjsLibPromise
}

const MAX_DIMENSION = 900   // px del lado mayor: suficiente para verse nítido
                             // en el feed sin generar una imagen pesada
const QUALITY = 0.85

/**
 * Genera una miniatura JPEG de la primera página de un PDF.
 * Devuelve un File listo para subir igual que cualquier imagen, o null si no
 * se pudo generar (nunca lanza).
 */
export async function generatePdfThumbnail(file) {
  if (!file || file.type !== 'application/pdf') return null

  try {
    const pdfjsLib = await loadPdfjs()
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const page = await pdf.getPage(1)

    const baseViewport = page.getViewport({ scale: 1 })
    const scale = MAX_DIMENSION / Math.max(baseViewport.width, baseViewport.height)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    const ctx = canvas.getContext('2d')

    // Fondo blanco: un PDF con transparencia (raro, pero posible) no debe
    // dejar ver el fondo oscuro de la app detrás de la miniatura.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    await page.render({ canvasContext: ctx, viewport }).promise

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
    if (!blob) return null

    const name = file.name.replace(/\.pdf$/i, '') + '-portada.jpg'
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch (err) {
    console.warn('No se pudo generar miniatura del PDF:', err)
    return null
  }
}
