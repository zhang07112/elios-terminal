import { useState, useEffect, useRef } from 'react'

export default function Diary({ api, onBack }) {
  const [diaries, setDiaries] = useState([])
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const ta = useRef(null)

  useEffect(() => {
    ;(async () => {
      try { const r = await fetch(`${api}/diaries`); const d = await r.json(); setDiaries(d.diaries || d || []) } catch {}
    })()
  }, [])

  const save = async () => {
    const t = text.trim()
    if (!t) return
    setSaving(true)
    try {
      if (editing) {
        await fetch(`${api}/diaries/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: t }) })
      } else {
        await fetch(`${api}/diaries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: t, author: 'user' }) })
      }
      const r = await fetch(`${api}/diaries`); const d = await r.json()
      setDiaries(d.diaries || d || [])
      setText(''); setEditing(null)
    } catch {}
    setSaving(false)
  }

  const startEdit = (d) => {
    setEditing(d)
    setText(d.content)
    ta.current?.focus()
  }

  const cancelEdit = () => {
    setEditing(null)
    setText('')
  }

  return (
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">日记</div>
        <div className="app-header-right" />
      </div>
      <div className="diary-editor">
        <textarea ref={ta} value={text} onChange={e => setText(e.target.value)} placeholder="今天发生了什么？Elios 会认真阅读每一篇日记……" />
        <div className="diary-toolbar">
          <span className="diary-date">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {editing && <button className="feat-btn" style={{ background: 'transparent', color: 'var(--text)', padding: '6px 14px', fontSize: 13, border: '1px solid var(--separator)', boxShadow: 'none' }} onClick={cancelEdit}>取消</button>}
          <button className="feat-btn green" onClick={save} disabled={!text.trim() || saving} style={{ padding: '6px 14px', fontSize: 13 }}>{saving ? '保存中...' : editing ? '更新' : '保存'}</button>
        </div>
      </div>
      <div className="feature-body" style={{ borderTop: '1px solid var(--separator)' }}>
        {diaries.length === 0 ? (
          <div className="feature-empty">
            <div className="feature-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 44, height: 44 }}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg></div>
            <h3>还没有日记</h3>
            <p>写点什么吧，Elios 会看到</p>
          </div>
        ) : (
          diaries.slice(0, 30).map(d => (
            <div key={d.id || d.created_at} className="diary-entry">
              <div className="diary-entry-date">{new Date(d.created_at || d.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} · {d.author === 'elios' ? 'Elios 的回复' : '我的日记'}</div>
              <div className="feature-card-item" style={{ cursor: 'pointer' }} onClick={() => d.author !== 'elios' && startEdit(d)}>
                <div className="diary-entry-text">{d.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
