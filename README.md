# Trust Calibration — AI 信任校准实验平台

人机信任校准研究平台，兼具**实验载体**与**干预工具**双重角色。用户通过浏览器完成 AI 对话任务，平台实时提供情境感知的信任提示与核验辅助。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui v4 (base-nova)
- **AI**: DeepSeek API (deepseek-chat)
- **数据库**: Supabase (PostgreSQL + Auth + Realtime)

## 双模式架构

| 模式 | 用途 | 状态 |
|------|------|------|
| **普通模式** (`/normal-mode`) | 自由对话，自动风险检测，智能信任干预 | ✅ 已实现 |
| **实验模式** | 标准化实验任务，系统化采集信任行为数据 | 🔜 待开发 |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入真实的 Supabase 和 DeepSeek 凭据

# 3. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 核心功能 — 情境感知引擎

| 维度 | 分类 | 方法 |
|------|------|------|
| **任务类型** | 知识获取型 / 生活建议型 / 专业创作型 / 决策分析型 | 关键词 + 模式匹配 |
| **风险等级** | 高 / 中 / 低 | 领域关键词（医疗/法律/金融/安全） |
| **复杂度** | 简单 / 中等 / 复杂 (1-5分) | 文本长度 + 信息层级 + 推理需求 |
| **截止诉求** | 有 / 无 | 正则匹配日期/紧急表述 |

### 差异化干预策略

- 🔴 **高风险**：弹窗列出具体核验项，用户逐项确认后才可继续
- 🟡 **中风险**：AI 回答旁侧显示"查看信息来源"可展开区域（建议来源 + 快速搜索链接）
- 🟢 **低风险**：页面底部轻量小字提示"AI 生成内容仅供参考"

## 项目结构

```
src/
├── app/
│   ├── api/chat/route.ts       # DeepSeek API 代理路由
│   ├── auth/callback/route.ts  # Supabase OAuth/Magic Link 回调
│   ├── normal-mode/page.tsx    # 普通模式主界面
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页（模式选择）
├── components/
│   ├── chat/
│   │   ├── chat-message.tsx    # 消息气泡（用户/AI + 干预组件集成）
│   │   ├── chat-input.tsx      # 输入框（自动变高 + Enter 发送）
│   │   └── risk-badge.tsx      # 风险标签（类型/等级/复杂度）
│   ├── intervention/
│   │   ├── high-risk-dialog.tsx    # 高风险核查弹窗
│   │   ├── medium-risk-sources.tsx # 中风险来源验证面板
│   │   └── low-risk-notice.tsx     # 低风险免责提示
│   └── ui/                     # shadcn/ui 组件库
├── lib/
│   ├── risk-engine.ts          # 情境感知引擎（核心分析逻辑）
│   ├── supabase/               # Supabase 客户端（Browser / Server / Middleware）
│   └── utils.ts
├── types/
│   ├── trust.ts                # 信任平台核心类型
│   └── database.ts             # Supabase 数据库类型
└── middleware.ts               # Next.js Middleware（会话刷新）
```

## Supabase 类型生成

```bash
supabase gen types typescript --linked > src/types/database.ts
```
