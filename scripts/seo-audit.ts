/**
 * SEO & Website Quality Audit Script
 * 全面检查网站的 SEO、性能、安全性和用户体验
 */

import https from 'https';
import http from 'http';

interface AuditResult {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

const results: AuditResult[] = [];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';
const TEST_PAGES = [
  '/',
  '/cn',
  '/en',
  '/explore',
  '/startup',
  '/submit',
];

function addResult(category: string, item: string, status: AuditResult['status'], message: string, recommendation?: string) {
  results.push({ category, item, status, message, recommendation });
}

async function fetchPage(url: string): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body
        });
      });
    }).on('error', reject);
  });
}

// 1. HTTPS / SSL 检查
async function checkHTTPS() {
  console.log('\n🔒 检查 1: HTTPS / SSL 安全协议');
  console.log('─'.repeat(70));
  
  try {
    if (SITE_URL.startsWith('https://')) {
      addResult('安全性', 'HTTPS 协议', 'pass', '网站使用 HTTPS 协议');
      console.log('✅ 网站使用 HTTPS 协议');
    } else {
      addResult('安全性', 'HTTPS 协议', 'fail', '网站未使用 HTTPS 协议', '强烈建议配置 SSL 证书并启用 HTTPS');
      console.log('❌ 网站未使用 HTTPS 协议');
    }
    
    // 测试实际访问
    const response = await fetchPage(SITE_URL);
    if (response.statusCode === 200) {
      console.log('✅ HTTPS 连接成功');
    }
  } catch (error) {
    addResult('安全性', 'HTTPS 连接', 'fail', `HTTPS 连接失败: ${error}`, '检查 SSL 证书配置');
    console.log(`❌ HTTPS 连接失败: ${error}`);
  }
}

// 2. 页面加载速度和性能检查
async function checkPerformance() {
  console.log('\n⚡ 检查 2: 页面加载速度和性能');
  console.log('─'.repeat(70));
  
  for (const page of TEST_PAGES) {
    const url = `${SITE_URL}${page}`;
    const startTime = Date.now();
    
    try {
      const response = await fetchPage(url);
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 1000) {
        addResult('性能', `页面加载 ${page}`, 'pass', `加载时间: ${loadTime}ms (优秀)`);
        console.log(`✅ ${page} - 加载时间: ${loadTime}ms (优秀)`);
      } else if (loadTime < 3000) {
        addResult('性能', `页面加载 ${page}`, 'warning', `加载时间: ${loadTime}ms (可接受)`, '考虑优化图片、代码分割、CDN 等');
        console.log(`⚠️  ${page} - 加载时间: ${loadTime}ms (可接受，建议优化)`);
      } else {
        addResult('性能', `页面加载 ${page}`, 'fail', `加载时间: ${loadTime}ms (较慢)`, '需要优化：压缩资源、启用缓存、使用 CDN');
        console.log(`❌ ${page} - 加载时间: ${loadTime}ms (较慢)`);
      }
    } catch (error) {
      addResult('性能', `页面加载 ${page}`, 'fail', `无法访问: ${error}`);
      console.log(`❌ ${page} - 无法访问`);
    }
  }
  
  console.log('\n📝 建议使用以下工具进行详细性能测试:');
  console.log('   - Google PageSpeed Insights: https://pagespeed.web.dev/');
  console.log('   - Chrome Lighthouse (DevTools)');
  console.log('   - WebPageTest: https://www.webpagetest.org/');
}

