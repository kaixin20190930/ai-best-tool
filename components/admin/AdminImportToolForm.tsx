'use client';

import { useState } from 'react';
import { useRouter } from '@/app/navigation';
import { toast } from 'sonner';

import { importToolUrl } from '@/app/actions/admin/importTools';

export default function AdminImportToolForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await importToolUrl({
      url: String(formData.get('url') || ''),
      source: String(formData.get('source') || ''),
    });

    setLoading(false);

    if (result.success) {
      toast.success('Tool URL imported as draft');
      event.currentTarget.reset();
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to import URL');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Import tool URL</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add a source URL to the collection queue as a draft for later research.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          name="url"
          type="text"
          required
          placeholder="https://example.com"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
        />
        <input
          name="source"
          type="text"
          placeholder="Source"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </form>
  );
}
