'use server';

import { headers } from 'next/headers';
import { query } from '@/db/neon/client';

import { listingConfig } from '@/lib/config/listing';
import { sendTransactionalEmail } from '@/lib/services/mailer';

export interface ClaimListingInput {
  listingName: string;
  email: string;
  company?: string;
  website?: string;
  note?: string;
  sourcePath?: string;
  sourceLocale?: string;
}

export interface ClaimListingResult {
  success: boolean;
  error?: string;
  claimId?: string;
}

function normalizeText(value?: string): string {
  return value?.trim() || '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  if (!value) return false;

  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withProtocol);
    return Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function submitClaimListing(input: ClaimListingInput): Promise<ClaimListingResult> {
  try {
    const listingName = normalizeText(input.listingName);
    const email = normalizeText(input.email).toLowerCase();
    const company = normalizeText(input.company);
    const website = normalizeText(input.website);
    const note = normalizeText(input.note);
    const sourcePath = normalizeText(input.sourcePath);
    const sourceLocale = normalizeText(input.sourceLocale);

    if (listingName.length < 2) {
      return { success: false, error: 'Please enter the listing name.' };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (website && !isValidUrl(website)) {
      return { success: false, error: 'Please enter a valid website URL.' };
    }

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';

    const result = await query(
      `
        INSERT INTO tool_claims (
          listing_name,
          email,
          company,
          website,
          note,
          source_path,
          source_locale,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', NOW(), NOW())
        RETURNING id::text AS id
      `,
      [listingName, email, company || null, website || null, note || null, sourcePath || null, sourceLocale || null],
    );

    const claimId = String(result.rows[0]?.id || '');

    await query(
      `
        INSERT INTO analytics (event_type, metadata, timestamp, user_agent, referrer)
        VALUES ($1, $2, NOW(), $3, $4)
      `,
      [
        'claim_submit',
        JSON.stringify({
          listingName,
          company: company || null,
          website: website || null,
          sourcePath: sourcePath || null,
          sourceLocale: sourceLocale || null,
          claimId,
        }),
        userAgent,
        referrer,
      ],
    );

    const { supportEmail } = listingConfig;
    if (supportEmail) {
      await sendTransactionalEmail({
        to: supportEmail,
        subject: `[AI Best Tool] Claim listing: ${listingName}`,
        text: [
          `Listing: ${listingName}`,
          `Email: ${email}`,
          `Company: ${company || '-'}`,
          `Website: ${website || '-'}`,
          `Source path: ${sourcePath || '-'}`,
          `Source locale: ${sourceLocale || '-'}`,
          `Note: ${note || '-'}`,
        ].join('\n'),
        html: `
          <p><strong>Listing:</strong> ${listingName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || '-'}</p>
          <p><strong>Website:</strong> ${website || '-'}</p>
          <p><strong>Source path:</strong> ${sourcePath || '-'}</p>
          <p><strong>Source locale:</strong> ${sourceLocale || '-'}</p>
          <p><strong>Note:</strong> ${note || '-'}</p>
        `,
      });
    }

    return { success: true, claimId };
  } catch (error) {
    console.error('Error submitting claim listing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit claim listing.',
    };
  }
}
