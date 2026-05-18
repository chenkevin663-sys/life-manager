import { supabase } from './supabase'

// ---- Auth ----

export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  return { error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

// ---- Nodes ----

// 获取顶层节点（areas）
export async function getRootNodes() {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .is('parent_id', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// 获取某节点的直接子节点
export async function getChildren(parentId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('parent_id', parentId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// 获取单个节点
export async function getNode(id) {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// 创建节点
export async function createNode({ parentId = null, type, title, expectation = '', content = '' }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('nodes')
    .insert({
      user_id: user.id,
      parent_id: parentId,
      type,
      title,
      expectation,
      content,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// 更新节点
export async function updateNode(id, fields) {
  const { error } = await supabase
    .from('nodes')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// 删除节点（子节点级联删除）
export async function deleteNode(id) {
  const { error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Journal Entries ----

// 获取某天的日志
export async function getJournalByDate(date) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*, nodes(id, title, type)')
    .eq('entry_date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// 获取有日志的日期列表（最近 60 天）
export async function getJournalDates() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('entry_date')
    .order('entry_date', { ascending: false })
    .limit(200)
  if (error) throw error
  // 去重
  const dates = [...new Set(data.map(r => r.entry_date))]
  return dates
}

// 获取某个节点下的日志
export async function getJournalByNode(nodeId) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('node_id', nodeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// 新增日志
export async function addJournalEntry({ nodeId = null, mood = null, currentTask = '', distraction = '', content = '', entryDate = null }) {
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      node_id: nodeId,
      mood,
      current_task: currentTask,
      distraction,
      content,
      entry_date: entryDate || today,
    })
    .select('*, nodes(id, title, type)')
    .single()
  if (error) throw error
  return data
}

// 更新日志
export async function updateJournalEntry(id, fields) {
  const { error } = await supabase
    .from('journal_entries')
    .update(fields)
    .eq('id', id)
  if (error) throw error
}

// 删除日志
export async function deleteJournalEntry(id) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}
