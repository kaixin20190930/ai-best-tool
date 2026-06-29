'use client';

import { CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

type CleanupQueueItem = {
  id: string;
  name: string;
  title: string;
  blockers: string[];
};

type CleanupQueueGroupDoneProps = {
  items: CleanupQueueItem[];
  locale: string;
};

const storageKey = 'cleanup-processed-items-v1';

function readStoredIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value) => typeof value === 'string'));
  } catch {
    return new Set();
  }
}

export default function CleanupQueueGroupDone({ items, locale }: CleanupQueueGroupDoneProps) {
  const handleMarkGroupDone = () => {
    if (items.length === 0) {
      toast.info(locale === 'cn' || locale === 'tw' ? '当前组没有条目。' : 'No items in this group.');
      return;
    }

    const confirmLabel =
      locale === 'cn' || locale === 'tw' ? '确定整组标记已处理吗？' : 'Mark this whole group as done?';
    if (typeof window !== 'undefined' && !window.confirm(confirmLabel)) {
      return;
    }

    const existing = readStoredIds();
    items.forEach((item) => existing.add(item.id));
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(existing)));
    window.dispatchEvent(new Event('cleanup-processed-updated'));

    toast.success(
      locale === 'cn' || locale === 'tw'
        ? `已将当前组的 ${items.length} 条标记为已处理。`
        : `Marked ${items.length} items as done.`,
    );
  };

  return (
    <button
      type='button'
      onClick={handleMarkGroupDone}
      className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100'
    >
      <CheckCheck className='mr-2 size-4' />
      {locale === 'cn' || locale === 'tw' ? '整组标记已处理' : 'Mark group done'}
    </button>
  );
}
