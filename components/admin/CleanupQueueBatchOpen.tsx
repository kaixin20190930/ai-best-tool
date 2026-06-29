'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type CleanupQueueItem = {
  id: string;
  name: string;
  title: string;
  blockers: string[];
};

type CleanupQueueBatchOpenProps = {
  items: CleanupQueueItem[];
  locale: string;
  limit?: number;
};

export default function CleanupQueueBatchOpen({ items, locale, limit = 5 }: CleanupQueueBatchOpenProps) {
  const [selectedLimit, setSelectedLimit] = useState(limit);

  const handleOpen = () => {
    if (items.length === 0) {
      toast.info(locale === 'cn' || locale === 'tw' ? '当前没有可打开的条目。' : 'No items to open right now.');
      return;
    }

    const targets = items.slice(0, selectedLimit);
    targets.forEach((item) => {
      window.open(`/admin/tools/${item.id}/edit`, '_blank', 'noopener,noreferrer');
    });

    toast.success(
      locale === 'cn' || locale === 'tw'
        ? `已打开前 ${targets.length} 个编辑页。`
        : `Opened the first ${targets.length} edit pages.`,
    );
  };

  return (
    <div className='inline-flex items-center gap-2'>
      <select
        value={selectedLimit}
        onChange={(event) => setSelectedLimit(Number(event.target.value))}
        className='h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700'
      >
        {[3, 5, 10].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type='button'
        onClick={handleOpen}
        className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100'
      >
        <ExternalLink className='mr-2 size-4' />
        {locale === 'cn' || locale === 'tw' ? `批量打开前 ${selectedLimit} 个` : `Open first ${selectedLimit}`}
      </button>
    </div>
  );
}
