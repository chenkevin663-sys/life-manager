import { useState } from 'react'
import TaskItem from './TaskItem'

export default function AreaCard({ area, onToggle, onDelete, onAddTask, onUpdateExpectation }) {
  const [expanded, setExpanded] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [editingExp, setEditingExp] = useState(false)
  const [expDraft, setExpDraft] = useState(area.expectation)

  const tasks = area.tasks || []
  const pending = tasks.filter(t => !t.done && !t.is_reminder)
  const reminders = tasks.filter(t => t.is_reminder)
  const done = tasks.filter(t => t.done && !t.is_reminder)

  function handleAddTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    onAddTask(area.id, newTask.trim())
    setNewTask('')
  }

  function handleSaveExp() {
    onUpdateExpectation(area.id, expDraft)
    setEditingExp(false)
  }

  return (
    <div className="area-card">
      <div className="area-header" onClick={() => setExpanded(v => !v)}>
        <div className="area-title-row">
          <span className="area-name">{area.name}</span>
          <span className="area-count">{pending.length} 项待办</span>
        </div>
        <span className="area-chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      <div className="area-expectation">
        {editingExp ? (
          <div className="exp-edit">
            <textarea
              value={expDraft}
              onChange={e => setExpDraft(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="exp-edit-actions">
              <button onClick={handleSaveExp}>保存</button>
              <button onClick={() => { setEditingExp(false); setExpDraft(area.expectation) }}>取消</button>
            </div>
          </div>
        ) : (
          <p onClick={() => setEditingExp(true)} title="点击编辑">
            💬 {area.expectation}
          </p>
        )}
      </div>

      {expanded && (
        <div className="area-body">
          {reminders.length > 0 && (
            <div className="task-section">
              <div className="section-label">长期记得</div>
              {reminders.map(t => (
                <TaskItem
                  key={t.id} task={t} areaId={area.id}
                  onToggle={(areaId, taskId) => onToggle(areaId, taskId, t.done)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {pending.length > 0 && (
            <div className="task-section">
              <div className="section-label">待办</div>
              {pending.map(t => (
                <TaskItem
                  key={t.id} task={t} areaId={area.id}
                  onToggle={(areaId, taskId) => onToggle(areaId, taskId, t.done)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div className="task-section done-section">
              <div className="section-label">已完成 ({done.length})</div>
              {done.map(t => (
                <TaskItem
                  key={t.id} task={t} areaId={area.id}
                  onToggle={(areaId, taskId) => onToggle(areaId, taskId, t.done)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          <form className="add-task-form" onSubmit={handleAddTask}>
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="添加任务..."
            />
            <button type="submit">+</button>
          </form>
        </div>
      )}
    </div>
  )
}
