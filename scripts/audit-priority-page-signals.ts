import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');

const priorityPaths = [
  '/',
  '/explore',
  '/best-ai-tools',
  '/categories/productivity',
  '/categories/web3',
  '/categories/developer-tools',
  '/categories/chatbot',
  '/guides/how-to-choose-ai-tools',
  '/guides/free-ai-tools',
  '/guides/ai-writing-tools',
  '/guides/ai-seo-tools',
  '/guides/ai-coding-tools',
  '/guides/ai-tools-for-web3',
  '/guides/ai-note-taking-tools',
  '/ai/chatgpt',
  '/ai/claude',
  '/ai/cursor',
  '/ai/runway',
  '/ai/defillama',
  '/ai/notta',
];

type AuditRow = {
  path: string;
  status: number | 'error';
  canonical: boolean;
  description: boolean;
  evidenceSignal: boolean;
  actionSignal: boolean;
  error?: string;
};

function has(html: string, pattern: RegExp) {
  return pattern.test(html);
}

async function fetchPage(route: string): Promise<AuditRow> {
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      headers: { 'user-agent': 'ai-best-tool-priority-signal-audit/1.0' },
      redirect: 'follow',
    });
    const html = await response.text();

    return {
      path: route,
      status: response.status,
      canonical: has(html, /<link[^>]+(?:rel=["'][^"']*canonical[^"']*["'][^>]+href|href=["']https:\/\/aibesttool\.com[^"']*["'][^>]+rel=["'][^"']*canonical)/i),
      description: has(html, /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+\S[^"']*["']/i),
      evidenceSignal: has(html, /Evidence and verification|真实信号与验证口径|Last checked|最近核查|最近验证/i),
      actionSignal: has(html, /Comments|评论|Claim|认领|Official site|官网|Compare|比较/i),
    };
  } catch (error) {
    return {
      path: route,
      status: 'error',
      canonical: false,
      description: false,
      evidenceSignal: false,
      actionSignal: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function render(rows: AuditRow[]) {
  const passed = rows.filter((row) => row.status !== 'error' && row.status >= 200 && row.status < 400);
  const count = (key: keyof Pick<AuditRow, 'canonical' | 'description' | 'evidenceSignal' | 'actionSignal'>) =>
    passed.filter((row) => row[key]).length;
  const table = rows
    .map((row) => {
      const checks = [row.canonical, row.description, row.evidenceSignal, row.actionSignal]
        .map((value) => (value ? '是' : '否'))
        .join(' | ');
      return `| ${row.path} | ${row.status} | ${checks} | ${row.error || '-'} |`;
    })
    .join('\n');

  return `# 核心页面真实信号审计\n\n更新时间：${new Date().toISOString().slice(0, 10)}\n\n审计地址：\`${baseUrl}\`\n\n这份报告只读取公开页面 HTML，不修改数据库，也不把模板文案当作真实用户证据。\n\n## 汇总\n\n- 核心页面：${rows.length}\n- HTTP 正常：${passed.length}\n- canonical：${count('canonical')}/${passed.length}\n- meta description：${count('description')}/${passed.length}\n- evidence / freshness 信号：${count('evidenceSignal')}/${passed.length}\n- 评论 / 认领 / 官网 / 比较动作信号：${count('actionSignal')}/${passed.length}\n\n## 页面明细\n\n| 页面 | HTTP | canonical | description | evidence / freshness | action signal | 错误 |\n| --- | --- | --- | --- | --- | --- | --- |\n${table}\n\n## 解读规则\n\n- HTTP、canonical、description 是技术底线；失败时优先修复。\n- evidence / freshness 只代表页面展示了验证口径，不代表已经有真实人工复核。\n- action signal 只代表页面提供评论、认领、官网或比较入口，不代表已有真实互动。\n- 真实评论、收藏、owner 认领和 editorial 复核仍需人工或用户产生，不能由脚本补齐。\n`;
}

async function main() {
  const rows = await Promise.all(priorityPaths.map(fetchPage));
  const outputPath = path.join(process.cwd(), 'docs', 'PRIORITY_PAGE_SIGNAL_AUDIT_CN.md');
  await fs.writeFile(outputPath, render(rows));
  console.log(`Wrote ${outputPath}`);
  console.log(JSON.stringify({
    total: rows.length,
    healthy: rows.filter((row) => row.status !== 'error' && row.status >= 200 && row.status < 400).length,
    canonical: rows.filter((row) => row.canonical).length,
    description: rows.filter((row) => row.description).length,
    evidenceSignal: rows.filter((row) => row.evidenceSignal).length,
    actionSignal: rows.filter((row) => row.actionSignal).length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
