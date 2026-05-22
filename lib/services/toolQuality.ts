interface ToolQualityInput {
  category_id?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  content?: unknown;
  detail?: unknown;
  pricing?: string | null;
  tags?: string[] | null;
}

interface ToolQualityCheck {
  key: string;
  label: string;
  passed: boolean;
  points: number;
}

function getText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const candidate = record.en || record.zh || Object.values(record)[0];
    return typeof candidate === 'string' ? candidate : '';
  }

  return '';
}

export function getToolQuality(tool: ToolQualityInput): {
  score: number;
  checks: ToolQualityCheck[];
  missingLabels: string[];
} {
  const content = getText(tool.content).trim();
  const detail = getText(tool.detail).trim();
  const checks: ToolQualityCheck[] = [
    {
      key: 'category',
      label: 'Category',
      passed: Boolean(tool.category_id),
      points: 20,
    },
    {
      key: 'screenshot',
      label: 'Screenshot',
      passed: Boolean(tool.thumbnail_url),
      points: 20,
    },
    {
      key: 'logo',
      label: 'Logo',
      passed: Boolean(tool.image_url),
      points: 15,
    },
    {
      key: 'description',
      label: 'Description',
      passed: content.length >= 80,
      points: 20,
    },
    {
      key: 'detail',
      label: 'Detailed copy',
      passed: detail.length >= 160,
      points: 15,
    },
    {
      key: 'pricing',
      label: 'Pricing',
      passed: Boolean(tool.pricing),
      points: 5,
    },
    {
      key: 'tags',
      label: 'Tags',
      passed: Boolean(tool.tags?.length),
      points: 5,
    },
  ];

  const score = checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0);

  return {
    score,
    checks,
    missingLabels: checks.filter((check) => !check.passed).map((check) => check.label),
  };
}
