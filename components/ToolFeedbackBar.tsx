'use client';

import { useState } from 'react';
import { Flag, RefreshCw, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { trackFeedback } from '@/app/actions/analytics';

interface ToolFeedbackBarProps {
  toolId: string;
  userId?: string;
  className?: string;
  locale?: string;
}

const feedbackOptions = [
  {
    type: 'helpful' as const,
    label: 'Helpful',
    description: 'Helped me choose',
    icon: ThumbsUp,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    type: 'needs_update' as const,
    label: 'Needs update',
    description: 'Price, media, or copy is stale',
    icon: RefreshCw,
    className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    type: 'inaccurate' as const,
    label: 'Inaccurate',
    description: 'Incorrect info',
    icon: Flag,
    className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  },
];

const localizedLabels = {
  helpful: '有帮助',
  needs_update: '请求更新',
  inaccurate: '内容有误',
} as const;

export default function ToolFeedbackBar({ toolId, userId, className = '', locale = 'en' }: ToolFeedbackBarProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const isChinese = locale === 'cn' || locale === 'tw';

  const handleFeedback = async (feedbackType: (typeof feedbackOptions)[number]['type']) => {
    setLoading(feedbackType);

    const result = await trackFeedback(toolId, feedbackType, userId);

    setLoading(null);

    if (result.success) {
      setSelected(feedbackType);
      toast.success(isChinese ? '已收到，这会帮助我们优化条目。' : 'Thanks, this helps us improve the listing.');
    } else {
      toast.error(result.error || (isChinese ? '暂时无法保存反馈' : 'Could not save your feedback'));
    }
  };

  const getOptionLabel = (
    optionType: (typeof feedbackOptions)[number]['type'],
    fallbackLabel: string,
    isLoadingOption: boolean,
  ) => {
    if (isLoadingOption) {
      return isChinese ? '保存中...' : 'Saving...';
    }

    if (!isChinese) {
      return fallbackLabel;
    }

    return localizedLabels[optionType];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <div className='text-sm font-semibold text-slate-900'>{isChinese ? '快速反馈' : 'Quick feedback'}</div>
        <p className='mt-1 text-xs leading-5 text-slate-500'>
          {isChinese
            ? '如果价格、截图、文案或功能已经过时，点“请求更新”就好。'
            : 'If pricing, screenshots, copy, or features look stale, tap request update.'}
        </p>
      </div>
      <div className='grid gap-3'>
        {feedbackOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.type;
          const isLoading = loading === option.type;

          return (
            <button
              key={option.type}
              type='button'
              onClick={() => handleFeedback(option.type)}
              className={`flex min-h-[6.25rem] flex-row items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                isSelected ? option.className : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              disabled={isLoading}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ${
                  isSelected ? 'ring-current/15 bg-white/70' : 'bg-slate-50 ring-slate-200'
                }`}
              >
                <Icon className='size-4 shrink-0' />
              </div>
              <div className='min-w-0 space-y-0.5'>
                <span
                  className={`block break-words text-[0.98rem] font-semibold leading-5 ${
                    isSelected ? 'text-current' : 'text-slate-900'
                  }`}
                >
                  {getOptionLabel(option.type, option.label, isLoading)}
                </span>
                <span className='block break-words text-xs leading-5 text-slate-500'>{option.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
