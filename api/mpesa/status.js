import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const accessToken = String(request.query.token || '');
  if (!accessToken) return response.status(400).json({ error: 'Missing order session.' });

  try {
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
    const tokenHash = createHash('sha256').update(accessToken).digest('hex');
    const { data: token, error: tokenError } = await db.from('order_access_tokens')
      .select('order_id')
      .eq('token_hash', tokenHash)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (tokenError || !token) return response.status(404).json({ error: 'Order session expired.' });

    const { data, error } = await db.from('mpesa_payments')
      .select('status, result_description')
      .eq('order_id', token.order_id)
      .single();
    if (error || !data) return response.status(404).json({ error: 'Payment not found.' });
    const { data: order } = await db.from('delivery_orders').select('status').eq('id', token.order_id).single();
    const completedStatuses = ['order_confirmed', 'departed_store', 'out_for_delivery', 'delivered_successfully'];
    const status = completedStatuses.includes(order?.status) ? 'paid' : data.status === 'failed' ? 'failed' : data.status;
    return response.status(200).json({ ...data, status });
  } catch {
    return response.status(500).json({ error: 'Unable to check payment status.' });
  }
}
