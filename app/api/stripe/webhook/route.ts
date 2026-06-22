import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/db/neon/client';

import { getStripeWebhookSecret, verifyStripeWebhookSignature } from '@/lib/services/stripe';
import {
  hasSuccessfulPaymentCallbackByTransactionId,
  insertPaymentCallbackLog,
} from '@/app/actions/admin/paymentCallbacks';
import { activateCommercialPlacementBySystem } from '@/app/actions/admin/tools';
import { trackCommerceEvent } from '@/app/actions/analytics';
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

  if (eventType === 'checkout.session.async_payment_failed') {
    if (!toolId) {
      await writeCallbackLogSafe({
        toolId: null,
        transactionId,
        status: 'failed',
        source: 'stripe-webhook',
        errorMessage: 'Async payment failed but tool_id is missing from Stripe session metadata',
        payload: {
          eventType,
          paymentStatus,
          sessionId: transactionId,
        },
      });
      return NextResponse.json({ ok: false, error: 'tool_id missing' }, { status: 400 });
    }

    const pool = getPool();
    const toolResult = await pool.query(
      `
        SELECT
          id::text AS id,
          name,
          title,
          submitted_by::text AS "submittedBy"
        FROM tools
        WHERE id = $1
        LIMIT 1
      `,
      [toolId],
    );

    const tool = toolResult.rows[0] as Record<string, unknown> | undefined;

    await writeCallbackLogSafe({
      toolId,
      transactionId,
      status: 'failed',
      source: 'stripe-webhook',
      errorMessage: 'Stripe async payment failed',
      payload: {
        eventType,
        paymentStatus,
        sessionId: transactionId,
        toolName: tool?.name || null,
      },
    });

    const submittedBy = typeof tool?.submittedBy === 'string' ? tool.submittedBy : '';
    if (submittedBy) {
      const title = getLocalizedTitle(tool?.title, String(tool?.name || 'AI Best Tool'));
      await createNotification(
        submittedBy,
        'payment_failed',
        'Payment failed / 付款失败',
        `${title} did not complete payment. Please try the checkout again from your submissions page. / ${title} 支付未完成，请从“我的提交”重新发起付款。`,
        '/profile/submissions',
      );
    }

    return NextResponse.json({ ok: true, failed: true });
  }

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
        status,
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
  await trackCommerceEvent(
    'payment_success',
    {
      transactionId,
      eventType,
      paymentStatus,
      toolName: activation.name || tool.name || null,
    },
    toolId,
    submittedBy || null,
  );

  if (submittedBy) {
    const commercial = getRecord(getRecord(getRecord(tool.features).submission).commercial);
    const requestedDaysRaw = commercial.featuredDaysRequested;
    const requestedDays =
      typeof requestedDaysRaw === 'number' ? requestedDaysRaw : Number.parseInt(String(requestedDaysRaw ?? 0), 10) || 0;
    const isPublished = tool.status === 'published';
    let paymentMessage = `${title} has been paid and the listing is ready for review. / ${title} 已完成付款，提交已进入审核流程。`;

    if (requestedDays > 0) {
      paymentMessage = isPublished
        ? `${title} has been paid. Featured placement is now active. / ${title} 已完成付款，前排展示现已生效。`
        : `${title} has been paid. Featured placement will begin after approval. / ${title} 已完成付款，前排展示将在审核通过后开始。`;
    }
    await createNotification(
      submittedBy,
      'payment_confirmation',
      'Payment received / 已收到付款',
      paymentMessage,
      '/profile/submissions',
    );
  }

  return NextResponse.json({ ok: true, name: activation.name || tool.name || null });
}
