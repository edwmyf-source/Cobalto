import { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutList, MessageSquare, Bell, Calculator, Plus, LogOut, User, HelpCircle, Lock, ChevronRight, ChevronDown, Mail, Home, Users, Search } from 'lucide-react'
import Topbar from './Topbar'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../lib/constants'
import { getUnreadCount } from '../../api/notifications'
import { getUnreadMessageCount } from '../../api/messages'
import { useRealtime } from '../../hooks/useRealtime'
import { signOut } from '../../api/auth'
import { publicName } from '../../lib/helpers'
import useHideOnScroll from '../../lib/useHideOnScroll'
import { hoverProps } from '../../lib/hover'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'

export default function AppLayout() {
  const { session, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMsgs, setUnreadMsgs] = useState(0)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  // Desde dónde se abrió el menú: 'top' lo despliega bajo la barra superior,
  // 'bottom' lo despliega sobre la barra de navegación inferior.
  const [menuAnchor, setMenuAnchor] = useState('bottom')
  const menuRef = useRef(null)
  const profileBtnRef = useRef(null)
  const greetBtnRef = useRef(null)
  const navVisible = useHideOnScroll({ disabled: profileMenuOpen, resetKey: location.pathname })

  const currentTab = '/' + (location.pathname.split('/')[1] || 'feed')
  const lastFetchRef = useRef(0)
  const myId = session?.user?.id
  const name = publicName(profile)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const refreshUnread = useCallback((force = false) => {
    const now = Date.now()
    if (!force && now - lastFetchRef.current < 30_000) return
    lastFetchRef.current = now
    if (session?.user?.id) {
      getUnreadCount(session.user.id).then(setUnreadCount).catch(() => {})
      getUnreadMessageCount(session.user.id).then(setUnreadMsgs).catch(() => {})
    }
  }, [session?.user?.id])

  // Al entrar o salir de la bandeja se fuerza el refresco: si no, el throttle
  // de 30s dejaba el badge en el número viejo después de leer los mensajes.
  useEffect(() => {
    refreshUnread(location.pathname.startsWith('/chats'))
  }, [refreshUnread, location.pathname])

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
      // Hay dos disparadores del mismo menú (el saludo de arriba y el botón
      // Perfil de abajo); ninguno debe contar como "clic afuera", o el menú
      // se cerraría en el mismo gesto que lo abre.
      const insideMenu  = menuRef.current?.contains(e.target)
      const onNavBtn    = profileBtnRef.current?.contains(e.target)
      const onGreetBtn  = greetBtnRef.current?.contains(e.target)
      if (!insideMenu && !onNavBtn && !onGreetBtn) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [profileMenuOpen])

  useEffect(() => { setProfileMenuOpen(false) }, [location.pathname])

  const profileMenuItems = [
    { label: 'Mi perfil', icon: User, path: myId ? `/u/${myId}` : '/profile' },
    { label: 'Notificaciones', icon: Bell, path: '/notifications', badge: unreadCount },
    { label: 'Contáctanos', icon: Mail, path: '/contacto' },
    ...(isAdmin(profile) ? [{ label: 'Admin', icon: Lock, path: '/admin' }] : []),
  ]

  const mobileNavItems = [
    { id: '/feed',          label: 'Feed',     icon: LayoutList },
    { id: '/chats',         label: 'Mensajes', icon: MessageSquare },
    { id: '/notifications', label: 'Notificaciones',  icon: Bell, badge: unreadCount },
  ]

  // Contenido del menú de cuenta. Se define una sola vez y se monta en la
  // posición que corresponda según desde dónde se haya abierto.
  const profileMenuContent = (
    <>
      <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <p className="t-body-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
        <p className="t-caption truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {session?.user?.email?.endsWith('@phone.redcobalto.com') ? profile?.phone : session?.user?.email}
        </p>
      </div>
      {profileMenuItems.map(item => {
        const Icon = item.icon
        const isProfile = item.label === 'Mi perfil'
        return (
          <button key={item.path} onClick={() => { navigate(item.path); setProfileMenuOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 t-body-sm font-medium transition-colors duration-[160ms] rounded-input"
            style={isProfile
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--text-primary)' }}
            role="menuitem"
            {...(!isProfile ? hoverProps(
              e => e.currentTarget.style.background = 'var(--bg-subtle)',
              e => e.currentTarget.style.background = 'transparent',
            ) : {})}>
            <Icon size={18} strokeWidth={2} style={{ color: isProfile ? '#fff' : 'var(--text-tertiary)' }} />
            {item.label}
            {!!item.badge && (
              <span className="ml-auto text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[18px] text-center leading-5 tnum"
                style={{ background: isProfile ? 'rgba(255,255,255,0.3)' : 'var(--error)' }}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
            <ChevronRight size={16} className="ml-auto" style={{ color: isProfile ? 'rgba(255,255,255,0.75)' : 'var(--text-tertiary)' }} />
          </button>
        )
      })}
      <div style={{ borderTop: '1px solid var(--border-soft)' }}>
        <button onClick={() => signOut()} role="menuitem"
          className="w-full flex items-center gap-3 px-4 py-3 t-body-sm font-medium transition-colors duration-[160ms]"
          style={{ background: 'var(--error)', color: '#fff' }}>
          <LogOut size={18} strokeWidth={2} />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-app" style={{ background: 'var(--bg-app)' }}>

      {/* ── Topbar LinkedIn — visible solo en desktop ── */}
      <div className="hidden md:block">
        <Topbar profile={profile} unreadCount={unreadCount} session={session} />
      </div>

      {/* ── Topbar móvil fija ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{ background: 'linear-gradient(180deg, var(--accent-deep) 0%, #10213A 100%)', height: '56px', boxShadow: '0 1px 0 rgba(255,255,255,.08)' }}>
        <RedCobaltoLogo size="md" dark />
        <button
          ref={greetBtnRef}
          onClick={() => { setMenuAnchor('top'); setProfileMenuOpen(o => !(o && menuAnchor === 'top')) }}
          aria-label="Abrir menú de cuenta"
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          className="flex items-center gap-1.5 max-w-[52%] rounded-pill px-3 py-1.5 -mr-1 transition-all active:scale-[0.97]"
          style={{ background: profileMenuOpen ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)',
                   border: '1px solid rgba(255,255,255,0.16)',
                   backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-inverse)' }}>
            {name.split(' ')[0]}
          </span>
          <ChevronDown size={15} strokeWidth={2.4}
            style={{ color: 'rgba(255,255,255,0.75)', flexShrink: 0,
                     transform: profileMenuOpen && menuAnchor === 'top' ? 'rotate(180deg)' : 'none',
                     transition: 'transform 160ms ease' }} />
        </button>
      </div>

      {/* Menú desplegado hacia ABAJO, justo bajo la barra superior */}
      {profileMenuOpen && menuAnchor === 'top' && (
        <div ref={menuRef}
          className="md:hidden fixed right-4 rounded-panel overflow-hidden modal-enter z-50"
          style={{ top: 62, background: 'var(--surface)', boxShadow: 'var(--shadow-dropdown)',
                   border: '1px solid var(--border-soft)', minWidth: 248 }}
          role="menu">
          {profileMenuContent}
        </div>
      )}

      {/* ── Nav móvil flotante (glass) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ pointerEvents: 'none',
          transform: navVisible ? 'translateY(0)' : 'translateY(120%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)' }}>

        {profileMenuOpen && menuAnchor === 'bottom' && (
          <div ref={menuRef} className="absolute bottom-full right-4 mb-3 rounded-panel overflow-hidden modal-enter"
            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-dropdown)', border: '1px solid var(--border-soft)', minWidth: 248, pointerEvents: 'auto' }}
            role="menu">
            {profileMenuContent}
          </div>
        )}

        <div className="flex items-center justify-around px-2"
          style={{ height: 64, paddingBottom: 'env(safe-area-inset-bottom)', boxSizing: 'content-box',
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border)', pointerEvents: 'auto' }}>

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
              className="flex flex-col items-center justify-center gap-[1px] flex-1 h-full relative active:scale-95 transition-transform"
              aria-label={unreadMsgs > 0 ? `Mensajes, ${unreadMsgs} sin leer` : 'Mensajes'}>
              <div className="relative">
                <MessageSquare size={22} style={{ color: active ? 'var(--accent-deep)' : 'var(--text-tertiary)' }} strokeWidth={active ? 2.4 : 2} />
                {unreadMsgs > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[17px] text-center leading-[17px] tnum"
                    style={{ background: 'var(--error)' }}>
                    {unreadMsgs > 99 ? '99+' : unreadMsgs}
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
              style={{ background: 'var(--accent)', boxShadow: '0 10px 24px rgba(36,87,197,.28)' }}>
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
          <button ref={profileBtnRef} onClick={() => { setMenuAnchor('bottom'); setProfileMenuOpen(o => !(o && menuAnchor === 'bottom')) }}
            className="flex flex-col items-center justify-center gap-[1px] flex-1 h-full relative active:scale-95 transition-transform" aria-label="Perfil">
            <User size={22} style={{ color: profileMenuOpen ? 'var(--accent-deep)' : 'var(--text-tertiary)' }} strokeWidth={profileMenuOpen ? 2.4 : 2} />
            <span className="t-caption font-medium" style={{ color: profileMenuOpen ? 'var(--accent-deep)' : 'var(--text-tertiary)' }}>Perfil</span>
          </button>

        </div>
      </div>

      {/* ── Contenido principal ── */}
      <main className="pt-[56px] md:pt-0 pb-24 md:pb-8" style={{ overflowX: 'clip' }}>
        <Outlet />
      </main>
    </div>
  )
}
