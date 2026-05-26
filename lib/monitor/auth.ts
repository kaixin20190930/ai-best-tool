import { type NextRequest } from 'next/server';

export function isMonitorRequestAuthorized(request: NextRequest) {
  const token = process.env.MONITOR_API_TOKEN?.trim();

  if (!token) {
    return true;
  }

  const authorization = request.headers.get('authorization')?.trim();

  if (!authorization) {
    return false;
  }

  const [scheme, ...rest] = authorization.split(/\s+/);
  const providedToken = rest.join(' ').trim();

  return scheme.toLowerCase() === 'bearer' && providedToken === token;
}
