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

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ---- Areas ----

export async function getAreas() {
  const { data, error } = await supabase
    .from('areas')
    .select('*, tasks(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { referencedTable: 'tasks', ascending: true })
  if (error) throw error
  return data
}

export async function createArea(name, expectation) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('areas')
    .insert({ name, expectation, user_id: user.id })
    .select('*, tasks(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateExpectation(areaId, expectation) {
  const { error } = await supabase
    .from('areas')
    .update({ expectation })
    .eq('id', areaId)
  if (error) throw error
}

// ---- Tasks ----

export async function addTask(areaId, text, isReminder = false) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('tasks')
    .insert({ area_id: areaId, text, is_reminder: isReminder, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleTask(taskId, done) {
  const { error } = await supabase
    .from('tasks')
    .update({ done })
    .eq('id', taskId)
  if (error) throw error
}

export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  if (error) throw error
}

// ---- Status Logs ----

export async function getLogs() {
  const { data, error } = await supabase
    .from('status_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function addLog(mood, currentTask, distraction, note) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('status_logs')
    .insert({ mood, current_task: currentTask, distraction, note, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLog(id) {
  const { error } = await supabase
    .from('status_logs')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- 初始化默认数据（首次登录时调用）----

export async function seedDefaultAreas() {
  const existing = await getAreas()
  if (existing.length > 0) return // 已有数据，不重复插入

  const defaults = [
    {
      name: '院赛',
      expectation: '我想把比赛办好，提振足球氛围',
      tasks: [
        { text: '场地申请', is_reminder: false },
        { text: '赛程安排', is_reminder: false },
        { text: '裁判安排', is_reminder: false },
        { text: '到场', is_reminder: false },
        { text: '数据统计', is_reminder: false },
        { text: '奖品准备（5.17前）', is_reminder: true },
      ],
    },
    {
      name: '青训',
      expectation: '设计出好的训练，每节课有质量的训练',
      tasks: [
        { text: '训练课总结', is_reminder: false },
        { text: '教案设计（带着训练预期目标）', is_reminder: false },
        { text: '与 Borja 的学习——让感受带着我体验', is_reminder: false },
        { text: '拳导的视频', is_reminder: false },
      ],
    },
    {
      name: '华海超',
      expectation: '大一大二可以好好操练，练出基本的后场建立和前场立体进攻配合',
      tasks: [
        { text: '赛程通知', is_reminder: false },
        { text: '统计到场人数', is_reminder: false },
        { text: '每场战术分析调整', is_reminder: false },
        { text: '录像', is_reminder: false },
        { text: '视频分析 workflow', is_reminder: false },
      ],
    },
    {
      name: '小猫的生日',
      expectation: '很多有意思的礼物！我想好好准备它们',
      tasks: [
        { text: '球服——画出那只小猫 + 下单', is_reminder: false },
        { text: '信——分享最近感受，狗狗对小猫的刻画', is_reminder: false },
        { text: 'Guitar——学会 Wonderful Tonight', is_reminder: false },
        { text: '一幅画——狗狗 signature 画', is_reminder: false },
        { text: '生日游戏设计开发', is_reminder: false },
      ],
    },
    {
      name: '课程',
      expectation: '别挂科，重要课想学点东西',
      tasks: [
        { text: '素描课找老师补', is_reminder: false },
        { text: '实验课找老师补', is_reminder: false },
        { text: '思政补笔记', is_reminder: false },
        { text: '高数补作业', is_reminder: false },
        { text: '电路补作业', is_reminder: false },
        { text: '大物', is_reminder: false },
        { text: '英语积累', is_reminder: false },
      ],
    },
  ]

  const { data: { user } } = await supabase.auth.getUser()

  for (let i = 0; i < defaults.length; i++) {
    const { name, expectation, tasks } = defaults[i]
    const { data: area, error } = await supabase
      .from('areas')
      .insert({ name, expectation, sort_order: i, user_id: user.id })
      .select()
      .single()
    if (error) continue

    for (const t of tasks) {
      await supabase.from('tasks').insert({
        area_id: area.id,
        text: t.text,
        is_reminder: t.is_reminder,
        user_id: user.id,
      })
    }
  }
}
