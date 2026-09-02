import { query } from '@/db/neon/client';
import StackWorkspace, { type StackItemView, type StackToolOption } from '@/components/stack/StackWorkspace';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getLocalizedField } from '@/lib/services/tools';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/app/navigation';

export const metadata = {
  title: 'My AI Stack Audit',
  description: 'Privately track AI tools, real costs, usage, and renewal dates.',
  ...getNoindexMetadata(),
};

type DatabaseRow = Record<string, unknown>;

export default async function StackPage({ params }: { params: { locale: string } }) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className='theme-page container mx-auto px-4 py-16 text-center'>
        <h1 className='text-3xl font-bold text-slate-950'>{isChinese ? '登录后管理你的 AI Stack' : 'Log in to manage your AI Stack'}</h1>
        <Link href='/login?redirect=/profile/stack' className='mt-6 inline-flex rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white'>
          {isChinese ? '登录' : 'Log in'}
        </Link>
      </main>
    );
  }

  const [{ rows: neonTools }, tasksResult, itemsResult, itemTasksResult] = await Promise.all([
    query<{ id: string; name: string; title: Record<string, string> }>(
      `SELECT id, name, title FROM tools WHERE status = 'published' ORDER BY name ASC LIMIT 500`,
    ),
    supabase.from('decision_tasks').select('id, name').eq('status', 'active').order('display_order'),
    supabase.from('user_tool_stack_items').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('user_tool_stack_item_tasks').select('stack_item_id, task_id, is_primary').eq('is_primary', true),
  ]);

  const tools: StackToolOption[] = neonTools.map((tool) => ({
    id: tool.id,
    slug: tool.name,
    title: getLocalizedField(tool.title, params.locale, isChinese ? 'cn' : 'en'),
  }));
  const toolNames = new Map(tools.map((tool) => [tool.id, tool.title]));
  const tasks = ((tasksResult.data || []) as DatabaseRow[]).map((task) => ({
    id: String(task.id),
    name: getLocalizedField((task.name || {}) as Record<string, string>, params.locale, isChinese ? 'cn' : 'en'),
  }));
  const taskNames = new Map(tasks.map((task) => [task.id, task.name]));
  const primaryTasks = new Map(
    ((itemTasksResult.data || []) as DatabaseRow[]).map((link) => [String(link.stack_item_id), String(link.task_id)]),
  );
  const items: StackItemView[] = ((itemsResult.data || []) as DatabaseRow[]).map((item) => {
    const toolId = item.tool_id ? String(item.tool_id) : null;
    const taskId = primaryTasks.get(String(item.id)) || null;
    return {
      id: String(item.id),
      toolId,
      title: (toolId ? toolNames.get(toolId) : null) || String(item.custom_tool_name || (isChinese ? '未知工具' : 'Unknown tool')),
      customToolName: item.custom_tool_name ? String(item.custom_tool_name) : null,
      customToolUrl: item.custom_tool_url ? String(item.custom_tool_url) : null,
      subscriptionStatus: String(item.subscription_status),
      billingAmount: item.billing_amount === null ? null : Number(item.billing_amount),
      monthlyCost: item.monthly_cost === null ? null : Number(item.monthly_cost),
      currency: String(item.currency),
      billingPeriod: String(item.billing_period) as StackItemView['billingPeriod'],
      usageFrequency: String(item.usage_frequency),
      dataSensitivity: item.data_sensitivity ? String(item.data_sensitivity) : null,
      startedAt: item.started_at ? String(item.started_at) : null,
      renewsAt: item.renews_at ? String(item.renews_at) : null,
      cancelReminderAt: item.cancel_reminder_at ? String(item.cancel_reminder_at) : null,
      notes: item.notes ? String(item.notes) : null,
      taskId,
      taskName: taskId ? taskNames.get(taskId) || null : null,
    };
  });

  return (
    <main className='theme-page min-h-screen bg-[radial-gradient(circle_at_top_left,_#ecfeff,_transparent_34%),linear-gradient(180deg,#f8fafc,#ffffff)] py-10'>
      <div className='container mx-auto px-4'>
        <div className='mb-8 max-w-3xl'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>AI Stack Audit</p>
          <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl'>
            {isChinese ? '先看清你正在为什么付费' : 'See what your AI stack actually costs'}
          </h1>
          <p className='mt-4 text-base leading-7 text-slate-600'>
            {isChinese ? '把真实工具、账单、使用频率和续费日期放在一起。下一阶段会基于这些私有输入给出 Keep、Replace、Remove 和 Missing 建议。' : 'Keep real tools, bills, usage, and renewal dates together. The next stage uses these private inputs for Keep, Replace, Remove, and Missing recommendations.'}
          </p>
        </div>
        <StackWorkspace locale={params.locale} tools={tools} tasks={tasks} items={items} />
      </div>
    </main>
  );
}
