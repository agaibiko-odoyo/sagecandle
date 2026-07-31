import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const checkoutRequestId = String(request.query.checkoutRequestId || '');
  if (!checkoutRequestId) return response.status(400).json({ error: 'Missing payment reference.' });

  try {
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
    const { data, error } = await db.from('mpesa_payments')
      .select('status, result_description')
      .eq('checkout_request_id', checkoutRequestId)
      .single();
    if (error || !data) return response.status(404).json({ error: 'Payment not found.' });
    return response.status(200).json(data);
  } catch {
    return response.status(500).json({ error: 'Unable to check payment status.' });
  }
}
