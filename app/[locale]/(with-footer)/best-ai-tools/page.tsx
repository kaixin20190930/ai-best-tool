import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Layers3, Sparkles, Star, Target } from 'lucide-react';

import { topListTopics } from '@/lib/data/topLists';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return {
    title: isChinese ? 'Best AI Tools by Use Case | AI Best Tool' : 'Best AI Tools by Use Case | AI Best Tool',
    description: isChinese
      ? '按用途整理的 AI 工具榜单：Agent、可观测、写作、开发、模型路由、研究和视频，并明确下一步该看什么。'
      : 'Purpose-driven AI tool rankings for agents, observability, coding, model routing, research, writing, and video with clear next-step guidance.',
  };
}

export default function BestAiToolsPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const priorityTopicKeys = [
    'ai-coding-tools',
    'ai-agent-tools',
    'ai-chatbot-tools',
    'ai-image-tools',
    'ai-api-observability-tools',
    'ai-model-routing-tools',
    'ai-research-tools',
    'ai-content-creation-tools',
    'ai-video-tools',
    'ai-writing-tools',
  ];
  const priorityTopics = priorityTopicKeys
    .map((key) => topListTopics.find((topic) => topic.key === key))
    .filter((topic): topic is (typeof topListTopics)[number] => Boolean(topic));
  const checkedAt = '2026-07-18';
  const checkedAtLabel = new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${checkedAt}T00:00:00Z`));

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid gap-0 lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/10'>
              <Sparkles className='size-3.5' />
              {isChinese ? '榜单页' : 'Ranked lists'}
            </div>

            <div className='space-y-4'>
              <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-white lg:text-5xl'>
                {isChinese ? '按真实使用场景挑 AI 工具，而不是按名气挑' : 'Pick AI tools by use case, not by hype'}
              </h1>
              <p className='max-w-2xl text-base leading-7 text-slate-200 lg:text-lg'>
                {isChinese
                  ? '这些榜单页会把用户带到更窄、更有意图的选择页，再往下接到详情页、提交页和付费页。'
                  : 'These ranking pages narrow the choice, then route people into detail pages, submission, and paid upgrades.'}
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                {
                  title: isChinese ? '清晰意图' : 'Clear intent',
                  text: isChinese ? '每页只解决一个选择问题' : 'Each page answers one decision',
                },
                {
                  title: isChinese ? '高意图主题' : 'High-intent topics',
                  text: isChinese ? '优先放最容易转化的榜单' : 'Front-load the lists most likely to convert',
                },
                {
                  title: isChinese ? '可转化' : 'Conversion-friendly',
                  text: isChinese ? '每页都有下一步 CTA' : 'Every page has a next step',
                },
              ].map((item) => (
                <div key={item.title} className='rounded-xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-sm font-semibold text-white'>{item.title}</p>
                  <p className='mt-1 text-sm leading-6 text-slate-200'>{item.text}</p>
                </div>
              ))}
            </div>

            <div className='flex flex-wrap gap-3'>
              <Link
                href={`/${locale}/pricing`}
                className='inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15'
              >
                {isChinese ? '查看定价' : 'View pricing'}
              </Link>
              <Link
                href={`/${locale}/best-ai-tools/${priorityTopics[0]?.key || 'ai-coding-tools'}`}
                className='inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400'
              >
                {isChinese ? '先看高意图榜单' : 'Start with a priority list'}
                <ArrowRight className='ml-2 size-4' />
              </Link>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200'>
              {isChinese
                ? '如果你是工具方，提交和认领入口仍然保留在后续页面和页脚，但不放在这个总入口的第一层。'
                : 'If you own a tool, submit and claim paths still exist on lower-level pages and the footer, but they are not part of this top-level entry.'}
            </div>
          </div>

          <div className='bg-slate-50 p-6 lg:p-10'>
            <div className='rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
                    {isChinese ? '优先榜单' : 'Priority lists'}
                  </p>
                  <h2 className='mt-1 text-xl font-bold text-slate-950'>
                    {isChinese ? '先看这几个高意图榜单' : 'Start with the highest-intent lists'}
                  </h2>
                </div>
              </div>
              <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                {priorityTopics.map((topic) => (
                  <Link
                    key={topic.key}
                    href={`/${locale}/best-ai-tools/${topic.key}`}
                    className='rounded-xl border border-cyan-100 bg-white p-4 transition hover:border-cyan-300 hover:shadow-sm'
                  >
                    <p className='text-sm font-semibold text-slate-950'>{topic.title}</p>
                    <p className='mt-1 text-xs leading-5 text-slate-500'>{topic.description}</p>
                    <p className='mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700'>
                      {isChinese ? '打开榜单' : 'Open list'}
                      <ArrowRight className='size-4' />
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className='mt-5 grid gap-4 md:grid-cols-3'>
              {[
                {
                  title: isChinese ? '排序方法' : 'Ranking method',
                  text: isChinese
                    ? '优先把最贴近任务的主题放前面，再按最近核查和真实反馈微调。'
                    : 'Put the closest task match first, then adjust with freshness and real feedback.',
                },
                {
                  title: isChinese ? '选择标准' : 'Selection standard',
                  text: isChinese
                    ? '先看场景匹配、价格门槛、更新状态和是否有真实信号。'
                    : 'Check use-case fit, pricing threshold, freshness, and real signals first.',
                },
                {
                  title: isChinese ? '不放什么' : 'What stays out',
                  text: isChinese
                    ? '不把同义、太薄或还没补信号的主题混进第一层。'
                    : 'Do not mix in thin, duplicate, or signal-poor topics at the first layer.',
                },
              ].map((item) => (
                <div key={item.title} className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{item.text}</p>
                </div>
              ))}
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              {topListTopics.map((topic) => (
                <Link
                  key={topic.key}
                  href={`/${locale}/best-ai-tools/${topic.key}`}
                  className='group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{topic.title}</p>
                      <p className='mt-1 text-xs uppercase tracking-wide text-slate-500'>{topic.categorySlug}</p>
                    </div>
                    <div className='rounded-full bg-cyan-50 p-2 text-cyan-700'>
                      <Target className='size-4' />
                    </div>
                  </div>
                  <p className='mt-3 text-sm leading-6 text-slate-600'>{topic.summary}</p>
                  <p className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700'>
                    {topic.ctaLabel}
                    <ArrowRight className='size-4 transition group-hover:translate-x-0.5' />
                  </p>
                </Link>
              ))}
            </div>

            <div className='mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
              <div className='flex items-start gap-3'>
                <Layers3 className='mt-0.5 size-5 text-cyan-700' />
                <div>
                  <p className='text-sm font-semibold text-slate-950'>
                    {isChinese ? '榜单怎么用' : 'How to use the lists'}
                  </p>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看榜单，再进详情页比较关键差异，最后再去提交、认领或付费。'
                      : 'Scan the list, compare the key differences in detail pages, then move into submit or paid options.'}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-5 rounded-2xl border border-slate-200 bg-white p-5'>
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-800'>
                {isChinese ? '最近核查' : 'Last checked'}
              </p>
              <p className='mt-2 text-xl font-bold text-slate-950'>{checkedAtLabel}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这个榜单入口会持续把你导向更窄的榜单、详情页和提交路径，而不是只停留在主题卡片。'
                  : 'This ranking hub keeps routing people into narrower lists, detail pages, and submission paths instead of stopping at topic cards.'}
              </p>
            </div>

            <div className='mt-5 grid gap-3 md:grid-cols-3'>
              {[
                {
                  title: isChinese ? '为什么先看这里' : 'Why start here',
                  text: isChinese
                    ? '先把方向收窄到一个高意图主题，再去看详情和官网更省时间。'
                    : 'Narrow the direction into one high-intent topic before opening details and official sites.',
                },
                {
                  title: isChinese ? '这里比较什么' : 'What to compare',
                  text: isChinese
                    ? '先看场景、价格、更新状态和真实反馈，再决定是否继续。'
                    : 'Compare use case, pricing, freshness, and real feedback before you go deeper.',
                },
                {
                  title: isChinese ? '下一步去哪' : 'Where to go next',
                  text: isChinese
                    ? '看完榜单后，进入详情页、评论区，或直接去提交 / 认领。'
                    : 'After a list, move into detail pages, comments, or submit / claim paths.',
                },
              ].map((item) => (
                <div key={item.title} className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{item.text}</p>
                </div>
              ))}
            </div>

            <div className='mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5'>
              <div>
                <p className='text-sm font-semibold text-slate-950'>{isChinese ? '下一步' : 'Next step'}</p>
                <p className='mt-1 text-sm text-slate-600'>
                  {isChinese
                    ? '选一个主题开始比较，或者直接进入认领 / 提交路径。'
                    : 'Pick a topic, or go straight to claim or submit.'}
                </p>
              </div>
              <Star className='size-5 text-amber-500' />
            </div>
          </div>
        </div>
      </section>

      <GuideEvidencePanel
        locale={locale}
        checkedAt={checkedAt}
        scope={
          isChinese
            ? '榜单总入口要先说明怎么筛选、为什么先看榜单、以及下一步去哪里，而不是只堆主题卡片。'
            : 'The ranking hub should explain how to filter, why to start with rankings, and what to open next instead of only stacking topic cards.'
        }
        decisionSteps={[
          isChinese
            ? '先确认你要找的是哪类工具或哪条任务线。'
            : 'First confirm which type of tool or task line you want.',
          isChinese
            ? '再用价格、更新和真实反馈把 shortlist 缩小。'
            : 'Then narrow the shortlist with pricing, freshness, and real feedback.',
          isChinese
            ? '最后进入具体详情页或提交页做最终判断。'
            : 'Finally open the detail page or submit page for the final decision.',
        ]}
        items={[
          {
            label: isChinese ? '验证范围' : 'Checked scope',
            value: isChinese ? '榜单总入口 + 下一步路径' : 'Ranking hub + next-step paths',
            note: isChinese ? '先把主入口的决策链路讲清楚。' : 'Make the decision path clear at the entry point.',
          },
          {
            label: isChinese ? '索引策略' : 'Indexing strategy',
            value: isChinese ? '保持可索引' : 'Keep indexable',
            note: isChinese ? '保留可发现性和内部导航价值。' : 'Keep discoverability and internal navigation value.',
          },
          {
            label: isChinese ? '下一步增强' : 'Next enrichment',
            value: isChinese ? '真实榜单信号、owner 认领、评论' : 'Real ranking signals, owner claims, comments',
            note: isChinese ? '让页面更接近真实决策页。' : 'Make the page feel closer to a real decision page.',
          },
        ]}
        signalCards={[
          {
            label: isChinese ? '价格信号' : 'Pricing signal',
            value: isChinese ? '先看免费、freemium、付费门槛' : 'Check free, freemium, and paid thresholds first',
            note: isChinese
              ? '榜单页应该先帮人判断预算，而不是先灌太多工具名。'
              : 'A ranking page should help people judge budget before dumping too many tool names.',
          },
          {
            label: isChinese ? '更新信号' : 'Freshness signal',
            value: isChinese ? '先看最近核查时间' : 'Check the last-checked date first',
            note: isChinese ? '榜单如果不新，用户会直接跳过。' : 'If the list looks stale, users skip it fast.',
          },
          {
            label: isChinese ? '风险信号' : 'Risk signal',
            value: isChinese ? '先排除不适合的工具' : 'Filter out mismatched tools early',
            note: isChinese
              ? '在榜单页先讲清楚不适合谁，比单纯堆“推荐”更有用。'
              : 'Explaining who it is not for is often more useful than stacking more recommendations.',
          },
          {
            label: isChinese ? '选择信号' : 'Selection signal',
            value: isChinese ? '先看榜单为何存在' : 'See why this ranking exists',
            note: isChinese
              ? '榜单页应该先帮你收窄主题，而不是只把工具名堆在一起。'
              : 'A ranking page should narrow the theme first instead of just stacking names.',
          },
          {
            label: isChinese ? '受众信号' : 'Audience signal',
            value: isChinese ? '先看它是给谁看的' : 'Check who it is for',
            note: isChinese
              ? '不同的榜单页要承接不同意图，开发者、研究者和创作者不该混在一起。'
              : 'Different ranking pages should serve different intents; developers, researchers, and creators should not be mixed together.',
          },
          {
            label: isChinese ? '下一步信号' : 'Next-step signal',
            value: isChinese ? '直接去榜单、详情或提交' : 'Go to a list, detail page, or submit',
            note: isChinese
              ? '用户在这个页面的目标是选路，不是看完就走。'
              : 'The goal here is to choose a path, not just to browse and leave.',
          },
        ]}
      />
    </div>
  );
}
