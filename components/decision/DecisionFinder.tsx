'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowRight, CheckCircle2, CircleDollarSign, Loader2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

import type { DecisionTaskOption } from '@/lib/services/decision/repository';
import type { DecisionFinderConstraints } from '@/lib/services/decision/rules';
import { Button } from '@/components/ui/button';
import { runDecisionFinderAction, type DecisionFinderActionResult } from '@/app/actions/decision';
import { Link } from '@/app/navigation';

const STORAGE_KEY = 'aibesttool:decision-finder:v1';
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

interface FinderState {
  taskId: string;
  constraints: DecisionFinderConstraints;
  result: Extract<DecisionFinderActionResult, { success: true }>['data'] | null;
}

const defaultConstraints: DecisionFinderConstraints = {
  roleKey: '',
  teamSizeBand: 'unknown',
  budgetMax: null,
  budgetPeriod: 'month',
  currency: 'USD',
  integrationKeys: [],
  dataSensitivity: 'low',
  selfHostRequired: false,
  exportRequired: false,
};

function readStoredState(): FinderState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; state?: FinderState };
    if (!parsed.savedAt || !parsed.state || Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.state;
  } catch {
    return null;
  }
}

function localized(value: Record<string, string>, locale: string): string {
  return (
    value[locale] ||
    value[locale === 'cn' || locale === 'tw' ? 'cn' : 'en'] ||
    value.en ||
    Object.values(value)[0] ||
    ''
  );
}

