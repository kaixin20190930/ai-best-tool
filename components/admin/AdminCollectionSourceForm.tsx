'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { createCollectionSourceAction } from '@/app/actions/admin/collection';
import { useRouter } from '@/app/navigation';

export default function AdminCollectionSourceForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const result = await createCollectionSourceAction(new FormData(event.currentTarget));

    setLoading(false);

    if (result.success) {
      toast.success('Collection source saved');
      formRef.current?.reset();
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to save source');
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'
    >
      <h2 className='text-lg font-semibold text-slate-900'>Collection source</h2>
      <p className='mt-1 text-sm text-slate-600'>Register repeatable sources for future scheduled collection jobs.</p>

      <div className='mt-4 grid gap-3 md:grid-cols-2'>
        <input
          name='name'
          type='text'
          required
          placeholder='Product Hunt AI'
          className='rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
        />
        <input
          name='url'
          type='text'
          required
          placeholder='https://www.producthunt.com/categories/artificial-intelligence'
          className='rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
        />
        <select
          name='sourceType'
          defaultValue='html'
          className='rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
        >
          <option value='html'>HTML page</option>
          <option value='rss'>RSS feed</option>
          <option value='api'>API</option>
          <option value='manual'>Manual list</option>
        </select>
        <select
          name='frequency'
          defaultValue='daily'
          className='rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
        >
          <option value='manual'>Manual only</option>
          <option value='daily'>Daily</option>
          <option value='weekly'>Weekly</option>
        </select>
      </div>

      <textarea
        name='notes'
        rows={3}
        placeholder='Parsing notes, selectors, API details, or source quality notes'
        className='mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
      />

      <div className='mt-4 flex items-center justify-between gap-3'>
        <label htmlFor='collection-source-enabled' className='flex items-center gap-2 text-sm text-slate-600'>
          <input id='collection-source-enabled' name='enabled' type='checkbox' value='true' defaultChecked />
          Enabled
        </label>
        <button
          type='submit'
          disabled={loading}
          className='rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 disabled:opacity-50'
        >
          {loading ? 'Saving...' : 'Save source'}
        </button>
      </div>
    </form>
  );
}
