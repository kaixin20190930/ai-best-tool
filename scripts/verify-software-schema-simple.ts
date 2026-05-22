#!/usr/bin/env tsx
/**
 * 简化版 SoftwareApplication Schema 验证脚本
 * 带有详细的进度输出和超时控制
 */

import { config } from 'dotenv';

console.log('📦 加载环境变量...');
config({ path: '.env.local' });

import { getToolByName } from '@/lib/services/tools';
import { generateSoftwareSchema, validateSchema } from '@/lib/seo/schema';
import { ToolMetadata } from '@/lib/seo/constants';

async function verifyWithTimeout<T>(
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

async function verify() {
  console.log('🔍 验证 SoftwareApplication Schema\n');

  try {
    // 检查环境变量
    console.log('1️⃣ 检查环境变量...');
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL 未设置');
      process.exit(1);
    }
    console.log('✅ 环境变量已配置\n');

    // 测试工具列表（使用数据库中实际存在的工具名称）
    const testTools = ['openai', 'notion', 'gemini'];
    
    console.log('2️⃣ 从数据库获取工具...');
    const results = [];
    
    for (const toolName of testTools) {
      console.log(`   查询工具: ${toolName}...`);
      
      try {
        const tool = await verifyWithTimeout(
          getToolByName(toolName),
          5000,
          `查询 ${toolName}`
        );
        
        if (tool) {
          console.log(`   ✅ 找到: ${toolName}`);
          results.push({ name: toolName, tool, found: true });
        } else {
          console.log(`   ⚠️  未找到: ${toolName}`);
          results.push({ name: toolName, tool: null, found: false });
        }
      } catch (error: any) {
        console.log(`   ❌ 错误: ${toolName} - ${error.message}`);
        results.push({ name: toolName, tool: null, found: false, error: error.message });
      }
    }
    
    console.log();

    // 生成和验证 schema
    console.log('3️⃣ 生成和验证 Schema...\n');
    
    const foundTools = results.filter(r => r.found && r.tool);
    
    if (foundTools.length === 0) {
      console.log('❌ 没有找到任何工具，无法验证 schema');
      console.log('\n💡 建议：');
      console.log('   1. 检查数据库中是否有工具数据');
      console.log('   2. 运行: tsx scripts/verify-migration-neon.ts');
      console.log('   3. 如果没有数据，运行: pnpm migrate:neon');
      process.exit(1);
    }

    let successCount = 0;
    
    for (const { name, tool } of foundTools) {
      console.log(`📋 工具: ${name}`);
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';
      const toolUrl = `${baseUrl}/en/ai/${tool!.name}`;
      
      // 获取本地化字段
      const getLocalizedField = (field: Record<string, string>, locale: string = 'en') => {
        return field[locale] || field['en'] || Object.values(field)[0] || '';
      };

      const toolMetadata: ToolMetadata = {
        name: getLocalizedField(tool!.title),
        description: getLocalizedField(tool!.content),
        longDescription: getLocalizedField(tool!.detail),
        category: 'SoftwareApplication',
        tags: tool!.tags || [],
        pricing: {
          type: tool!.pricing as 'free' | 'paid' | 'freemium',
          price: undefined,
          currency: 'USD',
        },
        rating: tool!.ratingCount > 0 ? {
          value: tool!.averageRating,
          count: tool!.ratingCount,
        } : undefined,
        image: tool!.thumbnailUrl || tool!.imageUrl || '',
        url: toolUrl,
      };

      const schema = generateSoftwareSchema(toolMetadata);
      const isValid = validateSchema(schema);

      console.log(`   Schema 有效: ${isValid ? '✅' : '❌'}`);
      console.log(`   包含 @context: ${'@context' in schema ? '✅' : '❌'}`);
      console.log(`   包含 @type: ${'@type' in schema ? '✅' : '❌'}`);
      console.log(`   包含 name: ${'name' in schema ? '✅' : '❌'}`);
      console.log(`   包含 description: ${'description' in schema ? '✅' : '❌'}`);
      console.log(`   包含 offers: ${'offers' in schema ? '✅' : '❌'}`);
      
      if (tool!.ratingCount > 0) {
        console.log(`   包含 aggregateRating: ${'aggregateRating' in schema ? '✅' : '❌'}`);
      }
      
      if (isValid) {
        successCount++;
      }
      
      console.log();
    }

    // 总结
    console.log('📊 验证总结');
    console.log(`   测试工具数: ${testTools.length}`);
    console.log(`   找到工具数: ${foundTools.length}`);
    console.log(`   Schema 有效: ${successCount}/${foundTools.length}`);
    console.log();

    if (successCount === foundTools.length) {
      console.log('✅ 所有 Schema 验证通过！\n');
      
      console.log('📝 下一步：手动测试');
      console.log('1. 启动开发服务器: npm run dev');
      console.log('2. 访问工具页面，例如: http://localhost:3000/en/ai/chatgpt');
      console.log('3. 查看页面源代码 (Ctrl+U 或 Cmd+U)');
      console.log('4. 搜索 "application/ld+json" 找到 schema');
      console.log('5. 使用 Google Rich Results Test 测试:');
      console.log('   https://search.google.com/test/rich-results');
      console.log();
      
      process.exit(0);
    } else {
      console.log('⚠️  部分 Schema 验证失败\n');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ 验证失败:', error.message);
    if (error.stack) {
      console.error('\n堆栈跟踪:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 运行验证
verify();
