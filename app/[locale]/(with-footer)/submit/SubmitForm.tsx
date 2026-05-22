'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { submitTool } from '@/app/actions/submitTool';
import type { Category } from '@/lib/services/categories';
import { FORM_PLACEHOLDER, WEBSITE_EXAMPLE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinning from '@/components/Spinning';

const pricingOptions = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
];

const FormSchema = z.object({
  website: z.string().trim().min(2),
  url: z.string().trim().refine((value) => {
    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      new URL(withProtocol);
      return true;
    } catch {
      return false;
    }
  }),
  categoryId: z.string().optional(),
  description: z.string().trim().max(800).optional(),
  pricing: z.enum(['free', 'freemium', 'paid']),
  imageUrl: z.string().trim().optional().refine((value) => {
    if (!value) return true;

    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      new URL(withProtocol);
      return true;
    } catch {
      return false;
    }
  }),
  thumbnailUrl: z.string().trim().optional().refine((value) => {
    if (!value) return true;

    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      new URL(withProtocol);
      return true;
    } catch {
      return false;
    }
  }),
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      website: '',
      url: '',
      categoryId: '',
      description: '',
      pricing: 'freemium',
      imageUrl: '',
      thumbnailUrl: '',
    },
  });
  const descriptionLength = form.watch('description')?.length || 0;

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);

      const result = await submitTool(formData);

      if (!result.success) {
        toast.error(result.error || t('networkError'));
        return;
      }

      toast.success(t('success'));
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
              ? '建议优先填写：产品名、官网、分类、定价与一句核心能力描述。'
              : 'Recommended: name, website, category, pricing, and one clear capability sentence.'}
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
                  <span>{isChinese ? '可选，但建议填写以提升审核效率。' : 'Optional, but helps review quality.'}</span>
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
              ? '提交后你可以继续补充 Logo 和截图，我们会在审核中参考。'
              : 'You can still add logo and screenshot later; we include them during review.'}
          </p>
        </div>
      </form>
    </Form>
  );
}
