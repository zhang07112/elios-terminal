export default function Home({ api, onStart, onNavigate }) {
  const cards = [
    { id: 'chat', icon: '💬', title: '聊天' },
    { id: 'diary', icon: '📖', title: '日记' },
    { id: 'study', icon: '📚', title: '学习' },
    { id: 'calendar', icon: '📅', title: '日程' },
    { id: 'mood', icon: '💭', title: '心情' },
    { id: 'music', icon: '🎵', title: '音乐' },
    { id: 'photos', icon: '📸', title: '相册' },
    { id: 'memories', icon: '💝', title: '回忆' },
    { id: 'goodnight', icon: '🌙', title: '晚安' },
    { id: 'phone', icon: '📞', title: '通话' },
    { id: 'settings', icon: '⚙️', title: '设置' },
  ]

  return (
    <div className="home-panel">
      <div className="home-greeting">
        <span className="home-greet-emoji">🌿</span>
        <div>
          <div className="home-greet-text">欢迎回来</div>
          <div className="home-greet-sub">Elios 在等你</div>
        </div>
      </div>
      <div className="feature-grid">
        {cards.map((card) => (
          <button key={card.id} className="feature-card" onClick={() => onNavigate(card.id)}>
            <span className="feature-icon">{card.icon}</span>
            <span className="feature-title">{card.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}