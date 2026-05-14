import { useState } from 'react'
import { signInWithEmail } from '../lib/storage'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await signInWithEmail(email.trim())
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>我的生活</h1>
        <p className="login-sub">用邮箱登录，数据跨设备同步</p>

        {sent ? (
          <div className="login-sent">
            <span className="sent-icon">📬</span>
            <p>登录链接已发送到</p>
            <p className="sent-email">{email}</p>
            <p className="sent-hint">点击邮件里的链接即可登录，可以关闭这个页面</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="你的邮箱"
              required
              autoFocus
            />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? '发送中...' : '发送登录链接'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
