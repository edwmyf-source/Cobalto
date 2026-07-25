import { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutList, MessageSquare, Bell, Calculator, Plus, LogOut, User, HelpCircle, Lock, ChevronRight, FlaskConical, Home, Users, Search } from 'lucide-react'
import Topbar from './Topbar'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../lib/constants'
import { getUnreadCount } from '../../api/notifications'
import { useRealtime } from '../../hooks/useRealtime'
import { signOut } from '../../api/auth'
import { publicName } from '../../lib/helpers'
import useHideOnScroll from '../../lib/useHideOnScroll'

export default function AppLayout() {
  const { session, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const profileBtnRef = useRef(null)
  const navVisible = useHideOnScroll({ disabled: profileMenuOpen, resetKey: location.pathname })

  const currentTab = '/' + (location.pathname.split('/')[1] || 'feed')
  const lastFetchRef = useRef(0)
  const myId = session?.user?.id
  const name = publicName(profile)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const refreshUnread = useCallback(() => {
    const now = Date.now()
    if (now - lastFetchRef.current < 30_000) return
    lastFetchRef.current = now
    if (session?.user?.id) {
      getUnreadCount(session.user.id).then(setUnreadCount).catch(() => {})
    }
  }, [session?.user?.id])

  useEffect(() => { refreshUnread() }, [refreshUnread, location.pathname])

  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
    const id = idle(() => {
      import('../../pages/ChatsPage')
      import('../../pages/NotificationsPage')
      import('../../pages/UserProfilePage')
      import('../../pages/ProfilePage')
    })
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [])

  useRealtime('notifications', 'INSERT', useCallback(() => { refreshUnread() }, [refreshUnread]),
    session?.user?.id ? `user_id=eq.${session.user.id}` : null)

  useEffect(() => {
    if (!profileMenuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          profileBtnRef.current && !profileBtnRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [profileMenuOpen])

  useEffect(() => { setProfileMenuOpen(false) }, [location.pathname])

  const profileMenuItems = [
    { label: 'Mensajes', icon: MessageSquare, path: '/chats' },
    { label: 'Alertas',  icon: Bell,          path: '/notifications', badge: unreadCount },
    { label: 'Mi perfil', icon: User, path: myId ? `/u/${myId}` : '/profile' },
    { label: '¿Cuánto sabes?', icon: FlaskConical, path: '/quimica' },
    ...(isAdmin(profile, session?.user?.email) ? [{ label: 'Admin', icon: Lock, path: '/admin' }] : []),
  ]

  const mobileNavItems = [
    { id: '/feed',          label: 'Feed',     icon: LayoutList },
    { id: '/chats',         label: 'Mensajes', icon: MessageSquare },
    { id: '/notifications', label: 'Alertas',  icon: Bell, badge: unreadCount },
  ]

  return (
    <div className="min-h-screen" style={{ minHeight: '100vh', background: '#FFFFFF' }}>

      {/* ── Topbar LinkedIn — visible solo en desktop ── */}
      <div className="hidden md:block">
        <Topbar profile={profile} unreadCount={unreadCount} session={session} />
      </div>

      {/* ── Topbar móvil fija ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 h-14"
        style={{ background: 'var(--accent-deep)' }}>
        <span className="text-[20px] font-semibold" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
          Cobalto<span style={{ color: '#9CBEEE' }}>.</span>
        </span>
      </div>

      {/* ── Nav móvil flotante (glass) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ pointerEvents: 'none',
          transform: navVisible ? 'translateY(0)' : 'translateY(120%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)' }}>

        {profileMenuOpen && (
          <div ref={menuRef} className="absolute bottom-full right-4 mb-3 rounded-panel overflow-hidden modal-enter"
            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-dropdown)', border: '1px solid var(--border-soft)', minWidth: 248, pointerEvents: 'auto' }}
            role="menu">
            <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <p className="t-body-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
              <p className="t-caption truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{session?.user?.email}</p>
            </div>
            {profileMenuItems.map(item => {
              const Icon = item.icon
              return (
                <button key={item.path} onClick={() => { navigate(item.path); setProfileMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 t-body-sm font-medium transition-colors duration-[160ms]"
                  style={{ color: 'var(--text-primary)' }}
                  role="menuitem"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Icon size={18} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                  {item.label}
                  {!!item.badge && (
                    <span className="ml-auto text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[18px] text-center leading-5 tnum"
                      style={{ background: 'var(--error)' }}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} className="ml-auto" style={{ color: '#9CA3AF' }} />
                </button>
              )
            })}
            <div style={{ borderTop: '1px solid var(--border-soft)' }}>
              <button onClick={() => signOut()} role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-3 t-body-sm font-medium transition-colors duration-[160ms]"
                style={{ color: 'var(--error)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={18} strokeWidth={2} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        <div className="h-[64px] flex items-center justify-around px-2"
          style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)', pointerEvents: 'auto' }}>

          {/* Feed */}
          {(() => { const active = currentTab === '/feed'; return (
            <button onClick={() => navigate('/feed')}
              className="flex flex-col items-center justify-center gap-[1px] flex-1 h-full active:scale-95 transition-transform" aria-label="Feed">
              <Home size={22} style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }} strokeWidth={active ? 2.4 : 2} />
              <span className="t-caption font-medium" style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }}>Feed</span>
            </button>
          )})()}

          {/* Mensajes */}
          {(() => { const active = currentTab === '/chats'; return (
            <button onClick={() => navigate('/chats')}
              className="flex flex-col items-center justify-center gap-[1px] flex-1 h-full relative active:scale-95 transition-transform" aria-label="Mensajes">
              <div className="relative">
                <MessageSquare size={22} style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }} strokeWidth={active ? 2.4 : 2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[17px] text-center leading-[17px] tnum"
                    style={{ background: 'var(--error)' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="t-caption font-medium" style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }}>Msj</span>
            </button>
          )})()}

          {/* Publicar — círculo primario */}
          <div className="flex-shrink-0 px-2 flex items-center justify-center h-full">
            <button onClick={() => navigate('/feed?publish=1')} aria-label="Publicar"
              className="w-[46px] h-[46px] rounded-btn flex items-center justify-center transition-all duration-[160ms] ease-premium active:scale-[0.96]"
              style={{ background: 'var(--accent-deep)', boxShadow: 'var(--shadow-raised)' }}>
              <Plus size={22} color="#ffffff" strokeWidth={2.5} />
            </button>
          </div>

          {/* Personas */}
          {(() => { const active = currentTab === '/contacts'; return (
            <button onClick={() => navigate('/contacts')}
              className="flex flex-col items-center justify-center gap-[1px] flex-1 h-full active:scale-95 transition-transform" aria-label="Red">
              <Users size={22} style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }} strokeWidth={active ? 2.4 : 2} />
              <span className="t-caption font-medium" style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }}>Red</span>
            </button>
          )})()}

          {/* Perfil */}
          <button ref={profileBtnRef} onClick={() => setProfileMenuOpen(o => !o)}
            className="flex flex-col items-center justify-center gap-[1px] flex-1 h-full relative active:scale-95 transition-transform" aria-label="Perfil">
            <User size={22} style={{ color: profileMenuOpen ? 'var(--accent-deep)' : 'var(--text-tertiary)' }} strokeWidth={profileMenuOpen ? 2.4 : 2} />
            <span className="t-caption font-medium" style={{ color: profileMenuOpen ? 'var(--accent-deep)' : 'var(--text-tertiary)' }}>Perfil</span>
          </button>

        </div>
      </div>

      {/* ── Contenido principal ── */}
      <main className="pt-14 md:pt-0 pb-24 md:pb-8" style={{ overflowX: 'clip' }}>
        <Outlet />
      </main>
    </div>
  )
}
