#!/usr/bin/env tsx
/**
 * Neon 数据库迁移脚本
 * 
 * 功能:
 * 1. 将 lib/data.ts 中的 dataList 迁移到 tools 表
 * 2. 将 detailList 中的详细信息合并到 tools 表
 * 3. 提取并创建 categories 和 tags 数据
 * 4. 处理多语言字段的 JSONB 转换
 * 
 * 使用方法:
 * pnpm migrate:neon
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import { dataList, detailList, WebNavigationListRow, WebNavigationDetailData } from '../lib/data';

// 加载环境变量
config({ path: '.env.local' });

// 从环境变量获取数据库配置
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ 错误: 缺少 DATABASE_URL 环境变量');
  console.error('请确保 .env.local 文件中包含:');
  console.error('  - DATABASE_URL');
  process.exit(1);
}

// 创建数据库连接池
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Neon 需要 SSL
  },
});

// 分类映射 (英文 -> 中文)
const categoryMap: Record<string, { en: string; zh: string; slug: string }> = {
  'Productivity': { en: 'Productivity', zh: '生产力', slug: 'productivity' },
  'Design&Art': { en: 'Design & Art', zh: '设计与艺术', slug: 'design-art' },
  'Chatbot': { en: 'Chatbot', zh: '聊天机器人', slug: 'chatbot' },
  'Life Assistant': { en: 'Life Assistant', zh: '生活助手', slug: 'life-assistant' },
  'Text&Writing': { en: 'Text & Writing', zh: '文本与写作', slug: 'text-writing' },
  'Other': { en: 'Other', zh: '其他', slug: 'other' },
};

// 标签映射
const tagMap: Record<string, { en: string; zh: string; slug: string }> = {
  'Free': { en: 'Free', zh: '免费', slug: 'free' },
  'Freemium': { en: 'Freemium', zh: '免费增值', slug: 'freemium' },
  'Paid': { en: 'Paid', zh: '付费', slug: 'paid' },
  'Website': { en: 'Website', zh: '网站', slug: 'website' },
  'Large Language Models (LLMs)': { en: 'LLM', zh: '大语言模型', slug: 'llm' },
};

/**
 * 提取并创建分类数据
 */
async function migrateCategories() {
  console.log('\n📁 开始迁移分类数据...');
  
  const categories = Object.values(categoryMap);
  
  for (const category of categories) {
    try {
      const query = `
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = NOW()
        RETURNING id, slug
      `;
      
      const values = [
        JSON.stringify({ en: category.en, zh: category.zh }),
        category.slug,
        JSON.stringify({ en: `${category.en} tools`, zh: `${category.zh}工具` }),
      ];
      
      const result = await pool.query(query, values);
      console.log(`  ✅ 分类已创建/更新: ${category.en} (${category.zh})`);
    } catch (error: any) {
      console.error(`  ❌ 创建分类失败 [${category.slug}]:`, error.message);
    }
  }
  
  console.log('✅ 分类迁移完成\n');
}

/**
 * 提取并创建标签数据
 */
async function migrateTags() {
  console.log('🏷️  开始迁移标签数据...');
  
  const tags = Object.values(tagMap);
  
  for (const tag of tags) {
    try {
      const query = `
        INSERT INTO tags (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug) 
        DO UPDATE SET 
          name = EXCLUDED.name
        RETURNING id, slug
      `;
      
      const values = [
        JSON.stringify({ en: tag.en, zh: tag.zh }),
        tag.slug,
      ];
      
      const result = await pool.query(query, values);
      console.log(`  ✅ 标签已创建/更新: ${tag.en} (${tag.zh})`);
    } catch (error: any) {
      console.error(`  ❌ 创建标签失败 [${tag.slug}]:`, error.message);
    }
  }
  
  console.log('✅ 标签迁移完成\n');
}

/**
 * 根据分类名称获取分类 ID
 */
async function getCategoryId(categoryName: string): Promise<string | null> {
  const category = categoryMap[categoryName];
  if (!category) {
    console.warn(`  ⚠️  未找到分类映射: ${categoryName}`);
    return null;
  }
  
  try {
    const query = 'SELECT id FROM categories WHERE slug = $1';
    const result = await pool.query(query, [category.slug]);
    
    if (result.rows.length === 0) {
      console.error(`  ❌ 获取分类 ID 失败 [${category.slug}]: 未找到记录`);
      return null;
    }
    
    return result.rows[0].id;
  } catch (error: any) {
    console.error(`  ❌ 获取分类 ID 失败 [${category.slug}]:`, error.message);
    return null;
  }
}

