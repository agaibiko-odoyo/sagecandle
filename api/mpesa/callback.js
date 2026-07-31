import { createClient } from '@supabase/supabase-js';

function callbackMetadata(items = []) {
  return Object.fromEntries(items.map(item => [item.Name, item.Value]));
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const callback = request.body?.Body?.stkCallback;
    if (!callback?.CheckoutRequestID) return response.status(400).json({ error: 'Invalid M-Pesa callback.' });

    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
    const metadata = callbackMetadata(callback.CallbackMetadata?.Item);
    const paid = callback.ResultCode === 0;
    const { data: payment, error } = await db.from('mpesa_payments')
      .update({
        status: paid ? 'paid' : 'failed',
        result_code: callback.ResultCode,
        result_description: callback.ResultDesc,
        mpesa_receipt_number: metadata.MpesaReceiptNumber || null,
        callback_payload: request.body,
        updated_at: new Date().toISOString()
      })
      .eq('checkout_request_id', callback.CheckoutRequestID)
      .select('order_id').single();
    if (error || !payment) throw new Error('Payment record was not found.');

    await db.from('delivery_orders').update({ status: paid ? 'order_confirmed' : 'awaiting_confirmation' }).eq('id', payment.order_id);
    return response.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error', error);
    return response.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
