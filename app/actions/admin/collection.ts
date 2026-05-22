'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import {
  CollectionFrequency,
  CollectionSourceType,
  createCollectionSource,
  enrichCollectionCandidates,
  importCollectionCandidateToDraft,
  rejectCollectionCandidates,
  rejectLowScoreCollectionCandidates,
  rescoreCollectionCandidates,
  runCollectionSourceNow,
  setCollectionSourceEnabled,
} from '@/lib/services/admin/collection';

const validSourceTypes: CollectionSourceType[] = ['rss', 'html', 'api', 'manual'];
const validFrequencies: CollectionFrequency[] = ['manual', 'daily', 'weekly'];

export async function createCollectionSourceAction(formData: FormData) {
  try {
    await requireAdmin();

    const name = String(formData.get('name') || '').trim();
    const url = String(formData.get('url') || '').trim();
    const sourceType = String(formData.get('sourceType') || 'html') as CollectionSourceType;
    const frequency = String(formData.get('frequency') || 'daily') as CollectionFrequency;
    const notes = String(formData.get('notes') || '').trim();
    const enabled = formData.get('enabled') === 'true';

    if (!name || !url) {
      return { success: false, error: 'Name and URL are required.' };
    }

    if (!validSourceTypes.includes(sourceType)) {
      return { success: false, error: 'Invalid source type.' };
    }

    if (!validFrequencies.includes(frequency)) {
      return { success: false, error: 'Invalid frequency.' };
    }

    await createCollectionSource({
      name,
      url,
      sourceType,
      frequency,
      notes,
      enabled,
    });

    revalidatePath('/admin/collection');
    return { success: true };
  } catch (error) {
    console.error('Error creating collection source:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create collection source.',
    };
  }
}

export async function runCollectionSourceNowAction(sourceId: string) {
  try {
    await requireAdmin();
    const run = await runCollectionSourceNow(sourceId);
    revalidatePath('/admin/collection');
    return {
      success: true,
      foundCount: run.found_count,
      importedCount: run.imported_count,
      skippedCount: run.skipped_count,
    };
  } catch (error) {
    console.error('Error running collection source:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to run collection source.',
    };
  }
}

export async function importCollectionCandidateAction(candidateId: string) {
  try {
    await requireAdmin();
    const result = await importCollectionCandidateToDraft(candidateId);
    revalidatePath('/admin/collection');
    revalidatePath('/admin/tools');
    return { success: true, toolId: result.toolId };
  } catch (error) {
    console.error('Error importing collection candidate:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to import collection candidate.',
    };
  }
}

export async function importCollectionCandidatesAction(candidateIds: string[]) {
  try {
    await requireAdmin();

    const uniqueIds = Array.from(new Set(candidateIds)).filter(Boolean);
    const results = [];

    for (const candidateId of uniqueIds) {
      const result = await importCollectionCandidateToDraft(candidateId);
      results.push(result);
    }

    revalidatePath('/admin/collection');
    revalidatePath('/admin/tools');
    return { success: true, importedCount: results.length };
  } catch (error) {
    console.error('Error importing collection candidates:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to import collection candidates.',
    };
  }
}

export async function rejectCollectionCandidatesAction(candidateIds: string[]) {
  try {
    await requireAdmin();
    const uniqueIds = Array.from(new Set(candidateIds)).filter(Boolean);
    const result = await rejectCollectionCandidates(uniqueIds);
    revalidatePath('/admin/collection');
    return { success: true, updatedCount: result.updatedCount };
  } catch (error) {
    console.error('Error rejecting collection candidates:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reject collection candidates.',
    };
  }
}

export async function rejectLowScoreCollectionCandidatesAction() {
  try {
    await requireAdmin();
    const result = await rejectLowScoreCollectionCandidates();
    revalidatePath('/admin/collection');
    return { success: true, updatedCount: result.updatedCount };
  } catch (error) {
    console.error('Error rejecting low-score collection candidates:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reject low-score candidates.',
    };
  }
}

export async function rescoreCollectionCandidatesAction() {
  try {
    await requireAdmin();
    const result = await rescoreCollectionCandidates();
    revalidatePath('/admin/collection');
    return { success: true, updatedCount: result.updatedCount };
  } catch (error) {
    console.error('Error rescoring collection candidates:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to rescore collection candidates.',
    };
  }
}

export async function enrichCollectionCandidatesAction() {
  try {
    await requireAdmin();
    const result = await enrichCollectionCandidates();
    revalidatePath('/admin/collection');
    return {
      success: true,
      checkedCount: result.checkedCount,
      enrichedCount: result.enrichedCount,
    };
  } catch (error) {
    console.error('Error enriching collection candidates:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to enrich collection candidates.',
    };
  }
}

export async function setCollectionSourceEnabledAction(
  sourceId: string,
  enabled: boolean
) {
  try {
    await requireAdmin();
    await setCollectionSourceEnabled(sourceId, enabled);
    revalidatePath('/admin/collection');
    return { success: true };
  } catch (error) {
    console.error('Error updating collection source:', error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update collection source.',
    };
  }
}
