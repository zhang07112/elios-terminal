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

export default function Chat({ api }) {
  const [userAvatar, setUserAvatar] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage.getItem('elios-user-avatar')
    } catch {
      return null
    }
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
        if (messages.length > 0) {
          setMsgs(messages)
        }
      } catch (err) {
        console.warn('从 Supabase 加载消息失败', err)
      }
    }
    loadMessages()

    const subscription = subscribeToConversations((newMsg) => {
      setMsgs((prev) => [...prev, newMsg])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('elios-chat-msgs', JSON.stringify(msgs))
    } catch (err) {
      console.warn('无法保存聊天记录', err)
    }
  }, [msgs])

  useEffect(() => {
    const initEnvironment = async () => {
      setLocationLoading(true)
      const context = await getEnvironmentContext()
      setEnvContext(context)
      setLocationLoading(false)
      console.log('🌍 环境感知已启用:', context)
    }
    initEnvironment()
  }, [])

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${api}/cost`)
        if (!res.ok) throw new Error(`状态 ${res.status}`)
        setServerHealthy(true)
      } catch {
        setServerHealthy(false)
      }
    }

    checkServer()
  }, [api])

  useEffect(() => {
    const pollProactive = async () => {
      try {
        const res = await fetch(`${api}/proactive-check`)
        if (!res.ok) return
        const data = await res.json()
        if (data.message) {
          setMsgs((prev) => [
            ...prev,
            {
              id: `proactive-${Date.now()}`,
              role: 'assistant',
              content: data.message,
            },
          ])
        }
      } catch {
        return
      }
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
    const userMessageWithContext = contextStr 
      ? `${contextStr}\n\n用户说：${text}`
      : text

    try {
      const r = await fetch(`${api}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageWithContext }),
      })

      if (!r.ok) {
        const text = await r.text()
        setError(`服务器错误：${r.status} ${r.statusText}${text ? ` - ${text}` : ''}`)
        setLoading(false)
        return
      }

      const d = await r.json()
      if (d.error) {
        setError(d.error)
        setLoading(false)
        return
      }

      setMsgs((prev) => [
        ...prev,
        { role: 'assistant', content: d.reply || '他暂时没有回应，请稍后再试。', id: `r_${Date.now()}` },
      ])
      setLoading(false)
    } catch (err) {
      console.error('聊天请求失败', err)
      setError(`连接失败：${err?.message || '请确认后端是否已启动。'}`)
      setLoading(false)
    }
  }

  const keyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-meta">
        <div>
          <h2>聊天空间</h2>
          <p>他会像恋人一样倾听你的心情。每一句话都被珍视。</p>
        </div>
        <div className="env-status">
          {locationLoading ? (
            <span className="env-loading">🌍 正在感知环境...</span>
          ) : envContext ? (
            <div className="env-info">
              <span className="env-item">⏰ {envContext.time?.time}</span>
              <span className="env-item">📍 {envContext.location?.city}</span>
              {envContext.weather && (
                <span className="env-item">🌤️ {envContext.weather.temp}°C</span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {!serverHealthy && (
        <div className="chat-error-banner">
          后端未连接：请确认后端服务已启动
        </div>
      )}

      <div className="chat-thread" ref={threadRef}>
        {msgs.map((message) => (
          <div key={message.id} className={`chat-message ${message.role}`}>
            {message.role === 'assistant' && <div className="message-avatar">E</div>}
            {message.role === 'user' && (
              <div className="message-avatar user-avatar">
                {userAvatar ? (
                  <img src={userAvatar} alt="我的头像" className="avatar-img" />
                ) : (
                  '我'
                )}
              </div>
            )}
            <div className="message-content">
              <div className="message-bubble">{message.content}</div>
              {message.role === 'user' && (
                <div className="message-meta">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant loading-message">
            <div className="message-avatar">E</div>
            <div>
              <div className="message-bubble loading-bubble">
                <span />
                <span />
                <span />
              </div>
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
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={keyDown}
            placeholder={serverHealthy ? '你想对他说什么？' : '后端未连接，无法发送'}
            disabled={loading || !serverHealthy}
            rows={2}
          />
          <button className="send-btn" onClick={send} aria-label="发送消息">
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
