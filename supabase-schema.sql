-- 开启 Row Level Security，数据只属于自己
create table areas (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  name text not null,
  expectation text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table areas enable row level security;
create policy "own areas" on areas for all using (auth.uid() = user_id);

create table tasks (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  area_id bigint references areas on delete cascade not null,
  text text not null,
  done boolean default false,
  is_reminder boolean default false,
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "own tasks" on tasks for all using (auth.uid() = user_id);

create table status_logs (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  mood int not null,
  current_task text default '',
  distraction text default '',
  note text default '',
  created_at timestamptz default now()
);
alter table status_logs enable row level security;
create policy "own logs" on status_logs for all using (auth.uid() = user_id);
