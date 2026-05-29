const DOCK = [
  { id: 'chat', icon: '💬' },
  { id: 'home', icon: '🏠' },
  { id: 'read', icon: '📖' },
]

const APPS = [
  { id: 'chat', icon: '💬', label: '聊天', color: 'linear-gradient(135deg, #34c759, #28a745)' },
  { id: 'diary', icon: '📖', label: '日记', color: 'linear-gradient(135deg, #5ac8fa, #007aff)' },
  { id: 'read', icon: '📚', label: '阅读', color: 'linear-gradient(135deg, #ff9500, #ff6b00)' },
  { id: 'calendar', icon: '📅', label: '日程', color: 'linear-gradient(135deg, #ff6482, #ff2d55)' },
  { id: 'study', icon: '✏️', label: '学习', color: 'linear-gradient(135deg, #af52de, #8944c2)' },
  { id: 'mood', icon: '💭', label: '心情', color: 'linear-gradient(135deg, #ffd60a, #ff9f0a)' },
  { id: 'music', icon: '🎵', label: '音乐', color: 'linear-gradient(135deg, #fc6c8f, #ff3b30)' },
  { id: 'photos', icon: '📸', label: '相册', color: 'linear-gradient(135deg, #30d158, #34c759)' },
  { id: 'memories', icon: '💝', label: '回忆', color: 'linear-gradient(135deg, #bf5af2, #af52de)' },
  { id: 'goodnight', icon: '🌙', label: '晚安', color: 'linear-gradient(135deg, #636366, #48484a)' },
  { id: 'phone', icon: '📞', label: '通话', color: 'linear-gradient(135deg, #34c759, #28a745)' },
  { id: 'settings', icon: '⚙️', label: '设置', color: 'linear-gradient(135deg, #8e8e93, #636366)' },
]

export default function Home({ onOpen }) {
  const now = new Date()
  const day = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()]

  return (
    <div className="home-screen">
      <div className="home-date">
        <div className="home-date-day">{day}</div>
        <div className="home-date-week">{week}</div>
      </div>

      <div className="app-grid">
        {APPS.map(a => (
          <button key={a.id} className="app-icon" onClick={() => onOpen(a.id)}>
            <div className="app-icon-bg" style={{ background: a.color }}>{a.icon}</div>
            <span className="app-icon-label">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="dock">
        <div className="dock-bg">
          {DOCK.map(d => (
            <button key={d.id} className="app-icon" onClick={() => onOpen(d.id)}>
              <div className="app-icon-bg" style={{ background: d.id === 'home' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #34c759, #28a745)' }}>
                {d.icon}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}