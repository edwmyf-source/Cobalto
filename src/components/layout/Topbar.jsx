import { Bell, Search, Plus, Pencil, LayoutList, MessageSquare, Mail, User, HelpCircle, Lock, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { signOut } from '../../api/auth'
import { publicName } from '../../lib/helpers'
import { isAdmin } from '../../lib/constants'
import RedCobaltoLogo from '../shared/RedCobaltoLogo'

export default function Topbar({ profile, unreadCount = 0, session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const name = publicName(profile)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const currentTab = '/' + (location.pathname.split('/')[1] || 'feed')

  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!menuOpen) return
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('pointerdown', h)
    return () => document.removeEventListener('pointerdown', h)
  }, [menuOpen])

  const navItems = [
    { id: '/feed',          label: 'Feed',          Icon: LayoutList },
    { id: '/chats',         label: 'Inbox',         Icon: MessageSquare },
    { id: '/notifications', label: 'Notificaciones', Icon: Bell, badge: unreadCount },
  ]

  const menuItems = [
    { label: 'Mi perfil',     Icon: User,         path: session?.user?.id ? `/u/${session.user.id}` : '/profile' },
    { label: 'Contáctanos', Icon: Mail, path: '/contacto' },
    ...(isAdmin(profile, session?.user?.email) ? [{ label: 'Admin', Icon: Lock, path: '/admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-40 w-full"
      style={{ background: 'rgba(255,255,255,0.96)', borderBottom: '1px solid var(--border-soft)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="max-w-[1500px] mx-auto h-14 flex items-center gap-4 px-4 md:px-10">

        {/* Logo */}
        <button onClick={() => navigate('/feed')} className="flex items-center flex-shrink-0 rc-focus rounded-xl">
          <RedCobaltoLogo size="lg" />
        </button>

        {/* Buscador */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs min-w-0"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <Search size={15} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>Buscar en REDCOBALTO...</span>
        </div>

        <div className="flex-1" />

        {/* Nav central */}
        <nav className="flex items-stretch h-14">
          {navItems.map(({ id, label, Icon, badge }) => {
            const active = currentTab === id
            return (
              <button key={id} onClick={() => navigate(id)}
                className="relative flex flex-col items-center justify-center gap-0.5 px-4 transition-colors border-b-2 hover:bg-gray-50"
                style={{ borderBottomColor: active ? 'var(--accent)' : 'transparent', minWidth: 64 }}>
                <div className="relative">
                  <Icon size={18} color={active ? 'var(--accent)' : 'var(--text-tertiary)'} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Saludo */}
        <span className="text-sm font-medium hidden md:block flex-shrink-0" style={{ color: 'var(--accent-deep)' }}>
          Hola, {name.split(' ')[0]} 👋
        </span>

        {/* Divider */}
        <div className="w-px h-7 flex-shrink-0" style={{ background: 'var(--border)' }} />

        {/* Avatar + dropdown */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors hover:bg-gray-50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--accent-deep)' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} loading="lazy" decoding="async" className="w-7 h-7 rounded-full object-cover" alt={name} />
                : initials}
            </div>
            <span className="text-[11px] font-medium flex items-center gap-0.5" style={{ color: 'var(--accent)' }}>
              Yo <ChevronDown size={10} />
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(13,27,62,0.18)', minWidth: 200 }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--accent-deep)' }}>{name}</p>
                <p className="text-xs" style={{ color: 'var(--accent)' }}>
                  {session?.user?.email?.endsWith('@phone.redcobalto.com') ? profile?.phone : session?.user?.email}
                </p>
              </div>
              {menuItems.map(({ label, Icon, path }) => (
                <button key={path} onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-blue-50"
                  style={{ color: 'var(--accent-deep)' }}>
                  <Icon size={15} style={{ color: 'var(--accent-deep)' }} />
                  {label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                  style={{ color: 'var(--error)' }}>
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botón publicar */}
        <button onClick={() => navigate('/feed')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 hover:bg-blue-50"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent-deep)', boxShadow: 'var(--shadow-card)' }}>
          <Pencil size={13} />
          Publicar
        </button>

      </div>
    </header>
  )
}
