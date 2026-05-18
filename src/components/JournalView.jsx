import { useState, useEffect } from 'react'
import { getJournalDates, getJournalByDate, addJournalEntry, deleteJournalEntry } from '../lib/storage'
import JournalEntryForm from './JournalEntryForm'

const MOODS = ['😩', '😕', '😐', '🙂', '😄']

function formatTime(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function JournalView() {
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [entries, setEntries] = useState([])
  const [loadingDates, setLoadingDates] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    loadDates()
  }, [])

  useEffect(() => {
    if (selectedDate) loadEntries(selectedDate)
  }, [selectedDate])

  async function loadDates() {
    setLoadingDates(true)
    try {
      const d = await getJournalDates()
      // 确保今天在列表里
      const all = d.includes(today) ? d : [today, ...d]
      setDates(all)
      setSelectedDate(all[0])
    } finally {
      setLoadingDates(false)
    }
  }

  async function loadEntries(date) {
    setLoadingEntries(true)
    try {
      const data = await getJournalByDate(date)
      setEntries(data)
    } finally {
      setLoadingEntries(false)
    }
  }

  async function handleAddEntry({ nodeId, mood, currentTask, distraction, content }) {
    const entry = await addJournalEntry({
      nodeId,
      mood,
      currentTask,
      distraction,
      content,
      entryDate: selectedDate,
    })
    setEntries(prev => [...prev, entry])
    // 如果是新日期，加入列表
    if (!dates.includes(selectedDate)) {
      setDates(prev => [selectedDate, ...prev])
    }
    setShowForm(false)
  }

  async function handleDelete(id) {
    await deleteJournalEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="journal-view">
      {/* 日期选择器 */}
      <div className="date-tabs">
        {loadingDates ? (
          <span className="loading-hint">加载中...</span>
        ) : (
          dates.map(date => (
            <button
              key={date}
              className={`date-tab ${selectedDate === date ? 'active' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              {date === today ? '今天' : formatDate(date)}
            </button>
          ))
        )}
      </div>

      {/* 当天日志 */}
      <div className="journal-day">
        <div className="journal-day-header">
          <span className="journal-day-title">
            {selectedDate === today ? '今天' : selectedDate ? formatDate(selectedDate) : ''}
          </span>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ 记一条</button>
        </div>

        {loadingEntries ? (
          <div className="loading-hint">加载中...</div>
        ) : entries.length === 0 ? (
          <p className="empty-hint">今天还没有记录</p>
        ) : (
          <div className="journal-list">
            {entries.map(entry => (
              <div key={entry.id} className="journal-entry">
                <div className="journal-meta">
                  {entry.mood && <span className="journal-mood">{MOODS[entry.mood - 1]}</span>}
                  <span className="journal-time">{formatTime(entry.created_at)}</span>
                  {entry.nodes && (
                    <span className="journal-node-tag">#{entry.nodes.title}</span>
                  )}
                  <button className="task-delete" onClick={() => handleDelete(entry.id)}>×</button>
                </div>
                {entry.current_task && <p className="journal-field"><span>在做：</span>{entry.current_task}</p>}
                {entry.distraction && <p className="journal-field distraction"><span>挂着：</span>{entry.distraction}</p>}
                {entry.content && <p className="journal-field">{entry.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <JournalEntryForm
          nodeId={null}
          nodeName={null}
          onSubmit={handleAddEntry}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
