import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWebNavigationDetail } from '@/network/webNavigation';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  CircleArrowRight,
  DollarSign,
  ExternalLink,
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

import { PRIORITY_TOOL_EVIDENCE } from '@/lib/config/priorityToolEvidence';
import { PRIORITY_TOOL_FALLBACK_PROFILES } from '@/lib/config/priorityToolFallbacks';
import { BASE_URL } from '@/lib/env';
import { SEO_CONFIG, SOCIAL_IMAGE_DIMENSIONS, ToolMetadata } from '@/lib/seo/constants';
import {
  generateLocalizedCanonicalUrl,
  generateSocialImageUrl,
  generateToolDescription,
  generateToolTitle,
} from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateSoftwareSchema } from '@/lib/seo/schema';
import { getCategoryById, getLocalizedField as getCategoryLocalizedField } from '@/lib/services/categories';
import { getLocalizedField as getTagLocalizedField, getTagsBySlugs, humanizeTagSlug } from '@/lib/services/tags';
import { buildToolDecisionCard, DecisionEvidenceRequirementKey } from '@/lib/services/toolDecisionCard';
import { toolToDetailData } from '@/lib/services/toolPresenter';
import { getLocalizedField, getToolByName } from '@/lib/services/tools';
import { createClient } from '@/lib/supabase/server';
import { Separator } from '@/components/ui/separator';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import CommentList from '@/components/comments/CommentList';
import FavoriteButton from '@/components/FavoriteButton';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import BaseImage from '@/components/image/BaseImage';
import MarkdownProse from '@/components/MarkdownProse';
import MediaGallery from '@/components/MediaGallery';
import RatingStars from '@/components/RatingStars';
import RecommendedTools from '@/components/RecommendedTools';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import ShareButton from '@/components/ShareButton';
import ToolFeedbackBar from '@/components/ToolFeedbackBar';
import TrackableLink from '@/components/TrackableLink';
import { getToolStats } from '@/app/actions/analytics';
import { getCommentCount } from '@/app/actions/comments';
import { isFavorited } from '@/app/actions/favorites';
import { getUserRating } from '@/app/actions/ratings';
import { Link } from '@/app/navigation';

// Revalidate every hour (3600 seconds) - ISR strategy
export const revalidate = 3600;

// Enable dynamic params for ISR
export const dynamicParams = true;

function getLocaleVariants(locale: string): string[] {
  if (locale === 'cn') return ['cn', 'zh'];
  if (locale === 'zh') return ['zh', 'cn'];
  return [locale];
}

function findLocalizedString(record: Record<string, unknown>, locales: string[]): string | null {
  const match = locales.map((key) => record[key]).find((value) => typeof value === 'string' && value.trim());

  if (typeof match === 'string') {
    return match.trim();
  }

  return null;
}

