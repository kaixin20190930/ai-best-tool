#!/usr/bin/env tsx
/**
 * Neon 数据库迁移验证脚本
 * 
 * 功能:
 * 1. 验证所有数据成功迁移
 * 2. 检查数据关联关系
 * 3. 测试多语言字段
 * 
 * 使用方法:
 * pnpm verify:neon
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import { dataList, detailList } from '../lib/data';

// 加载环境变量
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

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * 验证分类数据
 */
async function verifyCategories(): Promise<VerificationResult> {
  console.log('\n📁 验证分类数据...');
  
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY order_index');
    const data = result.rows;
    
    if (!data || data.length === 0) {
      return {
        passed: false,
        message: '未找到任何分类数据',
      };
    }
    
    console.log(`  ✅ 找到 ${data.length} 个分类`);
    
    // 验证多语言字段
    const hasMultilingual = data.every(cat => 
      cat.name && 
      typeof cat.name === 'object' && 
      'en' in cat.name && 
      'zh' in cat.name
    );
    
    if (!hasMultilingual) {
      return {
        passed: false,
        message: '部分分类缺少多语言字段',
        details: data.filter(cat => !cat.name || typeof cat.name !== 'object'),
      };
    }
    
    console.log('  ✅ 所有分类都包含多语言字段 (en, zh)');
    
    // 显示分类列表
    data.forEach(cat => {
      console.log(`    - ${cat.name.en} (${cat.name.zh}) [${cat.slug}]`);
    });
    
    return {
      passed: true,
      message: `成功验证 ${data.length} 个分类`,
      details: data,
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `验证分类时发生错误: ${error.message}`,
    };
  }
}

/**
 * 验证标签数据
 */
async function verifyTags(): Promise<VerificationResult> {
  console.log('\n🏷️  验证标签数据...');
  
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY slug');
    const data = result.rows;
    
    if (!data || data.length === 0) {
      return {
        passed: false,
        message: '未找到任何标签数据',
      };
    }
    
    console.log(`  ✅ 找到 ${data.length} 个标签`);
    
    // 验证多语言字段
    const hasMultilingual = data.every(tag => 
      tag.name && 
      typeof tag.name === 'object' && 
      'en' in tag.name && 
      'zh' in tag.name
    );
    
    if (!hasMultilingual) {
      return {
        passed: false,
        message: '部分标签缺少多语言字段',
        details: data.filter(tag => !tag.name || typeof tag.name !== 'object'),
      };
    }
    
    console.log('  ✅ 所有标签都包含多语言字段 (en, zh)');
    
    // 显示标签列表
    data.forEach(tag => {
      console.log(`    - ${tag.name.en} (${tag.name.zh}) [${tag.slug}]`);
    });
    
    return {
      passed: true,
      message: `成功验证 ${data.length} 个标签`,
      details: data,
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `验证标签时发生错误: ${error.message}`,
    };
  }
}

/**
 * 验证工具数据
 */
