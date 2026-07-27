import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const DEFAULT_USER_AGENT = 'AI Best Tool Intelligence/1.0 (+https://aibesttool.com; evidence research)';
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 4;

const allowedContentTypes = [
  'text/html',
  'application/xhtml+xml',
  'text/plain',
  'application/json',
  'application/xml',
  'text/xml',
];

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  userAgent?: string;
  respectRobots?: boolean;
}

export interface SafeFetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  contentType: string;
  body: string;
  redirects: string[];
}

export function isSuccessfulHttpStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

export function isEvidenceHtmlContentType(contentType: string): boolean {
  const normalized = contentType.split(';')[0]?.trim().toLowerCase();
  return normalized === 'text/html' || normalized === 'application/xhtml+xml';
}

interface RobotsRule {
  type: 'allow' | 'disallow';
  path: string;
}

export class SafeFetchError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'invalid_url'
      | 'blocked_host'
      | 'blocked_address'
      | 'robots_disallowed'
      | 'too_many_redirects'
      | 'unsupported_content'
      | 'response_too_large'
      | 'timeout'
      | 'network_error',
  ) {
    super(message);
    this.name = 'SafeFetchError';
  }
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return true;
  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

export function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '');
  const version = isIP(normalized);

  if (version === 4) return isPrivateIpv4(normalized);
  if (version !== 6) return true;

  if (normalized.startsWith('::ffff:')) {
    return isPrivateIpv4(normalized.slice('::ffff:'.length));
  }

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('2001:db8:')
  );
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');
  return (
    !normalized.includes('.') ||
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal') ||
    normalized.endsWith('.home') ||
    normalized.endsWith('.lan')
  );
}

export async function validatePublicUrl(value: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SafeFetchError('The URL is invalid.', 'invalid_url');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new SafeFetchError('Only credential-free HTTP(S) URLs are allowed.', 'invalid_url');
  }

  if (isBlockedHostname(url.hostname)) {
    throw new SafeFetchError(`The hostname ${url.hostname} is not public.`, 'blocked_host');
  }

  if (isIP(url.hostname)) {
    if (isPrivateAddress(url.hostname)) {
      throw new SafeFetchError(`The address ${url.hostname} is not public.`, 'blocked_address');
    }
    return url;
  }

  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = (await lookup(url.hostname, {
      all: true,
      verbatim: true,
    })) as Array<{ address: string; family: number }>;
  } catch {
    throw new SafeFetchError(`Unable to resolve ${url.hostname}.`, 'network_error');
  }

  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new SafeFetchError(`The hostname ${url.hostname} resolves to a non-public address.`, 'blocked_address');
  }

  return url;
}

export function parseRobotsRules(content: string, userAgent = '*'): RobotsRule[] {
  const targetAgent = userAgent.toLowerCase();
  const groups: Array<{ agents: string[]; rules: RobotsRule[] }> = [];
  let current: { agents: string[]; rules: RobotsRule[] } | null = null;
  let sawRule = false;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === 'user-agent') {
      if (!current || sawRule) {
        current = { agents: [], rules: [] };
        groups.push(current);
        sawRule = false;
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (!current || (key !== 'allow' && key !== 'disallow')) continue;
    sawRule = true;
    if (!value) continue;
    current.rules.push({ type: key, path: value });
  }

  const matching = groups.filter((group) =>
    group.agents.some((agent) => agent === '*' || targetAgent.includes(agent) || agent.includes(targetAgent)),
  );
  const specific = matching.filter((group) => group.agents.some((agent) => agent !== '*'));
  return (specific.length > 0 ? specific : matching).flatMap((group) => group.rules);
}

export function isPathAllowedByRobots(pathname: string, rules: RobotsRule[]): boolean {
  const matches = rules
    .filter((rule) => pathname.startsWith(rule.path.replace(/\*.*$/, '')))
    .sort((left, right) => right.path.length - left.path.length);
  return matches[0]?.type !== 'disallow';
}

async function readResponseBody(response: Response, maxBytes: number, controller: AbortController): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) {
    controller.abort();
    throw new SafeFetchError('The response is larger than the configured limit.', 'response_too_large');
  }

  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      controller.abort();
      throw new SafeFetchError('The response exceeded the configured limit.', 'response_too_large');
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

async function fetchWithoutRobots(
  requestedUrl: string,
  options: Required<Omit<SafeFetchOptions, 'respectRobots'>>,
): Promise<SafeFetchResult> {
  let currentUrl = requestedUrl;
  const redirects: string[] = [];

  for (let redirectCount = 0; redirectCount <= options.maxRedirects; redirectCount += 1) {
    const validatedUrl = await validatePublicUrl(currentUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(validatedUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.8,*/*;q=0.1',
          'user-agent': options.userAgent,
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new SafeFetchError('The redirect response has no location.', 'network_error');
        }
        if (redirectCount === options.maxRedirects) {
          throw new SafeFetchError('The redirect limit was exceeded.', 'too_many_redirects');
        }
        currentUrl = new URL(location, validatedUrl).toString();
        redirects.push(currentUrl);
        continue;
      }

      const contentType = (response.headers.get('content-type') || 'text/plain').split(';')[0].trim().toLowerCase();
      if (!allowedContentTypes.includes(contentType)) {
        throw new SafeFetchError(`Unsupported content type: ${contentType || 'unknown'}.`, 'unsupported_content');
      }

      return {
        requestedUrl,
        finalUrl: validatedUrl.toString(),
        status: response.status,
        contentType,
        body: await readResponseBody(response, options.maxBytes, controller),
        redirects,
      };
    } catch (error) {
      if (error instanceof SafeFetchError) throw error;
      if (controller.signal.aborted) {
        throw new SafeFetchError('The request timed out.', 'timeout');
      }
      throw new SafeFetchError(error instanceof Error ? error.message : 'The request failed.', 'network_error');
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new SafeFetchError('The redirect limit was exceeded.', 'too_many_redirects');
}

export async function safeFetchText(requestedUrl: string, input: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const options = {
    timeoutMs: input.timeoutMs || DEFAULT_TIMEOUT_MS,
    maxBytes: input.maxBytes || DEFAULT_MAX_BYTES,
    maxRedirects: input.maxRedirects ?? DEFAULT_MAX_REDIRECTS,
    userAgent: input.userAgent || DEFAULT_USER_AGENT,
  };
  const url = await validatePublicUrl(requestedUrl);

  if (input.respectRobots !== false && url.pathname !== '/robots.txt') {
    const robotsUrl = new URL('/robots.txt', url).toString();
    try {
      const robots = await fetchWithoutRobots(robotsUrl, options);
      if (
        robots.status !== 404 &&
        !isPathAllowedByRobots(`${url.pathname}${url.search}`, parseRobotsRules(robots.body, options.userAgent))
      ) {
        throw new SafeFetchError('The path is disallowed by robots.txt.', 'robots_disallowed');
      }
    } catch (error) {
      if (error instanceof SafeFetchError && error.code === 'robots_disallowed') throw error;
      // A missing or temporarily unavailable robots file does not create rules.
    }
  }

  return fetchWithoutRobots(url.toString(), options);
}
