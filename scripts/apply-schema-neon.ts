#!/usr/bin/env tsx
/**
 * 应用数据库架构到 Neon
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ 错误: 缺少 DATABASE_URL 环境变量');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log('🚀 开始应用数据库架构到 Neon...\n');
  
  try {
    // 测试连接
    console.log('🔌 测试数据库连接...');
    const testResult = await pool.query('SELECT NOW()');
    console.log(`  ✅ 连接成功! 当前时间: ${testResult.rows[0].now}\n`);
    
    // 读取 schema.sql
    console.log('📄 读取 schema.sql 文件...');
    const schemaPath = join(process.cwd(), 'db', 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    console.log(`  ✅ 已读取 ${schema.length} 字符\n`);
    
    // 执行 schema
    console.log('⚙️  执行数据库架构...');
    await pool.query(schema);
    console.log('  ✅ 架构应用成功!\n');
    
    // 验证表是否创建
    console.log('🔍 验证表结构...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`  ✅ 找到 ${tablesResult.rows.length} 个表:`);
    tablesResult.rows.forEach(row => {
      console.log(`    - ${row.table_name}`);
    });
    
    console.log('\n🎉 数据库架构应用完成!');
    console.log('\n下一步:');
    console.log('  运行数据迁移: pnpm migrate:neon');
    
  } catch (error: any) {
    console.error('\n❌ 应用架构时发生错误:');
    console.error(error.message);
    if (error.position) {
      console.error(`错误位置: ${error.position}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