function getLocalizedText(input: unknown, locale: string, fallback = 'en'): string | null {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed || null;
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const localized = findLocalizedString(record, getLocaleVariants(locale));
    if (localized) return localized;

    const fallbackValue = findLocalizedString(record, getLocaleVariants(fallback));
    if (fallbackValue) return fallbackValue;

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
    const localizedList = [...getLocaleVariants(locale), ...getLocaleVariants(fallback)]
      .map((key) => record[key])
      .find((value) => value !== undefined && value !== null);

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

function getStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
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
      const localizedEntries = [...getLocaleVariants(locale), ...getLocaleVariants(fallback)].reduce<unknown>(
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
  sourceUrl: string;
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
  const sourceUrlValue = typeof record.sourceUrl === 'string' ? record.sourceUrl.trim() : '';
  const sourceUrl = /^https?:\/\//i.test(sourceUrlValue) ? sourceUrlValue : null;
  const summary = getLocalizedText(record.summary, locale, fallback);
  const trustNote = getLocalizedText(record.trustNote, locale, fallback);
  const reviewedTime = reviewedAt ? new Date(reviewedAt).getTime() : Number.NaN;

  if (
    !reviewedAt ||
    !Number.isFinite(reviewedTime) ||
    reviewedTime > Date.now() ||
    !reviewedBy ||
    !sourceUrl ||
    !summary
  ) {
    return null;
  }

  return {
    reviewedAt,
    reviewedBy,
    sourceUrl,
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

function getDecisionList(input: unknown, field: 'compareAxes', locale: string, fallback = 'en'): string[] {
  if (!input || typeof input !== 'object') {
    return [];
  }

  const { decision } = input as Record<string, unknown>;
  if (!decision || typeof decision !== 'object') {
    return [];
  }

  return getStringList((decision as Record<string, unknown>)[field], locale, fallback);
}

function getEvidenceRequirementLabel(key: DecisionEvidenceRequirementKey, locale: string): string {
  const labels: Record<DecisionEvidenceRequirementKey, { cn: string; en: string }> = {
    official_source: { cn: '可追溯官方来源', en: 'Traceable official source' },
    reviewed_at: { cn: '编辑核查日期', en: 'Editorial review date' },
    limitations: { cn: '限制与风险', en: 'Limits and risks' },
    media: { cn: '产品素材', en: 'Product media' },
    best_fit: { cn: '适合人群', en: 'Best-fit audience' },
    not_ideal_for: { cn: '不适合人群', en: 'Less-ideal audience' },
    comparison_path: { cn: '比较路径', en: 'Comparison path' },
  };

  return locale === 'cn' ? labels[key].cn : labels[key].en;
}

function formatReviewScheduleDate(value: string | null, due: boolean, locale: string): string {
  if (!value) {
    return locale === 'cn' ? '需要首次复核' : 'Initial review required';
  }

  const label = new Intl.DateTimeFormat(locale === 'cn' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

  if (!due) return label;
  return locale === 'cn' ? `${label} · 已到期` : `${label} · Due`;
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
  let hostname = '';
  let secure = false;

  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.replace(/^www\./, '');
    secure = parsed.protocol === 'https:';
  } catch {
    hostname = url
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');
  }

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

function getMarketDemandSummary({
  locale,
  viewCount,
  clickCount,
}: {
  locale: string;
  viewCount: number;
  clickCount: number;
}) {
  const isChinese = locale === 'cn';
  const clickRate = viewCount > 0 ? clickCount / viewCount : 0;

  if (clickCount >= 50 || clickRate >= 0.08) {
    return {
      label: isChinese ? '需求很强' : 'Strong demand',
      summary: isChinese
        ? '浏览和官网点击都比较活跃，说明这条工具已经吸引到明显的关注。'
        : 'Views and outbound clicks are active enough to show clear user interest.',
      evidence: isChinese
        ? `${viewCount.toLocaleString()} 次浏览 · ${clickCount.toLocaleString()} 次官网点击`
        : `${viewCount.toLocaleString()} views · ${clickCount.toLocaleString()} website clicks`,
    };
  }

  if (clickCount >= 10 || clickRate >= 0.03) {
    return {
      label: isChinese ? '开始有需求' : 'Early demand',
      summary: isChinese
        ? '已经能看到一定点击意愿，适合继续观察它能不能转成更稳定的访问。'
        : 'There is enough click-through to suggest the listing is starting to earn attention.',
      evidence: isChinese
        ? `${viewCount.toLocaleString()} 次浏览 · ${clickCount.toLocaleString()} 次官网点击`
        : `${viewCount.toLocaleString()} views · ${clickCount.toLocaleString()} website clicks`,
    };
  }

  return {
    label: isChinese ? '需求还早' : 'Early signal',
    summary: isChinese
      ? '目前还处于早期信号阶段，更适合先把内容、截图和对比页补完整。'
      : 'This is still early signal territory, so keep improving the page, screenshots, and comparison paths.',
    evidence: isChinese
      ? `${viewCount.toLocaleString()} 次浏览 · ${clickCount.toLocaleString()} 次官网点击`
      : `${viewCount.toLocaleString()} views · ${clickCount.toLocaleString()} website clicks`,
  };
}

function getMarketMomentumSummary({
  locale,
  updatedAt,
  screenshotCount,
  hasVideo,
}: {
  locale: string;
  updatedAt: Date | string | null | undefined;
  screenshotCount: number;
  hasVideo: boolean;
}) {
  const isChinese = locale === 'cn';

  if (!updatedAt) {
    return {
      label: isChinese ? '更新时间待补' : 'Refresh signal missing',
      summary: isChinese
        ? '还没有明确的更新时间信号，建议先把最新资料和媒体补齐。'
        : 'There is no clear freshness signal yet, so the next improvement is to refresh the listing materials.',
      evidence: isChinese
        ? `${screenshotCount.toLocaleString()} 张截图${hasVideo ? ' · 含视频' : ''}`
        : `${screenshotCount.toLocaleString()} screenshots${hasVideo ? ' · video included' : ''}`,
    };
  }

  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)));

  if (diffDays <= 14 || screenshotCount >= 3 || hasVideo) {
    return {
      label: isChinese ? '维护活跃' : 'Actively maintained',
      summary: isChinese
        ? '最近有更新，且媒体覆盖也更完整，通常说明这页还在持续维护。'
        : 'Recent updates and broader media coverage suggest the listing is still being maintained.',
      evidence: isChinese
        ? `${diffDays} 天内更新 · ${screenshotCount.toLocaleString()} 张截图${hasVideo ? ' · 含视频' : ''}`
        : `Updated ${diffDays} days ago · ${screenshotCount.toLocaleString()} screenshots${hasVideo ? ' · video included' : ''}`,
    };
  }

  if (diffDays <= 60) {
    return {
      label: isChinese ? '有一定新鲜度' : 'Moderately fresh',
      summary: isChinese
        ? '资料还不算旧，但最终判断前最好再确认官网是否有变化。'
        : 'The listing is not stale, but it is still worth checking the official site for changes.',
      evidence: isChinese
        ? `${diffDays} 天前更新 · ${screenshotCount.toLocaleString()} 张截图`
        : `Updated ${diffDays} days ago · ${screenshotCount.toLocaleString()} screenshots`,
    };
  }

  return {
    label: isChinese ? '更新偏旧' : 'Stale signal',
    summary: isChinese
      ? '这页资料相对久了，建议把它放在相似工具和官网核对之后再判断。'
      : 'The page is relatively old, so compare it with similar tools and the official site before deciding.',
    evidence: isChinese
      ? `${diffDays} 天前更新 · ${screenshotCount.toLocaleString()} 张截图`
      : `Updated ${diffDays} days ago · ${screenshotCount.toLocaleString()} screenshots`,
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

function getNextComparisonLinks(categorySlug: string | undefined, tagSlugs: string[], locale: string) {
  const isChinese = locale === 'cn';
  const tagSet = new Set(tagSlugs);
  const hasAnyTag = (candidates: string[]) => candidates.some((tag) => tagSet.has(tag));

  if (hasAnyTag(['sales', 'lead-generation', 'prospecting', 'sales-prospecting', 'outreach', 'cold-email', 'crm'])) {
    if (hasAnyTag(['lead-generation', 'enrichment', 'lead-enrichment', 'contact-data', 'intent-data'])) {
      return [
        {
          href: '/guides/ai-tools-for-lead-generation-comparison',
          title: isChinese ? '获客工具对比' : 'Lead generation comparison',
          description: isChinese
            ? '适合继续比较找线索、补全联系人数据和筛选目标账户的效率。'
            : 'Best for comparing prospect discovery, contact enrichment, and target-account filtering.',
        },
        {
          href: '/guides/ai-tools-for-sales-prospecting-comparison',
          title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
          description: isChinese
            ? '如果工作已经进入外联准备、个性化和批量触达，这页更贴近目标。'
            : 'Move here once the workflow shifts into outreach prep, personalization, and campaign execution.',
        },
        {
          href: '/guides/ai-tools-for-sales-comparison',
          title: isChinese ? '销售工具总对比' : 'Sales tools comparison',
          description: isChinese
            ? '回到更宽的销售工作流视角继续缩小 shortlist。'
            : 'Return to the broader sales comparison to narrow the shortlist across workflows.',
        },
      ];
    }

    if (hasAnyTag(['prospecting', 'sales-prospecting', 'outreach', 'cold-email', 'personalization', 'sequencing'])) {
      return [
        {
          href: '/guides/ai-tools-for-sales-prospecting-comparison',
          title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
          description: isChinese
            ? '适合继续比较个性化、邮件序列、外联节奏和团队执行效率。'
            : 'Best for comparing personalization, email sequences, outreach cadence, and team execution.',
        },
        {
          href: '/guides/ai-tools-for-lead-generation-comparison',
          title: isChinese ? '获客工具对比' : 'Lead generation comparison',
          description: isChinese
            ? '如果你发现瓶颈更早，在线索发现和联系人补全，这页更适合。'
            : 'Use this if the real bottleneck is earlier in the funnel around lead discovery and enrichment.',
        },
        {
          href: '/guides/ai-tools-for-sales-comparison',
          title: isChinese ? '销售工具总对比' : 'Sales tools comparison',
          description: isChinese
            ? '回到更宽的销售工具页继续看 CRM、跟进和转化工作流。'
            : 'Return to the broader sales comparison for CRM, follow-up, and conversion workflows.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: isChinese ? '销售工具总对比' : 'Sales tools comparison',
        description: isChinese
          ? '先从更宽的销售工作流视角比较，再决定要不要往线索或外联方向收窄。'
          : 'Start from the wider sales workflow view before narrowing into lead-gen or prospecting.',
      },
      {
        href: '/guides/ai-tools-for-lead-generation-comparison',
        title: isChinese ? '获客工具对比' : 'Lead generation comparison',
        description: isChinese
          ? '如果你的核心问题是“先找到谁”，这条路径更自然。'
          : 'A better path when the real question is who to target first.',
      },
      {
        href: '/guides/ai-tools-for-sales-prospecting-comparison',
        title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
        description: isChinese
          ? '如果你的核心问题是“怎么触达和转化”，顺着这条走。'
          : 'Use this if the core question is how to reach out and convert effectively.',
      },
    ];
  }

  if (categorySlug === 'web3') {
    if (hasAnyTag(['token-research', 'fundamentals', 'narrative', 'crypto-research', 'market-research'])) {
      return [
        {
          href: '/guides/ai-tools-for-token-research-comparison',
          title: isChinese ? '代币研究工具对比' : 'Token research comparison',
          description: isChinese
            ? '适合继续看项目比较、指标框架和研究深度。'
            : 'Best for project comparison, fundamentals framing, and research depth.',
        },
        {
          href: '/guides/ai-tools-for-crypto-research-comparison',
          title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research comparison',
          description: isChinese
            ? '如果你的问题开始变宽，涉及市场叙事和情报整合，就走这条。'
            : 'Move here once the job expands into broader market narratives and research synthesis.',
        },
        {
          href: '/guides/ai-tools-for-protocol-analytics-comparison',
          title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
          description: isChinese
            ? '更适合把 token 判断继续拉到协议健康和使用趋势。'
            : 'A better next step if the decision shifts toward protocol health and usage trends.',
        },
      ];
    }

    if (hasAnyTag(['wallet-tracking', 'wallet-monitoring', 'smart-money', 'address-analysis', 'on-chain'])) {
      return [
        {
          href: '/guides/ai-tools-for-wallet-monitoring-comparison',
          title: isChinese ? '钱包监控工具对比' : 'Wallet monitoring comparison',
          description: isChinese
            ? '继续比较提醒能力、地址覆盖和持续跟踪效率。'
            : 'Compare alerting, address coverage, and long-term monitoring fit.',
        },
        {
          href: '/guides/ai-tools-for-wallet-research-comparison',
          title: isChinese ? '钱包研究工具对比' : 'Wallet research comparison',
          description: isChinese
            ? '更适合看地址画像、资金路径和研究深度。'
            : 'A stronger fit for address profiling, fund paths, and wallet-level research.',
        },
        {
          href: '/guides/ai-tools-for-on-chain-analysis-comparison',
          title: isChinese ? '链上分析工具对比' : 'On-chain analysis comparison',
          description: isChinese
            ? '如果你想把视角放大到交易和链上行为，这页更合适。'
            : 'Use this when the scope expands toward transaction and on-chain behavior analysis.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-tools-for-web3-comparison',
        title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
        description: isChinese
          ? '先从更宽的 Web3 视角继续缩小 shortlist。'
          : 'Start from a broader Web3 comparison to narrow the shortlist.',
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
        description: isChinese
          ? '适合把判断收敛到协议层数据和趋势。'
          : 'Good for narrowing the decision into protocol-level data and trends.',
      },
      {
        href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
        title: isChinese ? '加密资产追踪工具对比' : 'Crypto portfolio tracking comparison',
        description: isChinese
          ? '如果你的目标更偏资产监控和持仓整理，可以顺着这条走。'
          : 'Follow this path if the job is more about holdings, monitoring, and portfolio workflows.',
      },
    ];
  }

  if (categorySlug === 'developer-tools') {
    if (hasAnyTag(['observability', 'tracing', 'logs', 'monitoring', 'evals'])) {
      return [
        {
          href: '/guides/ai-tools-for-api-observability-comparison',
          title: isChinese ? 'API 可观测性工具对比' : 'API observability comparison',
          description: isChinese
            ? '重点比较 tracing、日志、调用监控和排障效率。'
            : 'Compare tracing, logs, request monitoring, and debugging fit.',
        },
        {
          href: '/guides/ai-tools-for-prompt-testing-comparison',
          title: isChinese ? 'Prompt 测试工具对比' : 'Prompt testing comparison',
          description: isChinese
            ? '更适合继续看评测、回归测试和 prompt 迭代。'
            : 'A stronger next step for evals, regression testing, and prompt iteration.',
        },
        {
          href: '/guides/ai-tools-for-developers-comparison',
          title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
          description: isChinese
            ? '回到更宽的开发者工具页继续缩小范围。'
            : 'Jump back to the broader developer-tools comparison to narrow the field.',
        },
      ];
    }

    if (hasAnyTag(['routing', 'gateway', 'llm-gateway', 'model-routing', 'api-layer'])) {
      return [
        {
          href: '/guides/ai-tools-for-model-routing-comparison',
          title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
          description: isChinese
            ? '适合继续比较供应商切换、回退策略和成本控制。'
            : 'Best for comparing provider failover, routing strategy, and cost control.',
        },
        {
          href: '/guides/ai-tools-for-api-observability-comparison',
          title: isChinese ? 'API 可观测性工具对比' : 'API observability comparison',
          description: isChinese
            ? '如果你已经开始关心调用质量和稳定性，顺着这里走。'
            : 'Move here when request quality and runtime visibility start to matter more.',
        },
        {
          href: '/guides/ai-tools-for-developers-comparison',
          title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
          description: isChinese
            ? '如果还没确定方向，先回到更宽的开发者对比页。'
            : 'Use the broader developer comparison if the exact direction is still unclear.',
        },
      ];
    }

    if (hasAnyTag(['automation', 'workflow', 'agents', 'background-jobs', 'orchestration'])) {
      return [
        {
          href: '/guides/ai-tools-for-automation-comparison',
          title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
          description: isChinese
            ? '继续比较触发方式、流程编排和可维护性。'
            : 'Compare triggers, orchestration style, and maintainability next.',
        },
        {
          href: '/guides/ai-tools-for-developers-comparison',
          title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
          description: isChinese
            ? '把它放回更宽的开发者工作流里一起比较。'
            : 'Put it back into the wider developer workflow comparison.',
        },
        {
          href: '/guides/ai-tools-for-prompt-testing-comparison',
          title: isChinese ? 'Prompt 测试工具对比' : 'Prompt testing comparison',
          description: isChinese
            ? '如果你更在意上线前验证质量，也可以继续走这条。'
            : 'Use this if pre-launch validation and quality checks are the real job.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
        description: isChinese
          ? '先从更宽的开发者工具视角继续筛选。'
          : 'Start from a broader developer-tools comparison to keep narrowing down.',
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: isChinese ? 'API 可观测性工具对比' : 'API observability comparison',
        description: isChinese
          ? '适合继续比调用监控、日志和排障。'
          : 'Useful if the next decision is about logs, tracing, and debugging.',
      },
      {
        href: '/guides/ai-tools-for-model-routing-comparison',
        title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
        description: isChinese
          ? '适合继续比模型切换、供应商策略和成本。'
          : 'Useful if the next choice is model routing, provider strategy, and cost.',
      },
    ];
  }

  if (categorySlug === 'text-writing') {
    if (hasAnyTag(['seo', 'keyword-research', 'content-seo', 'blog-seo', 'serp-research'])) {
      return [
        {
          href: '/guides/ai-seo-tools-comparison',
          title: isChinese ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
          description: isChinese
            ? '适合继续比较关键词研究、内容规划和站点结构判断。'
            : 'Best for comparing keyword research, content planning, and site-structure workflows.',
        },
        {
          href: '/guides/ai-writing-tools-comparison',
          title: isChinese ? 'AI 写作工具对比' : 'AI writing tools comparison',
          description: isChinese
            ? '如果你还在比较写作体验、输出质量和升级门槛，继续走这里。'
            : 'Use this if the next decision is about writing quality, workflow friction, and pricing tiers.',
        },
        {
          href: '/guides/ai-tools-for-research-comparison',
          title: isChinese ? '研究工具对比' : 'Research tools comparison',
          description: isChinese
            ? '当写作开始依赖资料整理、证据链和调研效率时，这页更贴近目标。'
            : 'Move here when writing starts to depend on source gathering, evidence trails, and research speed.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-writing-tools-comparison',
        title: isChinese ? 'AI 写作工具对比' : 'AI writing tools comparison',
        description: isChinese
          ? '继续比较写作任务适配度、输出质量和免费额度。'
          : 'Compare writing-task fit, output quality, and free-tier limits next.',
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: isChinese ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
        description: isChinese
          ? '如果你的目标更偏自然搜索和内容规划，可以顺着这条走。'
          : 'Follow this path if the real job is search traffic and content planning.',
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: isChinese ? '研究工具对比' : 'Research tools comparison',
        description: isChinese
          ? '当写作前的资料收集和核对变重要时，这页更合适。'
          : 'A better next step once source gathering and verification matter more.',
      },
    ];
  }

  if (categorySlug === 'research') {
    if (hasAnyTag(['seo', 'keyword-research', 'content-seo', 'search-intelligence'])) {
      return [
        {
          href: '/guides/ai-seo-tools-comparison',
          title: isChinese ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
          description: isChinese
            ? '适合继续比较关键词、SERP 和内容结构判断。'
            : 'Best for comparing keywords, SERP workflows, and content-structure planning.',
        },
        {
          href: '/guides/ai-tools-for-research-comparison',
          title: isChinese ? '研究工具对比' : 'Research tools comparison',
          description: isChinese
            ? '回到更宽的研究工具页继续看来源质量和证据链能力。'
            : 'Return to the broader research comparison for source quality and evidence-trail fit.',
        },
        {
          href: '/guides/ai-writing-tools-comparison',
          title: isChinese ? 'AI 写作工具对比' : 'AI writing tools comparison',
          description: isChinese
            ? '如果研究的下一步是产出文章或页面，这页更贴近执行。'
            : 'Useful when the research output becomes articles, briefs, or landing pages.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: isChinese ? '研究工具对比' : 'Research tools comparison',
        description: isChinese
          ? '继续比较资料来源、搜索效率和证据链完整度。'
          : 'Compare source quality, research speed, and evidence trails next.',
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: isChinese ? 'AI 写作工具对比' : 'AI writing tools comparison',
        description: isChinese
          ? '如果研究后要快速落稿或整理输出，可以继续走这里。'
          : 'Use this if the next step is turning research into drafts or summaries.',
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: isChinese ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
        description: isChinese
          ? '当研究目标更偏搜索机会和内容布局，这页更合适。'
          : 'A better fit when the real question is search opportunity and content structure.',
      },
    ];
  }

  if (categorySlug === 'automation') {
    if (hasAnyTag(['routing', 'gateway', 'api-layer', 'llm-gateway', 'provider-routing'])) {
      return [
        {
          href: '/guides/ai-tools-for-model-routing-comparison',
          title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
          description: isChinese
            ? '适合继续比较供应商切换、成本控制和失败回退策略。'
            : 'Compare provider routing, fallback strategy, and cost control next.',
        },
        {
          href: '/guides/ai-tools-for-automation-comparison',
          title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
          description: isChinese
            ? '回到更宽的自动化对比页继续看触发方式和可维护性。'
            : 'Return to the broader automation comparison for triggers and maintainability.',
        },
        {
          href: '/guides/ai-tools-for-api-observability-comparison',
          title: isChinese ? 'API 可观测性工具对比' : 'API observability comparison',
          description: isChinese
            ? '如果你已经开始关心调用质量和稳定性，顺着这里走。'
            : 'Move here when runtime quality and request visibility become more important.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
        description: isChinese
          ? '继续比较触发方式、流程编排和长期维护成本。'
          : 'Compare triggers, orchestration style, and long-term maintenance cost.',
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
        description: isChinese
          ? '如果这条自动化链路更偏工程化接入，回到开发者对比页。'
          : 'Go here if the automation workflow is really an engineering integration problem.',
      },
      {
        href: '/guides/ai-tools-for-model-routing-comparison',
        title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
        description: isChinese
          ? '当你的自动化开始依赖多模型与多供应商切换时，这页更贴近目标。'
          : 'A better fit once the workflow depends on multi-model and multi-provider routing.',
      },
    ];
  }

  if (categorySlug === 'productivity') {
    if (hasAnyTag(['meeting-notes', 'transcription', 'note-taking', 'meetings', 'voice-notes'])) {
      return [
        {
          href: '/guides/ai-tools-for-meeting-notes-comparison',
          title: isChinese ? '会议纪要工具对比' : 'Meeting notes comparison',
          description: isChinese
            ? '适合继续比较转录质量、摘要结构和会议后的执行效率。'
            : 'Best for comparing transcription quality, summary structure, and follow-through after meetings.',
        },
        {
          href: '/guides/ai-note-taking-tools-comparison',
          title: isChinese ? 'AI 笔记工具对比' : 'AI note taking comparison',
          description: isChinese
            ? '如果你更在意笔记整理、知识沉淀和回顾效率，继续走这里。'
            : 'Use this if the real job is note organization, knowledge capture, and review speed.',
        },
        {
          href: '/guides/ai-productivity-tools-comparison',
          title: isChinese ? 'AI 生产力工具对比' : 'AI productivity tools comparison',
          description: isChinese
            ? '回到更宽的生产力工具视角继续比较。'
            : 'Return to the broader productivity comparison to compare across workflows.',
        },
      ];
    }

    return [
      {
        href: '/guides/ai-productivity-tools-comparison',
        title: isChinese ? 'AI 生产力工具对比' : 'AI productivity tools comparison',
        description: isChinese
          ? '继续比较会议、任务推进和知识整理这几类工作流。'
          : 'Compare meetings, task follow-through, and knowledge workflows next.',
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: isChinese ? 'AI 笔记工具对比' : 'AI note taking comparison',
        description: isChinese
          ? '如果你更偏笔记和知识回顾，顺着这条走更自然。'
          : 'A stronger fit when the job leans toward notes and knowledge review.',
      },
      {
        href: '/guides/ai-tools-for-meeting-notes-comparison',
        title: isChinese ? '会议纪要工具对比' : 'Meeting notes comparison',
        description: isChinese
          ? '如果目标更偏录音整理和会后追踪，这页更合适。'
          : 'More useful when the real job is meeting capture and post-meeting follow-up.',
      },
    ];
  }

  return [
    {
      href: '/guides/how-to-choose-ai-tools',
      title: isChinese ? 'AI 工具选型指南' : 'AI tool selection guide',
      description: isChinese
        ? '如果比较维度还不够明确，先回到选型指南更高效。'
        : 'Return to the selection guide if your comparison criteria are still fuzzy.',
    },
    {
      href: '/explore?sort=popular',
      title: isChinese ? '热门工具探索页' : 'Popular tools explore page',
      description: isChinese
        ? '回到全站继续横向看同类条目。'
        : 'Return to the directory and compare more listings side by side.',
    },
    {
      href: '/new',
      title: isChinese ? '本周新增工具' : 'New this week',
      description: isChinese
        ? '看看最近新增和最近补厚的工具页。'
        : 'See recently added and recently improved listings.',
    },
  ];
}

function getPricingLabel(pricing: string | null | undefined): string {
  if (pricing === 'free') return 'Free';
  if (pricing === 'paid') return 'Paid';
  if (pricing === 'freemium') return 'Freemium';
  return 'Check website';
}

function getClaimLabel(claimStatus: string | null | undefined, locale: string): string {
  const isChinese = locale === 'cn';

  if (claimStatus === 'claimed') return isChinese ? '已认领' : 'Claimed';
  if (claimStatus === 'pending') return isChinese ? '待确认' : 'Pending';
  if (claimStatus === 'rejected') return isChinese ? '已驳回' : 'Rejected';
  return isChinese ? '未认领' : 'Unclaimed';
}

function getClaimTone(claimStatus: string | null | undefined): string {
  if (claimStatus === 'claimed') return 'bg-emerald-50 text-emerald-700';
  if (claimStatus === 'pending') return 'bg-amber-50 text-amber-700';
  if (claimStatus === 'rejected') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

function getDaysSince(date: Date | string | null | undefined): number | null {
  if (!date) return null;

  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return null;

  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
}

type DetailClaimSignals = {
  ownerEmail?: string | null;
  claimStatus?: string | null;
  claimedAt?: string | null;
};

type PriorityToolSearchIntent = {
  metadataTitle: string;
  metadataDescription: string;
  label: string;
  summary: string;
  checkpoints: string[];
};

type PriorityToolOfficialEvidence = {
  label: string;
  title: string;
  summary: string;
  checkedAt: string;
  facts: Array<{ label: string; value: string }>;
  sources: Array<{ label: string; href: string }>;
};

function getPriorityToolOfficialEvidence(websiteName: string, locale: string): PriorityToolOfficialEvidence | null {
  const isChinese = locale === 'cn' || locale === 'tw';
  const key = websiteName.toLowerCase();

  if (key === 'lindy') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '价格、用量和人工确认边界',
          summary: '以下信息来自 Lindy 官方定价与用量文档；价格和额度可能变化，购买前应再次打开官方页面确认。',
          checkedAt: '2026-08-03',
          facts: [
            { label: '试用与套餐', value: '7 天试用；Plus $49.99/月、Pro $99.99/月、Max $199.99/月。' },
            {
              label: '用量计算',
              value: '自定义 Agent 按任务消耗 credits，模型、复杂度、付费动作和运行时间都会影响成本。',
            },
            { label: '运行边界', value: '额度用尽后 Agent 会暂停；未用额度不会结转，敏感邮件和消息应保留人工确认。' },
          ],
          sources: [
            { label: '官方定价', href: 'https://www.lindy.ai/pricing' },
            { label: 'Credits 说明', href: 'https://docs.lindy.ai/account-billing/credits' },
            { label: '用量与暂停规则', href: 'https://docs.lindy.ai/account-billing/usage' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Pricing, usage, and human-control boundaries',
          summary:
            'These facts come from Lindy pricing and usage documentation. Recheck the official pages before buying because prices and allowances can change.',
          checkedAt: '2026-08-03',
          facts: [
            { label: 'Trial and plans', value: '7-day trial; Plus $49.99/mo, Pro $99.99/mo, and Max $199.99/mo.' },
            {
              label: 'Usage model',
              value:
                'Custom-agent tasks consume credits based on model choice, complexity, premium actions, and duration.',
            },
            {
              label: 'Operating boundary',
              value:
                'Agents pause when usage is exhausted, unused allowance does not roll over, and sensitive sends should retain human review.',
            },
          ],
          sources: [
            { label: 'Official pricing', href: 'https://www.lindy.ai/pricing' },
            { label: 'Credits documentation', href: 'https://docs.lindy.ai/account-billing/credits' },
            { label: 'Usage and pause rules', href: 'https://docs.lindy.ai/account-billing/usage' },
          ],
        };
  }

  if (key === 'fathom') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '免费层、会议兼容性和录制同意',
          summary: '以下信息来自 Fathom 官方帮助中心；团队方案和新桌面体验仍在变化，启用前应复核当前账号可见配置。',
          checkedAt: '2026-08-03',
          facts: [
            { label: '免费层', value: '个人免费层包含不限量录制、存储和 38 种语言转录；高级摘要每月前 5 次可用。' },
            {
              label: '会议平台',
              value: '设置文档列出 Zoom、Google Meet 和 Microsoft Teams，并支持分别配置自动录制与会后分享。',
            },
            { label: '隐私边界', value: 'Fathom 不支持静默录制；参与者必须能看到录制通知、bot 或同意机制。' },
          ],
          sources: [
            { label: '免费与 Premium', href: 'https://help.fathom.video/en/articles/5290881' },
            { label: '会议与分享设置', href: 'https://help.fathom.video/en/articles/3239617' },
            { label: '录制同意规则', href: 'https://help.fathom.video/en/articles/6150977' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Free tier, meeting compatibility, and recording consent',
          summary:
            'These facts come from the Fathom help center. Team packaging and the newer desktop experience are still changing, so recheck the settings visible to your account.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Free tier',
              value:
                'The individual free tier includes unlimited recordings, storage, and transcription in 38 languages, with five advanced summaries per month.',
            },
            {
              label: 'Meeting platforms',
              value:
                'Settings documentation covers Zoom, Google Meet, and Microsoft Teams, with controls for capture and post-meeting sharing.',
            },
            {
              label: 'Privacy boundary',
              value:
                'Fathom does not support silent recording; participants must see a recording notice, bot, or consent mechanism.',
            },
          ],
          sources: [
            { label: 'Free versus Premium', href: 'https://help.fathom.video/en/articles/5290881' },
            { label: 'Meeting and sharing settings', href: 'https://help.fathom.video/en/articles/3239617' },
            { label: 'Recording consent rules', href: 'https://help.fathom.video/en/articles/6150977' },
          ],
        };
  }

  if (key === 'the-graph') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '查询额度、生产访问和新鲜度检查',
          summary: '以下信息来自 The Graph 官方文档；查询价格和网络支持范围可能变化，上线前应复核当前套餐与文档。',
          checkedAt: '2026-08-31',
          facts: [
            {
              label: '成本边界',
              value: '查询费用与索引成本彼此独立；查询量增加会提高使用成本，但无法让索引不足的 Subgraph 自动变得可用。',
            },
            {
              label: '生产访问',
              value: 'Gateway 负责端点、认证和计费体验；API key 可限制到指定 Subgraph、域名和 rate limit。',
            },
            {
              label: '新鲜度边界',
              value:
                'GraphQL 的 _meta 字段可返回区块、时间戳、部署与索引错误，生产使用时应据此检查数据新鲜度和完整性。',
            },
          ],
          sources: [
            {
              label: 'Studio 与套餐说明',
              href: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/overview/',
            },
            {
              label: '查询与索引成本',
              href: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/pricing-payments/',
            },
            { label: '查询与 _meta 文档', href: 'https://thegraph.com/docs/en/subgraphs/querying/graphql-api/' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Query allowance, production access, and freshness checks',
          summary:
            'These facts come from The Graph documentation. Recheck current plans and network support before production use because pricing and coverage can change.',
          checkedAt: '2026-08-31',
          facts: [
            {
              label: 'Cost boundary',
              value:
                'Query fees and indexing costs are separate; more query spend scales access but cannot make an under-indexed Subgraph available.',
            },
            {
              label: 'Production access',
              value:
                'A Gateway controls endpoints, authentication, and billing; API keys can be scoped to specific Subgraphs, domains, and rate limits.',
            },
            {
              label: 'Freshness boundary',
              value:
                'The GraphQL _meta field can expose block, timestamp, deployment, and indexing-error data for checking freshness and integrity.',
            },
          ],
          sources: [
            {
              label: 'Studio and plan documentation',
              href: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/overview/',
            },
            {
              label: 'Query and indexing costs',
              href: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/pricing-payments/',
            },
            {
              label: 'Query and _meta documentation',
              href: 'https://thegraph.com/docs/en/subgraphs/querying/graphql-api/',
            },
          ],
        };
  }

  if (key === 'dune') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: 'Credits、查询成本和数据刷新边界',
          summary: '以下信息来自 Dune 官方文档；credits、套餐价格与数据刷新频率可能变化，使用前应复核当前账号设置。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '免费与付费',
              value: 'Free 每月包含 2,500 credits；Analyst 为 $75/月，Plus 为 $399/月，复杂查询会消耗更多 credits。',
            },
            {
              label: '成本控制',
              value: '查询按实际计算资源计费，可设置单次查询 cost cap 和月度额外 credits 上限；未使用 credits 不结转。',
            },
            {
              label: '新鲜度边界',
              value:
                '原始数据受链出块和重组风险影响；decoded 数据通常在原始数据进入后 15–60 秒完成，curated 表通常每小时刷新。',
            },
          ],
          sources: [
            { label: 'Credits 与套餐', href: 'https://docs.dune.com/resources/credits-billing/how-credits-work' },
            { label: '数据新鲜度', href: 'https://docs.dune.com/data-catalog/data-freshness' },
            { label: '查询调度', href: 'https://docs.dune.com/web-app/query-editor/query-scheduler' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Credits, query cost, and data-refresh boundaries',
          summary:
            'These facts come from Dune documentation. Recheck account settings before use because credits, plan prices, and refresh timing can change.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Free and paid plans',
              value:
                'Free includes 2,500 monthly credits; Analyst is $75/mo and Plus is $399/mo, while more complex queries consume more credits.',
            },
            {
              label: 'Cost controls',
              value:
                'Queries are charged by actual compute use; per-query cost caps and monthly extra-credit limits are available, and unused credits do not roll over.',
            },
            {
              label: 'Freshness boundary',
              value:
                'Raw-data timing depends on block production and reorg risk; decoded data typically follows ingestion by 15–60 seconds, while curated tables usually refresh hourly.',
            },
          ],
          sources: [
            { label: 'Credits and plans', href: 'https://docs.dune.com/resources/credits-billing/how-credits-work' },
            { label: 'Data freshness', href: 'https://docs.dune.com/data-catalog/data-freshness' },
            { label: 'Query scheduling', href: 'https://docs.dune.com/web-app/query-editor/query-scheduler' },
          ],
        };
  }

  if (key === 'notta') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '转录额度、语言覆盖和翻译限制',
          summary: '以下信息来自 Notta 官方帮助中心；套餐额度和语言支持可能变化，处理重要会议前应复核当前账号限制。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '转录额度',
              value:
                'Free 每月 120 分钟，Pro 每月 1,800 分钟；Business 当前提供不限转录时长，Pro 不能单独购买额外分钟。',
            },
            {
              label: '语言覆盖',
              value: '单语转录支持 58 种语言，转录后翻译支持 42 种语言，双语转录与翻译支持 23 种语言。',
            },
            {
              label: '翻译边界',
              value: '翻译准确性依赖原始转录，官方建议先校正转录；重新翻译仍会消耗转录分钟，部分实时翻译另有次数限制。',
            },
          ],
          sources: [
            {
              label: '转录额度说明',
              href: 'https://support.notta.ai/hc/en-us/articles/16302706643739-Is-it-possible-to-buy-more-transcription-time',
            },
            {
              label: '支持语言',
              href: 'https://support.notta.ai/hc/en-us/articles/4403155631131-What-languages-does-Notta-support',
            },
            {
              label: '翻译限制',
              href: 'https://support.notta.ai/hc/en-us/articles/18585038521627-Generate-translations-from-transcripts',
            },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Transcription allowance, language coverage, and translation limits',
          summary:
            'These facts come from the Notta help center. Recheck current account limits before important meetings because allowances and language support can change.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Transcription allowance',
              value:
                'Free includes 120 minutes per month and Pro includes 1,800; Business currently offers unlimited transcription, while Pro minutes cannot be purchased separately.',
            },
            {
              label: 'Language coverage',
              value:
                'Monolingual transcription supports 58 languages, post-transcription translation supports 42, and bilingual transcription and translation supports 23.',
            },
            {
              label: 'Translation boundary',
              value:
                'Translation quality depends on the transcript, retranslating consumes transcription minutes, and some real-time translation modes have separate usage limits.',
            },
          ],
          sources: [
            {
              label: 'Transcription allowance',
              href: 'https://support.notta.ai/hc/en-us/articles/16302706643739-Is-it-possible-to-buy-more-transcription-time',
            },
            {
              label: 'Supported languages',
              href: 'https://support.notta.ai/hc/en-us/articles/4403155631131-What-languages-does-Notta-support',
            },
            {
              label: 'Translation limits',
              href: 'https://support.notta.ai/hc/en-us/articles/18585038521627-Generate-translations-from-transcripts',
            },
          ],
        };
  }

  if (key === 'runway') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '生成 Credits、商业权利和账户边界',
          summary: '以下信息来自 Runway 官方帮助中心；模型费率与套餐额度变化较快，正式制作前应在 Billing 页面复核。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Credits',
              value: 'Free 一次性提供 125 credits；Standard 每月 625，Pro 与 Unlimited 每月 2,250，Max 每月 9,500。',
            },
            {
              label: '生成成本',
              value:
                '不同模型按输出计费；官方示例中 Gen-4.5 为每秒 12 credits。Standard、Pro 与 Unlimited 月度额度不结转。',
            },
            {
              label: '权利与账户',
              value: '各套餐生成内容可用于商业用途且无需强制署名；Web App 与 API 的套餐和 credits 完全分开，不能互转。',
            },
          ],
          sources: [
            {
              label: 'Credits 规则',
              href: 'https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work',
            },
            {
              label: '使用与商业权利',
              href: 'https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights',
            },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Generation credits, commercial rights, and account boundaries',
          summary:
            'These facts come from the Runway help center. Model rates and plan allowances change quickly, so recheck Plans & Billing before production work.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Credits',
              value:
                'Free includes a one-time 125 credits; Standard includes 625 monthly, Pro and Unlimited 2,250 monthly, and Max 9,500 monthly.',
            },
            {
              label: 'Generation cost',
              value:
                'Models consume credits at different rates; Runway lists Gen-4.5 at 12 credits per generated second. Standard, Pro, and Unlimited monthly credits do not roll over.',
            },
            {
              label: 'Rights and accounts',
              value:
                'All plans permit commercial use without mandatory attribution; web-app and API plans and credits are separate and cannot be transferred.',
            },
          ],
          sources: [
            {
              label: 'Credit rules',
              href: 'https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work',
            },
            {
              label: 'Usage and commercial rights',
              href: 'https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights',
            },
          ],
        };
  }

  if (key === 'defillama') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: 'TVL 口径、开源数据和解读边界',
          summary: '以下信息来自 DefiLlama 官方方法文档；链上指标依赖 adapter、价格源与分类口径，不能替代独立尽调。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '数据来源',
              value:
                '每个项目通过开源 adapter 返回 TVL，官方优先使用链上调用，也允许部分 adapter 使用 subgraph 或 API。',
            },
            {
              label: 'TVL 口径',
              value: '未流通资产、原生代币质押、智能钱包资金和链级 bridge TVL 默认不计入；同一协议内部避免重复计算。',
            },
            {
              label: '解读边界',
              value:
                'TVL 会随资产价格变化，即使没有资金流入或流出也可能升降；分析资金方向时应结合 USD Inflows 等指标。',
            },
          ],
          sources: [
            { label: '官方方法与指标', href: 'https://docs.llama.fi/' },
            { label: 'TVL 纳入规则', href: 'https://docs.llama.fi/list-your-project/what-to-include-as-tvl' },
            { label: '数据定义', href: 'https://docs.llama.fi/analysts/data-definitions' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'TVL methodology, open data, and interpretation limits',
          summary:
            'These facts come from DefiLlama methodology documentation. Onchain metrics depend on adapters, price sources, and classification rules and do not replace independent diligence.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Data source',
              value:
                'Each listed project has an open-source adapter that returns TVL; onchain calls are preferred, while some adapters use subgraphs or APIs.',
            },
            {
              label: 'TVL scope',
              value:
                'Unissued assets, native-token staking, smart-wallet funds, and bridge TVL at chain level are excluded by default, with double counting avoided inside a protocol.',
            },
            {
              label: 'Interpretation boundary',
              value:
                'TVL can rise or fall with asset prices even without deposits or withdrawals; use measures such as USD Inflows when evaluating capital movement.',
            },
          ],
          sources: [
            { label: 'Official methodology and metrics', href: 'https://docs.llama.fi/' },
            { label: 'TVL inclusion rules', href: 'https://docs.llama.fi/list-your-project/what-to-include-as-tvl' },
            { label: 'Data definitions', href: 'https://docs.llama.fi/analysts/data-definitions' },
          ],
        };
  }

  if (key === 'chatgpt') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '套餐选择、数据控制和工作区边界',
          summary: '以下信息来自 OpenAI 官方定价与帮助文档；模型、额度和功能会持续变化，使用前应复核当前账号显示。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '套餐边界',
              value: 'Free、Go、Plus 面向个人；Business 与 Enterprise 面向组织，Business 至少需要 2 名用户。',
            },
            {
              label: '个人数据控制',
              value: '个人工作区可在 Data Controls 关闭“Improve the model for everyone”；关闭后新对话不用于训练。',
            },
            {
              label: '临时与商业数据',
              value:
                'Temporary Chat 不进入历史、不创建 memory，并在 30 天后删除；Business、Enterprise、Edu 默认不使用输入输出训练模型。',
            },
          ],
          sources: [
            { label: 'ChatGPT 官方定价', href: 'https://openai.com/business/chatgpt-pricing/' },
            {
              label: 'Data Controls',
              href: 'https://help.openai.com/en/articles/7730893-how-chatgpt-uses-browser-history-and-data',
            },
            { label: '训练数据设置', href: 'https://help.openai.com/en/articles/8983130-how-does-chatgpt-use-my-data' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Plan choice, data controls, and workspace boundaries',
          summary:
            'These facts come from OpenAI pricing and help documentation. Models, allowances, and features change, so recheck the options shown in your account.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Plan boundary',
              value:
                'Free, Go, and Plus are for individuals; Business and Enterprise serve organizations, with Business starting at two users.',
            },
            {
              label: 'Personal data control',
              value:
                'Personal workspaces can turn off Improve the model for everyone in Data Controls; new conversations are then excluded from training.',
            },
            {
              label: 'Temporary and business data',
              value:
                'Temporary Chats are not saved to history or memory and are deleted after 30 days; Business, Enterprise, and Edu inputs and outputs are not used for training by default.',
            },
          ],
          sources: [
            { label: 'Official ChatGPT pricing', href: 'https://openai.com/business/chatgpt-pricing/' },
            {
              label: 'Data Controls',
              href: 'https://help.openai.com/en/articles/7730893-how-chatgpt-uses-browser-history-and-data',
            },
            {
              label: 'Training-data settings',
              href: 'https://help.openai.com/en/articles/8983130-how-does-chatgpt-use-my-data',
            },
          ],
        };
  }

  if (key === 'claude') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '套餐价格、动态用量和数据导出',
          summary: '以下信息来自 Anthropic 官方帮助中心；实际消息额度受对话、附件、工具和模型影响，并非固定消息数。',
          checkedAt: '2026-08-03',
          facts: [
            { label: '个人套餐', value: 'Free 为 $0；Pro $20/月；Max 5x $100/月；Max 20x $200/月。' },
            {
              label: '用量边界',
              value: '可用消息数会随消息长度、附件大小、对话长度、Research/web search、模型与 Artifacts 使用变化。',
            },
            {
              label: '数据可携带性',
              value:
                'Free、Pro、Max 用户可从 Web 或桌面端 Settings > Privacy 导出账户信息与聊天记录；下载链接 24 小时后失效。',
            },
          ],
          sources: [
            {
              label: 'Claude 套餐选择',
              href: 'https://support.anthropic.com/en/articles/11049762-choosing-a-claude-ai-plan',
            },
            {
              label: '用量优化与影响因素',
              href: 'https://support.anthropic.com/en/articles/9797557-usage-limit-best-practices',
            },
            {
              label: '数据导出',
              href: 'https://support.anthropic.com/en/articles/9450526-how-can-i-export-my-claude-data',
            },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Plan pricing, variable usage, and data export',
          summary:
            'These facts come from the Anthropic help center. Actual message capacity depends on the conversation, attachments, tools, and model rather than a fixed message count.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Individual plans',
              value: 'Free is $0; Pro is $20/mo; Max 5x is $100/mo; and Max 20x is $200/mo.',
            },
            {
              label: 'Usage boundary',
              value:
                'Capacity varies with message and attachment size, conversation length, Research or web search, model choice, and Artifact usage.',
            },
            {
              label: 'Data portability',
              value:
                'Free, Pro, and Max users can export account and chat data from Settings > Privacy on web or desktop; the download link expires after 24 hours.',
            },
          ],
          sources: [
            {
              label: 'Choosing a Claude plan',
              href: 'https://support.anthropic.com/en/articles/11049762-choosing-a-claude-ai-plan',
            },
            {
              label: 'Usage factors and practices',
              href: 'https://support.anthropic.com/en/articles/9797557-usage-limit-best-practices',
            },
            {
              label: 'Data export',
              href: 'https://support.anthropic.com/en/articles/9450526-how-can-i-export-my-claude-data',
            },
          ],
        };
  }

  if (key === 'cursor') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '套餐内用量、超额成本和代码隐私',
          summary:
            '以下信息来自 Cursor 官方定价、计费与隐私文档；模型价格和奖励用量可能变化，应在 Dashboard 核对实际消耗。',
          checkedAt: '2026-08-31',
          facts: [
            {
              label: '套餐与用量',
              value: 'Pro $20/月并包含 $20 API agent usage；Pro Plus 包含 $70，Ultra 包含 $400；Teams 为 $40/用户/月。',
            },
            {
              label: '超额成本',
              value:
                '模型选择影响 token 消耗；套餐内用量耗尽后可按成本购买额外用量，组织管理员可设置月度或用户级限制。',
            },
            {
              label: '隐私边界',
              value:
                '启用 Privacy Mode 后，Cursor 不将 Customer Data 用于训练，并与模型提供商维持 ZDR；滥用检测命中时仍可能按政策暂存调查数据。',
            },
          ],
          sources: [
            { label: '模型与套餐用量', href: 'https://docs.cursor.com/account/pricing' },
            { label: '官方价格', href: 'https://cursor.com/pricing' },
            { label: '数据使用与 Privacy Mode', href: 'https://cursor.com/en-US/data-use' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Included usage, overage cost, and code privacy',
          summary:
            'These facts come from Cursor pricing, billing, and privacy documentation. Model prices and bonus usage can change, so verify actual consumption in the dashboard.',
          checkedAt: '2026-08-31',
          facts: [
            {
              label: 'Plans and usage',
              value:
                'Pro is $20/mo with $20 of API agent usage; Pro Plus includes $70, Ultra includes $400, and Teams is $40/user/mo.',
            },
            {
              label: 'Overage cost',
              value:
                'Model choice affects token consumption; users can buy additional usage at cost after the included amount, while organizations can configure monthly or per-user limits.',
            },
            {
              label: 'Privacy boundary',
              value:
                'With Privacy Mode enabled, Cursor does not train on Customer Data and maintains ZDR agreements with model providers; abuse-detector investigations remain an exception.',
            },
          ],
          sources: [
            { label: 'Models and included usage', href: 'https://docs.cursor.com/account/pricing' },
            { label: 'Official pricing', href: 'https://cursor.com/pricing' },
            { label: 'Data use and Privacy Mode', href: 'https://cursor.com/en-US/data-use' },
          ],
        };
  }

  if (key === 'pipedream') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: 'Credits、费用上限和工作流生命周期',
          summary:
            '以下信息来自 Pipedream 官方文档；套餐额度和平台限制会变化，生产工作流应设置预算并监控 Billing & Usage。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '免费与付费',
              value:
                'Free 有每日 credits、活跃工作流和连接账户限制；付费层可运行不限 credits，但超出套餐包含量会产生按量费用。',
            },
            {
              label: '成本控制',
              value: '可设置 workspace 级 Credit Budget 和使用提醒；并发执行可能导致实际消耗略高于设定上限。',
            },
            {
              label: '降级与保留',
              value:
                '降级或取消后，超出新套餐能力的工作流和连接会自动停用；workflow code 与 data store 数据会保留到用户主动删除。',
            },
          ],
          sources: [
            { label: '套餐与 Credits', href: 'https://pipedream.com/docs/pricing' },
            { label: '平台限制', href: 'https://pipedream.com/docs/workflows/limits' },
            { label: '预算与用量设置', href: 'https://pipedream.com/docs/account/billing-settings' },
            { label: '数据保留', href: 'https://pipedream.com/docs/privacy-and-security' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Credits, spending controls, and workflow lifecycle',
          summary:
            'These facts come from Pipedream documentation. Plan allowances and platform limits change, so production workflows should use budgets and Billing & Usage monitoring.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Free and paid usage',
              value:
                'Free has daily credit, active-workflow, and connected-account limits; paid tiers allow uncapped credits but charge for usage beyond the included amount.',
            },
            {
              label: 'Cost control',
              value:
                'A workspace Credit Budget and usage notifications are available; concurrent executions can cause actual consumption to slightly exceed the configured cap.',
            },
            {
              label: 'Downgrade and retention',
              value:
                'Downgrades or cancellation disable workflows and connections beyond the new plan; workflow code and data-store data remain until the user deletes them.',
            },
          ],
          sources: [
            { label: 'Plans and credits', href: 'https://pipedream.com/docs/pricing' },
            { label: 'Platform limits', href: 'https://pipedream.com/docs/workflows/limits' },
            { label: 'Budget and usage settings', href: 'https://pipedream.com/docs/account/billing-settings' },
            { label: 'Data retention', href: 'https://pipedream.com/docs/privacy-and-security' },
          ],
        };
  }

  if (key === 'perplexity') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '搜索额度、消费者数据和企业边界',
          summary: '以下信息来自 Perplexity 官方帮助中心；搜索与 Research 配额可能动态调整，应以账号当前显示为准。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Free 限制',
              value:
                'Free 当前包含每天 3 次 Pro Search 和每月 1 次 Research；高级模型、图像生成与更高额度需要付费套餐。',
            },
            {
              label: '消费者数据',
              value: 'Free、Pro、Max 的 AI Data Retention 默认开启，可在设置中关闭；退出只影响退出之后收集的数据。',
            },
            {
              label: '企业数据',
              value:
                'Enterprise 查询数据不用于模型训练；上传文件通常保留 7 天，并通过与模型提供商的 ZDR/ZDT 协议保护。',
            },
          ],
          sources: [
            {
              label: '套餐能力对比',
              href: 'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you',
            },
            {
              label: '数据收集与退出',
              href: 'https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity',
            },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Search allowances, consumer data, and enterprise boundaries',
          summary:
            'These facts come from the Perplexity help center. Search and Research allowances can change dynamically, so verify the limits shown in your account.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Free limits',
              value:
                'Free currently includes three Pro Searches per day and one Research query per month; advanced models, image generation, and higher limits require paid plans.',
            },
            {
              label: 'Consumer data',
              value:
                'AI Data Retention is enabled by default for Free, Pro, and Max and can be turned off; opting out only affects data collected after that date.',
            },
            {
              label: 'Enterprise data',
              value:
                'Enterprise query data is not used for model training; uploaded files are generally retained for seven days and provider agreements require zero retention and training.',
            },
          ],
          sources: [
            {
              label: 'Plan capability comparison',
              href: 'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you',
            },
            {
              label: 'Data collection and opt-out',
              href: 'https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity',
            },
          ],
        };
  }

  if (key === 'n8n') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: 'Execution 计费、部署方式和数据位置',
          summary: '以下信息来自 n8n 官方定价与安全文档；价格按年付口径展示，执行额度和功能可能变化。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Cloud 套餐',
              value:
                '年付时 Starter €20/月含 2,500 executions，Pro €50/月含 10,000；所有套餐包含不限用户、工作流和步骤。',
            },
            {
              label: '计费单位',
              value:
                '一次 execution 指整个工作流从开始到结束的一次运行，无论包含多少节点、步骤或处理多少数据，均计为一次。',
            },
            {
              label: '部署与数据',
              value:
                'n8n Cloud 数据存储在德国法兰克福；自托管数据位置由用户决定，Community Edition 可从 GitHub 自行部署。',
            },
          ],
          sources: [
            { label: 'n8n 官方定价', href: 'https://n8n.io/pricing/' },
            { label: 'Execution 计费说明', href: 'https://support.n8n.io/article/updated-pricing-model-august-2025' },
            { label: '自托管安全审计', href: 'https://docs.n8n.io/hosting/securing/security-audit/' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Execution billing, deployment choice, and data location',
          summary:
            'These facts come from n8n pricing and security documentation. Prices use annual-billing rates, and execution allowances and features can change.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Cloud plans',
              value:
                'On annual billing, Starter is €20/mo for 2,500 executions and Pro is €50/mo for 10,000; plans include unlimited users, workflows, and steps.',
            },
            {
              label: 'Billing unit',
              value:
                'One execution is one complete workflow run, regardless of how many nodes or steps it contains or how much data it processes.',
            },
            {
              label: 'Deployment and data',
              value:
                'n8n Cloud stores data in Frankfurt, Germany; self-hosted data location is user-controlled, and Community Edition is available for self-deployment from GitHub.',
            },
          ],
          sources: [
            { label: 'Official n8n pricing', href: 'https://n8n.io/pricing/' },
            {
              label: 'Execution pricing model',
              href: 'https://support.n8n.io/article/updated-pricing-model-august-2025',
            },
            { label: 'Self-hosted security audit', href: 'https://docs.n8n.io/hosting/securing/security-audit/' },
          ],
        };
  }

  if (key === 'make') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: 'Credits、AI 双重成本和数据区域',
          summary:
            '以下信息来自 Make 官方帮助中心；credits、模型转换率和套餐上限可能变化，应按场景运行记录核算真实成本。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '基础计费',
              value: 'Credits 已取代 operations 成为计费单位；大多数非 AI 模块默认一次 operation 消耗 1 credit。',
            },
            {
              label: 'AI 成本边界',
              value:
                '使用自有 AI provider connection 时，向 Make 支付 operation credits，同时向模型商支付 tokens；内置或自动连接可能按 tokens、operations 和其他因素动态计费。',
            },
            {
              label: '数据区域',
              value: '创建 organization 时可选美国或欧盟数据中心；该位置决定数据存储与处理区域，创建后不能更改。',
            },
          ],
          sources: [
            { label: 'Credits 规则', href: 'https://help.make.com/credits' },
            { label: '功能 Credit 消耗', href: 'https://help.make.com/how-features-use-credits' },
            { label: 'Organization 与数据区域', href: 'https://help.make.com/organizations' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Credits, dual AI costs, and data region',
          summary:
            'These facts come from the Make help center. Credits, model conversion rates, and plan limits can change, so calculate real cost from scenario run records.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Base billing',
              value:
                'Credits replaced operations as the billing unit; most non-AI modules use one credit for each operation by default.',
            },
            {
              label: 'AI cost boundary',
              value:
                'With a custom AI-provider connection, users pay Make operation credits and separately pay the provider for tokens; built-in or automatic connections can bill dynamically by tokens, operations, and other factors.',
            },
            {
              label: 'Data region',
              value:
                'An organization selects a US or EU data center at creation; this determines where its data is stored and processed and cannot be changed later.',
            },
          ],
          sources: [
            { label: 'Credit rules', href: 'https://help.make.com/credits' },
            { label: 'Feature credit usage', href: 'https://help.make.com/how-features-use-credits' },
            { label: 'Organizations and data region', href: 'https://help.make.com/organizations' },
          ],
        };
  }

  if (key === 'openrouter') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: '模型透传价格、充值费用和日志边界',
          summary:
            '以下信息来自 OpenRouter 官方 FAQ；模型价格、provider 路由和免费模型限速会变化，生产调用应固定隐私与成本策略。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: '价格结构',
              value:
                '模型推理按 provider 公布价格透传、不额外加价；购买 credits 收取 5.5% 费用且最低 $0.80，crypto 充值费为 5%。',
            },
            {
              label: '免费与 BYOK',
              value:
                '未购买至少 $10 credits 时，免费模型合计通常限制为每天 50 次；BYOK 每月前 100 万请求免费，之后收取相应模型 OpenRouter 成本的 5%。',
            },
            {
              label: '隐私边界',
              value:
                '默认仅记录时间、模型和 token 数等 metadata，不记录 prompt/completion；请求仍会发送给模型 provider，隐私路由不满足设置时会直接报错。',
            },
          ],
          sources: [{ label: 'OpenRouter 官方 FAQ', href: 'https://openrouter.ai/docs/faq' }],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Pass-through model pricing, credit fees, and logging boundaries',
          summary:
            'These facts come from the OpenRouter FAQ. Model prices, provider routing, and free-model limits change, so production calls should fix explicit privacy and cost policies.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Pricing structure',
              value:
                'Inference uses provider list prices without markup; credit purchases carry a 5.5% fee with a $0.80 minimum, while crypto payments carry a 5% fee.',
            },
            {
              label: 'Free and BYOK',
              value:
                'Without at least $10 of purchased credits, free models are generally limited to 50 requests per day total; the first one million BYOK requests per month are free, followed by a 5% fee.',
            },
            {
              label: 'Privacy boundary',
              value:
                'By default OpenRouter logs metadata rather than prompts or completions; requests still go to a model provider, and calls fail when available routes cannot meet account privacy settings.',
            },
          ],
          sources: [{ label: 'Official OpenRouter FAQ', href: 'https://openrouter.ai/docs/faq' }],
        };
  }

  if (key === 'grammarly') {
    return isChinese
      ? {
          label: '官方事实快照',
          title: 'Pro 价格、生成提示额度和内容控制',
          summary:
            '以下信息来自 Grammarly 官方支持与 Trust Center；产品正并入 Superhuman 套件，购买前应核对当前结账页与账号类型。',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Pro 价格',
              value: 'Grammarly Pro 为 $30/月、$60/季度或 $144/年（平均 $12/月），最多支持 149 个席位。',
            },
            {
              label: '生成式提示',
              value:
                'Free 每月 100 prompts，Premium 每月 1,000，Pro/Plus/Business/Education 每月 2,000；额度用尽不影响普通下划线写作建议。',
            },
            {
              label: '内容与训练',
              value:
                'Grammarly 不出售用户内容；可关闭 Product Improvement and Training。保存在 Grammarly Editor 的文档会持续存储到用户删除文档或账号。',
            },
          ],
          sources: [
            {
              label: 'Grammarly Pro 价格',
              href: 'https://support.grammarly.com/hc/en-us/articles/115000090011-How-much-does-Grammarly-Pro-cost',
            },
            {
              label: '生成式提示额度',
              href: 'https://support.grammarly.com/hc/en-us/articles/17776038294285-Error-message-You-re-out-of-prompts',
            },
            { label: 'Trust Center', href: 'https://www.grammarly.com/trust' },
          ],
        }
      : {
          label: 'Official fact snapshot',
          title: 'Pro pricing, generative prompt limits, and content controls',
          summary:
            'These facts come from Grammarly support and its Trust Center. The product is joining the Superhuman suite, so verify the current checkout and account type before buying.',
          checkedAt: '2026-08-03',
          facts: [
            {
              label: 'Pro pricing',
              value:
                'Grammarly Pro costs $30 monthly, $60 quarterly, or $144 annually ($12 monthly average) and supports up to 149 seats.',
            },
            {
              label: 'Generative prompts',
              value:
                'Free includes 100 prompts monthly, Premium 1,000, and Pro, Plus, Business, and Education 2,000; exhausting prompts does not disable standard underlined writing suggestions.',
            },
            {
              label: 'Content and training',
              value:
                'Grammarly does not sell user content and offers a Product Improvement and Training opt-out; Editor documents remain stored until the document or account is deleted.',
            },
          ],
          sources: [
            {
              label: 'Grammarly Pro pricing',
              href: 'https://support.grammarly.com/hc/en-us/articles/115000090011-How-much-does-Grammarly-Pro-cost',
            },
            {
              label: 'Generative prompt limits',
              href: 'https://support.grammarly.com/hc/en-us/articles/17776038294285-Error-message-You-re-out-of-prompts',
            },
            { label: 'Trust Center', href: 'https://www.grammarly.com/trust' },
          ],
        };
  }

  return null;
}

