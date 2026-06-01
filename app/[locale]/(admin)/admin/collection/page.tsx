import Link from 'next/link';
import { getAdminTools } from '@/app/actions/admin/tools';
import AdminImportToolForm from '@/components/admin/AdminImportToolForm';
import AdminCollectionCandidatesTable from '@/components/admin/AdminCollectionCandidatesTable';
import AdminCollectionSourceForm from '@/components/admin/AdminCollectionSourceForm';
import AdminCollectionSourcesTable from '@/components/admin/AdminCollectionSourcesTable';
import { getToolQuality } from '@/lib/services/toolQuality';
import { getTopCategories } from '@/lib/services/admin/analytics';
import {
  CollectionCandidateScoreFilter,
  CollectionCandidateStatus,
  getCollectionCandidateStats,
  listCollectionCandidates,
  listCollectionRuns,
  listCollectionSources,
} from '@/lib/services/admin/collection';

export const metadata = {
  title: 'Collection Queue',
};

function getTitle(tool: any) {
  if (typeof tool.title === 'string') return tool.title;
  if (typeof tool.title === 'object' && tool.title !== null) {
    return tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name;
  }
  return tool.name;
}

function getStatusBadge(status: string) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700',
    pending: 'bg-amber-100 text-amber-800',
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        styles[status as keyof typeof styles] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}

const validCandidateStatuses: Array<CollectionCandidateStatus | 'all'> = [
  'all',
  'new',
  'imported',
  'skipped',
  'rejected',
];
const validCandidateScoreFilters: CollectionCandidateScoreFilter[] = [
  'all',
  'promising',
  'low',
];

function getCandidateStatus(value: string | string[] | undefined) {
  const status = Array.isArray(value) ? value[0] : value;
  return validCandidateStatuses.includes(status as CollectionCandidateStatus | 'all')
    ? (status as CollectionCandidateStatus | 'all')
    : 'new';
}

function getPage(value: string | string[] | undefined) {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value || '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function getCandidateScoreFilter(value: string | string[] | undefined) {
  const scoreFilter = Array.isArray(value) ? value[0] : value;
  return validCandidateScoreFilters.includes(scoreFilter as CollectionCandidateScoreFilter)
    ? (scoreFilter as CollectionCandidateScoreFilter)
    : 'all';
}

function getCategoryDisplayName(category: { name: unknown; slug: string }) {
  if (typeof category.name === 'object' && category.name !== null) {
    const record = category.name as Record<string, string>;
    return record.en || record.zh || Object.values(record)[0] || category.slug;
  }

  return category.slug;
}

function getCategoryAction(category: {
  toolCount: number;
  opportunityScore: number;
  views: number;
  comments: number;
}) {
  if (category.toolCount <= 10 && category.opportunityScore >= 200) return 'Add 5-10 solid tools';
  if (category.views >= category.toolCount * 800) return 'Add comparison pages';
  if (category.comments >= category.toolCount) return 'Strengthen feedback loops';
  return 'Backfill missing listings';
}

