'use server';

import { revalidatePath } from 'next/cache';
import { getPool } from '@/db/neon/client';

import { requireAdmin } from '@/lib/auth/middleware';

interface ImportToolInput {
  url: string;
  source?: string;
}

function parseUrlSafely(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = parseUrlSafely(withProtocol);
  if (!parsed) {
    throw new TypeError('Invalid URL');
  }

  return parsed.toString();
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function createUniqueSlug(base: string): Promise<string> {
  const pool = getPool();
  const normalizedBase = slugify(base) || 'ai-tool';
  const existing = await pool.query('SELECT name FROM tools WHERE name = $1 OR name LIKE $2', [
    normalizedBase,
    `${normalizedBase}-%`,
  ]);
  const existingNames = new Set(existing.rows.map((row) => String(row.name || '')).filter(Boolean));

  if (!existingNames.has(normalizedBase)) {
    return normalizedBase;
  }

  const suffixes = Array.from(existingNames)
    .map((name) => {
      const match = name.match(new RegExp(`^${normalizedBase}-(\\d+)$`));
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => left - right);

  const nextSuffix =
    suffixes.reduce((candidate, suffix) => {
      if (suffix === candidate) {
        return candidate + 1;
      }

      return candidate;
    }, 2) || 2;

  return `${normalizedBase}-${nextSuffix}`;
}

export default async function importToolUrl({
  url,
  source,
}: ImportToolInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();

    const normalizedUrl = normalizeUrl(url);
    const parsed = parseUrlSafely(normalizedUrl);
    if (!parsed) {
      throw new TypeError('Invalid URL');
    }
    const host = parsed.hostname.replace(/^www\./, '');
    const sourceName = source?.trim() || 'Manual import';
    const slug = await createUniqueSlug(host);
    const title = { en: host, zh: host };
    const content = {
      en: `Imported from ${sourceName}. This tool is waiting for editorial research and completion.`,
      zh: `来自 ${sourceName} 的采集线索，等待编辑调研和补全。`,
    };
    const detail = {
      en: `Source URL: ${normalizedUrl}\n\nImported from ${sourceName}. Add category, pricing, screenshots, description, and tags before publishing.`,
      zh: `来源 URL：${normalizedUrl}\n\n来自 ${sourceName} 的采集线索。发布前请补全分类、定价、截图、简介和标签。`,
    };

    const pool = getPool();
    const result = await pool.query(
      `
        INSERT INTO tools (
          name, title, content, detail, url, tags, pricing, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [
        slug,
        JSON.stringify(title),
        JSON.stringify(content),
        JSON.stringify(detail),
        normalizedUrl,
        [],
        'freemium',
        'draft',
      ],
    );

    revalidatePath('/admin/collection');
    revalidatePath('/admin/tools');

    return { success: true, id: result.rows[0]?.id };
  } catch (error) {
    console.error('Error importing tool URL:', error);

    if (error instanceof TypeError) {
      return { success: false, error: 'Please enter a valid URL.' };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import tool URL.',
    };
  }
}
