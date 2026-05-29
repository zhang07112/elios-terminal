import { useState, useEffect, useRef, useCallback } from 'react'
import '../chat-theme.css'

const DEFAULT = [{ id: 'init', role: 'assistant', content: '你好，我是Elios。想和我聊聊今天的心情吗？', time: Date.now() - 60000 }]

export default function Chat({ api, onBack }) {
  const [msgs, setMsgs] = useState(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const btm = useRef(null)
  const chatMessages = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('elios-chat')
      if (saved) setMsgs(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('elios-chat', JSON.stringify(msgs)) } catch {}
  }, [msgs])

  const scrollToBottom = useCallback(() => {
    if (chatMessages.current) {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight
    }
    btm.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { setTimeout(scrollToBottom, 50) }, [msgs, loading])

  const formatTime = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return '昨天'
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const send = async () => {
    const el = inputRef.current
    if (!el) return
    const t = el.textContent.trim()
    if (!t || loading) return
    el.textContent = ''
    setMsgs(p => [...p, { role: 'user', content: t, id: Date.now(), time: Date.now() }])
    setLoading(true)
    try {
      const r = await fetch(`${api}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t }),
      })
      const d = await r.json()
      setMsgs(p => [...p, { role: 'assistant', content: d.reply || '...', id: `r${Date.now()}`, time: Date.now() }])
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: '连接失败，稍后再试', id: `e${Date.now()}`, time: Date.now() }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const longPressTimer = useRef(null)

  const handleMsgMouseDown = (id) => {
    longPressTimer.current = setTimeout(() => {
      setSelectionMode(true)
      setSelectedIds(new Set([id]))
    }, 500)
  }

  const handleMsgMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const toggleSelect = (id) => {
    if (!selectionMode) return
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    setMsgs(p => p.filter(m => !selectedIds.has(m.id)))
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  return (
    <div id="chat-interface-screen" className={selectionMode ? 'selection-mode' : ''}>
      <div className="header">
        <button className="back-btn" onClick={onBack} aria-label="返回"></button>
        <div id="chat-header-title-wrapper">
          <div id="chat-header-title">Elios</div>
          <div className="status">在线</div>
        </div>
        <button id="chat-settings-btn" aria-label="关注"></button>
        <button id="listen-together-btn" aria-label="一起听"></button>
        <button id="char-heart-btn" aria-label="心声"></button>
        <button id="open-memory-screen-btn" aria-label="记忆"></button>
        <button id="group-announcement-btn" aria-label="公告"></button>
        <div className="selection-controls">
          <button className="action-btn" onClick={() => {
            if (selectedIds.size === msgs.length) setSelectedIds(new Set())
            else setSelectedIds(new Set(msgs.map(m => m.id)))
          }}>{selectedIds.size === msgs.length ? '取消' : '全选'}</button>
          <button className="action-btn" id="delete-msgs-btn" onClick={deleteSelected} disabled={selectedIds.size === 0}>删除</button>
        </div>
      </div>

      <div id="chat-messages" ref={chatMessages}>
        {msgs.map((m, i) => {
          const isLastAi = m.role === 'assistant' && (i === msgs.length - 1 || msgs[i + 1]?.role !== 'assistant')
          const isLastUser = m.role === 'user' && (i === msgs.length - 1 || msgs[i + 1]?.role !== 'user')
          const showTs = (m.role === 'assistant' && isLastAi) || (m.role === 'user' && isLastUser)
          return (
            <div
              key={m.id}
              className={`message-wrapper ${m.role === 'assistant' ? 'ai' : 'user'} ${selectedIds.has(m.id) ? 'selected' : ''}`}
              onMouseDown={() => handleMsgMouseDown(m.id)}
              onMouseUp={handleMsgMouseUp}
              onMouseLeave={handleMsgMouseUp}
              onTouchStart={() => handleMsgMouseDown(m.id)}
              onTouchEnd={(e) => {
                handleMsgMouseUp()
                if (selectionMode) {
                  e.preventDefault()
                  toggleSelect(m.id)
                }
              }}
              onClick={() => selectionMode && toggleSelect(m.id)}
            >
              {m.role === 'assistant' && <div className="avatar" />}
              <div className={`message-bubble ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                <div className="content">{m.content}</div>
              </div>
              {m.role === 'user' && <div className="avatar" />}
              {showTs && <div className="timestamp">{formatTime(m.time)}</div>}
            </div>
          )
        })}
        {loading && <div id="typing-indicator" />}
        <div ref={btm} />
      </div>

      <div id="chat-input-area">
        <div id="chat-input-main-row">
          <div id="chat-input-actions-top">
            <button className="chat-action-icon-btn">照片</button>
            <button className="chat-action-icon-btn">相机</button>
            <button className="chat-action-icon-btn">位置</button>
            <button className="chat-action-icon-btn">转账</button>
            <button className="chat-action-icon-btn">红包</button>
            <button className="chat-action-icon-btn">语音</button>
          </div>
          <div
            id="chat-input"
            ref={inputRef}
            contentEditable
            role="textbox"
            aria-multiline="true"
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning
          />
          <button id="wait-reply-btn" aria-label="等待回复">
            <img src="https://img.heliar.top/file/1767692527831_retouch_2026010617394876.png" alt="" />
          </button>
          <button id="send-btn" onClick={send} aria-label="发送" />
        </div>
      </div>
    </div>
  )
}
