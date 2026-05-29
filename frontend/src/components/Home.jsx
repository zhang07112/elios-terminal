export default function Home({ api, onStart, onNavigate }) {
  const cards = [
    { id: 'chat', icon: '💬', title: '聊天', desc: '他一直在这，等你开口', color: '#7cbf9a' },
    { id: 'diary', icon: '📖', title: '日记', desc: '写下今天，他也写给你', color: '#94c973' },
    { id: 'study', icon: '📚', title: '学习', desc: '番茄钟，他陪你专注', color: '#a8dcc3' },
    { id: 'calendar', icon: '📅', title: '日程', desc: '一起计划每一天', color: '#7cbf9a' },
    { id: 'mood', icon: '💭', title: '心情', desc: '告诉他你今天怎样', color: '#94c973' },
    { id: 'music', icon: '🎵', title: '音乐', desc: '属于你们的歌单', color: '#a8dcc3' },
    { id: 'photos', icon: '📸', title: '相册', desc: '珍藏每个瞬间', color: '#7cbf9a' },
    { id: 'memories', icon: '💝', title: '回忆', desc: '他说他都记得', color: '#94c973' },
    { id: 'goodnight', icon: '🌙', title: '晚安', desc: '让他陪你结束一天', color: '#a8dcc3' },
    { id: 'phone', icon: '📞', title: '通话', desc: '听听他的声音', color: '#7cbf9a' },
    { id: 'settings', icon: '⚙️', title: '设置', desc: '个性化你的空间', color: '#94c973' },
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
          <button key={card.id} className="feature-card" onClick={() => onNavigate(card.id)} style={{ '--card-accent': card.color }}>
            <span className="feature-icon">{card.icon}</span>
            <span className="feature-title">{card.title}</span>
            <span className="feature-desc">{card.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}