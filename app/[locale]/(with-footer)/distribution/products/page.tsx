import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, Circle, Globe, Package, Plus, Upload } from 'lucide-react';

import { DistributionActionForm, DistributionSubmitButton } from '@/components/distribution/DistributionActionForm';
import DistributionProjectSwitcher from '@/components/distribution/DistributionProjectSwitcher';
import {
  createDistributionProject,
  createDistributionProjectAsset,
  getDistributionDashboard,
  importDistributionCatalogListing,
  importDistributionIntelligenceAssets,
  updateDistributionProjectProfile,
} from '@/app/actions/distribution';
import { getDistributionPriceId } from '@/lib/services/stripe';

type DistributionWorkspaceSearchParams = {
  project?: string | string[];
  search?: string | string[];
};

function pickValue(value: undefined | string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatSimpleDate(value: string | null | undefined) {
  if (!value) return '未更新';
  const valueDate = new Date(value);
  if (Number.isNaN(valueDate.getTime())) return value.slice(0, 10) || '未更新';
  return valueDate.toISOString().slice(0, 10);
}

export default async function DistributionProductsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionWorkspaceSearchParams;
}) {
  const currentLocale = params.locale;
  const result = await getDistributionDashboard(pickValue(searchParams?.project));
  const redirectUrl = `/${currentLocale}/distribution/products${searchParams ? `?project=${pickValue(searchParams.project) || ''}` : ''}`;

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${currentLocale}/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
    return <div className='mx-auto w-full max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  if (!result.access) {
    return (
      <div className='mx-auto w-full max-w-4xl px-5 py-16'>
        <div className='rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12'>
          <div className='text-xs font-bold uppercase tracking-[0.2em] text-cyan-700'>Distribution workspace</div>
          <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-950'>Build complete distribution profile first</h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600'>
            Please activate the plan to manage product profile, reusable assets, and target site execution.
          </p>
          <div className='mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2'>
            {[
              { plan: 'pro', label: 'Pro', monthly: '$19/mo', yearly: '$190/yr', detail: 'Up to 5 active projects' },
              { plan: 'agency', label: 'Agency', monthly: '$49/mo', yearly: '$490/yr', detail: 'Up to 25 active projects' },
            ].map((item) => {
              const monthlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'monthly'));
              const yearlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'yearly'));
              return (
                <div key={item.plan} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-slate-900'>{item.label}</span>
                    <span className='text-sm font-bold text-cyan-700'>{item.monthly} · {item.yearly}</span>
                  </div>
                  <p className='mt-2 text-xs text-slate-600'>{item.detail}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {monthlyAvailable && (
                      <a href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=monthly`} className='inline-flex rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'>
                        Monthly
                      </a>
                    )}
                    {yearlyAvailable && (
                      <a href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=yearly`} className='inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'>
                        Yearly
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const data = result.data;
  if (!data) {
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>Workspace data unavailable.</div>;
  }

  const project = data.project;
  const projectId = project?.id;
  const isChinese = currentLocale === 'cn';
  const hasVerifiedFacts = Boolean(project?.factsConfirmedAt);
  const selectedProjectName = project?.name || 'Current project';
  const selectedProjectSite = project?.websiteUrl || '—';
  const candidateListings = data.listingCandidates || [];
  const projectAssets = data.assets || [];
  const readyTasksCount = (data.tasks || []).filter((task) => ['ready_to_submit', 'needs_assets'].includes(task.status)).length;
  const submittedTasksCount = (data.tasks || []).filter((task) => task.status === 'submitted').length;
  const doneTasksCount = (data.tasks || []).filter((task) => task.status === 'done').length;
  const blockedTasksCount = (data.tasks || []).filter((task) => task.status === 'blocked').length;
  const canCreateProject = data.projectLimit > data.projects.length;

  const visibleProjects =
    data.projects && data.projects.length > 0
      ? data.projects
      : project?.id
        ? [{ id: project.id, name: project.name || 'AI Best Tool', websiteUrl: project.websiteUrl || null, description: project.description || null, status: 'active', updatedAt: project.updatedAt || null }]
        : [];

  const visibleUpdatedAt = formatSimpleDate(project?.updatedAt) || '未更新';
  const visibleProjectCount = visibleProjects.length;
  const profileMissingItems = [
    !project?.name ? 'product name' : null,
    !project?.websiteUrl ? 'website URL' : null,
    (project?.description || '').length < 20 ? 'specific description (min 20 chars)' : null,
  ].filter(Boolean) as string[];

  return (
    <div className='space-y-6'>
      <DistributionProjectSwitcher
        locale={currentLocale}
        projects={data.projects}
        selectedProjectId={project?.id || null}
        selectedProjectName={project?.name}
        selectedProjectUpdatedAt={project?.updatedAt || null}
        selectedProjectUrl={project?.websiteUrl}
        selectedProjectStatus={project?.onboardingStatus}
        totalTasks={(data.tasks || []).length}
        readyTasks={readyTasksCount}
      />
      <section className='rounded-2xl border border-cyan-100 bg-cyan-50 p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
              {isChinese ? '项目总览' : 'Projects overview'}
            </div>
            <h2 className='mt-1 text-sm font-bold text-slate-900'>
              {isChinese ? `当前可见项目：${visibleProjectCount} / ${data.projectLimit}` : `Visible projects: ${visibleProjectCount} / ${data.projectLimit}`}
            </h2>
            <p className='mt-1 text-xs text-slate-600'>
              {isChinese
                ? '注意：分发首页是“今天工作台”，不是项目列表；右侧与左侧都按当前选中项目自动过滤。'
                : 'Note: the distribution home is the “Today workspace,” not the project list; all sections are filtered by selected project.'}
            </p>
            <div className='mt-2 flex flex-wrap gap-2 text-xs text-slate-700'>
              <span className='rounded-full bg-white px-2.5 py-1'>{isChinese ? '关联任务' : 'Related tasks'}: {(data.tasks || []).length}</span>
              <span className='rounded-full bg-white px-2.5 py-1'>{isChinese ? '待提交' : 'Submitted'}: {submittedTasksCount}</span>
              <span className='rounded-full bg-white px-2.5 py-1'>{isChinese ? '已完成' : 'Done'}: {doneTasksCount}</span>
              <span className='rounded-full bg-white px-2.5 py-1'>{isChinese ? '上次更新' : 'Updated'}: {visibleUpdatedAt}</span>
              {blockedTasksCount > 0 ? <span className='rounded-full bg-rose-100 px-2.5 py-1 text-rose-700'>{isChinese ? '阻塞' : 'Blocked'}: {blockedTasksCount}</span> : null}
            </div>
          </div>
          <Link href={`/${currentLocale}/distribution/settings`} className='text-xs font-bold text-cyan-700'>
            {isChinese ? '套餐与项目管理' : 'Plan & projects'}
          </Link>
        </div>
        <div className='mt-3 rounded-xl border border-cyan-100 bg-white p-3 text-xs text-slate-600'>
          <div className='mb-2 rounded-md border border-cyan-100 bg-cyan-50 px-2.5 py-2 text-[11px] text-cyan-800'>
            {isChinese
              ? `可见项目清单（${visibleProjectCount} / ${data.projectLimit}）`
              : `Visible products (${visibleProjectCount} / ${data.projectLimit})`}
          </div>
          <div className='mb-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {visibleProjects.map((item) => {
              const isActive = item.id === project?.id;
              return (
                <Link
                  key={item.id}
                  href={`/${currentLocale}/distribution/products?project=${encodeURIComponent(item.id)}`}
                  className={`rounded-xl border px-2.5 py-2 transition ${
                    isActive ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className='font-semibold text-slate-900'>{item.name}</div>
                  <div className='mt-1 text-[11px] text-slate-500'>{item.websiteUrl || '--'}</div>
                  {isActive ? <div className='mt-1 text-[11px] font-semibold text-cyan-700'>{isChinese ? '当前项目' : 'Current project'}</div> : null}
                </Link>
              );
            })}
          </div>
            {visibleProjects.length === 0 ? <p className='text-amber-700'>{isChinese ? '当前无可见项目。' : 'No visible projects yet.'}</p> : null}

          {canCreateProject ? (
            <DistributionActionForm
              action={createDistributionProject}
              operationLabel={isChinese ? '创建分发项目' : 'Create distribution project'}
              successMessage={isChinese ? '项目创建成功，正在跳转到今天工作台…' : 'Project created, opening today workspace…'}
            >
              <input type='hidden' name='locale' value={currentLocale} />
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-5'>
                <label className='text-xs font-semibold text-slate-700'>
                  {isChinese ? '产品名' : 'Product name'}
                  <input
                    type='text'
                    name='name'
                    required
                    className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs'
                    placeholder={isChinese ? '如：Moxion' : 'e.g. Moxion'}
                  />
                </label>
                <label className='text-xs font-semibold text-slate-700'>
                  {isChinese ? '官网' : 'Website'}
                  <input
                    type='url'
                    name='websiteUrl'
                    required
                    className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs'
                    placeholder='https://example.com'
                  />
                </label>
                <label className='text-xs font-semibold text-slate-700 sm:col-span-2'>
                  {isChinese ? '一句描述' : 'One-line description'}
                  <input
                    type='text'
                    name='description'
                    required
                    className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs'
                    placeholder={isChinese ? '一句话说明产品定位' : 'A short line describing the product'}
                  />
                </label>
                <label className='text-xs font-semibold text-slate-700'>
                  {isChinese ? '每周提交目标' : 'Weekly capacity'}
                  <input
                    type='number'
                    name='weeklyCapacity'
                    min={1}
                    max={30}
                    defaultValue={3}
                    className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs'
                  />
                </label>
                <label className='text-xs font-semibold text-slate-700'>
                  {isChinese ? '预算偏好' : 'Budget preference'}
                  <select name='budgetPreference' defaultValue='free_first' className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs'>
                    <option value='free_first'>{isChinese ? '先免费' : 'Free first'}</option>
                    <option value='paid_selective'>{isChinese ? '优选付费' : 'Paid selective'}</option>
                    <option value='free_only'>{isChinese ? '只要免费' : 'Free only'}</option>
                  </select>
                </label>
                <div className='sm:col-span-2 lg:col-span-1 flex items-end'>
                  <DistributionSubmitButton
                    pendingLabel={isChinese ? '创建中…' : 'Creating…'}
                    className='inline-flex w-full items-center justify-center rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800'
                  >
                    <Plus className='mr-1 h-3.5 w-3.5' />
                    {isChinese ? '新增分发项目' : 'Add distribution project'}
                  </DistributionSubmitButton>
                </div>
              </div>
            </DistributionActionForm>
          ) : (
            <p className='text-amber-700'>
              {isChinese ? '项目配额已满，升级套餐后可新增更多。' : 'Project quota is full; upgrade plan for more.'}
            </p>
          )}
        </div>
      </section>
      <section className='rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.2em] text-cyan-700'>Product profile</div>
            <h1 className='mt-1 text-2xl font-bold text-slate-950'>{isChinese ? '产品资料与素材' : 'Product Profile & Assets'}</h1>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '先补齐核心资料，再进入执行。当前页面只管理这一项。'
                : 'Complete project facts first, then move into execution tasks and target submissions.'}
            </p>
          </div>
          <Link href={`/${currentLocale}/distribution`} className='inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'>
            {isChinese ? '返回今天工作台' : 'Back to Today'}
          </Link>
        </div>
        <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
          <div className='text-xs font-semibold text-slate-500'>{isChinese ? '当前项目' : 'Current Project'}</div>
          <div className='mt-1 text-sm text-slate-800'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-bold'>{selectedProjectName}</span>
              <span className='text-xs text-slate-500'>{selectedProjectSite}</span>
            </div>
            <div className='mt-2 flex flex-wrap gap-2 text-xs text-slate-600'>
              <span className='inline-flex items-center gap-1'>
                <Package className='h-3 w-3' />
                {projectAssets.length} {isChinese ? '项素材' : 'assets'}
              </span>
              <span className='inline-flex items-center gap-1'>
                <Globe className='h-3 w-3' />
                {candidateListings.length} {isChinese ? '候选导入项' : 'listing candidates'}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                  hasVerifiedFacts ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                <CheckCircle2 className='h-3 w-3' />
                {hasVerifiedFacts
                  ? isChinese
                    ? '资料已确认'
                    : 'Facts confirmed'
                  : isChinese
                    ? '待确认'
                    : 'Needs confirmation'}
              </span>
            </div>
          </div>
        </div>
        {profileMissingItems.length > 0 ? (
          <p className='mt-3 text-xs text-amber-700'>
            {isChinese
              ? `缺少：${profileMissingItems.join(' / ')}，请先完善再选择目标站。`
              : `Missing: ${profileMissingItems.join(' / ')}. Please complete these before selecting targets.`}
          </p>
        ) : null}
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-lg font-bold text-slate-950'>
          {isChinese ? '编辑项目资料' : 'Edit Project Facts'}
        </h2>
        <p className='mt-1 text-xs text-slate-500'>
          {isChinese
            ? '资料会作为分发材料和文案的事实依据，确认后再继续下一步。'
            : 'These facts become the source of all target materials; confirm before moving on.'}
        </p>
        <DistributionActionForm action={updateDistributionProjectProfile} className='mt-4 grid gap-3 sm:grid-cols-2'>
          <input type='hidden' name='projectId' value={projectId || ''} />
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '产品名' : 'Product name'}
            <input
              type='text'
              name='name'
              required
              defaultValue={project?.name || ''}
              className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '官网' : 'Website'}
            <input
              type='url'
              name='websiteUrl'
              required
              defaultValue={project?.websiteUrl || ''}
              className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700 sm:col-span-2'>
            {isChinese ? '描述（至少 20 字）' : 'Description (min 20 chars)'}
            <textarea
              name='description'
              required
              defaultValue={project?.description || ''}
              rows={3}
              className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '产品类型' : 'Product type'}
            <select
              name='productType'
              defaultValue={project?.productType || 'other'}
              className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm'
            >
              <option value='ai_saas'>AI SaaS</option>
              <option value='developer_api'>Developer API</option>
              <option value='open_source'>Open Source</option>
              <option value='mobile_app'>Mobile App</option>
              <option value='content_newsletter'>Content / Newsletter</option>
              <option value='agency_service'>Agency Service</option>
              <option value='web3'>Web3</option>
              <option value='other'>Other</option>
            </select>
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '每周可投递' : 'Weekly capacity'}
            <input
              type='number'
              name='weeklyCapacity'
              min={1}
              max={30}
              defaultValue={project?.weeklyCapacity || 3}
              className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '预算偏好' : 'Budget preference'}
            <select name='budgetPreference' defaultValue={project?.budgetPreference || 'free_first'} className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm'>
              <option value='free_first'>{isChinese ? '先免费' : 'Free first'}</option>
              <option value='paid_selective'>{isChinese ? '选择付费' : 'Paid selective'}</option>
              <option value='free_only'>{isChinese ? '只要免费' : 'Free only'}</option>
            </select>
          </label>
          <label className='flex items-center gap-2 pt-7'>
            <input type='checkbox' name='factsConfirmed' defaultChecked={hasVerifiedFacts} />
            <span className='text-xs font-semibold text-slate-700'>
              {isChinese ? '确认资料真实可用（仅本人负责的真实内容）' : 'Facts reviewed and confirmed (real information only)'}
            </span>
          </label>
          <div className='sm:col-span-2'>
            <DistributionSubmitButton
              pendingLabel={isChinese ? '保存中…' : 'Saving…'}
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-800'
            >
              {isChinese ? '保存资料并确认' : 'Save profile'}
            </DistributionSubmitButton>
          </div>
        </DistributionActionForm>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-bold text-slate-950'>{isChinese ? '素材中心' : 'Project Assets'}</h2>
          <div className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700'>
            <Upload className='h-3 w-3' />
            {isChinese ? '可复用素材' : 'Reusable assets'}
          </div>
        </div>
        <p className='mt-1 text-xs text-slate-500'>
          {isChinese
            ? '素材用于目标站提交材料包，不需要每个网站重复上传。'
            : 'Assets are reused across target submissions, no need to re-upload each site.'}
        </p>

        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
          {projectAssets.length === 0 ? (
            <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600'>
              {isChinese ? '暂无素材，建议先上传一个 Logo。' : 'No assets yet. Add a logo first.'}
            </div>
          ) : null}
          {projectAssets.slice(0, 12).map((asset) => (
            <div key={asset.id} className='rounded-xl border border-slate-200 p-3'>
              <div className='text-xs text-slate-500'>{asset.assetType}</div>
              <div className='mt-1 text-sm font-bold text-slate-900'>{asset.name}</div>
              <a
                href={asset.url}
                target='_blank'
                rel='noreferrer'
                className='mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline'
              >
                {isChinese ? '打开素材' : 'Open'} <Circle className='h-3 w-3' />
              </a>
            </div>
          ))}
        </div>

        <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
          <h3 className='text-xs font-bold uppercase tracking-[0.16em] text-slate-700'>{isChinese ? '添加素材' : 'Add asset'}</h3>
          <DistributionActionForm action={createDistributionProjectAsset} className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
            <input type='hidden' name='projectId' value={projectId || ''} />
            <label className='text-xs font-semibold text-slate-700'>
              {isChinese ? '素材类型' : 'Asset type'}
              <select name='assetType' className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs'>
                <option value='logo'>{isChinese ? 'Logo' : 'Logo'}</option>
                <option value='icon'>{isChinese ? 'Icon' : 'Icon'}</option>
                <option value='screenshot'>{isChinese ? '截图' : 'Screenshot'}</option>
                <option value='video'>{isChinese ? '视频' : 'Video'}</option>
                <option value='founder_photo'>{isChinese ? '创始人照片' : 'Founder photo'}</option>
                <option value='social'>{isChinese ? '社媒素材' : 'Social cover'}</option>
              </select>
            </label>
            <label className='text-xs font-semibold text-slate-700'>
              {isChinese ? '资源名称' : 'Asset name'}
              <input type='text' name='name' className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs' required />
            </label>
            <label className='text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-2'>
              {isChinese ? '公开 URL' : 'Public URL'}
              <input type='url' name='sourceUrl' className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs' required />
            </label>
            <label className='text-xs font-semibold text-slate-700'>
              {isChinese ? '宽度' : 'Width'}
              <input type='number' name='width' min={1} defaultValue='' className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs' />
            </label>
            <label className='text-xs font-semibold text-slate-700'>
              {isChinese ? '高度' : 'Height'}
              <input type='number' name='height' min={1} defaultValue='' className='mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs' />
            </label>
            <label className='flex items-center gap-2 pt-6'>
              <input type='checkbox' name='verified' />
              <span className='text-xs font-semibold text-slate-700'>{isChinese ? '标记为已核验' : 'Mark verified'}</span>
            </label>
            <div className='sm:col-span-2 lg:col-span-1'>
              <DistributionSubmitButton
                pendingLabel={isChinese ? '保存中…' : 'Saving…'}
                className='inline-flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'
              >
                {isChinese ? '保存素材' : 'Save asset'}
              </DistributionSubmitButton>
            </div>
          </DistributionActionForm>
        </div>

        <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
          <h3 className='text-xs font-bold uppercase tracking-[0.16em] text-slate-700'>
            {isChinese ? '从 AI Best Tool 列表导入' : 'Import from AI Best Tool listing'}
          </h3>
          <div className='mt-3 space-y-2'>
            {candidateListings.length === 0 ? (
              <p className='text-xs text-slate-500'>
                {isChinese ? '该项目当前无可导入的候选。' : 'No importable listing candidate for this project.'}
              </p>
            ) : null}
            {candidateListings.map((candidate) => (
              <div key={candidate.id} className='rounded-xl border border-slate-200 bg-white p-2'>
                <div className='text-xs font-bold text-slate-900'>{candidate.name}</div>
                <div className='text-[11px] text-slate-500'>
                  {candidate.ownershipSource || isChinese ? 'Owned listing' : 'Owned listing'} · {candidate.categoryName || '—'}
                </div>
                <DistributionActionForm action={importDistributionCatalogListing} className='mt-2'>
                  <input type='hidden' name='projectId' value={projectId || ''} />
                  <input type='hidden' name='toolId' value={candidate.id} />
                  <DistributionSubmitButton
                    pendingLabel={isChinese ? '导入中…' : 'Importing…'}
                    className='inline-flex items-center gap-1 rounded-md bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-100'
                  >
                    {isChinese ? '导入官方资料' : 'Import official fields'}
                  </DistributionSubmitButton>
                </DistributionActionForm>
              </div>
            ))}
            <DistributionActionForm action={importDistributionIntelligenceAssets} className='mt-3'>
              <input type='hidden' name='projectId' value={projectId || ''} />
              <DistributionSubmitButton
                pendingLabel={isChinese ? '同步中…' : 'Syncing…'}
                className='inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700'
              >
                {isChinese ? '同步全部智能资产' : 'Import intelligence assets'}
              </DistributionSubmitButton>
            </DistributionActionForm>
          </div>
        </div>
      </section>
    </div>
  );
}
