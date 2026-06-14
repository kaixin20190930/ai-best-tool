'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { listingConfig } from '@/lib/config/listing';
import { FORM_PLACEHOLDER, WEBSITE_EXAMPLE } from '@/lib/constants';
import type { Category } from '@/lib/services/categories';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinning from '@/components/Spinning';
import { submitTool } from '@/app/actions/submitTool';
import { Link } from '@/app/navigation';

const pricingOptions = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
];

function isValidHttpUrl(value: string): boolean {
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return !!new URL(withProtocol);
  } catch {
    return false;
  }
}

const FormSchema = z.object({
  website: z.string().trim().min(2),
  url: z.string().trim().refine(isValidHttpUrl),
  categoryId: z.string().optional(),
  description: z.string().trim().max(800).optional(),
  tags: z.string().trim().max(200).optional(),
  pricing: z.enum(['free', 'freemium', 'paid']),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidHttpUrl(value)),
  thumbnailUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidHttpUrl(value)),
  submissionPlan: z.enum(['free', 'standard_paid']),
  fastTrack: z.boolean(),
  featuredDays: z.enum(['0', '3', '7', '14']),
});

function getLocalizedName(name: Record<string, string>, locale: string): string {
  return name[locale] || name.en || name.zh || Object.values(name)[0] || '';
}

