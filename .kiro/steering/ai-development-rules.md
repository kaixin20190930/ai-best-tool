---
priority: high
---

# AI 开发规范

## 1. 总体原则

### 语言要求
- **所有回答必须优先使用中文**，必要时补充英文术语
- 代码注释使用中文
- 文档和说明使用中文

### 云服务选择
- ❌ **不使用 AWS 服务**
- ✅ **优先使用市面常见云服务**：
  - Cloudflare (Workers, Pages, R2, D1)
  - Vercel (Edge Functions, KV, Postgres)
  - Supabase (Database, Auth, Storage, Edge Functions)
  - PlanetScale (MySQL)
  - MongoDB Atlas
  - Fly.io
  - Railway
  - Render

### 回答质量要求
- 必须**结构化、可落地、可直接执行**
- 避免理论堆砌
- 提供完整的代码示例
- 包含部署和测试步骤

## 2. 前端开发规则

### TypeScript 强制要求
- 所有前端代码必须使用 **TypeScript**
- 定义清晰的 Interface 和 Type
- 避免使用 `any`，优先使用 `unknown` 或具体类型

### i18n 多语言强制要求
- **所有组件中的文案必须通过 i18n 输出**
- 禁止硬编码字符串
- 使用 `next-intl` 或 `react-i18next`
- 翻译文件结构化管理

```typescript
// ❌ 错误示例
<button>Submit</button>

// ✅ 正确示例
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
<button>{t('submit')}</button>
```

### 代码组织要求
- 代码简洁、模块化、易维护
- 避免复杂逻辑塞在一个文件里
- 单一职责原则
- 组件拆分合理

### 回答必须包含的结构
1. **组件结构** - 文件组织和依赖关系
2. **i18n 文案结构** - 翻译 key 的组织
3. **API 接口定义** - TypeScript Interface
4. **全局状态** - 如使用 Zustand 或 Jotai

## 3. 后端开发规则

### 技术栈
- 默认使用 **TypeScript**
- 运行时：Node.js / Bun / Cloudflare Workers
- 框架：Next.js API Routes / Fastify / Hono / Express

### API 规范

#### 统一返回格式
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

#### 输入参数校验
- 必须使用 **zod** 或 **yup** 校验
- 所有用户输入必须验证

```typescript
import { z } from 'zod';

const createToolSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  category: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = createToolSchema.parse(body); // 自动抛出错误
  // ...
}
```

#### 日志要求
- 日志可读性强
- 包含关键信息：用户 ID、请求 ID、时间戳
- 错误日志包含堆栈信息

### AI 网站后端核心流程

所有 AI 相关后端必须自动涵盖：

1. **用户配额管理**
```typescript
interface UserQuota {
  userId: string;
  dailyLimit: number;
  used: number;
  resetAt: Date;
}
```

2. **任务队列**
- 使用 BullMQ / Inngest / Trigger.dev
- 处理长时间运行的 AI 任务

3. **模型调用 throttle**
```typescript
// 限流示例
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 每分钟 10 次
});
```

4. **缓存策略**
- 相同 prompt 缓存结果
- 使用 Redis / Upstash / Vercel KV

5. **Fallback 模型机制**
```typescript
const MODEL_FALLBACK_CHAIN = [
  'deepseek-chat',
  'qwen-turbo',
  'gpt-3.5-turbo',
];

async function callAIWithFallback(prompt: string) {
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      return await callModel(model, prompt);
    } catch (error) {
      console.warn(`模型 ${model} 调用失败，尝试下一个`);
      continue;
    }
  }
  throw new Error('所有模型调用失败');
}
```

## 4. AI 相关规则

### 模型选择优先级
1. **DeepSeek** (deepseek-chat, deepseek-coder) - 性价比最高
2. **Qwen** (qwen-turbo, qwen-plus) - 中文优秀
3. **Groq** (llama3-70b) - 速度快
4. **Together AI** - 开源模型
5. **OpenRouter** - 聚合多个模型
6. OpenAI (gpt-3.5-turbo, gpt-4) - 最后选择

### Prompt 设计要求

回答必须包含：
1. **适合的模型推荐**
2. **Prompt 结构模板**
3. **调用示例（TypeScript）**
4. **流式输出（SSE）示例**

#### Prompt 模板示例
```typescript
interface PromptTemplate {
  system: string;
  user: string;
  variables: Record<string, string>;
}

const translatePrompt: PromptTemplate = {
  system: '你是一个专业的翻译助手，擅长将内容翻译成自然流畅的{targetLang}。',
  user: '请将以下内容翻译成{targetLang}：\n\n{content}',
  variables: {
    targetLang: '目标语言',
    content: '待翻译内容',
  },
};
```

#### 流式输出示例
```typescript
export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

### API Key 安全管理
- ❌ **禁止在前端暴露 API Key**
- ✅ **统一后端代理**
- 使用环境变量存储
- 定期轮换 Key

```typescript
// ✅ 正确：后端代理
// app/api/ai/chat/route.ts
export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY; // 服务端读取
  // ...
}

