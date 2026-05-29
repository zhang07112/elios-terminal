import { useState, useEffect } from 'react'

export default function CalendarView({ api, onBack }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${api}/schedule`)
        const d = await r.json()
        setEvents(d.events || d.schedule || [])
      } catch {
        setEvents([])
      }
    })()
  }, [])

  return (
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">日程</div>
        <div className="app-header-right" />
      </div>
      <div style={{ padding: 16 }}>
        {events.length === 0 ? (
          <div className="feature-empty" style={{ marginTop: 40 }}>
            <div className="feature-empty-icon">📅</div>
            <h3>暂无日程</h3>
            <p>告诉 Elios 你的计划</p>
          </div>
        ) : (
          <div className="schedule-list">
            {events.map((event, index) => (
              <div key={event.id || index} className="schedule-card">
                <div className="schedule-title">{event.title || event.name}</div>
                <div className="schedule-time">{event.time || event.date || event.datetime || '未指定时间'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
