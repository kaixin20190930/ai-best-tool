import { getCanonicalToolSlug, getLocalizedToolPath, isLegacyToolSlug } from '@/lib/config/toolRouteAliases';

const assertions: Array<[boolean, string]> = [
  [getCanonicalToolSlug('anthropic') === 'claude', 'Anthropic must resolve to Claude.'],
  [getCanonicalToolSlug('CLAUDE') === 'claude', 'Canonical slugs must be normalized.'],
  [getLocalizedToolPath('anthropic', 'en') === '/ai/claude', 'English alias path is invalid.'],
  [getLocalizedToolPath('anthropic', 'cn') === '/cn/ai/claude', 'Chinese alias path is invalid.'],
  [isLegacyToolSlug('anthropic'), 'Anthropic must be recognized as a legacy slug.'],
  [!isLegacyToolSlug('claude'), 'Claude must remain the canonical slug.'],
];

for (const [condition, message] of assertions) {
  if (!condition) throw new Error(message);
}

console.log('✅ Tool route aliases keep Claude canonical and Anthropic redirect-only.');
