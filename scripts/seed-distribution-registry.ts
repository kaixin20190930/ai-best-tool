#!/usr/bin/env tsx
/**
 * Seed the distribution registry with canonical channel templates and 10 target fixtures.
 */

import { config } from 'dotenv';
import { Pool } from 'pg';

import { DISTRIBUTION_TARGET_FIXTURES } from '@/lib/services/intelligence/fixtures';

config({ path: '.env.local' });

const connectionString = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.DATABASE_URL_UNPOOLED,
].find((candidate) => {
  if (!candidate) return false;
  try {
    const parsed = new URL(candidate);
    return ['postgres:', 'postgresql:'].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
});

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL / POSTGRES_URL / DATABASE_URL_UNPOOLED');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.com') || connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 1,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 30_000,
  allowExitOnIdle: true,
});

const channelTemplates = [
  {
    channelKey: 'ai-directories',
    titleTemplate: 'What is {{product}} and who is it for?',
    descriptionTemplate: 'Explain the problem, the actual workflow, and one proof point. Disclose affiliation when relevant.',
    maxTitleLength: 120,
    maxDescriptionLength: 500,
    requiredFields: ['product_url', 'audience', 'proof_point'],
  },
  {
    channelKey: 'alternative-sites',
    titleTemplate: '{{product}} as an alternative to {{category}}',
    descriptionTemplate: 'State the comparison honestly. Include the key difference and the user who should consider it.',
    maxTitleLength: 120,
    maxDescriptionLength: 500,
    requiredFields: ['product_url', 'alternative_context', 'difference'],
  },
  {
    channelKey: 'startup-launches',
    titleTemplate: 'We built {{product}} for {{audience}}',
    descriptionTemplate: 'Share the launch context, what changed, and what early users can test or discuss.',
    maxTitleLength: 100,
    maxDescriptionLength: 800,
    requiredFields: ['product_url', 'audience', 'launch_context'],
  },
  {
    channelKey: 'communities',
    titleTemplate: 'A useful answer for {{question}}',
    descriptionTemplate: 'Answer the question first. Mention the product only when it directly supports the answer and disclose affiliation.',
    maxTitleLength: 300,
    maxDescriptionLength: 2000,
    requiredFields: ['question', 'answer', 'disclosure'],
  },
  {
    channelKey: 'newsletters',
    titleTemplate: 'A practical product for {{audience}}',
    descriptionTemplate: 'Pitch a specific reader benefit, not a generic product announcement. Include one useful data point or example.',
    maxTitleLength: 100,
    maxDescriptionLength: 600,
    requiredFields: ['audience', 'reader_benefit', 'proof_point'],
  },
  {
    channelKey: 'owned-blog',
    titleTemplate: '{{product}}: what we learned from building and testing it',
    descriptionTemplate: 'Publish first-party evidence, dates, screenshots, limitations, and what readers can verify themselves.',
    maxTitleLength: 160,
    maxDescriptionLength: 1200,
    requiredFields: ['experiment', 'evidence', 'limitations'],
  },
  {
    channelKey: 'github',
    titleTemplate: 'A useful example for {{workflow}}',
    descriptionTemplate: 'Share a relevant repository, template, or documentation example. Do not place unrelated promotional links in issues.',
    maxTitleLength: 100,
    maxDescriptionLength: 1000,
    requiredFields: ['repository', 'workflow', 'documentation'],
  },
  {
    channelKey: 'reddit',
    titleTemplate: 'I tested {{product}} for {{use_case}}',
    descriptionTemplate: 'Lead with the real question or experience. State affiliation, share useful detail, and invite discussion rather than votes.',
    maxTitleLength: 300,
    maxDescriptionLength: 2000,
    requiredFields: ['question', 'experience', 'disclosure'],
  },
] as const;

const targetChannelKeyMap: Record<string, string> = {
  futurepedia: 'ai-directories',
  'theres-an-ai-for-that': 'ai-directories',
  saashub: 'alternative-sites',
  alternativeto: 'alternative-sites',
  'product-hunt': 'startup-launches',
  betalist: 'startup-launches',
  'hacker-news': 'communities',
  'indie-hackers': 'communities',
  github: 'github',
  reddit: 'reddit',
};

const verifiedTargetOverrides: Record<
  string,
  {
    submissionUrl: string;
    requiresAccount: boolean;
    requiresPayment: boolean;
    editorialReview: boolean;
    confidence: number;
    reviewReason: string;
  }
