import { useState } from 'react'

const NODE_TYPES = {
  area: { label: '领域', icon: '🗂️' },
  task: { label: '任务', icon: '✓' },
  block: { label: '自由板块', icon: '📝' },
}

export default function CreateNodeModal({ parentType, onConfirm, onCancel }) {
  const [type, setType] = useState(parentType === null ? 'area' : 'task')
  const [title, setTitle] = useState('')
  const [expectation, setExpectation] = useState('')

  // 根据父节点类型决定可选的子节点类型
  const availableTypes = parentType === null
    ? ['area']
    : ['task', 'block']

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onConfirm({ type, title: title.trim(), expectation: expectation.trim() })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>新建{NODE_TYPES[type].label}</h3>

        {availableTypes.length > 1 && (
          <div className="type-picker">
            {availableTypes.map(t => (
              <button
                key={t}
                type="button"
                className={`type-btn ${type === t ? 'selected' : ''}`}
                onClick={() => setType(t)}
              >
                {NODE_TYPES[t].icon} {NODE_TYPES[t].label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>名称</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'area' ? '比如：院赛、青训...' : '名称'}
              autoFocus
            />
          </div>

          {type === 'area' && (
            <div className="form-row">
              <label>我的期望（可选）</label>
              <textarea
                value={expectation}
                onChange={e => setExpectation(e.target.value)}
                placeholder="我做这件事是因为..."
                rows={2}
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>取消</button>
            <button type="submit" className="btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  )
}
