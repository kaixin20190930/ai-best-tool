import EvalsComparisonPage, {
  generateMetadata as generateEvalsComparisonMetadata,
} from '../ai-tools-for-evals-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateEvalsComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {EvalsComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 Evals 信号，再继续判断是否需要评估工作流、基准和质量回归追踪。'
            : 'This page looks at verifiable evals signals first, then helps you decide whether evaluation workflows, benchmarks, and regression tracking are needed.'
        }
        items={[
          {
            label: isChinese ? '评估覆盖' : 'Eval coverage',
            value: isChinese ? '是否能覆盖真实任务' : 'Does it cover real tasks',
            note: isChinese
              ? '没有真实任务覆盖，评估就会变成形式化检查。'
              : 'Without real task coverage, evals become formalities.',
          },
          {
            label: isChinese ? '回归追踪' : 'Regression tracking',
            value: isChinese ? '是否方便反复对比' : 'Can it compare repeatedly',
            note: isChinese
              ? '真正有用的是能稳定看出改动前后差异。'
              : 'The key value is seeing stable before/after differences.',
          },
          {
            label: isChinese ? '团队复用' : 'Team reuse',
            value: isChinese ? '是否能长期跑起来' : 'Can it run long term',
            note: isChinese
              ? '如果不能长期复用，它就很难成为基础设施。'
              : 'If it cannot be reused, it will not become infrastructure.',
          },
        ]}
      />
    </>
  );
}