function getPriorityToolFallbackDetail(websiteName: string, locale: string) {
  const profile = PRIORITY_TOOL_FALLBACK_PROFILES[websiteName.toLowerCase()];
  const evidence = getPriorityToolOfficialEvidence(websiteName, locale);
  const compactEvidence = PRIORITY_TOOL_EVIDENCE[websiteName.toLowerCase()];
  const searchIntent = getPriorityToolSearchIntent(websiteName, locale);

  if (!profile || (!evidence && !compactEvidence)) return null;

  const compactLimitation = compactEvidence
    ? locale === 'cn'
      ? compactEvidence.limitation.zh
      : compactEvidence.limitation.en
    : '';
  const summary = searchIntent?.summary || evidence?.summary || compactLimitation;
  const details = evidence?.facts.map((fact) => `${fact.label}: ${fact.value}`) || [compactLimitation];

  return {
    categoryName: profile.categoryName,
    collectionTime: evidence?.checkedAt || compactEvidence?.checkedAt || '',
    content: summary,
    detail: [summary, ...details].filter(Boolean).join('\n\n'),
    imageUrl: '',
    name: websiteName.toLowerCase(),
    starRating: 0,
    tagName: profile.tagName,
    thumbnailUrl: '',
    title: profile.title,
    url: profile.url,
    websiteData: '',
  };
}

