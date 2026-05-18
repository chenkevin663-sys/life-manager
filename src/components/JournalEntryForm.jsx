import { useState } from 'react'

const MOODS = ['😩', '😕', '😐', '🙂', '😄']

export default function JournalEntryForm({ nodeId = null, nodeName = null, onSubmit, onCancel }) {
  const [mood, setMood] = useState(3)
  const [currentTask, setCurrentTask] = useState('')
  const [distraction, setDistraction] = useState('')
  const [content, setContent] = useState('')
  const isStatusLog = nodeId === null // 总日志模式

  function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() && !currentTask.trim()) return
    onSubmit({ nodeId, mood: isStatusLog ? mood : null, currentTask, distraction, content })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{nodeName ? `${nodeName} · 日志` : '状态快照'}</h3>

        <form onSubmit={handleSubmit}>
          {isStatusLog && (
            <>
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
                  value={currentTask}
                  onChange={e => setCurrentTask(e.target.value)}
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
            </>
          )}

          <div className="form-row">
            <label>{isStatusLog ? '随便说说' : '记录'}</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="想说什么都行..."
              rows={4}
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>取消</button>
            <button type="submit" className="btn-primary">记录</button>
          </div>
        </form>
      </div>
    </div>
  )
}
