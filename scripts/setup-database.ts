#!/usr/bin/env tsx
/**
 * 数据库设置脚本
 * 
 * 功能:
 * 1. 检查数据库连接
 * 2. 应用数据库架构 (schema.sql)
 * 
 * 使用方法:
 * pnpm tsx scripts/setup-database.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// 加载环境变量
config({ path: '.env.local' });

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少 Supabase 环境变量');
  console.error('请确保 .env.local 文件中包含:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 检查数据库连接
 */
async function checkConnection() {
  console.log('🔌 检查数据库连接...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('  ⚠️  数据库表不存在，需要应用架构');
        return false;
      }
      throw error;
    }
    
    console.log('  ✅ 数据库连接成功，表已存在');
    return true;
  } catch (error: any) {
    console.error('  ❌ 数据库连接失败:', error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始数据库设置...\n');
  
  try {
    const tablesExist = await checkConnection();
    
    if (!tablesExist) {
      console.log('\n⚠️  数据库表不存在');
      console.log('\n请按照以下步骤手动应用数据库架构:');
      console.log('  1. 打开 Supabase Dashboard: https://supabase.com/dashboard');
      console.log('  2. 选择你的项目');
      console.log('  3. 进入 SQL Editor');
      console.log('  4. 复制 db/supabase/schema.sql 文件的内容');
      console.log('  5. 粘贴到 SQL Editor 并执行');
      console.log('  6. 等待执行完成后，重新运行此脚本');
      console.log('\n或者使用 Supabase CLI:');
      console.log('  supabase db push');
      process.exit(1);
    }
    
    console.log('\n✅ 数据库设置完成!');
    console.log('\n下一步:');
    console.log('  运行数据迁移: pnpm migrate');
    
  } catch (error) {
    console.error('\n❌ 设置过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
