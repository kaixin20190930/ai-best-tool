#!/usr/bin/env tsx
/**
 * 列出数据库中的所有工具
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { query } from '@/db/neon/client';

async function listTools() {
  console.log('📋 列出数据库中的所有工具\n');

  try {
    const result = await query(`
      SELECT name, title, pricing, status 
      FROM tools 
      ORDER BY name
    `);

    console.log(`找到 ${result.rows.length} 个工具:\n`);

    result.rows.forEach((tool, index) => {
      const titleEn = tool.title?.en || tool.title?.zh || 'No title';
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   标题: ${titleEn}`);
      console.log(`   定价: ${tool.pricing}`);
      console.log(`   状态: ${tool.status}`);
      console.log();
    });

  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

listTools();
