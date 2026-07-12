import CodeReviewComparisonPage, {
  generateMetadata as generateCodeReviewComparisonMetadata,
} from '../ai-tools-for-code-review-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateCodeReviewComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {CodeReviewComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 code review 信号，再继续判断是否需要审查、质量门禁和团队工作流。'
            : 'This page looks at verifiable code review signals first, then helps you decide whether review, quality gates, and team workflow support are needed.'
        }
        items={[
          {
            label: isChinese ? '审查深度' : 'Review depth',
            value: isChinese ? '是否能看出真实问题' : 'Can it surface real issues',
            note: isChinese
              ? '代码审查不只是找风格问题，更要看是否抓得住风险。'
              : 'Code review is about more than style; it must catch real risk.',
          },
          {
            label: isChinese ? '工作流适配' : 'Workflow fit',
            value: isChinese ? '团队流程是否顺手' : 'Does it fit team flow',
            note: isChinese
              ? '如果不能融入 PR 流程，再聪明的功能也会闲置。'
              : 'If it does not fit the PR flow, even smart features go unused.',
          },
          {
            label: isChinese ? '长期门禁' : 'Long-term gating',
            value: isChinese ? '是否能做质量门槛' : 'Can it act as a quality gate',
            note: isChinese
              ? '真正能留下来的工具，往往是团队长期愿意依赖的门槛。'
              : 'The tools that stick become the quality gate teams rely on.',
          },
        ]}
      />
    </>
  );
}
