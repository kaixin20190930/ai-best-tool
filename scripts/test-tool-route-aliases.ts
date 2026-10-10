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
  [getCanonicalToolSlug('fireflies-ai') === 'fireflies', 'Fireflies.ai must resolve to Fireflies.'],
  [getLocalizedToolPath('fireflies-ai', 'en') === '/ai/fireflies', 'English Fireflies alias path is invalid.'],
  [getLocalizedToolPath('fireflies-ai', 'cn') === '/cn/ai/fireflies', 'Chinese Fireflies alias path is invalid.'],
  [isLegacyToolSlug('fireflies-ai'), 'Fireflies.ai must be recognized as a legacy slug.'],
  [!isLegacyToolSlug('fireflies'), 'Fireflies must remain the canonical slug.'],
  [getCanonicalToolSlug('murf-ai') === 'murf', 'Murf Studio must have one canonical slug.'],
  [
    getLocalizedToolPath('murf-ai', 'en') === '/ai/murf',
    'English Murf legacy path must resolve to the canonical path.',
  ],
  [
    getLocalizedToolPath('murf-ai', 'cn') === '/cn/ai/murf',
    'Chinese Murf legacy path must resolve to the canonical path.',
  ],
  [
    getLocalizedToolPath('murf-ai', 'tw') === '/tw/ai/murf',
    'Traditional Chinese Murf legacy path must resolve to the canonical path.',
  ],
  [isLegacyToolSlug('murf-ai'), 'Murf AI must be recognized as a legacy slug.'],
  [!isLegacyToolSlug('murf'), 'Murf must remain the canonical slug.'],
  [getCanonicalToolSlug('canva-magic-studio') === 'canva', 'Magic Studio must resolve to the single Canva identity.'],
  [getLocalizedToolPath('canva-magic-studio', 'en') === '/ai/canva', 'English Magic Studio alias path is invalid.'],
  [getLocalizedToolPath('canva-magic-studio', 'cn') === '/cn/ai/canva', 'Chinese Magic Studio alias path is invalid.'],
  [
    getLocalizedToolPath('canva-magic-studio', 'tw') === '/tw/ai/canva',
    'Traditional Chinese Magic Studio alias path is invalid.',
  ],
  [isLegacyToolSlug('canva-magic-studio'), 'Magic Studio must be recognized as a legacy surface route.'],
  [!isLegacyToolSlug('canva'), 'Canva must remain the canonical slug.'],
  [shouldRedirectExplicitEnglishToolPath('fathom'), 'The explicit /en Fathom path must redirect.'],
  [!shouldRedirectExplicitEnglishToolPath('claude'), 'Claude does not need the explicit-English exception.'],
  [middleware.includes('isLegacyToolSlug(toolSlug)'), 'Middleware must redirect aliases generically.'],
  [middleware.includes('NextResponse.redirect(redirectUrl, 308)'), 'Tool aliases must use a permanent 308 redirect.'],
  [
    middleware.includes("redirectUrl.pathname = getLocalizedToolPath(toolSlug, locale || 'en')"),
    'Localized aliases must retain locale while redirecting.',
  ],
  [
    middleware.includes('const redirectUrl = request.nextUrl.clone()'),
    'Alias redirects must clone the request URL and preserve its query.',
  ],
];

for (const [condition, message] of assertions) {
  if (!condition) throw new Error(message);
}

console.log('✅ Tool aliases keep Claude, Otter.ai, Fireflies, and Murf canonical with permanent legacy redirects.');
