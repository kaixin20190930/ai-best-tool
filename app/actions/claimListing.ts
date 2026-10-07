'use server';

import { headers } from 'next/headers';
import { query } from '@/db/neon/client';

import { listingConfig } from '@/lib/config/listing';
import { sendTransactionalEmail } from '@/lib/services/mailer';
import { notifyAdminsOfClaimLead } from '@/app/actions/notifications';
import { recordDistributionAttributionEvent } from '@/lib/services/distributionAttribution';
import { matchesToolEntry, normalizeClaimSourcePath, officialHost, toolSourcePath } from '@/lib/claims/toolEntry';

export interface ClaimListingInput {
  listingName: string;
  email: string;
  company?: string;
  website?: string;
  claimReason?: string;
  note?: string;
  sourcePath?: string;
  sourceLocale?: string;
  toolId?: string;
  sourceSlug?: string;
  sourceWebsite?: string;
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

function getUrlHostname(value: string): string {
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(withProtocol).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function submitClaimListing(input: ClaimListingInput): Promise<ClaimListingResult> {
  try {
    const listingName = normalizeText(input.listingName);
    const email = normalizeText(input.email).toLowerCase();
    const company = normalizeText(input.company);
    const website = normalizeText(input.website);
    const claimReason = normalizeText(input.claimReason);
    const note = normalizeText(input.note);
    const sourceLocale = ['en', 'cn', 'tw'].includes(input.sourceLocale || '') ? input.sourceLocale! : 'en';
    let sourcePath = normalizeClaimSourcePath(normalizeText(input.sourcePath), sourceLocale);
    const sourceSlug = normalizeText(input.sourceSlug);
    let verifiedToolId: string | null = null;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.toolId || '') &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceSlug) && sourceSlug.length <= 100 &&
        sourcePath === toolSourcePath(sourceLocale, sourceSlug) && officialHost(input.sourceWebsite || '')) {
      const tool = await query<{ id: string; name: string; url: string }>(
        `SELECT id::text, name, url FROM tools WHERE id = $1::uuid AND name = $2 AND status = 'published' LIMIT 1`,
        [input.toolId, sourceSlug],
      );
      if (tool.rows[0] && matchesToolEntry({ toolId: input.toolId, slug: sourceSlug, website: input.sourceWebsite || '' }, tool.rows[0])) {
        verifiedToolId = tool.rows[0].id;
      }
    }
    if (sourcePath !== `${sourceLocale === 'en' ? '' : `/${sourceLocale}`}/developer/listing` && !verifiedToolId) {
      sourcePath = `${sourceLocale === 'en' ? '' : `/${sourceLocale}`}/developer/listing`;
    }

    if (listingName.length < 2) {
      return { success: false, error: 'Please enter the listing name.' };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (website && !isValidUrl(website)) {
      return { success: false, error: 'Please enter a valid website URL.' };
    }
    if (!['ownership_update', 'profile_correction', 'duplicate_merge', 'agency_client', 'other'].includes(claimReason)) {
      return { success: false, error: 'Please choose a valid claim reason.' };
    }
    if (listingName.length > 255 || email.length > 255 || company.length > 255 || website.length > 500 || note.length > 5000) {
      return { success: false, error: 'Please shorten the submitted details.' };
    }

    const websiteHostname = website ? getUrlHostname(website) : '';

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';

    const result = await query(
      `
        INSERT INTO tool_claims (
          listing_name,
          tool_id,
          email,
          company,
          website,
          claim_reason,
          note,
          source_path,
          source_locale,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', NOW(), NOW())
        RETURNING id::text AS id
      `,
      [
        listingName,
        verifiedToolId,
        email,
        company || null,
        website || null,
        claimReason || null,
        note || null,
        sourcePath || null,
        sourceLocale || null,
      ],
    );

    const claimId = String(result.rows[0]?.id || '');

    try {
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
          claimReason: claimReason || null,
          sourcePath: sourcePath || null,
          sourceLocale: sourceLocale || null,
          claimId,
          toolId: verifiedToolId,
        }),
        userAgent,
        referrer,
      ],
    );

    await notifyAdminsOfClaimLead({
      listingName,
      email,
      company,
      website,
      claimReason,
      sourcePath,
      sourceLocale,
    });

    await sendTransactionalEmail({
      to: email,
      subject: '[AI Best Tool] We received your claim request / 我们已收到你的认领申请',
      text: [
        `Thanks for claiming ${listingName}.`,
        '',
        'We received your request and will review it manually.',
        'If we need anything else, we will follow up by email.',
        '',
        'Claim details:',
        `- Listing: ${listingName}`,
        `- Company: ${company || '-'}`,
        `- Website: ${website || '-'}`,
        `- Website host: ${websiteHostname || '-'}`,
        `- Claim reason: ${claimReason || '-'}`,
        `- Source path: ${sourcePath || '-'}`,
        `- Source locale: ${sourceLocale || '-'}`,
      ].join('\n'),
      html: `
        <p>Thanks for claiming <strong>${escapeHtml(listingName)}</strong>.</p>
        <p>We received your request and will review it manually. If we need anything else, we will follow up by email.</p>
        <p><strong>Claim details</strong></p>
        <ul>
          <li><strong>Listing:</strong> ${escapeHtml(listingName)}</li>
          <li><strong>Company:</strong> ${company ? escapeHtml(company) : '-'}</li>
          <li><strong>Website:</strong> ${website ? escapeHtml(website) : '-'}</li>
          <li><strong>Website host:</strong> ${websiteHostname ? escapeHtml(websiteHostname) : '-'}</li>
          <li><strong>Claim reason:</strong> ${claimReason ? escapeHtml(claimReason) : '-'}</li>
          <li><strong>Source path:</strong> ${sourcePath ? escapeHtml(sourcePath) : '-'}</li>
          <li><strong>Source locale:</strong> ${sourceLocale ? escapeHtml(sourceLocale) : '-'}</li>
        </ul>
      `,
    });

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
          `Website host: ${websiteHostname || '-'}`,
          `Claim reason: ${claimReason || '-'}`,
          `Source path: ${sourcePath || '-'}`,
          `Source locale: ${sourceLocale || '-'}`,
          `Note: ${note || '-'}`,
        ].join('\n'),
        html: `
          <p><strong>Listing:</strong> ${escapeHtml(listingName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company) || '-'}</p>
          <p><strong>Website:</strong> ${escapeHtml(website) || '-'}</p>
          <p><strong>Website host:</strong> ${escapeHtml(websiteHostname) || '-'}</p>
          <p><strong>Claim reason:</strong> ${escapeHtml(claimReason) || '-'}</p>
          <p><strong>Source path:</strong> ${escapeHtml(sourcePath) || '-'}</p>
          <p><strong>Source locale:</strong> ${escapeHtml(sourceLocale) || '-'}</p>
          <p><strong>Note:</strong> ${escapeHtml(note) || '-'}</p>
        `,
      });
    }

    await recordDistributionAttributionEvent('claim', null, { claimId, listingName });
    } catch (notificationError) {
      console.error('Claim saved, but a follow-up notification failed:', notificationError);
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
