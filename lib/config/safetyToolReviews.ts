type Locale = 'cn' | 'en';

const REVIEWS = {
  'aigirl-best': {
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-12-06',
    disposition: 'archive',
    title: { en: 'AIGirl.best (archived listing)', cn: 'AIGirl.best（已归档）' },
    summary: {
      en: 'This historical adult-oriented image-generator listing is archived. Its current service, safeguards, operator details, and age controls could not be verified reliably.',
      cn: '这条成人导向图像生成器的历史记录已归档。目前无法可靠核验其服务状态、安全措施、运营主体和年龄限制。',
    },
    reason: {
      en: 'The former page used promotional claims without adequate current evidence and included themes that require stronger age and content-safety review. It is not eligible for discovery, comparison, or recommendation surfaces.',
      cn: '旧页面包含缺少当前证据的推广性表述，并涉及需要更严格年龄与内容安全审查的主题，因此不再进入发现、对比或推荐模块。',
    },
    next: {
      en: 'No user action is recommended. The record remains only for internal audit continuity and may be reconsidered only after operator, age-gating, consent, moderation, and data-handling evidence is independently verified.',
      cn: '本页不建议用户采取任何操作。记录仅用于内部审计连续性；只有在运营主体、年龄门槛、同意机制、内容治理和数据处理证据得到独立核验后，才可能重新评估。',
    },
    sources: [],
  },
  'anime-girl-studio': {
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-10-06',
    disposition: 'monitor',
    title: { en: 'AI Anime Studio (scope under review)', cn: 'AI Anime Studio（范围观察中）' },
    summary: {
      en: 'The current official site presents a general anime image, text, and study assistant. The older listing described an NSFW product scope that is not supported by the current public homepage.',
      cn: '当前官网将其定位为普通动漫图像、文本和学习辅助工具；旧记录中的 NSFW 产品范围未得到当前公开首页支持。',
    },
    reason: {
      en: 'The scope correction is recorded, but independent adoption, output quality, commercial-use rights, data handling, and safety controls remain unverified. The page is withheld from search and recommendations until those checks are complete.',
      cn: '对象范围已经纠正，但独立采用情况、输出质量、商业使用权、数据处理和安全措施仍未核验。在这些检查完成前，页面暂不进入搜索和推荐。',
    },
    next: {
      en: 'If reviewed again, verify generation results with non-sensitive prompts, current plan limits, upload retention, commercial rights, and age/content controls before considering index release.',
      cn: '后续复核时，应使用非敏感提示词验证生成结果，并核对当前套餐限制、上传内容留存、商业使用权以及年龄和内容控制，再决定是否开放索引。',
    },
    sources: [{ label: 'AI Anime Studio official site', url: 'https://animegirl.studio/' }],
  },
  undressing_ai: {
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-12-06',
    disposition: 'archive',
    title: { en: 'Undressing AI (excluded)', cn: 'Undressing AI（已排除）' },
    summary: {
      en: 'This historical listing describes a nudification service that transforms an uploaded photograph into synthetic intimate imagery. It is excluded from AI Best Tool discovery and recommendation surfaces.',
      cn: '这条历史记录描述的是把上传照片转换为合成私密影像的裸化服务，已从 AI Best Tool 的发现和推荐模块中排除。',
    },
    reason: {
      en: 'This product category creates a material risk of non-consensual intimate imagery, privacy abuse, and harm to depicted people. Vendor claims cannot establish that every uploaded subject consented.',
      cn: '此类产品存在制造未经同意私密影像、侵犯隐私并伤害被摄者的实质风险。产品方声明无法证明每一位被上传的主体都已同意。',
    },
    next: {
      en: 'AI Best Tool does not provide a usage link, ranking, alternatives, or operational guidance for this record. It is retained only as an auditable exclusion decision.',
      cn: 'AI Best Tool 不为该记录提供使用入口、排名、替代推荐或操作指导；仅保留可审计的排除决定。',
    },
    sources: [
      {
        label: 'Research on AI nudification application risks',
        url: 'https://arxiv.org/abs/2411.09751',
      },
    ],
  },
} as const;

export type SafetyToolSlug = keyof typeof REVIEWS;
export const SAFETY_TOOL_SLUGS = Object.keys(REVIEWS) as SafetyToolSlug[];

export function getSafetyToolReview(slug: string, locale: string) {
  if (!Object.prototype.hasOwnProperty.call(REVIEWS, slug)) return null;
  const review = REVIEWS[slug as SafetyToolSlug];
  const language: Locale = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  return {
    checkedAt: review.checkedAt,
    nextReviewDate: review.nextReviewDate,
    disposition: review.disposition,
    title: review.title[language],
    content: review.summary[language],
    reason: review.reason[language],
    next: review.next[language],
    sources: review.sources,
    detail: [
      `## ${language === 'cn' ? '处置原因' : 'Why this record is restricted'}`,
      review.reason[language],
      `## ${language === 'cn' ? '后续处理' : 'What happens next'}`,
      review.next[language],
    ].join('\n\n'),
  };
}

export function applySafetyToolReview<
  T extends { name: string; title?: string; content: string; detail?: string },
>(row: T, locale: string): T {
  const review = getSafetyToolReview(row.name, locale);
  if (!review) return row;
  return {
    ...row,
    ...(typeof row.title === 'string' ? { title: review.title } : {}),
    content: review.content,
    ...(typeof row.detail === 'string' ? { detail: review.detail } : {}),
  };
}

export default REVIEWS;
