import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BadgeCheck, FileSearch, Send } from 'lucide-react';

import Faq from '@/components/Faq';
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
              {isChinese ? '付费加速审核与展示' : 'Paid review and placement'}
            </h3>
            <p className='mt-3 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '适合希望更快审核、补全资料、获得更好展示位置的 AI 工具开发者。'
                : 'For AI tool developers who want faster review, listing support, and better placement options.'}
            </p>
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
              href='mailto:contact@AIBestTool.com?subject=Paid%20AI%20tool%20listing'
              className='mt-5 inline-flex w-full items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '联系入驻' : 'Contact for listing'}
            </a>
          </aside>
        </div>
      </div>
      <Faq />
    </div>
  );
}