function getPriorityToolSearchIntent(websiteName: string, locale: string): PriorityToolSearchIntent | null {
  const isChinese = locale === 'cn' || locale === 'tw';
  const key = websiteName.toLowerCase();

  if (key === 'fathom') {
    return isChinese
      ? {
          metadataTitle: 'Fathom AI 会议助手：功能、价格与限制',
          metadataDescription:
            '了解 Fathom 的会议转录、AI 摘要、行动项和会后跟进能力，并比较会议兼容性、团队协作、价格限制与数据处理风险。',
          label: '会议助手判断重点',
          summary: '判断 Fathom 的关键不是转录文本看起来多完整，而是它能否减少会后整理、行动项确认和团队跟进成本。',
          checkpoints: [
            '转录、摘要和行动项是否准确',
            '会议平台、分享和协作流程是否匹配',
            '免费额度、导出与隐私边界是否可接受',
          ],
        }
      : {
          metadataTitle: 'Fathom AI Meeting Assistant: Features, Pricing & Limits',
          metadataDescription:
            'Review Fathom for meeting transcription, AI summaries, action items, and follow-through, including compatibility, team workflow, pricing limits, and data risks.',
          label: 'Meeting assistant decision',
          summary:
            'The real test for Fathom is not whether the transcript looks polished, but whether it reduces post-meeting cleanup, action-item tracking, and team follow-through.',
          checkpoints: [
            'Transcription, summaries, and action-item accuracy',
            'Meeting compatibility, sharing, and team workflow',
            'Free limits, exports, and data-handling boundaries',
          ],
        };
  }

  if (key === 'lindy') {
    return isChinese
      ? {
          metadataTitle: 'Lindy AI Agent：功能、工作流、价格与限制',
          metadataDescription:
            '了解 Lindy 如何构建 AI Agent 和自动化工作流，并重点比较集成范围、人工确认、运行额度、失败处理与适用团队。',
          label: 'AI Agent 判断重点',
          summary: '评估 Lindy 时，应先确认它能否稳定执行你的真实流程，而不是只看 Agent 演示是否顺畅。',
          checkpoints: [
            '触发器、集成和多步骤流程是否覆盖需求',
            '人工确认、权限和失败重试是否可控',
            '运行额度与长期维护成本是否合理',
          ],
        }
      : {
          metadataTitle: 'Lindy AI Agent: Features, Workflows, Pricing & Limits',
          metadataDescription:
            'Review Lindy for AI agents and workflow automation, focusing on integrations, human approval, usage limits, failure handling, and the teams it fits best.',
          label: 'AI agent decision',
          summary:
            'Evaluate Lindy on whether it can execute a real workflow reliably, not just whether the agent demo looks smooth.',
          checkpoints: [
            'Trigger, integration, and multi-step workflow coverage',
            'Human approval, permissions, and failure recovery',
            'Usage limits and long-term maintenance cost',
          ],
        };
  }

  if (key === 'pipedream') {
    return isChinese
      ? {
          metadataTitle: 'Pipedream 自动化：触发器、workflow 与限制判断',
          metadataDescription:
            '评估 Pipedream 在工作流编排、触发器维护、失败重试和团队协作中的表现，重点对比集成覆盖、自动化稳定性、额度与升级门槛。',
          label: '自动化工作流判断重点',
          summary:
            '自动化工具的核心价值在于稳定执行真实流程，而不是“有很多模板”本身。先确认触发和失败重试是否可控，再决定是否继续扩展。',
          checkpoints: [
            '触发器、重试机制和中间状态是否可观测',
            '集成与鉴权变更对现有流程的影响是否可控',
            '任务额度、并发和运营成本是否可承受',
          ],
        }
      : {
          metadataTitle: 'Pipedream Automation: Triggers, Workflow Stability & Limits',
          metadataDescription:
            'Review Pipedream for workflow orchestration, trigger management, retry handling, and team execution, including integration coverage, reliability, usage quotas, and upgrade gates.',
          label: 'Automation workflow decision',
          summary:
            'The real value of automation tools is running real workflows reliably, not having many templates. Confirm trigger observability and retry behavior before committing.',
          checkpoints: [
            'Whether triggers, retries, and run state are observable',
            'Whether integration and auth changes can be handled without breaking flows',
            'Whether task quotas, concurrency, and cost fit your operations',
          ],
        };
  }

  if (key === 'chatgpt') {
    return isChinese
      ? {
          metadataTitle: 'ChatGPT 功能、价格、使用场景与限制',
          metadataDescription:
            '比较 ChatGPT 在写作、研究、代码、文件、语音和联网任务中的适用性，并了解套餐边界、隐私风险与什么时候应该选择替代工具。',
          label: '通用 AI 助手判断重点',
          summary: 'ChatGPT 覆盖面很广，但真正的选择标准是你的核心任务、需要的工具能力以及数据和套餐限制。',
          checkpoints: [
            '写作、研究、代码或多模态任务是否匹配',
            '文件、联网、语音和协作能力是否需要',
            '套餐限制、数据处理和替代方案是否可接受',
          ],
        }
      : {
          metadataTitle: 'ChatGPT Review: Features, Pricing, Use Cases & Limits',
          metadataDescription:
            'Compare ChatGPT for writing, research, coding, files, voice, and web tasks, including plan boundaries, privacy trade-offs, and when an alternative fits better.',
          label: 'General AI assistant decision',
          summary:
            'ChatGPT covers many workflows, but the right choice depends on your primary task, required tools, and acceptable plan and data boundaries.',
          checkpoints: [
            'Fit for writing, research, coding, or multimodal work',
            'Need for files, web access, voice, and collaboration',
            'Plan limits, data handling, and alternative options',
          ],
        };
  }

  if (key === 'cursor') {
    return isChinese
      ? {
          metadataTitle: 'Cursor AI 代码编辑器：功能、价格与限制',
          metadataDescription:
            '了解 Cursor 的代码库上下文、补全、Agent 修改和模型能力，并比较使用额度、代码审查、隐私设置与团队开发工作流。',
          label: 'AI 代码编辑器判断重点',
          summary: '评估 Cursor 时，应先看它能否理解并安全修改你的真实代码库，而不只是单次补全速度。',
          checkpoints: [
            '代码库上下文、补全和多文件修改能力',
            'Agent 变更、差异审查和人工确认流程',
            '模型选择、使用额度、隐私和团队边界',
          ],
        }
      : {
          metadataTitle: 'Cursor AI Code Editor: Features, Pricing & Limits',
          metadataDescription:
            'Review Cursor for codebase context, completion, agent edits, and model access, including usage limits, code review, privacy settings, and team workflows.',
          label: 'AI code editor decision',
          summary:
            'Evaluate Cursor on whether it can understand and safely change a real codebase, not only on single-line completion speed.',
          checkpoints: [
            'Codebase context, completion, and multi-file edits',
            'Agent changes, diff review, and human approval',
            'Model access, usage limits, privacy, and team boundaries',
          ],
        };
  }

  if (key === 'the-graph') {
    return isChinese
      ? {
          metadataTitle: 'The Graph：区块链数据、Subgraph、价格与限制',
          metadataDescription:
            '了解 The Graph 的 Subgraph、链上数据查询和开发者基础设施能力，并比较网络覆盖、查询方式、API 集成、价格和数据时效。',
          label: 'Web3 数据基础设施判断重点',
          summary: '评估 The Graph 时，应先确认它是否覆盖你的链和数据模型，以及查询结果能否稳定进入产品工作流。',
          checkpoints: [
            '链、协议和 Subgraph 覆盖是否匹配',
            '查询、API 和应用集成流程是否顺畅',
            '数据时效、配额、价格和运维边界',
          ],
        }
      : {
          metadataTitle: 'The Graph: Blockchain Data, Subgraphs, Pricing & Limits',
          metadataDescription:
            'Review The Graph for subgraphs, blockchain data queries, and developer infrastructure, including network coverage, APIs, pricing, freshness, and operational limits.',
          label: 'Web3 data infrastructure decision',
          summary:
            'Evaluate The Graph on whether it covers your chains and data model, and whether query results can reliably support a production application.',
          checkpoints: [
            'Chain, protocol, and subgraph coverage',
            'Query, API, and application integration workflow',
            'Data freshness, quotas, pricing, and operations',
          ],
        };
  }

  if (key === 'dune') {
    return isChinese
      ? {
          metadataTitle: 'Dune Analytics：SQL、仪表盘、价格与限制',
          metadataDescription:
            '了解 Dune 的链上 SQL 查询、仪表盘和社区数据能力，并比较数据覆盖、查询性能、刷新频率、导出、协作和价格限制。',
          label: '链上分析工作台判断重点',
          summary: '评估 Dune 时，应先看你能否把链上问题转成可复用查询和仪表盘，而不只是浏览现成图表。',
          checkpoints: [
            '链上数据覆盖和 SQL 查询能力',
            '仪表盘、刷新、导出与协作流程',
            '查询性能、额度、价格和数据解释风险',
          ],
        }
      : {
          metadataTitle: 'Dune Analytics: SQL, Dashboards, Pricing & Limits',
          metadataDescription:
            'Review Dune for on-chain SQL queries, dashboards, and community data, including coverage, query performance, refreshes, exports, collaboration, and pricing limits.',
          label: 'On-chain analytics workspace decision',
          summary:
            'Evaluate Dune on whether you can turn an on-chain question into a reusable query and dashboard, not only browse existing charts.',
          checkpoints: [
            'On-chain data coverage and SQL query workflow',
            'Dashboards, refreshes, exports, and collaboration',
            'Query performance, limits, pricing, and interpretation risk',
          ],
        };
  }

  return null;
}