// 3. SEO 元数据检查
async function checkSEOMetadata() {
  console.log('\n🔍 检查 3: SEO 元数据 (Title, Meta Description, H-tags)');
  console.log('─'.repeat(70));
  
  for (const page of TEST_PAGES) {
    const url = `${SITE_URL}${page}`;
    
    try {
      const response = await fetchPage(url);
      const html = response.body;
      
      // 检查 Title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1].trim()) {
        const titleLength = titleMatch[1].trim().length;
        if (titleLength >= 30 && titleLength <= 60) {
          addResult('SEO', `Title ${page}`, 'pass', `Title 存在且长度合适 (${titleLength} 字符)`);
          console.log(`✅ ${page} - Title: "${titleMatch[1].trim().substring(0, 50)}..." (${titleLength} 字符)`);
        } else {
          addResult('SEO', `Title ${page}`, 'warning', `Title 长度不理想 (${titleLength} 字符)`, '建议 Title 长度在 30-60 字符之间');
          console.log(`⚠️  ${page} - Title 长度: ${titleLength} 字符 (建议 30-60)`);
        }
      } else {
        addResult('SEO', `Title ${page}`, 'fail', 'Title 缺失', '每个页面必须有唯一的 Title');
        console.log(`❌ ${page} - Title 缺失`);
      }
      
      // 检查 Meta Description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      if (descMatch && descMatch[1].trim()) {
        const descLength = descMatch[1].trim().length;
        if (descLength >= 120 && descLength <= 160) {
          addResult('SEO', `Meta Description ${page}`, 'pass', `Description 存在且长度合适 (${descLength} 字符)`);
          console.log(`✅ ${page} - Meta Description 长度: ${descLength} 字符`);
        } else {
          addResult('SEO', `Meta Description ${page}`, 'warning', `Description 长度不理想 (${descLength} 字符)`, '建议长度在 120-160 字符之间');
          console.log(`⚠️  ${page} - Meta Description 长度: ${descLength} 字符 (建议 120-160)`);
        }
      } else {
        addResult('SEO', `Meta Description ${page}`, 'fail', 'Meta Description 缺失', '每个页面应有独特的 Description');
        console.log(`❌ ${page} - Meta Description 缺失`);
      }
      
      // 检查 H1 标签
      const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi);
      if (h1Matches && h1Matches.length === 1) {
        addResult('SEO', `H1 标签 ${page}`, 'pass', '有且仅有一个 H1 标签');
        console.log(`✅ ${page} - H1 标签: 1 个 (正确)`);
      } else if (h1Matches && h1Matches.length > 1) {
        addResult('SEO', `H1 标签 ${page}`, 'warning', `有 ${h1Matches.length} 个 H1 标签`, '建议每页只有一个 H1');
        console.log(`⚠️  ${page} - H1 标签: ${h1Matches.length} 个 (建议只有 1 个)`);
      } else {
        addResult('SEO', `H1 标签 ${page}`, 'fail', 'H1 标签缺失', '每个页面应有一个 H1 标签');
        console.log(`❌ ${page} - H1 标签缺失`);
      }
      
      // 检查 H2 标签
      const h2Matches = html.match(/<h2[^>]*>.*?<\/h2>/gi);
      if (h2Matches && h2Matches.length > 0) {
        addResult('SEO', `H2 标签 ${page}`, 'pass', `有 ${h2Matches.length} 个 H2 标签`);
        console.log(`✅ ${page} - H2 标签: ${h2Matches.length} 个`);
      } else {
        addResult('SEO', `H2 标签 ${page}`, 'info', 'H2 标签缺失', '考虑添加 H2 标签以改善内容结构');
        console.log(`ℹ️  ${page} - H2 标签: 0 个`);
      }
      
      // 检查 Open Graph 标签
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      
      if (ogTitleMatch && ogDescMatch && ogImageMatch) {
        addResult('SEO', `Open Graph ${page}`, 'pass', 'Open Graph 标签完整');
        console.log(`✅ ${page} - Open Graph 标签完整`);
      } else {
        addResult('SEO', `Open Graph ${page}`, 'warning', 'Open Graph 标签不完整', '添加 og:title, og:description, og:image 以改善社交媒体分享');
        console.log(`⚠️  ${page} - Open Graph 标签不完整`);
      }
      
    } catch (error) {
      console.log(`❌ ${page} - 无法检查 SEO 元数据`);
    }
  }
}

