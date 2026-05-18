import { useState, useEffect } from 'react'
import { getRootNodes, createNode } from '../lib/storage'
import NodeDetail from './NodeDetail'
import CreateNodeModal from './CreateNodeModal'

const TYPE_ICONS = { area: '🗂️', task: '✓', block: '📝' }

export default function TreeNavigator({ onNavigateToNode }) {
  const [roots, setRoots] = useState([])
  const [stack, setStack] = useState([]) // 导航栈：[{node}, ...]
  const [currentNode, setCurrentNode] = useState(null) // null = 根目录
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    loadRoots()
  }, [])

  async function loadRoots() {
    setLoading(true)
    try {
      const data = await getRootNodes()
      setRoots(data)
    } finally {
      setLoading(false)
    }
  }

  function handleNavigate(node) {
    setStack(prev => currentNode ? [...prev, currentNode] : prev)
    setCurrentNode(node)
  }

  function handleBack() {
    if (stack.length === 0) {
      setCurrentNode(null)
    } else {
      const prev = stack[stack.length - 1]
      setStack(s => s.slice(0, -1))
      setCurrentNode(prev)
    }
  }

  async function handleCreateRoot({ type, title, expectation }) {
    const node = await createNode({ parentId: null, type, title, expectation })
    setRoots(prev => [...prev, node])
    setShowCreate(false)
  }

  function handleNodeUpdated(updated) {
    setCurrentNode(updated)
    // 同步更新根节点列表
    setRoots(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  // 面包屑路径
  const breadcrumbs = [...stack, currentNode].filter(Boolean)

  return (
    <div className="tree-navigator">
      {/* 面包屑导航 */}
      {breadcrumbs.length > 0 && (
        <div className="breadcrumbs">
          <button className="breadcrumb-back" onClick={handleBack}>‹ 返回</button>
          <div className="breadcrumb-path">
            {breadcrumbs.map((n, i) => (
              <span key={n.id}>
                {i > 0 && <span className="breadcrumb-sep">›</span>}
                <span
                  className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'current' : ''}`}
                  onClick={() => {
                    if (i < breadcrumbs.length - 1) {
                      setStack(breadcrumbs.slice(0, i).filter(x => x !== null))
                      setCurrentNode(breadcrumbs[i])
                    }
                  }}
                >
                  {n.title}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 根目录：显示所有顶层节点 */}
      {currentNode === null && (
        <div className="root-list">
          {loading ? (
            <div className="loading-hint">加载中...</div>
          ) : (
            <>
              {roots.map(node => (
                <div key={node.id} className="root-item" onClick={() => handleNavigate(node)}>
                  <div className="root-item-left">
                    <span className="root-icon">{TYPE_ICONS[node.type]}</span>
                    <div className="root-item-info">
                      <span className="root-title">{node.title}</span>
                      {node.expectation && (
                        <span className="root-expectation">{node.expectation}</span>
                      )}
                    </div>
                  </div>
                  <span className="child-chevron">›</span>
                </div>
              ))}
              <button className="add-root-btn" onClick={() => setShowCreate(true)}>
                + 新建领域
              </button>
            </>
          )}
        </div>
      )}

      {/* 节点详情 */}
      {currentNode !== null && (
        <NodeDetail
          node={currentNode}
          onNavigate={handleNavigate}
          onBack={handleBack}
          onNodeUpdated={handleNodeUpdated}
        />
      )}

      {showCreate && (
        <CreateNodeModal
          parentType={null}
          onConfirm={handleCreateRoot}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
