# TypeScript 脚本调试指南

## 🎯 目的

本指南帮助你理解和调试项目中的 TypeScript 验证脚本。

## 📋 常见问题和解决方案

### 1. 脚本一直转圈，没有输出

#### 原因
- 脚本启动了 Next.js 开发服务器（非常慢）
- 数据库查询没有超时设置
- 脚本在等待用户输入
- 环境变量未加载导致连接失败

#### 解决方案

**方法 1: 添加超时控制**
```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  taskName: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${taskName} 超时`)), timeoutMs)
    ),
  ]);
}

// 使用
const result = await withTimeout(
  someSlowOperation(),
  5000,
  '数据库查询'
);
```

**方法 2: 添加进度输出**
```typescript
console.log('1️⃣ 开始步骤 1...');
// 执行操作
console.log('✅ 步骤 1 完成');

console.log('2️⃣ 开始步骤 2...');
// 执行操作
console.log('✅ 步骤 2 完成');
```

**方法 3: 使用 Ctrl+C 强制停止**
如果脚本卡住，按 `Ctrl+C` 停止执行。

### 2. DATABASE_URL 未设置错误

#### 错误信息
```
Error: DATABASE_URL environment variable is not set
```

#### 原因
脚本没有加载 `.env.local` 文件中的环境变量。

#### 解决方案

在脚本开头添加：
```typescript
import { config } from 'dotenv';

// 加载环境变量 - 必须在导入其他模块之前
config({ path: '.env.local' });

// 然后导入其他模块
import { query } from '@/db/neon/client';
```

**正确的顺序**:
```typescript
// ✅ 正确
import { config } from 'dotenv';
config({ path: '.env.local' });
import { query } from '@/db/neon/client';

// ❌ 错误 - 太晚了
import { query } from '@/db/neon/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
```

### 3. "Tool not found in database" 错误

#### 原因
测试脚本使用的工具名称在数据库中不存在。

#### 解决方案

**步骤 1: 查看数据库中的实际工具**
```bash
tsx scripts/list-tools-in-db.ts
```

**步骤 2: 更新测试脚本使用正确的名称**
```typescript
// ❌ 错误 - 这些工具可能不存在
const testTools = ['chatgpt', 'midjourney', 'notion-ai'];

// ✅ 正确 - 使用实际存在的工具名称
const testTools = ['openai', 'notion', 'gemini'];
```

### 4. 脚本执行时间过长

#### 原因
- 启动完整的 Next.js 应用
- 渲染多个页面
- 没有缓存

#### 解决方案

**创建简化版脚本**:
- 只测试核心逻辑，不启动服务器
- 使用数据库直接查询，不通过 API
- 添加超时控制

**示例**:
```typescript
// ❌ 慢 - 启动整个 Next.js 应用
import { renderPage } from 'next/server';

// ✅ 快 - 直接测试逻辑
import { generateSchema } from '@/lib/seo/schema';
```

## 🔍 如何跟踪脚本执行状态

### 方法 1: 添加详细的日志输出

```typescript
console.log('🔍 开始验证...\n');

console.log('1️⃣ 检查环境变量...');
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 未设置');
  process.exit(1);
}
console.log('✅ 环境变量已配置\n');

console.log('2️⃣ 连接数据库...');
try {
  await testConnection();
  console.log('✅ 数据库连接成功\n');
} catch (error) {
  console.error('❌ 数据库连接失败:', error.message);
  process.exit(1);
}

console.log('3️⃣ 查询工具...');
const tools = await getTools();
console.log(`✅ 找到 ${tools.length} 个工具\n`);
```

### 方法 2: 使用进度指示器

```typescript
const tools = ['tool1', 'tool2', 'tool3'];

for (let i = 0; i < tools.length; i++) {
  const tool = tools[i];
  console.log(`[${i + 1}/${tools.length}] 处理 ${tool}...`);
  // 处理工具
}
```

### 方法 3: 添加时间戳

```typescript
function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

