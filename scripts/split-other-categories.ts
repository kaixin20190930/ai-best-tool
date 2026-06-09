/* eslint-disable no-console, no-restricted-syntax, no-continue, no-await-in-loop */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';

type CategorySeed = {
  slug: string;
  orderIndex: number;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
};

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    slug: 'research',
    orderIndex: 7,
    name: { en: 'Research', zh: '研究' },
    description: {
      en: 'Tools for research, model discovery, datasets, and technical exploration',
      zh: '面向研究、模型发现、数据集与技术探索的工具',
    },
  },
  {
    slug: 'voice',
    orderIndex: 8,
    name: { en: 'Voice', zh: '语音' },
    description: {
      en: 'Voice, speech, transcription, and audio-first AI tools',
      zh: '面向语音、转录、音频工作流的 AI 工具',
    },
  },
  {
    slug: 'automation',
    orderIndex: 9,
    name: { en: 'Automation', zh: '自动化' },
    description: {
      en: 'Workflow automation, agents, and repeatable task orchestration',
      zh: '面向工作流自动化、Agent 与可复用任务编排的工具',
    },
  },
  {
    slug: 'developer-tools',
    orderIndex: 10,
    name: { en: 'Developer Tools', zh: '开发者工具' },
    description: {
      en: 'APIs, model infrastructure, developer platforms, and technical tooling',
      zh: '面向 API、模型基础设施、开发平台与技术工作流的工具',
    },
  },
];

const TOOL_CATEGORY_MAP: Record<string, string> = {
  'hugging-face': 'research',
  replicate: 'developer-tools',
};

function loadLocalEnv() {
  const envPath = '/Users/liukai/web/ai-best-tool/.env.local';
  const envText = fs.readFileSync(envPath, 'utf8');

  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function upsertCategories() {
  const pool = getPool();
  for (const category of CATEGORY_SEEDS) {
    await pool.query(
      `
        INSERT INTO categories (name, slug, description, order_index)
        VALUES ($1::jsonb, $2, $3::jsonb, $4)
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          order_index = EXCLUDED.order_index
      `,
      [JSON.stringify(category.name), category.slug, JSON.stringify(category.description), category.orderIndex],
    );
  }
}

async function getCategoryIdMap() {
  const pool = getPool();
  const result = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function reassignTools(categoryIdMap: Map<string, string>) {
  const pool = getPool();
  const changed: Array<{ name: string; target: string }> = [];

  for (const [toolName, categorySlug] of Object.entries(TOOL_CATEGORY_MAP)) {
    const categoryId = categoryIdMap.get(categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category ID for ${categorySlug}`);
    }

    const result = await pool.query(
      `
        UPDATE tools
        SET category_id = $1, updated_at = NOW()
        WHERE name = $2
          AND status = 'published'
        RETURNING name
      `,
      [categoryId, toolName],
    );

    if ((result.rowCount || 0) > 0) {
      changed.push({ name: toolName, target: categorySlug });
    }
  }

  return changed;
}

async function printOtherCount() {
  const pool = getPool();
  const result = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM tools t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.status = 'published'
      AND c.slug = 'other'
  `);
  return Number(result.rows[0]?.count || 0);
}

async function main() {
  loadLocalEnv();
  await upsertCategories();
  const categoryIdMap = await getCategoryIdMap();
  const reassigned = await reassignTools(categoryIdMap);
  const remainingOther = await printOtherCount();

  console.log(
    JSON.stringify(
      {
        createdOrUpdatedCategories: CATEGORY_SEEDS.map((item) => item.slug),
        reassigned,
        remainingOther,
      },
      null,
      2,
    ),
  );

  await getPool().end();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
