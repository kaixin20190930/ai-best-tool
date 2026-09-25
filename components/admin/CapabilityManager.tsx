'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { CapabilityAdminOverview } from '@/lib/services/admin/capabilities';
import {
  addToolCapabilityEvidenceLink,
  removeToolCapabilityEvidenceLink,
  saveDecisionCapability,
  saveTaskCapability,
  saveToolCapability,
} from '@/app/actions/admin/decision';

const groups = ['creation', 'editing', 'analysis', 'automation', 'collaboration', 'governance', 'delivery', 'other'];
const supportLevels = ['strong', 'partial', 'limited', 'not_supported', 'unknown'];
const availabilityLevels = ['all_plans', 'paid_only', 'enterprise_only', 'add_on', 'unknown'];

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || '').trim();
}

function Button({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type='submit'
      disabled={pending}
      className='rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'
    >
      {pending ? 'Saving...' : children}
    </button>
  );
}

function FormStatus({ message }: { message: string | null }) {
  if (!message) return null;
  const failed = message.startsWith('Error:');
  return <p className={`text-xs ${failed ? 'text-rose-700' : 'text-emerald-700'}`}>{message}</p>;
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <h2 className='font-bold text-slate-950'>{title}</h2>
      <ul className='mt-3 space-y-2 text-xs text-slate-600'>
        {items.slice(0, 20).map((item) => (
          <li key={item} className='break-all'>
            {item}
          </li>
        ))}
        {items.length === 0 ? <li>No records yet.</li> : null}
      </ul>
    </div>
  );
}

