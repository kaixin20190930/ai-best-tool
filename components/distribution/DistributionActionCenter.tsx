'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

type DistributionActionCenterStatus = 'running' | 'success' | 'error';

type Entry = {
  id: string;
  label: string;
  status: DistributionActionCenterStatus;
  message?: string;
  updatedAt: number;
};

type CenterEvent = {
  id: string;
  label: string;
  status: DistributionActionCenterStatus;
  message?: string;
};

const DISTRIBUTION_ACTION_STORAGE_KEY = 'distribution-action-center-state';
const DISTRIBUTION_ACTION_CENTER_EVENT = 'distribution:action-center';

function pruneEntries(entries: Entry[]) {
  const now = Date.now();
  return entries.filter((entry) => {
    if (entry.status === 'running') return true;
    return now - entry.updatedAt < 12 * 60 * 60 * 1000;
  });
}

function loadEntries(): Entry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(DISTRIBUTION_ACTION_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Entry[];
    return Array.isArray(parsed) ? pruneEntries(parsed) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: Entry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISTRIBUTION_ACTION_STORAGE_KEY, JSON.stringify(entries));
}

export default function DistributionActionCenter() {
  const [items, setItems] = useState<Entry[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setItems(loadEntries());

    const handleEvent = (event: Event) => {
      const custom = event as CustomEvent<CenterEvent>;
      const next = pruneEntries(loadEntries()).map((entry) =>
        entry.id === custom.detail.id
          ? { ...entry, status: custom.detail.status, message: custom.detail.message, updatedAt: Date.now() }
          : entry,
      );

      const exists = next.some((entry) => entry.id === custom.detail.id);
      const updated = exists
        ? next
        : [
            ...next,
            {
              id: custom.detail.id,
              label: custom.detail.label,
              status: custom.detail.status,
              message: custom.detail.message,
              updatedAt: Date.now(),
            },
          ];

      setItems(pruneEntries(updated));
      setVisible(true);
      writeEntries(pruneEntries(updated));
    };

    const handleStorage = () => setItems(loadEntries());

    window.addEventListener(DISTRIBUTION_ACTION_CENTER_EVENT, handleEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(DISTRIBUTION_ACTION_CENTER_EVENT, handleEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (items.every((item) => item.status !== 'running')) {
      const hideTimer = window.setTimeout(() => {
        setVisible(false);
      }, 6000);
      return () => window.clearTimeout(hideTimer);
    }
    return undefined;
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const runningCount = items.filter((item) => item.status === 'running').length;

  return (
    <div className='fixed right-4 bottom-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)]'>
      {visible ? (
        <div className='rounded-2xl border border-slate-200 bg-white shadow-xl'>
          <div className='flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600'>
            <span>{runningCount ? 'Distribution operations' : 'Distribution operation finished'}</span>
            <button
              type='button'
              className='rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              onClick={() => {
                setVisible(false);
              }}
              aria-label='关闭操作面板'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
          <div className='max-h-64 space-y-2 overflow-auto px-3 py-3'>
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2 text-xs ${
                  item.status === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : item.status === 'running'
                      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className='font-semibold'>{item.label}</div>
                <div className='mt-1 text-[11px] text-slate-600'>{item.message || item.status}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
