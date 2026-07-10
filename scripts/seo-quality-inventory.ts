import fs from 'node:fs';
import path from 'node:path';

import { GUIDE_PAGES } from '../lib/content/guides';

type InventoryRow = {
  url: string;
  type: 'Core' | 'Guide' | 'Comparison' | 'Tool' | 'Conversion';
  status: '可进 sitemap' | '内部流量页' | 'noindex / 合并候选';
  priority: 'P0' | 'P1' | 'P2';
  action: string;
  reason: string;
};

const outputPath = path.join(process.cwd(), 'docs', 'SEO_QUALITY_INVENTORY_CN.md');
const guidesRoot = path.join(process.cwd(), 'app', '[locale]', '(with-footer)', 'guides');

const priorityPages = new Set([
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
]);

const sitemapGuidePages = new Set([
  '/guides/how-to-choose-ai-tools',
  '/guides/free-ai-tools',
  '/guides/best-free-ai-tools',
  '/guides/ai-writing-tools',
  '/guides/ai-seo-tools',
  '/guides/ai-video-tools',
  '/guides/ai-image-tools',
  '/guides/ai-coding-tools',
  '/guides/ai-chatbot-tools',
  '/guides/ai-productivity-tools',
  '/guides/ai-tools-for-research',
  '/guides/ai-tools-for-developers',
  '/guides/ai-tools-for-automation',
  '/guides/ai-tools-for-web3',
  '/guides/ai-tools-for-marketing',
  '/guides/ai-tools-for-sales',
  '/guides/ai-tools-for-voice',
  '/guides/ai-note-taking-tools',
]);

const coreRows: InventoryRow[] = [
  {
    url: '/',
    type: 'Core',
    status: '可进 sitemap',
    priority: 'P1',
    action: '增强站点定位、精选入口和最近更新信号',
    reason: '全站主题锚点，应该帮助 Google 快速理解站点价值。',
  },
  {
    url: '/explore',
    type: 'Core',
    status: '可进 sitemap',
    priority: 'P1',
    action: '补充目录筛选说明、热门分类和质量规则',
    reason: '目录主入口，适合作为工具页的索引与内链枢纽。',
  },
  {
    url: '/best-ai-tools',
    type: 'Core',
    status: '可进 sitemap',
    priority: 'P1',
    action: '补排名方法、更新时间和选择标准',
    reason: '承接高意图榜单搜索，必须避免变成普通列表页。',
  },
  {
    url: '/pricing',
    type: 'Conversion',
    status: '内部流量页',
    priority: 'P2',
    action: '保持 noindex, follow；只服务转化',
    reason: '交易页不应和内容页争夺索引预算。',
  },
  {
    url: '/submit',
    type: 'Conversion',
    status: '内部流量页',
    priority: 'P2',
    action: '保持 noindex, follow；继续强化提交前教育',
    reason: '表单页主要服务操作，不是搜索入口。',
  },
  {
    url: '/developer/listing',
    type: 'Conversion',
    status: '内部流量页',
    priority: 'P2',
    action: '保持 noindex, follow；继续引导 owner 认领',
    reason: '认领页是商业验证入口，不作为独立 SEO 目标页。',
  },
];

const toolRows: InventoryRow[] = [
  '/ai/chatgpt',
  '/ai/claude',
  '/ai/cursor',
  '/ai/runway',
  '/ai/defillama',
  '/ai/notta',
].map((url) => ({
  url,
  type: 'Tool' as const,
  status: '可进 sitemap' as const,
  priority: 'P1' as const,
  action: '补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号',
  reason: '代表性详情页，需要承担站点可信度和长尾搜索入口。',
}));

function getGuideRoutesFromFilesystem(): string[] {
  if (!fs.existsSync(guidesRoot)) return [];

  return fs
    .readdirSync(guidesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(guidesRoot, entry.name, 'page.tsx')))
    .map((entry) => `/guides/${entry.name}`)
    .sort();
}

function classifyGuide(url: string): InventoryRow {
  if (url.includes('-comparison')) {
    return {
      url,
      type: 'Comparison',
      status: 'noindex / 合并候选',
      priority: 'P2',
      action: '保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并',
      reason: 'comparison 页面结构相似，当前不适合大规模进入索引面。',
    };
  }

  if (sitemapGuidePages.has(url)) {
    return {
      url,
      type: 'Guide',
      status: '可进 sitemap',
      priority: priorityPages.has(url) ? 'P1' : 'P2',
      action: priorityPages.has(url)
        ? '补真实数据、选择标准、最近验证日期和内部链接'
        : '保留 sitemap；每周检查是否需要增强或降级',
      reason: priorityPages.has(url)
        ? '核心指南页，适合优先做真实内容增强。'
        : '主力指南页，但不是本轮 20 个最高优先级页面。',
    };
  }

  return {
    url,
    type: 'Guide',
    status: 'noindex / 合并候选',
    priority: 'P2',
    action: '通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并',
    reason: '该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。',
  };
}

function toMarkdownTable(rows: InventoryRow[]): string {
  const header = '| URL | 类型 | 当前状态 | 优先级 | 处理动作 | 原因 |\n| --- | --- | --- | --- | --- | --- |';
  const body = rows
    .map((row) =>
      [
        row.url,
        row.type,
        row.status,
        row.priority,
        row.action,
        row.reason,
      ]
        .map((value) => value.replace(/\|/g, '\\|'))
        .join(' | '),
    )
    .map((line) => `| ${line} |`)
    .join('\n');

  return `${header}\n${body}`;
}

function main() {
  const guideConfigUrls = GUIDE_PAGES.map((page) => page.href);
  const guideFileUrls = getGuideRoutesFromFilesystem();
  const guideUrls = Array.from(new Set([...guideConfigUrls, ...guideFileUrls])).sort();
  const guideRows = guideUrls.map(classifyGuide);
  const rows = [...coreRows, ...toolRows, ...guideRows].sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || a.url.localeCompare(b.url);
  });

  const statusCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const content = `# SEO 页面质量盘点表

更新时间：${new Date().toISOString().slice(0, 10)}

这份表由 \`pnpm exec tsx scripts/seo-quality-inventory.ts\` 生成，用来辅助判断页面是否应该继续索引、保持内部流量，或进入 noindex / 合并候选。

## 汇总

- 总页面数：${rows.length}
- 可进 sitemap：${statusCounts['可进 sitemap'] || 0}
- 内部流量页：${statusCounts['内部流量页'] || 0}
- noindex / 合并候选：${statusCounts['noindex / 合并候选'] || 0}

## 处理原则

- P1 页面先补真实数据、验证日期、选择理由、评论或 owner 信号。
- P2 内部流量页不急着推给 Google，先观察站内点击和用户价值。
- comparison 页默认不进 sitemap，当前先保持 noindex。
- 同义 guide 如果长期无曝光、无点击、无转化，后续优先合并到主 guide。

## 页面清单

${toMarkdownTable(rows)}
`;

  fs.writeFileSync(outputPath, content);
  console.log(`Wrote ${outputPath}`);
  console.log(JSON.stringify(statusCounts, null, 2));
}

main();
