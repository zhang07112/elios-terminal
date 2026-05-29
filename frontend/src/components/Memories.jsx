import { useState, useEffect } from 'react'

export default function Memories({ api, dirty, onBack }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${api}/cards`)
        const d = await r.json()
        setMemories(Array.isArray(d) ? d : d.cards || [])
      } catch {
        setMemories([])
      }
      setLoading(false)
    })()
  }, [dirty])

  const categories = ['all', ...new Set(memories.map(m => m.category || '回忆'))]
  const filteredMemories = filter === 'all' 
    ? memories 
    : memories.filter(m => (m.category || '回忆') === filter)

  if (loading) {
    return (
      <div className="feature-panel">
        <div className="app-header">
          <button className="app-back" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="app-title">回忆库</div>
          <div className="app-header-right" />
        </div>
        <div className="memories-loading">
          <div className="loading-spinner"></div>
          <p>正在加载回忆...</p>
        </div>
      </div>
    )
  }

  if (memories.length === 0) {
    return (
      <div className="feature-panel">
        <div className="app-header">
          <button className="app-back" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="app-title">回忆库</div>
          <div className="app-header-right" />
        </div>
        <div className="feature-empty">
          <div className="feature-empty-icon">💭</div>
          <h3>还没有回忆</h3>
          <p>开始和 Elios 聊天后<br />他会慢慢记住关于你的一切</p>
          <div className="empty-hint">
            <span>🌱</span> 每一次对话都会成为珍贵的记忆
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="feature-panel">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">回忆库</div>
        <div className="app-header-right" />
      </div>

      <div className="feature-header">
        <h2>回忆库</h2>
        <p>Elios 关于你的记忆碎片</p>
      </div>

      <div className="memory-stats">
        <div className="stat-item">
          <span className="stat-number">{memories.length}</span>
          <span className="stat-label">条记忆</span>
        </div>
      </div>

      <div className="memory-filter">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      <div className="feature-card-list">
        {filteredMemories.map((memo, idx) => (
          <article key={memo.id || idx} className="feature-card-item">
            <div className="memory-card-header">
              <div className="memory-category">
                <span className="category-icon">📝</span>
                {memo.category || '回忆'}
              </div>
              {memo.created_at && (
                <span className="memory-date">
                  {new Date(memo.created_at).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
            <div className="memory-text">{memo.content || memo.text}</div>
            {(memo.tags || memo.keywords) && (
              <div className="memory-tags">
                {(memo.tags || memo.keywords || []).map((tag, tagIndex) => (
                  <span key={tagIndex} className="memory-tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="memory-footer">
              <button className="memory-action">🔖 收藏</button>
              <button className="memory-action">📤 分享</button>
            </div>
          </article>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <div className="empty-filter">
          <p>该分类下还没有记忆</p>
        </div>
      )}
    </div>
  )
}
