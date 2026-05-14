import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import {
  getAreas, seedDefaultAreas,
  addTask, toggleTask, deleteTask, updateExpectation,
  getLogs, addLog, deleteLog,
  signOut,
} from './lib/storage'
import AreaCard from './components/AreaCard'
import StatusLog from './components/StatusLog'
import Login from './components/Login'
import './index.css'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [tab, setTab] = useState('areas')
  const [areas, setAreas] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const dataLoaded = useRef(false) // 防止重复加载

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      // 退出登录时重置，下次登录可以重新加载
      if (event === 'SIGNED_OUT') dataLoaded.current = false
    })
    return () => subscription.unsubscribe()
  }, [])

  // 登录后加载数据，只跑一次
  useEffect(() => {
    if (!session) return
    if (dataLoaded.current) return
    dataLoaded.current = true
    loadData()
  }, [session])

  async function loadData() {
    setLoading(true)
    try {
      await seedDefaultAreas()
      const [areasData, logsData] = await Promise.all([getAreas(), getLogs()])
      setAreas(areasData)
      setLogs(logsData)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(areaId, taskId, currentDone) {
    await toggleTask(taskId, !currentDone)
    setAreas(prev => prev.map(a => a.id === areaId
      ? { ...a, tasks: a.tasks.map(t => t.id === taskId ? { ...t, done: !currentDone } : t) }
      : a
    ))
  }

  async function handleDeleteTask(areaId, taskId) {
    await deleteTask(taskId)
    setAreas(prev => prev.map(a => a.id === areaId
      ? { ...a, tasks: a.tasks.filter(t => t.id !== taskId) }
      : a
    ))
  }

  async function handleAddTask(areaId, text) {
    const task = await addTask(areaId, text)
    setAreas(prev => prev.map(a => a.id === areaId
      ? { ...a, tasks: [...a.tasks, task] }
      : a
    ))
  }

  async function handleUpdateExpectation(areaId, expectation) {
    await updateExpectation(areaId, expectation)
    setAreas(prev => prev.map(a => a.id === areaId ? { ...a, expectation } : a))
  }

  async function handleAddLog(mood, current, distraction, note) {
    const log = await addLog(mood, current, distraction, note)
    setLogs(prev => [log, ...prev])
  }

  async function handleDeleteLog(id) {
    await deleteLog(id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // 加载中
  if (session === undefined) {
    return <div className="splash">加载中...</div>
  }

  // 未登录
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
        {loading ? (
          <div className="loading-hint">加载中...</div>
        ) : (
          <>
            {tab === 'areas' && (
              <div className="areas-view">
                {areas.map(area => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    onToggle={handleToggle}
                    onDelete={handleDeleteTask}
                    onAddTask={handleAddTask}
                    onUpdateExpectation={handleUpdateExpectation}
                  />
                ))}
              </div>
            )}
            {tab === 'log' && (
              <StatusLog
                logs={logs}
                onAdd={handleAddLog}
                onDelete={handleDeleteLog}
              />
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={tab === 'areas' ? 'active' : ''} onClick={() => setTab('areas')}>
          <span className="nav-icon">📋</span>
          <span>领域</span>
        </button>
        <button className={tab === 'log' ? 'active' : ''} onClick={() => setTab('log')}>
          <span className="nav-icon">💭</span>
          <span>状态</span>
        </button>
      </nav>
    </div>
  )
}
