import { Metadata } from 'next';

import { BASE_URL } from '@/lib/env';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';
import { getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { SortBy } from '@/lib/services/tools';

import CategoryContent from './CategoryContent';

export const revalidate = 3600;

interface CategoryPageProps {
  params: { locale: string; slug: string };
  searchParams?: {
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
}

type CategoryMetadataProfile = {
  title: string;
  description: string;
};

const CATEGORY_METADATA_PROFILES: Record<string, { en: CategoryMetadataProfile; cn: CategoryMetadataProfile }> = {
  research: {
    en: {
      title: 'AI Research Tools Directory: Search, Citations & Evidence',
      description:
        'Compare AI research tools for discovery, citations, literature review, and evidence checking, with use cases, limits, pricing, and review signals.',
    },
    cn: {
      title: 'AI 研究工具目录：搜索、引用与证据整理 | AI Best Tool',
      description:
        '比较 AI 研究工具的资料发现、引用追踪、文献整理和证据核对能力，查看适用场景、限制、价格与最近验证信息。',
    },
  },
  productivity: {
    en: {
      title: 'AI Productivity Tools: Meetings, Tasks & Team Workflows',
      description:
        'Compare AI productivity tools for meetings, notes, scheduling, tasks, and team workflows, including pricing, collaboration limits, freshness, and real usage signals.',
    },
    cn: {
      title: 'AI 生产力工具：会议、任务与团队工作流 | AI Best Tool',
      description:
        '比较会议纪要、日程、任务管理和团队协作类 AI 工具，查看价格、席位限制、工作流适配、最近更新和真实使用信号。',
    },
  },
  automation: {
    en: {
      title: 'AI Automation Tools: Triggers, Workflows & Reliability',
      description:
        'Compare AI automation tools by triggers, integrations, branching, retries, logs, permissions, pricing, and long-term workflow reliability.',
    },
    cn: {
      title: 'AI 自动化工具：触发器、工作流与可靠性 | AI Best Tool',
      description:
        '按触发器、集成、条件分支、失败重试、日志、权限和价格比较 AI 自动化工具，判断真实生产工作流是否可靠。',
    },
  },
  web3: {
    en: {
      title: 'Web3 AI Tools: On-Chain Research, Data & Monitoring',
      description:
        'Compare Web3 tools for on-chain research, protocol data, wallet monitoring, dashboards, and developer infrastructure, with coverage, pricing, freshness, and risk signals.',
    },
    cn: {
      title: 'Web3 AI 工具：链上研究、数据与监控 | AI Best Tool',
      description:
        '比较链上研究、协议数据、钱包监控、仪表盘和开发者基础设施工具，查看覆盖范围、价格、数据时效和风险信号。',
    },
  },
  voice: {
    en: {
      title: 'AI Voice Tools: Transcription, Speech & Audio Workflows',
      description:
        'Compare AI voice tools for transcription, speech generation, meetings, podcasts, and audio workflows, including language support, exports, pricing, and quality risks.',
    },
    cn: {
      title: 'AI 语音工具：转录、语音生成与音频工作流 | AI Best Tool',
      description: '比较会议转录、语音生成、播客和音频工作流工具，查看语言支持、导出能力、价格、音质和生产使用风险。',
    },
  },
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug, true);

  if (!category) {
    return {
      title: 'AI Tools Category | AI Best Tool',
      alternates: {
        canonical: generateLocalizedCanonicalUrl(`/categories/${params.slug}`, params.locale, BASE_URL),
      },
    };
  }

  const name = getLocalizedField(category.name, params.locale);
  const description =
    getLocalizedField(category.description, params.locale) ||
    `Discover the best ${name} AI tools. Browse latest, popular, and top-rated tools in the AI Best Tool directory.`;
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const profile = CATEGORY_METADATA_PROFILES[String(category.slug)]?.[isChinese ? 'cn' : 'en'];
  const title = profile?.title || `Best ${name} AI Tools | AI Best Tool`;
  const metadataDescription = profile?.description || description;

  return {
    title,
    description: metadataDescription,
    alternates: {
      canonical: generateLocalizedCanonicalUrl(`/categories/${category.slug}`, params.locale, BASE_URL),
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  return <CategoryContent {...props} />;
}
