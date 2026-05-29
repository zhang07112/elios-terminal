# 部署到 Render

## 🚀 一键部署

点击下方按钮一键部署到 Render：

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 📋 手动部署步骤

### 1. 创建 Web Service（后端）

- **Name**: `elios-backend`
- **Runtime**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**环境变量**:
```
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
```

### 2. 创建 Static Site（前端）

- **Name**: `elios-frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

**环境变量**:
```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 配置 CORS（后端）

后端已配置允许所有来源，无需额外配置。

## 🔧 配置说明

### Supabase 配置

确保你的 Supabase 项目中已执行 `supabase_migration.sql` 创建所有表，并创建了 `avatars` 存储桶。

### 环境变量汇总

**后端环境变量**:
| 变量名 | 说明 | 必填 |
|--------|------|------|
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | ✅ |
| SUPABASE_URL | Supabase 项目 URL | ✅ |
| SUPABASE_KEY | Supabase Service Role 密钥 | ✅ |

**前端环境变量**:
| 变量名 | 说明 | 必填 |
|--------|------|------|
| VITE_API_URL | 后端 API 地址 | ✅ |
| VITE_SUPABASE_URL | Supabase 项目 URL | ✅ |
| VITE_SUPABASE_ANON_KEY | Supabase Anon 密钥 | ✅ |

## 📝 render.yaml 自动部署

项目已包含 `render.yaml` 配置文件，支持自动部署。只需：

1. 将代码推送到 GitHub/GitLab
2. 在 Render 上连接仓库
3. 配置环境变量（标记为 `sync: false` 的变量）

## 🎯 部署检查清单

- [ ] 创建 Supabase 数据库表
- [ ] 创建 `avatars` 存储桶
- [ ] 配置后端环境变量
- [ ] 配置前端环境变量
- [ ] 构建后端服务
- [ ] 构建前端静态站点
- [ ] 更新前端 `VITE_API_URL` 指向后端地址

## ⚡ 性能优化建议

1. **前端缓存**: Render 自动配置了 CDN 缓存
2. **后端超时**: 建议设置较长的超时时间（>30秒）
3. **数据库**: 使用 Supabase 已足够，无需额外数据库

## 📮 常见问题

### Q: 前端无法连接后端？
A: 确保 `VITE_API_URL` 正确指向后端服务地址，且后端服务已启动。

### Q: 消息无法保存到 Supabase？
A: 检查 `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确，确保表已创建。

### Q: 部署后前端显示空白？
A: 检查构建日志，确保 `npm run build` 成功完成。
