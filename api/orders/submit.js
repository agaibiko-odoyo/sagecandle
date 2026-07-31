import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Order service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const { shippingDetails, deliveryMethodId, items } = request.body || {};
    const mpesaReference = String(shippingDetails?.mpesaReference || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(mpesaReference)) throw new Error('Enter a valid 10-character M-Pesa reference code.');
    if (!Array.isArray(items) || items.length === 0) throw new Error('Your order is empty.');

    const db = supabaseAdmin();
    const { data: createdOrders, error: orderError } = await db.rpc('create_delivery_order', {
      p_customer_name: `${shippingDetails.firstName || ''} ${shippingDetails.lastName || ''}`.trim(),
      p_customer_email: shippingDetails.email || '',
      p_customer_phone: '',
      p_address: shippingDetails.address || '',
      p_city: shippingDetails.city || '',
      p_postal_code: shippingDetails.postalCode || '',
      p_delivery_notes: shippingDetails.deliveryNotes || '',
      p_delivery_method_id: deliveryMethodId,
      p_items: items.map(item => ({ product_id: item.productId, quantity: item.quantity }))
    });
    if (orderError || !createdOrders?.[0]) throw new Error(orderError?.message || 'Could not submit your order.');

    const orderId = createdOrders[0].id;
    const { data: order, error: fetchOrderError } = await db
      .from('delivery_orders').select('id, order_number, total').eq('id', orderId).single();
    if (fetchOrderError || !order) throw new Error('Could not prepare your order.');

    const orderAccessToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(orderAccessToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error: tokenError } = await db.from('order_access_tokens').insert({ order_id: order.id, token_hash: tokenHash, expires_at: expiresAt });
    if (tokenError) throw new Error('Could not prepare your secure order session.');

    const { error: paymentError } = await db.from('mpesa_payments').insert({
      order_id: order.id,
      phone_number: 'manual-reference',
      mpesa_reference: mpesaReference,
      amount: order.total,
      status: 'awaiting_confirmation'
    });
    if (paymentError) throw new Error('Could not record your M-Pesa reference.');

    await db.from('delivery_orders').update({ status: 'awaiting_confirmation' }).eq('id', order.id);
    return response.status(200).json({ orderId: order.order_number, orderAccessToken, message: 'Your order is awaiting manual payment confirmation.' });
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to submit order.' });
  }
}
