#!/usr/bin/env tsx
/**
 * 回归测试脚本
 * 运行所有关键功能的验证测试，确保新功能不会破坏已有功能
 */

import { execSync } from 'child_process';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const tests: Array<{ name: string; command: string; critical: boolean }> = [
  // SEO 核心功能
  { name: 'SEO 健康检查', command: 'tsx scripts/seo-health-check.ts', critical: true },
  { name: 'SEO 元数据验证', command: 'tsx scripts/verify-seohead.ts', critical: true },
  { name: 'Hreflang 标签验证', command: 'tsx scripts/verify-hreflang.ts', critical: true },
  { name: '结构化数据验证', command: 'tsx scripts/verify-organization-schema.ts', critical: true },
  { name: '面包屑导航验证', command: 'tsx scripts/verify-breadcrumb-schema.ts', critical: true },
  
  // 性能相关
  { name: '图片优化验证', command: 'tsx scripts/verify-webp-support.ts', critical: false },
  { name: '懒加载验证', command: 'tsx scripts/verify-lazy-loading.ts', critical: false },
  
  // 功能测试
  { name: '认证流程测试', command: 'tsx scripts/test-auth-flow.ts', critical: true },
  { name: '数据访问测试', command: 'tsx scripts/test-data-access.ts', critical: true },
  { name: '筛选系统测试', command: 'tsx scripts/test-filter-system.ts', critical: true },
  
  // 页面渲染
  { name: '首页元数据验证', command: 'tsx scripts/verify-homepage-metadata.ts', critical: true },
  { name: '工具详情页验证', command: 'tsx scripts/verify-tool-detail-metadata.ts', critical: true },
  { name: '列表页元数据验证', command: 'tsx scripts/verify-listing-metadata-simple.ts', critical: true },
];

async function runTest(test: { name: string; command: string; critical: boolean }): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 运行测试: ${test.name}...`);
    execSync(test.command, { 
      stdio: 'pipe',
      timeout: 60000, // 60秒超时
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${test.name} - 通过 (${duration}ms)`);
    
    return {
      name: test.name,
      passed: true,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || String(error);
    
    console.error(`❌ ${test.name} - 失败 (${duration}ms)`);
    if (error.stdout) {
      console.error('输出:', error.stdout.toString());
    }
    if (error.stderr) {
      console.error('错误:', error.stderr.toString());
    }
    
    return {
      name: test.name,
      passed: false,
      error: errorMessage,
      duration,
    };
  }
}

async function main() {
  console.log('🚀 开始回归测试...\n');
  console.log(`总共 ${tests.length} 个测试 (${tests.filter(t => t.critical).length} 个关键测试)\n`);
  
  const startTime = Date.now();
  const results: TestResult[] = [];
  
  // 依次运行所有测试
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  const totalDuration = Date.now() - startTime;
  
  // 生成测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const criticalFailed = results.filter(r => !r.passed && tests.find(t => t.name === r.name)?.critical).length;
  
  console.log(`\n总计: ${results.length} 个测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  if (criticalFailed > 0) {
    console.log(`🚨 关键测试失败: ${criticalFailed}`);
  }
  console.log(`⏱️  总耗时: ${(totalDuration / 1000).toFixed(2)}s`);
  
  // 显示失败的测试
  if (failed > 0) {
    console.log('\n失败的测试:');
    results.filter(r => !r.passed).forEach(r => {
      const isCritical = tests.find(t => t.name === r.name)?.critical;
      const marker = isCritical ? '🚨' : '⚠️';
      console.log(`  ${marker} ${r.name}`);
      if (r.error) {
        console.log(`     错误: ${r.error.split('\n')[0]}`);
      }
    });
  }
  
  // 生成 JSON 报告
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    criticalFailed,
    duration: totalDuration,
    results: results.map(r => ({
      name: r.name,
      passed: r.passed,
      critical: tests.find(t => t.name === r.name)?.critical,
      duration: r.duration,
      error: r.error,
    })),
  };
  
  // 保存报告
  const fs = require('fs');
  const reportPath = '.kiro/regression-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  
  // 如果有关键测试失败，退出码为 1
  if (criticalFailed > 0) {
    console.log('\n🚨 关键测试失败，请修复后再继续！');
    process.exit(1);
  }
  
  // 如果有非关键测试失败，给出警告但不阻止
  if (failed > 0 && criticalFailed === 0) {
    console.log('\n⚠️  有非关键测试失败，建议修复');
    process.exit(0);
  }
  
  console.log('\n✨ 所有测试通过！');
  process.exit(0);
}

main().catch(error => {
  console.error('回归测试执行失败:', error);
  process.exit(1);
});
