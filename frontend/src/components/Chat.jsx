import { useState, useEffect, useRef } from 'react'
import { getEnvironmentContext, formatEnvironmentContext } from '../utils/environment'
import { fetchConversations, subscribeToConversations } from '../supabase'

const DEFAULT_MESSAGES = [
  {
    id: 'init',
    role: 'assistant',
    content: '你好，我是Elios。想和我聊聊今天的心情吗？我会认真听你的每一句话。',
  },
]

export default function Chat({ api, onBack }) {
  const [userAvatar, setUserAvatar] = useState(() => {
    if (typeof window === 'undefined') return null
    try { return window.localStorage.getItem('elios-user-avatar') } catch { return null }
  })
  const [msgs, setMsgs] = useState(DEFAULT_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverHealthy, setServerHealthy] = useState(true)
  const [envContext, setEnvContext] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const bottom = useRef(null)
  const threadRef = useRef(null)

  const scroll = () => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
      return
    }
    bottom.current?.scrollIntoView()
  }

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await fetchConversations()
        if (messages.length > 0) setMsgs(messages)
      } catch (err) { console.warn('从 Supabase 加载消息失败', err) }
    }
    loadMessages()
    const subscription = subscribeToConversations((newMsg) => setMsgs((prev) => [...prev, newMsg]))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    try { window.localStorage.setItem('elios-chat-msgs', JSON.stringify(msgs)) } catch {}
  }, [msgs])

  useEffect(() => {
    const initEnvironment = async () => {
      setLocationLoading(true)
      const context = await getEnvironmentContext()
      setEnvContext(context)
      setLocationLoading(false)
    }
    initEnvironment()
  }, [])

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${api}/cost`)
        if (!res.ok) throw new Error(`状态 ${res.status}`)
        setServerHealthy(true)
      } catch { setServerHealthy(false) }
    }
    checkServer()
  }, [api])

  useEffect(() => {
    const pollProactive = async () => {
      try {
        const res = await fetch(`${api}/proactive-check`)
        if (!res.ok) return
        const data = await res.json()
        if (data.message) setMsgs((prev) => [...prev, { id: `proactive-${Date.now()}`, role: 'assistant', content: data.message }])
      } catch { return }
    }
    const interval = setInterval(pollProactive, 30000)
    return () => clearInterval(interval)
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError(null)
    setMsgs((prev) => [...prev, { role: 'user', content: text, id: Date.now() }])
    setLoading(true)
    const contextStr = formatEnvironmentContext(envContext)
    const userMessageWithContext = contextStr ? `${contextStr}\n\n用户说：${text}` : text
    try {
      const r = await fetch(`${api}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageWithContext }),
      })
      if (!r.ok) {
        const t = await r.text()
        setError(`服务器错误：${r.status} ${r.statusText}${t ? ` - ${t}` : ''}`)
        setLoading(false)
        return
      }
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      setMsgs((prev) => [...prev, { role: 'assistant', content: d.reply || '他暂时没有回应，请稍后再试。', id: `r_${Date.now()}` }])
      setLoading(false)
    } catch (err) {
      setError(`连接失败：${err?.message || '请确认后端是否已启动。'}`)
      setLoading(false)
    }
  }

  const keyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="chat-panel">
      <div className="chat-mobile-header">
        <button className="chat-back-btn" onClick={onBack} aria-label="返回">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="chat-mobile-title">
          <div className="mobile-companion-name">Elios</div>
          <div className="mobile-companion-status">{serverHealthy ? '在线' : '离线'}</div>
        </div>
        <div className="chat-mobile-actions">
          <div className={`status-dot ${serverHealthy ? 'online' : 'offline'}`} />
        </div>
      </div>

      {!serverHealthy && <div className="chat-error-banner">后端未连接：请确认后端服务已启动</div>}

      <div className="chat-thread imessage" ref={threadRef}>
        {msgs.map((message) => (
          <div key={message.id} className={`imessage-row ${message.role}`}>
            <div className="imessage-bubble">{message.content}</div>
          </div>
        ))}

        {loading && (
          <div className="imessage-row assistant">
            <div className="imessage-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && (
          <div className="empty-state">
            <p>{error}</p>
            <button className="send-btn" onClick={send}>重试发送</button>
          </div>
        )}

        <div ref={bottom} />
      </div>

      <div className="chat-input">
        <div className="input-wrap">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={keyDown}
            placeholder="iMessage"
            disabled={loading || !serverHealthy}
            rows={1}
            inputMode="text"
          />
          <button className="imessage-send" onClick={send} disabled={!input.trim() || loading} aria-label="发送">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}