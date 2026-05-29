import { useState, useEffect } from 'react'

const WALLPAPERS = [
  { id: 'none', label: '无', gradient: 'linear-gradient(135deg,#F5F2ED,#F0EDE8)' },
  { id: 'gradient1', label: '暖阳', gradient: 'linear-gradient(135deg,#FCEABB,#F8B500)' },
  { id: 'gradient2', label: '暮色', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'gradient3', label: '森林', gradient: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { id: 'gradient4', label: '海洋', gradient: 'linear-gradient(135deg,#89CFF0,#005B96)' },
  { id: 'gradient5', label: '樱花', gradient: 'linear-gradient(135deg,#FFDEE9,#B5FFFC)' },
  { id: 'gradient6', label: '极光', gradient: 'linear-gradient(135deg,#00c6ff,#0072ff)' },
  { id: 'gradient7', label: '日落', gradient: 'linear-gradient(135deg,#FF512F,#DD2475)' },
]

export default function Settings({ api, onBack, onChange }) {
  const [serverStatus, setServerStatus] = useState('checking')
  const [stats, setStats] = useState(null)
  const [eliosAvatar, setEliosAvatar] = useState(() => {
    try { return localStorage.getItem('elios-avatar') || '' } catch { return '' }
  })
  const [wallpaper, setWallpaper] = useState(() => {
    try { return localStorage.getItem('elios-wallpaper') || '' } catch { return '' }
  })
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false)

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${api}/cost`)
        if (res.ok) {
          setServerStatus('online')
          const data = await res.json()
          setStats(data)
        } else setServerStatus('offline')
      } catch { setServerStatus('offline') }
    }
    checkServer()
  }, [api])

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target.result
      setEliosAvatar(data)
      localStorage.setItem('elios-avatar', data)
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setEliosAvatar('')
    localStorage.removeItem('elios-avatar')
  }

  const applyWallpaper = (wp) => {
    const val = wp.id === 'none' ? '' : wp.gradient
    setWallpaper(val)
    localStorage.setItem('elios-wallpaper', val)
    setShowWallpaperPicker(false)
  }

  const clearData = () => {
    if (confirm('确定要清除所有对话记录吗？')) {
      localStorage.removeItem('elios-chat')
      window.location.reload()
    }
  }

  return (
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">设置</div>
        <div className="app-header-right" />
      </div>
      <div className="feature-body">
        <div className="settings-section">
          <h3>🤖 Elios 头像</h3>
          <div className="settings-card">
            <div className="avatar-showcase">
              <div className="avatar-main">
                <div className="avatar-ring-large">
                  {eliosAvatar ? <img src={eliosAvatar} alt="Elios" /> : 'E'}
                </div>
                <div className="avatar-info">
                  <h4>Elios</h4>
                  <p>你可爱的 AI 伴侣</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <label className="setting-btn upload-btn" style={{ cursor: 'pointer' }}>
                  📷 上传头像
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="avatar-file-input" />
                </label>
                {eliosAvatar && <button className="setting-btn danger" onClick={removeAvatar}>🗑️ 移除</button>}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>🖼️ 壁纸</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div>
                <span>当前壁纸</span>
                <small>主屏幕背景</small>
              </div>
              <button className="setting-btn" onClick={() => setShowWallpaperPicker(!showWallpaperPicker)}>
                {wallpaper ? '更换' : '设置壁纸'}
              </button>
            </div>
            {showWallpaperPicker && (
              <div style={{ marginTop: 10 }}>
                <div className="wallpaper-grid">
                  {WALLPAPERS.map(wp => (
                    <button key={wp.id} className={`wallpaper-opt ${wallpaper === wp.gradient || (!wallpaper && wp.id === 'none') ? 'active' : ''}`} onClick={() => applyWallpaper(wp)}>
                      <div style={{ width: '100%', height: '100%', background: wp.gradient, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: wp.id === 'none' ? 'var(--text-secondary)' : 'rgba(255,255,255,0.8)' }}>{wp.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="setting-item" style={{ borderBottom: 'none' }}>
              <div>
                <span>自定义壁纸</span>
                <small>上传图片作为壁纸</small>
              </div>
              <label className="setting-btn upload-btn" style={{ cursor: 'pointer' }}>
                📁 选择图片
                <input type="file" accept="image/*" className="avatar-file-input" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    const r = new FileReader()
                    r.onload = (ev) => {
                      setWallpaper(ev.target.result)
                      localStorage.setItem('elios-wallpaper', ev.target.result)
                      setShowWallpaperPicker(false)
                    }
                    r.readAsDataURL(f)
                  }
                }} />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>🌐 连接状态</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div>
                <span>后端服务</span>
                <small>API 服务地址</small>
              </div>
              <span className="setting-value mono">{api}</span>
            </div>
            <div className="setting-item" style={{ borderBottom: 'none' }}>
              <div>
                <span>服务器状态</span>
                <small>实时连接状态</small>
              </div>
              <div className="status-indicator">
                <span className={`status-dot ${serverStatus}`}></span>
                <span>{serverStatus === 'online' ? '在线' : serverStatus === 'offline' ? '离线' : '检测中...'}</span>
              </div>
            </div>
          </div>
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total_messages || 0}</div>
                <div className="stat-label">累计对话</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.memory_cards || 0}</div>
                <div className="stat-label">记忆卡片</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.total_cost || 0}</div>
                <div className="stat-label">Token</div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>💾 数据管理</h3>
          <div className="settings-card">
            <div className="data-actions">
              <button className="data-action-btn danger" onClick={clearData}>
                <span className="action-icon">🗑️</span>
                <span className="action-title">清除对话</span>
                <span className="action-desc">删除所有聊天记录</span>
              </button>
              <button className="data-action-btn" onClick={() => {
                const data = {
                  diaries: JSON.parse(localStorage.getItem('elios-chat') || '[]'),
                  avatar: localStorage.getItem('elios-avatar') || '',
                  wallpaper: localStorage.getItem('elios-wallpaper') || ''
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `elios-backup-${new Date().toISOString().slice(0,10)}.json`
                a.click()
              }}>
                <span className="action-icon">📥</span>
                <span className="action-title">导出数据</span>
                <span className="action-desc">备份设置与对话</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0 8px', opacity: 0.4 }}>
          <p style={{ fontSize: 12, marginBottom: 2 }}>Elios v1.0</p>
        </div>
      </div>
    </div>
  )
}
