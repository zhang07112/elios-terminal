import { useState, useEffect } from 'react'

const MOODS = [
  { emoji: '😊', name: '开心' }, { emoji: '😢', name: '难过' }, { emoji: '😰', name: '焦虑' },
  { emoji: '😌', name: '平静' }, { emoji: '🎉', name: '兴奋' }, { emoji: '😴', name: '疲惫' },
  { emoji: '❤️', name: '被爱' }, { emoji: '🙏', name: '感恩' }, { emoji: '😐', name: '一般' },
]

export default function Mood({ api, onBack }) {
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
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">心情</div>
        <div className="app-header-right" />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {MOODS.map(m => (
            <button key={m.name} onClick={() => recordMood(m)} style={{
              padding: '14px 8px', borderRadius: 16, border: selected?.name === m.name ? '2px solid #34c759' : '1px solid #38383a',
              background: selected?.name === m.name ? 'rgba(52,199,89,0.1)' : '#1c1c1e',
              cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontFamily: 'inherit',
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{m.emoji}</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.name}</div>
            </button>
          ))}
        </div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="记录一下此刻的感受（可选）" className="feat-input" style={{ marginBottom: 16 }} />
        {history.length === 0 ? (
          <div className="feature-empty" style={{ marginTop: 24 }}>
            <div className="feature-empty-icon">💭</div>
            <h3>还没有记录</h3>
            <p>点一个表情，告诉 Elios 你的心情</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {history.map((h, i) => (
              <div key={h.id || i} style={{ flexShrink: 0, padding: '12px 16px', borderRadius: 16, background: '#1c1c1e', border: '1px solid #38383a', minWidth: 100, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{'😊'}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: '2px 0' }}>{h.mood}</div>
                {h.note && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.note}</div>}
                <div style={{ fontSize: 10, color: '#636366', marginTop: 4 }}>{h.created_at ? new Date(h.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