export default function SubmitForm({
  categories,
  locale,
  className,
}: {
  categories: Category[];
  locale: string;
  className?: string;
}) {
  const t = useTranslations('Submit');
  const isChinese = locale === 'cn' || locale === 'tw';

  const [loading, setLoading] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [lastSubmissionPlan, setLastSubmissionPlan] = useState<'free' | 'standard_paid'>('free');
  const [lastFeaturedDays, setLastFeaturedDays] = useState<0 | 3 | 7 | 14>(0);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      website: '',
      url: '',
      categoryId: '',
      description: '',
      tags: '',
      pricing: 'freemium',
      imageUrl: '',
      thumbnailUrl: '',
      submissionPlan: 'free',
      fastTrack: false,
      featuredDays: '0',
    },
  });
  const submissionPlan = form.watch('submissionPlan');
  const fastTrack = form.watch('fastTrack');
  const featuredDays = form.watch('featuredDays');
  const descriptionLength = form.watch('description')?.length || 0;
  const selectedFeaturedDays = Number(featuredDays || '0');
  const isPaidPlan = submissionPlan === 'standard_paid';
  let selectedPlanLabel = isChinese ? '免费提交' : listingConfig.plans.free.label;
  if (isPaidPlan) {
    selectedPlanLabel = isChinese ? '付费入驻' : listingConfig.plans.standard_paid.label;
  }
  const planHighlights = isPaidPlan
    ? listingConfig.plans.standard_paid.highlights
    : [
        isChinese ? '正常审核队列' : listingConfig.plans.free.summary,
        isChinese ? '适合先试水提交' : listingConfig.plans.free.highlights[0],
        isChinese ? '不会占用付费前排资源' : listingConfig.plans.free.highlights[1],
      ];

  useEffect(() => {
    if (!isPaidPlan) {
      form.setValue('fastTrack', false, { shouldDirty: true });
      form.setValue('featuredDays', '0', { shouldDirty: true });
    }
  }, [form, isPaidPlan]);

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);

      const result = await submitTool({
        ...formData,
        featuredDays: Number(formData.featuredDays) as 0 | 3 | 7 | 14,
      });

      if (!result.success) {
        toast.error(result.error || t('networkError'));
        return;
      }

      toast.success(t('success'));
      setLastSubmissionPlan(formData.submissionPlan);
      setLastFeaturedDays(Number(formData.featuredDays) as 0 | 3 | 7 | 14);
      form.reset();
      setJustSubmitted(true);
    } catch (error) {
      toast.error(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'theme-surface mx-3 mb-5 flex w-full max-w-[560px] flex-col justify-between rounded-[12px] bg-white px-3 py-5 lg:p-8',
          className,
        )}
      >
        <div className='space-y-3 lg:space-y-5'>
          {justSubmitted && (
            <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'>
              <p className='font-semibold'>
                {isChinese ? '提交成功，已进入审核队列。' : 'Submitted successfully and added to review queue.'}
              </p>
              {lastSubmissionPlan === 'standard_paid' && (
                <p className='mt-1 text-emerald-800/90'>
                  {isChinese
                    ? `你选择了付费入驻${lastFeaturedDays > 0 ? `，前排展示 ${lastFeaturedDays} 天` : ''}。请前往“我的提交”完成付款或查看支付链接。`
                    : `You selected the paid listing${lastFeaturedDays > 0 ? ` with ${lastFeaturedDays} featured days` : ''}. Go to My Submissions to complete payment or view the payment link.`}
                </p>
              )}
              <div className='mt-2 flex flex-wrap items-center gap-3 text-sm'>
                <Link href='/profile/submissions' className='font-semibold text-emerald-900 underline'>
                  {isChinese ? '查看我的提交状态' : 'View my submission status'}
                </Link>
                <button
                  type='button'
                  onClick={() => setJustSubmitted(false)}
                  className='font-medium text-emerald-700 hover:text-emerald-900'
                >
                  {isChinese ? '继续提交' : 'Submit another'}
                </button>
              </div>
            </div>
          )}
          <div className='rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200'>
            {isChinese
              ? '如有，请尽量补充产品名、官网、分类、定价、Logo、截图和一句核心能力描述。'
              : 'If available, include the name, website, category, pricing, logo, screenshot, and one clear capability sentence.'}
          </div>
          <FormField
            control={form.control}
            name='website'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('website')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder='AI Best Tools'
                    className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white p-5 text-slate-900'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='url'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('url')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={FORM_PLACEHOLDER}
                    className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white p-5 text-slate-900'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    placeholder='What does this AI tool help users do?'
                    rows={4}
                    className='min-h-[104px] w-full rounded-[8px] border border-slate-300 bg-white p-4 text-sm text-slate-900'
                    {...field}
                  />
                </FormControl>
                <div className='flex items-center justify-between text-xs text-slate-500'>
                  <span>{isChinese ? '可选，补充后会更方便审核。' : 'Optional, but helpful for review.'}</span>
                  <span>{descriptionLength}/800</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid gap-3 lg:grid-cols-2'>
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white px-4 text-sm text-slate-900'
                      {...field}
                    >
                      <option value=''>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {getLocalizedName(category.name, locale)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='pricing'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Pricing</FormLabel>
                  <FormControl>
                    <select
                      className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white px-4 text-sm text-slate-900'
                      {...field}
                    >
                      {pricingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      isChinese
                        ? '例如：gif-tools, video-to-gif, creator-tools'
                        : 'e.g. gif-tools, video-to-gif, creator-tools'
                    }
                    className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white p-5 text-slate-900'
                    {...field}
                  />
                </FormControl>
                <div className='text-xs text-slate-500'>
                  {isChinese
                    ? '多个标签用英文逗号分隔，建议填 3-8 个，最好使用短横线格式。'
                    : 'Use commas to separate tags. 3-8 tags is a good range, preferably in kebab-case.'}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid gap-3 lg:grid-cols-2'>
            <FormField
              control={form.control}
              name='imageUrl'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/logo.png'
                      className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white p-5 text-slate-900'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='thumbnailUrl'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Screenshot URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/screenshot.png'
                      className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white p-5 text-slate-900'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
            <p className='text-sm font-semibold text-slate-900'>{isChinese ? '提交方案' : 'Submission plan'}</p>
            <p className='mt-1 text-xs text-slate-500'>
              {isChinese
                ? '先选择提交方式，再按需要设置审核速度和前排展示天数。'
                : 'Choose a submission type, then set review speed and featured days if needed.'}
            </p>
            <div className='mt-3 grid gap-3 md:grid-cols-2'>
              <button
                type='button'
                onClick={() => form.setValue('submissionPlan', 'free', { shouldDirty: true })}
                className={cn(
                  'rounded-xl border p-4 text-left transition',
                  !isPaidPlan
                    ? 'border-cyan-300 bg-cyan-50 ring-1 ring-cyan-200'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>
                      {isChinese ? '免费提交' : listingConfig.plans.free.label}
                    </p>
                    <p className='mt-1 text-xs text-slate-500'>
                      {isChinese
                        ? '标准审核队列。'
                        : `${listingConfig.plans.free.reviewWindow} review in the standard queue.`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      !isPaidPlan ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {isChinese ? '标准' : 'Standard'}
                  </span>
                </div>
                <ul className='mt-3 space-y-1 text-sm text-slate-600'>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{isChinese ? '进入标准审核队列' : listingConfig.plans.free.summary}</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{isChinese ? '适合常规收录' : listingConfig.plans.free.highlights[0]}</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{isChinese ? '不包含前排展示' : listingConfig.plans.free.highlights[1]}</span>
                  </li>
                </ul>
              </button>

              <button
                type='button'
                onClick={() => form.setValue('submissionPlan', 'standard_paid', { shouldDirty: true })}
                className={cn(
                  'rounded-xl border p-4 text-left transition',
                  isPaidPlan
                    ? 'border-cyan-300 bg-cyan-50 ring-1 ring-cyan-200'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>
                      {isChinese ? '付费入驻' : listingConfig.plans.standard_paid.label}
                    </p>
                    <p className='mt-1 text-xs text-slate-500'>
                      {isChinese
                        ? '更短的审核周期，并可选择前排展示。'
                        : `${listingConfig.plans.standard_paid.reviewWindow} review with optional featured visibility.`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      isPaidPlan ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {isChinese ? '付费' : 'Paid'}
                  </span>
                </div>
                <ul className='mt-3 space-y-1 text-sm text-slate-600'>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{isChinese ? '更快审核' : listingConfig.plans.standard_paid.highlights[0]}</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{isChinese ? '可选前排展示' : listingConfig.plans.standard_paid.highlights[1]}</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{isChinese ? '支付状态自动确认' : listingConfig.plans.standard_paid.highlights[2]}</span>
                  </li>
                </ul>
              </button>
            </div>
            <div className='mt-3 grid gap-2'>
              <FormField
                control={form.control}
                name='submissionPlan'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormControl>
                      <select
                        className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white px-4 text-sm text-slate-900'
                        {...field}
                      >
                        <option value='free'>
                          {isChinese
                            ? '免费提交（3-7天审核）'
                            : `${listingConfig.plans.free.label} (${listingConfig.plans.free.reviewWindow})`}
                        </option>
                        <option value='standard_paid'>
                          {isChinese
                            ? '付费入驻（1-3天审核）'
                            : `${listingConfig.plans.standard_paid.label} (${listingConfig.plans.standard_paid.reviewWindow})`}
                        </option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-2 lg:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='fastTrack'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className='text-xs'>{isChinese ? '加速审核' : 'Fast review'}</FormLabel>
                      <FormControl>
                        <div className='flex h-[42px] items-center gap-2 rounded-[8px] border border-slate-300 bg-white px-3 text-sm text-slate-900'>
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!isPaidPlan}
                          />
                          {isChinese
                            ? '24-48 小时目标'
                            : `24-48h review · ${listingConfig.plans.standard_paid.fastTrackLabel}`}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='featuredDays'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className='text-xs'>{isChinese ? '前排展示天数' : 'Featured days'}</FormLabel>
                      <FormControl>
                        <select
                          className='h-[42px] w-full rounded-[8px] border border-slate-300 bg-white px-4 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500'
                          {...field}
                          disabled={!isPaidPlan}
                        >
                          <option value='0'>{isChinese ? '不需要' : 'No featured slot'}</option>
                          <option value='3'>3 days</option>
                          <option value='7'>7 days</option>
                          <option value='14'>14 days</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='mt-4 rounded-lg bg-white p-3 ring-1 ring-slate-200'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '当前选择' : 'Current selection'}
              </p>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <span className='inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-800'>
                  {selectedPlanLabel}
                </span>
                {submissionPlan === 'standard_paid' && fastTrack && (
                  <span className='inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'>
                    {isChinese ? '加速审核' : 'Fast review'}
                  </span>
                )}
                {selectedFeaturedDays > 0 && (
                  <span className='inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800'>
                    {isChinese ? `前排 ${selectedFeaturedDays} 天` : `Featured ${selectedFeaturedDays} days`}
                  </span>
                )}
              </div>
              <ul className='mt-3 space-y-1 text-sm text-slate-600'>
                {planHighlights.map((item) => (
                  <li key={item} className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className='mt-5 flex flex-col gap-[10px] lg:gap-5'>
          <button
            type='submit'
            disabled={loading}
            className={cn(
              'flex-center mt-auto h-[48px] w-full gap-4 rounded-[8px] border border-cyan-800 bg-cyan-700 text-center font-bold text-white hover:cursor-pointer hover:bg-cyan-800',
              loading && 'hover:cursor-not-allowed',
            )}
          >
            {loading ? <Spinning className='size-[22px]' /> : t('submit')}
          </button>
          <p className='text-[13px] text-slate-900'>
            {t('add')} <span className='text-slate-700'>{WEBSITE_EXAMPLE}</span> {t('text')}
          </p>
          <p className='text-xs text-slate-500'>
            {isChinese
              ? '提交后仍可补充 Logo 和截图；如果是付费入驻，付款会在“我的提交”里继续处理。'
              : 'You can still add logo and screenshot later; paid listing payment is handled from My Submissions.'}
          </p>
        </div>
      </form>
    </Form>
  );
}