export async function generateMetadata({
  params: { locale, websiteName },
}: {
  params: { locale: string; websiteName: string };
}): Promise<Metadata> {
  try {
    const rawDbTool = await getToolByName(websiteName);
    // Older imports can contain non-array JSON values; normalize at the page boundary
    // so an inconsistent record cannot take the entire public detail page down.
    const dbTool = rawDbTool
      ? {
          ...rawDbTool,
          tags: getStringArray(rawDbTool.tags),
          screenshots: getStringArray(rawDbTool.screenshots),
        }
      : null;
    const data =
      dbTool?.status === 'published'
        ? toolToDetailData(dbTool, locale)
        : (await getWebNavigationDetail(websiteName, locale)).data ||
          getPriorityToolFallbackDetail(websiteName, locale);

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
    const priorityIntent = getPriorityToolSearchIntent(websiteName, locale);
    const optimizedTitle = priorityIntent?.metadataTitle || generateToolTitle(toolTitle, toolCategory);
    const optimizedDescription =
      priorityIntent?.metadataDescription || generateToolDescription(toolTitle, toolDescription, toolCategory);

    // Generate canonical URL
    const canonicalUrl = generateLocalizedCanonicalUrl(`/ai/${websiteName}`, locale);

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
  } catch (error) {
    console.error('Tool detail metadata failed to render:', error);
    return {
      title: websiteName,
      description: 'AI tool profile',
      alternates: {
        canonical: generateLocalizedCanonicalUrl(`/ai/${websiteName}`, locale),
      },
    };
  }
}

