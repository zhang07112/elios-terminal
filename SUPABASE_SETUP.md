# Supabase 集成设置指南

## 1. 数据库设置

1. 在 Supabase 控制台中，打开 **SQL Editor**
2. 复制并运行 `supabase_migration.sql` 中的所有 SQL 代码
3. 这将创建所需的所有表和索引

## 2. Storage（文件存储）设置

1. 在 Supabase 控制台中，打开 **Storage**
2. 创建一个新的 Bucket，命名为 `avatars`
3. 设置 Bucket 权限为 **Public**（公开可读）

## 3. 环境变量配置

### 后端
在 `backend/.env` 中添加：
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key-here
```

### 前端
在 `frontend/.env` 中添加：
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 获取 API 密钥

- **Project URL** 和 **anon key** 在 Supabase 控制台 → **Settings** → **API**
- **service role key** 在同一页面，点击 **reveal** 查看

## 5. 安装依赖

### 后端
```bash
cd backend
pip install -r requirements.txt
```

### 前端
已自动安装，若未安装可运行：
```bash
cd frontend
npm install @supabase/supabase-js
```

## 6. 使用示例

### 后端
```python
from src.supabase_client import save_conversation, get_conversations

# 保存消息
save_conversation("user", "你好")

# 获取消息
messages = get_conversations()
```

### 前端
```jsx
import { fetchConversations, subscribeToConversations } from './supabase'

// 获取历史消息
const messages = await fetchConversations()

// 实时订阅新消息
const subscription = subscribeToConversations((newMsg) => {
  console.log('收到新消息:', newMsg)
})
```

## 文件结构
- `supabase_migration.sql`: 数据库表结构
- `backend/src/supabase_client.py`: 后端 Supabase 客户端
- `frontend/src/supabase.js`: 前端 Supabase 客户端
