import type { TaskPageEvidence, TaskPageModel } from './taskPageReadModel';

const sourceLabels: Record<string, [string, string]> = {
  'https://help.fathom.video/en/articles/5290881': ['Free and Premium summary limits', '免费与 Premium 摘要限制'],
  'https://fathom.video/pricing': ['Summary and action-item plans', '摘要与行动项套餐'],
  'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan': [
    'Basic transcription and history limits',
    'Basic 转录与历史记录限制',
  ],
  'https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview': [
    'Summary emails and sharing setup',
    '摘要邮件与共享设置',
  ],
  'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan': [
    'Free auto-join, credits and storage',
    '免费自动入会、额度与存储',
  ],
  'https://fireflies.ai/pricing': ['Summary and download plans', '摘要与下载套餐'],
};

// Exact URL grouping retains every distinct verification window; no date is refreshed or inferred.
export function meetingNotesSources(evidence: TaskPageEvidence[], chinese: boolean) {
  const groups = new Map<string, { sourceUrl: string; label: string; windows: TaskPageEvidence[] }>();
  evidence.forEach((entry) => {
    const group = groups.get(entry.sourceUrl) || {
      sourceUrl: entry.sourceUrl,
      label: sourceLabels[entry.sourceUrl]?.[chinese ? 1 : 0] || new URL(entry.sourceUrl).hostname,
      windows: [],
    };
    if (
      !group.windows.some(
        (window) => window.verifiedAt === entry.verifiedAt && window.reviewDueAt === entry.reviewDueAt,
      )
    ) {
      group.windows.push(entry);
    }
    groups.set(entry.sourceUrl, group);
  });
  return Array.from(groups.values());
}

export function meetingNotesConstraints(model: TaskPageModel, chinese: boolean): string[] {
  const urls = new Set(model.tools.flatMap((tool) => tool.evidence.map((item) => item.sourceUrl)));
  const checks: [string, string, string][] = [
    [
      'https://help.fathom.video/en/articles/5290881',
      'Decide whether basic summaries suffice: Fathom Free limits advanced summaries to five calls per month; AI action items require Premium.',
      '先确认基础摘要是否够用：Fathom 免费高级摘要每月限 5 次会议，AI 行动项需要 Premium。',
    ],
    [
      'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan',
      'Check meeting length and history needs: Otter Basic exposes up to 30 minutes per conversation and the 25 most recent conversations.',
      '核对会议时长和历史查阅需求：Otter Basic 每段最多可访问 30 分钟转录，只显示最近 25 段对话。',
    ],
    [
      'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan',
      'Check auto-join, storage and export needs: Fireflies Free unlimited transcription requires eligible auto-joined meetings; storage is 400 minutes per seat and transcript downloads require payment.',
      '核对自动入会、存储和导出要求：Fireflies 免费无限转录限符合条件的自动入会会议，每席存储 400 分钟，下载转录需付费。',
    ],
    [
      'https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview',
      'Decide who may receive notes before enabling sharing: Otter summary emails require a synced calendar event and guest auto-sharing.',
      '开启共享前确认谁能收到纪要：Otter 摘要邮件需要同步日历事件并启用向参会者自动共享。',
    ],
  ];
  return checks.filter(([url]) => urls.has(url)).map((row) => row[chinese ? 2 : 1]);
}
