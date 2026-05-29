import { useState, useEffect, useRef } from 'react'

const DEFAULT = [{ id: 'init', role: 'assistant', content: '你好，我是Elios。想和我聊聊今天的心情吗？' }]

export default function Chat({ api, onBack }) {
  const [msgs, setMsgs] = useState(DEFAULT)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const btm = useRef(null)
  const thr = useRef(null)

  const scroll = () => { if (thr.current) thr.current.scrollTop = thr.current.scrollHeight; btm.current?.scrollIntoView() }

  useEffect(() => {
    try { const saved = localStorage.getItem('elios-chat'); if (saved) setMsgs(JSON.parse(saved)) } catch {}
  }, [])

  useEffect(() => { try { localStorage.setItem('elios-chat', JSON.stringify(msgs)) } catch {} }, [msgs])

  const send = async () => {
    const t = input.trim()
    if (!t || loading) return
    setInput(''); setMsgs(p => [...p, { role: 'user', content: t, id: Date.now() }]); setLoading(true)
    try {
      const r = await fetch(`${api}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t }),
      })
      const d = await r.json()
      setMsgs(p => [...p, { role: 'assistant', content: d.reply || '...', id: `r${Date.now()}` }])
    } catch { setMsgs(p => [...p, { role: 'assistant', content: '连接失败，稍后再试', id: `e${Date.now()}` }]) }
    setLoading(false)
  }

  useEffect(() => { setTimeout(scroll, 50) }, [msgs])

  const showLeftAvatar = (msgs, i) => {
    if (msgs[i].role !== 'assistant') return false
    if (i === 0) return true
    return msgs[i-1].role !== 'assistant'
  }

  const showRightAvatar = (msgs, i) => {
    if (msgs[i].role !== 'user') return false
    if (i === msgs.length - 1) return true
    return msgs[i+1].role !== 'user'
  }

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button className="chat-header-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="chat-header-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.9)' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div className="chat-header-center">
          <div className="chat-header-name">Elios</div>
          <div className="chat-header-status">在线</div>
        </div>
        <button className="chat-header-btn" style={{ opacity: 0.5 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>
      <div className="chat-thread" ref={thr}>
        {msgs.map((m, i) => (
          <div key={m.id} className={`imessage-row ${m.role}`}>
            {m.role === 'assistant' && <div className={`imessage-avatar ${showLeftAvatar(msgs, i) ? '' : 'shown'}`} style={{ opacity: showLeftAvatar(msgs, i) ? 1 : 0 }}>E</div>}
            <div className="imessage-bubble">{m.content}</div>
            {m.role === 'user' && <div className={`imessage-avatar ${showRightAvatar(msgs, i) ? '' : 'shown'}`} style={{ opacity: showRightAvatar(msgs, i) ? 1 : 0 }}>U</div>}
          </div>
        ))}
        {loading && (
          <div className="imessage-row assistant">
            <div className="imessage-avatar">E</div>
            <div className="imessage-bubble typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={btm} />
      </div>
      <div className="chat-input">
        <div className="input-wrap">
          <textarea value={input} onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="iMessage" disabled={loading} rows={1} />
          <button className="chat-send" onClick={send} disabled={!input.trim() || loading}>
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
