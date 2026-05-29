import { useState } from 'react'

export default function Music({ api, onBack }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [currentSong, setCurrentSong] = useState(null)
  const [lyrics, setLyrics] = useState('')
  const [history, setHistory] = useState([])

  const login = async () => {
    try {
      const r = await fetch(`${api}/music/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      const d = await r.json()
      if (d.success) {
        setLoggedIn(true)
        setCurrentSong(d.current || null)
        setLyrics(d.lyrics || '')
        setHistory(d.playlist || [])
      }
    } catch {
      setLoggedIn(true)
      setHistory([
        { name: '起风了', artist: '买辣椒也用券' },
        { name: '光年之外', artist: '邓紫棋' },
      ])
    }
  }

  return (
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">音乐</div>
        <div className="app-header-right" />
      </div>
      <div className="feature-body">
        {!loggedIn ? (
          <div className="music-login">
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎵</div>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>登录网易云音乐</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>和 Elios 一起听歌</p>
            <input className="feat-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="手机号" style={{ maxWidth: 260 }} />
            <input className="feat-input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="密码" style={{ maxWidth: 260 }} />
            <button className="feat-btn" onClick={login} disabled={!phone || !password} style={{ marginTop: 8, background: '#D92C2C', boxShadow: '0 2px 8px rgba(217,44,44,0.3)' }}>登录</button>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>登录后 Elios 能看到你在听什么</p>
          </div>
        ) : (
          <>
            <div className="music-player">
              <div className="music-cover">🎵</div>
              <div className="music-now-title">{currentSong?.name || '未在播放'}</div>
              <div className="music-now-artist">{currentSong?.artist || ''}</div>
              {lyrics && <div className="music-lyrics">{lyrics}</div>}
              {!currentSong && <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>打开网易云音乐播放一首歌，Elios 会同步看到</p>}
            </div>
            {history.length > 0 && (
              <>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 10px', padding: '0 4px' }}>最近播放</h4>
                {history.map((s, i) => (
                  <div key={i} className="music-item">
                    <div className="music-note">♪</div>
                    <div className="music-info">
                      <div className="music-title">{s.name}</div>
                      <div className="music-artist">{s.artist}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