export default function CapabilityManager({ overview }: { overview: CapabilityAdminOverview }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = (operation: () => Promise<{ success: boolean; error?: string }>, success: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await operation();
      if (result.success) {
        setMessage(success);
        router.refresh();
      } else {
        setMessage(`Error: ${result.error || 'Unable to save changes.'}`);
      }
    });
  };

  return (
    <section className='space-y-6'>
      <div className='rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950'>
        These editors create or revise draft/reviewed records. Use the single Task closure below to publish or withdraw
        a reviewed group. Stored raw claims are not loaded into this browser view; link evidence by Claim ID.
      </div>
      <FormStatus message={message} />

      <div className='grid gap-6 xl:grid-cols-2'>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(
              () =>
                saveDecisionCapability({
                  id: field(data, 'id') || undefined,
                  slug: field(data, 'slug'),
                  name: field(data, 'name'),
                  description: field(data, 'description'),
                  group: field(data, 'group'),
                  status: field(data, 'status'),
                  displayOrder: Number(field(data, 'displayOrder')),
                }),
              'Capability saved.',
            );
          }}
          className='space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
        >
          <div>
            <h2 className='font-bold text-slate-950'>Capability</h2>
            <p className='text-xs text-slate-500'>Leave ID blank to create. To edit, copy a listed Capability ID.</p>
          </div>
          <input
            name='id'
            placeholder='Capability UUID (optional)'
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          />
          <input
            name='slug'
            placeholder='Stable slug, e.g. video-generation'
            required
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          />
          <input
            name='name'
            placeholder='English name'
            required
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          />
          <textarea
            name='description'
            placeholder='English boundary description'
            disabled={pending}
            rows={2}
            className='w-full rounded border p-2 text-sm'
          />
          <div className='grid grid-cols-3 gap-2'>
            <select name='group' defaultValue='creation' disabled={pending} className='rounded border p-2 text-sm'>
              {groups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
            <select name='status' defaultValue='draft' disabled={pending} className='rounded border p-2 text-sm'>
              {['draft', 'active', 'archived'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <input
              name='displayOrder'
              defaultValue='0'
              min='0'
              type='number'
              disabled={pending}
              className='rounded border p-2 text-sm'
            />
          </div>
          <Button pending={pending}>Save capability</Button>
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(
              () =>
                saveToolCapability({
                  id: field(data, 'id') || undefined,
                  toolId: field(data, 'toolId'),
                  capabilityId: field(data, 'capabilityId'),
                  supportLevel: field(data, 'supportLevel'),
                  availability: field(data, 'availability'),
                  planRequirement: field(data, 'planRequirement'),
                  limitations: field(data, 'limitations'),
                  status: field(data, 'status'),
                }),
              'Tool capability saved. Add verified evidence by ID below while it remains draft or reviewed.',
            );
          }}
          className='space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
        >
          <div>
            <h2 className='font-bold text-slate-950'>Tool Capability</h2>
            <p className='text-xs text-slate-500'>
              The Tool UUID remains a logical Neon reference; no cross-store lookup is exposed here.
            </p>
          </div>
          <input
            name='id'
            placeholder='Tool Capability UUID (optional)'
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          />
          <input
            name='toolId'
            placeholder='Tool UUID'
            required
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          />
          <select
            name='capabilityId'
            required
            defaultValue=''
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          >
            <option value='' disabled>
              Capability
            </option>
            {overview.capabilities.map((capability) => (
              <option key={capability.id} value={capability.id}>
                {capability.slug}
              </option>
            ))}
          </select>
          <div className='grid grid-cols-3 gap-2'>
            <select
              name='supportLevel'
              defaultValue='unknown'
              disabled={pending}
              className='rounded border p-2 text-sm'
            >
              {supportLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <select
              name='availability'
              defaultValue='unknown'
              disabled={pending}
              className='rounded border p-2 text-sm'
            >
              {availabilityLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <select name='status' defaultValue='draft' disabled={pending} className='rounded border p-2 text-sm'>
              {['draft', 'reviewed'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <textarea
            name='planRequirement'
            defaultValue='{}'
            rows={2}
            disabled={pending}
            className='w-full rounded border p-2 font-mono text-xs'
            aria-label='Plan requirements JSON'
          />
          <textarea
            name='limitations'
            defaultValue='[]'
            rows={2}
            disabled={pending}
            className='w-full rounded border p-2 font-mono text-xs'
            aria-label='Limitations JSON'
          />
          <Button pending={pending}>Save tool capability</Button>
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(
              () =>
                saveTaskCapability({
                  taskId: field(data, 'taskId'),
                  capabilityId: field(data, 'capabilityId'),
                  importance: field(data, 'importance'),
                  rationale: field(data, 'rationale'),
                  status: field(data, 'status'),
                }),
              'Task capability saved.',
            );
          }}
          className='space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
        >
          <div>
            <h2 className='font-bold text-slate-950'>Task Capability</h2>
            <p className='text-xs text-slate-500'>Saving the same Task/Capability pair edits it.</p>
          </div>
          <select
            name='taskId'
            required
            defaultValue=''
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          >
            <option value='' disabled>
              Task
            </option>
            {overview.taskOptions.map((task) => (
              <option key={task.id} value={task.id}>
                {task.slug}
              </option>
            ))}
          </select>
          <select
            name='capabilityId'
            required
            defaultValue=''
            disabled={pending}
            className='w-full rounded border p-2 text-sm'
          >
            <option value='' disabled>
              Capability
            </option>
            {overview.capabilities.map((capability) => (
              <option key={capability.id} value={capability.id}>
                {capability.slug}
              </option>
            ))}
          </select>
          <div className='grid grid-cols-2 gap-2'>
            <select
              name='importance'
              defaultValue='preferred'
              disabled={pending}
              className='rounded border p-2 text-sm'
            >
              {['required', 'preferred', 'contextual'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select name='status' defaultValue='draft' disabled={pending} className='rounded border p-2 text-sm'>
              {['draft', 'reviewed'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <textarea
            name='rationale'
            defaultValue='{}'
            rows={2}
            disabled={pending}
            className='w-full rounded border p-2 font-mono text-xs'
            aria-label='Rationale JSON'
          />
          <Button pending={pending}>Save task capability</Button>
        </form>

        <div className='space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
          <div>
            <h2 className='font-bold text-slate-950'>Evidence association</h2>
            <p className='text-xs text-slate-500'>
              Add or remove by verified Claim UUID. Published capability links are locked.
            </p>
          </div>
          {(['add', 'remove'] as const).map((mode) => (
            <form
              key={mode}
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const input = {
                  toolCapabilityId: field(data, 'toolCapabilityId'),
                  claimId: field(data, 'claimId'),
                  purpose: field(data, 'purpose'),
                };
                run(
                  () =>
                    mode === 'add' ? addToolCapabilityEvidenceLink(input) : removeToolCapabilityEvidenceLink(input),
                  mode === 'add' ? 'Evidence association saved.' : 'Evidence association removed.',
                );
              }}
              className='grid gap-2 sm:grid-cols-4'
            >
              <input
                name='toolCapabilityId'
                required
                placeholder='Tool Capability UUID'
                disabled={pending}
                className='rounded border p-2 text-xs sm:col-span-2'
              />
              <input
                name='claimId'
                required
                placeholder='Claim UUID'
                disabled={pending}
                className='rounded border p-2 text-xs'
              />
              <select name='purpose' defaultValue='support' disabled={pending} className='rounded border p-2 text-xs'>
                {['support', 'availability', 'plan', 'limitation', 'other'].map((purpose) => (
                  <option key={purpose}>{purpose}</option>
                ))}
              </select>
              <button
                type='submit'
                disabled={pending}
                className='rounded border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50 sm:col-span-4'
              >
                {pending ? 'Saving...' : `${mode === 'add' ? 'Add' : 'Remove'} association`}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <List
          title='Capabilities'
          items={overview.capabilities.map(
            (capability) => `${capability.slug} · ${capability.status} · ${capability.id}`,
          )}
        />
        <List
          title='Tool capabilities'
          items={overview.toolCapabilities.map(
            (item) => `${item.toolId} · ${item.status} · ${item.evidenceCount} evidence · ${item.id}`,
          )}
        />
        <List
          title='Task capabilities'
          items={overview.taskCapabilities.map((item) => `${item.taskSlug} · ${item.importance} · ${item.status}`)}
        />
      </div>
    </section>
  );
}
