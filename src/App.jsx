import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { signOut } from './lib/storage'
import TreeNavigator from './components/TreeNavigator'
import JournalView from './components/JournalView'
import Login from './components/Login'
import './index.css'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [tab, setTab] = useState('tree')

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <div>
            <h1>我的生活</h1>
            <p className="header-date">{today}</p>
          </div>
          <button className="signout-btn" onClick={signOut} title="退出登录">⎋</button>
        </div>
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
