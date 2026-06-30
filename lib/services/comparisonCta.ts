export interface ComparisonCta {
  compareHref?: string;
  compareLabel?: string;
}

export function getComparisonCtaFromTags(tags: string[] = [], locale = 'en'): ComparisonCta {
  const isChinese = locale === 'cn' || locale === 'tw';
  const tagSet = new Set(tags);
  const hasAnyTag = (candidates: string[]) => candidates.some((tag) => tagSet.has(tag));

  if (hasAnyTag(['sales', 'lead-generation', 'prospecting', 'sales-prospecting', 'outreach', 'cold-email', 'crm'])) {
    if (hasAnyTag(['lead-generation', 'enrichment', 'lead-enrichment', 'contact-data', 'intent-data'])) {
      return {
        compareHref: '/guides/ai-tools-for-lead-generation-comparison',
        compareLabel: isChinese ? '去比较获客工具' : 'Compare lead-gen tools',
      };
    }

    if (hasAnyTag(['prospecting', 'sales-prospecting', 'outreach', 'cold-email', 'personalization', 'sequencing'])) {
      return {
        compareHref: '/guides/ai-tools-for-sales-prospecting-comparison',
        compareLabel: isChinese ? '去比较拓客工具' : 'Compare prospecting tools',
      };
    }

    return {
      compareHref: '/guides/ai-tools-for-sales-comparison',
      compareLabel: isChinese ? '去比较销售工具' : 'Compare sales tools',
    };
  }

  if (hasAnyTag(['token-research', 'fundamentals', 'narrative', 'crypto-research', 'market-research'])) {
    return {
      compareHref: '/guides/ai-tools-for-token-research-comparison',
      compareLabel: isChinese ? '去比较代币研究工具' : 'Compare token-research tools',
    };
  }

  if (hasAnyTag(['agency', 'client-service', 'consultancy', 'service-team', 'studio'])) {
    return {
      compareHref: '/guides/ai-tools-for-agencies-comparison',
      compareLabel: isChinese ? '去比较代理工具' : 'Compare agency tools',
    };
  }

  if (hasAnyTag(['ecommerce', 'shopify', 'store', 'merchandising', 'checkout', 'cart', 'conversion'])) {
    return {
      compareHref: '/guides/ai-tools-for-ecommerce-comparison',
      compareLabel: isChinese ? '去比较电商工具' : 'Compare ecommerce tools',
    };
  }

  if (hasAnyTag(['small-business', 'small team', 'solopreneur', 'solo-founder', 'owner-operator', 'startup-ops'])) {
    return {
      compareHref: '/guides/ai-tools-for-small-business-comparison',
      compareLabel: isChinese ? '去比较小企业工具' : 'Compare small-business tools',
    };
  }

  if (hasAnyTag(['creator', 'content-creator', 'blogger', 'youtube', 'creator-workflow'])) {
    return {
      compareHref: '/guides/ai-tools-for-creators-comparison',
      compareLabel: isChinese ? '去比较创作者工具' : 'Compare creator tools',
    };
  }

  if (hasAnyTag(['wallet-tracking', 'wallet-monitoring', 'smart-money', 'address-analysis'])) {
    return {
      compareHref: '/guides/ai-tools-for-wallet-monitoring-comparison',
      compareLabel: isChinese ? '去比较钱包监控工具' : 'Compare wallet-monitoring tools',
    };
  }

  if (hasAnyTag(['protocol-analytics', 'defi-analytics', 'dex-analytics', 'on-chain-analytics'])) {
    return {
      compareHref: '/guides/ai-tools-for-protocol-analytics-comparison',
      compareLabel: isChinese ? '去比较协议分析工具' : 'Compare protocol-analytics tools',
    };
  }

  if (hasAnyTag(['web3', 'crypto', 'on-chain'])) {
    return {
      compareHref: '/guides/ai-tools-for-web3-comparison',
      compareLabel: isChinese ? '去比较 Web3 工具' : 'Compare Web3 tools',
    };
  }

  if (hasAnyTag(['observability', 'tracing', 'logs', 'monitoring', 'evals'])) {
    return {
      compareHref: '/guides/ai-tools-for-api-observability-comparison',
      compareLabel: isChinese ? '去比较可观测性工具' : 'Compare observability tools',
    };
  }

  if (hasAnyTag(['routing', 'gateway', 'llm-gateway', 'model-routing', 'api-layer'])) {
    return {
      compareHref: '/guides/ai-tools-for-model-routing-comparison',
      compareLabel: isChinese ? '去比较模型路由工具' : 'Compare model-routing tools',
    };
  }

  if (hasAnyTag(['automation', 'workflow', 'agents', 'background-jobs', 'orchestration'])) {
    return {
      compareHref: '/guides/ai-tools-for-automation-comparison',
      compareLabel: isChinese ? '去比较自动化工具' : 'Compare automation tools',
    };
  }

  if (hasAnyTag(['seo', 'keyword-research', 'content-seo', 'blog-seo', 'serp-research', 'search-intelligence'])) {
    return {
      compareHref: '/guides/ai-seo-tools-comparison',
      compareLabel: isChinese ? '去比较 AI SEO 工具' : 'Compare AI SEO tools',
    };
  }

  if (hasAnyTag(['research', 'source-search', 'evidence', 'fact-checking'])) {
    return {
      compareHref: '/guides/ai-tools-for-research-comparison',
      compareLabel: isChinese ? '去比较研究工具' : 'Compare research tools',
    };
  }

  if (hasAnyTag(['writing', 'copywriting', 'content-writing', 'blog-writing'])) {
    return {
      compareHref: '/guides/ai-writing-tools-comparison',
      compareLabel: isChinese ? '去比较 AI 写作工具' : 'Compare AI writing tools',
    };
  }

  if (hasAnyTag(['meeting-notes', 'transcription', 'note-taking', 'meetings', 'voice-notes'])) {
    return {
      compareHref: '/guides/ai-tools-for-meeting-notes-comparison',
      compareLabel: isChinese ? '去比较会议纪要工具' : 'Compare meeting-notes tools',
    };
  }

  if (hasAnyTag(['productivity', 'knowledge-management', 'personal-productivity'])) {
    return {
      compareHref: '/guides/ai-productivity-tools-comparison',
      compareLabel: isChinese ? '去比较生产力工具' : 'Compare productivity tools',
    };
  }

  return {};
}
