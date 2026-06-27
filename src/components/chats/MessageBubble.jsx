import { timeAgo, publicName } from '../../lib/helpers'
import UserAvatar from '../shared/UserAvatar'

export default function MessageBubble({ profile, text, time, isMine, isOriginal }) {
  const name = publicName(profile)
  const seed = profile?.id || name
  const dom = profile?.email_domain || null

  if (isOriginal) {
    return (
      <div className="flex items-start gap-2.5">
        <UserAvatar seed={seed} size={30} />
        <div className="max-w-[75%]">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[11px] font-medium text-ink-900">{name}</span>
            {dom && <span className="text-[10px] font-mono text-brand-700">{dom}</span>}
            <span className="text-[10px] text-ink-500">· {timeAgo(time)}</span>
          </div>
          <div className="bg-white border border-ink-300 rounded-2xl px-3 py-2.5">
            <p className="text-[13px] text-ink-900 whitespace-pre-wrap break-words">{text}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
      <UserAvatar seed={seed} size={30} />
      <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] font-medium text-ink-900">{isMine ? 'Tú' : name}</span>
          <span className="text-[10px] text-ink-500">{timeAgo(time)}</span>
        </div>
        <div className={`rounded-2xl px-3 py-2.5 ${
          isMine ? 'bg-brand-600 text-white' : 'bg-white border border-ink-300 text-ink-900'
        }`}>
          <p className="text-[13px] whitespace-pre-wrap break-words">{text}</p>
        </div>
      </div>
    </div>
  )
}
