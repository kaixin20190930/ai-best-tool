import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWebNavigationDetail } from '@/network/webNavigation';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  CircleArrowRight,
  DollarSign,
  Eye,
  FolderOpen,
  Heart,
  Lightbulb,
  MessageSquare,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Star,
  Tag as TagIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { SEO_CONFIG, SOCIAL_IMAGE_DIMENSIONS, ToolMetadata } from '@/lib/seo/constants';
import { Link } from '@/app/navigation';
import {
  generateCanonicalUrl,
  generateSocialImageUrl,
  generateToolDescription,
  generateToolTitle,
} from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateSoftwareSchema } from '@/lib/seo/schema';
import { getCategoryById, getLocalizedField as getCategoryLocalizedField } from '@/lib/services/categories';
import { getLocalizedField as getTagLocalizedField, getTagsBySlugs } from '@/lib/services/tags';
import { toolToDetailData } from '@/lib/services/toolPresenter';
import { getLocalizedField, getToolByName } from '@/lib/services/tools';
import { createClient } from '@/lib/supabase/server';
import { Separator } from '@/components/ui/separator';
import CommentList from '@/components/comments/CommentList';
import FavoriteButton from '@/components/FavoriteButton';
import BaseImage from '@/components/image/BaseImage';
import MarkdownProse from '@/components/MarkdownProse';
import MediaGallery from '@/components/MediaGallery';
import RatingStars from '@/components/RatingStars';
import RecommendedTools from '@/components/RecommendedTools';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import ShareButton from '@/components/ShareButton';
import ToolFeedbackBar from '@/components/ToolFeedbackBar';
import TrackableLink from '@/components/TrackableLink';
import { getToolStats, trackPageView } from '@/app/actions/analytics';
import { getCommentCount } from '@/app/actions/comments';
import { isFavorited } from '@/app/actions/favorites';
import { getUserRating } from '@/app/actions/ratings';

// Revalidate every hour (3600 seconds) - ISR strategy
export const revalidate = 3600;

// Enable dynamic params for ISR
export const dynamicParams = true;

function getLocaleVariants(locale: string): string[] {
  if (locale === 'cn') return ['cn', 'zh'];
  if (locale === 'zh') return ['zh', 'cn'];
  return [locale];
}

function getLocalizedText(input: unknown, locale: string, fallback = 'en'): string | null {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed || null;
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of getLocaleVariants(locale)) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    for (const key of getLocaleVariants(fallback)) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    const firstString = Object.values(record).find((value) => typeof value === 'string' && value.trim());
    if (typeof firstString === 'string') return firstString.trim();
  }

  return null;
}

function getStringList(input: unknown, locale = 'en', fallback = 'en'): string[] {
  if (Array.isArray(input)) {
    return input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? [trimmed] : [];
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const localizedList =
      [...getLocaleVariants(locale), ...getLocaleVariants(fallback)].reduce<unknown>(
        (value, key) => value ?? record[key],
        undefined,
      );

    if (Array.isArray(localizedList)) {
      return localizedList.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    }

    if (typeof localizedList === 'string') {
      const trimmed = localizedList.trim();
      return trimmed ? [trimmed] : [];
    }

    return Object.values(record)
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  return [];
}

function getFeatureEntries(input: unknown, locale = 'en', fallback = 'en'): Array<{ label: string; value?: string }> {
  if (Array.isArray(input)) {
    return input
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => ({ label: item.trim() }));
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const { localized } = record;

    if (localized && typeof localized === 'object') {
      const localizedRecord = localized as Record<string, unknown>;
      const localizedEntries =
        [...getLocaleVariants(locale), ...getLocaleVariants(fallback)].reduce<unknown>(
          (value, key) => value ?? localizedRecord[key],
          undefined,
        );

      if (Array.isArray(localizedEntries)) {
        return localizedEntries
          .filter(
            (item): item is { label: string; value?: string } =>
              Boolean(item) &&
              typeof item === 'object' &&
              typeof (item as { label?: unknown }).label === 'string' &&
              (item as { label: string }).label.trim().length > 0,
          )
          .map((item) => ({
            label: item.label.trim(),
            value: typeof item.value === 'string' && item.value.trim().length > 0 ? item.value.trim() : undefined,
          }));
      }
    }

    return Object.entries(record).flatMap(([key, value]) => {
      if (typeof value !== 'string') return [];
      const trimmed = value.trim();
      return trimmed ? [{ label: key, value: trimmed }] : [];
    });
  }

  return [];
}

function getAudienceEntries(
  input: unknown,
  field: 'bestFit' | 'notIdealFor',
  locale = 'en',
  fallback = 'en',
): string[] {
  if (!input || typeof input !== 'object') {
    return [];
  }

  const { audience } = input as Record<string, unknown>;
  if (!audience || typeof audience !== 'object') {
    return [];
  }

  return getStringList((audience as Record<string, unknown>)[field], locale, fallback);
}

function getEditorialReview(
  input: unknown,
  locale: string,
  fallback = 'en',
): {
  reviewedAt: string | null;
  reviewedBy: string | null;
  summary: string | null;
  trustNote: string | null;
} | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const { editorial } = input as Record<string, unknown>;
  if (!editorial || typeof editorial !== 'object') {
    return null;
  }

  const record = editorial as Record<string, unknown>;
  const reviewedAt = typeof record.reviewedAt === 'string' ? record.reviewedAt : null;
  const reviewedBy = typeof record.reviewedBy === 'string' ? record.reviewedBy : null;
  const summary = getLocalizedText(record.summary, locale, fallback);
  const trustNote = getLocalizedText(record.trustNote, locale, fallback);

  if (!reviewedAt && !reviewedBy && !summary && !trustNote) {
    return null;
  }

  return {
    reviewedAt,
    reviewedBy,
    summary,
    trustNote,
  };
}

function getDecisionText(
  input: unknown,
  field: 'officialSummary' | 'freshnessSummary' | 'pricingSummary' | 'communitySummary' | 'mediaSummary',
  locale: string,
  fallback = 'en',
): string | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const { decision } = input as Record<string, unknown>;
  if (!decision || typeof decision !== 'object') {
    return null;
  }

  return getLocalizedText((decision as Record<string, unknown>)[field], locale, fallback);
}

function getDecisionList(
  input: unknown,
  field: 'compareAxes',
  locale: string,
  fallback = 'en',
): string[] {
  if (!input || typeof input !== 'object') {
    return [];
  }

  const { decision } = input as Record<string, unknown>;
  if (!decision || typeof decision !== 'object') {
    return [];
  }

  return getStringList((decision as Record<string, unknown>)[field], locale, fallback);
}