// 4. URL 结构和内部链接检查
async function checkURLStructure() {
  console.log('\n🔗 检查 4: URL 结构和内部链接');
  console.log('─'.repeat(70));
  
  for (const page of TEST_PAGES) {
    const url = `${SITE_URL}${page}`;
    
    // 检查 URL 是否简洁、语义化
    if (page === '/' || /^\/[a-z]{2}$/.test(page) || /^\/[a-z-]+$/.test(page)) {
      addResult('URL 结构', `URL ${page}`, 'pass', 'URL 简洁且语义化');
      console.log(`✅ ${page} - URL 结构良好`);
    } else if (/\?/.test(page) || /[A-Z]/.test(page)) {
      addResult('URL 结构', `URL ${page}`, 'warning', 'URL 包含查询参数或大写字母', '建议使用小写字母和连字符');
      console.log(`⚠️  ${page} - URL 可以优化`);
    }
    
    try {
      const response = await fetchPage(url);
      const html = response.body;
      
      // 检查内部链接
      const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["']/gi);
      if (linkMatches) {
        const internalLinks = linkMatches.filter(link => 
          link.includes('href="/') || link.includes(SITE_URL)
        );
        addResult('内部链接', `内部链接 ${page}`, 'pass', `发现 ${internalLinks.length} 个内部链接`);
        console.log(`✅ ${page} - 内部链接: ${internalLinks.length} 个`);
      }
    } catch (error) {
      console.log(`❌ ${page} - 无法检查内部链接`);
    }
  }
}

// 5. Sitemap 和 robots.txt 检查
async function checkSitemapAndRobots() {
  console.log('\n🗺️  检查 5: Sitemap 和 robots.txt');
  console.log('─'.repeat(70));
  
  // 检查 sitemap.xml
  try {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const response = await fetchPage(sitemapUrl);
    
    if (response.statusCode === 200) {
      addResult('Sitemap', 'sitemap.xml', 'pass', 'Sitemap 存在且可访问');
      console.log(`✅ Sitemap 存在: ${sitemapUrl}`);
      
      // 检查 sitemap 内容
      if (response.body.includes('<urlset') || response.body.includes('<sitemapindex')) {
        console.log('✅ Sitemap 格式正确');
        
        // 统计 URL 数量
        const urlMatches = response.body.match(/<loc>/g);
        if (urlMatches) {
          console.log(`✅ Sitemap 包含 ${urlMatches.length} 个 URL`);
        }
      } else {
        addResult('Sitemap', 'sitemap.xml 格式', 'fail', 'Sitemap 格式不正确', '确保 sitemap 符合 XML 格式规范');
        console.log('❌ Sitemap 格式不正确');
      }
    } else {
      addResult('Sitemap', 'sitemap.xml', 'fail', `Sitemap 不存在 (HTTP ${response.statusCode})`, '创建并提交 sitemap.xml');
      console.log(`❌ Sitemap 不存在 (HTTP ${response.statusCode})`);
    }
  } catch (error) {
    addResult('Sitemap', 'sitemap.xml', 'fail', `无法访问 Sitemap: ${error}`, '确保 sitemap.xml 可访问');
    console.log(`❌ 无法访问 Sitemap: ${error}`);
  }
  
  // 检查 robots.txt
  try {
    const robotsUrl = `${SITE_URL}/robots.txt`;
    const response = await fetchPage(robotsUrl);
    
    if (response.statusCode === 200) {
      addResult('Robots', 'robots.txt', 'pass', 'robots.txt 存在且可访问');
      console.log(`✅ robots.txt 存在: ${robotsUrl}`);
      
      const robotsContent = response.body;
      
      // 检查是否误写了 Disallow: /
      if (robotsContent.includes('Disallow: /') && !robotsContent.includes('Allow:')) {
        addResult('Robots', 'robots.txt 配置', 'fail', '检测到 "Disallow: /" 可能阻止所有抓取', '检查 robots.txt 配置，确保不会阻止重要页面');
        console.log('❌ 警告: robots.txt 可能阻止所有抓取');
      } else {
        console.log('✅ robots.txt 配置看起来正常');
      }
      
      // 检查是否包含 Sitemap 引用
      if (robotsContent.toLowerCase().includes('sitemap:')) {
        console.log('✅ robots.txt 包含 Sitemap 引用');
      } else {
        addResult('Robots', 'robots.txt Sitemap', 'warning', 'robots.txt 未包含 Sitemap 引用', '在 robots.txt 中添加 Sitemap 位置');
        console.log('⚠️  robots.txt 未包含 Sitemap 引用');
      }
    } else {
      addResult('Robots', 'robots.txt', 'warning', `robots.txt 不存在 (HTTP ${response.statusCode})`, '创建 robots.txt 文件');
      console.log(`⚠️  robots.txt 不存在 (HTTP ${response.statusCode})`);
    }
  } catch (error) {
    console.log(`❌ 无法访问 robots.txt: ${error}`);
  }
}

// 6. 内容质量检查
async function checkContentQuality() {
  console.log('\n📝 检查 6: 内容质量和充足性');
  console.log('─'.repeat(70));
  
  const contentPages = ['/explore', '/startup'];
  
  for (const page of contentPages) {
    const url = `${SITE_URL}${page}`;
    
    try {
      const response = await fetchPage(url);
      const html = response.body;
      
      // 移除 HTML 标签，计算文本内容长度
      const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                             .replace(/<[^>]+>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim();
      
      const wordCount = textContent.length;
      
      if (wordCount > 1000) {
        addResult('内容质量', `内容长度 ${page}`, 'pass', `内容充足 (约 ${wordCount} 字符)`);
        console.log(`✅ ${page} - 内容充足 (约 ${wordCount} 字符)`);
      } else if (wordCount > 300) {
        addResult('内容质量', `内容长度 ${page}`, 'warning', `内容较少 (约 ${wordCount} 字符)`, '考虑增加更多描述性内容');
        console.log(`⚠️  ${page} - 内容较少 (约 ${wordCount} 字符)`);
      } else {
        addResult('内容质量', `内容长度 ${page}`, 'fail', `内容过少 (约 ${wordCount} 字符)`, '增加详细描述、分类、标签等内容');
        console.log(`❌ ${page} - 内容过少 (约 ${wordCount} 字符)`);
      }
      
      // 检查是否有图片
      const imgMatches = html.match(/<img[^>]*>/gi);
      if (imgMatches && imgMatches.length > 0) {
        console.log(`✅ ${page} - 包含 ${imgMatches.length} 张图片`);
      } else {
        console.log(`ℹ️  ${page} - 未检测到图片`);
      }
      
    } catch (error) {
      console.log(`❌ ${page} - 无法检查内容质量`);
    }
  }
  
  console.log('\n📝 建议:');
  console.log('   - 为每个工具添加详细描述');
  console.log('   - 添加分类和标签');
  console.log('   - 包含使用建议和截图');
  console.log('   - 添加用户评价和评分');
}

// 7. 移动端适配检查
async function checkMobileOptimization() {
  console.log('\n📱 检查 7: 移动端适配和响应式设计');
  console.log('─'.repeat(70));
  
  for (const page of TEST_PAGES.slice(0, 3)) {
    const url = `${SITE_URL}${page}`;
    
    try {
      const response = await fetchPage(url);
      const html = response.body;
      
      // 检查 viewport meta 标签
      const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
      if (viewportMatch) {
        addResult('移动端', `Viewport ${page}`, 'pass', 'Viewport meta 标签存在');
        console.log(`✅ ${page} - Viewport meta 标签存在`);
      } else {
        addResult('移动端', `Viewport ${page}`, 'fail', 'Viewport meta 标签缺失', '添加 <meta name="viewport" content="width=device-width, initial-scale=1">');
        console.log(`❌ ${page} - Viewport meta 标签缺失`);
      }
      
      // 检查是否使用响应式框架
      if (html.includes('tailwind') || html.includes('responsive')) {
        console.log(`✅ ${page} - 使用响应式 CSS 框架`);
      }
      
    } catch (error) {
      console.log(`❌ ${page} - 无法检查移动端适配`);
    }
  }
  
  console.log('\n📝 建议使用以下工具测试移动端:');
  console.log('   - Chrome DevTools 移动设备模拟');
  console.log('   - Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly');
  console.log('   - 实际移动设备测试');
}

// 8. 死链检查
async function checkBrokenLinks() {
  console.log('\n🔗 检查 8: 死链和 404 错误');
  console.log('─'.repeat(70));
  
  const testLinks = [
    '/',
    '/cn',
    '/explore',
    '/startup',
    '/submit',
    '/login',
    '/register',
    '/privacy-policy',
    '/terms-of-service',
  ];
  
  let brokenLinks = 0;
  let workingLinks = 0;
  
  for (const link of testLinks) {
    const url = `${SITE_URL}${link}`;
    
    try {
      const response = await fetchPage(url);
      
      if (response.statusCode === 200) {
        workingLinks++;
        console.log(`✅ ${link} - HTTP ${response.statusCode}`);
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`⚠️  ${link} - HTTP ${response.statusCode} (重定向)`);
      } else if (response.statusCode === 404) {
        brokenLinks++;
        addResult('死链', `404 错误 ${link}`, 'fail', `页面不存在 (HTTP 404)`, '修复或重定向此链接');
        console.log(`❌ ${link} - HTTP 404 (页面不存在)`);
      } else {
        console.log(`⚠️  ${link} - HTTP ${response.statusCode}`);
      }
    } catch (error) {
      brokenLinks++;
      addResult('死链', `连接失败 ${link}`, 'fail', `无法访问: ${error}`, '检查链接是否正确');
      console.log(`❌ ${link} - 无法访问`);
    }
  }
  
  console.log(`\n📊 总计: ${workingLinks} 个正常链接, ${brokenLinks} 个问题链接`);
  
  if (brokenLinks === 0) {
    addResult('死链', '总体检查', 'pass', '未发现死链');
  } else {
    addResult('死链', '总体检查', 'fail', `发现 ${brokenLinks} 个问题链接`, '使用工具如 Screaming Frog 或 Xenu 进行全站扫描');
  }
  
  console.log('\n📝 建议使用以下工具进行全站死链检查:');
  console.log('   - Screaming Frog SEO Spider');
  console.log('   - Xenu Link Sleuth');
  console.log('   - Online Broken Link Checker');
}

// 生成报告
function generateReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 审计报告总结');
  console.log('='.repeat(70));
  
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const infoCount = results.filter(r => r.status === 'info').length;
  
  console.log(`\n✅ 通过: ${passCount}`);
  console.log(`❌ 失败: ${failCount}`);
  console.log(`⚠️  警告: ${warningCount}`);
  console.log(`ℹ️  信息: ${infoCount}`);
  
  if (failCount > 0) {
    console.log('\n❌ 需要立即修复的问题:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`   - [${r.category}] ${r.item}: ${r.message}`);
      if (r.recommendation) {
        console.log(`     建议: ${r.recommendation}`);
      }
    });
  }
  
  if (warningCount > 0) {
    console.log('\n⚠️  建议优化的项目:');
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(`   - [${r.category}] ${r.item}: ${r.message}`);
      if (r.recommendation) {
        console.log(`     建议: ${r.recommendation}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  // 计算总体评分
  const totalChecks = passCount + failCount + warningCount;
  const score = Math.round((passCount / totalChecks) * 100);
  
  console.log(`\n🎯 总体评分: ${score}/100`);
  
  if (score >= 90) {
    console.log('🌟 优秀！网站 SEO 和质量状况良好');
  } else if (score >= 70) {
    console.log('👍 良好，但仍有改进空间');
  } else if (score >= 50) {
    console.log('⚠️  需要改进，存在一些重要问题');
  } else {
    console.log('❌ 需要大量优化工作');
  }
  
  console.log('\n');
}

// 主函数
async function runAudit() {
  console.log('🚀 开始 SEO 和网站质量审计');
  console.log(`🌐 目标网站: ${SITE_URL}`);
  console.log('='.repeat(70));
  
  try {
    await checkHTTPS();
    await checkPerformance();
    await checkSEOMetadata();
    await checkURLStructure();
    await checkSitemapAndRobots();
    await checkContentQuality();
    await checkMobileOptimization();
    await checkBrokenLinks();
    
    generateReport();
  } catch (error) {
    console.error('\n❌ 审计过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行审计
runAudit().catch(console.error);
