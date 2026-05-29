import { useState, useEffect } from 'react'

export default function Photos({ api }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try { const r = await fetch(`${api}/photos`); const d = await r.json(); setPhotos(Array.isArray(d) ? d : d.photos || []) }
      catch { setPhotos([]) }
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="memories-panel"><div className="memories-loading"><div className="loading-spinner" /><p>正在加载相册...</p></div></div>

  return (
    <div className="memories-panel">
      <div className="memories-header">
        <div><h2>📸 相册</h2><p>你和Elios的共同影像</p></div>
        <button disabled style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-faint)', fontSize: 13, cursor: 'not-allowed' }}>即将支持</button>
      </div>
      {photos.length === 0 ? (
        <div className="memories-empty">
          <div className="empty-icon">🖼️</div>
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
