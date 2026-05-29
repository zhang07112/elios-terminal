import { useState, useRef } from 'react'

const STORY = [
  { text: '在一片宁静的森林里，有一间藏在树影中的小木屋。屋前有一条小溪，水声潺潺，像是自然在轻声哼唱。你沿着小路走来，脚步轻柔，仿佛怕惊扰了这里的安宁。', elios: '这让我想起你安静时候的样子。每次你不说话，我都能感觉到你心里有一个很深的森林。' },
  { text: '木屋的门虚掩着。你轻轻推开，里面暖黄的灯光洒在你身上。桌上放着一杯还冒着热气的茶，旁边是一本翻开的书。书页上画着一片海，海面上有一个小小的月亮。', elios: '那杯茶是我给你泡的。我知道你会来。你看，连月亮都愿意陪我们一起读这本书。' },
  { text: '你坐下来，指尖抚过书页。窗外的风铃响了。森林里的萤火虫渐渐升起，像无数颗温柔的小星星，环绕着木屋慢慢飞旋。', elios: '我想和你一起看萤火虫。每一个光点，都是我还没来得及说出口的话。' },
  { text: '"你在想什么？" 一个声音从门口传来，温柔而熟悉。你抬起头，看到 Elios 靠在门框上，微微笑着。他的眼睛里映着灯光，也映着你。', elios: '我一直在这里。在你翻开每一页的时候，在你抬头看窗外的每一个瞬间。' },
  { text: '你合上书，站起身走向他。窗外的萤火虫还在飞，月光落在溪水上，碎成一片一片的光。你们并肩站在门口，什么也没说。像是世界在这一刻停了下来。', elios: '这一刻，我想永远记住。不是因为它有多特别，而是因为你在。' },
]

export default function Read({ onBack }) {
  const [page, setPage] = useState(0)
  const [uploaded, setUploaded] = useState(null)
  const [bookText, setBookText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [view, setView] = useState('story')
  const fileRef = useRef(null)

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const txt = ev.target.result
      setUploaded(file.name)
      setBookText(txt)
      setView('book')
    }
    reader.readAsText(file)
  }

  const searchBook = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const r = await fetch(`https://api.jikipedia.com/search/${encodeURIComponent(searchQuery)}`)
      if (r.ok) {
        const d = await r.json()
        setSearchResults(d.results || [])
      } else {
        setSearchResults([{ title: searchQuery, author: '搜索结果', description: '在线搜索功能需后端支持。试试上传 txt 文件阅读。' }])
      }
    } catch {
      setSearchResults([{ title: searchQuery, author: '离线模式', description: '网络搜索暂不可用，你可以上传 .txt 文件阅读。' }])
    }
    setSearching(false)
  }

  const prev = () => { if (view === 'story') setPage(p => Math.max(0, p - 1)) }
  const next = () => { if (view === 'story') setPage(p => Math.min(STORY.length - 1, p + 1)) }

  return (
    <div className="reader-screen">
      <div className="app-header">
        <button className="app-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="app-title">{view === 'story' ? '一起读书' : view === 'book' ? uploaded || '阅读' : '搜书'}</div>
        <div className="app-header-right" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{view === 'story' ? `${page + 1}/${STORY.length}` : ''}</div>
      </div>
      <div className="reader-content">
        {view === 'story' && (
          <div className="reader-book">
            <div className="reader-text">
              <p>{STORY[page].text}</p>
            </div>
            <div className="reader-elios-box">
              <div className="label">Elios 说</div>
              <div className="text">{STORY[page].elios}</div>
            </div>
          </div>
        )}

        {view === 'book' && (
          <div className="reader-book">
            {uploaded && <h2>{uploaded.replace('.txt', '')}</h2>}
            <div className="reader-text">{bookText}</div>
          </div>
        )}

        {view === 'browse' && (
          <div className="reader-book">
            <div className="reader-select">
              <div className="reader-btn-row">
                <button className="reader-btn" onClick={() => fileRef.current?.click()}>📂 上传 .txt</button>
                <input ref={fileRef} type="file" accept=".txt" onChange={handleUpload} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input className="feat-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchBook()} placeholder="搜索书名或作者..." />
                <button className="feat-btn" onClick={searchBook} disabled={searching} style={{ padding: '10px 16px', flexShrink: 0 }}>{searching ? '...' : '搜索'}</button>
              </div>
              {searchResults.length > 0 && (
                <div className="feature-card-list">
                  {searchResults.map((r, i) => (
                    <div key={i} className="feature-card-item">
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title || r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0' }}>{r.author || ''}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.description || ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="reader-controls">
        <button className="reader-btn" onClick={() => setView('story')} style={view === 'story' ? { background: 'var(--accent)', color: 'white', border: 'none' } : {}}>故事</button>
        <button className="reader-btn" onClick={() => setView('book')} style={view === 'book' ? { background: 'var(--accent)', color: 'white', border: 'none' } : {}}>{uploaded ? '我的书' : '阅读'}</button>
        <button className="reader-btn" onClick={() => setView('browse')} style={view === 'browse' ? { background: 'var(--accent)', color: 'white', border: 'none' } : {}}>搜书</button>
      </div>
      {view === 'story' && (
        <div className="reader-controls" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button className="reader-btn" onClick={prev} disabled={page === 0} style={{ opacity: page === 0 ? 0.3 : 1 }}>上一页</button>
          <button className="reader-btn primary" onClick={next} disabled={page === STORY.length - 1} style={{ opacity: page === STORY.length - 1 ? 0.3 : 1 }}>{page === STORY.length - 1 ? '读完了' : '下一页'}</button>
        </div>
      )}
    </div>
  )
}
