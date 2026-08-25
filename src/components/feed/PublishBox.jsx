import { useState, useRef, useEffect } from 'react'
import { X, Send, XCircle, ImagePlus, FileText, Loader2, ShoppingBag, Wrench, Briefcase, Megaphone, Sparkles, MapPin, Calendar } from 'lucide-react'
import { createPost } from '../../api/posts'
import { CATEGORIES, DEPARTAMENTOS } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../shared/Toast'
import { safeErrorMessage } from '../../lib/errors'
import { publicName } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'
import Spinner from '../shared/Spinner'

const NOMINATIM_MAP = {
  'Antioquia':'Antioquia','Bogotá':'Bogotá D.C.','Bogota':'Bogotá D.C.',
  'Cundinamarca':'Cundinamarca','Valle del Cauca':'Valle del Cauca',
  'Atlántico':'Atlántico','Atlantico':'Atlántico','Bolívar':'Bolívar','Bolivar':'Bolívar',
  'Santander':'Santander','Córdoba':'Córdoba','Cordoba':'Córdoba',
  'Nariño':'Nariño','Narino':'Nariño','Tolima':'Tolima','Cauca':'Cauca',
  'Huila':'Huila','Meta':'Meta','Boyacá':'Boyacá','Boyaca':'Boyacá',
  'Caldas':'Caldas','Risaralda':'Risaralda','Magdalena':'Magdalena','Cesar':'Cesar',
  'Norte de Santander':'Norte de Santander','Sucre':'Sucre',
  'Quindío':'Quindío','Quindio':'Quindío','Chocó':'Chocó','Choco':'Chocó',
  'La Guajira':'La Guajira','Caquetá':'Caquetá','Caqueta':'Caquetá',
  'Arauca':'Arauca','Putumayo':'Putumayo','Casanare':'Casanare','Vichada':'Vichada',
  'Amazonas':'Amazonas','Guainía':'Guainía','Guainia':'Guainía',
  'Vaupés':'Vaupés','Vaupes':'Vaupés','Guaviare':'Guaviare','San Andrés':'San Andrés',
}

