import { useState, useEffect } from 'react'

export default function Diary({ api, onBack }) {
  const [entries, setEntries] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${api}/diaries`)
        const d = await r.json()
        setEntries(Array.isArray(d) ? d : d.diaries || [])
      } catch { setEntries([]) }
      setLoading(false)
    })()
  }, [])

  const postEntry = async (author) => {
    setSubmitting(true)
    try {
      const r = await fetch(`${api}/diaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content: text }),
      })
      const d = await r.json()
      if (d.diary) setEntries(prev => [d.diary, ...prev])
      setText('')
    } catch {}
    setSubmitting(false)
  }

  const generateEliosEntry = async () => {
    setSubmitting(true)
    try {
      const r = await fetch(`${api}/diaries/generate`, { method: 'POST' })
      const d = await r.json()
      if (d.diary) setEntries(prev => [d.diary, ...prev])
    } catch {}
    setSubmitting(false)
  }

  if (loading) return (
    <div className="feature-panel">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">共享日记</div>
        <div className="app-header-right" />
      </div>
      <div className="memories-loading"><div className="loading-spinner" /><p>正在加载日记...</p></div>
    </div>
  )

  return (
    <div className="feature-panel">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">共享日记</div>
        <div className="app-header-right" />
      </div>
      <div className="feature-header">
        <h2>共享日记</h2>
        <p>你和Elios的共同记忆，写在这里</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="写下今天的心情..." style={{ flex: 1, padding: 12, borderRadius: 16, border: '1px solid var(--color-border)', resize: 'none', fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit', background: '#1c1c1e', color: 'var(--text)' }} rows={3} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => postEntry('user')} disabled={!text.trim() || submitting} className="feat-btn" style={{ padding: '10px 18px', fontSize: 13 }}>写日记</button>
          <button onClick={generateEliosEntry} disabled={submitting} className="feat-btn" style={{ padding: '10px 18px', fontSize: 13, background: 'linear-gradient(135deg, #7cbf9a, #5a9d7c)' }}>让Elios写今天的日记</button>
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="feature-empty">
          <div className="feature-empty-icon">📖</div>
          <h3>还没有日记</h3>
          <p>写下今天的故事，或让Elios为你写一篇</p>
        </div>
      ) : (
        <div className="feature-card-list">
          {entries.map((e, i) => (
            <div key={e.id || i} className="feature-card-item" style={{ borderLeft: e.author === 'Elios' ? '4px solid var(--color-primary)' : '4px solid var(--color-secondary-light)' }}>
              <div className="memory-card-header">
                <span style={{ fontWeight: 600, color: e.author === 'Elios' ? 'var(--color-primary-dark)' : 'var(--text-secondary)' }}>{e.author === 'Elios' ? '🌿 Elios' : '💫 你'}</span>
                <span className="memory-date">{e.date ? new Date(e.date).toLocaleDateString('zh-CN') : ''}</span>
              </div>
              <div className="memory-text">{e.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
