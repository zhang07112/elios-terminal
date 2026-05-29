import { useState, useEffect } from 'react'

export default function CalendarView({ api }) {
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
    <div className="schedule-panel">
      <div className="schedule-header">
        <h2>日程提醒</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>他会帮你记住那些想要一直留住的时刻。</p>
      </div>

      {events.length === 0 ? (
        <div className="schedule-empty">当前没有待办日程。你可以把重要时间托付给 Elios。</div>
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
  )
}
