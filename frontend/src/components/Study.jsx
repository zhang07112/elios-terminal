import { useState, useEffect, useRef } from 'react'

const E = ['太棒了，我为你骄傲 🌟', '专注力满分！今天也进步了 ✨', '学得很认真，休息一下吧 ☕', '你真的很努力 💚', '离目标更近了 🎯']

export default function Study({ api, onBack }) {
  const [sessions, setSessions] = useState([])
  const [topic, setTopic] = useState('')
  const [time, setTime] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [msg, setMsg] = useState('')
  const intv = useRef(null)

  useEffect(() => {
    ;(async () => {
      try { const r = await fetch(`${api}/study`); const d = await r.json(); setSessions(Array.isArray(d) ? d : d.sessions || []) }
      catch { setSessions([]) }
    })()
  }, [])

  useEffect(() => {
    if (!running) return
    intv.current = setInterval(() => {
      setTime(t => {
        if (t > 1) return t - 1
        clearInterval(intv.current); setRunning(false)
        if (!isBreak) {
          setIsBreak(true); setTime(5 * 60)
          setMsg(E[Math.floor(Math.random() * E.length)])
          if (topic) fetch(`${api}/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, duration_minutes: 25 }) }).catch(() => {})
        } else { setIsBreak(false); setTime(25 * 60); setMsg('休息结束，继续加油！💪') }
        return 0
      })
    }, 1000)
    return () => clearInterval(intv.current)
  }, [running, isBreak])

  const fm = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="feature-panel">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">学习陪伴</div>
        <div className="app-header-right" />
      </div>
      <div className="feature-header">
        <h2>学习陪伴</h2>
        <p>和Elios一起专注，番茄工作法</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0', background: 'linear-gradient(135deg, rgba(124,191,154,0.08), rgba(148,201,115,0.08))', borderRadius: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: isBreak ? 'var(--color-accent)' : 'var(--color-primary-dark)', fontVariantNumeric: 'tabular-nums' }}>{fm(time)}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{isBreak ? '☕ 休息时间' : '📚 专注学习中'}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { if (running) { clearInterval(intv.current); setRunning(false) } else setRunning(true) }} className="feat-btn" style={{ minWidth: 90 }}>{running ? '暂停' : '开始'}</button>
          <button onClick={() => { clearInterval(intv.current); setRunning(false); setTime(isBreak ? 5 * 60 : 25 * 60); setIsBreak(false); setMsg('') }} className="feat-btn" style={{ background: 'var(--color-surface)', color: 'var(--text)', boxShadow: 'none' }}>重置</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="今天学什么？" className="feat-input" style={{ flex: 1 }} />
        <button onClick={() => { if (topic.trim()) { setTime(25 * 60); setRunning(true); setIsBreak(false); setMsg('') } }} disabled={!topic.trim()} className="feat-btn">开始学习</button>
      </div>
      {msg && (
        <div style={{ padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,191,154,0.15), rgba(148,201,115,0.12))', marginBottom: 16, fontSize: 15, color: 'var(--color-primary-dark)', textAlign: 'center', fontWeight: 500 }}>
          🌿 {msg}
        </div>
      )}
      {sessions.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>📋 学习记录</div>
          <div className="memory-list">
            {sessions.map((s, i) => (
              <div key={i} className="memory-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>📚 {s.topic || '未知主题'}</span>
                  <span>{s.date ? new Date(s.date).toLocaleDateString('zh-CN') : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
