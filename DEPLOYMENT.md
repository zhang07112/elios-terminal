# Elios Terminal - Vercel 部署指南

## 架构

- **后端**: Python FastAPI → Vercel Serverless Functions (api/)
- **前端**: React Vite → Vercel Static Hosting (frontend/)
- **数据库**: Supabase (PostgreSQL)
- **AI**: DeepSeek API

## 部署步骤

### 1. 环境变量

后端需要设置以下环境变量（在 Vercel 项目设置中配置）：

| 变量名 | 说明 |
|--------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
| `OPENAI_BASE_URL` | API 地址（默认 https://api.deepseek.com/v1） |
| `OPENAI_MODEL` | 模型名（默认 deepseek-chat） |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_KEY` | Supabase service_role 密钥 |

前端需要：

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 密钥 |
| `VITE_API_URL` | 后端部署后的 URL + /api（例如 https://elios-api.vercel.app/api） |

### 2. 部署后端

1. 在 [vercel.com](https://vercel.com) 导入 GitHub 仓库 `zhang07112/elios-terminal`
2. 框架预设选择 **Other**
3. 根目录保持 `.`
4. Vercel 会自动检测 `api/index.py` 作为 Python Serverless Function
5. 添加上述后端环境变量
6. 点击部署

### 3. 设置 Supabase 新表

在 Supabase SQL Editor 中执行 `supabase_migration_v2.sql`，创建 `elios_profiles` 和 `diaries` 表。

### 4. 部署前端

1. 在 Vercel 新建项目 → 导入同一个 GitHub 仓库
2. 根目录选择 `frontend/`
3. 框架预设选择 **Vite**
4. 构建命令：`npm install && npm run build`
5. 输出目录：`dist`
6. 添加前端环境变量
7. 点击部署

### 5. 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
cp .env.example .env  # 填入真实密钥
uvicorn main:app --reload --port 8080

# 前端
cd frontend
npm install
npm run dev
```

## 文件结构

```
elios-terminal/
├── api/
│   ├── index.py              # Vercel 入口
│   └── requirements.txt      # Python 依赖
├── backend/
│   ├── main.py               # FastAPI 应用
│   ├── character.md          # 角色设定文件
│   └── src/                  # 业务逻辑模块
├── frontend/                 # React 前端
├── vercel.json               # Vercel 配置
├── supabase_migration.sql    # 基础表迁移
└── supabase_migration_v2.sql # Elios 表迁移
```
