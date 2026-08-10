'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

type ProjectOption = {
  id: string;
  name: string;
  websiteUrl: string | null;
  status?: string;
  updatedAt?: string | null;
};

type DistributionProjectSwitcherProps = {
  locale: string;
  projects: ProjectOption[];
  selectedProjectId: string | null;
  selectedProjectName?: string | null;
  selectedProjectUpdatedAt?: string | null;
  selectedProjectUrl?: string | null;
  selectedProjectStatus?: string | null;
  totalTasks: number;
  readyTasks?: number;
  className?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return '未更新';
  return value.slice(0, 10);
}

function buildUrl(pathname: string, searchParams: URLSearchParams | null, nextProjectId: string) {
  const params = new URLSearchParams(searchParams?.toString() || '');
  if (nextProjectId) {
    params.set('project', nextProjectId);
  } else {
    params.delete('project');
  }
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ''}`;
}

export default function DistributionProjectSwitcher({
  locale,
  projects,
  selectedProjectId,
  selectedProjectName,
  selectedProjectUpdatedAt,
  selectedProjectUrl,
  selectedProjectStatus,
  totalTasks,
  readyTasks,
  className = '',
}: DistributionProjectSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => String(a.name).localeCompare(String(b.name))), [projects]);

  if (sortedProjects.length <= 1) {
    if (sortedProjects.length === 0) {
      return null;
    }
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
        <div className='text-xs font-semibold text-slate-600'>{locale === 'cn' ? '当前项目' : 'Current project'}</div>
        <div className='mt-1 text-sm font-semibold text-slate-900'>{selectedProjectName || (locale === 'cn' ? '未选择项目' : 'No project selected')}</div>
        <div className='mt-1 text-xs text-slate-500'>{selectedProjectUrl || '--'}</div>
        <div className='mt-2 flex flex-wrap gap-2 text-xs text-slate-600'>
          <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1'>{locale === 'cn' ? '任务数' : 'Tasks'}: {totalTasks}</span>
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700'>
            <CheckCircle2 className='h-3.5 w-3.5' /> {locale === 'cn' ? '可处理' : 'Ready'}: {readyTasks ?? totalTasks}
          </span>
          <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700'>
            <Clock3 className='h-3.5 w-3.5' /> {locale === 'cn' ? '上次更新' : 'Updated'}: {formatDate(selectedProjectUpdatedAt)}
          </span>
          {selectedProjectStatus ? <span className='inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700'>{selectedProjectStatus}</span> : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <div className='text-xs font-bold uppercase tracking-[0.16em] text-slate-500'>{locale === 'cn' ? '当前项目' : 'Current project'}</div>
          <div className='mt-1 text-sm font-semibold text-slate-900'>
            {selectedProjectName || (locale === 'cn' ? '未选择项目' : 'No project selected')}
          </div>
          <div className='mt-1 text-xs text-slate-500'>{selectedProjectUrl || '--'}</div>
          <div className='mt-2 flex flex-wrap gap-2 text-xs text-slate-600'>
            <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1'>{locale === 'cn' ? '任务数' : 'Tasks'}: {totalTasks}</span>
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700'>
              <CheckCircle2 className='h-3.5 w-3.5' /> {locale === 'cn' ? '可处理' : 'Ready'}: {readyTasks ?? totalTasks}
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700'>
              <Clock3 className='h-3.5 w-3.5' /> {locale === 'cn' ? '上次更新' : 'Updated'}: {formatDate(selectedProjectUpdatedAt)}
            </span>
            {selectedProjectStatus ? <span className='inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700'>{selectedProjectStatus}</span> : null}
          </div>
        </div>
        <div className='min-w-[240px]'>
        <label className='text-[11px] font-semibold text-slate-600'>
            {locale === 'cn' ? '切换项目' : 'Switch product'}
            <select
              className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs'
              value={selectedProjectId || ''}
              disabled={isPending}
              onChange={(event) => {
                const nextProjectId = event.currentTarget.value;
                startTransition(() => {
                  router.push(buildUrl(pathname || '', searchParams, nextProjectId));
                });
              }}
            >
              {sortedProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} · {project.status || 'active'}
                </option>
              ))}
            </select>
          </label>
          <div className='mt-1 flex min-h-4 items-center justify-end text-[11px] text-slate-500'>
            {isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : null}
            {isPending ? <span className='ml-1'>{locale === 'cn' ? '正在切换…' : 'Switching…'}</span> : null}
          </div>
        </div>
      </div>

      {sortedProjects.length > 4 ? (
        <div className='mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500'>
          <button
            type='button'
            onClick={() => setIsExpanded((current) => !current)}
            className='font-semibold text-slate-700 hover:text-slate-900'
          >
            {isExpanded ? (locale === 'cn' ? '收起项目列表' : 'Collapse projects') : (locale === 'cn' ? '展开更多项目' : 'Expand projects')}
          </button>
          {isExpanded ? (
            <div className='mt-2 grid gap-2 sm:grid-cols-2'>
              {sortedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={buildUrl(pathname || '', searchParams, project.id)}
                  className={`rounded-xl border px-2.5 py-1.5 text-xs hover:border-cyan-300 hover:bg-cyan-50 ${
                    project.id === selectedProjectId ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className='font-semibold text-slate-900'>{project.name}</div>
                  <div className='text-slate-500'>{project.websiteUrl || '--'}</div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
