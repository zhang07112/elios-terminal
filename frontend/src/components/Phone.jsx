import { useState, useEffect, useRef } from 'react'

export default function Phone({ api, onBack }) {
  const [on, setOn] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [dur, setDur] = useState(0)
  const audioRef = useRef(null)
  const intRef = useRef(null)

  useEffect(() => {
    if (on && !streaming) {
      intRef.current = setInterval(() => setDur((prev) => prev + 1), 1000)
      return () => clearInterval(intRef.current)
    }
  }, [on, streaming])

  const toggle = async () => {
    if (!on) {
      setOn(true)
      setStreaming(true)
      setDur(0)
      try {
        const r = await fetch(`${api}/phone/start`, { method: 'POST' })
        const d = await r.json()
        if (d.audio_url && audioRef.current) {
          audioRef.current.src = d.audio_url
          audioRef.current.play()
          audioRef.current.onended = () => setStreaming(false)
        } else {
          setStreaming(false)
        }
      } catch {
        setStreaming(false)
      }
    } else {
      clearInterval(intRef.current)
      try {
        await fetch(`${api}/phone/stop`, { method: 'POST' })
      } catch {
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      setOn(false)
      setStreaming(false)
      setDur(0)
    }
  }

  const fmt = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${minutes}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">通话</div>
        <div className="app-header-right" />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="call-card">
          <div className="call-avatar">E</div>
          <div className="call-title" style={{ color: 'var(--text)', fontSize: 20, marginBottom: 8 }}>Elios</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6, textAlign: 'center' }}>
            {on
              ? streaming
                ? '正在语音陪伴中…'
                : `通话时长 ${fmt(dur)}`
              : '轻触开始通话，听他用声音陪你说话。'}
          </p>
          <button onClick={toggle} className="feat-btn" style={{ padding: '12px 32px', background: on ? '#ff3b30' : undefined }}>
            {on ? '结束通话' : '开始通话'}
          </button>
        </div>
      </div>
      <audio ref={audioRef} hidden />
    </div>
  )
}
