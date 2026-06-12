import { NextResponse } from 'next/server';

import { buildLocalizedTopLevelUrl } from '@/lib/routing/topLevelRedirect';

export function GET(request: Request) {
  return NextResponse.redirect(buildLocalizedTopLevelUrl(request, '/submit'), 307);
}
