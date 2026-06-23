import { useState } from 'react'
import { signInWithEmail, signInWithPassword } from '../lib/storage'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('magic') // 'magic' | 'password'
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    if (mode === 'magic') {
      const { error } = await signInWithEmail(email.trim())
      setLoading(false)
      if (error) setError(error.message)
      else setSent(true)
    } else {
      const { error } = await signInWithPassword(email.trim(), password)
      setLoading(false)
      if (error) setError(error.message)
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
            {mode === 'password' && (
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="密码"
                required
              />
            )}
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? '登录中...' : mode === 'magic' ? '发送登录链接' : '登录'}
            </button>
            <button
              type="button"
              style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}
              onClick={() => { setMode(mode === 'magic' ? 'password' : 'magic'); setError('') }}
            >
              {mode === 'magic' ? '用密码登录' : '用邮件链接登录'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