function inferBestFit(categorySlug: string | undefined, locale: string, useCases: string[]): string[] {
  if (useCases.length > 0) {
    return useCases.slice(0, 4);
  }

  const zh = locale === 'cn';

  switch (categorySlug) {
    case 'web3':
      return zh
        ? ['链上研究', '协议追踪', '钱包监控', '加密数据分析']
        : ['On-chain research', 'Protocol tracking', 'Wallet monitoring', 'Crypto analytics'];
    case 'text-writing':
      return zh
        ? ['草稿生成', '改写润色', '内容提纲', '文案工作流']
        : ['Drafting', 'Rewriting', 'Content outlines', 'Writing workflows'];
    case 'productivity':
      return zh
        ? ['会议纪要', '日常整理', '任务推进', '团队知识整理']
        : ['Meeting notes', 'Daily organization', 'Task follow-through', 'Knowledge workflows'];
    case 'design-art':
      return zh
        ? ['视觉探索', '素材生成', '创意迭代', '设计提案']
        : ['Visual exploration', 'Asset generation', 'Creative iteration', 'Design concepts'];
    case 'chatbot':
      return zh
        ? ['快速问答', '头脑风暴', '研究起点', '轻量助手']
        : ['Quick answers', 'Brainstorming', 'Research starting point', 'Light assistant work'];
    case 'life-assistant':
      return zh
        ? ['个人规划', '信息回顾', '日常提醒', '轻量辅助']
        : ['Personal planning', 'Memory recall', 'Daily reminders', 'Light support'];
    case 'research':
      return zh
        ? ['模型探索', '数据集发现', '技术调研', '研究型筛选']
        : ['Model discovery', 'Dataset discovery', 'Technical research', 'Evaluation workflows'];
    case 'voice':
      return zh
        ? ['语音生成', '转录整理', '音频处理', '语音工作流']
        : ['Voice generation', 'Transcription', 'Audio processing', 'Speech workflows'];
    case 'automation':
      return zh
        ? ['重复任务自动化', 'Agent 编排', '流程触发', '后台处理']
        : ['Task automation', 'Agent orchestration', 'Workflow triggers', 'Back-office flows'];
    case 'developer-tools':
      return zh
        ? ['API 集成', '模型接入', '开发测试', '基础设施工作流']
        : ['API integration', 'Model access', 'Dev testing', 'Infrastructure workflows'];
    default:
      return zh ? ['日常探索', '工具比较', '快速试用'] : ['Everyday exploration', 'Tool comparison', 'Quick trials'];
  }
}

function inferNotIdealFor(categorySlug: string | undefined, locale: string): string[] {
  const zh = locale === 'cn';

  switch (categorySlug) {
    case 'web3':
      return zh
        ? ['不太适合完全不需要加密或链上语境的通用用户', '如果你只需要基础聊天助手，这类工具通常过重']
        : [
            'Less ideal for users with no crypto or on-chain context',
            'Often too heavy if you only need a general chat assistant',
          ];
    case 'text-writing':
      return zh
        ? ['不太适合做复杂项目管理', '如果你需要深度数据分析，写作工具通常不够']
        : ['Less ideal for complex project management', 'Usually not enough if you need deep analytics'];
    case 'productivity':
      return zh
        ? ['不太适合只做一次性问答', '如果完全没有工作流需求，价值会偏弱']
        : ['Less ideal for one-off Q&A only', 'Lower value if you do not need workflow support'];
    case 'design-art':
      return zh
        ? ['不太适合以文字研究为主的工作', '如果核心需求是表格或数据库分析，这类工具不匹配']
        : ['Less ideal for text-heavy research work', 'Not a fit for spreadsheet-style analysis'];
    case 'chatbot':
      return zh
        ? ['不太适合需要稳定自动化或后台流程的团队', '如果你主要在做素材生产，聊天工具不是最优入口']
        : ['Less ideal for teams needing stable automation', 'Not the best entry point for asset-heavy production'];
    case 'research':
      return zh
        ? ['不太适合只想快速出成品的用户', '如果你不关心模型或数据来源，这类工具可能偏重']
        : [
            'Less ideal if you only want finished assets fast',
            'Can feel heavy if you do not care about model or data depth',
          ];
    case 'voice':
      return zh
        ? ['不太适合纯文本工作流', '如果你没有音频输入输出需求，价值会有限']
        : ['Less ideal for text-only workflows', 'Limited value without audio input or output needs'];
    case 'automation':
      return zh
        ? ['不太适合单次轻量使用', '如果没有固定流程要接，这类工具通常不必优先考虑']
        : ['Less ideal for one-off lightweight usage', 'Often unnecessary if you do not have repeatable workflows'];
    case 'developer-tools':
      return zh
        ? ['不太适合纯消费型用户', '如果你不做集成或开发，理解成本会更高']
        : ['Less ideal for consumer-only use cases', 'Higher overhead if you do not need integration or development'];
    default:
      return zh
        ? ['不太适合资料要求很严格但当前信息仍较少的场景', '建议和同类工具一起比较后再决定']
        : [
            'Less ideal when you need highly structured vendor data',
            'Best compared with similar listings before choosing',
          ];
  }
}

function getPricingSummary(pricing: string | null | undefined, locale: string): string {
  const zh = locale === 'cn';
  switch (pricing) {
    case 'free':
      return zh ? '可以低门槛试用，适合先验证再投入。' : 'Easy to trial before you commit to a workflow.';
    case 'freemium':
      return zh
        ? '通常能先试核心能力，扩展功能需要升级。'
        : 'You can test the core flow first, then pay for deeper usage.';
    case 'paid':
      return zh
        ? '更适合已经知道需求、愿意为稳定能力付费的团队。'
        : 'A better fit when you already know the use case and need dependable access.';
    default:
      return zh
        ? '价格以官网为准，建议对比免费额度、团队限制和升级门槛。'
        : 'Check the official site for the latest plan details and upgrade limits.';
  }
}

function getFreshnessSummary(updatedAt: Date | string | null | undefined, locale: string): string {
  if (!updatedAt) {
    return locale === 'cn'
      ? '这条资料较新，后续仍建议结合官网信息确认。'
      : 'This listing is fairly recent, but it is still smart to confirm details on the official site.';
  }

  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)));

  if (locale === 'cn') {
    if (diffDays <= 14) return '近期有更新，适合优先纳入你的 shortlist。';
    if (diffDays <= 60) return '更新还算新，建议结合官网和截图一起判断。';
    return '这条资料相对较久，做最终决策前建议再核对一次官网。';
  }

  if (diffDays <= 14) return 'Recently refreshed and worth shortlisting early.';
  if (diffDays <= 60) return 'Still fairly recent, but compare it with the latest official details.';
  return 'This listing is older, so do one more website check before making a final call.';
}

function getOfficialSiteStatus(url: string, locale: string, isPublished: boolean) {
  const parsed = new URL(url);
  const hostname = parsed.hostname.replace(/^www\./, '');
  const secure = parsed.protocol === 'https:';
  const isChinese = locale === 'cn';

  let summary = '';
  if (isChinese) {
    summary = secure
      ? `已链接到官方站点 ${hostname}，可继续从官网核对最新价格与功能。`
      : `当前链接站点是 ${hostname}，但不是 HTTPS，建议额外确认链接可靠性。`;
  } else {
    summary = secure
      ? `Linked to the official site at ${hostname}, so you can verify pricing and features there.`
      : `Linked to ${hostname}, but it is not using HTTPS, so verify the destination carefully.`;
  }

  let statusLabel = 'Needs review';
  if (isChinese) {
    statusLabel = isPublished ? '已公开收录' : '待进一步审核';
  } else if (isPublished) {
    statusLabel = 'Public listing';
  }

  return {
    hostname,
    secureLabel: secure ? 'HTTPS' : 'HTTP',
    summary,
    statusLabel,
  };
}

