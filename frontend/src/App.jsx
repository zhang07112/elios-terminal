import { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import Chat from './components/Chat'
import Memories from './components/Memories'
import CalendarView from './components/CalendarView'
import Settings from './components/Settings'
import Phone from './components/Phone'

const navs = [
  { id: 'home', label: '首页' },
  { id: 'chat', label: '聊天' },
  { id: 'memories', label: '回忆' },
  { id: 'calendar', label: '日程' },
  { id: 'phone', label: '语音' },
]

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function App() {
  const [tab, setTab] = useState('home')
  const [presence, setPresence] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [currentAvatar, setCurrentAvatar] = useState(null)
  const [memoryDirty, setMemoryDirty] = useState(0)

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
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <div className="status-pill">
            当前资源：{presence ? `${presence.cost_this_month?.toFixed(1) ?? '—'}k` : '读取中…'}
          </div>
          <button className="settings-pill" onClick={() => setTab('settings')}>设置</button>
        </div>
      </header>

      <main className="page-panel">
        <section className="page-content">
          {tab === 'home' && <Home onStart={() => setTab('chat')} />}
          {tab === 'chat' && <Chat api={API} memoryDirty={memoryDirty} setMemoryDirty={setMemoryDirty} onBack={() => setTab('home')} />}
          {tab === 'memories' && <Memories api={API} dirty={memoryDirty} />}
          {tab === 'calendar' && <CalendarView api={API} />}
          {tab === 'settings' && <Settings api={API} avatars={avatars} currentAvatar={currentAvatar} onChange={fetchAvatars} />}
          {tab === 'phone' && <Phone api={API} />}
        </section>
      </main>
    </div>
  )
}
