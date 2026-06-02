import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/db/neon/client';

import { getStripeWebhookSecret, verifyStripeWebhookSignature } from '@/lib/services/stripe';
import {
  hasSuccessfulPaymentCallbackByTransactionId,
  insertPaymentCallbackLog,
} from '@/app/actions/admin/paymentCallbacks';
import { activateCommercialPlacementBySystem } from '@/app/actions/admin/tools';
import { createNotification } from '@/app/actions/notifications';

export const runtime = 'nodejs';

type StripeCheckoutSessionEvent = {
  id?: string;
  type: string;
  data: {
    object: {
      id?: string;
      payment_status?: string;
      client_reference_id?: string | null;
      metadata?: Record<string, string | undefined>;
      customer_details?: {
        email?: string | null;
      };
    };
  };
};

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getLocalizedTitle(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  const record = getRecord(value);
  return (typeof record.en === 'string' && record.en) || (typeof record.zh === 'string' && record.zh) || fallback;
}

async function writeCallbackLogSafe(input: Parameters<typeof insertPaymentCallbackLog>[0]): Promise<void> {
  try {
    await insertPaymentCallbackLog(input);
  } catch (error) {
    console.error('Failed to write Stripe payment callback log:', error);
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = getStripeWebhookSecret();
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')?.trim() || '';

  if (!signature || !verifyStripeWebhookSignature(payload, signature, webhookSecret)) {
    await writeCallbackLogSafe({
      toolId: null,
      transactionId: null,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: 'Invalid Stripe webhook signature',
      payload: {
        path: request.nextUrl.pathname,
      },
    });
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 400 });
  }

  let event: StripeCheckoutSessionEvent;
  try {
    event = JSON.parse(payload) as StripeCheckoutSessionEvent;
  } catch (error) {
    await writeCallbackLogSafe({
      toolId: null,
      transactionId: null,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: 'Invalid JSON payload',
      payload: {
        path: request.nextUrl.pathname,
      },
    });
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const eventType = event.type;
  const session = event.data?.object;
  const transactionId = session?.id?.trim() || null;
  const toolId = session?.metadata?.tool_id?.trim() || session?.client_reference_id?.trim() || '';
  const paymentStatus = session?.payment_status || '';

  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(eventType)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!toolId) {
    await writeCallbackLogSafe({
      toolId: null,
      transactionId,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: 'tool_id missing from Stripe session metadata',
      payload: {
        eventType,
        paymentStatus,
        sessionId: transactionId,
      },
    });
    return NextResponse.json({ ok: false, error: 'tool_id missing' }, { status: 400 });
  }

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

  if (eventType === 'checkout.session.completed' && paymentStatus !== 'paid') {
    await writeCallbackLogSafe({
      toolId,
      transactionId,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: `Session completed but payment_status is ${paymentStatus || 'unknown'}`,
      payload: {
        eventType,
        paymentStatus,
        sessionId: transactionId,
      },
    });
    return NextResponse.json({ ok: true, skipped: true, paymentStatus });
  }

  const pool = getPool();
  const toolResult = await pool.query(
    `
      SELECT
        id::text AS id,
        name,
        title,
        submitted_by::text AS "submittedBy",
        features
      FROM tools
      WHERE id = $1
      LIMIT 1
    `,
    [toolId],
  );

  if (toolResult.rows.length === 0) {
    await writeCallbackLogSafe({
      toolId,
      transactionId,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: 'Tool not found',
      payload: {
        eventType,
        paymentStatus,
        sessionId: transactionId,
      },
    });
    return NextResponse.json({ ok: false, error: 'Tool not found' }, { status: 404 });
  }

  const tool = toolResult.rows[0] as Record<string, unknown>;
  const title = getLocalizedTitle(tool.title, String(tool.name || 'AI Best Tool'));
  const activation = await activateCommercialPlacementBySystem(toolId, transactionId);

  if (!activation.success) {
    await writeCallbackLogSafe({
      toolId,
      transactionId,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: activation.error || 'Activation failed',
      payload: {
        eventType,
        paymentStatus,
        sessionId: transactionId,
      },
    });
    return NextResponse.json({ ok: false, error: activation.error || 'Activation failed' }, { status: 500 });
  }

  await writeCallbackLogSafe({
    toolId,
    transactionId,
    status: 'success',
    source: 'stripe-webhook',
    payload: {
      eventType,
      paymentStatus,
      sessionId: transactionId,
      toolName: activation.name || tool.name || null,
    },
  });

  const submittedBy = typeof tool.submittedBy === 'string' ? tool.submittedBy : '';
  if (submittedBy) {
    await createNotification(
      submittedBy,
      'payment_confirmation',
      'Payment confirmed / 付款已确认',
      `${title} has been paid and the featured window is now active. / ${title} 已完成付款，前排展示已激活。`,
      '/profile/submissions',
    );
  }

  return NextResponse.json({ ok: true, name: activation.name || tool.name || null });
}
