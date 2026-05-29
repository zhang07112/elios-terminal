import { useState, useEffect } from 'react'

const STAR_STYLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`,
  width: `${1 + Math.random() * 3}px`, height: `${1 + Math.random() * 3}px`,
  animationDelay: `${Math.random() * 3}s`, opacity: 0.3 + Math.random() * 0.7,
}))

export default function Goodnight({ api, onBack }) {
  const [messages, setMessages] = useState([])
  const [current, setCurrent] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {       const r = await fetch(`${api}/goodnight`); const d = await r.json(); setMessages(Array.isArray(d) ? d : d.goodnight || []) }
      catch { setMessages([]) }
    })()
  }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      const r = await fetch(`${api}/goodnight/generate`, { method: 'POST' })
      const d = await r.json()
      const msg = d.goodnight || ''
      setCurrent(msg)
      setMessages(prev => [{ content: msg, date: new Date().toISOString() }, ...prev])
    } catch { setCurrent('晚安，好梦 🌙') }
    setGenerating(false)
  }

  return (
    <div className="gnight-scene">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">晚安</div>
        <div className="app-header-right" />
      </div>
      {STAR_STYLES.map((s, i) => (
        <div key={i} style={{ position: 'absolute', ...s, borderRadius: '50%', background: '#fff', animation: 'twinkle 2s ease-in-out infinite', animationDelay: s.animationDelay }} />
      ))}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'auto', height: 'calc(100% - 52px)', padding: 32 }}>
        <div style={{ textAlign: 'center', color: '#e8e4d8' }}>
          <div style={{ fontSize: 80, marginBottom: 8, animation: 'float 4s ease-in-out infinite' }}>🌙</div>
          <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4, color: '#f0ecd8' }}>晚安</h2>
          <p style={{ fontSize: 16, color: 'rgba(232,228,216,0.6)', marginBottom: 32 }}>让Elios陪你结束这一天</p>
          <button onClick={generate} disabled={generating} style={{ padding: '14px 32px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #5a7d9c, #3d6b8a)', color: '#f0ecd8', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 24px rgba(90,125,156,0.4)', fontFamily: 'inherit' }}>
            {generating ? '正在准备...' : '让Elios对我说晚安'}
          </button>
          {current && (
            <div style={{ margin: '24px auto', maxWidth: 400, padding: '20px 24px', borderRadius: 24, background: 'rgba(232,228,216,0.08)', border: '1px solid rgba(232,228,216,0.15)', backdropFilter: 'blur(8px)', fontSize: 16, lineHeight: 1.8, color: '#e8e4d8', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 30, width: 20, height: 20, background: 'rgba(232,228,216,0.08)', borderTop: '1px solid rgba(232,228,216,0.15)', borderLeft: '1px solid rgba(232,228,216,0.15)', transform: 'rotate(45deg)' }} />
              {current}
            </div>
          )}
          {messages.length > 0 && (
            <div style={{ marginTop: 32, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: 'rgba(232,228,216,0.4)', marginBottom: 12, textAlign: 'center' }}>—— 晚安记录 ——</div>
              {messages.map((m, i) => (
                <div key={m.id || i} style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(232,228,216,0.04)', marginBottom: 8, border: '1px solid rgba(232,228,216,0.08)' }}>
                  <div style={{ fontSize: 14, color: '#ccc8b8', lineHeight: 1.6 }}>{m.content || m.message || m.reply}</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,228,216,0.3)', marginTop: 4 }}>{m.date || m.created_at ? new Date(m.date || m.created_at).toLocaleDateString('zh-CN') : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}
