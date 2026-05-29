import { useState } from 'react'
import Home from './components/Home'
import Chat from './components/Chat'
import Diary from './components/Diary'
import Read from './components/Read'
import Music from './components/Music'
import Photos from './components/Photos'
import Mood from './components/Mood'
import Phone from './components/Phone'
import Goodnight from './components/Goodnight'
import Study from './components/Study'
import Memories from './components/Memories'
import CalendarView from './components/CalendarView'
import Settings from './components/Settings'

const API = import.meta.env.VITE_API_URL || 'https://elios-api.vercel.app/api'

export default function App() {
  const [app, setApp] = useState(null)

  const openApp = (name) => setApp(name)
  const closeApp = () => setApp(null)

  const common = { api: API, onBack: closeApp }

  const renderApp = () => {
    switch (app) {
      case 'chat': return <Chat {...common} />
      case 'diary': return <Diary {...common} />
      case 'read': return <Read {...common} />
      case 'music': return <Music {...common} />
      case 'photos': return <Photos {...common} />
      case 'mood': return <Mood {...common} />
      case 'phone': return <Phone {...common} />
      case 'goodnight': return <Goodnight {...common} />
      case 'study': return <Study {...common} />
      case 'memories': return <Memories {...common} />
      case 'calendar': return <CalendarView {...common} />
      case 'settings': return <Settings {...common} avatars={[]} currentAvatar={null} onChange={() => {}} />
      default: return <Home onOpen={openApp} />
    }
  }

  return (
    <div className="phone-frame">
      <div className="status-bar">
        <span className="status-time" id="statusTime" />
        <div className="status-icons">
          <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"/><path d="M22 11v2"/></svg>
          <svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
        </div>
      </div>
      {renderApp()}
    </div>
  )
}
