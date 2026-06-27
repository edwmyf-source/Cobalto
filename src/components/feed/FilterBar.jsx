import { Search, X } from 'lucide-react'
import { useState } from 'react'
import {
  MARKETPLACE_TABS,
  TIENDA_CATS,
  NOVEDADES_SUBCATS,
  VACANTES_NIVELES,
  DEPARTAMENTOS_ORDERED,
  DEPARTAMENTOS_TOP3,
} from '../../lib/constants'

// Pill reutilizable
function Pill({ label, active, onClick, color = 'brand' }) {
  const colors = {
    brand:   active ? 'bg-brand-600 text-white border-brand-600'           : 'bg-white border-ink-300 text-ink-500 hover:border-ink-400',
    buscan:  active ? 'bg-warn-700 text-white border-warn-700'             : 'bg-white border-ink-300 text-ink-500 hover:border-warn-700',
    ofrecen: active ? 'bg-success-700 text-white border-success-700'       : 'bg-white border-ink-300 text-ink-500 hover:border-success-700',
    neutral: active ? 'bg-ink-900 text-white border-ink-900'               : 'bg-white border-ink-300 text-ink-500 hover:border-ink-500',
    top:     active ? 'bg-brand-600 text-white border-brand-600'           : 'bg-brand-500/5 border-brand-300 text-brand-700 hover:border-brand-500',
  }
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex-shrink-0 ${colors[color]}`}
    >
      {label}
    </button>
  )
}

export default function FilterBar({ filters, setFilters }) {
  const [searchOpen, setSearchOpen] = useState(false)

  const set  = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const tab  = filters.tab || 'todo'
  const hasFilters = tab !== 'todo' || filters.subcategory || filters.search || filters.intent || filters.location

  // Cambiar tab principal — limpia subfiltros
  const setTab = (t) => {
    const tabDef = MARKETPLACE_TABS.find(x => x.value === t)
    setFilters({
      tab: t,
      categories: tabDef?.categories || [],
    })
    setSearchOpen(false)
  }

  const setIntent = (v) => set('intent', filters.intent === v ? '' : v)
  const setCat    = (v) => setFilters(f => ({ ...f, category: f.category === v ? '' : v, subcategory: '' }))
  const setSub    = (v) => set('subcategory', filters.subcategory === v ? '' : v)
  const setLvl    = (v) => set('subcategory', filters.subcategory === v ? '' : v)
  const setLoc    = (v) => set('location', filters.location === v ? '' : v)

  const intentColor = filters.intent === 'buscan' ? 'buscan' : filters.intent === 'ofrecen' ? 'ofrecen' : 'neutral'
  const tiendaCat   = TIENDA_CATS.find(c => c.value === filters.category)

  return (
    <div className="bg-white border border-ink-300 rounded-2xl mb-2 overflow-hidden">

      {/* ── Fila superior: tabs + búsqueda + limpiar ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0">
        <div className="flex gap-1">
          {MARKETPLACE_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-2 md:px-3 py-1.5 rounded-2xl text-[11px] md:text-[12px] font-medium transition-colors ${
                tab === t.value
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-500 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => setSearchOpen(s => !s)}
            className={`p-1.5 rounded-2xl transition-colors ${
              searchOpen ? 'bg-brand-500/10 text-brand-600' : 'hover:bg-slate-50 text-ink-400'
            }`}
          >
            <Search size={14} />
          </button>
          {hasFilters && (
            <button
              onClick={() => { setFilters({}); setSearchOpen(false) }}
              className="text-[11px] text-brand-600 hover:underline font-medium"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ── Buscador ── */}
      {searchOpen && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={filters.search || ''}
              onChange={e => set('search', e.target.value)}
              placeholder="Buscar en el feed..."
              autoFocus
              className="w-full pl-8 pr-7 py-2 rounded-2xl border border-ink-200 text-[12px] focus:outline-none focus:border-brand-500 bg-ink-50"
            />
            {filters.search && (
              <button onClick={() => set('search', '')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ TIENDA ══ */}
      {tab === 'tienda' && (
        <>
          {/* Nivel 1: Buscan / Ofrecen */}
          <div className="flex gap-2 px-3 py-2 border-t border-ink-100">
            <Pill label="Buscan"  active={filters.intent === 'buscan'}  onClick={() => setIntent('buscan')}  color="buscan" />
            <Pill label="Ofrecen" active={filters.intent === 'ofrecen'} onClick={() => setIntent('ofrecen')} color="ofrecen" />
          </div>

          {/* Nivel 2: Productos / Servicios */}
          <div className="flex gap-2 px-3 pb-2 border-t border-ink-100 pt-1.5">
            {TIENDA_CATS.map(c => (
              <Pill
                key={c.value}
                label={c.label}
                active={filters.category === c.value}
                onClick={() => setCat(c.value)}
                color={filters.intent === 'buscan' ? 'buscan' : filters.intent === 'ofrecen' ? 'ofrecen' : 'neutral'}
              />
            ))}
          </div>

          {/* Nivel 3: Subcategorías — solo si hay categoría seleccionada */}
          {tiendaCat && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2 border-t border-ink-100 pt-1.5">
              {tiendaCat.subcategories.map(sub => (
                <Pill
                  key={sub}
                  label={sub}
                  active={filters.subcategory === sub}
                  onClick={() => setSub(sub)}
                  color={filters.intent === 'buscan' ? 'buscan' : filters.intent === 'ofrecen' ? 'ofrecen' : 'brand'}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ NOVEDADES ══ */}
      {tab === 'novedades' && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-ink-100">
          {NOVEDADES_SUBCATS.map(sub => (
            <Pill
              key={sub}
              label={sub}
              active={filters.subcategory === sub}
              onClick={() => setSub(sub)}
              color="brand"
            />
          ))}
        </div>
      )}

      {/* ══ VACANTES ══ */}
      {tab === 'vacantes' && (
        <>
          {/* Nivel 1: Nivel del cargo */}
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-ink-100">
            {VACANTES_NIVELES.map(lvl => (
              <Pill
                key={lvl}
                label={lvl}
                active={filters.subcategory === lvl}
                onClick={() => setLvl(lvl)}
                color="brand"
              />
            ))}
          </div>

          {/* Nivel 2: Departamento — top 3 destacados + resto */}
          <div className="flex flex-wrap gap-1.5 px-3 pb-2 border-t border-ink-100 pt-1.5 min-w-0">
            {DEPARTAMENTOS_TOP3.map(dep => (
              <Pill
                key={dep}
                label={dep}
                active={filters.location === dep}
                onClick={() => setLoc(dep)}
                color="top"
              />
            ))}
            {DEPARTAMENTOS_ORDERED.filter(d => !DEPARTAMENTOS_TOP3.includes(d)).map(dep => (
              <Pill
                key={dep}
                label={dep}
                active={filters.location === dep}
                onClick={() => setLoc(dep)}
                color="brand"
              />
            ))}
          </div>
        </>
      )}

    </div>
  )
}
