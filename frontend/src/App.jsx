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

  const [batteryLevel] = useState(78)

  return (
    <div className="phone-frame" id="phone-screen">
      <div className="status-bar">
        <span id="status-bar-time" />
        <div className="status-icons">
          <div className="battery-container">
            <span className="battery-text">{batteryLevel}%</span>
            <div className="battery-icon">
              <div className="battery-level" style={{ width: `${batteryLevel}%` }} />
            </div>
          </div>
        </div>
      </div>
      {renderApp()}
    </div>
  )
}
