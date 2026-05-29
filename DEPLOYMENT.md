# 部署到 Zeabur

## 一键部署步骤

1. 打开 https://zeabur.com 用 GitHub 登录
2. 点 **New Project** → **Deploy from GitHub**
3. 选择 `zhang07112/elios-terminal`
4. Zeabur 会自动识别后端和前端服务
5. 在项目 Dashboard 中设置环境变量

## 环境变量

### 后端（backend）
| 变量名 | 值 |
|--------|-----|
| DEEPSEEK_API_KEY | 你的 DeepSeek API 密钥 |
| OPENAI_BASE_URL | https://api.deepseek.com/v1 |
| OPENAI_MODEL | deepseek-chat |
| SUPABASE_URL | 你的 Supabase 项目 URL |
| SUPABASE_KEY | 你的 Supabase Service Role 密钥 |

### 前端（frontend）
| 变量名 | 值 |
|--------|-----|
| VITE_API_URL | 后端部署后的 URL（如 https://backend.zeabur.app） |
| VITE_SUPABASE_URL | 你的 Supabase 项目 URL |
| VITE_SUPABASE_ANON_KEY | 你的 Supabase Anon 密钥 |

## 注意事项

- 后端部署完后，把它的域名复制到前端的环境变量 `VITE_API_URL` 中
- Free Plan 的服务空闲时会自动休眠，下次访问有几秒延迟