export default async function Page({
  params: { websiteName, locale },
}: {
  params: { websiteName: string; locale: string };
}) {
  let failureStage = 'initialization';

  try {
    failureStage = 'translations';
    const t = await getTranslations('Startup.detail');
    const isChinese = locale === 'cn';
    failureStage = 'tool lookup';
    const rawDbTool = await getToolByName(websiteName);
    // Keep legacy imports from breaking the public page when JSON array fields are malformed.
    const dbTool = rawDbTool
      ? {
          ...rawDbTool,
          tags: getStringArray(rawDbTool.tags),
          screenshots: getStringArray(rawDbTool.screenshots),
        }
      : null;
    failureStage = 'tool projection';
    const data =
      dbTool?.status === 'published'
        ? toolToDetailData(dbTool, locale)
        : (await getWebNavigationDetail(websiteName, locale)).data ||
          getPriorityToolFallbackDetail(websiteName, locale);

    if (!data) notFound();

    const claimTool = dbTool as (typeof dbTool & DetailClaimSignals) | null;
    const prioritySearchIntent = getPriorityToolSearchIntent(websiteName, locale);
    const priorityOfficialEvidence = getPriorityToolOfficialEvidence(websiteName, locale);

    // Get current user
    failureStage = 'viewer lookup';
    let user = null;
    try {
      const supabase = await createClient();
      const authResult = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      user = authResult.data.user;
    } catch (error) {
      console.error('Tool detail viewer lookup failed; continuing anonymously:', { websiteName, error });
    }

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
    const fallbackTagSlugs = data.tagName
      ? data.tagName
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const tagSlugsForDisplay = dbTool?.tags && dbTool.tags.length > 0 ? dbTool.tags : fallbackTagSlugs;

    if (dbTool) {
      failureStage = 'taxonomy lookup';
      // Category and tags improve the detail page but must not hide it if a supporting query fails.
      if (dbTool.categoryId) {
        category = await getCategoryById(dbTool.categoryId).catch((error) => {
          console.error('Tool detail category lookup failed:', { websiteName, error });
          return null;
        });
      }

      if (tagSlugsForDisplay.length > 0) {
        tags = await getTagsBySlugs(tagSlugsForDisplay).catch((error) => {
          console.error('Tool detail tag lookup failed:', { websiteName, error });
          return [];
        });
      }
    }

    const getDisplayTagLabel = (tag: { slug: string; name: Record<string, string> }): string => {
      const localizedLabel = getTagLocalizedField(tag.name, locale).trim();

      if (localizedLabel) {
        return localizedLabel;
      }

      return humanizeTagSlug(tag.slug);
    };

    const displayTagLabels =
      tags.length > 0
        ? tags.map((tag) => getDisplayTagLabel(tag)).filter(Boolean)
        : tagSlugsForDisplay.map((tagSlug) => humanizeTagSlug(tagSlug)).filter(Boolean);

    if (toolId) {
      failureStage = 'engagement lookup';
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
    }

    // Generate SoftwareApplication schema for tool pages
    failureStage = 'detail signals';
    const toolUrl = generateLocalizedCanonicalUrl(`/ai/${websiteName}`, locale, BASE_URL);
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
        image: toolImageUrl.startsWith('http') ? toolImageUrl : `${BASE_URL}${toolImageUrl}`,
        url: toolUrl,
        officialUrl: data.url,
        datePublished: dbTool.createdAt?.toISOString?.(),
        dateModified: dbTool.updatedAt?.toISOString?.(),
      };

      softwareSchema = generateSoftwareSchema(toolMetadata);
    }

    // Generate BreadcrumbList schema for navigation hierarchy
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: generateLocalizedCanonicalUrl('/', locale, BASE_URL) },
      { name: 'AI Tools', url: generateLocalizedCanonicalUrl('/explore', locale, BASE_URL) },
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
    const ownerEmail = claimTool?.ownerEmail || '';
    const claimStatus = claimTool?.claimStatus || 'unclaimed';
    const claimedAt = claimTool?.claimedAt || '';
    const updatedAgeDays = getDaysSince(updatedAt);
    const recentlyCheckedLabel = isChinese ? '最近检查' : 'Recently checked';
    const updatedLabel = updatedAt
      ? new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(new Date(updatedAt))
      : recentlyCheckedLabel;
    let statusLabel = isChinese ? '已收录' : 'Listed';
    if (dbTool?.status === 'published') {
      statusLabel = isChinese ? '已公开' : 'Published';
    }
    let ratingLabel = isChinese ? '暂无评分' : 'No ratings yet';
    if (ratingStats.ratingCount > 0) {
      ratingLabel = `${ratingStats.averageRating.toFixed(1)} / 5`;
    }
    const claimLabel = getClaimLabel(claimStatus, locale);
    const claimTone = getClaimTone(claimStatus);
    let claimSummary = isChinese ? '尚未补充 owner 邮箱' : 'Owner email not set';
    if (ownerEmail) {
      claimSummary = isChinese ? `Owner 邮箱：${ownerEmail}` : `Owner email: ${ownerEmail}`;
    }
    const claimedAtLabel = claimedAt
      ? new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(new Date(claimedAt))
      : null;
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
      {
        label: isChinese ? '认领' : 'Claim',
        value: claimLabel,
        icon: ShieldCheck,
        tone: claimTone,
      },
    ];
    const commentPromptLabel = isChinese ? '可以直接点一个开头' : 'Start with one of these';
    const commentStarterPrompts = isChinese
      ? ['这款工具最适合什么场景？', '你会先收藏还是先去官网？', '和相似工具比，差异最明显在哪？']
      : [
          'What scenario is this tool best for?',
          'Would you save it first or open the official site?',
          'What stands out most versus similar tools?',
        ];
    let commentLabel = isChinese ? '去讨论' : 'Discuss';
    if (commentCount > 0) {
      commentLabel = `${commentCount} ${isChinese ? '条讨论' : 'comments'}`;
    }
    const categorySlug = category?.slug;
    const categoryGuideLink = getCategoryGuideLink(categorySlug, locale);
    const tagLabels =
      tags.length > 0
        ? tags.map((tag) => getDisplayTagLabel(tag)).filter(Boolean)
        : tagSlugsForDisplay.map((tagSlug) => humanizeTagSlug(tagSlug)).filter(Boolean);
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
    const editorialReviewStale = editorialReview?.reviewedAt
      ? (() => {
          const reviewedTime = new Date(editorialReview.reviewedAt).getTime();
          return Number.isFinite(reviewedTime) && Date.now() - reviewedTime >= 90 * 24 * 60 * 60 * 1000;
        })()
      : false;
    let editorialReviewerLabel = isChinese ? '复核人：待补充' : 'Reviewed by: pending';
    if (editorialReview) {
      editorialReviewerLabel = isChinese
        ? `复核人：${editorialReview.reviewedBy}`
        : `Reviewed by ${editorialReview.reviewedBy}`;
    }
    const freshnessSummary = decisionFreshnessSummary || getFreshnessSummary(updatedAt || null, locale);
    const pricingSummary = decisionPricingSummary || getPricingSummary(dbTool?.pricing, locale);
    const riskPoints: string[] = [];
    if (dbTool?.status !== 'published') {
      riskPoints.push(
        isChinese
          ? '条目还没有完全公开，功能、定价或截图可能还在补齐。'
          : 'The listing is not fully published yet, so features, pricing, or screenshots may still change.',
      );
    }
    if (updatedAgeDays !== null && updatedAgeDays > 90) {
      riskPoints.push(
        isChinese
          ? `最近更新已经是 ${updatedAgeDays} 天前，建议先确认官网是否仍在维护。`
          : `The latest update was ${updatedAgeDays} days ago, so it is worth confirming the site is still maintained.`,
      );
    }
    if (!ownerEmail && claimStatus === 'unclaimed') {
      riskPoints.push(
        isChinese
          ? '还没有 owner 信号，出问题时不一定能快速联系到工具方。'
          : 'There is no owner signal yet, so it may be harder to reach the team if something looks off.',
      );
    }
    if (dbTool?.pricing === 'free') {
      riskPoints.push(
        isChinese
          ? '免费版通常最容易验证价值，但也最容易碰到功能或额度限制。'
          : 'Free plans are easiest to try but also the first to hit feature or usage limits.',
      );
    } else if (dbTool?.pricing === 'freemium') {
      riskPoints.push(
        isChinese
          ? 'Freemium 往往能先试出价值，但真正工作流通常会在升级门槛处遇到限制。'
          : 'Freemium can validate value fast, but the real workflow often hits upgrade gates quickly.',
      );
    } else if (dbTool?.pricing === 'paid') {
      riskPoints.push(
        isChinese
          ? '付费工具最好结合试用和评论一起看，避免只看价格不看适配度。'
          : 'Paid tools should still be checked with trials and comments so you do not buy the wrong fit.',
      );
    }
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
    const marketDemand = getMarketDemandSummary({
      locale,
      viewCount: toolStats.viewCount,
      clickCount: toolStats.clickCount,
    });
    const marketMomentum = getMarketMomentumSummary({
      locale,
      updatedAt,
      screenshotCount,
      hasVideo,
    });
    const comparisonSummary = getComparisonSummary(categorySlug, locale);
    const compareAxes = decisionCompareAxesOverride.length > 0 ? decisionCompareAxesOverride : [comparisonSummary];
    const nextComparisonLinks = getNextComparisonLinks(categorySlug, dbTool?.tags || [], locale);
    const checkedAt = editorialReview?.reviewedAt || null;
    let checkedAtLabel = isChinese ? '待补复核时间' : 'Review time pending';
    if (checkedAt) {
      checkedAtLabel = new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(checkedAt));
    }
    failureStage = 'page render';
    let detailSignalCards: Array<{ label: string; value: string; note: string }>;
    const websiteNameKey = websiteName.toLowerCase();
    const priorityEvidence = PRIORITY_TOOL_EVIDENCE[websiteNameKey] || null;
    if (websiteNameKey === 'fathom') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看会议记录额度和团队席位' : 'Check meeting limits and team seats first',
          note: isChinese
            ? '先判断免费层能不能覆盖你的会议量，再看团队协作是否需要升级。'
            : 'Check whether the free tier covers your meeting volume before worrying about team upgrades.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese
            ? '看转写和跟进功能是否持续更新'
            : 'Check whether transcription and follow-up still move forward',
          note: isChinese
            ? '如果会后流程和导出体验都没跟进，通常说明真实团队流程已经变弱。'
            : 'If the post-meeting workflow and exports are stale, the real team workflow may already be weakening.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认是否真能省会后整理时间' : 'Confirm it really saves cleanup time',
          note: isChinese
            ? '如果只是转写更漂亮，但不减少整理和跟进成本，就不算强价值。'
            : 'If transcription looks nicer but does not reduce cleanup or follow-up cost, the value is weak.',
        },
      ];
    } else if (websiteNameKey === 'pipedream') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看任务次数、workflow 限制' : 'Check task runs and workflow limits first',
          note: isChinese
            ? '先判断免费层能不能跑你的真实工作流，再看高级能力是否值得升级。'
            : 'Check whether the free tier can run your real workflow before you care about advanced upgrades.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese ? '看触发器和集成是否在更新' : 'Check whether triggers and integrations stay current',
          note: isChinese
            ? '如果集成说明和触发器文档久不更新，真实工作流通常会先出问题。'
            : 'If integration docs and trigger notes are stale, real workflows usually break first.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认稳定性和失败重试' : 'Confirm stability and retries first',
          note: isChinese
            ? '自动化工具只要不稳定，后面的工作流就会很难持续。'
            : 'If an automation tool is unstable, downstream workflows become hard to trust.',
        },
      ];
    } else if (websiteNameKey === 'lindy') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看执行次数与权限模型' : 'Check execution limits and permission model first',
          note: isChinese
            ? '先确认 AI 任务运行额度、是否可控的多步骤执行，再看高级能力。'
            : 'Check workflow execution quotas and permission controls before weighing advanced capabilities.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese
            ? '看触发器和执行链路是否持续维护'
            : 'Check whether trigger and execution pipelines are maintained',
          note: isChinese
            ? '当触发器和鉴权链路长期不更新时，自动化链路最容易积累沉没成本。'
            : 'When trigger and auth chains stay stale, automation usually accumulates hidden maintenance costs.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认人工介入与回滚路径' : 'Confirm human-in-the-loop and rollback flow',
          note: isChinese
            ? '有清晰的人工审查和回滚才算可持续的 Agent 编排。'
            : 'Agent automation needs dependable human review and rollback to stay trustworthy over time.',
        },
      ];
    } else if (websiteNameKey === 'chatgpt') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看额度和并行场景' : 'Check plan limits and parallel usage first',
          note: isChinese
            ? '先确认额度是否适配你真实写作、研究或协作节奏，再决定是否换到替代方案。'
            : 'Validate whether usage limits match your writing, research, and collaboration cadence before replacing with another option.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese ? '看官方更新与模型能力变化' : 'Track official updates and model capability changes',
          note: isChinese
            ? 'ChatGPT 的体验变化主要来自模型与策略更新，周期性复核很关键。'
            : 'ChatGPT value often shifts with model and policy updates, so periodic recheck is critical.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认替代门槛和数据边界' : 'Confirm migration cost and data boundaries first',
          note: isChinese
            ? '看清替代难度和数据留痕要求后再决定是否升级。'
            : 'Decision should depend on migration cost and data-handling requirements, not just feature headlines.',
        },
      ];
    } else if (websiteNameKey === 'cursor') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看套餐额度与项目规模' : 'Check plan limits against project scale',
          note: isChinese
            ? '先确认并发、上下文长度和项目规模是否足够，不要被单次补全体验带偏。'
            : 'Start by validating concurrency, context length, and team size before trusting only completion UX.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese
            ? '看规则提示、模型更新和协作链路'
            : 'Check rule hints, model updates, and collaboration flow',
          note: isChinese
            ? 'Cursor 的价值依赖稳定更新和代码变更闭环，长时间不更新会迅速出现漂移。'
            : 'Cursor value depends on steady updates and a stable editing loop, not just short-term demos.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认 diff 审核和回滚能力' : 'Verify diff review and rollback first',
          note: isChinese
            ? '有可审查的差异和回滚路径，才适合上生产代码库。'
            : 'Production code should only move forward with clear diff review and rollback options.',
        },
      ];
    } else if (websiteNameKey === 'the-graph') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看查询额度与长期成本' : 'Check query quotas and long-term costs first',
          note: isChinese
            ? '先确认主查询量是否可支撑你的频率和分析规模。'
            : 'Validate whether your expected query volume can be sustained over time.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese ? '看链上索引和 subgraph 覆盖' : 'Check chain indexing and subgraph coverage',
          note: isChinese
            ? '如果索引滞后，任何看板都可能偏离真实业务决策。'
            : 'If indexing is delayed, even polished dashboards can mislead business decisions.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认数据模型和时效风险' : 'Validate schema assumptions and freshness risk',
          note: isChinese
            ? '确认链上数据模型是否稳定，避免查询后期因接口变化失效。'
            : 'Confirm schema stability to avoid later breakage when query interfaces change.',
        },
      ];
    } else if (websiteNameKey === 'dune') {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看查询额度与查询延迟' : 'Check query quotas and query latency',
          note: isChinese
            ? '先确认工作流里的 SQL 频率和大查询频率，避免后续被配额限制断流。'
            : 'Validate SQL frequency and large-query cadence to avoid surprise quota throttling.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese ? '看刷新策略和刷新延迟' : 'Check refresh strategy and lag',
          note: isChinese
            ? '仪表盘看起来不够稳时，先看刷新周期和手工刷新路径。'
            : 'If dashboards look unstable, first check refresh scheduling and manual refresh steps.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先确认结果可解释性与复用成本' : 'Validate interpretability and reuse cost',
          note: isChinese
            ? '链上图表能否被团队复用更重要，别只看单张报表效果。'
            : 'Reusability and clarity across team members matters more than one-off charts.',
        },
      ];
    } else {
      detailSignalCards = [
        {
          label: isChinese ? '价格信号' : 'Pricing signal',
          value: isChinese ? '先看免费、试用和升级门槛' : 'Check free, trial, and upgrade thresholds first',
          note: isChinese
            ? '先知道门槛，再决定要不要继续深入比较。'
            : 'Know the threshold before deciding whether to keep comparing.',
        },
        {
          label: isChinese ? '更新信号' : 'Freshness signal',
          value: isChinese ? '先看最近检查日期' : 'Check the last-checked date first',
          note: isChinese
            ? '越新的页面越容易和真实使用体验对齐。'
            : 'Newer pages are more likely to match real-world usage and pricing changes.',
        },
        {
          label: isChinese ? '风险信号' : 'Risk signal',
          value: isChinese ? '先排除不适合的场景' : 'Filter out mismatched scenarios early',
          note: isChinese
            ? '不适合谁，往往比适合谁更能帮人做决定。'
            : 'Knowing who it is not for often helps decisions more than another list of fit cases.',
        },
      ];
    }
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
    const decisionCard = buildToolDecisionCard({
      audience: {
        bestFit: bestFitList,
        notIdealFor: notIdealForList,
      },
      community: {
        evidence: isChinese
          ? `${ratingStats.ratingCount} 条评分 · ${commentCount} 条讨论 · ${toolStats.favoriteCount} 次收藏`
          : `${ratingStats.ratingCount} ratings · ${commentCount} comments · ${toolStats.favoriteCount} saves`,
        label: communitySignal.label,
        summary: communitySignalWithOverride.summary,
      },
      comparison: {
        alternatives: nextComparisonLinks,
        axes: compareAxes,
        summary: comparisonSummary,
      },
      editorial: {
        reviewedAt: editorialReview?.reviewedAt || null,
        reviewedLabel: editorialReviewedLabel,
        reviewerLabel: editorialReviewerLabel,
        sourceUrl: editorialReview?.sourceUrl || null,
        stale: editorialReviewStale,
        summary: editorialReview?.summary || null,
        trustNote: editorialReview?.trustNote || null,
      },
      freshness: {
        label: updatedLabel,
        summary: freshnessSummary,
      },
      media: {
        assetCount: screenshotCount + (hasVideo ? 1 : 0) + (heroImage ? 1 : 0),
        evidence: mediaCoverage.evidence,
        label: mediaCoverage.label,
        summary: mediaCoverage.summary,
      },
      officialSite: {
        ...officialSite,
        summary: officialSiteSummary,
      },
      owner: {
        claimedAtLabel,
        label: claimLabel,
        summary: claimSummary,
        tone: claimTone,
      },
      pricing: {
        label: pricingLabel,
        summary: pricingSummary,
      },
      risks: riskPoints,
      verificationChecklist,
    });
    const decisionEvidenceMissingLabels = decisionCard.evidenceCompleteness.missing.map((key) =>
      getEvidenceRequirementLabel(key, locale),
    );
    const lastCheckedScheduleLabel = formatReviewScheduleDate(decisionCard.reviewSchedule.lastCheckedAt, false, locale);
    const nextFactReviewLabel = formatReviewScheduleDate(
      decisionCard.reviewSchedule.nextFactReviewAt,
      decisionCard.reviewSchedule.factReviewDue,
      locale,
    );
    const nextDecisionReviewLabel = formatReviewScheduleDate(
      decisionCard.reviewSchedule.nextDecisionReviewAt,
      decisionCard.reviewSchedule.decisionReviewDue,
      locale,
    );
    let commentSnapshotNote = isChinese
      ? '评论还少，欢迎先留一条真实体验。'
      : 'Comments are light, so the first real experience is especially useful.';
    if (commentCount > 0) {
      commentSnapshotNote = isChinese
        ? `已有 ${commentCount} 条讨论，可直接看真实反馈。`
        : `${commentCount} comments can surface real-world trade-offs quickly.`;
    }
    let discussionCountText = locale === 'cn' ? '还没有讨论' : 'No comments yet';
    if (commentCount > 0) {
      discussionCountText = `${commentCount} ${locale === 'cn' ? '条讨论' : 'comments'}`;
    }
    let nextActionText = locale === 'cn' ? '先认领再补更新' : 'Claim first, then add updates';
    if (claimStatus === 'claimed') {
      nextActionText = locale === 'cn' ? '认领后补更新说明' : 'Add update notes after claiming';
    }
    const trustSnapshotItems = [
      {
        label: isChinese ? '最近核查' : 'Last checked',
        value: checkedAtLabel,
        note: isChinese
          ? '这次复核不是单纯看页面文本，而是把官网、截图、评论和认领信号一起重新对齐。'
          : 'This review rechecks the official site, screenshots, comments, and claim signals together.',
      },
      {
        label: isChinese ? 'Owner 状态' : 'Owner status',
        value: claimLabel,
        note: claimSummary,
      },
      {
        label: isChinese ? '编辑复核' : 'Editorial review',
        value: editorialReviewedLabel || (isChinese ? '待补复核时间' : 'Review time pending'),
        note:
          editorialReview?.summary ||
          (isChinese ? '先把复核时间、复核说明和可信度备注补齐。' : 'Add review timing, notes, and trust context.'),
      },
      {
        label: isChinese ? '讨论活跃度' : 'Discussion',
        value: commentLabel,
        note: commentSnapshotNote,
      },
    ];
    let discussionPrompt = 'Leave the first real comment, then connect the owner claim and update notes.';
    if (locale === 'cn') {
      discussionPrompt =
        commentCount > 0
          ? `已有 ${commentCount} 条讨论，欢迎继续补充体验、限制和替代方案。`
          : '先留一条真实评论，再把 owner 认领和更新说明接上。';
    } else if (commentCount > 0) {
      discussionPrompt = `${commentCount} comments are already visible, so add your usage notes, limits, or alternatives.`;
    }
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
        <PageViewTracker toolId={toolId} />
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
                  <h1 className='max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>
                    {data.title}
                  </h1>
                  <p className='max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>{data.content}</p>
                </div>

                {prioritySearchIntent && (
                  <div className='rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-sm'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                      {prioritySearchIntent.label}
                    </p>
                    <p className='mt-2 max-w-3xl text-base font-semibold leading-7 text-slate-950'>
                      {prioritySearchIntent.summary}
                    </p>
                    <div className='mt-4 grid gap-3 md:grid-cols-3'>
                      {prioritySearchIntent.checkpoints.map((checkpoint) => (
                        <div key={checkpoint} className='flex gap-2 rounded-xl border border-white bg-white p-3'>
                          <CheckCircle className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                          <p className='text-sm leading-6 text-slate-700'>{checkpoint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {priorityOfficialEvidence && (
                  <section
                    data-official-evidence='true'
                    className='rounded-[18px] border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
                          {priorityOfficialEvidence.label}
                        </p>
                        <h2 className='mt-2 text-xl font-bold text-slate-950'>{priorityOfficialEvidence.title}</h2>
                      </div>
                      <span className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-emerald-200'>
                        {isChinese ? '核查于' : 'Checked'} {priorityOfficialEvidence.checkedAt}
                      </span>
                    </div>
                    <p className='mt-3 max-w-4xl text-sm leading-6 text-slate-600'>
                      {priorityOfficialEvidence.summary}
                    </p>
                    <div className='mt-4 grid gap-3 md:grid-cols-3'>
                      {priorityOfficialEvidence.facts.map((fact) => (
                        <div key={fact.label} className='rounded-xl border border-white bg-white p-4'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>{fact.label}</p>
                          <p className='mt-2 text-sm leading-6 text-slate-700'>{fact.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-emerald-200 pt-4'>
                      <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {isChinese ? '官方来源' : 'Official sources'}
                      </span>
                      {priorityOfficialEvidence.sources.map((source) => (
                        <a
                          key={source.href}
                          href={source.href}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100'
                        >
                          {source.label}
                          <ExternalLink className='size-3.5' />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

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

                <GuideEvidencePanel
                  locale={locale}
                  checkedAt={checkedAt || undefined}
                  scope={
                    isChinese
                      ? '这页优先说明这个工具到底适合什么真实工作流，并把最近核查、评分、讨论、收藏、点击和更新时间一起摆出来，而不是只展示营销式简介。'
                      : 'This page focuses on what real workflow the tool fits and surfaces last checked, ratings, discussions, saves, clicks, and freshness instead of only a marketing-style summary.'
                  }
                  decisionSteps={[
                    isChinese
                      ? '先判断这个工具是否真的对应你的当前工作流。'
                      : 'First decide whether this tool really matches your current workflow.',
                    isChinese
                      ? '再看价格、更新和截图，确认它是不是还能稳定工作。'
                      : 'Then check pricing, freshness, and screenshots to see whether it still works reliably.',
                    isChinese
                      ? '最后结合评论、认领和同类工具对比，决定是继续看官网还是换成更窄的候选。'
                      : 'Finally use comments, claims, and similar-tool comparisons to decide whether to open the official site or switch to a narrower candidate.',
                  ]}
                  items={[
                    {
                      label: isChinese ? '验证范围' : 'Checked scope',
                      value: isChinese
                        ? '最近核查、用途、评论、截图 + 互动'
                        : 'Last checked, use case, comments, screenshots + engagement',
                      note: isChinese
                        ? `当前 ${ratingStats.ratingCount} 条评分、${commentCount} 条讨论、${toolStats.favoriteCount} 次收藏，${checkedAtLabel} 已复核。`
                        : `${ratingStats.ratingCount} ratings, ${commentCount} comments, and ${toolStats.favoriteCount} saves are visible right now, last checked on ${checkedAtLabel}.`,
                    },
                    {
                      label: isChinese ? '索引策略' : 'Indexing strategy',
                      value: isChinese ? '详情页保留索引' : 'Tool detail kept indexable',
                      note: isChinese
                        ? '让 Google 更容易理解这个工具页的真实主题。'
                        : 'Helps Google better understand the real topic of the page.',
                    },
                    {
                      label: isChinese ? '下一步增强' : 'Next enrichment',
                      value: isChinese
                        ? '补真实使用场景、owner 认领、最近验证'
                        : 'Add real usage cases, owner claims, and recent verification',
                      note: isChinese
                        ? `最近更新时间 ${freshnessSummary}，继续把实际使用痕迹和认领信号放进页面。`
                        : `Freshness reads as ${freshnessSummary}, and the page should keep gaining usage and claim signals.`,
                    },
                  ]}
                  signalCards={detailSignalCards}
                />

                <div className='grid gap-3 md:grid-cols-3'>
                  {trustSnapshotItems.map((item) => (
                    <div key={item.label} className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{item.label}</p>
                      <p className='mt-2 text-lg font-semibold text-slate-950'>{item.value}</p>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{item.note}</p>
                    </div>
                  ))}
                </div>

                <div className='rounded-lg border border-cyan-100 bg-cyan-50/70 p-4 shadow-sm'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-cyan-900'>
                        {locale === 'cn' ? '把真实使用痕迹补进来' : 'Add real usage signals'}
                      </p>
                      <p className='mt-1 text-sm leading-6 text-cyan-900/80'>{discussionPrompt}</p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <a
                        href='#comments'
                        className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                      >
                        <MessageSquare className='size-4' />
                        {locale === 'cn' ? '去评论' : 'Jump to comments'}
                      </a>
                      <Link
                        href={`/${locale}/developer/listing`}
                        className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                      >
                        <ShieldCheck className='size-4' />
                        {locale === 'cn' ? '认领条目' : 'Claim listing'}
                      </Link>
                    </div>
                  </div>
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
                            <p className='mt-2 max-w-[12rem] text-xs leading-5 text-slate-500'>
                              {locale === 'cn'
                                ? '先收藏，之后可以回到收藏夹再对比。'
                                : 'Save first, then come back to compare later.'}
                            </p>
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
                          className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
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
                      className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'
                    >
                      {t('visitWebsite')} <ArrowUpRight className='size-4' />
                    </TrackableLink>
                  ) : (
                    <a
                      href={data.url}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'
                    >
                      {t('visitWebsite')} <ArrowUpRight className='size-4' />
                    </a>
                  )}
                  <a
                    href={`/${locale}/explore?search=${encodeURIComponent(data.title)}`}
                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100'
                  >
                    {isChinese ? '找相似工具' : 'Find similar tools'} <CircleArrowRight className='size-4' />
                  </a>
                  {/* Discussion anchor is now surfaced in the action panel above */}
                </div>
                <p className='max-w-3xl text-sm leading-6 text-slate-500'>
                  {locale === 'cn'
                    ? '最稳的下一步：先看官网，再拿相似工具和评论做对比。'
                    : 'Best next step: open the official site first, then compare similar tools and comments.'}
                </p>
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
                    <div key={fact.label} className='min-w-0 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200'>
                      <div className={`mb-3 inline-flex rounded-lg p-2 ${fact.tone}`}>
                        <fact.icon className='size-4' />
                      </div>
                      <p className='break-words text-xs font-medium uppercase text-slate-500'>{fact.label}</p>
                      <p className='mt-1 break-words text-sm font-semibold text-slate-950'>{fact.value}</p>
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
              {displayTagLabels.length > 0 ? (
                displayTagLabels.map((label) => (
                  <span
                    key={label}
                    className='max-w-full rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700'
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className='max-w-full rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600'>
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

              <section
                id='decision-card'
                data-tool-decision-card
                className='scroll-mt-28 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'
              >
                <div className='mb-5 flex items-center gap-3'>
                  <ShieldCheck className='size-6 text-cyan-600' />
                  <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                    {locale === 'cn' ? '选择判断卡' : 'Decision Card'}
                  </h2>
                </div>
                <p className='mb-5 max-w-3xl text-sm leading-6 text-slate-600'>
                  {locale === 'cn'
                    ? '先用这一张卡确认任务匹配、限制、证据和替代路径，再决定是否试用、付费或继续比较。'
                    : 'Use this one card to check fit, limits, evidence, and alternatives before you trial, pay, or keep comparing.'}
                </p>
                {priorityEvidence && !priorityOfficialEvidence ? (
                  <div
                    data-priority-tool-evidence
                    className='mb-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700'>
                          {locale === 'cn' ? '官方证据快照' : 'Official evidence snapshot'}
                        </p>
                        <h3 className='mt-1 text-base font-bold text-slate-950'>
                          {locale === 'cn' ? '先核验真实限制，再决定是否采用' : 'Verify the real limit before adopting'}
                        </h3>
                      </div>
                      <span className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600'>
                        {locale === 'cn' ? '核查于' : 'Checked'} {priorityEvidence.checkedAt}
                      </span>
                    </div>
                    <p className='mt-3 text-sm leading-6 text-slate-700'>
                      {locale === 'cn' ? priorityEvidence.limitation.zh : priorityEvidence.limitation.en}
                    </p>
                    <div className='mt-4 flex flex-wrap gap-2'>
                      {priorityEvidence.sources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex items-center rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-800 hover:border-cyan-300 hover:bg-cyan-100'
                        >
                          {source.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className='space-y-5'>
                  <div
                    data-decision-evidence-status
                    className='rounded-lg border border-slate-200 bg-slate-950 p-4 text-white sm:p-5'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-4'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-wide text-cyan-300'>
                          {locale === 'cn' ? '证据准备度' : 'Evidence readiness'}
                        </p>
                        <p className='mt-2 text-2xl font-bold'>{decisionCard.evidenceCompleteness.score}%</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          decisionCard.evidenceCompleteness.complete
                            ? 'bg-emerald-400/15 text-emerald-200'
                            : 'bg-amber-400/15 text-amber-200'
                        }`}
                      >
                        {decisionCard.evidenceCompleteness.complete
                          ? locale === 'cn'
                            ? '证据已齐'
                            : 'Evidence complete'
                          : locale === 'cn'
                            ? `待补 ${decisionEvidenceMissingLabels.length} 项`
                            : `${decisionEvidenceMissingLabels.length} gaps`}
                      </span>
                    </div>
                    <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                      <div className='rounded-lg bg-white/5 p-3'>
                        <p className='text-xs text-slate-400'>{locale === 'cn' ? '最近核查' : 'Last checked'}</p>
                        <p className='mt-1 text-sm font-semibold text-white'>{lastCheckedScheduleLabel}</p>
                      </div>
                      <div className='rounded-lg bg-white/5 p-3'>
                        <p className='text-xs text-slate-400'>
                          {locale === 'cn' ? '下次事实复查（30 天）' : 'Next fact check (30 days)'}
                        </p>
                        <p className='mt-1 text-sm font-semibold text-white'>{nextFactReviewLabel}</p>
                      </div>
                      <div className='rounded-lg bg-white/5 p-3'>
                        <p className='text-xs text-slate-400'>
                          {locale === 'cn' ? '下次判断复核（90 天）' : 'Next decision review (90 days)'}
                        </p>
                        <p className='mt-1 text-sm font-semibold text-white'>{nextDecisionReviewLabel}</p>
                      </div>
                    </div>
                    {decisionEvidenceMissingLabels.length > 0 && (
                      <div className='mt-4'>
                        <p className='text-xs font-semibold text-slate-300'>
                          {locale === 'cn' ? '公开判断仍需补齐' : 'Still needed for a complete decision'}
                        </p>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {decisionEvidenceMissingLabels.map((label) => (
                            <span key={label} className='rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200'>
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]'>
                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '先看这三个判断' : 'Start with these three signals'}
                      </p>
                      <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                        <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '官方网站状态' : 'Official website status'}
                          </p>
                          <p className='mt-2 text-base font-semibold text-slate-950'>
                            {decisionCard.officialSite.hostname}
                          </p>
                          <div className='mt-2 flex flex-wrap items-center gap-2'>
                            <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
                              {decisionCard.officialSite.secureLabel}
                            </span>
                            <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'>
                              {decisionCard.officialSite.statusLabel}
                            </span>
                          </div>
                          <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.officialSite.summary}</p>
                        </div>

                        <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '最近更新信息' : 'Recent update'}
                          </p>
                          <p className='mt-2 text-base font-semibold text-slate-950'>{decisionCard.freshness.label}</p>
                          <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.freshness.summary}</p>
                        </div>

                        <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? 'Owner 信号' : 'Owner signal'}
                          </p>
                          <p className='mt-2 text-base font-semibold text-slate-950'>{decisionCard.owner.label}</p>
                          <div className='mt-2 flex flex-wrap gap-2'>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${decisionCard.owner.tone}`}
                            >
                              {decisionCard.owner.label}
                            </span>
                            {decisionCard.owner.claimedAtLabel && (
                              <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'>
                                {isChinese
                                  ? `认领于 ${decisionCard.owner.claimedAtLabel}`
                                  : `Claimed ${decisionCard.owner.claimedAtLabel}`}
                              </span>
                            )}
                          </div>
                          <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.owner.summary}</p>
                        </div>

                        <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '定价快照' : 'Pricing snapshot'}
                          </p>
                          <p className='mt-2 text-base font-semibold text-slate-950'>{decisionCard.pricing.label}</p>
                          <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.pricing.summary}</p>
                        </div>

                        <div className='rounded-lg bg-white p-4 ring-1 ring-slate-200'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '风险与限制' : 'Risks and limits'}
                          </p>
                          <div className='mt-2 space-y-2'>
                            {(decisionCard.risks.length > 0
                              ? decisionCard.risks
                              : [isChinese ? '暂时没有明显风险信号。' : 'No strong risk signal right now.']
                            )
                              .slice(0, 2)
                              .map((item) => (
                                <p
                                  key={item}
                                  className='rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600'
                                >
                                  {item}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='grid gap-4'>
                      <div className='rounded-lg border border-slate-200 p-4'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '真实反馈信号' : 'User signal'}
                        </p>
                        <p className='mt-2 text-lg font-semibold text-slate-950'>{decisionCard.community.label}</p>
                        <p className='mt-2 text-xs font-medium text-slate-500'>{decisionCard.community.evidence}</p>
                        <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.community.summary}</p>
                      </div>

                      <div className='rounded-lg border border-slate-200 p-4'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '预览覆盖' : 'Preview coverage'}
                        </p>
                        <p className='mt-2 text-lg font-semibold text-slate-950'>{decisionCard.media.label}</p>
                        <p className='mt-2 text-xs font-medium text-slate-500'>{decisionCard.media.evidence}</p>
                        <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.media.summary}</p>
                      </div>

                      <div className='rounded-lg border border-slate-200 p-4'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          {locale === 'cn' ? '编辑复核' : 'Editorial review'}
                        </p>
                        <p className='mt-2 text-lg font-semibold text-slate-950'>
                          {decisionCard.editorial.reviewedLabel || (locale === 'cn' ? '待补复核' : 'Review pending')}
                        </p>
                        <p className='mt-1 text-xs font-medium text-slate-500'>
                          {decisionCard.editorial.reviewerLabel}
                        </p>
                        {!decisionCard.editorial.sourceUrl ? (
                          <p className='mt-2 text-sm leading-6 text-slate-600'>
                            {locale === 'cn'
                              ? '目前还没有该条目的编辑复核记录。你可以先提交评论反馈，再发起“请求更新”让官方信息可追溯。'
                              : 'No editorial review has been recorded yet. Please leave feedback first and request an update so we can bind source evidence.'}
                          </p>
                        ) : (
                          <>
                            {decisionCard.editorial.stale && (
                              <p className='mt-2 text-sm font-medium text-amber-700'>
                                {locale === 'cn'
                                  ? '该复核已超过 90 天，建议重新核查官网信息。'
                                  : 'This review is over 90 days old. Recheck the official source before relying on it.'}
                              </p>
                            )}
                            {decisionCard.editorial.summary && (
                              <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.editorial.summary}</p>
                            )}
                            {decisionCard.editorial.trustNote && (
                              <p className='mt-2 text-sm leading-6 text-slate-600'>
                                {decisionCard.editorial.trustNote}
                              </p>
                            )}
                            <a
                              href={decisionCard.editorial.sourceUrl}
                              target='_blank'
                              rel='noreferrer'
                              className='mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:text-cyan-900'
                            >
                              {locale === 'cn' ? '查看证据来源' : 'View evidence source'}
                              <ExternalLink className='size-3.5' />
                            </a>
                          </>
                        )}
                      </div>
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
                      {decisionCard.comparison.axes.map((axis) => (
                        <span
                          key={axis}
                          className='inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-cyan-900 ring-1 ring-cyan-100'
                        >
                          {axis}
                        </span>
                      ))}
                    </div>
                    <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.comparison.summary}</p>
                  </div>

                  <div className='rounded-lg border border-slate-200 bg-white p-4 sm:p-5'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {locale === 'cn' ? '替代方案' : 'Alternatives'}
                    </p>
                    <p className='mt-2 text-lg font-semibold text-slate-950'>
                      {locale === 'cn'
                        ? '如果这款不合适，直接看更窄的比较页'
                        : 'If this is not the right fit, jump to narrower comparison pages'}
                    </p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {locale === 'cn'
                        ? '这组入口适合用来替换当前 shortlist，而不是继续围着同一个工具打转。'
                        : 'Use these pages to replace the current shortlist instead of circling the same tool.'}
                    </p>
                    <div className='mt-4 grid gap-3 lg:grid-cols-3'>
                      {decisionCard.comparison.alternatives.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-slate-100'
                        >
                          <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                          <p className='mt-2 text-sm leading-6 text-slate-600'>{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className='grid gap-4 lg:grid-cols-3'>
                    <div className='rounded-lg border border-slate-200 p-4'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '适合谁' : 'Best fit'}
                      </p>
                      <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-700'>
                        {decisionCard.audience.bestFit.map((item) => (
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
                        {decisionCard.audience.notIdealFor.map((item) => (
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
                        {decisionCard.verificationChecklist.map((item) => (
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

              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <div className='mb-5 flex items-center gap-3'>
                  <Sparkles className='size-6 text-emerald-600' />
                  <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
                    {locale === 'cn' ? '市场信号' : 'Market Signals'}
                  </h2>
                </div>
                <p className='max-w-3xl text-sm leading-6 text-slate-600'>
                  {locale === 'cn'
                    ? '这组信号不是在替你下结论，而是告诉你：这个条目现在是“值得继续看”，还是“先放一放”。'
                    : 'These signals do not make the decision for you; they tell you whether this listing deserves another look or can wait.'}
                </p>
                <div className='mt-5 grid gap-4 lg:grid-cols-3'>
                  <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-center gap-2'>
                      <Eye className='size-4 text-slate-500' />
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '需求热度' : 'Demand pulse'}
                      </p>
                    </div>
                    <p className='mt-3 text-lg font-semibold text-slate-950'>{marketDemand.label}</p>
                    <p className='mt-2 text-xs font-medium text-slate-500'>{marketDemand.evidence}</p>
                    <p className='mt-3 text-sm leading-6 text-slate-600'>{marketDemand.summary}</p>
                  </div>

                  <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-center gap-2'>
                      <Heart className='size-4 text-slate-500' />
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '真实互动' : 'Community traction'}
                      </p>
                    </div>
                    <p className='mt-3 text-lg font-semibold text-slate-950'>{decisionCard.community.label}</p>
                    <p className='mt-2 text-xs font-medium text-slate-500'>{decisionCard.community.evidence}</p>
                    <p className='mt-3 text-sm leading-6 text-slate-600'>{decisionCard.community.summary}</p>
                  </div>

                  <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-center gap-2'>
                      <CalendarDays className='size-4 text-slate-500' />
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '维护节奏' : 'Maintenance rhythm'}
                      </p>
                    </div>
                    <p className='mt-3 text-lg font-semibold text-slate-950'>{marketMomentum.label}</p>
                    <p className='mt-2 text-xs font-medium text-slate-500'>{marketMomentum.evidence}</p>
                    <p className='mt-3 text-sm leading-6 text-slate-600'>{marketMomentum.summary}</p>
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
                    tagSlugs={tagSlugsForDisplay}
                    tagLabels={tagLabels}
                  />
                  <div className='my-14 flex items-center gap-3 lg:my-16'>
                    <span className='h-px flex-1 bg-slate-200' />
                    <span className='whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>
                      {locale === 'cn' ? '对比后继续看真实反馈' : 'Compare first, then read real feedback'}
                    </span>
                    <span className='h-px flex-1 bg-slate-200' />
                  </div>
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
                    <dd className='text-right font-semibold text-slate-950'>{decisionCard.officialSite.hostname}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>{locale === 'cn' ? '链接安全' : 'Connection'}</dt>
                    <dd className='font-semibold text-slate-950'>{decisionCard.officialSite.secureLabel}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>{locale === 'cn' ? '定价' : 'Pricing'}</dt>
                    <dd className='font-semibold text-slate-950'>{decisionCard.pricing.label}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>{locale === 'cn' ? '分类' : 'Category'}</dt>
                    <dd className='text-right font-semibold text-slate-950'>{categoryName}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>{locale === 'cn' ? '状态' : 'Status'}</dt>
                    <dd className='font-semibold text-emerald-700'>{statusLabel}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>{locale === 'cn' ? '最近更新' : 'Last update'}</dt>
                    <dd className='text-right font-semibold text-slate-950'>{updatedLabel}</dd>
                  </div>
                </dl>
                <p className='mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600'>
                  {locale === 'cn'
                    ? '如果还在犹豫，先收藏，再去看 2 个相似工具。'
                    : 'If you are still unsure, save it first, then review two similar tools.'}
                </p>
                <p className='mt-2 text-xs leading-5 text-slate-500'>
                  {locale === 'cn'
                    ? '收藏后回访，比较会轻松很多。'
                    : 'Saving it now makes the later comparison much easier.'}
                </p>
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
                  <ToolFeedbackBar toolId={toolId} userId={user?.id} locale={locale} />
                </div>
              )}
            </aside>
          </div>

          {toolId && (
            <section id='comments' className='mx-auto mt-20 max-w-7xl scroll-mt-32 px-4 pb-12 lg:mt-24 lg:px-6'>
              <Separator className='mb-10 border-t border-slate-200' />
              <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='max-w-2xl'>
                    <h3 className='text-base font-semibold text-slate-900'>
                      {locale === 'cn'
                        ? '先看官网，再回来写真实反馈'
                        : 'Open the official site, then come back with real feedback'}
                    </h3>
                    <p className='mt-1 text-sm leading-6 text-slate-600'>
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
                        className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                      >
                        {locale === 'cn' ? '登录后收藏、评论并关注更新' : 'Log in to save, comment, and follow updates'}
                      </Link>
                    )}
                  </div>
                </div>
                <div className='mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3'>
                  <div className='rounded-lg bg-slate-50 p-4'>
                    <p className='text-sm font-semibold text-slate-950'>
                      {locale === 'cn' ? '先看官网和相似工具' : 'Start with the official site and similar tools'}
                    </p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {locale === 'cn'
                        ? '先确认产品真的解决你的任务，再回来留下反馈。'
                        : 'Confirm the product really solves the job before you leave feedback.'}
                    </p>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-4'>
                    <p className='text-sm font-semibold text-slate-950'>
                      {locale === 'cn' ? '如果这是你的工具' : 'If this is your tool'}
                    </p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {locale === 'cn'
                        ? '先认领条目，再补评论、官网链接和最新更新说明。'
                        : 'Claim the listing first, then add comments, the official link, and the latest update notes.'}
                    </p>
                    <Link
                      href={`/${locale}/developer/listing?intent=claim`}
                      className='mt-3 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                    >
                      {locale === 'cn' ? '去认领条目' : 'Claim listing'}
                    </Link>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-4'>
                    <p className='text-sm font-semibold text-slate-950'>
                      {locale === 'cn' ? '如果你只是用户' : 'If you are a user'}
                    </p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>
                      {locale === 'cn'
                        ? '先留评论和真实体验，再回到相似工具和对比页继续筛选。'
                        : 'Leave a real comment, then return to similar tools and comparison pages to keep narrowing the shortlist.'}
                    </p>
                  </div>
                </div>
                <div className='mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900'>
                  {locale === 'cn'
                    ? '如果你发现价格、截图、文案或功能已经过时，先点右侧“请求更新”，再在评论里写清楚是哪一项需要修正。'
                    : 'If pricing, screenshots, copy, or features are stale, tap request update on the right, then leave a comment that says exactly what needs fixing.'}
                </div>
                <div className='mt-4 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                        {locale === 'cn' ? '当前处理状态' : 'Current status'}
                      </p>
                      <h4 className='mt-1 text-sm font-semibold text-slate-950'>
                        {locale === 'cn'
                          ? '先确认 owner，再用评论和更新请求补证据'
                          : 'Confirm the owner, then use comments and update requests to add evidence'}
                      </h4>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${claimTone}`}>{claimLabel}</span>
                  </div>
                  <div className='mt-3 grid gap-3 md:grid-cols-3'>
                    <div className='rounded-lg border border-white bg-white p-3'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '最近更新' : 'Last update'}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-slate-950'>{updatedLabel}</p>
                      <p className='mt-1 text-xs leading-5 text-slate-500'>
                        {locale === 'cn'
                          ? '如果时间久了，优先点“请求更新”。'
                          : 'If it is old, tap request update first.'}
                      </p>
                    </div>
                    <div className='rounded-lg border border-white bg-white p-3'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '讨论数量' : 'Discussion count'}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-slate-950'>{discussionCountText}</p>
                      <p className='mt-1 text-xs leading-5 text-slate-500'>
                        {locale === 'cn'
                          ? '先留一个真实体验，后面的人会更容易判断。'
                          : 'Leave one real usage note first to help the next visitor judge faster.'}
                      </p>
                    </div>
                    <div className='rounded-lg border border-white bg-white p-3'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {locale === 'cn' ? '下一步动作' : 'Next action'}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-slate-950'>{nextActionText}</p>
                      <p className='mt-1 text-xs leading-5 text-slate-500'>
                        {locale === 'cn'
                          ? '把 owner、更新请求和评论串起来，页面才会越来越厚。'
                          : 'Connect owner, update requests, and comments so the page keeps getting richer.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='mt-6'>
                  <CommentList
                    toolId={toolId}
                    currentUserId={user?.id}
                    locale={locale}
                    promptLabel={commentPromptLabel}
                    starterPrompts={[
                      ...(locale === 'cn' || locale === 'tw'
                        ? ['这页哪一项需要更新？', '价格 / 截图 / 文案哪里不准确？', '你实际用下来最需要补什么？']
                        : [
                            'What on this page needs updating?',
                            'Which part is wrong: pricing, screenshots, or copy?',
                            'What should we add from your real use?',
                          ]),
                      ...commentStarterPrompts,
                    ]}
                    placeholder={
                      locale === 'cn'
                        ? '说说你的真实使用体验，比如适合什么场景、有什么优点或注意点。'
                        : 'Tell us your real experience: best use cases, strengths, or anything to watch out for.'
                    }
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Tool detail page failed to render:', { websiteName, failureStage, error });
    return (
      <div className='mx-auto max-w-5xl px-4 py-12 lg:px-0' data-detail-failure-stage={failureStage}>
        <section className='rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>AI tool profile</p>
          <h1 className='mt-2 text-3xl font-bold text-slate-950'>This tool page is temporarily unavailable</h1>
          <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-600'>
            The listing could not finish loading right now, but you can still return to explore or search similar tools.
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href={`/${locale}/explore`}
              className='inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
            >
              Explore tools
            </Link>
            <Link
              href={`/${locale}/best-ai-tools`}
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-200 hover:text-cyan-700'
            >
              Back to rankings
            </Link>
          </div>
        </section>
      </div>
    );
  }
}
