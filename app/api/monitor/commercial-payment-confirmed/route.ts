import { NextRequest, NextResponse } from 'next/server';
import { activateCommercialPlacementBySystem } from '@/app/actions/admin/tools';
import {
  hasSuccessfulPaymentCallbackByTransactionId,
  insertPaymentCallbackLog,
} from '@/app/actions/admin/paymentCallbacks';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

async function writeCallbackLogSafe(
  input: Parameters<typeof insertPaymentCallbackLog>[0]
) {
  try {
    await insertPaymentCallbackLog(input);
  } catch (error) {
    console.error('Failed to write payment callback log:', error);
  }
}

export async function GET(request: NextRequest) {
  if (!isMonitorRequestAuthorized(request)) {
    await writeCallbackLogSafe({
      toolId: null,
      transactionId: null,
      status: 'failed',
      source: 'monitor-api',
      errorMessage: 'Unauthorized: missing or invalid MONITOR_API_TOKEN',
      payload: {
        path: request.nextUrl.pathname,
        query: request.nextUrl.searchParams.toString(),
      },
    });
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: missing or invalid MONITOR_API_TOKEN' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const toolId = (searchParams.get('toolId') || '').trim();
  const transactionId = (searchParams.get('transactionId') || '').trim();

  if (transactionId) {
    const alreadyProcessed = await hasSuccessfulPaymentCallbackByTransactionId(transactionId);
    if (alreadyProcessed) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: 'Transaction already processed',
      });
    }
  }

  if (!toolId) {
    await writeCallbackLogSafe({
      toolId: null,
      transactionId: transactionId || null,
      status: 'failed',
      source: 'monitor-api',
      errorMessage: 'toolId is required',
      payload: {
        path: request.nextUrl.pathname,
        query: request.nextUrl.searchParams.toString(),
      },
    });
    return NextResponse.json({ ok: false, error: 'toolId is required' }, { status: 400 });
  }

  const result = await activateCommercialPlacementBySystem(toolId, transactionId || null);
  if (!result.success) {
    await writeCallbackLogSafe({
      toolId,
      transactionId: transactionId || null,
      status: 'failed',
      source: 'monitor-api',
      errorMessage: result.error || 'Activation failed',
      payload: {
        path: request.nextUrl.pathname,
        query: request.nextUrl.searchParams.toString(),
      },
    });
    return NextResponse.json(
      { ok: false, error: result.error || 'Activation failed' },
      { status: 500 }
    );
  }

  await writeCallbackLogSafe({
    toolId,
    transactionId: transactionId || null,
    status: 'success',
    source: 'monitor-api',
    payload: {
      path: request.nextUrl.pathname,
      query: request.nextUrl.searchParams.toString(),
    },
  });

  return NextResponse.json({ ok: true, name: result.name || null });
}
