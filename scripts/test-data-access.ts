#!/usr/bin/env tsx
/**
 * 测试数据访问层
 * 
 * 验证数据库客户端和服务层是否正常工作
 */

import { config } from 'dotenv';
import { testConnection, closePool } from '../db/neon/client';
import { getAllCategories } from '../lib/services/categories';
import { getAllTags } from '../lib/services/tags';
import { getTools } from '../lib/services/tools';

// 加载环境变量
config({ path: '.env.local' });

async function main() {
  console.log('🧪 测试数据访问层...\n');
  
  try {
    // 1. 测试数据库连接
    console.log('1️⃣  测试数据库连接...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('数据库连接失败');
    }
    console.log('   ✅ 数据库连接成功\n');
    
    // 2. 测试分类服务
    console.log('2️⃣  测试分类服务...');
    const categories = await getAllCategories(true);
    console.log(`   ✅ 获取到 ${categories.length} 个分类`);
    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log(`   📁 示例分类: ${JSON.stringify(firstCategory.name)} (${firstCategory.slug})`);
      if ('toolCount' in firstCategory) {
        console.log(`      工具数量: ${firstCategory.toolCount}`);
      }
    }
    console.log();
    
    // 3. 测试标签服务
    console.log('3️⃣  测试标签服务...');
    const tags = await getAllTags('count');
    console.log(`   ✅ 获取到 ${tags.length} 个标签`);
    if (tags.length > 0) {
      const firstTag = tags[0];
      console.log(`   🏷️  示例标签: ${JSON.stringify(firstTag.name)} (${firstTag.slug})`);
      console.log(`      使用次数: ${firstTag.count}`);
    }
    console.log();
    
    // 4. 测试工具服务
    console.log('4️⃣  测试工具服务...');
    const toolsResult = await getTools(
      { status: 'published' },
      { page: 1, pageSize: 5 },
      'latest'
    );
    console.log(`   ✅ 获取到 ${toolsResult.total} 个工具（显示前 ${toolsResult.data.length} 个）`);
    if (toolsResult.data.length > 0) {
      const firstTool = toolsResult.data[0];
      console.log(`   🔧 示例工具: ${JSON.stringify(firstTool.title)}`);
      console.log(`      名称: ${firstTool.name}`);
      console.log(`      URL: ${firstTool.url}`);
      console.log(`      标签: ${firstTool.tags.join(', ')}`);
      console.log(`      浏览量: ${firstTool.viewCount}`);
      console.log(`      评分: ${firstTool.averageRating} (${firstTool.ratingCount} 次评分)`);
    }
    console.log();
    
    // 5. 测试搜索功能
    console.log('5️⃣  测试搜索功能...');
    const searchResult = await getTools(
      { search: 'AI', status: 'published' },
      { page: 1, pageSize: 3 },
      'popular'
    );
    console.log(`   ✅ 搜索 "AI" 找到 ${searchResult.total} 个结果`);
    console.log();
    
    // 6. 测试筛选功能
    console.log('6️⃣  测试筛选功能...');
    if (categories.length > 0) {
      const firstCategorySlug = categories[0].slug;
      const filterResult = await getTools(
        { category: firstCategorySlug, status: 'published' },
        { page: 1, pageSize: 3 },
        'latest'
      );
      console.log(`   ✅ 分类 "${firstCategorySlug}" 有 ${filterResult.total} 个工具`);
    }
    console.log();
    
    console.log('🎉 所有测试通过！数据访问层工作正常。\n');
    
  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.stack) {
      console.error('\n堆栈跟踪:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await closePool();
  }
}

// 运行测试
main();
