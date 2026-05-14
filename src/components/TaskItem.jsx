export default function TaskItem({ task, areaId, onToggle, onDelete }) {
  return (
    <div className={`task-item ${task.done ? 'done' : ''} ${task.is_reminder ? 'reminder' : ''}`}>
      <button
        className="task-check"
        onClick={() => onToggle(areaId, task.id)}
        aria-label={task.done ? '标记未完成' : '标记完成'}
      >
        {task.done ? '✓' : '○'}
      </button>
      <span className="task-text">{task.text}</span>
      {task.is_reminder && <span className="reminder-badge">长期</span>}
      <button
        className="task-delete"
        onClick={() => onDelete(areaId, task.id)}
        aria-label="删除任务"
      >
        ×
      </button>
    </div>
  )
}
