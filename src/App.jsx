import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { signOut, updatePassword } from './lib/storage'
import TreeNavigator from './components/TreeNavigator'
import JournalView from './components/JournalView'
import Login from './components/Login'
import './index.css'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [tab, setTab] = useState('tree')
  const [showPwForm, setShowPwForm] = useState(false)
  const [pw, setPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <div className="splash">加载中...</div>
  }

  if (!session) {
    return <Login />
  }

  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  async function handleSetPassword(e) {
    e.preventDefault()
    const { error } = await updatePassword(pw)
    if (error) setPwMsg('失败：' + error.message)
    else { setPwMsg('密码设置成功！'); setPw(''); setTimeout(() => setShowPwForm(false), 1500) }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <div>
            <h1>我的生活</h1>
            <p className="header-date">{today}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="signout-btn" onClick={() => setShowPwForm(v => !v)} title="设置密码">🔑</button>
            <button className="signout-btn" onClick={signOut} title="退出登录">⎋</button>
          </div>
        </div>
        {showPwForm && (
          <form onSubmit={handleSetPassword} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="设置新密码" style={{ flex: 1 }} required />
            <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: '0 12px' }}>确定</button>
          </form>
        )}
        {pwMsg && <p style={{ fontSize: '13px', color: 'var(--done)', marginTop: '6px' }}>{pwMsg}</p>}
      </header>

      <main className="app-main">
        {tab === 'tree' && <TreeNavigator />}
        {tab === 'journal' && <JournalView />}
      </main>

      <nav className="bottom-nav">
        <button className={tab === 'tree' ? 'active' : ''} onClick={() => setTab('tree')}>
          <span className="nav-icon">🗂️</span>
          <span>领域</span>
        </button>
        <button className={tab === 'journal' ? 'active' : ''} onClick={() => setTab('journal')}>
          <span className="nav-icon">📖</span>
          <span>日志</span>
        </button>
      </nav>
    </div>
  )
}
