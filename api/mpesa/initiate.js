import { createClient } from '@supabase/supabase-js';

const darajaBaseUrl = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

function nairobiTimestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

function normalizePhone(value) {
  let phone = String(value || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
  if (phone.startsWith('7') || phone.startsWith('1')) phone = `254${phone}`;
  if (!/^254[17]\d{8}$/.test(phone)) throw new Error('Enter a valid Kenyan M-Pesa number.');
  return phone;
}

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Payment service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

async function darajaAccessToken() {
  const authorization = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await fetch(`${darajaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${authorization}` }
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error('Could not authenticate with M-Pesa.');
  return body.access_token;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const { shippingDetails, deliveryMethodId, items } = request.body || {};
    if (!shippingDetails || !Array.isArray(items) || items.length === 0) throw new Error('Your order details are incomplete.');
    const phone = normalizePhone(shippingDetails.phone);
    const db = supabaseAdmin();

    const { data: createdOrders, error: orderError } = await db.rpc('create_delivery_order', {
      p_customer_name: `${shippingDetails.firstName || ''} ${shippingDetails.lastName || ''}`.trim(),
      p_customer_email: shippingDetails.email || '',
      p_customer_phone: phone,
      p_address: shippingDetails.address || '',
      p_city: shippingDetails.city || '',
      p_postal_code: shippingDetails.postalCode || '',
      p_delivery_notes: shippingDetails.deliveryNotes || '',
      p_delivery_method_id: deliveryMethodId,
      p_items: items.map(item => ({ product_id: item.productId, quantity: item.quantity }))
    });
    if (orderError || !createdOrders?.[0]) throw new Error(orderError?.message || 'Could not create your order.');

    const orderId = createdOrders[0].id;
    const { data: order, error: fetchOrderError } = await db
      .from('delivery_orders').select('id, order_number, total').eq('id', orderId).single();
    if (fetchOrderError || !order) throw new Error('Could not prepare your payment.');

    const { data: payment, error: paymentError } = await db.from('mpesa_payments')
      .insert({ order_id: order.id, phone_number: phone, amount: order.total, status: 'initiated' })
      .select('id').single();
    if (paymentError || !payment) throw new Error('Could not prepare your payment.');

    const timestamp = nairobiTimestamp();
    const shortcode = process.env.MPESA_SHORTCODE;
    const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const accessToken = await darajaAccessToken();
    const stkResponse = await fetch(`${darajaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
        Amount: Math.round(Number(order.total)),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: order.order_number,
        TransactionDesc: `Sage Candle ${order.order_number}`
      })
    });
    const stk = await stkResponse.json();
    if (!stkResponse.ok || !stk.CheckoutRequestID) {
      await Promise.all([
        db.from('mpesa_payments').update({ status: 'failed', result_description: stk.errorMessage || stk.ResponseDescription || 'STK request failed' }).eq('id', payment.id),
        db.from('delivery_orders').update({ status: 'payment_failed' }).eq('id', order.id)
      ]);
      throw new Error(stk.errorMessage || stk.ResponseDescription || 'Could not start the M-Pesa prompt.');
    }

    await Promise.all([
      db.from('mpesa_payments').update({ status: 'pending', merchant_request_id: stk.MerchantRequestID, checkout_request_id: stk.CheckoutRequestID }).eq('id', payment.id),
      db.from('delivery_orders').update({ status: 'awaiting_payment' }).eq('id', order.id)
    ]);

    return response.status(200).json({ orderId: order.order_number, checkoutRequestId: stk.CheckoutRequestID, message: 'Check your phone to complete the M-Pesa payment.' });
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to start payment.' });
  }
}
