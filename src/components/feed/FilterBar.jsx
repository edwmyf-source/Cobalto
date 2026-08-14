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

function StepBadge({ n }) {
  return (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
      style={{ width: 18, height: 18, background: 'var(--brand-red)', color: '#fff',
        fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
      {n}
    </span>
  )
}

function Section({ title, value, open, onToggle, collapsible = true, step, children }) {
  return (
    <div>
      {title && (
        collapsible ? (
          <button
            onClick={onToggle}
            className="relative w-full flex items-center justify-center gap-2 px-4 pt-2.5 pb-0.5"
            aria-expanded={open}
          >
            {step && <StepBadge n={step} />}
            <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>{title}</span>
            {value && <span className="t-caption font-medium" style={{ color: 'var(--accent)' }}>{value}</span>}
            <ChevronDown size={16} strokeWidth={2}
              style={{ color: 'var(--text-tertiary)', transition: 'transform var(--t-base)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
        ) : (
          // Sin flecha ni comportamiento de clic: es solo un rótulo, esta
          // sección siempre está visible y no se puede colapsar.
          <div className="relative w-full flex items-center justify-center px-4 pt-2.5 pb-0.5">
            {step && <StepBadge n={step} />}
            <span className="t-eyebrow" style={{ color: 'var(--text-tertiary)' }}>{title}</span>
          </div>
        )
      )}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s cubic-bezier(0.4,0,0.2,1)',
        alignItems: 'start',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className={`px-4 pb-2.5 ${title ? 'pt-0' : 'pt-2.5'} flex flex-wrap items-center justify-center gap-1`}>
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
    <div className="mb-4">

      {/* Franja navy que continúa la cabecera: el buscador flota sobre su borde */}
      <div className="-mx-4 md:hidden" style={{ height: 34, marginTop: -1, background: 'var(--accent-deep)' }} />

      {/* Buscador flotante */}
      <div className="relative mb-3 z-[5]" style={{ marginTop: -22 }}>
        <Search size={17} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-tertiary)' }} />
        <input
          ref={searchRef}
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          placeholder="Buscar en Red Cobalto"
          aria-label="Buscar en Red Cobalto"
          className="w-full h-[44px] pl-11 pr-10 rounded-input t-body-sm transition-all duration-[160ms] ease-premium"
          style={{ background: 'var(--surface)', color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-raised)' }}
          onFocus={e => e.currentTarget.style.boxShadow = 'var(--shadow-raised), 0 0 0 3px var(--accent-soft)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'var(--shadow-raised)'}
        />
        {filters.search && (
          <button onClick={() => set('search', '')} aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            {...hoverProps(
              e => e.currentTarget.style.background = 'var(--bg-subtle)',
              e => e.currentTarget.style.background = 'transparent',
            )}>
            <X size={15} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      <Panel className="overflow-hidden mb-4">

        {hasFilters && (
          <div className="flex justify-center px-4 pt-3 pb-0">
            <button
              onClick={() => { setFilters({}); setOpenSecs(new Set(['categoria'])) }}
              className="t-body-sm font-medium transition-opacity duration-[160ms] hover:opacity-70"
              style={{ color: 'var(--accent)' }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Sección: Categoría — siempre visible, con rótulo fijo (no se colapsa) */}
        <Section
          title="Categoría"
          value={null}
          open={true}
          onToggle={() => {}}
          collapsible={false}
          step={1}
        >
          {MARKETPLACE_TABS.map(t => (
            <Pill key={t.value} label={t.label} size="lg"
              active={tab === t.value}
              onClick={() => { setTab(t.value); if (t.value !== 'todo') setOpenSecs(prev => { const n = new Set(prev); n.add('subcategoria'); return n }) }} />
          ))}
        </Section>

        {/* Sección: Subcategoría (solo si el tab tiene sub-opciones) */}
        {tab === 'tienda' && (
          <div style={{ borderTop: '1px solid var(--border-soft)' }}>
            <Section
              title="Subcategoría"
              value={filters.category ? TIENDA_CATS.find(c=>c.value===filters.category)?.label : null}
              open={openSecs.has('subcategoria')}
              onToggle={() => toggle('subcategoria')}
              step={2}
            >
              {TIENDA_CATS.map(c => (
                <Pill key={c.value} label={c.label}
                  active={filters.category === c.value}
                  onClick={() => { setCat(c.value); setOpenSecs(prev => { const n = new Set(prev); n.add('subcategoria'); return n }) }} />
              ))}
            </Section>

            {tiendaCat && (
              <div style={{ borderTop: '1px solid var(--border-soft)' }}>
                <Section title={tiendaCat.label} open={true} onToggle={() => {}} collapsible={false} step={3}>
                  {tiendaCat.subcategories.map(sub => (
                    <Pill key={sub} label={sub}
                      active={filters.subcategory === sub}
                      onClick={() => setSub(sub)} />
                  ))}
                </Section>
              </div>
            )}
          </div>
        )}

        {subOptions.length > 0 && tab !== 'tienda' && (
          <div style={{ borderTop: '1px solid var(--border-soft)' }}>
            <Section
              title="Subcategoría"
              value={filters.subcategory || null}
              open={openSecs.has('subcategoria')}
              onToggle={() => toggle('subcategoria')}
              step={2}
            >
              {subOptions.map(sub => (
                <Pill key={sub} label={sub}
                  active={filters.subcategory === sub}
                  onClick={() => setSub(sub)} />
              ))}
            </Section>
          </div>
        )}

      </Panel>

    </div>
  )
}
