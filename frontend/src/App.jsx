import { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import Chat from './components/Chat'
import Diary from './components/Diary'
import CalendarView from './components/CalendarView'
import Memories from './components/Memories'
import Study from './components/Study'
import Music from './components/Music'
import Photos from './components/Photos'
import Mood from './components/Mood'
import Goodnight from './components/Goodnight'
import Read from './components/Read'
import Phone from './components/Phone'
import Settings from './components/Settings'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function App() {
  const [app, setApp] = useState('home')
  const [presence, setPresence] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [currentAvatar, setCurrentAvatar] = useState(null)
  const [memoryDirty, setMemoryDirty] = useState(0)
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setTime(d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    update()
    const i = setInterval(update, 10000)
    return () => clearInterval(i)
  }, [])

  const fetchPresence = useCallback(async () => {
    try { const r = await fetch(`${API}/cost`); const d = await r.json(); setPresence(d) }
    catch { setPresence(null) }
  }, [])

  useEffect(() => { fetchPresence(); const i = setInterval(fetchPresence, 10000); return () => clearInterval(i) }, [fetchPresence])
  useEffect(() => {
    const f = async () => {
      try { const r = await fetch(`${API}/avatars`); const d = await r.json(); setAvatars(d.avatars || []); setCurrentAvatar(d.current || null) }
      catch {}
    }
    f(); const i = setInterval(f, 30000); return () => clearInterval(i)
  }, [])

  const openApp = (id) => setApp(id)

  const renderApp = () => {
    switch (app) {
      case 'home': return <Home onOpen={openApp} />
      case 'chat': return <Chat api={API} onBack={() => openApp('home')} memoryDirty={memoryDirty} setMemoryDirty={setMemoryDirty} />
      case 'diary': return <Diary api={API} onBack={() => openApp('home')} />
      case 'calendar': return <CalendarView api={API} onBack={() => openApp('home')} />
      case 'memories': return <Memories api={API} dirty={memoryDirty} onBack={() => openApp('home')} />
      case 'study': return <Study api={API} onBack={() => openApp('home')} />
      case 'music': return <Music api={API} onBack={() => openApp('home')} />
      case 'photos': return <Photos api={API} onBack={() => openApp('home')} />
      case 'mood': return <Mood api={API} onBack={() => openApp('home')} />
      case 'goodnight': return <Goodnight api={API} onBack={() => openApp('home')} />
      case 'read': return <Read api={API} onBack={() => openApp('home')} />
      case 'phone': return <Phone api={API} onBack={() => openApp('home')} />
      case 'settings': return <Settings api={API} onBack={() => openApp('home')} avatars={avatars} currentAvatar={currentAvatar} onChange={() => {}} />
      default: return <Home onOpen={openApp} />
    }
  }

  return (
    <div className="phone-frame">
      <div className="status-bar">
        <span className="status-time">{time}</span>
        <div className="status-icons">
          <svg viewBox="0 0 24 24"><rect x="1" y="6" width="20" height="12" rx="3" stroke="none"/><path d="M4 10h16v4H4z" fill="rgba(255,255,255,0.3)"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke="none"/></svg>
        </div>
      </div>
      {renderApp()}
    </div>
  )
}