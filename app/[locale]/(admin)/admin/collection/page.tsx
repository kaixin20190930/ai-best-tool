import Link from 'next/link';
import { getAdminTools } from '@/app/actions/admin/tools';
import AdminImportToolForm from '@/components/admin/AdminImportToolForm';
import AdminCollectionCandidatesTable from '@/components/admin/AdminCollectionCandidatesTable';
import AdminCollectionSourceForm from '@/components/admin/AdminCollectionSourceForm';
import AdminCollectionSourcesTable from '@/components/admin/AdminCollectionSourcesTable';
import { getToolQuality } from '@/lib/services/toolQuality';
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
  const [drafts, pending, sources, runs, candidatePageData, candidateStats] = await Promise.all([
    getAdminTools({ status: 'draft', page: 1, pageSize: 50 }),
    getAdminTools({ status: 'pending', page: 1, pageSize: 50 }),
    listCollectionSources(),
    listCollectionRuns(15),
    listCollectionCandidates(25, candidateStatus, candidatePage, candidateScoreFilter),
    getCollectionCandidateStats(),
  ]);
  const queue = [...drafts.tools, ...pending.tools].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Collection Queue</h1>
        <p className="mt-2 text-slate-600">
          Import source URLs, research drafts, and move promising tools toward review.
        </p>
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
