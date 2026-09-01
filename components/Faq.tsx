import { CircleHelp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

type FaqItem = {
  answer: string;
  question: string;
};

export default function Faq() {
  const locale = useLocale();
  const t = useTranslations('Faq');
  const isChinese = locale === 'cn' || locale === 'tw';
  let items: FaqItem[];

  if (isChinese) {
    items = [
      {
        question: 'AI Best Tool 是什么？',
        answer:
          'AI Best Tool 是一个按真实任务组织的 AI 工具目录。我们通过来源、适用条件、限制和复查日期帮助用户形成更可信的候选清单。',
      },
      {
        question: '浏览和提交工具需要付费吗？',
        answer:
          '浏览和标准提交保持免费。可选付费方案只改变审核时效或提供标注清楚的展示窗口，不保证通过、排名、流量或编辑背书。',
      },
      {
        question: '工具资料多久复查一次？',
        answer:
          '核心事实按 30 天框架复查，适合与不适合的判断按 90 天框架复核；发生价格、隐私、额度或产品定位变化时会提前进入待审队列。没有真实变化时不会为了显得新鲜而改写日期。',
      },
      {
        question: '工具说明和判断是怎么生成的？',
        answer:
          '自动化负责发现候选、提取来源和识别变化，编辑负责核对关键事实、限制和公开资格。AI 生成的草稿不会自动成为公开结论。',
      },
      {
        question: '如何判断一款工具是否适合我？',
        answer:
          '先查看 Decision Card 的 Best for、Watch outs 和 Compare next，再打开来源核对价格、额度、隐私、部署或兼容性等会改变选择结果的条件。',
      },
      {
        question: '产品 owner 或用户可以纠正资料吗？',
        answer:
          '可以。owner 可以认领和提交真实变化，用户可以评论或提交纠错；这些信息会保留来源并进入编辑复核，不会直接覆盖已核验事实。',
      },
    ];
  } else if (locale === 'en') {
    items = [
      {
        question: 'What is AI Best Tool?',
        answer:
          'AI Best Tool is an AI tools directory organized around real tasks. Sources, fit conditions, limitations, and review dates help visitors build a more defensible shortlist.',
      },
      {
        question: 'Is browsing or submitting a tool free?',
        answer:
          'Browsing and standard submissions remain free. Optional paid plans only change review timing or provide clearly labeled visibility windows; they do not guarantee approval, ranking, traffic, or editorial endorsement.',
      },
      {
        question: 'How often is tool information reviewed?',
        answer:
          'Core facts follow a 30-day review framework and fit decisions follow a 90-day review framework. Material pricing, privacy, quota, or positioning changes can enter review earlier. A no-change review does not receive a cosmetic fresh date.',
      },
      {
        question: 'How are tool descriptions and decisions produced?',
        answer:
          'Automation discovers candidates, extracts sources, and flags changes. Editors verify decision-changing facts, limitations, and publication eligibility. An AI-generated draft never becomes a public conclusion automatically.',
      },
      {
        question: 'How should I decide whether a tool fits?',
        answer:
          "Start with the Decision Card's Best for, Watch outs, and Compare next, then open the evidence for pricing, quotas, privacy, deployment, or compatibility conditions that could change the decision.",
      },
      {
        question: 'Can owners or users correct a listing?',
        answer:
          'Yes. Owners can claim a page and report material changes, while users can comment or submit corrections. These signals retain their source and enter editorial review instead of overwriting verified facts directly.',
      },
    ];
  } else {
    items = [
      { question: t('1.question'), answer: t('1.answer') },
      {
        question: t('2.question'),
        answer: [t('2.answer-1'), t('2.answer-2'), t('2.answer-3')].join(' '),
      },
      {
        question: t('3.question'),
        answer: [t('3.answer-1'), t('3.answer-2')].join(' '),
      },
      { question: t('7.question'), answer: t('7.answer') },
      { question: t('9.question'), answer: t('9.answer') },
      { question: t('10.question'), answer: t('10.answer') },
    ];
  }

  return (
    <section className='mx-auto max-w-pc space-y-8 pb-5' aria-labelledby='home-faq-title'>
      <h2 id='home-faq-title' className='text-center text-2xl font-bold text-slate-950 lg:pb-3 lg:text-3xl'>
        {isChinese ? '常见问题' : t('title')}
      </h2>
      <div className='grid grid-cols-1 gap-5 px-3 lg:grid-cols-2 lg:gap-8 lg:px-0'>
        {items.map((item) => (
          <article key={item.question} className='theme-surface rounded-lg p-5 lg:p-6'>
            <h3 className='flex items-start gap-2 text-lg font-semibold text-slate-900 lg:text-xl'>
              <CircleHelp className='mt-0.5 size-5 shrink-0 text-cyan-700' />
              {item.question}
            </h3>
            <p className='mt-3 text-sm leading-6 text-slate-600 lg:text-base'>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
