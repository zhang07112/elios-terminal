import { useState, useEffect, useRef } from 'react'
import { getEnvironmentContext, formatEnvironmentContext } from '../utils/environment'
import { fetchConversations, subscribeToConversations } from '../supabase'

const DEFAULT = [{ id: 'init', role: 'assistant', content: '你好，我是Elios。想和我聊聊今天的心情吗？' }]

export default function Chat({ api, onBack }) {
  const [msgs, setMsgs] = useState(DEFAULT)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverOk, setServerOk] = useState(true)
  const [env, setEnv] = useState(null)
  const btm = useRef(null)
  const thr = useRef(null)

  const scroll = () => { if (thr.current) thr.current.scrollTop = thr.current.scrollHeight; btm.current?.scrollIntoView() }

  useEffect(() => {
    fetchConversations().then(m => { if (m.length > 0) setMsgs(m) }).catch(() => {})
    const sub = subscribeToConversations(m => setMsgs(p => [...p, m]))
    return () => sub.unsubscribe()
  }, [])

  useEffect(() => { try { window.localStorage.setItem('elios-chat', JSON.stringify(msgs)) } catch {} }, [msgs])

  useEffect(() => { getEnvironmentContext().then(c => setEnv(c)).catch(() => {}) }, [])

  useEffect(() => {
    fetch(`${api}/cost`).then(r => { if (r.ok) setServerOk(true) }).catch(() => setServerOk(false))
    const i = setInterval(() => {
      fetch(`${api}/proactive-check`).then(r => r.json()).then(d => {
        if (d.message) setMsgs(p => [...p, { id: `p-${Date.now()}`, role: 'assistant', content: d.message }])
      }).catch(() => {})
    }, 30000)
    return () => clearInterval(i)
  }, [])

  const send = async () => {
    const t = input.trim()
    if (!t || loading) return
    setInput(''); setMsgs(p => [...p, { role: 'user', content: t, id: Date.now() }]); setLoading(true)
    const ctx = formatEnvironmentContext(env)
    try {
      const r = await fetch(`${api}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: ctx ? `${ctx}\n\n用户说：${t}` : t }),
      })
      const d = await r.json()
      setMsgs(p => [...p, { role: 'assistant', content: d.reply || '...', id: `r${Date.now()}` }])
    } catch { setMsgs(p => [...p, { role: 'assistant', content: '连接失败，稍后再试', id: `e${Date.now()}` }]) }
    setLoading(false)
  }

  useEffect(() => { setTimeout(scroll, 50) }, [msgs])

  return (
    <div className="chat-screen">
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">Elios</div>
        <div className="app-header-right"><span className="status-dot" style={{ display: 'block', margin: '0 auto', width: 8, height: 8, borderRadius: '50%', background: serverOk ? '#34c759' : '#ff3b30' }} /></div>
      </div>
      <div className="chat-thread" ref={thr}>
        {msgs.map(m => (
          <div key={m.id} className={`imessage-row ${m.role}`}>
            <div className="imessage-bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="imessage-row assistant">
            <div className="imessage-bubble typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={btm} />
      </div>
      <div className="chat-input">
        <div className="input-wrap">
          <textarea value={input} onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="iMessage" disabled={loading} rows={1} />
          <button className="chat-send" onClick={send} disabled={!input.trim() || loading}><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
        </div>
      </div>
    </div>
  )
}