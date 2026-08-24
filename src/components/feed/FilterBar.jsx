import { Search, X, ChevronDown } from 'lucide-react'
import { hoverProps } from '../../lib/hover'
import { Chip, Panel } from '../ui'
import { useState, useRef, useEffect } from 'react'
import {
  MARKETPLACE_TABS,
  TIENDA_CATS,
  NOVEDADES_SUBCATS,
  VACANTES_NIVELES,
  TAB_COLOR,
} from '../../lib/constants'

// Nivel 1 = categoría principal · Nivel 2 = subfiltro
function Pill({ label, active, onClick, size = 'sm' }) {
  return (
    <Chip active={active} onClick={onClick} size={size === 'lg' ? 'md' : 'sm'}>
      {label}
    </Chip>
  )
}

export default function FilterBar({ filters, setFilters, autoFocusSearch = false }) {
  const searchRef = useRef(null)
  const [openSecs, setOpenSecs] = useState(new Set(['categoria']))

  useEffect(() => {
    if (autoFocusSearch && searchRef.current) {
      searchRef.current.focus()
      searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [autoFocusSearch])

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const tab = filters.tab || 'todo'
  const hasFilters = tab !== 'todo' || filters.subcategory || filters.search || filters.category

  const setTab = (t) => {
    const tabDef = MARKETPLACE_TABS.find(x => x.value === t)
    setFilters({ tab: t, categories: tabDef?.categories || [], subcategory: '', category: '' })
  }
  const setCat = (v) => setFilters(f => ({ ...f, category: f.category === v ? '' : v, subcategory: '' }))
  const setSub = (v) => set('subcategory', filters.subcategory === v ? '' : v)
  const toggle = (s) => setOpenSecs(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })

  const tiendaCat = TIENDA_CATS.find(c => c.value === filters.category)

  // Subcategorías según tab
  const subOptions = tab === 'tienda'
    ? (tiendaCat ? tiendaCat.subcategories : [])
    : tab === 'novedades' ? NOVEDADES_SUBCATS
    : tab === 'vacantes'  ? VACANTES_NIVELES
    : []

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={17} strokeWidth={1.9}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-tertiary)' }} />
        <input
          ref={searchRef}
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          placeholder="Buscar personas, publicaciones, comunidades..."
          aria-label="Buscar personas, publicaciones, comunidades"
          className="w-full h-11 pl-11 pr-11 rounded-card text-[14px] transition-all duration-[160ms]"
          style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
          onFocus={e => e.currentTarget.style.boxShadow = 'var(--shadow-raised), 0 0 0 3px var(--accent-soft)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
        />
        {filters.search && (
          <button onClick={() => set('search', '')} aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'var(--bg-subtle)' }}>
            <X size={14} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Filters */}
      <Panel className="overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Explorar</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Encuentra contenido de tu comunidad</p>
            </div>
            {hasFilters && (
              <button
                onClick={() => { setFilters({}); setOpenSecs(new Set(['categoria'])) }}
                className="text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}>
                Limpiar
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scroll-x-safe">
            {MARKETPLACE_TABS.map(t => (
              <Pill key={t.value} label={t.label} size="lg" active={tab === t.value} onClick={() => {
                setTab(t.value)
                if (t.value !== 'todo') setOpenSecs(prev => { const n = new Set(prev); n.add('subcategoria'); return n })
              }} />
            ))}
          </div>
        </div>

        {(tab === 'tienda' || subOptions.length > 0) && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
            {tab === 'tienda' ? (
              <>
                <button onClick={() => toggle('subcategoria')} className="w-full flex items-center justify-between mb-2 text-left">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Subcategoría</span>
                  <ChevronDown size={15} style={{ color: 'var(--text-tertiary)', transform: openSecs.has('subcategoria') ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--t-base)' }} />
                </button>
                {openSecs.has('subcategoria') && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scroll-x-safe">
                    {TIENDA_CATS.map(c => (
                      <Pill key={c.value} label={c.label} active={filters.category === c.value} onClick={() => setCat(c.value)} />
                    ))}
                  </div>
                )}
                {tiendaCat && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                    <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{tiendaCat.label}</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scroll-x-safe">
                      {tiendaCat.subcategories.map(sub => (
                        <Pill key={sub} label={sub} active={filters.subcategory === sub} onClick={() => setSub(sub)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <button onClick={() => toggle('subcategoria')} className="w-full flex items-center justify-between mb-2 text-left">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Subcategoría</span>
                  <ChevronDown size={15} style={{ color: 'var(--text-tertiary)', transform: openSecs.has('subcategoria') ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--t-base)' }} />
                </button>
                {openSecs.has('subcategoria') && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scroll-x-safe">
                    {subOptions.map(sub => (
                      <Pill key={sub} label={sub} active={filters.subcategory === sub} onClick={() => setSub(sub)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}
