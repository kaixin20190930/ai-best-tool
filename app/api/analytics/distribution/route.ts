import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const eventTypes = new Set(['visit', 'signup', 'submit', 'claim', 'checkout', 'payment']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = typeof body?.event === 'string' && eventTypes.has(body.event) ? body.event : 'visit';
    const linkId = typeof body?.linkId === 'string' && body.linkId.trim() ? body.linkId.trim() : null;
    const sessionId = request.cookies.get('abt_distribution_session')?.value?.trim() || randomUUID();
    const supabase = createAdminClient();

    let projectId = typeof body?.projectId === 'string' ? body.projectId.trim() : null;
    let channelId = typeof body?.channelId === 'string' ? body.channelId.trim() : null;
    if (linkId) {
      const { data: link } = await supabase.from('distribution_links').select('project_id, channel_id').eq('id', linkId).maybeSingle();
      projectId = link?.project_id || projectId;
      channelId = link?.channel_id || channelId;
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('abt_distribution_session', sessionId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90, secure: process.env.NODE_ENV === 'production' });
    if (linkId) response.cookies.set('abt_dist_link', linkId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90, secure: process.env.NODE_ENV === 'production' });
    if (projectId) response.cookies.set('abt_dist_project', projectId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90, secure: process.env.NODE_ENV === 'production' });
    if (channelId) response.cookies.set('abt_dist_channel', channelId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90, secure: process.env.NODE_ENV === 'production' });

    const { error } = await supabase.from('distribution_attribution_events').insert({
      event_type: eventType,
      session_id: sessionId,
      project_id: projectId,
      channel_id: channelId,
      link_id: linkId,
      metadata: {
        pagePath: typeof body?.pagePath === 'string' ? body.pagePath.slice(0, 500) : null,
        referrer: request.headers.get('referer') || null,
        ...(body?.metadata && typeof body.metadata === 'object' ? body.metadata : {}),
      },
    });
    if (error) throw error;
    return response;
  } catch (error) {
    console.error('Distribution attribution tracking failed:', error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
