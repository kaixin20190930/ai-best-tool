'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { CapabilityAdminOverview } from '@/lib/services/admin/capabilities';
import {
  transitionReviewedTaskToolGroup,
  withdrawPublishedTaskToolGroup,
  type ClusterEvidenceSummary,
} from '@/app/actions/admin/decision';

const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const candidates = [
  {
    label: 'Gemini Notebook',
    toolId: 'cec78907-e2a1-4eb7-853a-a58334026280',
    toolCapabilityIds: ['c7890701-0000-4000-8000-000000000201', 'c7890701-0000-4000-8000-000000000202'],
    fitId: 'c7890701-0000-4000-8000-000000000301',
  },
  {
    label: 'Perplexity',
    toolId: '3d018623-85f9-4df4-bd55-9a4a0e7a2d93',
    toolCapabilityIds: ['d0186230-0000-4000-8000-000000000201', 'd0186230-0000-4000-8000-000000000202'],
    fitId: 'd0186230-0000-4000-8000-000000000301',
  },
];

export default function ReviewedTaskToolGroupRelease({ overview }: { overview: CapabilityAdminOverview }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toolId, setToolId] = useState(candidates[0].toolId);
  const [operation, setOperation] = useState<'publish' | 'withdraw'>('publish');
  const [qaReference, setQaReference] = useState('');
  const [message, setMessage] = useState('');
  const [evidence, setEvidence] = useState<ClusterEvidenceSummary[]>([]);
  const candidate = candidates.find((item) => item.toolId === toolId) || candidates[0];
  const capabilities = overview.toolCapabilities
    .filter((row) => row.toolId === candidate.toolId && candidate.toolCapabilityIds.includes(row.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  const fit = overview.fits.find((row) => row.id === candidate.fitId && row.taskId === taskId);
  const expectedStatus = operation === 'publish' ? 'reviewed' : 'published';
  const manifestReady =
    capabilities.length === candidate.toolCapabilityIds.length &&
    capabilities.every((row) => row.status === expectedStatus && row.updatedAt) &&
    fit?.status === expectedStatus &&
    Boolean(fit.updatedAt);

  const run = (preflight: boolean) => {
    setMessage(
      preflight
        ? `Checking exact ${expectedStatus} group…`
        : `${operation === 'publish' ? 'Publishing' : 'Withdrawing'} exact group…`,
    );
    startTransition(async () => {
      const result =
        operation === 'publish'
          ? await transitionReviewedTaskToolGroup({
              taskId,
              toolId: candidate.toolId,
              toolCapabilities: capabilities.map((row) => ({
                id: row.id,
                updated_at: row.updatedAt,
                status: 'reviewed',
              })),
              fits: fit ? [{ id: fit.id, updated_at: fit.updatedAt, status: 'reviewed' }] : [],
              qaReference,
              preflight,
            })
          : await withdrawPublishedTaskToolGroup({
              taskId,
              toolId: candidate.toolId,
              toolCapabilities: capabilities.map((row) => ({
                id: row.id,
                updated_at: row.updatedAt,
                status: 'published',
              })),
              fits: fit ? [{ id: fit.id, updated_at: fit.updatedAt, status: 'published' }] : [],
              withdrawalReference: qaReference,
              preflight,
            });
      setMessage(result.success ? result.summary || 'Complete.' : `Error: ${result.error || 'Request failed.'}`);
      const returnedEvidence = (result as { evidence?: ClusterEvidenceSummary[] }).evidence;
      setEvidence(result.success && Array.isArray(returnedEvidence) ? returnedEvidence : []);
      if (result.success && !preflight) router.refresh();
    });
  };

  return (
    <section className='space-y-3 rounded-xl border border-cyan-200 bg-white p-4 shadow-sm'>
      <div>
        <h3 className='font-semibold text-slate-950'>CL-02 reviewed tool group release</h3>
        <p className='mt-1 text-xs leading-5 text-slate-600'>
          This action publishes one exact Tool Capability and Fit group after independent QA. It does not publish the
          Task or change Task Capabilities, directory indexing, or sitemap eligibility.
        </p>
      </div>
      <label htmlFor='reviewed-tool-group' className='block text-xs font-medium text-slate-700'>
        Reviewed tool group
        <select
          id='reviewed-tool-group'
          aria-label='Reviewed tool group'
          value={toolId}
          onChange={(event) => {
            setToolId(event.target.value);
            setEvidence([]);
            setMessage('');
          }}
          disabled={pending}
          className='mt-1 block w-full rounded border p-2 text-sm'
        >
          {candidates.map((item) => (
            <option key={item.toolId} value={item.toolId}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor='reviewed-group-operation' className='block text-xs font-medium text-slate-700'>
        Operation
        <select
          id='reviewed-group-operation'
          aria-label='Reviewed group operation'
          value={operation}
          onChange={(event) => {
            setOperation(event.target.value as 'publish' | 'withdraw');
            setEvidence([]);
            setMessage('');
          }}
          disabled={pending}
          className='mt-1 block w-full rounded border p-2 text-sm'
        >
          <option value='publish'>Publish reviewed group</option>
          <option value='withdraw'>Withdraw published group to stale</option>
        </select>
      </label>
      <div className='rounded bg-slate-50 p-3 font-mono text-[11px] text-slate-700'>
        <p>Tool Capability IDs and updated_at ({expectedStatus} preimage):</p>
        {capabilities.map((row) => (
          <p key={row.id}>
            {row.id} · {row.updatedAt} · {row.status}
          </p>
        ))}
        <p className='mt-1'>Fit: {fit ? `${fit.id} · ${fit.updatedAt} · ${fit.status}` : 'missing'}</p>
      </div>
      {!manifestReady && (
        <p className='text-xs text-amber-800'>Exact reviewed relation preimage is incomplete or stale.</p>
      )}
      <label htmlFor='reviewed-group-qa-reference' className='block text-xs font-medium text-slate-700'>
        {operation === 'publish' ? 'Independent QA reference required to publish' : 'Withdrawal reason or QA reference'}
        <input
          id='reviewed-group-qa-reference'
          aria-label='Independent QA reference for reviewed tool group publication'
          value={qaReference}
          onChange={(event) => setQaReference(event.target.value)}
          disabled={pending}
          placeholder='QA report or review record reference'
          className='mt-1 block w-full rounded border p-2 text-sm'
        />
      </label>
      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          disabled={pending || !manifestReady}
          onClick={() => run(true)}
          className='rounded bg-slate-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
        >
          Read-only preflight
        </button>
        <button
          type='button'
          disabled={pending || !manifestReady || qaReference.trim().length < 8}
          onClick={() => run(false)}
          className='rounded bg-cyan-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
        >
          {operation === 'publish' ? 'Publish reviewed group' : 'Withdraw published group'}
        </button>
      </div>
      <p role='status' className={`text-xs ${message.startsWith('Error:') ? 'text-rose-700' : 'text-slate-700'}`}>
        {message}
      </p>
      {evidence.length > 0 && (
        <p className='text-xs text-slate-600'>
          Read-only preflight verified {evidence.length} exact official evidence links across both relation types.
        </p>
      )}
    </section>
  );
}
