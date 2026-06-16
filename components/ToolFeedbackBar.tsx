'use client';

import { useState } from 'react';
import { Flag, RefreshCw, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { trackFeedback } from '@/app/actions/analytics';

interface ToolFeedbackBarProps {
  toolId: string;
  userId?: string;
  className?: string;
}

const feedbackOptions = [
  {
    type: 'helpful' as const,
    label: 'Helpful',
    description: 'Helped me decide',
    icon: ThumbsUp,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    type: 'needs_update' as const,
    label: 'Needs update',
    description: 'Price, screenshot, or copy is stale',
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

export default function ToolFeedbackBar({ toolId, userId, className = '' }: ToolFeedbackBarProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleFeedback = async (feedbackType: (typeof feedbackOptions)[number]['type']) => {
    setLoading(feedbackType);

    const result = await trackFeedback(toolId, feedbackType, userId);

    setLoading(null);

    if (result.success) {
      setSelected(feedbackType);
      toast.success('Thanks, this helps us improve the listing.');
    } else {
      toast.error(result.error || 'Could not save your feedback');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className='text-sm font-semibold text-slate-900'>Quick feedback</div>
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
              className={`flex min-h-[7.5rem] flex-row items-start gap-3 rounded-lg border px-4 py-4 text-left text-sm transition ${
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
              <div className='min-w-0 space-y-1'>
                <span
                  className={`block break-words text-base font-semibold leading-6 ${
                    isSelected ? 'text-current' : 'text-slate-900'
                  }`}
                >
                  {isLoading ? 'Saving...' : option.label}
                </span>
                <span className='block break-words text-sm leading-6 text-slate-500'>{option.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
