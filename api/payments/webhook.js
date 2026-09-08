import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Order service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ''));
  const bufB = Buffer.from(String(b || ''));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Called by payment_system's MerchantNotificationDispatcher whenever a payment we started via
// /api/checkout/create-session.js changes status. Unlike M-Pesa/AstroPay's own webhooks (which
// carry provider signatures payment_system verifies on its end), this endpoint has no built-in
// signature scheme -- PAYMENT_WEBHOOK_SHARED_SECRET is a stand-in so a stranger can't POST fake
// "paid" events here. Set the same value in payment_system's outgoing request (or ask it to add
// a header) before treating this as anything more than a test integration.
export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const expectedSecret = process.env.PAYMENT_WEBHOOK_SHARED_SECRET;
  if (expectedSecret) {
    const providedSecret = request.headers['x-webhook-secret'];
    if (!safeEqual(providedSecret, expectedSecret)) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const {
      merchant_payment_id: merchantPaymentId,
      provider_payment_id: providerPaymentId,
      status,
      amount
    } = request.body || {};

    if (!merchantPaymentId || !status) {
      return response.status(400).json({ error: 'merchant_payment_id and status are required' });
    }

    const db = supabaseAdmin();

    // merchant_payment_id is the order_number we sent as merchantPaymentId when opening the
    // checkout session (see api/checkout/create-session.js).
    const { data: order, error: orderLookupError } = await db
      .from('delivery_orders')
      .select('id, status')
      .eq('order_number', merchantPaymentId)
      .maybeSingle();
    if (orderLookupError) throw new Error('Could not look up order.');
    if (!order) {
      // Nothing to reconcile against (could be a retry after we've already been cleaned up).
      // Still 200 so payment_system's dispatcher doesn't retry forever.
      return response.status(200).json({ received: true, matched: false });
    }

    const mpesaStatus = status === 'APPROVED' ? 'paid' : status === 'FAILED' ? 'failed' : 'pending';

    const { error: paymentUpdateError } = await db
      .from('mpesa_payments')
      .update({
        status: mpesaStatus,
        mpesa_receipt_number: providerPaymentId || null,
        result_description: status,
        callback_payload: request.body,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', order.id);
    if (paymentUpdateError) throw new Error('Could not update payment record.');

    if (mpesaStatus === 'paid') {
      await db.from('delivery_orders').update({ status: 'confirmed' }).eq('id', order.id);
    } else if (mpesaStatus === 'failed') {
      await db.from('delivery_orders').update({ status: 'payment_failed' }).eq('id', order.id);
    }

    return response.status(200).json({ received: true, matched: true });
  } catch (error) {
    // Payment_system's dispatcher retries on non-2xx, so a real failure should surface as one.
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Webhook processing failed.' });
  }
}
