import fs from 'node:fs';

import {
  getCanonicalToolSlug,
  getLocalizedToolPath,
  isLegacyToolSlug,
  shouldRedirectExplicitEnglishToolPath,
} from '@/lib/config/toolRouteAliases';

const middleware = fs.readFileSync('middleware.ts', 'utf8');

const assertions: Array<[boolean, string]> = [
  [getCanonicalToolSlug('anthropic') === 'claude', 'Anthropic must resolve to Claude.'],
  [getCanonicalToolSlug('CLAUDE') === 'claude', 'Canonical slugs must be normalized.'],
  [getLocalizedToolPath('anthropic', 'en') === '/ai/claude', 'English alias path is invalid.'],
  [getLocalizedToolPath('anthropic', 'cn') === '/cn/ai/claude', 'Chinese alias path is invalid.'],
  [isLegacyToolSlug('anthropic'), 'Anthropic must be recognized as a legacy slug.'],
  [!isLegacyToolSlug('claude'), 'Claude must remain the canonical slug.'],
  [getCanonicalToolSlug('otter') === 'otter-ai', 'Otter must resolve to Otter.ai.'],
  [getLocalizedToolPath('otter', 'en') === '/ai/otter-ai', 'English Otter alias path is invalid.'],
  [getLocalizedToolPath('otter', 'cn') === '/cn/ai/otter-ai', 'Chinese Otter alias path is invalid.'],
  [isLegacyToolSlug('otter'), 'Otter must be recognized as a legacy slug.'],
  [!isLegacyToolSlug('otter-ai'), 'Otter.ai must remain the canonical slug.'],
  [shouldRedirectExplicitEnglishToolPath('fathom'), 'The explicit /en Fathom path must redirect.'],
  [!shouldRedirectExplicitEnglishToolPath('claude'), 'Claude does not need the explicit-English exception.'],
  [middleware.includes('isLegacyToolSlug(toolSlug)'), 'Middleware must redirect aliases generically.'],
];

for (const [condition, message] of assertions) {
  if (!condition) throw new Error(message);
}

console.log('✅ Tool aliases keep Claude and Otter.ai canonical with generic redirect-only aliases.');
