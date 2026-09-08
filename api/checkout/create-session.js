import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import { notifyAdmins, sendPushToUsers } from '../_lib/push.js';

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Order service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

// Same idea as api/orders/submit.js, minus the manual M-Pesa reference: the order is created
// first (status 'awaiting_payment'), then a hosted checkout session is opened against
// payment_system so the frontend can embed it in an <iframe> instead of asking for a reference.
export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { PAYMENT_SYSTEM_BASE_URL, PAYMENT_SYSTEM_MERCHANT_JWT } = process.env;
  if (!PAYMENT_SYSTEM_BASE_URL || !PAYMENT_SYSTEM_MERCHANT_JWT) {
    return response.status(500).json({ error: 'Payment gateway is not configured.' });
  }

  try {
    const { shippingDetails, deliveryMethodId, items } = request.body || {};
    if (!/^\S+@\S+\.\S+$/.test(String(shippingDetails?.email || '').trim()) || String(shippingDetails?.phone || '').trim().length < 6) {
      throw new Error('Enter a valid email address and phone number.');
    }
    if (!Array.isArray(items) || items.length === 0) throw new Error('Your order is empty.');

    const db = supabaseAdmin();
    const accessToken = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    let userId = null;
    if (accessToken) {
      const { data: userData, error: userError } = await db.auth.getUser(accessToken);
      if (userError) throw new Error('Your sign-in session has expired. Please sign in again or continue as a guest.');
      userId = userData.user?.id || null;
    }

    const { data: createdOrders, error: orderError } = await db.rpc('create_delivery_order', {
      p_customer_name: `${shippingDetails.firstName || ''} ${shippingDetails.lastName || ''}`.trim(),
      p_customer_email: shippingDetails.email || '',
      p_customer_phone: String(shippingDetails.phone).trim(),
      p_address: shippingDetails.address || '',
      p_city: shippingDetails.city || '',
      p_postal_code: shippingDetails.postalCode || '',
      p_delivery_notes: shippingDetails.deliveryNotes || '',
      p_delivery_method_id: deliveryMethodId,
      p_items: items.map(item => ({ product_id: item.productId, quantity: item.quantity })),
      p_user_id: userId
    });
    if (orderError || !createdOrders?.[0]) throw new Error(orderError?.message || 'Could not submit your order.');

    const orderId = createdOrders[0].id;
    const { data: order, error: fetchOrderError } = await db
      .from('delivery_orders').select('id, order_number, total').eq('id', orderId).single();
    if (fetchOrderError || !order) throw new Error('Could not prepare your order.');

    if (userId) {
      const { error: profileError } = await db.from('customer_profiles').upsert({
        user_id: userId,
        first_name: String(shippingDetails.firstName || '').trim() || null,
        last_name: String(shippingDetails.lastName || '').trim() || null,
        email: String(shippingDetails.email || '').trim().toLowerCase() || null,
        phone: String(shippingDetails.phone || '').trim() || null,
        address: String(shippingDetails.address || '').trim() || null,
        city: String(shippingDetails.city || '').trim() || null,
        postal_code: String(shippingDetails.postalCode || '').trim() || null,
        delivery_notes: String(shippingDetails.deliveryNotes || '').trim() || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (profileError) throw new Error('Could not save your account details.');
    }

    // Same order-access-token pattern as submit.js: lets the (possibly anonymous) shopper poll
    // /api/mpesa/status for this order without needing to be signed in.
    const orderAccessToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(orderAccessToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error: tokenError } = await db.from('order_access_tokens').insert({ order_id: order.id, token_hash: tokenHash, expires_at: expiresAt });
    if (tokenError) throw new Error('Could not prepare your secure order session.');

    // Open the hosted checkout session on payment_system. successUrl/errorUrl are only used by
    // the fallback top-level redirect (e.g. AstroPay); the primary UX polls /api/mpesa/status
    // via the existing store logic, unchanged.
    const origin = request.headers.origin || `https://${request.headers.host}`;
    const sessionResponse = await fetch(`${PAYMENT_SYSTEM_BASE_URL}/api/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYMENT_SYSTEM_MERCHANT_JWT}`
      },
      body: JSON.stringify({
        merchantPaymentId: order.order_number,
        amount: order.total,
        currency: 'KES',
        country: 'KE',
        description: `Sage Candle order ${order.order_number}`,
        customerEmail: shippingDetails.email,
        customerFirstName: shippingDetails.firstName,
        customerLastName: shippingDetails.lastName,
        customerPhone: shippingDetails.phone,
        successUrl: `${origin}/?view=confirmation&order=${order.order_number}`,
        errorUrl: `${origin}/?view=checkout&paymentFailed=1`
      })
    });
    if (!sessionResponse.ok) {
      const errBody = await sessionResponse.json().catch(() => ({}));
      throw new Error(errBody.message || 'Could not start the payment gateway session.');
    }
    const { sessionToken, checkoutUrl } = await sessionResponse.json();

    // Reuse mpesa_payments as the single source of truth the frontend already polls
    // (api/mpesa/status.js). checkout_request_id carries payment_system's session token so the
    // webhook (api/payments/webhook.js) can find this row again once payment_system tells us
    // which merchant_payment_id (order_number) it belongs to.
    const { error: paymentError } = await db.from('mpesa_payments').insert({
      order_id: order.id,
      phone_number: shippingDetails.phone,
      checkout_request_id: sessionToken,
      amount: order.total,
      status: 'pending'
    });
    if (paymentError) throw new Error('Could not record your payment session.');

    await db.from('delivery_orders').update({ status: 'awaiting_payment' }).eq('id', order.id);
    await Promise.all([
      sendPushToUsers([userId], {
        title: `Order ${order.order_number}`,
        body: 'Order received. Complete payment to confirm it.',
        url: '/profile'
      }),
      notifyAdmins({
        title: `New order ${order.order_number}`,
        body: `${shippingDetails.firstName || ''} ${shippingDetails.lastName || ''}`.trim() || 'A customer',
        url: '/'
      })
    ]);

    return response.status(200).json({
      orderId: order.order_number,
      orderAccessToken,
      checkoutUrl,
      message: 'Complete your payment to confirm this order.'
    });
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to submit order.' });
  }
}
