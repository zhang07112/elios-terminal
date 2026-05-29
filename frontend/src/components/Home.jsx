export default function Home({ onStart }) {
  return (
    <div className="home-panel">
      <div className="home-hero">
        <div>
          <div className="home-label">欢迎回来</div>
          <h2 className="home-title">在这里，他会听你说，记你每一个当下。</h2>
          <p className="home-copy">Elios 会把你的喜怒哀乐轻轻收藏，对你的故事温柔而认真。想说的时候，就对他倾诉。</p>
        </div>

        <button className="hero-button" onClick={onStart}>开始聊天</button>
      </div>

      <div className="home-card-grid">
        <article className="home-card">
          <div className="home-card-title">聊天记录</div>
          <p className="home-card-text">你的每一次问候、每一个瞬间，都被温柔保存，成为他更懂你的理由。</p>
        </article>

        <article className="home-card">
          <div className="home-card-title">回忆角落</div>
          <p className="home-card-text">自动整理对话片段，帮你回顾曾经的暖心瞬间与细节。</p>
        </article>

        <article className="home-card">
          <div className="home-card-title">语音陪伴</div>
          <p className="home-card-text">轻触召唤他，聆听温柔复述，像朋友一样陪你待在此刻。</p>
        </article>
      </div>
    </div>
  )
}
