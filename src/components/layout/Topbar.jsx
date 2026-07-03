import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, profile, unreadCount = 0 }) {
  const navigate = useNavigate()
  const initials = (profile?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-8"
      style={{ background: '#ffffff', borderBottom: '0.5px solid #e8eaef' }}>
      <h1 key={title} className="slide-in-left font-bold text-base" style={{ color: '#0d1b3e' }}>{title}</h1>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/notifications')} aria-label="Notificaciones"
          className="relative p-1.5 rounded-2xl transition-colors hover:bg-blue-50"
          style={{ color: '#1a237e' }}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <span className="text-sm font-medium hidden sm:block" style={{ color: '#0d1b3e' }}>{profile?.full_name}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: '#1a237e' }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
