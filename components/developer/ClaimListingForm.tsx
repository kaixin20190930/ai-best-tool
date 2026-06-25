'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { submitClaimListing } from '@/app/actions/claimListing';

type ClaimListingFormProps = {
  locale: string;
  sourcePath: string;
  initialIntent?: 'default' | 'claim' | 'paid';
};

export default function ClaimListingForm({ locale, sourcePath, initialIntent = 'default' }: ClaimListingFormProps) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    listingName: '',
    email: '',
    company: '',
    website: '',
    note: '',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  let submitLabel = isChinese ? '提交认领' : 'Submit claim';
  if (loading) {
    submitLabel = isChinese ? '提交中...' : 'Submitting...';
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await submitClaimListing({
        ...form,
        sourcePath,
        sourceLocale: locale,
      });

      if (!result.success) {
        toast.error(result.error || (isChinese ? '提交失败，请稍后再试。' : 'Submission failed. Please try again.'));
        return;
      }

      toast.success(isChinese ? '认领信息已收到。' : 'Claim details received.');
      setSubmitted(true);
      setForm({
        listingName: '',
        email: '',
        company: '',
        website: '',
        note: '',
      });
    } catch (error) {
      toast.error(isChinese ? '提交失败，请稍后再试。' : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    let nextStepText = isChinese
      ? '如果认领确认后还需要更快审核或前排展示，再回到价格页或提交页即可。'
      : 'If you later need faster review or featured visibility, you can return to pricing or the submission flow after claim confirmation.';
    if (initialIntent === 'paid') {
      nextStepText = isChinese
        ? '如果目录里还没有这个工具，下一步更适合回到提交页。若条目已存在，我们会先人工跟进认领。'
        : 'If the tool is not in the directory yet, the next best step is usually to go back to the submission flow. If it already exists, we will continue with manual claim follow-up.';
    }

    return (
      <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm'>
        <p className='text-sm font-semibold text-emerald-900'>{isChinese ? '已收到认领信息' : 'Claim received'}</p>
        <p className='mt-2 text-sm leading-6 text-emerald-900/80'>
          {isChinese
            ? '我们会先人工核对，再决定是否需要进一步联系。'
            : 'We will review the details manually and follow up when needed.'}
        </p>
        <p className='mt-2 text-sm leading-6 text-emerald-900/80'>{nextStepText}</p>
        <div className='mt-4 flex flex-wrap items-center gap-3'>
          <Link
            href={`/${locale}/pricing`}
            className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
          >
            {isChinese ? '查看价格页' : 'View pricing'}
          </Link>
          <Link
            href={`/${locale}/submit?intent=claim`}
            className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
          >
            {isChinese ? '转到提交页' : 'Go to submit'}
          </Link>
        </div>
        <button
          type='button'
          onClick={() => setSubmitted(false)}
          className='mt-4 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
        >
          {isChinese ? '再提交一个' : 'Submit another'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='grid gap-4 md:grid-cols-2'>
        <label htmlFor='claim-listing-name' className='space-y-2 text-sm font-medium text-slate-700'>
          <span>{isChinese ? '工具名称' : 'Listing name'}</span>
          <input
            id='claim-listing-name'
            required
            value={form.listingName}
            onChange={(event) => updateField('listingName', event.target.value)}
            placeholder={isChinese ? '例如：Claude' : 'e.g. Claude'}
            className='h-11 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400'
          />
        </label>
        <label htmlFor='claim-email' className='space-y-2 text-sm font-medium text-slate-700'>
          <span>{isChinese ? '邮箱' : 'Email'}</span>
          <input
            id='claim-email'
            required
            type='email'
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder='name@company.com'
            className='h-11 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400'
          />
        </label>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <label htmlFor='claim-company' className='space-y-2 text-sm font-medium text-slate-700'>
          <span>{isChinese ? '公司' : 'Company'}</span>
          <input
            id='claim-company'
            value={form.company}
            onChange={(event) => updateField('company', event.target.value)}
            placeholder={isChinese ? '你的团队或公司名' : 'Your team or company'}
            className='h-11 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400'
          />
        </label>
        <label htmlFor='claim-website' className='space-y-2 text-sm font-medium text-slate-700'>
          <span>{isChinese ? '官网' : 'Website'}</span>
          <input
            id='claim-website'
            value={form.website}
            onChange={(event) => updateField('website', event.target.value)}
            placeholder='https://example.com'
            className='h-11 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400'
          />
        </label>
      </div>

      <label htmlFor='claim-note' className='block space-y-2 text-sm font-medium text-slate-700'>
        <span>{isChinese ? '备注' : 'Note'}</span>
        <textarea
          id='claim-note'
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
          placeholder={isChinese ? '例如：希望优先认领 / 有更新需求' : 'e.g. Priority claim request / update needed'}
          rows={4}
          className='min-h-[100px] w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400'
        />
      </label>

      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='submit'
          disabled={loading}
          className={cn(
            'inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800',
            loading && 'cursor-not-allowed opacity-70',
          )}
        >
          {submitLabel}
        </button>
        <p className='text-xs leading-5 text-slate-500'>
          {isChinese
            ? '我们会先人工核对，不会自动公开这个认领。'
            : 'We review claims manually before any public owner mapping.'}
        </p>
      </div>
    </form>
  );
}
