-- ============================================================
-- v2 新增表
-- ============================================================

-- nodes 表：统一存所有节点（领域、任务、自由板块）
create table nodes (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  parent_id bigint references nodes(id) on delete cascade,
  type text not null check (type in ('area', 'task', 'block')),
  title text not null,
  content text default '',        -- 自由板块的正文内容
  expectation text default '',    -- 领域专用
  done boolean default false,     -- 任务专用
  is_reminder boolean default false, -- 任务专用
  due_date date,                  -- 任务截止日期（预留）
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table nodes enable row level security;
create policy "own nodes" on nodes for all using (auth.uid() = user_id);

-- journal_entries 表：日志内容
create table journal_entries (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  node_id bigint references nodes(id) on delete set null, -- 关联的节点（可选）
  mood int check (mood between 1 and 5),
  current_task text default '',
  distraction text default '',
  content text default '',        -- 正文
  entry_date date not null default current_date, -- 归档日期
  created_at timestamptz default now()
);
alter table journal_entries enable row level security;
create policy "own journal" on journal_entries for all using (auth.uid() = user_id);

-- ============================================================
-- 迁移 v1 数据到 nodes 表
-- ============================================================

-- 1. 把 areas 迁移为 type='area' 的节点
insert into nodes (user_id, type, title, expectation, sort_order, created_at)
select user_id, 'area', name, expectation, sort_order, created_at
from areas;

-- 2. 把 tasks 迁移为 type='task' 的子节点
-- 通过 area name 找到对应的 node id
insert into nodes (user_id, parent_id, type, title, done, is_reminder, sort_order, created_at)
select
  t.user_id,
  n.id as parent_id,
  'task',
  t.text,
  t.done,
  t.is_reminder,
  0,
  t.created_at
from tasks t
join areas a on t.area_id = a.id
join nodes n on n.title = a.name and n.user_id = t.user_id and n.type = 'area';

-- 3. 把 status_logs 迁移为 journal_entries
insert into journal_entries (user_id, mood, current_task, distraction, content, entry_date, created_at)
select
  user_id,
  mood,
  current_task,
  distraction,
  note,
  created_at::date,
  created_at
from status_logs;
