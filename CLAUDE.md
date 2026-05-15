# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目背景

这是一个个人生活管理 PWA，由非开发者用户（Kevin）主导需求，Claude 负责实现。用户没有开发基础，所有技术决策由 Claude 做出并解释。

核心理念：每个"领域"都有一个 expectation（情感锚点），帮助用户记住做这件事的初心，而不只是管理任务清单。

## 账号与部署信息

- **线上地址**：https://life-manager-delta.vercel.app
- **GitHub**：https://github.com/chenkevin663-sys/life-manager
- **Supabase URL**：https://acsjdddatifyjcirbnwf.supabase.co（注意三个 d）
- **登录邮箱**：chenkevin663@gmail.com
- **部署平台**：Vercel，连接 GitHub master 分支自动部署

## 常用命令

```bash
npm run dev      # 本地开发，默认 5173 端口
npm run build    # 构建生产版本（部署前验证用）
```

每次改完代码，`git push` 到 master 分支，Vercel 自动部署，约 1 分钟生效。

## 技术栈

- **React 19 + Vite 8**：前端框架
- **Supabase**：数据库 + 认证（邮箱 magic link，无密码登录）
- **vite-plugin-pwa**：PWA 支持，可添加到手机主屏幕
- **Vercel**：托管部署

## 架构说明

### 认证流程

`App.jsx` 监听 `supabase.auth.onAuthStateChange`，session 为 `undefined` 时显示加载，为 `null` 时显示 `Login` 组件，有值时进入主界面。用 `dataLoaded` ref 防止 token 刷新时重复调用 `seedDefaultAreas`。

### 数据层

所有数据操作集中在 `src/lib/storage.js`，直接调用 Supabase JS SDK。当前是异步函数，无本地缓存。`src/lib/supabase.js` 只负责初始化客户端（读取 `VITE_SUPABASE_*` 环境变量）。

### 数据库表结构

三张表，均开启 Row Level Security，用户只能访问自己的数据：

- `areas`：领域（name, expectation, sort_order, user_id）
- `tasks`：任务（area_id, text, done, is_reminder, user_id）
- `status_logs`：状态快照（mood 1-5, current_task, distraction, note, user_id）

建表 SQL 在 `supabase-schema.sql`。

### 状态管理

无状态管理库，全部用 React `useState`。数据在 `App.jsx` 顶层持有，通过 props 传给子组件。每次数据库操作后用乐观更新（先更新本地 state，不重新 fetch）。

## 版本管理约定

- `master` 分支 = 线上稳定版，Vercel 自动部署
- `v2-tree-nav` 分支 = 当前开发中的 v2（树形导航重构）
- `v1.0-stable` tag = v1 稳定快照，可随时回退

## v2 设计方向（待开发）

导航改为方案 B：手机文件夹式，点进去逐层展开，顶部有返回按钮（类似 iOS 文件 App）。

节点类型：
- **领域**：有 expectation，可挂任务和子节点
- **任务**：可勾选、设截止日期
- **日志**：富文本，按日期自动归档，可同时关联领域和总日志（双向）
- **自由板块**：用户自建，如"赛后总结"

日志双向关联：一条日志只存一份，在领域视图和总日志视图都能看到。
