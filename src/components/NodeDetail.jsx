import { useState, useEffect } from 'react'
import {
  getChildren, createNode, updateNode, deleteNode,
  getJournalByNode, addJournalEntry, deleteJournalEntry,
} from '../lib/storage'
import CreateNodeModal from './CreateNodeModal'
import JournalEntryForm from './JournalEntryForm'

const MOODS = ['😩', '😕', '😐', '🙂', '😄']

function formatTime(iso) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function NodeDetail({ node, onNavigate, onBack, onNodeUpdated }) {
  const [children, setChildren] = useState([])
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateNode, setShowCreateNode] = useState(false)
  const [showCreateJournal, setShowCreateJournal] = useState(false)
  const [editingExp, setEditingExp] = useState(false)
  const [expDraft, setExpDraft] = useState(node.expectation || '')
  const [editingContent, setEditingContent] = useState(false)
  const [contentDraft, setContentDraft] = useState(node.content || '')

  useEffect(() => {
    loadData()
  }, [node.id])

  async function loadData() {
    setLoading(true)
    try {
      const [ch, jn] = await Promise.all([
        getChildren(node.id),
        getJournalByNode(node.id),
      ])
      setChildren(ch)
      setJournals(jn)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNode({ type, title, expectation }) {
    const newNode = await createNode({ parentId: node.id, type, title, expectation })
    setChildren(prev => [...prev, newNode])
    setShowCreateNode(false)
  }

  async function handleToggleTask(child) {
    await updateNode(child.id, { done: !child.done })
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, done: !c.done } : c))
  }

  async function handleDeleteChild(id) {
    if (!confirm('确定删除？子节点也会一并删除。')) return
    await deleteNode(id)
    setChildren(prev => prev.filter(c => c.id !== id))
  }

  async function handleSaveExp() {
    await updateNode(node.id, { expectation: expDraft })
    onNodeUpdated({ ...node, expectation: expDraft })
    setEditingExp(false)
  }

  async function handleSaveContent() {
    await updateNode(node.id, { content: contentDraft })
    onNodeUpdated({ ...node, content: contentDraft })
    setEditingContent(false)
  }

  async function handleAddJournal({ nodeId, mood, currentTask, distraction, content }) {
    const entry = await addJournalEntry({ nodeId, mood, currentTask, distraction, content })
    setJournals(prev => [entry, ...prev])
    setShowCreateJournal(false)
  }

  async function handleDeleteJournal(id) {
    await deleteJournalEntry(id)
    setJournals(prev => prev.filter(j => j.id !== id))
  }

  const tasks = children.filter(c => c.type === 'task')
  const blocks = children.filter(c => c.type === 'block')
  const subAreas = children.filter(c => c.type === 'area')
  const pendingTasks = tasks.filter(t => !t.done && !t.is_reminder)
  const reminderTasks = tasks.filter(t => t.is_reminder)
  const doneTasks = tasks.filter(t => t.done)

  return (
    <div className="node-detail">
      {/* Expectation */}
      {(node.type === 'area' || node.expectation) && (
        <div className="detail-expectation">
          {editingExp ? (
            <div className="exp-edit">
              <textarea value={expDraft} onChange={e => setExpDraft(e.target.value)} rows={2} autoFocus />
              <div className="exp-edit-actions">
                <button onClick={handleSaveExp}>保存</button>
                <button onClick={() => { setEditingExp(false); setExpDraft(node.expectation || '') }}>取消</button>
              </div>
            </div>
          ) : (
            <p className="expectation-text" onClick={() => setEditingExp(true)}>
              💬 {node.expectation || '点击添加期望...'}
            </p>
          )}
        </div>
      )}

      {/* 自由板块内容 */}
      {node.type === 'block' && (
        <div className="detail-content">
          {editingContent ? (
            <div className="content-edit">
              <textarea value={contentDraft} onChange={e => setContentDraft(e.target.value)} rows={6} autoFocus />
              <div className="exp-edit-actions">
                <button onClick={handleSaveContent}>保存</button>
                <button onClick={() => { setEditingContent(false); setContentDraft(node.content || '') }}>取消</button>
              </div>
            </div>
          ) : (
            <p className="content-text" onClick={() => setEditingContent(true)}>
              {node.content || '点击开始写...'}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-hint">加载中...</div>
      ) : (
        <>
          {/* 子领域 */}
          {subAreas.length > 0 && (
            <section className="detail-section">
              <div className="section-label">子领域</div>
              {subAreas.map(child => (
                <div key={child.id} className="child-row" onClick={() => onNavigate(child)}>
                  <span className="child-icon">🗂️</span>
                  <span className="child-title">{child.title}</span>
                  <span className="child-chevron">›</span>
                </div>
              ))}
            </section>
          )}

          {/* 任务 */}
          {(pendingTasks.length > 0 || reminderTasks.length > 0 || doneTasks.length > 0) && (
            <section className="detail-section">
              <div className="section-label">任务</div>
              {reminderTasks.map(t => (
                <div key={t.id} className={`task-row ${t.done ? 'done' : ''}`}>
                  <button className="task-check reminder" onClick={() => handleToggleTask(t)}>
                    {t.done ? '✓' : '○'}
                  </button>
                  <span className="task-text">{t.title}</span>
                  <span className="reminder-badge">长期</span>
                  <button className="task-delete" onClick={() => handleDeleteChild(t.id)}>×</button>
                </div>
              ))}
              {pendingTasks.map(t => (
                <div key={t.id} className="task-row">
                  <button className="task-check" onClick={() => handleToggleTask(t)}>○</button>
                  <span className="task-text">{t.title}</span>
                  <button className="task-delete" onClick={() => handleDeleteChild(t.id)}>×</button>
                </div>
              ))}
              {doneTasks.length > 0 && (
                <details className="done-tasks">
                  <summary>已完成 ({doneTasks.length})</summary>
                  {doneTasks.map(t => (
                    <div key={t.id} className="task-row done">
                      <button className="task-check done" onClick={() => handleToggleTask(t)}>✓</button>
                      <span className="task-text">{t.title}</span>
                      <button className="task-delete" onClick={() => handleDeleteChild(t.id)}>×</button>
                    </div>
                  ))}
                </details>
              )}
            </section>
          )}

          {/* 自由板块 */}
          {blocks.length > 0 && (
            <section className="detail-section">
              <div className="section-label">板块</div>
              {blocks.map(b => (
                <div key={b.id} className="child-row" onClick={() => onNavigate(b)}>
                  <span className="child-icon">📝</span>
                  <span className="child-title">{b.title}</span>
                  <span className="child-chevron">›</span>
                </div>
              ))}
            </section>
          )}

          {/* 日志 */}
          <section className="detail-section">
            <div className="section-header-row">
              <div className="section-label">日志</div>
              <button className="btn-small" onClick={() => setShowCreateJournal(true)}>+ 记录</button>
            </div>
            {journals.length === 0 && <p className="empty-hint">还没有日志</p>}
            {journals.map(j => (
              <div key={j.id} className="journal-entry">
                <div className="journal-meta">
                  {j.mood && <span>{MOODS[j.mood - 1]}</span>}
                  <span className="journal-time">{formatTime(j.created_at)}</span>
                  <button className="task-delete" onClick={() => handleDeleteJournal(j.id)}>×</button>
                </div>
                {j.current_task && <p className="journal-field"><span>在做：</span>{j.current_task}</p>}
                {j.distraction && <p className="journal-field distraction"><span>挂着：</span>{j.distraction}</p>}
                {j.content && <p className="journal-field">{j.content}</p>}
              </div>
            ))}
          </section>
        </>
      )}

      {/* 底部操作栏 */}
      <div className="detail-actions">
        <button className="btn-secondary" onClick={() => setShowCreateNode(true)}>+ 新建子节点</button>
      </div>

      {showCreateNode && (
        <CreateNodeModal
          parentType={node.type}
          onConfirm={handleCreateNode}
          onCancel={() => setShowCreateNode(false)}
        />
      )}

      {showCreateJournal && (
        <JournalEntryForm
          nodeId={node.id}
          nodeName={node.title}
          onSubmit={handleAddJournal}
          onCancel={() => setShowCreateJournal(false)}
        />
      )}
    </div>
  )
}