export default async function AdminCollectionPage({
  searchParams,
}: {
  searchParams?: {
    candidateStatus?: string | string[];
    candidateScore?: string | string[];
    candidatePage?: string | string[];
  };
}) {
  const candidateStatus = getCandidateStatus(searchParams?.candidateStatus);
  const candidateScoreFilter = getCandidateScoreFilter(searchParams?.candidateScore);
  const candidatePage = getPage(searchParams?.candidatePage);
  let drafts: Awaited<ReturnType<typeof getAdminTools>> = { tools: [], total: 0 };
  let pending: Awaited<ReturnType<typeof getAdminTools>> = { tools: [], total: 0 };
  let sources: Awaited<ReturnType<typeof listCollectionSources>> = [];
  let runs: Awaited<ReturnType<typeof listCollectionRuns>> = [];
  let candidatePageData: Awaited<ReturnType<typeof listCollectionCandidates>> = {
    candidates: [],
    total: 0,
    page: candidatePage,
    pageSize: 25,
    totalPages: 1,
  };
  let candidateStats: Awaited<ReturnType<typeof getCollectionCandidateStats>> = {
    new: 0,
    imported: 0,
    skipped: 0,
    rejected: 0,
  };
  let topCategories: Awaited<ReturnType<typeof getTopCategories>> = [];
  let loadError: string | null = null;

  const results = await Promise.allSettled([
    getAdminTools({ status: 'draft', page: 1, pageSize: 50 }),
    getAdminTools({ status: 'pending', page: 1, pageSize: 50 }),
    listCollectionSources(),
    listCollectionRuns(15),
    listCollectionCandidates(25, candidateStatus, candidatePage, candidateScoreFilter),
    getCollectionCandidateStats(),
    getTopCategories(3),
  ]);

  if (results[0].status === 'fulfilled') {
    drafts = results[0].value;
  } else {
    loadError = results[0].reason instanceof Error ? results[0].reason.message : 'Failed to load draft tools.';
  }

  if (results[1].status === 'fulfilled') {
    pending = results[1].value;
  } else {
    loadError = results[1].reason instanceof Error ? results[1].reason.message : 'Failed to load pending tools.';
  }

  if (results[2].status === 'fulfilled') {
    sources = results[2].value;
  } else {
    loadError = results[2].reason instanceof Error ? results[2].reason.message : 'Failed to load collection sources.';
  }

  if (results[3].status === 'fulfilled') {
    runs = results[3].value;
  } else {
    loadError = results[3].reason instanceof Error ? results[3].reason.message : 'Failed to load collection runs.';
  }

  if (results[4].status === 'fulfilled') {
    candidatePageData = results[4].value;
  } else {
    loadError = results[4].reason instanceof Error ? results[4].reason.message : 'Failed to load collection candidates.';
  }

  if (results[5].status === 'fulfilled') {
    candidateStats = results[5].value;
  } else {
    loadError = results[5].reason instanceof Error ? results[5].reason.message : 'Failed to load candidate stats.';
  }

  if (results[6].status === 'fulfilled') {
    topCategories = results[6].value;
  } else {
    loadError = results[6].reason instanceof Error ? results[6].reason.message : 'Failed to load category analytics.';
  }

  const queue = [...drafts.tools, ...pending.tools].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const readyToImportCount = candidatePageData.candidates.filter(
    (candidate) => candidate.status === 'new' && candidate.quality_score >= 80 && candidate.relevance_score >= 50,
  ).length;
  const needsEnrichmentCount = candidatePageData.candidates.filter(
    (candidate) => candidate.status === 'new' && candidate.quality_score < 70,
  ).length;
  const focusCategories = topCategories.slice(0, 3);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Collection Queue</h1>
        <p className="mt-2 text-slate-600">
          Import source URLs, research drafts, and move promising tools toward review.
        </p>
      </div>

      {loadError && (
        <div className="theme-surface mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Collection queue loaded with partial data: {loadError}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Ready to import</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{readyToImportCount}</p>
          <p className="mt-1 text-sm text-slate-500">High quality candidates on this page</p>
        </div>
        <div className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Needs enrichment</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{needsEnrichmentCount}</p>
          <p className="mt-1 text-sm text-slate-500">Below the editorial minimum</p>
        </div>
        <div className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Import rule</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Only create drafts when a candidate has a clear category, screenshot, logo, description, detail copy,
            pricing, and tags.
          </p>
        </div>
      </div>

      <div className="theme-surface mb-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Weekly focus categories</h2>
          <p className="mt-1 text-sm text-slate-600">
            These are the categories worth backfilling first if we want the directory to feel fuller and more useful.
          </p>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-3">
          {focusCategories.map((category, index) => (
            <div key={category.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority #{index + 1}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {getCategoryDisplayName(category)}
                  </h3>
                  <p className="text-xs text-slate-500">{category.slug}</p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                  {category.opportunityScore}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Tools</span>
                  <span className="font-medium text-slate-900">{category.toolCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Views</span>
                  <span className="font-medium text-slate-900">{category.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Comments</span>
                  <span className="font-medium text-slate-900">{category.comments.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {getCategoryAction(category)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminImportToolForm />
        <AdminCollectionSourceForm />
      </div>

      <div className="mt-6">
        <AdminCollectionSourcesTable sources={sources} />
      </div>

      <div className="mt-6">
        <AdminCollectionCandidatesTable
          candidates={candidatePageData.candidates}
          stats={candidateStats}
          activeStatus={candidateStatus}
          activeScoreFilter={candidateScoreFilter}
          pagination={{
            page: candidatePageData.page,
            pageSize: candidatePageData.pageSize,
            total: candidatePageData.total,
            totalPages: candidatePageData.totalPages,
          }}
        />
      </div>

      <div className="theme-surface mt-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent runs</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manual and scheduled collection run history.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {runs.map((run) => (
            <div key={run.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {run.source_name || 'Unknown source'}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(run.created_at).toLocaleString()} • {run.trigger_type}
                </p>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold capitalize">{run.status}</span>
                <span className="ml-3">
                  Found {run.found_count}, imported {run.imported_count}, skipped {run.skipped_count}
                </span>
              </div>
            </div>
          ))}
          {runs.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No collection runs yet.
            </div>
          )}
        </div>
      </div>

      <div className="theme-surface mt-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Drafts and pending tools</h2>
          <p className="mt-1 text-sm text-slate-600">
            {queue.length} items waiting for research or review
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Tool
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Freshness
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {queue.map((tool) => {
                const quality = getToolQuality(tool);

                return (
                  <tr key={tool.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{getTitle(tool)}</p>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-700 hover:text-cyan-800"
                      >
                        {tool.url}
                      </a>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(tool.status)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{quality.score}/100</p>
                      {quality.missingLabels.length > 0 && (
                        <p className="mt-1 max-w-xs text-xs text-amber-700">
                          Needs: {quality.missingLabels.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <p>Added {new Date(tool.created_at).toLocaleDateString()}</p>
                      <p>Updated {new Date(tool.updated_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                      >
                        Research & edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No collection items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
