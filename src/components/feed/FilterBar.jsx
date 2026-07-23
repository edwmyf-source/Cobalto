import { Search, X, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import {
  MARKETPLACE_TABS,
  TIENDA_CATS,
  NOVEDADES_SUBCATS,
  VACANTES_NIVELES,
  TAB_COLOR,
} from '../../lib/constants'

function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-[12px] text-[12px] font-bold transition-all flex-shrink-0"
      style={active
        ? { background: '#FFFFFF', color: '#0B2E68' }
        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.14)' }}
    >
      {label}
    </button>
  )
}

function Section({ title, value, open, onToggle, children }) {
  return (
    <div>
      {title && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center relative px-3 py-2.5"
        >
          <span className="text-[11px] font-extrabold" style={{ color: 'rgba(255,255,255,0.9)' }}>{title}</span>
          <span className="flex items-center gap-1.5 absolute right-3">
            {value && <span className="text-[10px] font-bold" style={{ color: '#7FB2FF' }}>{value}</span>}
            <ChevronDown size={13}
              style={{ color: 'rgba(255,255,255,0.5)', transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </span>
        </button>
      )}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="px-3 pb-3 pt-3 flex flex-wrap justify-center gap-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FilterBar({ filters, setFilters, autoFocusSearch = false }) {
  const [openSecs, setOpenSecs] = useState(new Set(['categoria']))
  const searchRef = useRef(null)

  useEffect(() => {
    if (autoFocusSearch && searchRef.current) {
      searchRef.current.focus()
      searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [autoFocusSearch])

  const set    = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const tab    = filters.tab || 'todo'
  const hasFilters = tab !== 'todo' || filters.subcategory || filters.search || filters.category

  const setTab = (t) => {
    const tabDef = MARKETPLACE_TABS.find(x => x.value === t)
    setFilters({ tab: t, categories: tabDef?.categories || [], subcategory: '', category: '' })
  }
  const setCat = (v) => setFilters(f => ({ ...f, category: f.category === v ? '' : v, subcategory: '' }))
  const setSub = (v) => set('subcategory', filters.subcategory === v ? '' : v)
  const toggle = (s) => setOpenSecs(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })

  const tiendaCat = TIENDA_CATS.find(c => c.value === filters.category)
  const tabLabel  = MARKETPLACE_TABS.find(t => t.value === tab)?.label || 'TODO'

  // Subcategorías según tab
  const subOptions = tab === 'tienda'
    ? (tiendaCat ? tiendaCat.subcategories : [])
    : tab === 'novedades' ? NOVEDADES_SUBCATS
    : tab === 'vacantes'  ? VACANTES_NIVELES
    : []

  return (
    <div className="mb-3 -mx-4 md:mx-0 px-[14px] pb-4 md:rounded-[18px] md:pt-4"
      style={{ background: 'radial-gradient(circle at 70% -120%, #1A5AC8 0%, #0B2E68 55%, #081F4A 100%)' }}>

      {/* Buscador — glass oscuro dentro del navy */}
      <div className="relative mb-2.5">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
        <input
          ref={searchRef}
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          placeholder="Buscar en Cobalto..."
          className="w-full pl-11 pr-9 py-[11px] rounded-[14px] text-[12px] font-semibold focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.16)', color: '#ffffff' }}
        />
        {filters.search && (
          <button onClick={() => set('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        )}
      </div>

      {/* Accordion D2 (Filtros) */}
      <div className="rounded-[14px] overflow-hidden" style={{ background: 'transparent' }}>

        {/* Limpiar filtros */}
        {hasFilters && (
          <div className="flex justify-end pb-1.5">
            <button
              onClick={() => { setFilters({}); setOpenSec('categoria') }}
              className="text-[10px] font-bold hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              Limpiar
            </button>
          </div>
        )}

        {/* Sección: Categoría (sin título propio, usa el del header) */}
        <Section
          value={null}
          open={true}
          onToggle={() => {}}
        >
          {MARKETPLACE_TABS.map(t => (
            <Pill key={t.value} label={t.label}
              active={tab === t.value}
              onClick={() => { setTab(t.value); if (t.value !== 'todo') setOpenSecs(prev => { const n = new Set(prev); n.add('subcategoria'); return n }) }} />
          ))}
        </Section>

        {/* Sección: Subcategoría (solo si el tab tiene sub-opciones) */}
        {tab === 'tienda' && (
          <Section
            title="Cuéntanos más"
            value={filters.category ? TIENDA_CATS.find(c=>c.value===filters.category)?.label : null}
            open={openSecs.has('subcategoria')}
            onToggle={() => toggle('subcategoria')}
          >
            {TIENDA_CATS.map(c => (
              <Pill key={c.value} label={c.label}
                active={filters.category === c.value}
                onClick={() => { setCat(c.value); setOpenSecs(prev => { const n = new Set(prev); n.add('subcategoria'); return n }) }} />
            ))}
            {tiendaCat && tiendaCat.subcategories.map(sub => (
              <Pill key={sub} label={sub}
                active={filters.subcategory === sub}
                onClick={() => setSub(sub)} />
            ))}
          </Section>
        )}

        {subOptions.length > 0 && tab !== 'tienda' && (
          <Section
            title="Cuéntanos más"
            value={filters.subcategory || null}
            open={openSecs.has('subcategoria')}
            onToggle={() => toggle('subcategoria')}
          >
            {subOptions.map(sub => (
              <Pill key={sub} label={sub}
                active={filters.subcategory === sub}
                onClick={() => setSub(sub)} />
            ))}
          </Section>
        )}

      </div>

    </div>
  )
}
