import { useState, useEffect, useRef } from 'react'

export default function Phone({ api }) {
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
    <div className="phone-panel">
      <div className="call-card">
        <div className="call-avatar">E</div>
        <div className="call-body">
          <div className="call-title">Elios</div>
          <p className="call-copy">
            {on
              ? streaming
                ? '正在语音陪伴中…'
                : `通话时长 ${fmt(dur)}`
              : '轻触开始通话，听他用声音陪你说话。'}
          </p>
        </div>
        <button className={`call-button ${on ? 'call-end' : 'call-start'}`} onClick={toggle}>
          {on ? '结束通话' : '开始通话'}
        </button>
      </div>
      <audio ref={audioRef} hidden />
    </div>
  )
}
