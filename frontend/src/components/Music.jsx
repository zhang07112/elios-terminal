import { useState, useEffect } from 'react'

export default function Music({ api }) {
  const [songs, setSongs] = useState([])
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {       const r = await fetch(`${api}/music`); const d = await r.json(); setSongs(Array.isArray(d) ? d : d.music || []) }
      catch { setSongs([]) }
    })()
  }, [])

  const addSong = async () => {
    if (!title.trim() || !artist.trim()) return
    try {
      const r = await fetch(`${api}/music`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), artist: artist.trim() }) })
      const d = await r.json()
      setSongs(prev => [d.music, ...prev])
      setTitle(''); setArtist(''); setShowForm(false)
    } catch {}
  }

  return (
    <div className="memories-panel">
      <div className="memories-header">
        <div><h2>🎵 音乐</h2><p>属于你和Elios的歌单</p></div>
        <button onClick={() => setShowForm(!showForm)} className="send-btn" style={{ padding: '8px 18px', fontSize: 13 }}>{showForm ? '取消' : '+ 添加歌曲'}</button>
      </div>
      {showForm && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: 16, background: 'var(--color-surface-elevated)', borderRadius: 16, border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="歌曲名" className="input-field" style={{ flex: 1, minWidth: 120 }} />
          <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="歌手" className="input-field" style={{ flex: 1, minWidth: 120 }} />
          <button onClick={addSong} disabled={!title.trim() || !artist.trim()} className="send-btn" style={{ padding: '8px 18px', fontSize: 13 }}>保存</button>
        </div>
      )}
      {songs.length === 0 ? (
        <div className="memories-empty">
          <div className="empty-icon">🎶</div>
          <h3>还没有音乐</h3>
          <p>添加你和Elios喜欢的歌吧</p>
        </div>
      ) : (
        <div className="memory-list">
          {songs.map((s, i) => (
            <div key={s.id || i} className="memory-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', flexShrink: 0 }}>♪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>{s.title || s.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{s.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
