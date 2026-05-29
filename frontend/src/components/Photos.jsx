import { useState, useEffect } from 'react'

export default function Photos({ api, onBack }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try { const r = await fetch(`${api}/photos`); const d = await r.json(); setPhotos(Array.isArray(d) ? d : d.photos || []) }
      catch { setPhotos([]) }
      setLoading(false)
    })()
  }, [])

  if (loading) return (
    <div className="feature-panel">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">相册</div>
        <div className="app-header-right" />
      </div>
      <div className="memories-loading"><div className="loading-spinner" /><p>正在加载相册...</p></div>
    </div>
  )

  return (
    <div className="feature-panel">
      <div className="app-header">
        <button className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="app-title">相册</div>
        <div className="app-header-right" />
      </div>
      <div className="feature-header">
        <h2>📸 相册</h2>
        <p>你和Elios的共同影像</p>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button disabled style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'not-allowed' }}>即将支持</button>
      </div>
      {photos.length === 0 ? (
        <div className="feature-empty">
          <div className="feature-empty-icon">🖼️</div>
          <h3>还没有照片</h3>
          <p>未来可以上传你和Elios的回忆瞬间</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {photos.map((p, i) => (
            <div key={p.id || i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', aspectRatio: 1 }}>
              <img src={p.url || p.image_url} alt={p.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