export default function DecisionFinder({ locale, tasks }: { locale: string; tasks: DecisionTaskOption[] }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const [state, setState] = useState<FinderState>({ taskId: '', constraints: defaultConstraints, result: null });
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = readStoredState();
    if (stored && tasks.some((task) => task.id === stored.taskId)) setState(stored);
    setHydrated(true);
  }, [tasks]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), state }));
  }, [hydrated, state]);

  const selectedTask = tasks.find((task) => task.id === state.taskId) || null;
  const configuredFields = Array.isArray(selectedTask?.constraintSchema.fields)
    ? selectedTask.constraintSchema.fields.filter((field): field is string => typeof field === 'string')
    : [];
  const constraintEnabled = (field: string) => configuredFields.length === 0 || configuredFields.includes(field);

  const updateConstraints = (patch: Partial<DecisionFinderConstraints>) => {
    setState((current) => ({
      ...current,
      constraints: { ...current.constraints, ...patch },
      result: null,
    }));
    setFeedback(null);
  };

  const runFinder = () => {
    if (!state.taskId) {
      setFeedback({ tone: 'error', message: isChinese ? '请先选择一个任务。' : 'Choose a task first.' });
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const response = await runDecisionFinderAction({
        taskId: state.taskId,
        locale,
        constraints: state.constraints,
      });
      if (!response.success) {
        setFeedback({
          tone: 'error',
          message: isChinese
            ? response.retryable
              ? '暂时无法生成建议，请稍后重试。'
              : '当前任务不可用，请重新选择。'
            : response.message,
        });
        return;
      }
      setState((current) => ({ ...current, result: response.data }));
      setFeedback({
        tone: 'success',
        message: isChinese ? '已根据已核验证据生成结果。' : 'Results generated from verified evidence.',
      });
    });
  };

  const reset = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState({ taskId: '', constraints: defaultConstraints, result: null });
    setFeedback(null);
  };

  const roleCopy = {
    best_fit: {
      label: isChinese ? '最适合' : 'Best fit',
      icon: Sparkles,
      tone: 'border-cyan-200 bg-cyan-50/80 text-cyan-800',
    },
    lower_cost: {
      label: isChinese ? '成本更低' : 'Lower cost',
      icon: CircleDollarSign,
      tone: 'border-amber-200 bg-amber-50/80 text-amber-800',
    },
    privacy_control: {
      label: isChinese ? '隐私与控制更强' : 'Privacy & control',
      icon: ShieldCheck,
      tone: 'border-emerald-200 bg-emerald-50/80 text-emerald-800',
    },
  } as const;

  if (tasks.length === 0) {
    return (
      <section className='rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm'>
        <p className='text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700'>
          {isChinese ? '证据准备中' : 'Evidence in review'}
        </p>
        <h2 className='mt-3 text-2xl font-bold text-slate-950'>
          {isChinese ? '首批任务正在人工核验' : 'The first decision tasks are being reviewed'}
        </h2>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-slate-600'>
          {isChinese
            ? '我们不会用 AI 文案填满空结果。任务与工具适配证据达到发布门槛后，这里才会开放推荐。'
            : 'We do not fill empty results with AI copy. Recommendations open only after task and tool-fit evidence passes review.'}
        </p>
        <Button asChild variant='outline' className='mt-5'>
          <Link href='/explore'>{isChinese ? '先浏览工具目录' : 'Browse the directory'}</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className='grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]'>
      <section className='rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700'>
              {isChinese ? '1 · 定义需求' : '1 · Define the need'}
            </p>
            <h2 className='mt-2 text-2xl font-bold text-slate-950'>
              {isChinese ? '先说清楚你要完成什么' : 'Start with the job to be done'}
            </h2>
          </div>
          <Button type='button' variant='ghost' size='sm' onClick={reset} disabled={isPending}>
            <RotateCcw className='mr-2 size-4' />
            {isChinese ? '重置' : 'Reset'}
          </Button>
        </div>

        <div className='mt-6 grid gap-3'>
          {tasks.map((task) => {
            const active = state.taskId === task.id;
            return (
              <button
                key={task.id}
                type='button'
                onClick={() => {
                  setState({ taskId: task.id, constraints: defaultConstraints, result: null });
                  setFeedback(null);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-50 shadow-[0_10px_30px_rgba(8,145,178,0.12)]'
                    : 'border-slate-200 bg-slate-50 hover:border-cyan-200 hover:bg-white'
                }`}
                aria-pressed={active}
              >
                <span className='flex items-center justify-between gap-3'>
                  <span className='font-semibold text-slate-950'>{localized(task.name, locale)}</span>
                  {active ? <CheckCircle2 className='size-5 text-cyan-700' /> : null}
                </span>
                <span className='mt-1 block text-sm leading-6 text-slate-600'>
                  {localized(task.description, locale)}
                </span>
              </button>
            );
          })}
        </div>

        <div className='mt-7 border-t border-slate-200 pt-6'>
          <p className='text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700'>
            {isChinese ? '2 · 设置硬条件' : '2 · Set hard constraints'}
          </p>
          <div className='mt-4 grid gap-4 sm:grid-cols-2'>
            {constraintEnabled('role') ? (
              <label className='grid gap-2 text-sm font-medium text-slate-700'>
                {isChinese ? '你的角色' : 'Your role'}
                <input
                  type='text'
                  value={state.constraints.roleKey || ''}
                  onChange={(event) => updateConstraints({ roleKey: event.target.value })}
                  placeholder={isChinese ? '例如：创始人、开发者、营销' : 'Founder, developer, marketer'}
                  className='h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-950'
                />
              </label>
            ) : null}
            {constraintEnabled('team_size') ? (
              <label className='grid gap-2 text-sm font-medium text-slate-700'>
                {isChinese ? '团队规模' : 'Team size'}
                <select
                  value={state.constraints.teamSizeBand}
                  onChange={(event) =>
                    updateConstraints({ teamSizeBand: event.target.value as DecisionFinderConstraints['teamSizeBand'] })
                  }
                  className='h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-950'
                >
                  <option value='unknown'>{isChinese ? '暂不确定' : 'Not sure'}</option>
                  <option value='solo'>{isChinese ? '个人' : 'Solo'}</option>
                  <option value='2_10'>2-10</option>
                  <option value='11_50'>11-50</option>
                  <option value='51_plus'>51+</option>
                </select>
              </label>
            ) : null}
            {constraintEnabled('budget') ? (
              <label className='grid gap-2 text-sm font-medium text-slate-700'>
                {isChinese ? '预算上限（USD）' : 'Budget cap (USD)'}
                <span className='grid grid-cols-[minmax(0,1fr)_110px] gap-2'>
                  <input
                    type='number'
                    min='0'
                    step='1'
                    value={state.constraints.budgetMax ?? ''}
                    onChange={(event) =>
                      updateConstraints({ budgetMax: event.target.value ? Number(event.target.value) : null })
                    }
                    placeholder={isChinese ? '不限制' : 'No cap'}
                    className='h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-slate-950'
                  />
                  <select
                    value={state.constraints.budgetPeriod || 'month'}
                    onChange={(event) =>
                      updateConstraints({
                        budgetPeriod: event.target.value as DecisionFinderConstraints['budgetPeriod'],
                      })
                    }
                    className='h-11 rounded-xl border border-slate-300 bg-white px-2 text-slate-950'
                  >
                    <option value='month'>{isChinese ? '每月' : 'Month'}</option>
                    <option value='year'>{isChinese ? '每年' : 'Year'}</option>
                    <option value='one_time'>{isChinese ? '一次性' : 'One-time'}</option>
                  </select>
                </span>
              </label>
            ) : null}
            {constraintEnabled('data_sensitivity') ? (
              <label className='grid gap-2 text-sm font-medium text-slate-700'>
                {isChinese ? '数据敏感度' : 'Data sensitivity'}
                <select
                  value={state.constraints.dataSensitivity}
                  onChange={(event) =>
                    updateConstraints({
                      dataSensitivity: event.target.value as DecisionFinderConstraints['dataSensitivity'],
                    })
                  }
                  className='h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-950'
                >
                  <option value='low'>{isChinese ? '普通' : 'Low'}</option>
                  <option value='medium'>{isChinese ? '中等' : 'Medium'}</option>
                  <option value='high'>{isChinese ? '敏感' : 'High'}</option>
                  <option value='regulated'>{isChinese ? '受监管' : 'Regulated'}</option>
                </select>
              </label>
            ) : null}
            {constraintEnabled('integrations') ? (
              <label className='grid gap-2 text-sm font-medium text-slate-700'>
                {isChinese ? '必要集成（逗号分隔）' : 'Required integrations (comma separated)'}
                <input
                  type='text'
                  value={(state.constraints.integrationKeys || []).join(', ')}
                  onChange={(event) =>
                    updateConstraints({ integrationKeys: event.target.value.split(',').map((value) => value.trim()) })
                  }
                  placeholder='Slack, Notion'
                  className='h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-950'
                />
              </label>
            ) : null}
          </div>
          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            {constraintEnabled('self_host') ? (
              <label className='flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700'>
                <input
                  type='checkbox'
                  checked={Boolean(state.constraints.selfHostRequired)}
                  onChange={(event) => updateConstraints({ selfHostRequired: event.target.checked })}
                  className='size-4 accent-cyan-700'
                />
                {isChinese ? '必须支持完整自托管' : 'Full self-hosting is required'}
              </label>
            ) : null}
            {constraintEnabled('export') ? (
              <label className='flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700'>
                <input
                  type='checkbox'
                  checked={Boolean(state.constraints.exportRequired)}
                  onChange={(event) => updateConstraints({ exportRequired: event.target.checked })}
                  className='size-4 accent-cyan-700'
                />
                {isChinese ? '必须支持完整数据导出' : 'Full data export is required'}
              </label>
            ) : null}
          </div>

          <Button
            type='button'
            size='lg'
            onClick={runFinder}
            disabled={isPending || !hydrated}
            className='mt-6 w-full rounded-xl bg-slate-950 text-white hover:bg-cyan-800'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                {isChinese ? '正在核对证据与硬条件…' : 'Checking evidence and hard constraints…'}
              </>
            ) : (
              <>
                {isChinese ? '生成可解释建议' : 'Generate explainable recommendations'}
                <ArrowRight className='ml-2 size-4' />
              </>
            )}
          </Button>
          {feedback ? (
            <p
              role={feedback.tone === 'error' ? 'alert' : 'status'}
              className={`mt-3 rounded-xl px-4 py-3 text-sm ${
                feedback.tone === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {feedback.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className='rounded-[28px] border border-slate-800 bg-slate-950 p-5 text-white shadow-xl sm:p-7'>
        <p className='text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300'>
          {isChinese ? '3 · 查看判断' : '3 · Review the decision'}
        </p>
        <h2 className='mt-2 text-2xl font-bold'>
          {selectedTask ? localized(selectedTask.name, locale) : isChinese ? '等待选择任务' : 'Waiting for a task'}
        </h2>
        <p className='mt-3 text-sm leading-7 text-slate-300'>
          {isChinese
            ? '最多返回三个不同角色。证据不足时宁可少给，也不会用弱工具补满。'
            : 'Up to three distinct roles are returned. If evidence is thin, the list stays short instead of adding weak fillers.'}
        </p>

        {!state.result ? (
          <div className='mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6'>
            <p className='font-semibold text-slate-100'>{isChinese ? '结果尚未生成' : 'No result yet'}</p>
            <p className='mt-2 text-sm leading-6 text-slate-400'>
              {isChinese
                ? '完成左侧两步后，结果、未知项和证据数量会显示在这里。'
                : 'Complete the two steps to see results, unknowns, and evidence here.'}
            </p>
          </div>
        ) : state.result.recommendations.length === 0 ? (
          <div className='mt-8 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-6'>
            <p className='font-semibold text-amber-100'>
              {isChinese ? '暂时没有达到门槛的建议' : 'No recommendation clears the bar yet'}
            </p>
            <p className='mt-2 text-sm leading-6 text-amber-200/80'>
              {isChinese
                ? `有 ${state.result.needsVerification} 个候选仍需核验，${state.result.excluded} 个触发了硬性排除。`
                : `${state.result.needsVerification} candidates need verification and ${state.result.excluded} hit a hard exclusion.`}
            </p>
          </div>
        ) : (
          <div className='mt-6 grid gap-4'>
            {state.result.recommendations.map((recommendation) => {
              const copy = roleCopy[recommendation.role];
              const Icon = copy.icon;
              return (
                <article
                  key={recommendation.role}
                  className='rounded-2xl border border-slate-700 bg-white p-5 text-slate-950 shadow-lg'
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${copy.tone}`}
                      >
                        <Icon className='mr-1.5 size-3.5' />
                        {copy.label}
                      </span>
                      <h3 className='mt-3 text-xl font-bold'>{recommendation.toolName}</h3>
                    </div>
                    {recommendation.monthlyCost !== null ? (
                      <span className='text-sm font-semibold text-slate-600'>
                        {recommendation.currency} {recommendation.monthlyCost.toFixed(2)}/{isChinese ? '月' : 'mo'}
                      </span>
                    ) : null}
                  </div>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {recommendation.matchedConditions.map((condition) => (
                      <span key={condition} className='rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700'>
                        {condition.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  {recommendation.unresolvedUnknowns.length > 0 ? (
                    <p className='mt-4 text-sm leading-6 text-amber-800'>
                      {isChinese ? '仍需确认：' : 'Still verify: '}
                      {recommendation.unresolvedUnknowns.join(', ').replace(/_/g, ' ')}
                    </p>
                  ) : null}
                  <div className='mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4'>
                    <span className='text-xs text-slate-500'>
                      {recommendation.evidenceClaimIds.length}{' '}
                      {isChinese ? '条核验证据' : 'verified evidence references'}
                    </span>
                    {recommendation.toolSlug ? (
                      <Link
                        href={`/ai/${recommendation.toolSlug}`}
                        className='text-sm font-semibold text-cyan-800 hover:text-cyan-950'
                      >
                        {isChinese ? '查看工具判断' : 'Open tool decision'} →
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
