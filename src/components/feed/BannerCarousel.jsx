import { useState, useEffect, useRef, useCallback } from 'react'
import { getActiveBanners } from '../../api/admin'

// Cache de banners: se renueva cada 5 min para no consultar en cada visita al feed
let _bannersCache = null
let _bannersTs = 0
const BANNERS_TTL = 5 * 60 * 1000

async function getActiveBannersCached() {
  if (_bannersCache && Date.now() - _bannersTs < BANNERS_TTL) return _bannersCache
  const data = await getActiveBanners()
  _bannersCache = data
  _bannersTs = Date.now()
  return data
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState(_bannersCache || [])
  const [current, setCurrent]  = useState(0)
  const trackRef  = useRef(null)
  const timerRef  = useRef(null)
  const pausedRef = useRef(false)
  const indexRef  = useRef(0)

  useEffect(() => {
    getActiveBannersCached().then(setBanners).catch(() => {})
  }, [])

  const slideTo = useCallback((idx) => {
    indexRef.current = idx
    setCurrent(idx)
    trackRef.current?.scrollTo({ left: idx * (trackRef.current.offsetWidth + 10), behavior: 'smooth' })
  }, [])

  const goTo = useCallback((idx) => {
    slideTo(Math.max(0, Math.min(idx, banners.length - 1)))
  }, [banners.length, slideTo])

  // Auto-slide cada 1 segundo, en bucle; se pausa mientras se mantiene el dedo
  useEffect(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return
      slideTo((indexRef.current + 1) % banners.length)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [banners.length, slideTo])

  if (banners.length === 0) return null

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider">De interés</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory min-w-0 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const cardW = e.currentTarget.offsetWidth + 10
          const idx = Math.round(e.currentTarget.scrollLeft / cardW)
          indexRef.current = idx
          setCurrent(idx)
        }}
        onPointerDown={() => { pausedRef.current = true }}
        onPointerUp={() => { pausedRef.current = false }}
        onPointerCancel={() => { pausedRef.current = false }}
        onPointerLeave={() => { pausedRef.current = false }}
        onTouchStart={() => { pausedRef.current = true }}
        onTouchEnd={() => { pausedRef.current = false }}
        onWheel={(e) => {
          if (e.deltaY === 0) return
          e.currentTarget.scrollLeft += e.deltaY
          e.preventDefault()
        }}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="flex-shrink-0 snap-start rounded-3xl overflow-hidden border border-ink-300"
            style={{ width: '100%', aspectRatio: '16/10' }}
          >
            <img
              src={banner.image_url}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300"
              style={{
                height: '5px',
                width: current === i ? '16px' : '5px',
                borderRadius: '3px',
                background: current === i ? 'var(--accent-deep)' : 'var(--border)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              aria-label={`Ir al banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