function getMediaCoverageSummary({
  locale,
  heroImage,
  screenshotCount,
  hasVideo,
}: {
  locale: string;
  heroImage: string;
  screenshotCount: number;
  hasVideo: boolean;
}) {
  const isChinese = locale === 'cn';
  const hasPreview = Boolean(heroImage);
  const totalAssets = screenshotCount + (hasVideo ? 1 : 0) + (hasPreview ? 1 : 0);

  if (screenshotCount >= 3 || (screenshotCount >= 1 && hasVideo)) {
    return {
      label: isChinese ? '预览较完整' : 'Strong preview coverage',
      summary: isChinese
        ? '已经有多张截图或视频，足够先判断界面、流程和复杂度。'
        : 'There is enough visual coverage to judge the interface, workflow, and complexity before clicking through.',
      evidence: isChinese
        ? `${screenshotCount} 张截图${hasVideo ? '，含视频' : ''}`
        : `${screenshotCount} screenshots${hasVideo ? ' plus video' : ''}`,
    };
  }

  if (totalAssets > 0) {
    return {
      label: isChinese ? '预览一般' : 'Partial preview coverage',
      summary: isChinese
        ? '已经能大致看到产品长什么样，但做决定前仍建议打开官网再确认。'
        : 'You can get a rough feel for the product, but it is still worth checking the official site before deciding.',
      evidence: isChinese
        ? `${screenshotCount} 张截图${hasPreview ? '，含封面预览' : ''}${hasVideo ? '，含视频' : ''}`
        : `${screenshotCount} screenshots${hasPreview ? ', cover preview' : ''}${hasVideo ? ', video' : ''}`,
    };
  }

  return {
    label: isChinese ? '预览较少' : 'Limited preview coverage',
    summary: isChinese
      ? '当前媒体信息还不够，最终判断前更应该回到官网核对真实界面。'
      : 'Visual coverage is still light, so the official site matters more before you make a final call.',
    evidence: isChinese ? '暂无稳定截图或视频' : 'No stable screenshots or videos yet',
  };
}

function getCommunitySignalSummary({
  locale,
  ratingCount,
  commentCount,
  favoriteCount,
}: {
  locale: string;
  ratingCount: number;
  commentCount: number;
  favoriteCount: number;
}) {
  const isChinese = locale === 'cn';
  const interactionCount = ratingCount + commentCount + favoriteCount;

  if (ratingCount >= 5 || commentCount >= 3 || favoriteCount >= 20) {
    return {
      label: isChinese ? '已有真实互动' : 'Real user signal is forming',
      summary: isChinese
        ? '这条工具已经开始积累评分、讨论或收藏，适合把用户反馈一起纳入判断。'
        : 'This listing already has enough ratings, discussion, or saves to add useful real-world signal to your decision.',
    };
  }

  if (interactionCount > 0) {
    return {
      label: isChinese ? '开始有反馈' : 'Early user signal',
      summary: isChinese
        ? '已经有少量用户反馈，但更适合和相似工具一起横向比较。'
        : 'There is some early feedback here, but it is still best used together with a side-by-side comparison.',
    };
  }

  return {
    label: isChinese ? '互动还少' : 'Limited user signal',
    summary: isChinese
      ? '目前互动数据不多，建议更看重官网信息、截图和相似工具对比。'
      : 'Engagement is still light, so lean more on the official site, screenshots, and similar-tool comparison.',
  };
}

function getComparisonSummary(categorySlug: string | undefined, locale: string) {
  const isChinese = locale === 'cn';

  switch (categorySlug) {
    case 'web3':
      return isChinese
        ? '重点对比支持的链、钱包可见性、协议覆盖和研究深度。'
        : 'Compare supported chains, wallet visibility, protocol coverage, and research depth first.';
    case 'text-writing':
      return isChinese
        ? '重点对比适配的写作任务、免费额度、工作流顺手程度和输出稳定性。'
        : 'Compare writing job fit, free-tier limits, workflow friction, and output consistency first.';
    case 'developer-tools':
      return isChinese
        ? '重点对比接入成本、模型覆盖、可观测性深度和团队协作支持。'
        : 'Compare integration cost, model coverage, observability depth, and team workflow support.';
    case 'automation':
      return isChinese
        ? '重点对比触发方式、连接器覆盖、失败处理和可维护性。'
        : 'Compare triggers, connector coverage, failure handling, and maintainability.';
    case 'research':
      return isChinese
        ? '重点对比来源质量、证据链、资料锚定能力和搜索效率。'
        : 'Compare source quality, evidence trails, grounding, and research speed.';
    default:
      return isChinese
        ? '重点对比任务适配度、定价、更新频率和真实反馈。'
        : 'Compare task fit, pricing, freshness, and real user feedback before choosing.';
  }
}

function getCategoryGuideLink(categorySlug: string | undefined, locale: string) {
  const isChinese = locale === 'cn';

  switch (categorySlug) {
    case 'web3':
      return {
        href: '/guides/ai-tools-for-web3',
        title: isChinese ? '看 Web3 工具指南' : 'Open the Web3 tools guide',
        description: isChinese
          ? '如果你还在筛选方向，先看 Web3 分类工具怎么分层。'
          : 'Use the guide to understand the main Web3 tool buckets before comparing products.',
      };
    case 'text-writing':
      return {
        href: '/guides/ai-writing-tools',
        title: isChinese ? '看 AI 写作工具指南' : 'Open the AI writing guide',
        description: isChinese
          ? '先看常见写作场景和工具差异，再决定要试哪一类。'
          : 'Review common writing workflows and tool differences before picking one.',
      };
    case 'developer-tools':
      return {
        href: '/guides/ai-tools-for-developers',
        title: isChinese ? '看开发者工具指南' : 'Open the developer tools guide',
        description: isChinese
          ? '更适合先从集成、模型覆盖和工作流角度建立判断。'
          : 'Start with integration, model coverage, and workflow fit before comparing products.',
      };
    case 'automation':
      return {
        href: '/guides/ai-tools-for-automation',
        title: isChinese ? '看自动化工具指南' : 'Open the automation guide',
        description: isChinese
          ? '先看自动化工具适合接什么流程，再决定值不值得接入。'
          : 'Review which workflows are worth automating before evaluating tools one by one.',
      };
    case 'research':
      return {
        href: '/guides/ai-tools-for-research',
        title: isChinese ? '看研究工具指南' : 'Open the research tools guide',
        description: isChinese
          ? '先看资料来源、证据链和研究速度这几个关键维度。'
          : 'Start with source quality, evidence trails, and research speed.',
      };
    case 'productivity':
      return {
        href: '/guides/ai-productivity-tools',
        title: isChinese ? '看生产力工具指南' : 'Open the productivity guide',
        description: isChinese
          ? '先明确你要提效的是会议、任务还是知识整理。'
          : 'Clarify whether you need meeting support, task follow-through, or knowledge organization first.',
      };
    case 'chatbot':
      return {
        href: '/guides/ai-chatbot-tools',
        title: isChinese ? '看聊天工具指南' : 'Open the chatbot guide',
        description: isChinese
          ? '如果你还没决定要哪种助手，先看聊天工具的分工。'
          : 'Review chatbot roles first if you are not yet sure which assistant style you need.',
      };
    case 'design-art':
      return {
        href: '/guides/ai-image-tools',
        title: isChinese ? '看图像工具指南' : 'Open the image tools guide',
        description: isChinese
          ? '先看生成、修图和设计提案这几类工作流的差异。'
          : 'Compare generation, editing, and design workflows before narrowing down tools.',
      };
    case 'voice':
      return {
        href: '/guides/ai-tools-for-meeting-notes',
        title: isChinese ? '看语音与会议记录入口' : 'Open the voice and notes entry',
        description: isChinese
          ? '先从转录、会议纪要和语音工作流切入会更容易判断。'
          : 'Start from transcription, meeting notes, and voice workflows to compare with more context.',
      };
    default:
      return null;
  }
}