async function verifyTools(): Promise<VerificationResult> {
  console.log('\n🔧 验证工具数据...');
  
  try {
    const result = await pool.query('SELECT * FROM tools ORDER BY created_at DESC');
    const data = result.rows;
    
    if (!data || data.length === 0) {
      return {
        passed: false,
        message: '未找到任何工具数据',
      };
    }
    
    console.log(`  ✅ 找到 ${data.length} 个工具`);
    console.log(`  📊 原始数据: ${dataList.length} 个工具`);
    
    // 检查数量是否匹配
    if (data.length !== dataList.length) {
      console.warn(`  ⚠️  数量不匹配: 数据库 ${data.length} vs 原始 ${dataList.length}`);
    }
    
    // 验证多语言字段
    const hasMultilingual = data.every(tool => 
      tool.title && 
      typeof tool.title === 'object' && 
      'en' in tool.title &&
      tool.content &&
      typeof tool.content === 'object' &&
      'en' in tool.content
    );
    
    if (!hasMultilingual) {
      return {
        passed: false,
        message: '部分工具缺少多语言字段',
        details: data.filter(tool => 
          !tool.title || typeof tool.title !== 'object' ||
          !tool.content || typeof tool.content !== 'object'
        ),
      };
    }
    
    console.log('  ✅ 所有工具都包含多语言字段 (title, content, detail)');
    
    // 验证必填字段
    const missingFields = data.filter(tool => 
      !tool.name || !tool.url || !tool.status
    );
    
    if (missingFields.length > 0) {
      return {
        passed: false,
        message: `${missingFields.length} 个工具缺少必填字段`,
        details: missingFields,
      };
    }
    
    console.log('  ✅ 所有工具都包含必填字段 (name, url, status)');
    
    // 统计状态分布
    const statusCounts = data.reduce((acc, tool) => {
      acc[tool.status] = (acc[tool.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('  📊 状态分布:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`    - ${status}: ${count}`);
    });
    
    // 统计定价分布
    const pricingCounts = data.reduce((acc, tool) => {
      const pricing = tool.pricing || 'unknown';
      acc[pricing] = (acc[pricing] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('  💰 定价分布:');
    Object.entries(pricingCounts).forEach(([pricing, count]) => {
      console.log(`    - ${pricing}: ${count}`);
    });
    
    return {
      passed: true,
      message: `成功验证 ${data.length} 个工具`,
      details: data,
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `验证工具时发生错误: ${error.message}`,
    };
  }
}

/**
 * 验证数据关联关系
 */
async function verifyRelationships(): Promise<VerificationResult> {
  console.log('\n🔗 验证数据关联关系...');
  
  try {
    // 获取所有工具及其关联的分类
    const toolsResult = await pool.query('SELECT name, category_id, tags FROM tools');
    const tools = toolsResult.rows;
    
    // 获取所有分类
    const categoriesResult = await pool.query('SELECT id, slug FROM categories');
    const categories = categoriesResult.rows;
    
    const categoryIds = new Set(categories.map(c => c.id));
    
    // 检查工具的分类 ID 是否有效
    const invalidCategoryTools = tools.filter(tool => 
      tool.category_id && !categoryIds.has(tool.category_id)
    );
    
    if (invalidCategoryTools.length > 0) {
      return {
        passed: false,
        message: `${invalidCategoryTools.length} 个工具的分类 ID 无效`,
        details: invalidCategoryTools,
      };
    }
    
    console.log('  ✅ 所有工具的分类关联都有效');
    
    // 统计有分类的工具数量
    const toolsWithCategory = tools.filter(tool => tool.category_id);
    console.log(`  📊 ${toolsWithCategory.length}/${tools.length} 个工具有分类`);
    
    // 统计有标签的工具数量
    const toolsWithTags = tools.filter(tool => tool.tags && tool.tags.length > 0);
    console.log(`  📊 ${toolsWithTags.length}/${tools.length} 个工具有标签`);
    
    // 统计标签使用情况
    const tagUsage = tools.reduce((acc, tool) => {
      if (tool.tags) {
        tool.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);
    
    console.log('  🏷️  标签使用统计:');
    Object.entries(tagUsage)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .forEach(([tag, count]) => {
        console.log(`    - ${tag}: ${count}`);
      });
    
    return {
      passed: true,
      message: '数据关联关系验证通过',
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `验证关联关系时发生错误: ${error.message}`,
    };
  }
}

/**
 * 验证特定工具的详细信息
 */
async function verifySampleTools(): Promise<VerificationResult> {
  console.log('\n🔍 验证示例工具...');
  
  try {
    // 选择几个示例工具进行详细验证
    const sampleNames = ['openai', 'chatgpt-mac', 'suno_aI'];
    
    for (const name of sampleNames) {
      const result = await pool.query('SELECT * FROM tools WHERE name = $1', [name]);
      
      if (result.rows.length === 0) {
        console.log(`  ⚠️  未找到工具: ${name}`);
        continue;
      }
      
      const data = result.rows[0];
      console.log(`\n  ✅ 工具: ${name}`);
      console.log(`    - 标题 (en): ${data.title?.en || 'N/A'}`);
      console.log(`    - 标题 (zh): ${data.title?.zh || 'N/A'}`);
      console.log(`    - URL: ${data.url}`);
      console.log(`    - 状态: ${data.status}`);
      console.log(`    - 定价: ${data.pricing || 'N/A'}`);
      console.log(`    - 标签: ${data.tags?.join(', ') || 'N/A'}`);
      console.log(`    - 分类 ID: ${data.category_id || 'N/A'}`);
    }
    
    return {
      passed: true,
      message: '示例工具验证完成',
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `验证示例工具时发生错误: ${error.message}`,
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始验证数据迁移 (Neon Database)...\n');
  
  const results: VerificationResult[] = [];
  
  try {
    // 测试连接
    console.log('🔌 测试数据库连接...');
    await pool.query('SELECT NOW()');
    console.log('  ✅ 数据库连接成功\n');
    
    // 1. 验证分类
    results.push(await verifyCategories());
    
    // 2. 验证标签
    results.push(await verifyTags());
    
    // 3. 验证工具
    results.push(await verifyTools());
    
    // 4. 验证关联关系
    results.push(await verifyRelationships());
    
    // 5. 验证示例工具
    results.push(await verifySampleTools());
    
    // 生成验证报告
    console.log('\n' + '='.repeat(60));
    console.log('📋 验证报告');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log(`\n总计: ${results.length} 项检查`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    
    if (failed > 0) {
      console.log('\n失败的检查:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  ❌ ${r.message}`);
        if (r.details) {
          console.log(`     详情:`, JSON.stringify(r.details, null, 2));
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      console.log('\n🎉 所有验证检查都通过了!');
      console.log('\n✅ 数据迁移成功完成');
      console.log('\n下一步:');
      console.log('  1. 在 Neon Dashboard 中查看数据');
      console.log('  2. 更新应用代码以使用数据库数据');
    } else {
      console.log('\n⚠️  部分验证检查失败，请检查上述错误信息');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行主函数
main();
