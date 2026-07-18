import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ImageToolsPage, { generateMetadata as generateImageToolsMetadata } from '../ai-image-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateImageToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-image-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {ImageToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '图像工具页要先看生成、编辑和真实工作流，而不是只看图片好不好看。'
            : 'Image tool pages should focus on generation, editing, and real workflows rather than whether the images simply look good.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要生成、编辑还是批量出图。',
                '再看风格控制、可编辑性和迭代成本。',
                '最后回到真实案例和评论判断是否值得长期索引。',
              ]
            : [
                'First confirm whether you need generation, editing, or batch output.',
                'Then check style control, editability, and iteration cost.',
                'Finally use real cases and comments to decide whether it deserves indexing.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '生成能力' : 'Generation',
            value: locale === 'cn' || locale === 'tw' ? '先看首轮出图' : 'Check first-pass output',
            note:
              locale === 'cn' || locale === 'tw'
                ? '好的起点是能不能快速出到可用图。'
                : 'A good starting point is whether it can quickly produce usable images.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '编辑与迭代' : 'Editing and iteration',
            value: locale === 'cn' || locale === 'tw' ? '能否持续修改' : 'Can it be edited repeatedly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果不能反复调整，实际工作流会很痛。'
                : 'If it cannot be iterated on, the real workflow gets painful.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实案例' : 'Real cases',
            value: locale === 'cn' || locale === 'tw' ? '看评论和样例' : 'Look at comments and examples',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后还是要回到真实使用反馈。'
                : 'Ultimately, real usage feedback is what matters.',
          },
        ]}
      />

      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按当前比较页的判断标准重新核对。'
              : 'This page has been rechecked against the current comparison-page decision flow.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '保留索引，补真实证据' : 'Keep it indexable and add real evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用评论、案例和 owner 认领把它和泛工具页区分开。'
              : 'Use comments, cases, and owner claims to distinguish it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实用例和反馈' : 'Add real use cases and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、反馈和认领信息。'
              : 'Next, prioritize cases, feedback, and claim information.'}
          </p>
        </div>
      </section>
    </>
  );
}
