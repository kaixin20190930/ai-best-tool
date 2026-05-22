'use client';

import { useState } from 'react';
import { useRouter } from '@/app/navigation';
import { toast } from 'sonner';

import {
  runCollectionSourceNowAction,
  setCollectionSourceEnabledAction,
} from '@/app/actions/admin/collection';
import type { CollectionSource } from '@/lib/services/admin/collection';

export default function AdminCollectionSourcesTable({
  sources,
}: {
  sources: CollectionSource[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const runNow = async (id: string) => {
    setLoadingId(id);
    const result = await runCollectionSourceNowAction(id);
    setLoadingId(null);

    if (result.success) {
      toast.success(
        `Found ${result.foundCount || 0}, added ${result.importedCount || 0}, skipped ${result.skippedCount || 0}`
      );
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to run source');
    }
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    setLoadingId(id);
    const result = await setCollectionSourceEnabledAction(id, enabled);
    setLoadingId(null);

    if (result.success) {
      toast.success(enabled ? 'Source enabled' : 'Source paused');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update source');
    }
  };

  return (
    <div className="theme-surface overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Sources</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure source frequency and trigger manual runs.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Runs
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{source.name}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-700 hover:text-cyan-800"
                  >
                    {source.url}
                  </a>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {source.source_type}
                    </span>
                    <span
                      className={
                        source.enabled
                          ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
                          : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500'
                      }
                    >
                      {source.enabled ? 'enabled' : 'paused'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <p className="capitalize">{source.frequency}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Next:{' '}
                    {source.next_run_at
                      ? new Date(source.next_run_at).toLocaleString()
                      : 'manual'}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <p>
                    Last:{' '}
                    {source.last_run_at
                      ? new Date(source.last_run_at).toLocaleString()
                      : 'never'}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={loadingId === source.id}
                      onClick={() => runNow(source.id)}
                      className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                    >
                      Run now
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === source.id}
                      onClick={() => toggleEnabled(source.id, !source.enabled)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {source.enabled ? 'Pause' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                  No sources yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
