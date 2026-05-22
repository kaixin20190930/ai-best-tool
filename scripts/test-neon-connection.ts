#!/usr/bin/env tsx
/**
 * 测试 Neon 数据库连接
 */

import { config } from 'dotenv';
import { testConnection, query } from '@/db/neon/client';

// 加载环境变量
config({ path: '.env.local' });

async function test() {
  console.log('🔍 测试 Neon 数据库连接...\n');
  
  // 检查环境变量
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL 已配置');
  console.log(`   连接字符串: ${databaseUrl.substring(0, 50)}...\n`);
  
  try {
    // 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ 数据库连接失败');
      process.exit(1);
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 测试查询分类
    console.log('2️⃣ 测试查询分类表...');
    const categoriesResult = await query('SELECT COUNT(*) as count FROM categories');
    const categoryCount = categoriesResult.rows[0].count;
    console.log(`✅ 分类数量: ${categoryCount}\n`);
    
    // 测试查询标签
    console.log('3️⃣ 测试查询标签表...');
    const tagsResult = await query('SELECT COUNT(*) as count FROM tags');
    const tagCount = tagsResult.rows[0].count;
    console.log(`✅ 标签数量: ${tagCount}\n`);
    
    // 测试查询工具
    console.log('4️⃣ 测试查询工具表...');
    const toolsResult = await query('SELECT COUNT(*) as count FROM tools');
    const toolCount = toolsResult.rows[0].count;
    console.log(`✅ 工具数量: ${toolCount}\n`);
    
    // 获取一个示例工具
    console.log('5️⃣ 获取示例工具...');
    const sampleToolResult = await query(`
      SELECT name, title, pricing, status 
      FROM tools 
      LIMIT 1
    `);
    
    if (sampleToolResult.rows.length > 0) {
      const tool = sampleToolResult.rows[0];
      console.log('✅ 示例工具:');
      console.log(`   名称: ${tool.name}`);
      console.log(`   标题: ${JSON.stringify(tool.title)}`);
      console.log(`   定价: ${tool.pricing}`);
      console.log(`   状态: ${tool.status}\n`);
    }
    
    console.log('🎉 所有测试通过！数据库配置正确。\n');
    
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    if (error.stack) {
      console.error('   堆栈:', error.stack);
    }
    process.exit(1);
  }
}

test();