log('开始执行');
log('连接数据库');
log('查询完成');
```

## 🛠️ 调试技巧

### 1. 使用 console.log 调试

```typescript
console.log('变量值:', myVariable);
console.log('对象:', JSON.stringify(myObject, null, 2));
console.log('数组长度:', myArray.length);
```

### 2. 使用 try-catch 捕获错误

```typescript
try {
  const result = await someOperation();
  console.log('✅ 成功:', result);
} catch (error: any) {
  console.error('❌ 错误:', error.message);
  console.error('堆栈:', error.stack);
}
```

### 3. 添加超时保护

```typescript
const timeout = setTimeout(() => {
  console.log('⚠️  操作超时，可能卡住了');
  process.exit(1);
}, 10000); // 10 秒超时

try {
  await someOperation();
  clearTimeout(timeout);
} catch (error) {
  clearTimeout(timeout);
  throw error;
}
```

## 📝 创建可靠的测试脚本模板

```typescript
#!/usr/bin/env tsx
/**
 * 脚本名称和描述
 */

import { config } from 'dotenv';

// 1. 首先加载环境变量
console.log('📦 加载环境变量...');
config({ path: '.env.local' });

// 2. 然后导入其他模块
import { query } from '@/db/neon/client';

// 3. 添加超时工具函数
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  taskName: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${taskName} 超时 (${timeoutMs}ms)`)), timeoutMs)
    ),
  ]);
}

// 4. 主函数
async function main() {
  console.log('🔍 开始执行脚本\n');

  try {
    // 步骤 1
    console.log('1️⃣ 检查环境变量...');
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 未设置');
    }
    console.log('✅ 环境变量已配置\n');

    // 步骤 2
    console.log('2️⃣ 执行操作...');
    const result = await withTimeout(
      query('SELECT 1'),
      5000,
      '数据库查询'
    );
    console.log('✅ 操作完成\n');

    // 总结
    console.log('✅ 脚本执行成功！\n');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ 脚本执行失败:', error.message);
    if (error.stack) {
      console.error('\n堆栈跟踪:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 5. 运行主函数
main();
```

## 🚀 快速诊断命令

### 检查数据库连接
```bash
tsx scripts/test-neon-connection.ts
```

### 列出数据库中的工具
```bash
tsx scripts/list-tools-in-db.ts
```

### 测试 Schema 生成
```bash
tsx scripts/test-software-schema.ts
```

### 验证 Schema 集成
```bash
tsx scripts/verify-software-schema-simple.ts
```

## 📊 脚本执行时间参考

| 脚本类型 | 预期时间 | 说明 |
|---------|---------|------|
| 数据库连接测试 | < 5 秒 | 快速验证连接 |
| Schema 生成测试 | < 2 秒 | 纯逻辑测试 |
| 数据库查询测试 | < 10 秒 | 包含数据库操作 |
| 页面渲染测试 | 30-60 秒 | 需要启动 Next.js |

如果脚本执行时间超过预期，可能有问题。

## 💡 最佳实践

1. **总是加载环境变量**: 在脚本开头使用 `dotenv`
2. **添加进度输出**: 让用户知道脚本在做什么
3. **使用超时控制**: 防止脚本永久卡住
4. **错误处理**: 使用 try-catch 并输出详细错误信息
5. **退出码**: 成功时 `process.exit(0)`，失败时 `process.exit(1)`
6. **测试实际数据**: 使用数据库中真实存在的数据

## 🔗 相关文档

- [Node.js Process](https://nodejs.org/api/process.html)
- [dotenv 文档](https://github.com/motdotla/dotenv)
- [TypeScript Node](https://github.com/TypeStrong/ts-node)

---

**提示**: 如果遇到问题，先运行 `tsx scripts/test-neon-connection.ts` 确保数据库连接正常。
