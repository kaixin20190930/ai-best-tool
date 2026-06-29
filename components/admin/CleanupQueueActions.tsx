'use client';

import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

type CleanupQueueItem = {
  id: string;
  name: string;
  title: string;
  blockers: string[];
};

type CleanupQueueActionsProps = {
  items: CleanupQueueItem[];
  locale: string;
};

export default function CleanupQueueActions({ items, locale }: CleanupQueueActionsProps) {
  const handleCopy = async () => {
    if (items.length === 0) {
      toast.info(locale === 'cn' || locale === 'tw' ? '当前没有可复制的条目。' : 'No items to copy right now.');
      return;
    }

    const content = items
      .map(
        (item) =>
          `- ${item.title} (${item.name})\n  blockers: ${item.blockers.join(', ')}\n  edit: /admin/tools/${item.id}/edit`,
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(content);
      toast.success(locale === 'cn' || locale === 'tw' ? '已复制当前清理清单。' : 'Copied the current cleanup list.');
    } catch {
      toast.error(
        locale === 'cn' || locale === 'tw' ? '复制失败，请手动选择复制。' : 'Copy failed. Please copy manually.',
      );
    }
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
    >
      <ClipboardCopy className='mr-2 size-4' />
      {locale === 'cn' || locale === 'tw' ? '复制清单' : 'Copy list'}
    </button>
  );
}
