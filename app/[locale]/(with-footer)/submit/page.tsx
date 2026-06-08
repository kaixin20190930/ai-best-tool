import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BadgeCheck, FileSearch, Send } from 'lucide-react';

import Faq from '@/components/Faq';
import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';
import { getAllCategories } from '@/lib/services/categories';

import SubmitForm from './SubmitForm';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.submit',
  });

  return {
    title: t('title'),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({
    locale,
    namespace: 'Submit',
  });
  const categories = await getAllCategories();
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <div className='theme-page mx-auto max-w-pc'>
      <div className='flex-y-center my-3 flex lg:my-10'>
        <h1 className='text-5xl font-bold text-slate-950'>{t('title')}</h1>
        <h2 className='mt-[5px] text-sm font-bold text-slate-500 lg:my-3'>{t('subTitle')}</h2>
        <div className='grid w-full items-start gap-5 px-3 lg:grid-cols-[minmax(0,560px)_320px] lg:px-0'>
          <SubmitForm categories={categories} locale={locale} className='mx-0' />
          <aside className='theme-surface rounded-[12px] p-5 text-slate-900'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '开发者入驻' : 'Developer listing'}
            </p>
            <h3 className='mt-2 text-xl font-bold text-slate-950'>
              {isChinese ? '选择适合你的提交方式' : 'Choose how you want to submit'}
            </h3>
            <p className='mt-3 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '免费提交适合常规收录；如果你需要更快审核或额外曝光，也可以选择付费方案。'
                : `${listingConfig.valueProposition} ${listingConfig.listingFeeLabel}.`}
            </p>
            <div className='mt-4 grid gap-3'>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='text-sm font-semibold text-slate-900'>
                  {isChinese ? '免费提交' : listingConfig.plans.free.label}
                </p>
                <p className='mt-1 text-sm text-slate-600'>
                  {isChinese
                    ? '进入标准审核队列，适合常规收录。'
                    : `${listingConfig.plans.free.summary} Suitable for general directory submissions.`}
                </p>
              </div>
              <div className='rounded-lg border border-cyan-100 bg-cyan-50 p-3'>
                <p className='text-sm font-semibold text-cyan-900'>
                  {isChinese ? '付费入驻' : listingConfig.plans.standard_paid.label}
                </p>
                <p className='mt-1 text-sm text-cyan-900'>
                  {isChinese
                    ? '更短的审核周期，并可选择前排展示。'
                    : `${listingConfig.plans.standard_paid.summary} Payment status is confirmed automatically.`}
                </p>
              </div>
            </div>
            <div className='mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3'>
              <p className='text-sm font-semibold text-amber-900'>
                {isChinese ? '适合什么场景' : 'Best for'}
              </p>
              <p className='mt-1 text-sm leading-6 text-amber-900'>
                {isChinese
                  ? '适合新品发布、活动期曝光，或希望更快完成审核并把更多访客引导到官网的团队。'
                  : 'New launches, campaign windows, faster turnaround, or when a team wants to send more visitors to its own site.'}
              </p>
            </div>
            <div className='mt-4 space-y-3 text-sm text-slate-700'>
              <div className='flex items-start gap-2'>
                <Send className='mt-0.5 size-4 text-cyan-700' />
                <p>{isChinese ? '填写基础信息并提交工具。' : 'Submit your tool details.'}</p>
              </div>
              <div className='flex items-start gap-2'>
                <FileSearch className='mt-0.5 size-4 text-cyan-700' />
                <p>{isChinese ? '我们会审核链接、分类与内容质量。' : 'We review URL, category, and content quality.'}</p>
              </div>
              <div className='flex items-start gap-2'>
                <BadgeCheck className='mt-0.5 size-4 text-cyan-700' />
                <p>{isChinese ? '通过后发布到目录并持续获取曝光。' : 'Approved tools are published in the directory.'}</p>
              </div>
            </div>
            <a
              href={getListingPaymentMailto('Paid AI tool listing')}
              className='mt-5 inline-flex w-full items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '联系入驻' : 'Contact for listing'}
            </a>
            <Link
              href='/developer/listing'
              className='mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '查看开发者入驻说明' : 'View developer listing details'}
            </Link>
          </aside>
        </div>
      </div>
      <Faq />
    </div>
  );
}