const detectDepartamento = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=es`,
            { headers: { 'User-Agent': 'Cobalto-App/1.0' } }
          )
          const data = await res.json()
          const addr = data.address || {}
          const raw = addr.state || addr.state_district || addr.county || ''
          for (const [key, val] of Object.entries(NOMINATIM_MAP)) {
            if (raw.toLowerCase().includes(key.toLowerCase())) { resolve(val); return }
          }
          const match = DEPARTAMENTOS.find(d =>
            raw.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(raw.toLowerCase())
          )
          resolve(match || null)
        } catch { resolve(null) }
      },
      () => resolve(null),
      { timeout: 6000 }
    )
  })
}

const CAT_ICONS = { productos: ShoppingBag, servicios: Wrench, empleos: Briefcase, informacion: Megaphone, publicidad: Sparkles }

const CAT_PLACEHOLDER = {
  productos:   'Escribe aquí lo que quieres ofrecer o buscar en productos...',
  servicios:   'Escribe aquí el servicio que ofreces o necesitas...',
  empleos:     'Escribe aquí la vacante que ofreces o el empleo que buscas...',
  informacion: 'Escribe aquí lo que quieres compartir o preguntar a la comunidad...',
  default:     'Ofrezco / busco / comparto...',
}

const MAX_FILES = 5
const MAX_SIZE_MB = 50
const MAX_PX = 1920      // máximo ancho/alto en píxeles
const QUALITY = 0.85     // 85% calidad — indistinguible del original

// Comprime una imagen manteniendo calidad visual
const compressImage = (file) => new Promise((resolve) => {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    URL.revokeObjectURL(url)
    let { width, height } = img
    if (width <= MAX_PX && height <= MAX_PX) { resolve(file); return }
    if (width > height) { height = Math.round(height * MAX_PX / width); width = MAX_PX }
    else { width = Math.round(width * MAX_PX / height); height = MAX_PX }
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    canvas.getContext('2d').drawImage(img, 0, 0, width, height)
    canvas.toBlob(
      (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })),
      'image/jpeg', QUALITY
    )
  }
  img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
  img.src = url
})

// Clasifica el tipo de archivo
const fileKind = (file) => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf') return 'pdf'
  return 'other'
}

export default function PublishBox({ onClose, onPublished }) {
  const { session, profile: myProfile } = useAuth()
  const toast = useToast()
  const imageRef = useRef(null)
  const pdfRef   = useRef(null)

  const [form, setForm] = useState({ category: '', subcategory: '', title: '', event_date: '' })
  const [files, setFiles] = useState([])   // [{ file, preview, kind }]
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [detectingLoc, setDetectingLoc] = useState(true)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const selectedCat = CATEGORIES.find(c => c.value === form.category)
  const valid = form.category && form.title.trim()
  const placeholder = CAT_PLACEHOLDER[form.category] || CAT_PLACEHOLDER.default

  useEffect(() => {
    detectDepartamento().then(dep => { setLocation(dep); setDetectingLoc(false) })
  }, [])

  const addFiles = async (incoming) => {
    const remaining = MAX_FILES - files.length
    if (remaining <= 0) { toast(`Máximo ${MAX_FILES} archivos`, 'error'); return }

    const valid = []
    for (const f of Array.from(incoming).slice(0, remaining)) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast(`${f.name} supera ${MAX_SIZE_MB} MB`, 'error')
        continue
      }
      const kind = fileKind(f)
      const processedFile = kind === 'image' ? await compressImage(f) : f
      const preview = kind === 'image' ? URL.createObjectURL(processedFile) : null
      valid.push({ file: processedFile, preview, kind })
    }
    setFiles(prev => [...prev, ...valid].slice(0, MAX_FILES))
  }

  const removeFile = (idx) => {
    setFiles(prev => {
      if (prev[idx].preview) URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    try {
      const post = await createPost(
        { author_id: session.user.id, title: form.title.trim(), content: '',
          category: form.category, subcategory: form.subcategory || null, location: location || null,
          event_date: form.subcategory === 'Eventos' ? (form.event_date || null) : null },
        files.map(f => f.file)
      )
      onPublished?.(post)
    } catch (err) {
      toast(safeErrorMessage(err), 'error')
    } finally {
      // Garantiza que el botón nunca quede bloqueado aunque haya error silencioso
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-input border text-[16px] focus:outline-none transition-all duration-[160ms]'

  return (
    <div className="overflow-hidden rounded-panel" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-modal)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div>
          <p className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>Crear publicación</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Comparte algo útil con tu comunidad</p>
        </div>
        <button onClick={onClose} aria-label="Cerrar"
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-tertiary)' }}>
          <X size={18} />
        </button>
      </div>

      <form onSubmit={submit} className="px-5 py-5 space-y-5">
        <div className="flex items-center gap-3">
          <UserAvatar seed={session?.user?.id || 'me'} name={publicName(myProfile)} avatarUrl={myProfile?.avatar_url} size={44} />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Tu publicación</p>
            {!detectingLoc && location && <p className="text-[12px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}><MapPin size={12} /> {location}</p>}
            {detectingLoc && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Detectando ubicación...</p>}
          </div>
        </div>

        <textarea value={form.title} onChange={e => set('title', e.target.value)}
          placeholder={placeholder} rows={4} maxLength={280} autoFocus required
          className={`${inputCls} resize-none`}
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', borderColor: 'var(--border-soft)' }} />

        {/* Categorías */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>¿De qué trata?</p>
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Obligatorio</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(c => {
              const Icon = CAT_ICONS[c.value]
              const active = form.category === c.value
              return (
                <button key={c.value} type="button"
                  onClick={() => { set('category', active ? '' : c.value); set('subcategory', '') }}
                  className="flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1.5 min-h-[52px] px-3 py-2.5 rounded-input text-left sm:text-center transition-all duration-[160ms] active:scale-[0.98]"
                  style={active
                    ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                    : { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  <Icon size={19} strokeWidth={1.9} />
                  <span className="text-[11px] font-semibold leading-tight">{c.label}</span>
                </button>
              )
            })}
          </div>
          {!form.category && form.title.trim() && (
            <p className="text-[12px] mt-2" style={{ color: 'var(--error)' }}>Selecciona una categoría para poder publicar.</p>
          )}
        </div>

        {/* Subcategorías */}
        {selectedCat && selectedCat.subcategories.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Subcategoría</p>
            <div className="flex flex-wrap gap-2">
              {selectedCat.subcategories.map(s => {
                const active = form.subcategory === s
                return (
                  <button key={s} type="button"
                    onClick={() => set('subcategory', active ? '' : s)}
                    className="px-3.5 h-9 rounded-full text-[12px] font-semibold border transition-all duration-[160ms] active:scale-[0.98]"
                    style={active
                      ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                      : { background: 'var(--surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Fecha del evento */}
        {form.subcategory === 'Eventos' && (
          <div>
            <p className="text-[12px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={14} style={{ color: 'var(--accent)' }} /> Fecha del evento
            </p>
            <input type="date"
              value={form.event_date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => set('event_date', e.target.value)}
              className={inputCls}
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>La fecha aparecerá en Próximos eventos.</p>
          </div>
        )}

        {/* Adjuntos */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Adjuntos</p>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{files.length}/{MAX_FILES}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {files.map((f, idx) => (
                <div key={idx} className="relative rounded-input overflow-hidden" style={{ width: 78, height: 78, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  {f.kind === 'image' && <img src={f.preview} alt="" className="w-full h-full object-cover" />}
                  {f.kind === 'pdf' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1">
                      <FileText size={20} style={{ color: 'var(--error)' }} />
                      <span className="text-[9px] truncate max-w-full" style={{ color: 'var(--text-secondary)' }}>{f.file.name}</span>
                    </div>
                  )}
                  <button type="button" onClick={() => removeFile(idx)} aria-label="Quitar archivo"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'rgba(15,23,42,0.65)' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-1.5">
            <input ref={imageRef} type="file" accept="image/*" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
            <input ref={pdfRef} type="file" accept="application/pdf" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
            <button type="button" onClick={() => imageRef.current?.click()} disabled={files.length >= MAX_FILES}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-btn text-[12px] font-semibold transition-all disabled:opacity-40"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
              <ImagePlus size={15} /> Foto
            </button>
            <button type="button" onClick={() => pdfRef.current?.click()} disabled={files.length >= MAX_FILES}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-btn text-[12px] font-semibold transition-all disabled:opacity-40"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
              <FileText size={15} /> PDF
            </button>
          </div>

          <button type="submit" disabled={!valid || loading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-btn text-[13px] font-semibold text-white transition-all duration-[160ms] active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-raised)' }}>
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Publicando...</>
              : <><Send size={14} /> Publicar</>}
          </button>
        </div>
      </form>
    </div>
  )
}
