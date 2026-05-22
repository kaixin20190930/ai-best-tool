#!/usr/bin/env tsx
/**
 * 数据迁移脚本
 * 
 * 功能:
 * 1. 将 lib/data.ts 中的 dataList 迁移到 tools 表
 * 2. 将 detailList 中的详细信息合并到 tools 表
 * 3. 提取并创建 categories 和 tags 数据
 * 4. 处理多语言字段的 JSONB 转换
 * 
 * 使用方法:
 * pnpm tsx scripts/migrate-data.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { dataList, detailList, WebNavigationListRow, WebNavigationDetailData } from '../lib/data';

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
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        name: { en: category.en, zh: category.zh },
        slug: category.slug,
        description: { en: `${category.en} tools`, zh: `${category.zh}工具` },
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select();
    
    if (error) {
      console.error(`  ❌ 创建分类失败 [${category.slug}]:`, error.message);
    } else {
      console.log(`  ✅ 分类已创建/更新: ${category.en} (${category.zh})`);
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
    const { data, error } = await supabase
      .from('tags')
      .upsert({
        name: { en: tag.en, zh: tag.zh },
        slug: tag.slug,
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select();
    
    if (error) {
      console.error(`  ❌ 创建标签失败 [${tag.slug}]:`, error.message);
    } else {
      console.log(`  ✅ 标签已创建/更新: ${tag.en} (${tag.zh})`);
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
  
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category.slug)
    .single();
  
  if (error || !data) {
    console.error(`  ❌ 获取分类 ID 失败 [${category.slug}]:`, error?.message);
    return null;
  }
  
  return data.id;
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
    
    // 准备工具数据
    const toolData = {
      name: tool.name,
      title: {
        en: tool.title,
        zh: tool.title, // 如果没有中文翻译，使用英文
      },
      content: {
        en: tool.content,
        zh: tool.content,
      },
      detail: {
        en: detail?.detail || tool.content,
        zh: detail?.detail || tool.content,
      },
      url: tool.url,
      image_url: tool.imageUrl,
      thumbnail_url: tool.thumbnailUrl,
      category_id: categoryId,
      tags: tagSlugs,
      pricing: pricing,
      status: 'published', // 所有现有工具都设置为已发布
      created_at: detail?.collectionTime || new Date().toISOString(),
      view_count: 0,
      click_count: 0,
      share_count: 0,
      average_rating: detail?.starRating || 0,
      rating_count: 0,
    };
    
    // 插入或更新工具
    const { data, error } = await supabase
      .from('tools')
      .upsert(toolData, {
        onConflict: 'name',
        ignoreDuplicates: false,
      })
      .select();
    
    if (error) {
      console.error(`  ❌ 迁移工具失败 [${tool.name}]:`, error.message);
      errorCount++;
    } else {
      console.log(`  ✅ 工具已迁移: ${tool.name}`);
      successCount++;
    }
  }
  
  console.log(`\n✅ 工具迁移完成: ${successCount} 成功, ${errorCount} 失败\n`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始数据迁移...\n');
  console.log(`📊 数据统计:`);
  console.log(`  - 工具数量: ${dataList.length}`);
  console.log(`  - 详情数量: ${detailList.length}`);
  console.log(`  - 分类数量: ${Object.keys(categoryMap).length}`);
  console.log(`  - 标签数量: ${Object.keys(tagMap).length}`);
  
  try {
    // 1. 迁移分类
    await migrateCategories();
    
    // 2. 迁移标签
    await migrateTags();
    
    // 3. 迁移工具
    await migrateTools();
    
    console.log('🎉 数据迁移全部完成!');
    console.log('\n下一步:');
    console.log('  1. 运行验证脚本: pnpm tsx scripts/verify-migration.ts');
    console.log('  2. 检查 Supabase 控制台确认数据');
    
  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
