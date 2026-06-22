'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { getPool } from '@/db/neon/client';

const validClaimStatuses = ['unclaimed', 'pending', 'claimed', 'rejected'] as const;

type ClaimStatus = (typeof validClaimStatuses)[number];

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeClaimStatus(value: string): ClaimStatus | null {
  return (validClaimStatuses as readonly string[]).includes(value) ? (value as ClaimStatus) : null;
}

function normalizeClaimedAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function updateToolClaimInfo(input: {
  toolId: string;
  ownerEmail?: string | null;
  claimStatus?: string;
  claimedAt?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const claimStatus = normalizeClaimStatus(input.claimStatus ?? 'unclaimed');

    if (!claimStatus) {
      return { success: false, error: 'Invalid claim status.' };
    }

    const ownerEmail = normalizeNullableText(input.ownerEmail);
    const claimedAtInput = normalizeClaimedAt(input.claimedAt ?? null);
    const claimedAt =
      claimStatus === 'claimed'
        ? claimedAtInput || new Date().toISOString()
        : claimedAtInput;

    const pool = getPool();
    const result = await pool.query(
      `
        UPDATE tools
        SET
          owner_email = $1,
          claim_status = $2,
          claimed_at = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING name
      `,
      [
        ownerEmail,
        claimStatus,
        claimStatus === 'unclaimed' ? null : claimedAt,
        input.toolId,
      ],
    );

    if (result.rowCount === 0) {
      return { success: false, error: 'Tool not found.' };
    }

    revalidatePath('/admin/tools');

    return { success: true };
  } catch (error) {
    console.error('Error updating tool claim info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tool claim info.',
    };
  }
}
