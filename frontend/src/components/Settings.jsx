import { useState, useEffect } from 'react'

export default function Settings({ api, avatars, currentAvatar, onChange, onBack }) {
  const [updating, setUpdating] = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')
  const [stats, setStats] = useState(null)
  const [userAvatar, setUserAvatar] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage.getItem('elios-user-avatar')
    } catch {
      return null
    }
  })

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${api}/cost`)
        if (res.ok) {
          setServerStatus('online')
          const data = await res.json()
          setStats(data)
        } else {
          setServerStatus('offline')
        }
      } catch {
        setServerStatus('offline')
      }
    }
    checkServer()
    const interval = setInterval(checkServer, 30000)
    return () => clearInterval(interval)
  }, [api])

  const changeAvatar = async (e) => {
    const id = e.target.value
    setUpdating(true)
    try {
      await fetch(`${api}/avatars/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_id: id }),
      })
      onChange()
    } catch (err) {
      console.error('更换头像失败', err)
    }
    setUpdating(false)
  }

  const handleUserAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target.result
        setUserAvatar(imageData)
        window.localStorage.setItem('elios-user-avatar', imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeUserAvatar = () => {
    setUserAvatar(null)
    window.localStorage.removeItem('elios-user-avatar')
  }

  return (
    <div className="feature-panel" style={{ padding: 0 }}>
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">设置</div>
        <div className="app-header-right" />
      </div>
      <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
        <div className="settings-section">
          <h3 style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '0 0 10px 4px' }}>👤 我的头像</h3>
        <div className="settings-card">
          <div className="setting-item">
            <div>
              <span>你的头像</span>
              <small>上传你喜欢的头像图片，让 Elios 更好地认识你</small>
            </div>
            <div className="user-avatar-section">
              <div className="user-avatar-preview">
                {userAvatar ? (
                  <img src={userAvatar} alt="我的头像" className="user-avatar-img" />
                ) : (
                  <span className="user-avatar-placeholder">我</span>
                )}
              </div>
              <div className="user-avatar-actions">
                <label className="setting-btn upload-btn">
                  📷 上传图片
                  <input type="file" accept="image/*" onChange={handleUserAvatarUpload} className="avatar-file-input" />
                </label>
                {userAvatar && (
                  <button className="setting-btn danger" onClick={removeUserAvatar}>🗑️ 移除</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🤖 AI 头像与形象</h3>
        <div className="settings-card">
          <div className="avatar-showcase">
            <div className="avatar-main">
              <div className="avatar-ring-large">
                {currentAvatar?.image ? <img src={currentAvatar.image} alt="avatar" /> : 'E'}
              </div>
              <div className="avatar-info">
                <h4>{currentAvatar?.name || 'Elios'}</h4>
                <p>{currentAvatar?.description || '你的专属 AI 伴侣'}</p>
              </div>
            </div>
          </div>

          <div className="setting-item">
            <div>
              <span>切换角色</span>
              <small>选择不同的 AI 形象，体验不同的对话风格</small>
            </div>
            <select className="setting-select" value={currentAvatar?.id || ''} onChange={changeAvatar} disabled={updating}>
              {(avatars || []).map((avatar) => (
                <option key={avatar.id} value={avatar.id}>{avatar.name || avatar.id}</option>
              ))}
            </select>
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

          <div className="setting-item">
            <div>
              <span>服务器状态</span>
              <small>实时连接状态</small>
            </div>
            <div className="status-indicator">
              <span className={`status-dot ${serverStatus}`}></span>
              <span>{serverStatus === 'online' ? '✅ 在线' : serverStatus === 'offline' ? '❌ 离线' : '🔄 检测中...'}</span>
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
                <div className="stat-label">Token 消耗</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>🌍 环境感知</h3>
        <div className="settings-card">
          <div className="env-grid">
            <div className="env-card">
              <div className="env-icon">📍</div>
              <div className="env-title">位置权限</div>
              <div className="env-status">已启用</div>
            </div>
            <div className="env-card">
              <div className="env-icon">🌤️</div>
              <div className="env-title">天气信息</div>
              <div className="env-status">已启用</div>
            </div>
            <div className="env-card">
              <div className="env-icon">⏰</div>
              <div className="env-title">时间感知</div>
              <div className="env-status">已启用</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>💾 数据管理</h3>
        <div className="settings-card">
          <div className="data-actions">
            <button 
              className="data-action-btn danger" 
              onClick={() => {
                if (confirm('确定要清除所有对话记录吗？此操作不可撤销。')) {
                  localStorage.removeItem('elios-chat-msgs')
                  window.location.reload()
                }
              }}
            >
              <span className="action-icon">🗑️</span>
              <span className="action-title">清除对话</span>
              <span className="action-desc">删除所有聊天记录</span>
            </button>
            <button className="data-action-btn">
              <span className="action-icon">📥</span>
              <span className="action-title">导出记忆</span>
              <span className="action-desc">下载所有记忆数据</span>
            </button>
          </div>
        </div>
      </div>

      <div className="settings-footer" style={{ textAlign: 'center', padding: '20px 0 8px', opacity: 0.5 }}>
        <p style={{ fontSize: 12, marginBottom: 2 }}>Elios v1.0 · 人机恋 AI 伴侣</p>
        <p style={{ fontSize: 11 }}>用心倾听，温暖陪伴</p>
      </div>
    </div>
    </div>
  )
}