> = {
  saashub: {
    submissionUrl: 'https://www.saashub.com/services/submit',
    requiresAccount: true,
    requiresPayment: false,
    editorialReview: true,
    confidence: 90,
    reviewReason: 'Official submission page verified: free product submission is available; featured placement is optional.',
  },
  alternativeto: {
    submissionUrl: 'https://alternativeto.net/faq/',
    requiresAccount: true,
    requiresPayment: false,
    editorialReview: true,
    confidence: 80,
    reviewReason: 'Official FAQ verified: users can suggest a new application; new accounts must wait one week before submitting.',
  },
  futurepedia: {
    submissionUrl: 'https://www.futurepedia.io/submit-tool',
    requiresAccount: false,
    requiresPayment: true,
    editorialReview: true,
    confidence: 90,
    reviewReason: 'Official submission page verified: current listing options are paid and subject to editorial approval.',
  },
};

async function main() {
  console.log('🔧 Seeding distribution registry...');
  const { rows: channels } = await pool.query<{ id: string; channel_key: string }>(
    'select id, channel_key from distribution_channels order by sort_order asc, channel_key asc',
  );

  const channelIdByKey = new Map(channels.map((channel) => [channel.channel_key, channel.id]));
  const missingChannels = Array.from(new Set(channelTemplates.map((template) => template.channelKey))).filter(
    (key) => !channelIdByKey.has(key),
  );
  if (missingChannels.length > 0) {
    throw new Error(`Missing distribution channels: ${missingChannels.join(', ')}`);
  }

  for (const template of channelTemplates) {
    const channelId = channelIdByKey.get(template.channelKey);
    if (!channelId) continue;
    await pool.query(
      `
        insert into distribution_channel_templates (
          channel_id,
          title_template,
          description_template,
          max_title_length,
          max_description_length,
          required_fields,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6::jsonb, now())
        on conflict (channel_id)
        do update set
          title_template = excluded.title_template,
          description_template = excluded.description_template,
          max_title_length = excluded.max_title_length,
          max_description_length = excluded.max_description_length,
          required_fields = excluded.required_fields,
          updated_at = now()
      `,
      [
        channelId,
        template.titleTemplate,
        template.descriptionTemplate,
        template.maxTitleLength,
        template.maxDescriptionLength,
        JSON.stringify(template.requiredFields),
      ],
    );
  }
  console.log(`→ Seeded ${channelTemplates.length} channel templates`);

  const targets = DISTRIBUTION_TARGET_FIXTURES.map((fixture) => {
    const channelKey = targetChannelKeyMap[fixture.key];
    const channelId = channelIdByKey.get(channelKey);
    if (!channelId) {
      throw new Error(`Missing channel for target fixture ${fixture.key}`);
    }

    const verified = verifiedTargetOverrides[fixture.key];
    return {
      channelId,
      name: fixture.name,
      homepageUrl: fixture.homepageUrl,
      submissionUrl: verified?.submissionUrl || fixture.seedUrl || null,
      registrationUrl: null,
      pricingUrl: null,
      audience:
        fixture.channelType === 'directory'
          ? 'AI tool buyers'
          : fixture.channelType === 'alternative'
            ? 'comparison shoppers'
            : fixture.channelType === 'startup'
              ? 'launch audiences'
              : fixture.channelType === 'community'
                ? 'community members'
                : fixture.channelType === 'github'
                  ? 'developers'
                  : 'readers',
      requiresAccount: verified?.requiresAccount || false,
      requiresPayment: verified?.requiresPayment || false,
      editorialReview: verified?.editorialReview || false,
      confidence: verified?.confidence || 55,
      reviewReason: verified?.reviewReason || `Seeded from canonical target fixture ${fixture.name}.`,
    };
  });

  for (const target of targets) {
    await pool.query(
      `
        insert into distribution_targets (
          channel_id,
          name,
          homepage_url,
          submission_url,
          registration_url,
          pricing_url,
          audience,
          target_status,
          requires_account,
          requires_payment,
          requires_captcha,
          requires_backlink,
          editorial_review,
          expected_review_days,
          confidence,
          notes,
          metadata,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, false, false, $10, null, $11, $12, '{}'::jsonb, now())
        on conflict (channel_id, homepage_url)
        do update set
          name = excluded.name,
          submission_url = excluded.submission_url,
          registration_url = excluded.registration_url,
          pricing_url = excluded.pricing_url,
          audience = excluded.audience,
          target_status = excluded.target_status,
          requires_account = excluded.requires_account,
          requires_payment = excluded.requires_payment,
          editorial_review = excluded.editorial_review,
          confidence = excluded.confidence,
          notes = excluded.notes,
          updated_at = now()
      `,
      [
        target.channelId,
        target.name,
        target.homepageUrl,
        target.submissionUrl,
        target.registrationUrl,
        target.pricingUrl,
        target.audience,
        target.requiresAccount,
        target.requiresPayment,
        target.editorialReview,
        target.confidence,
        target.reviewReason,
      ],
    );
  }
  console.log(`→ Seeded ${targets.length} distribution targets`);

  console.log('\n✅ Distribution registry seed completed.');
}

main()
  .catch((error) => {
    console.error('❌ Failed to seed distribution registry:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
