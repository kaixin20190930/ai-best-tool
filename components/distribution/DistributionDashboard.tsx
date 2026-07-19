'use client';

import { useState } from 'react';
import { ExternalLink, Link2, Plus, Radar, Send, ShieldCheck } from 'lucide-react';

import {
  createDistributionTask,
  recordDistributionResult,
  updateDistributionTaskStatus,
  type DistributionDashboard as DistributionDashboardData,
} from '@/app/actions/distribution';

const statusOptions = ['planned', 'in_progress', 'submitted', 'live', 'follow_up', 'done', 'skipped'];

export default function DistributionDashboard({ data }: { data: DistributionDashboardData }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200/60 sm:p-8'>
        <div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-end'>
          <div className='max-w-2xl'>
            <div className='mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300'>
              <Radar className='h-4 w-4' /> Distribution control room
            </div>
            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Know where to promote today.</h1>
            <p className='mt-3 text-sm leading-6 text-slate-300 sm:text-base'>
              Plan human-led distribution across directories, communities, content, and launch channels. Record the evidence, next follow-up, and link quality in one place.
            </p>
          </div>
          <button
            type='button'
            onClick={() => setShowForm((visible) => !visible)}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200'
          >
            <Plus className='h-4 w-4' /> Add promotion task
          </button>
        </div>
        <div className='mt-8 grid gap-3 sm:grid-cols-4'>
          {[
            ['Tasks tracked', data.metrics.total],
            ['Due today', data.metrics.dueToday],
            ['Live mentions', data.metrics.live],
            ['Follow-ups', data.metrics.followUp],
          ].map(([label, value]) => (
            <div key={String(label)} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='text-2xl font-bold'>{value}</div>
              <div className='mt-1 text-xs text-slate-400'>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {showForm ? (
        <form action={createDistributionTask} className='rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'>
          <div className='mb-4 flex items-center gap-2 text-sm font-bold text-slate-900'><Send className='h-4 w-4 text-cyan-700' /> Create a focused next action</div>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='text-sm font-semibold text-slate-700 md:col-span-2'>
              Task title
              <input name='title' required placeholder='Pitch the product to a relevant newsletter' className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2' />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Channel
              <select name='channelId' required className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'>
                <option value=''>Choose a channel</option>
                {data.channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Priority
              <select name='priority' defaultValue='p1' className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'>
                <option value='p0'>P0: high leverage</option><option value='p1'>P1: important</option><option value='p2'>P2: experiment</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Due date
              <input name='dueDate' type='date' className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2' />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Preparation note
              <input name='instructions' placeholder='What proof or copy is needed?' className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2' />
            </label>
          </div>
          <p className='mt-4 text-xs leading-5 text-slate-500'>No automatic posting. The workspace keeps the human decision and evidence trail visible.</p>
          <button className='mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800'>Save task</button>
        </form>
      ) : null}

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Today&apos;s operating board</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>{data.project?.name || 'Product'} <span className='font-normal text-slate-400'>/ {data.workspace?.name || 'Workspace'}</span></h2>
          </div>
          <div className='text-xs text-slate-500'>Keep one task tied to one channel and one next action.</div>
        </div>

        {data.tasks.length === 0 ? (
          <div className='mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500'>Add the first promotion task to start the daily queue.</div>
        ) : (
          <div className='mt-6 space-y-3'>
            {data.tasks.map((task) => (
              <article key={task.id} className='rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:shadow-sm'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide'>
                      <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>{task.channelName}</span>
                      <span className={`rounded-full px-2.5 py-1 ${task.priority === 'p0' ? 'bg-rose-50 text-rose-700' : 'bg-cyan-50 text-cyan-700'}`}>{task.priority}</span>
                    </div>
                    <h3 className='mt-3 text-base font-bold text-slate-950'>{task.title}</h3>
                    {task.instructions ? <p className='mt-1 text-sm leading-5 text-slate-600'>{task.instructions}</p> : null}
                    <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500'>
                      <span>Due: {task.dueDate || 'not scheduled'}</span>
                      {task.liveUrl ? <a href={task.liveUrl} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline'><ExternalLink className='h-3 w-3' /> Live result</a> : null}
                      {task.linkStatus ? <span className='inline-flex items-center gap-1'><Link2 className='h-3 w-3' /> {task.linkStatus}</span> : null}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2 lg:justify-end'>
                    <form action={updateDistributionTaskStatus}>
                      <input type='hidden' name='taskId' value={task.id} />
                      <select name='status' defaultValue={task.status} className='rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700'>
                        {statusOptions.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                      </select>
                      <button className='ml-2 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200'>Update</button>
                    </form>
                    <details className='rounded-lg border border-slate-200 px-2.5 py-2 text-xs'>
                      <summary className='cursor-pointer font-bold text-slate-700'>Record result</summary>
                      <form action={recordDistributionResult} className='mt-3 w-64 space-y-2'>
                        <input type='hidden' name='taskId' value={task.id} />
                        <input name='liveUrl' type='url' placeholder='https://...' className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400' />
                        <select name='linkStatus' defaultValue='pending' className='w-full rounded-lg border border-slate-200 px-2.5 py-2'><option value='pending'>Pending review</option><option value='live'>Live</option><option value='nofollow'>Nofollow</option><option value='rejected'>Rejected</option><option value='removed'>Removed</option></select>
                        <input name='notes' placeholder='Evidence or next follow-up' className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400' />
                        <button className='w-full rounded-lg bg-cyan-700 px-2.5 py-2 font-bold text-white hover:bg-cyan-800'>Save result</button>
                      </form>
                    </details>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='flex items-center gap-2 text-sm font-bold text-slate-900'><ShieldCheck className='h-4 w-4 text-emerald-600' /> Quality guardrails</div>
          <ul className='mt-3 space-y-2 text-sm leading-5 text-slate-600'>
            <li>Use the right channel for the right audience.</li><li>Record disclosure and link status.</li><li>Do not duplicate promotional copy or automate community posting.</li>
          </ul>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='text-sm font-bold text-slate-900'>Channel playbook</div>
          <div className='mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4'>
            {data.channels.map((channel) => <div key={channel.id} className='rounded-xl bg-slate-50 px-3 py-2'>{channel.name}</div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