// ❌ 错误：前端直接调用
// const apiKey = 'sk-xxx'; // 永远不要这样做
```

### 成本优化提示
- 当模型调用成本可能过高时，**必须主动提示**
- 提供更低成本的替代方案
- 建议使用缓存减少调用次数

## 5. 全球化支持规则

任何涉及国际化功能，必须自动考虑：

### 文案多语言
- 使用 `next-intl` 管理翻译
- 支持至少：en, zh-CN, zh-TW, ja, ko, es, fr, de, pt, ru

### 货币显示
```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();
const price = format.number(99.99, {
  style: 'currency',
  currency: 'USD', // 根据用户地区动态切换
});
```

### 日期格式
```typescript
const date = format.dateTime(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

### 时区处理
```typescript
// 使用 Intl API
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
```

### SEO 多语言 URL
```
/en/tools/chatgpt
/zh-cn/tools/chatgpt
/ja/tools/chatgpt
```

### RTL 布局支持
```css
/* 支持阿拉伯语等 RTL 语言 */
[dir="rtl"] .container {
  direction: rtl;
}
```

### 支付逻辑
- 主要：**Stripe** / **PayPal**
- 中国用户：**Ping++** / **Stripe China** / 支付宝 / 微信支付

## 6. 数据隐私与合规规则

### 默认考虑合规要求
- **GDPR** (欧盟)
- **CCPA** (加州)
- **中国数据跨境合规**

### 禁止行为
- ❌ 不得输出用户敏感信息
- ❌ 不得存储未加密的密码
- ❌ 不得记录完整的信用卡号

### 合规替代方案
```typescript
// ❌ 错误：直接存储敏感数据
await db.insert({ email, password, creditCard });

// ✅ 正确：加密或使用第三方
await db.insert({ 
  email, 
  passwordHash: await hash(password),
  stripeCustomerId, // 不存储卡号
});
```

### Cookie 同意
- 必须实现 Cookie 同意横幅
- 区分必要 Cookie 和分析 Cookie

## 7. 性能与架构规则

### 服务部署优先推荐
1. **Cloudflare Workers** - 全球边缘计算
2. **Vercel Edge Functions** - 边缘函数
3. **Supabase Edge Functions** - Deno 边缘函数

### 必须自动考虑

#### 缓存策略
```typescript
// Next.js 缓存示例
export const revalidate = 3600; // 1 小时

// Cloudflare Workers 缓存
const cache = caches.default;
const cachedResponse = await cache.match(request);
if (cachedResponse) return cachedResponse;
```

#### 数据库连接池
```typescript
// Supabase 连接池配置
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-connection-pool': 'true' },
  },
});
```

#### 冷启动优化
- 减少依赖包大小
- 使用 Edge Runtime
- 延迟加载非关键模块

#### 流式输出优化
- AI 响应使用 SSE (Server-Sent Events)
- 图片使用渐进式加载
- 大文件分块传输

## 8. 安全与滥用防护规则

### 所有回答默认考虑

#### Rate Limit (限速)
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return new Response('Too many requests', { status: 429 });
}
```

#### API Key 泄漏检测
```typescript
// 检测代码中是否包含 API Key
const API_KEY_PATTERN = /sk-[a-zA-Z0-9]{32,}/g;
if (API_KEY_PATTERN.test(userInput)) {
  throw new Error('检测到 API Key，已拒绝');
}
```

#### 文本输入清洗
```typescript
import DOMPurify from 'isomorphic-dompurify';

// XSS 防护
const cleanInput = DOMPurify.sanitize(userInput);

// SQL 注入防护 - 使用参数化查询
const { data } = await supabase
  .from('tools')
  .select()
  .eq('name', userInput); // 自动转义
```

#### NSFW 内容检测
```typescript
// 使用 Cloudflare AI 或 OpenAI Moderation API
const response = await fetch('https://api.openai.com/v1/moderations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ input: userContent }),
});

const { results } = await response.json();
if (results[0].flagged) {
  throw new Error('内容违规');
}
```

#### robots.txt 与反爬虫
```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# 限制爬虫频率
Crawl-delay: 10
```

## 9. 回答格式要求

每次回答必须按以下结构输出（如适用）：

### 1. 摘要
- 简要说明解决方案
- 关键技术点

### 2. 解决方案结构
- 文件组织
- 模块划分
- 数据流向

### 3. 前端代码（TS + i18n）
```typescript
// 完整的 TypeScript 代码
// 包含 i18n 集成
```

### 4. 后端代码（TS）
```typescript
// API 路由
// 数据验证
// 错误处理
```

### 5. 数据库设计
```sql
-- 表结构
-- 索引
-- 关系
```

### 6. AI 模型调用示例
```typescript
// 模型选择
// Prompt 设计
// 流式输出
```

### 7. 全球化注意点
- i18n 配置
- 货币/日期处理
- SEO 多语言

### 8. 性能与成本建议
- 缓存策略
- 成本估算
- 优化建议

## 10. 项目特定规则

### 本项目技术栈
- Next.js 14 App Router
- TypeScript (strict mode)
- next-intl (9 种语言)
- Supabase (数据库 + 认证)
- Tailwind CSS
- pnpm (包管理器)

### 本项目约定
- Server Components 优先
- 所有文案通过 `messages/*.json` 管理
- API 返回格式遵循 `ApiResponse` 接口
- 使用 `lib/services/` 层访问数据库
- SEO 使用 `lib/seo/` 工具函数

### 禁止事项
- ❌ 不使用 AWS 服务
- ❌ 不在前端硬编码文案
- ❌ 不在前端暴露 API Key
- ❌ 不使用 npm 或 yarn（必须用 pnpm）