function getPricingLabel(pricing: string | null | undefined): string {
  if (pricing === 'free') return 'Free';
  if (pricing === 'paid') return 'Paid';
  if (pricing === 'freemium') return 'Freemium';
  return 'Check website';
}

export async function generateMetadata({
  params: { locale, websiteName },
}: {
  params: { locale: string; websiteName: string };
}): Promise<Metadata> {
  const dbTool = await getToolByName(websiteName);
  const data =
    dbTool?.status === 'published'
      ? toolToDetailData(dbTool, locale)
      : (await getWebNavigationDetail(websiteName, locale)).data;

  // Get localized content if available
  const toolTitle = dbTool
    ? getLocalizedField(dbTool.title, locale) || data?.title || websiteName
    : data?.title || websiteName;

  const toolDescription = dbTool
    ? getLocalizedField(dbTool.content, locale) || data?.content || ''
    : data?.content || '';

  // Get category name if available
  let toolCategory: string | undefined;
  if (dbTool?.categoryId) {
    const category = await getCategoryById(dbTool.categoryId);
    if (category) {
      toolCategory = getCategoryLocalizedField(category.name, locale);
    }
  }

  // Generate optimized title and description using SEO utilities
  const optimizedTitle = generateToolTitle(toolTitle, toolCategory);
  const optimizedDescription = generateToolDescription(toolTitle, toolDescription, toolCategory);

  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(`/${locale}/ai/${websiteName}`);

  // Generate optimized social image URL
  const toolImage = data?.thumbnailUrl || data?.imageUrl || SEO_CONFIG.defaultImage;
  const socialImageUrl = generateSocialImageUrl(toolImage);

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: socialImageUrl,
          width: SOCIAL_IMAGE_DIMENSIONS.OPEN_GRAPH.width,
          height: SOCIAL_IMAGE_DIMENSIONS.OPEN_GRAPH.height,
          alt: toolTitle,
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: [socialImageUrl],
    },
  };
}

