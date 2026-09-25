'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { CapabilityAdminOverview } from '@/lib/services/admin/capabilities';
import CL01_TASK_SLUGS from '@/lib/services/decision/cl01Scope';
import {
  changeClusterFitEvidenceLink,
  intakeOfficialDecisionEvidence,
  rereviewDecisionCapability,
  saveClusterFit,
  transitionDecisionCluster,
  type ClusterEvidenceSummary,
  type ClusterManifest,
} from '@/app/actions/admin/decision';

function value(data: FormData, key: string): string {
  return String(data.get(key) || '').trim();
}

export default function DecisionClusterClosure({ overview }: { overview: CapabilityAdminOverview }) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [taskId, setTaskId] = useState('');
  const [operation, setOperation] = useState<'publish' | 'withdraw'>('publish');
  const [chosen, setChosen] = useState<string[]>([]);
  const [qaReference, setQaReference] = useState('');
  const [preflightKey, setPreflightKey] = useState('');
  const [preflightEvidence, setPreflightEvidence] = useState<ClusterEvidenceSummary[]>([]);

  const execute = (
    work: () => Promise<{ success: boolean; error?: string; id?: string; summary?: string }>,
    label: string,
  ) => {
    if (busy.current) return;
    busy.current = true;
    setMessage(`${label}…`);
    startTransition(async () => {
      try {
        const result = await work();
        setMessage(
          result.success
            ? `${label} complete${result.id ? ` · claim ${result.id}` : ''}${result.summary ? ` · ${result.summary}` : ''}`
            : `Error: ${result.error || `${label} failed`}`,
        );
        if (result.success) {
          if (label !== 'Cluster preflight') {
            setPreflightKey('');
            setPreflightEvidence([]);
          }
          router.refresh();
        }
      } catch (error) {
        setMessage(`Error: ${error instanceof Error ? error.message : `${label} failed`}`);
      } finally {
        busy.current = false;
      }
    });
  };

  const expected = operation === 'publish' ? 'reviewed' : 'published';
  const tasks = overview.taskCapabilities.filter((row) => row.taskId === taskId && row.status === expected);
  const fits = overview.fits.filter((row) => row.taskId === taskId && row.status === expected);
  const tools = overview.toolCapabilities.filter(
    (row) =>
      row.status === expected &&
      tasks.some((task) => task.capabilityId === row.capabilityId) &&
      fits.some((fit) => fit.toolId === row.toolId),
  );
  const key = `${taskId}:${operation}:${chosen.slice().sort().join(',')}:${[...tasks, ...fits, ...tools]
    .map((row) => row.updatedAt)
    .join(',')}`;

  const manifest = (): ClusterManifest => ({
    taskId,
    operation,
    qaReference,
    taskCapabilities: tasks
      .filter((row) => chosen.includes(`task:${row.capabilityId}`))
      .map((row) => ({ id: row.capabilityId, status: expected, updated_at: row.updatedAt })),
    toolCapabilities: tools
      .filter((row) => chosen.includes(`tool:${row.id}`))
      .map((row) => ({ id: row.id, status: expected, updated_at: row.updatedAt })),
    fits: fits
      .filter((row) => chosen.includes(`fit:${row.id}`))
      .map((row) => ({ id: row.id, status: expected, updated_at: row.updatedAt })),
  });

  const toggle = (id: string) => {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setPreflightKey('');
    setPreflightEvidence([]);
  };

  return (
    <section className='space-y-5 rounded-xl border border-cyan-200 bg-white p-5 shadow-sm'>
      <div>
        <h2 className='text-lg font-bold text-slate-950'>Single Task editorial closure</h2>
        <p className='text-xs text-slate-600'>
          Select exact reviewed or published IDs. Preflight checks current evidence and ownership. Publication requires
          an independent QA report reference.
        </p>
      </div>
      <p role='status' className={`text-xs ${message.startsWith('Error:') ? 'text-rose-700' : 'text-emerald-700'}`}>
        {message}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          execute(
            () =>
              intakeOfficialDecisionEvidence({
                profileId: value(data, 'profileId'),
                url: value(data, 'url'),
                label: value(data, 'label'),
                claimType: value(data, 'claimType'),
                claimKey: value(data, 'claimKey'),
                claimValue: value(data, 'claimValue'),
                excerpt: value(data, 'excerpt'),
                validityScope: value(data, 'validityScope'),
                reviewDueAt: new Date(value(data, 'reviewDueAt')).toISOString(),
              }),
            'Official evidence intake',
          );
        }}
        className='grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2'
      >
        <h3 className='font-semibold sm:col-span-2'>Manual official evidence</h3>
        <input
          name='profileId'
          aria-label='Existing tool profile UUID'
          required
          placeholder='Existing tool profile UUID'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <input
          name='url'
          aria-label='Official source URL'
          required
          type='url'
          placeholder='https://official-domain.example/features'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <input
          name='label'
          aria-label='Official source label'
          required
          placeholder='Official source label'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <input
          name='claimType'
          aria-label='Claim type'
          required
          placeholder='Claim type, e.g. feature'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <input
          name='claimKey'
          aria-label='Stable claim key'
          required
          placeholder='Stable claim key'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <input
          name='claimValue'
          aria-label='Direct fact claim value'
          required
          placeholder='Direct fact / claim value'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <textarea
          name='excerpt'
          aria-label='Exact official source passage'
          required
          placeholder='Exact source passage reviewed by editor'
          disabled={pending}
          className='rounded border p-2 text-xs sm:col-span-2'
        />
        <input
          name='validityScope'
          required
          placeholder='{"plan":"all plans"}'
          aria-label='Validity scope JSON'
          disabled={pending}
          className='rounded border p-2 font-mono text-xs'
        />
        <input
          name='reviewDueAt'
          required
          type='datetime-local'
          aria-label='Review due at'
          disabled={pending}
          className='rounded border p-2 text-xs'
        />
        <button
          type='submit'
          disabled={pending}
          className='rounded bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2'
        >
          Save verified official claim
        </button>
      </form>

      <div className='grid gap-2 sm:grid-cols-2'>
        <select
          aria-label='Task cluster'
          value={taskId}
          onChange={(event) => {
            setTaskId(event.target.value);
            setChosen([]);
            setPreflightKey('');
            setPreflightEvidence([]);
          }}
          disabled={pending}
          className='rounded border p-2 text-sm'
        >
          <option value=''>Choose one Task</option>
          {overview.taskOptions
            .filter((task) => CL01_TASK_SLUGS.has(task.slug))
            .map((task) => (
              <option key={task.id} value={task.id}>
                {task.slug}
              </option>
            ))}
        </select>
        <select
          aria-label='Cluster operation'
          value={operation}
          onChange={(event) => {
            setOperation(event.target.value as 'publish' | 'withdraw');
            setChosen([]);
            setPreflightKey('');
            setPreflightEvidence([]);
          }}
          disabled={pending}
          className='rounded border p-2 text-sm'
        >
          <option value='publish'>Publish reviewed group</option>
          <option value='withdraw'>Withdraw published group</option>
        </select>
      </div>
      {taskId ? (
        <div className='grid gap-3 lg:grid-cols-2'>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              execute(
                () =>
                  saveClusterFit({
                    id: value(data, 'fitId') || undefined,
                    taskId,
                    toolId: value(data, 'toolId'),
                    fitLevel: value(data, 'fitLevel'),
                    rationale: value(data, 'rationale'),
                    requiredConditions: value(data, 'requiredConditions'),
                    disqualifiers: value(data, 'disqualifiers'),
                    status: value(data, 'status'),
                  }),
                'Fit review',
              );
            }}
            className='grid gap-2 rounded-lg border p-3'
          >
            <h3 className='text-sm font-semibold'>Fit content</h3>
            <input
              name='fitId'
              aria-label='Existing Fit UUID or blank to create'
              placeholder='Fit UUID (blank to create)'
              disabled={pending}
              className='rounded border p-2 text-xs'
            />
            <input
              name='toolId'
              aria-label='Directory Tool UUID for Fit'
              required
              placeholder='Directory Tool UUID'
              disabled={pending}
              className='rounded border p-2 text-xs'
            />
            <div className='grid grid-cols-2 gap-2'>
              <select
                name='fitLevel'
                aria-label='Fit level'
                defaultValue='conditional'
                disabled={pending}
                className='rounded border p-2 text-xs'
              >
                {['strong', 'conditional', 'weak', 'not_fit'].map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
              <select
                name='status'
                aria-label='Fit editorial status'
                defaultValue='reviewed'
                disabled={pending}
                className='rounded border p-2 text-xs'
              >
                {['draft', 'reviewed'].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <textarea
              name='rationale'
              required
              defaultValue='{"en":""}'
              aria-label='Fit rationale JSON'
              disabled={pending}
              className='rounded border p-2 font-mono text-xs'
            />
            <textarea
              name='requiredConditions'
              required
              defaultValue='[]'
              aria-label='Fit required conditions JSON'
              disabled={pending}
              className='rounded border p-2 font-mono text-xs'
            />
            <textarea
              name='disqualifiers'
              required
              defaultValue='[]'
              aria-label='Fit disqualifiers JSON'
              disabled={pending}
              className='rounded border p-2 font-mono text-xs'
            />
            <button
              type='submit'
              disabled={pending}
              className='rounded border px-3 py-2 text-xs font-semibold disabled:opacity-50'
            >
              Save draft/reviewed Fit
            </button>
          </form>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              execute(
                () =>
                  changeClusterFitEvidenceLink({
                    fitId: value(data, 'fitId'),
                    claimId: value(data, 'claimId'),
                    purpose: value(data, 'purpose'),
                    mode: value(data, 'mode') as 'add' | 'remove',
                  }),
                'Fit evidence link',
              );
            }}
            className='grid content-start gap-2 rounded-lg border p-3'
          >
            <h3 className='text-sm font-semibold'>Fit evidence association</h3>
            <p className='text-xs text-slate-600'>
              Use the verified claim UUID from official intake. Fit and limitation purposes are required before
              publication.
            </p>
            <input
              name='fitId'
              aria-label='Fit UUID for evidence association'
              required
              placeholder='Fit UUID'
              disabled={pending}
              className='rounded border p-2 text-xs'
            />
            <input
              name='claimId'
              aria-label='Verified claim UUID for Fit'
              required
              placeholder='Claim UUID'
              disabled={pending}
              className='rounded border p-2 text-xs'
            />
            <div className='grid grid-cols-2 gap-2'>
              <select
                name='purpose'
                aria-label='Fit evidence purpose'
                defaultValue='fit'
                disabled={pending}
                className='rounded border p-2 text-xs'
              >
                {['fit', 'limitation', 'cost', 'setup', 'privacy', 'export', 'replacement', 'other'].map((purpose) => (
                  <option key={purpose}>{purpose}</option>
                ))}
              </select>
              <select
                name='mode'
                aria-label='Add or remove Fit evidence association'
                defaultValue='add'
                disabled={pending}
                className='rounded border p-2 text-xs'
              >
                <option value='add'>Add</option>
                <option value='remove'>Remove</option>
              </select>
            </div>
            <button
              type='submit'
              disabled={pending}
              className='rounded border px-3 py-2 text-xs font-semibold disabled:opacity-50'
            >
              Update Fit link
            </button>
          </form>
        </div>
      ) : null}
      <div className='grid gap-3 lg:grid-cols-3'>
        {(
          [
            [
              'Task Capability',
              tasks.map((row) => ({
                key: `task:${row.capabilityId}`,
                text: `${row.capabilityId} · ${row.importance}`,
              })),
            ],
            [
              'Tool Capability',
              tools.map((row) => ({ key: `tool:${row.id}`, text: `${row.id} · ${row.toolId} · ${row.supportLevel}` })),
            ],
            ['Fit', fits.map((row) => ({ key: `fit:${row.id}`, text: `${row.id} · ${row.toolId}` }))],
          ] as const
        ).map(([title, rows]) => (
          <fieldset key={title} className='space-y-2 rounded-lg border p-3'>
            <legend className='px-1 text-sm font-semibold'>{title}</legend>
            {rows.length ? (
              rows.map((row) => (
                <label key={row.key} htmlFor={row.key} className='flex gap-2 break-all text-xs'>
                  <input
                    id={row.key}
                    type='checkbox'
                    checked={chosen.includes(row.key)}
                    onChange={() => toggle(row.key)}
                    disabled={pending}
                  />
                  {row.text}
                </label>
              ))
            ) : (
              <p className='text-xs text-slate-500'>No {expected} rows for this Task.</p>
            )}
          </fieldset>
        ))}
      </div>
      <input
        aria-label='Independent QA report reference'
        value={qaReference}
        onChange={(event) => setQaReference(event.target.value)}
        placeholder='Independent QA report reference (publication)'
        disabled={pending}
        className='w-full rounded border p-2 text-sm'
      />
      {preflightKey === key ? (
        <section
          className='space-y-3 rounded-lg border border-cyan-300 bg-cyan-50 p-3 text-xs text-slate-800'
          aria-label='Selected evidence preflight'
        >
          <h3 className='text-sm font-semibold'>Evidence bound to this exact manifest</h3>
          <p>
            Task Capability IDs:{' '}
            {manifest()
              .taskCapabilities.map((item) => item.id)
              .join(', ')}
            . Task Capability has no claim-link table; review its rationale separately.
          </p>
          {preflightEvidence.length ? (
            <ul className='space-y-2'>
              {preflightEvidence.map((item) => (
                <li
                  key={`${item.entity}:${item.relationId}:${item.claimId}:${item.purpose}`}
                  className='break-all rounded border border-cyan-200 bg-white p-2'
                >
                  <p>
                    <strong>{item.entity}</strong> {item.relationId} · purpose <strong>{item.purpose}</strong> · claim{' '}
                    {item.claimId}
                  </p>
                  <p>
                    Official source URL: {item.sourceUrl} · canonical: {item.canonicalUrl || 'missing'} · official:{' '}
                    {item.officialSource ? 'yes' : 'no'} · owner matches: {item.ownerMatches ? 'yes' : 'no'}
                  </p>
                  <p>
                    Verification: {item.verificationStatus} · verified: {item.verifiedAt || 'missing'} · review due:{' '}
                    {item.reviewDueAt || 'missing'} · expires: {item.expiresAt || 'not set'}
                  </p>
                  <p>Validity scope: {JSON.stringify(item.validityScope)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No linked claim evidence is present in this selected manifest.</p>
          )}
        </section>
      ) : null}
      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          disabled={pending || !taskId}
          onClick={() => {
            const snapshot = key;
            execute(async () => {
              const result = await transitionDecisionCluster({ ...manifest(), preflight: true });
              setPreflightKey(result.success ? snapshot : '');
              setPreflightEvidence(result.success ? result.evidence || [] : []);
              return result;
            }, 'Cluster preflight');
          }}
          className='rounded border px-3 py-2 text-sm font-semibold disabled:opacity-50'
        >
          Preflight selected group
        </button>
        <button
          type='button'
          disabled={pending || preflightKey !== key || (operation === 'publish' && qaReference.trim().length < 8)}
          onClick={() =>
            execute(
              async () => {
                const result = await transitionDecisionCluster({ ...manifest(), preflight: false });
                setPreflightKey('');
                return result;
              },
              operation === 'publish' ? 'Atomic publication' : 'Atomic withdrawal',
            )
          }
          className='rounded bg-cyan-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50'
        >
          {operation === 'publish' ? 'Publish selected group' : 'Withdraw selected group'}
        </button>
      </div>
      <div className='space-y-2 border-t pt-3'>
        <h3 className='text-sm font-semibold'>Re-review stale capabilities</h3>
        {overview.taskCapabilities
          .filter((row) => row.status === 'stale' && row.taskId === taskId)
          .map((row) => (
            <button
              type='button'
              key={row.capabilityId}
              disabled={pending}
              onClick={() =>
                execute(
                  () => rereviewDecisionCapability({ entity: 'task', taskId, id: row.capabilityId }),
                  'Task Capability re-review',
                )
              }
              className='mr-2 rounded border px-2 py-1 text-xs disabled:opacity-50'
            >
              Task {row.capabilityId}
            </button>
          ))}
        {overview.toolCapabilities
          .filter(
            (row) =>
              row.status === 'stale' &&
              overview.taskCapabilities.some(
                (task) => task.taskId === taskId && task.capabilityId === row.capabilityId,
              ),
          )
          .map((row) => (
            <button
              type='button'
              key={row.id}
              disabled={pending}
              onClick={() =>
                execute(() => rereviewDecisionCapability({ entity: 'tool', id: row.id }), 'Tool Capability re-review')
              }
              className='mr-2 rounded border px-2 py-1 text-xs disabled:opacity-50'
            >
              Tool {row.id}
            </button>
          ))}
      </div>
    </section>
  );
}
