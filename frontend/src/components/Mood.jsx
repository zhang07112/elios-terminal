import { useState, useEffect } from 'react'

const MOODS = [
  { emoji: '😊', name: '开心' }, { emoji: '😢', name: '难过' }, { emoji: '😰', name: '焦虑' },
  { emoji: '😌', name: '平静' }, { emoji: '🎉', name: '兴奋' }, { emoji: '😴', name: '疲惫' },
  { emoji: '❤️', name: '被爱' }, { emoji: '🙏', name: '感恩' }, { emoji: '😐', name: '一般' },
]

export default function Mood({ api }) {
  const [history, setHistory] = useState([])
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    ;(async () => {
      try { const r = await fetch(`${api}/moods`); const d = await r.json(); setHistory(Array.isArray(d) ? d : d.moods || []) }
      catch { setHistory([]) }
    })()
  }, [])

  const recordMood = async (mood) => {
    setSelected(mood)
    try {
      const r = await fetch(`${api}/moods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood: mood.name, note }) })
      const d = await r.json()
      if (d.mood) setHistory(prev => [d.mood, ...prev])
      setNote('')
    } catch {}
    setTimeout(() => setSelected(null), 1200)
  }

  return (
    <div className="memories-panel">
      <div className="memories-header">
        <div><h2>心情记录</h2><p>告诉Elios你今天的心情</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {MOODS.map(m => (
          <button key={m.name} onClick={() => recordMood(m)} style={{
            padding: '14px 8px', borderRadius: 16, border: selected?.name === m.name ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: selected?.name === m.name ? 'linear-gradient(135deg, rgba(124,191,154,0.2), rgba(148,201,115,0.15))' : 'var(--color-surface-elevated)',
            cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontFamily: 'inherit',
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{m.emoji}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{m.name}</div>
          </button>
        ))}
      </div>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="记录一下此刻的感受（可选）" className="input-field" style={{ marginBottom: 16 }} />
      {history.length === 0 ? (
        <div className="memories-empty" style={{ padding: '24px 0' }}>
          <div className="empty-icon">💭</div>
          <h3>还没有记录</h3>
          <p>点一个表情，告诉Elios你的心情</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {history.map((h, i) => (
            <div key={h.id || i} style={{ flexShrink: 0, padding: '12px 16px', borderRadius: 16, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', minWidth: 100, textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>{'😊'}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: '2px 0' }}>{h.mood}</div>
              {h.note && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{h.note}</div>}
              <div style={{ fontSize: 10, color: 'var(--color-text-faint)', marginTop: 4 }}>{h.created_at ? new Date(h.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
