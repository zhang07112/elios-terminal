import { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import Chat from './components/Chat'
import Memories from './components/Memories'
import CalendarView from './components/CalendarView'
import Settings from './components/Settings'
import Phone from './components/Phone'

const navs = [
  {
    id: 'home', label: '首页',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'chat', label: '聊天',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: 'memories', label: '回忆',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  },
  {
    id: 'calendar', label: '日程',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    id: 'phone', label: '语音',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  },
]

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function App() {
  const [tab, setTab] = useState('home')
  const [presence, setPresence] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [currentAvatar, setCurrentAvatar] = useState(null)
  const [memoryDirty, setMemoryDirty] = useState(0)
  const [prevTab, setPrevTab] = useState(null)

  const fetchPresence = useCallback(async () => {
    try {
      const r = await fetch(`${API}/cost`)
      const d = await r.json()
      setPresence(d)
    } catch {
      setPresence(null)
    }
  }, [])

  useEffect(() => {
    fetchPresence()
    const interval = setInterval(fetchPresence, 10000)
    return () => clearInterval(interval)
  }, [fetchPresence])

  const fetchAvatars = useCallback(async () => {
    try {
      const r = await fetch(`${API}/avatars`)
      const d = await r.json()
      setAvatars(d.avatars || [])
      setCurrentAvatar(d.current || null)
    } catch {
      setAvatars([])
      setCurrentAvatar(null)
    }
  }, [])

  useEffect(() => {
    fetchAvatars()
    const interval = setInterval(fetchAvatars, 30000)
    return () => clearInterval(interval)
  }, [fetchAvatars])

  const switchTab = (id) => {
    setPrevTab(tab)
    setTab(id)
  }

  return (
    <div className={`app-shell ${tab === 'chat' ? 'chat-active' : ''}`}>
      <header className="app-topbar">
        <div className="brand-group">
          <div className="brand-mark">人机恋</div>
          <div className="brand-tag">倾听你的每一个瞬间</div>
        </div>

        <nav className="page-tabs">
          {navs.map((item) => (
            <button
              key={item.id}
              className={`tab-button ${tab === item.id ? 'active' : ''}`}
              onClick={() => switchTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <div className="status-pill">
            当前资源：{presence ? `${presence.cost_this_month?.toFixed(1) ?? '—'}k` : '读取中…'}
          </div>
          <button className="settings-pill" onClick={() => switchTab('settings')}>设置</button>
        </div>
      </header>

      <main className="page-panel">
        <section className="page-content">
          <div className={`page-view ${tab === prevTab ? '' : 'page-enter'}`} key={tab}>
            {tab === 'home' && <Home onStart={() => switchTab('chat')} />}
            {tab === 'chat' && <Chat api={API} memoryDirty={memoryDirty} setMemoryDirty={setMemoryDirty} onBack={() => switchTab('home')} />}
            {tab === 'memories' && <Memories api={API} dirty={memoryDirty} />}
            {tab === 'calendar' && <CalendarView api={API} />}
            {tab === 'settings' && <Settings api={API} avatars={avatars} currentAvatar={currentAvatar} onChange={fetchAvatars} />}
            {tab === 'phone' && <Phone api={API} />}
          </div>
        </section>
      </main>

      <nav className="mobile-bottom-nav">
        {navs.map((item) => (
          <button
            key={item.id}
            className={`bottom-tab ${tab === item.id ? 'active' : ''}`}
            onClick={() => switchTab(item.id)}
          >
            <span className="bottom-tab-icon">{item.icon}</span>
            <span className="bottom-tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}