/**
 * 确定定价类型
 */
function determinePricing(tagName: string): string {
  const lowerTag = tagName.toLowerCase();
  if (lowerTag.includes('free') && !lowerTag.includes('freemium')) {
    return 'free';
  }
  if (lowerTag.includes('freemium')) {
    return 'freemium';
  }
  if (lowerTag.includes('paid')) {
    return 'paid';
  }
  return 'freemium'; // 默认值
}

/**
 * 提取标签 slugs
 */
function extractTagSlugs(tagName: string): string[] {
  const tags: string[] = [];
  
  // 检查每个已知标签
  for (const [key, value] of Object.entries(tagMap)) {
    if (tagName.includes(key)) {
      tags.push(value.slug);
    }
  }
  
  // 如果没有匹配到任何标签，添加默认标签
  if (tags.length === 0) {
    tags.push('website');
  }
  
  return tags;
}

/**
 * 迁移工具数据
 */
async function migrateTools() {
  console.log('🔧 开始迁移工具数据...');
  
  // 创建详情数据的映射，方便查找
  const detailMap = new Map<string, WebNavigationDetailData>();
  detailList.forEach(detail => {
    detailMap.set(detail.name, detail);
  });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const tool of dataList) {
    const detail = detailMap.get(tool.name);
    
    if (!detail) {
      console.warn(`  ⚠️  未找到详情数据: ${tool.name}`);
    }
    
    // 获取分类 ID
    const categoryId = detail ? await getCategoryId(detail.categoryName) : null;
    
    // 提取标签
    const tagSlugs = detail ? extractTagSlugs(detail.tagName) : ['website'];
    
    // 确定定价
    const pricing = detail ? determinePricing(detail.tagName) : 'freemium';
    
    try {
      const query = `
        INSERT INTO tools (
          name, title, content, detail, url, image_url, thumbnail_url,
          category_id, tags, pricing, status, created_at, average_rating
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (name) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          detail = EXCLUDED.detail,
          url = EXCLUDED.url,
          image_url = EXCLUDED.image_url,
          thumbnail_url = EXCLUDED.thumbnail_url,
          category_id = EXCLUDED.category_id,
          tags = EXCLUDED.tags,
          pricing = EXCLUDED.pricing,
          average_rating = EXCLUDED.average_rating,
          updated_at = NOW()
        RETURNING id, name
      `;
      
      const values = [
        tool.name,
        JSON.stringify({ en: tool.title, zh: tool.title }),
        JSON.stringify({ en: tool.content, zh: tool.content }),
        JSON.stringify({ en: detail?.detail || tool.content, zh: detail?.detail || tool.content }),
        tool.url,
        tool.imageUrl,
        tool.thumbnailUrl,
        categoryId,
        tagSlugs,
        pricing,
        'published',
        detail?.collectionTime || new Date().toISOString(),
        detail?.starRating || 0,
      ];
      
      const result = await pool.query(query, values);
      console.log(`  ✅ 工具已迁移: ${tool.name}`);
      successCount++;
    } catch (error: any) {
      console.error(`  ❌ 迁移工具失败 [${tool.name}]:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✅ 工具迁移完成: ${successCount} 成功, ${errorCount} 失败\n`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始数据迁移 (Neon Database)...\n');
  console.log(`📊 数据统计:`);
  console.log(`  - 工具数量: ${dataList.length}`);
  console.log(`  - 详情数量: ${detailList.length}`);
  console.log(`  - 分类数量: ${Object.keys(categoryMap).length}`);
  console.log(`  - 标签数量: ${Object.keys(tagMap).length}`);
  
  try {
    // 测试数据库连接
    console.log('\n🔌 测试数据库连接...');
    await pool.query('SELECT NOW()');
    console.log('  ✅ 数据库连接成功\n');
    
    // 1. 迁移分类
    await migrateCategories();
    
    // 2. 迁移标签
    await migrateTags();
    
    // 3. 迁移工具
    await migrateTools();
    
    console.log('🎉 数据迁移全部完成!');
    console.log('\n下一步:');
    console.log('  1. 运行验证脚本: pnpm verify:neon');
    console.log('  2. 在 Neon Dashboard 确认数据');
    
  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await pool.end();
  }
}

// 运行主函数
main();
