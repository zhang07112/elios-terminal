import { useState, useEffect, useRef, useCallback } from 'react'

const APPS_P1 = [
  { id: 'chat', label: 'Elios', icon: '/icons/message.svg', gradient: 'linear-gradient(135deg,#FF9500,#FF6B35)' },
  { id: 'diary', label: '日记', icon: '/icons/diary.svg', gradient: 'linear-gradient(135deg,#FF2D55,#FF6482)' },
  { id: 'read', label: '阅读', icon: '/icons/read.svg', gradient: 'linear-gradient(135deg,#007AFF,#00C7FF)' },
  { id: 'music', label: '音乐', icon: '/icons/music.svg', gradient: 'linear-gradient(135deg,#6366F1,#A78BFA)' },
  { id: 'photos', label: '照片', icon: '/icons/photos.svg', gradient: 'linear-gradient(135deg,#34C759,#30D158)' },
  { id: 'mood', label: '心情', icon: '/icons/mood.svg', gradient: 'linear-gradient(135deg,#FF3B30,#FF6B6B)' },
]

const APPS_P2 = [
  { id: 'phone', label: '通话', icon: '/icons/phone.svg', gradient: 'linear-gradient(135deg,#34C759,#20A349)' },
  { id: 'goodnight', label: '晚安', icon: '/icons/goodnight.svg', gradient: 'linear-gradient(135deg,#5856D6,#7C6CE6)' },
  { id: 'study', label: '学习', icon: '/icons/study.svg', gradient: 'linear-gradient(135deg,#00C7BE,#34E0D0)' },
  { id: 'memories', label: '记忆', icon: '/icons/memories.svg', gradient: 'linear-gradient(135deg,#8B7355,#C4A882)' },
  { id: 'calendar', label: '日程', icon: '/icons/calendar.svg', gradient: 'linear-gradient(135deg,#FF9500,#FFB340)' },
  { id: 'settings', label: '设置', icon: '/icons/settings.svg', gradient: 'linear-gradient(135deg,#AEAEB2,#8E8E93)' },
]

const DOCK = [
  { id: 'chat', label: 'Elios', icon: '/icons/message.svg', gradient: 'linear-gradient(135deg,#FF9500,#FF6B35)' },
  { id: 'diary', label: '日记', icon: '/icons/diary.svg', gradient: 'linear-gradient(135deg,#FF2D55,#FF6482)' },
  { id: 'music', label: '音乐', icon: '/icons/music.svg', gradient: 'linear-gradient(135deg,#6366F1,#A78BFA)' },
  { id: 'read', label: '阅读', icon: '/icons/read.svg', gradient: 'linear-gradient(135deg,#007AFF,#00C7FF)' },
]

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function Home({ onOpen }) {
  const [page, setPage] = useState(0)
  const [timeStr, setTimeStr] = useState('')
  const [wallpaper, setWallpaper] = useState(() => {
    try { return localStorage.getItem('elios-wallpaper') || '' } catch { return '' }
  })
  const trackRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const pageWidth = useRef(0)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    update()
    const t = setInterval(update, 10000)
    const t2 = setInterval(() => {
      try {
        document.getElementById('status-bar-time').textContent =
          new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
      } catch {}
    }, 1000)
    return () => { clearInterval(t); clearInterval(t2) }
  }, [])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    if (trackRef.current) pageWidth.current = trackRef.current.offsetWidth
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) > 40 && dy < Math.abs(dx) * 0.5) {
      setPage(p => dx < 0 ? Math.min(1, p + 1) : Math.max(0, p - 1))
    }
  }, [])

  const wallStyle = wallpaper ? { backgroundImage: `url(${wallpaper})` } : {}

  const renderIcon = (app) => (
    <button key={app.id} className="app-icon" onClick={() => onOpen(app.id)}>
      <div className="app-icon-bg" style={{ background: app.gradient }}>
        <img src={app.icon} alt={app.label} style={{ width: 28, height: 28 }} />
      </div>
      <span className="app-icon-label">{app.label}</span>
    </button>
  )

  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const w = WEEKDAYS[today.getDay()]

  return (
    <>
      <div className="wallpaper" style={wallStyle} />
      <div className="wallpaper-overlay" />
      <div className="home-screen">
        <div className="home-date">
          <div className="home-date-day">{y}.{m}.{d}</div>
          <div className="home-date-week">星期{w}</div>
        </div>
        <div className="home-pages" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="home-pages-track" ref={trackRef} style={{ transform: `translateX(-${page * 100}%)` }}>
            <div className="home-page">
              <div className="app-grid">{APPS_P1.map(renderIcon)}</div>
            </div>
            <div className="home-page">
              <div className="app-grid">{APPS_P2.map(renderIcon)}</div>
            </div>
          </div>
        </div>
        <div className="page-dots">
          <button className={`page-dot ${page === 0 ? 'active' : ''}`} onClick={() => setPage(0)} />
          <button className={`page-dot ${page === 1 ? 'active' : ''}`} onClick={() => setPage(1)} />
        </div>
      </div>
      <div className="dock">
        <div className="dock-bg">{DOCK.map(renderIcon)}</div>
      </div>
    </>
  )
}
