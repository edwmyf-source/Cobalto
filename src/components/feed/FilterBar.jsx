import { Search, X } from 'lucide-react'
import { useState } from 'react'
import {
  MARKETPLACE_TABS,
  TIENDA_CATS,
  NOVEDADES_SUBCATS,
  VACANTES_NIVELES,
  TAB_COLOR,
} from '../../lib/constants'

function Pill({ label, active, onClick, accentColor }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex-shrink-0 ${
        active
          ? 'text-white border-transparent'
          : 'bg-white border-ink-300 text-ink-500 hover:border-ink-400'
      }`}
      style={active ? { background: accentColor, borderColor: accentColor } : {}}
    >
      {label}
    </button>
  )
}

export default function FilterBar({ filters, setFilters }) {
  // La barra de busqueda ahora esta siempre visible

  const set     = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const tab     = filters.tab || 'todo'
  const accent  = TAB_COLOR[tab]?.color || '#7c3aed'
  const hasFilters = tab !== 'todo' || filters.subcategory || filters.search || filters.location

  const setTab = (t) => {
    const tabDef = MARKETPLACE_TABS.find(x => x.value === t)
    setFilters({ tab: t, categories: tabDef?.categories || [], subcategory: tabDef?.subcategory || '' })
    
  }

  const setCat = (v) => setFilters(f => ({ ...f, category: f.category === v ? '' : v, subcategory: '' }))
  const setSub = (v) => set('subcategory', filters.subcategory === v ? '' : v)
  const tiendaCat = TIENDA_CATS.find(c => c.value === filters.category)

  return (
    <div className="mb-2">

      {/* Barra de búsqueda */}
      <div className="px-2 mb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#7EB6FF' }} />
          <input
            value={filters.search || ''}
            onChange={e => set('search', e.target.value)}
            placeholder="Buscar en el feed..."
            className="w-full pl-10 pr-9 py-2 rounded-full text-[13px] focus:outline-none transition-colors"
            style={{ background: '#ffffff', border: '1.5px solid #CDDBEC', color: '#001A3D' }}
            onFocus={e => e.currentTarget.style.borderColor = '#001A3D'}
            onBlur={e => e.currentTarget.style.borderColor = '#CDDBEC'}
          />
          {filters.search && (
            <button onClick={() => set('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70">
              <X size={13} style={{ color: '#001A3D' }} />
            </button>
          )}
        </div>
      </div>

      {/* Pill oscura F3: ⚙ Filtros | tabs */}
      <div className="px-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: '#001A3D' }}>
          <span className="text-[11px] font-bold flex-shrink-0 flex items-center gap-1" style={{ color: '#7EB6FF', letterSpacing: '0.1em' }}>
            ⚙ Filtros
          </span>
          <div className="flex-shrink-0" style={{ width: 1, height: 16, background: 'rgba(126,182,255,0.3)' }} />
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            {MARKETPLACE_TABS.map(t => {
              const active = tab === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
                  style={{
                    background:  active ? '#FFB703' : 'transparent',
                    color:       active ? '#001A3D' : 'rgba(255,255,255,0.5)',
                    border:      active ? '1.5px solid #FFB703' : '1.5px solid rgba(126,182,255,0.25)',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
          {hasFilters && (
            <button onClick={() => setFilters({})}
              className="flex-shrink-0 text-[10px] font-bold hover:opacity-80"
              style={{ color: '#FFB703' }}>
              ✕
            </button>
          )}
        </div>
      </div>


      {/* Sub-filtros por tab */}
      {tab === 'tienda' && (
        <div className="px-2 mt-2">
          <div className="flex flex-wrap gap-1.5">
            {TIENDA_CATS.map(c => (
              <Pill key={c.value} label={c.label} active={filters.category === c.value}
                onClick={() => setCat(c.value)} accentColor={accent} />
            ))}
          </div>
          {tiendaCat && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {tiendaCat.subcategories.map(sub => (
                <Pill key={sub} label={sub} active={filters.subcategory === sub}
                  onClick={() => setSub(sub)} accentColor={accent} />
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'novedades' && (
        <div className="px-2 mt-2 flex flex-wrap gap-1.5">
          {NOVEDADES_SUBCATS.map(sub => (
            <Pill key={sub} label={sub} active={filters.subcategory === sub}
              onClick={() => setSub(sub)} accentColor={accent} />
          ))}
        </div>
      )}
      {tab === 'vacantes' && (
        <div className="px-2 mt-2 flex flex-wrap gap-1.5">
          {VACANTES_NIVELES.map(lvl => (
            <Pill key={lvl} label={lvl} active={filters.subcategory === lvl}
              onClick={() => setSub(lvl)} accentColor={accent} />
          ))}
        </div>
      )}

    </div>
  )
}