export default async function Page({
  params: { websiteName, locale },
}: {
  params: { websiteName: string; locale: string };
}) {
  const t = await getTranslations('Startup.detail');
  const isChinese = locale === 'cn';
  const dbTool = await getToolByName(websiteName);
  const data =
    dbTool?.status === 'published'
      ? toolToDetailData(dbTool, locale)
      : (await getWebNavigationDetail(websiteName, locale)).data;

  if (!data) notFound();

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const toolId = dbTool?.id;

  // Get rating and favorite data if tool exists in database
  let userRating = null;
  let ratingStats = { averageRating: 0, ratingCount: 0 };
  let isFavoritedByUser = false;
  let commentCount = 0;
  let toolStats = {
    viewCount: 0,
    clickCount: 0,
    shareCount: 0,
    favoriteCount: 0,
    averageRating: 0,
    ratingCount: 0,
  };

  // Get category and tags information
  let category = null;
  let tags: Array<{ slug: string; name: Record<string, string> }> = [];

  if (dbTool) {
    // Fetch category if available
    if (dbTool.categoryId) {
      category = await getCategoryById(dbTool.categoryId);
    }

    // Fetch tags if available
    if (dbTool.tags && dbTool.tags.length > 0) {
      tags = await getTagsBySlugs(dbTool.tags);
    }
  }

  if (toolId) {
    try {
      const [nextUserRating, nextIsFavoritedByUser, nextToolStats, nextCommentCount] = await Promise.all([
        getUserRating(toolId).catch(() => null),
        isFavorited(toolId).catch(() => false),
        getToolStats(toolId).catch(() => ({
          viewCount: 0,
          clickCount: 0,
          shareCount: 0,
          favoriteCount: 0,
          averageRating: 0,
          ratingCount: 0,
        })),
        getCommentCount(toolId).catch(() => 0),
      ]);
      userRating = nextUserRating;
      isFavoritedByUser = nextIsFavoritedByUser;
      toolStats = nextToolStats;
      commentCount = Number(nextCommentCount || 0);
      ratingStats = {
        averageRating: toolStats.averageRating,
        ratingCount: toolStats.ratingCount,
      };
    } catch (error) {
      console.error('Error fetching tool data:', error);
    }

    // Track page view (fire and forget)
    trackPageView(toolId, user?.id).catch((err) => console.error('Failed to track page view:', err));
  }

  // Generate SoftwareApplication schema for tool pages
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const toolUrl = `${baseUrl}/${locale}/ai/${websiteName}`;
  const toolImageUrl = data.thumbnailUrl || data.imageUrl || '';

  let softwareSchema = null;
  if (dbTool) {
    // Get localized title and description
    const localizedTitle = getLocalizedField(dbTool.title, locale);
    const localizedDescription = getLocalizedField(dbTool.content, locale);
    const localizedDetail = getLocalizedField(dbTool.detail, locale);

    const toolMetadata: ToolMetadata = {
      name: localizedTitle || data.title,
      description: localizedDescription || data.content,
      longDescription: localizedDetail || data.detail,
      category: category ? getCategoryLocalizedField(category.name, locale) : 'AI Tool',
      tags: dbTool.tags || [],
      pricing: {
        type: dbTool.pricing as 'free' | 'paid' | 'freemium',
        price: undefined,
        currency: 'USD',
      },
      rating:
        ratingStats.ratingCount > 0
          ? {
              value: ratingStats.averageRating,
              count: ratingStats.ratingCount,
            }
          : undefined,
      image: toolImageUrl.startsWith('http') ? toolImageUrl : `${baseUrl}${toolImageUrl}`,
      url: toolUrl,
      officialUrl: data.url,
      datePublished: dbTool.createdAt?.toISOString?.(),
      dateModified: dbTool.updatedAt?.toISOString?.(),
    };

    softwareSchema = generateSoftwareSchema(toolMetadata);
  }

  // Generate BreadcrumbList schema for navigation hierarchy
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/${locale}` },
    { name: 'AI Tools', url: `${baseUrl}/${locale}/explore` },
    { name: data.title, url: toolUrl },
  ]);
  const categoryName = category ? getCategoryLocalizedField(category.name, locale) : data.categoryName || 'AI Tool';
  const detailMarkdown =
    dbTool && getLocalizedField(dbTool.detail, locale)
      ? getLocalizedField(dbTool.detail, locale)
      : data?.detail || data?.content || '';
  const heroImage = data.thumbnailUrl || data.imageUrl || '';
  const pricingLabel = getPricingLabel(dbTool?.pricing);
  const updatedAt = dbTool?.updatedAt || dbTool?.createdAt;
  const recentlyCheckedLabel = isChinese ? '最近检查' : 'Recently checked';
  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(updatedAt))
    : recentlyCheckedLabel;
  let ratingLabel = isChinese ? '暂无评分' : 'No ratings yet';
  if (ratingStats.ratingCount > 0) {
    ratingLabel = `${ratingStats.averageRating.toFixed(1)} / 5`;
  }
  const quickFacts = [
    {
      label: isChinese ? '分类' : 'Category',
      value: categoryName,
      icon: FolderOpen,
      tone: 'text-sky-700 bg-sky-50',
    },
    {
      label: isChinese ? '定价' : 'Pricing',
      value: pricingLabel,
      icon: DollarSign,
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: isChinese ? '更新' : 'Updated',
      value: updatedLabel,
      icon: CalendarDays,
      tone: 'text-cyan-700 bg-cyan-50',
    },
    {
      label: isChinese ? '评分' : 'Rating',
      value: ratingLabel,
      icon: Star,
      tone: 'text-cyan-700 bg-cyan-50',
    },
  ];
  const commentPromptLabel = isChinese ? '可以直接点一个开头' : 'Start with one of these';
  const commentStarterPrompts = isChinese
    ? ['你主要把它用在哪个场景？', '最喜欢的一点是什么？', '有没有踩坑或替代方案？']
    : ['What do you mainly use it for?', 'What do you like most about it?', 'Any caveats or alternatives?'];
  let commentLabel = isChinese ? '去讨论' : 'Discuss';
  if (commentCount > 0) {
    commentLabel = `${commentCount} ${isChinese ? '条讨论' : 'comments'}`;
  }
  const categorySlug = category?.slug;
  const categoryGuideLink = getCategoryGuideLink(categorySlug, locale);
  const tagLabels = tags.map((tag) => getTagLocalizedField(tag.name, locale));
  const featureEntries = getFeatureEntries(dbTool?.features, locale);
  const useCaseList = getStringList(dbTool?.useCases, locale);
  const bestFitOverride = getAudienceEntries(dbTool?.features, 'bestFit', locale);
  const notIdealForOverride = getAudienceEntries(dbTool?.features, 'notIdealFor', locale);
  const bestFitList = bestFitOverride.length > 0 ? bestFitOverride : inferBestFit(categorySlug, locale, useCaseList);
  const notIdealForList =
    notIdealForOverride.length > 0 ? notIdealForOverride : inferNotIdealFor(categorySlug, locale);
  const officialSite = getOfficialSiteStatus(data.url, locale, dbTool?.status === 'published');
  const editorialReview = getEditorialReview(dbTool?.features, locale);
  const decisionCompareAxesOverride = getDecisionList(dbTool?.features, 'compareAxes', locale);
  const decisionOfficialSummary = getDecisionText(dbTool?.features, 'officialSummary', locale);
  const decisionFreshnessSummary = getDecisionText(dbTool?.features, 'freshnessSummary', locale);
  const decisionPricingSummary = getDecisionText(dbTool?.features, 'pricingSummary', locale);
  const decisionCommunitySummary = getDecisionText(dbTool?.features, 'communitySummary', locale);
  const decisionMediaSummary = getDecisionText(dbTool?.features, 'mediaSummary', locale);
  const officialSiteSummary = decisionOfficialSummary || officialSite.summary;
  const editorialReviewedLabel = editorialReview?.reviewedAt
    ? new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(editorialReview.reviewedAt))
    : null;
  const freshnessSummary = decisionFreshnessSummary || getFreshnessSummary(updatedAt || null, locale);
  const pricingSummary = decisionPricingSummary || getPricingSummary(dbTool?.pricing, locale);
  const screenshotCount = dbTool?.screenshots?.length || 0;
  const hasVideo = Boolean(dbTool?.videoUrl);
  const mediaCoverageBase = getMediaCoverageSummary({
    locale,
    heroImage,
    screenshotCount,
    hasVideo,
  });
  const mediaCoverage = decisionMediaSummary
    ? { ...mediaCoverageBase, summary: decisionMediaSummary }
    : mediaCoverageBase;
  const communitySignal = getCommunitySignalSummary({
    locale,
    ratingCount: ratingStats.ratingCount,
    commentCount,
    favoriteCount: toolStats.favoriteCount,
  });
  const communitySignalWithOverride = decisionCommunitySummary
    ? { ...communitySignal, summary: decisionCommunitySummary }
    : communitySignal;
  const comparisonSummary = getComparisonSummary(categorySlug, locale);
  const compareAxes = decisionCompareAxesOverride.length > 0
    ? decisionCompareAxesOverride
    : [
        comparisonSummary,
      ];
  let mediaChecklistItem = 'Preview media is still limited, so check the official screenshots before deciding.';
  if (heroImage) {
    mediaChecklistItem = isChinese
      ? '已有预览图，可先看产品界面是否与你的工作流匹配。'
      : 'A preview image is available, so you can sanity-check the interface fit.';
  } else if (isChinese) {
    mediaChecklistItem = '预览图仍待补充，最终选择前建议再看官网截图。';
  }

  let ratingChecklistItem = 'Ratings are still light, so compare comments and similar tools as well.';
  if (ratingStats.ratingCount > 0) {
    ratingChecklistItem = isChinese
      ? `已有 ${ratingStats.ratingCount} 条评分，可一起参考真实反馈。`
      : `${ratingStats.ratingCount} ratings are already available as extra social proof.`;
  } else if (isChinese) {
    ratingChecklistItem = '评分还不多，建议结合评论和相似工具一起比较。';
  }

  let commentChecklistItem = 'Discussion is still light, so a side-by-side comparison matters more here.';
  if (commentCount > 0) {
    commentChecklistItem = isChinese
      ? `已有 ${commentCount} 条讨论，适合先看别人踩过哪些坑。`
      : `${commentCount} discussion threads can help surface trade-offs quickly.`;
  } else if (isChinese) {
    commentChecklistItem = '讨论还不多，更适合先拿它和相似工具做横向比较。';
  }
  const verificationChecklist = [mediaChecklistItem, ratingChecklistItem, commentChecklistItem];
  let heroPreview = (
    <div className='flex aspect-video items-center justify-center bg-slate-100 text-5xl font-bold text-slate-300'>
      {data.title.slice(0, 1).toUpperCase()}
    </div>
  );

  if (heroImage) {
    const heroImageNode = (
      <BaseImage
        title={data.title}
        alt={`${data.title} interface preview`}
        fill
        src={heroImage}
        className='object-cover transition-transform duration-300 group-hover:scale-105'
      />
    );

    if (toolId) {
      heroPreview = (
        <TrackableLink
          href={data.url}
          toolId={toolId}
          userId={user?.id}
          className='group relative block aspect-video w-full overflow-hidden bg-slate-100'
        >
          {heroImageNode}
        </TrackableLink>
      );
    } else {
      heroPreview = (
        <a
          href={data.url}
          target='_blank'
          rel='noreferrer'
          className='group relative block aspect-video w-full overflow-hidden bg-slate-100'
        >
          {heroImageNode}
        </a>
      );
    }
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {softwareSchema && <StructuredDataServer data={softwareSchema} />}
      <StructuredDataServer data={breadcrumbSchema} />

      <div className='w-full bg-slate-50'>
        <div className='mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12'>
          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start'>
            <section className='space-y-6'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200'>
                  <Sparkles className='size-4 text-emerald-600' />
                  {isChinese ? '工具详情页' : 'AI tool profile'}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200'>
                  <FolderOpen className='size-4 text-sky-600' />
                  {categoryName}
                </span>
              </div>

              <div className='space-y-4'>
                <h1 className='max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>{data.title}</h1>
                <p className='max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>{data.content}</p>
              </div>

              <div className='grid gap-3 md:grid-cols-3'>
                {categorySlug ? (
                  <Link
                    href={`/categories/${categorySlug}?sort=latest`}
                    className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                  >
                    <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                      {isChinese ? '继续看分类' : 'Browse the category'}
                    </p>
                    <p className='mt-2 text-base font-semibold text-slate-950'>{categoryName}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {isChinese
                        ? '回到这个分类，继续按时间或热门度筛选相似工具。'
                        : 'Jump back to the category and keep comparing similar tools by latest or popularity.'}
                    </p>
                  </Link>
                ) : (
                  <Link
                    href='/explore?sort=latest'
                    className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                  >
                    <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                      {isChinese ? '继续探索' : 'Keep exploring'}
                    </p>
                    <p className='mt-2 text-base font-semibold text-slate-950'>
                      {isChinese ? '查看最新工具' : 'Browse the latest tools'}
                    </p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {isChinese
                        ? '如果还没确定方向，先回到最新收录页继续看。'
                        : 'If you are still comparing directions, return to the latest tools index first.'}
                    </p>
                  </Link>
                )}

                {categoryGuideLink ? (
                  <Link
                    href={categoryGuideLink.href}
                    className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                  >
                    <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
                      {isChinese ? '先看指南' : 'Read the guide first'}
                    </p>
                    <p className='mt-2 text-base font-semibold text-slate-950'>{categoryGuideLink.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{categoryGuideLink.description}</p>
                  </Link>
                ) : (
                  <Link
                    href='/guides/how-to-choose-ai-tools'
                    className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                  >
                    <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
                      {isChinese ? '先看指南' : 'Read the guide first'}
                    </p>
                    <p className='mt-2 text-base font-semibold text-slate-950'>
                      {isChinese ? '看 AI 工具选型指南' : 'Open the AI tool selection guide'}
                    </p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {isChinese
                        ? '如果你还没想清楚比较维度，先回到选型指南会更高效。'
                        : 'If your comparison criteria are still fuzzy, the selection guide is the best next stop.'}
                    </p>
                  </Link>
                )}

                <Link
                  href='/new'
                  className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                >
                  <p className='text-xs font-semibold uppercase tracking-wide text-sky-700'>
                    {isChinese ? '本周新增' : 'New this week'}
                  </p>
                  <p className='mt-2 text-base font-semibold text-slate-950'>
                    {isChinese ? '回看最近补进的工具' : 'See what was added this week'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '从本周新增页继续走，可以更快发现最近补货和最近补厚的页面。'
                      : 'Use the weekly additions page to discover recently added and recently improved listings.'}
                  </p>
                </Link>
              </div>

              {toolId && (
                <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
                  <div className='mb-3 flex flex-wrap items-center gap-2'>
                    <span className='inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700'>
                      {locale === 'cn' ? '互动面板' : 'Action rail'}
                    </span>
                    <span className='text-sm text-slate-500'>
                      {locale === 'cn'
                        ? '收藏、分享、评分和讨论都在同一条行动带里。'
                        : 'Save, share, rate, and discuss from one compact rail.'}
                    </span>
                  </div>

                  <div className='grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center'>
                    <div className='rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200'>
                      <div className='flex flex-wrap items-center gap-4'>
                        <div className='min-w-0'>
                          <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '评分' : 'Rating'}
                          </p>
                          <div className='mt-1'>
                            <RatingStars
                              toolId={toolId}
                              currentRating={userRating}
                              averageRating={ratingStats.averageRating}
                              ratingCount={ratingStats.ratingCount}
                              readonly={false}
                              size='md'
                              showStats
                            />
                          </div>
                        </div>

                        <div className='h-10 w-px bg-slate-200' />

                        <div className='min-w-0'>
                          <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '收藏' : 'Save'}
                          </p>
                          <div className='mt-1'>
                            <FavoriteButton
                              toolId={toolId}
                              initialState={isFavoritedByUser}
                              showLabel
                              className='rounded-full bg-white px-3 py-2 ring-1 ring-slate-200 hover:ring-red-200'
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <ShareButton
                        toolId={toolId}
                        toolName={websiteName}
                        toolTitle={data.title}
                        toolDescription={data.content}
                        userId={user?.id}
                        className='rounded-full'
                      />
                      <a
                        href='#comments'
                        className='inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100'
                      >
                        <MessageSquare className='size-4' />
                        {commentLabel}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                {toolId ? (
                  <TrackableLink
                    href={data.url}
                    toolId={toolId}
                    userId={user?.id}
                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
                  >
                    {t('visitWebsite')} <ArrowUpRight className='size-4' />
                  </TrackableLink>
                ) : (
                  <a
                    href={data.url}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
                  >
                    {t('visitWebsite')} <ArrowUpRight className='size-4' />
                  </a>
                )}
                <a
                  href={`/${locale}/explore?search=${encodeURIComponent(data.title)}`}
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-100'
                >
                  {isChinese ? '找相似工具' : 'Find similar tools'} <CircleArrowRight className='size-4' />
                </a>
                {/* Discussion anchor is now surfaced in the action panel above */}
              </div>
            </section>

            <aside className='space-y-4'>
              <div className='overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200'>
                {heroPreview}
                <div className='grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 text-center'>
                  <div className='p-3'>
                    <p className='text-xs text-slate-500'>{isChinese ? '浏览' : 'Views'}</p>
                    <p className='font-semibold text-slate-950'>{toolStats.viewCount.toLocaleString()}</p>
                  </div>
                  <div className='p-3'>
                    <p className='text-xs text-slate-500'>{isChinese ? '点击' : 'Clicks'}</p>
                    <p className='font-semibold text-slate-950'>{toolStats.clickCount.toLocaleString()}</p>
                  </div>
                  <div className='p-3'>
                    <p className='text-xs text-slate-500'>{isChinese ? '收藏' : 'Saved'}</p>
                    <p className='font-semibold text-slate-950'>{toolStats.favoriteCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className='mt-3 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='text-sm text-cyan-900'>
                      {locale === 'cn'
                        ? '如果这是你的工具，可以查看提交与展示方案，补充资料并管理曝光方式。'
                        : 'If this is your tool, review the listing options to submit updates and manage visibility.'}
                    </p>
                    <Link
                      href={`/${locale}/developer/listing`}
                      className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
                    >
                      {locale === 'cn' ? '查看提交方案' : 'View listing options'}
                    </Link>
                  </div>
                  <p className='mt-2 text-xs text-cyan-900/70'>
                    {locale === 'cn'
                      ? '审核时效与展示方式会根据你选择的方案而定。'
                      : 'Review timing and visibility depend on the option you choose.'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                {quickFacts.map((fact) => (
                  <div key={fact.label} className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200'>
                    <div className={`mb-3 inline-flex rounded-lg p-2 ${fact.tone}`}>
                      <fact.icon className='size-4' />
                    </div>
                    <p className='text-xs font-medium uppercase text-slate-500'>{fact.label}</p>
                    <p className='mt-1 text-sm font-semibold text-slate-950'>{fact.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>

        <div className='border-y border-slate-200 bg-white'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 lg:px-6'>
            <span className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700'>
              <TagIcon className='size-4 text-slate-500' />
              {isChinese ? '标签' : 'Tags'}
            </span>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag.slug} className='rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700'>
                  {getTagLocalizedField(tag.name, locale)}
                </span>
              ))
            ) : (
              <span className='rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600'>
                {categoryName}
              </span>
            )}
          </div>
        </div>

        <div className='mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-12'>
          <main className='space-y-8'>
            <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
              <div className='mb-5 flex items-center gap-3'>
                <ShieldCheck className='size-6 text-emerald-600' />
                <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>{t('introduction')}</h2>
              </div>
              <MarkdownProse markdown={detailMarkdown} className='text-base leading-7 text-slate-700' />
            </section>

            <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
              <div className='mb-5 flex items-center gap-3'>
                <ShieldCheck className='size-6 text-cyan-600' />
                <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                  {locale === 'cn' ? '决策参考' : 'Decision Guide'}
                </h2>
              </div>
              <p className='mb-5 max-w-3xl text-sm leading-6 text-slate-600'>
                {locale === 'cn'
                  ? '这一组信息不是在替你下结论，而是帮你更快判断：它值不值得继续比较、试用或付费。'
                  : 'This section is here to speed up your decision: whether this tool is worth comparing further, trialing, or paying for.'}
              </p>
              <div className='space-y-5'>
                <div className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]'>
                  <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {locale === 'cn' ? '先看这三个判断' : 'Start with these three signals'}
                    </p>
                    <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                      <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '官方网站状态' : 'Official website status'}
                        </p>
                        <p className='mt-2 text-base font-semibold text-slate-950'>{officialSite.hostname}</p>
                        <div className='mt-2 flex flex-wrap items-center gap-2'>
                          <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
                            {officialSite.secureLabel}
                          </span>
                          <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'>
                            {officialSite.statusLabel}
                          </span>
                        </div>
                        <p className='mt-3 text-sm leading-6 text-slate-600'>{officialSiteSummary}</p>
                      </div>

                      <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '最近更新信息' : 'Recent update'}
                        </p>
                        <p className='mt-2 text-base font-semibold text-slate-950'>{updatedLabel}</p>
                        <p className='mt-3 text-sm leading-6 text-slate-600'>{freshnessSummary}</p>
                      </div>

                      <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '定价快照' : 'Pricing snapshot'}
                        </p>
                        <p className='mt-2 text-base font-semibold text-slate-950'>{pricingLabel}</p>
                        <p className='mt-3 text-sm leading-6 text-slate-600'>{pricingSummary}</p>
                      </div>
                    </div>
                  </div>

                  <div className='grid gap-4'>
                    <div className='rounded-lg border border-slate-200 p-4'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '真实反馈信号' : 'User signal'}
                      </p>
                      <p className='mt-2 text-lg font-semibold text-slate-950'>{communitySignal.label}</p>
                      <p className='mt-2 text-xs font-medium text-slate-500'>
                        {locale === 'cn'
                          ? `${ratingStats.ratingCount} 条评分 · ${commentCount} 条讨论 · ${toolStats.favoriteCount} 次收藏`
                          : `${ratingStats.ratingCount} ratings · ${commentCount} comments · ${toolStats.favoriteCount} saves`}
                      </p>
                      <p className='mt-3 text-sm leading-6 text-slate-600'>{communitySignalWithOverride.summary}</p>
                    </div>

                    <div className='rounded-lg border border-slate-200 p-4'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '预览覆盖' : 'Preview coverage'}
                      </p>
                      <p className='mt-2 text-lg font-semibold text-slate-950'>{mediaCoverage.label}</p>
                      <p className='mt-2 text-xs font-medium text-slate-500'>{mediaCoverage.evidence}</p>
                      <p className='mt-3 text-sm leading-6 text-slate-600'>{mediaCoverage.summary}</p>
                    </div>

                    {editorialReview && (
                      <div className='rounded-lg border border-slate-200 p-4'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '编辑复核' : 'Editorial review'}
                        </p>
                        <p className='mt-2 text-lg font-semibold text-slate-950'>
                          {editorialReviewedLabel || (locale === 'cn' ? '已复核' : 'Reviewed')}
                        </p>
                        {editorialReview.summary && (
                          <p className='mt-3 text-sm leading-6 text-slate-600'>{editorialReview.summary}</p>
                        )}
                        {editorialReview.trustNote && (
                          <p className='mt-2 text-sm leading-6 text-slate-600'>{editorialReview.trustNote}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='rounded-lg border border-cyan-100 bg-cyan-50 p-4 sm:p-5'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                    {locale === 'cn' ? '和相似工具怎么比' : 'How to compare it next'}
                  </p>
                  <p className='mt-2 text-lg font-semibold text-slate-950'>
                    {locale === 'cn' ? '先横向看关键差异' : 'Compare the decision points first'}
                  </p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {compareAxes.map((axis) => (
                      <span
                        key={axis}
                        className='inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-cyan-900 ring-1 ring-cyan-100'
                      >
                        {axis}
                      </span>
                    ))}
                  </div>
                  <p className='mt-3 text-sm leading-6 text-slate-600'>{comparisonSummary}</p>
                </div>

                <div className='grid gap-4 lg:grid-cols-3'>
                  <div className='rounded-lg border border-slate-200 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {locale === 'cn' ? '适合谁' : 'Best fit'}
                    </p>
                    <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-700'>
                      {bestFitList.map((item) => (
                        <li key={item} className='flex gap-2'>
                          <CheckCircle className='mt-1 size-4 shrink-0 text-emerald-600' />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className='rounded-lg border border-slate-200 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {locale === 'cn' ? '不太适合' : 'Less ideal for'}
                    </p>
                    <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-700'>
                      {notIdealForList.map((item) => (
                        <li key={item} className='flex gap-2'>
                          <CircleArrowRight className='mt-1 size-4 shrink-0 text-slate-500' />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className='rounded-lg border border-slate-200 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {locale === 'cn' ? '选择前先核对' : 'Verify before choosing'}
                    </p>
                    <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-700'>
                      {verificationChecklist.map((item) => (
                        <li key={item} className='flex gap-2'>
                          <ShieldCheck className='mt-1 size-4 shrink-0 text-cyan-600' />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {featureEntries.length > 0 && (
              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <div className='mb-5 flex items-center gap-3'>
                  <CheckCircle className='size-6 text-emerald-600' />
                  <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                    {isChinese ? '关键能力' : 'Key Features'}
                  </h2>
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {featureEntries.map((entry) => (
                    <div key={entry.label} className='rounded-lg border border-slate-200 p-4'>
                      <h3 className='font-semibold text-slate-950'>{entry.label}</h3>
                      {entry.value && <p className='mt-2 text-sm leading-6 text-slate-600'>{entry.value}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {useCaseList.length > 0 && (
              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <div className='mb-5 flex items-center gap-3'>
                  <Lightbulb className='size-6 text-cyan-600' />
                  <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                    {isChinese ? '适用场景' : 'Use Cases'}
                  </h2>
                </div>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {useCaseList.map((value) => (
                    <div key={value} className='rounded-lg bg-cyan-50 p-4 ring-1 ring-cyan-100'>
                      <h3 className='font-semibold text-slate-950'>{value}</h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dbTool && ((dbTool.screenshots && dbTool.screenshots.length > 0) || dbTool.videoUrl) && (
              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <h2 className='mb-5 text-2xl font-bold text-slate-950 lg:text-3xl'>
                  {locale === 'cn' ? '截图与视频' : 'Screenshots & Videos'}
                </h2>
                <MediaGallery screenshots={dbTool.screenshots || []} videoUrl={dbTool.videoUrl} title={data.title} />
              </section>
            )}

            {toolId && (
              <>
                <RecommendedTools
                  toolId={toolId}
                  locale={locale}
                  categoryName={categoryName}
                  categorySlug={categorySlug}
                  compareAxes={compareAxes}
                  pricing={dbTool?.pricing}
                  pricingLabel={pricingLabel}
                  tagSlugs={dbTool?.tags || []}
                  tagLabels={tagLabels}
                />
                <section id='comments' className='scroll-mt-24'>
                  <Separator className='mb-8 border-t border-slate-200' />
                  <div className='mb-6 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div>
                        <h3 className='text-base font-semibold text-slate-900'>
                          {locale === 'cn' ? '参与讨论，看看真实反馈' : 'Join the discussion and follow updates'}
                        </h3>
                        <p className='mt-1 text-sm text-slate-600'>
                          {locale === 'cn'
                            ? '收藏、分享给团队，或者直接留下你的真实使用体验。'
                            : 'Save this tool, share it with your team, and leave your review.'}
                        </p>
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        {user ? (
                          <>
                            <FavoriteButton toolId={toolId} initialState={isFavoritedByUser} showLabel />
                            <ShareButton
                              toolId={toolId}
                              toolName={websiteName}
                              toolTitle={data.title}
                              toolDescription={data.content}
                              userId={user.id}
                            />
                          </>
                        ) : (
                          <Link
                            href={`/${locale}/login?redirect=/${locale}/ai/${websiteName}`}
                            className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
                          >
                            {locale === 'cn' ? '登录后收藏和评论' : 'Log in to save and comment'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='mb-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900'>
                    {locale === 'cn'
                      ? '欢迎写下真实体验：适合什么场景、哪里最好用、有什么坑，都会帮到后来的人。'
                      : 'Share real usage notes: best use cases, what works well, and what to watch out for. That helps the next person a lot.'}
                  </div>
                  <CommentList
                    toolId={toolId}
                    currentUserId={user?.id}
                    locale={locale}
                    promptLabel={commentPromptLabel}
                    starterPrompts={commentStarterPrompts}
                    placeholder={
                      locale === 'cn'
                        ? '说说你的真实使用体验，比如适合什么场景、有什么优点或注意点。'
                        : 'Tell us your real experience: best use cases, strengths, or anything to watch out for.'
                    }
                  />
                </section>
              </>
            )}
          </main>

          <aside className='space-y-4 lg:sticky lg:top-24 lg:self-start'>
            <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
              <h2 className='text-base font-bold text-slate-950'>
                {locale === 'cn' ? '可信度快照' : 'Trust Snapshot'}
              </h2>
              <dl className='mt-4 space-y-3 text-sm'>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>{locale === 'cn' ? '官网域名' : 'Official domain'}</dt>
                  <dd className='text-right font-semibold text-slate-950'>{officialSite.hostname}</dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>{locale === 'cn' ? '链接安全' : 'Connection'}</dt>
                  <dd className='font-semibold text-slate-950'>{officialSite.secureLabel}</dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>{locale === 'cn' ? '定价' : 'Pricing'}</dt>
                  <dd className='font-semibold text-slate-950'>{pricingLabel}</dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>{locale === 'cn' ? '分类' : 'Category'}</dt>
                  <dd className='text-right font-semibold text-slate-950'>{categoryName}</dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>{locale === 'cn' ? '状态' : 'Status'}</dt>
                  <dd className='font-semibold text-emerald-700'>
                    {dbTool?.status === 'published'
                      ? locale === 'cn'
                        ? '已公开'
                        : 'Published'
                      : locale === 'cn'
                        ? '已收录'
                        : 'Listed'}
                  </dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>{locale === 'cn' ? '最近更新' : 'Last update'}</dt>
                  <dd className='text-right font-semibold text-slate-950'>{updatedLabel}</dd>
                </div>
              </dl>
              {toolId ? (
                <TrackableLink
                  href={data.url}
                  toolId={toolId}
                  userId={user?.id}
                  className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
                >
                  {locale === 'cn' ? '打开官网' : 'Open official site'} <ArrowUpRight className='size-4' />
                </TrackableLink>
              ) : (
                <a
                  href={data.url}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
                >
                  {locale === 'cn' ? '打开官网' : 'Open official site'} <ArrowUpRight className='size-4' />
                </a>
              )}
            </div>

            <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
              <h2 className='text-base font-bold text-slate-950'>{locale === 'cn' ? '互动数据' : 'Engagement'}</h2>
              <div className='mt-4 space-y-3 text-sm text-slate-700'>
                <p className='flex items-center gap-2'>
                  <Eye className='size-4 text-slate-500' /> {toolStats.viewCount.toLocaleString()}{' '}
                  {locale === 'cn' ? '次浏览' : 'views'}
                </p>
                <p className='flex items-center gap-2'>
                  <MousePointerClick className='size-4 text-slate-500' /> {toolStats.clickCount.toLocaleString()}{' '}
                  {locale === 'cn' ? '次官网点击' : 'website clicks'}
                </p>
                <p className='flex items-center gap-2'>
                  <Heart className='size-4 text-slate-500' /> {toolStats.favoriteCount.toLocaleString()}{' '}
                  {locale === 'cn' ? '次收藏' : 'saves'}
                </p>
                <p className='flex items-center gap-2'>
                  <Star className='size-4 text-slate-500' /> {ratingStats.ratingCount.toLocaleString()}{' '}
                  {locale === 'cn' ? '条评分' : 'ratings'}
                </p>
              </div>
            </div>

            {toolId && (
              <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
                <ToolFeedbackBar toolId={toolId} userId={user?.id} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
