import { useState } from 'react'

const MOODS = ['😩', '😕', '😐', '🙂', '😄']

function formatTime(iso) {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min}`
}

export default function StatusLog({ logs, onAdd, onDelete }) {
  const [mood, setMood] = useState(3)
  const [current, setCurrent] = useState('')
  const [distraction, setDistraction] = useState('')
  const [note, setNote] = useState('')
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onAdd(mood, current, distraction, note)
    setCurrent('')
    setDistraction('')
    setNote('')
    setMood(3)
    setShowForm(false)
  }

  return (
    <div className="status-log">
      <div className="status-header">
        <h2>状态快照</h2>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '取消' : '+ 记一条'}
        </button>
      </div>

      {showForm && (
        <form className="log-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>此刻心情</label>
            <div className="mood-picker">
              {MOODS.map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  className={`mood-btn ${mood === i + 1 ? 'selected' : ''}`}
                  onClick={() => setMood(i + 1)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>现在在做</label>
            <input
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="眼下这件事是..."
            />
          </div>

          <div className="form-row">
            <label>脑子里挂着</label>
            <input
              value={distraction}
              onChange={e => setDistraction(e.target.value)}
              placeholder="有什么让你分心的..."
            />
          </div>

          <div className="form-row">
            <label>随便说说</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="想说什么都行..."
              rows={3}
            />
          </div>

          <button type="submit" className="btn-primary full-width">记录</button>
        </form>
      )}

      <div className="log-list">
        {logs.length === 0 && (
          <p className="empty-hint">还没有记录，随时记一条状态快照吧</p>
        )}
        {logs.map(log => (
          <div key={log.id} className="log-entry">
            <div className="log-meta">
              <span className="log-mood">{MOODS[log.mood - 1]}</span>
              <span className="log-time">{formatTime(log.created_at)}</span>
              <button className="log-delete" onClick={() => onDelete(log.id)}>×</button>
            </div>
            {log.current_task && <p className="log-field"><span>在做：</span>{log.current_task}</p>}
            {log.distraction && <p className="log-field distraction"><span>挂着：</span>{log.distraction}</p>}
            {log.note && <p className="log-field note">{log.note}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
