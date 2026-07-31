import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Order service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const accessToken = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!accessToken) return response.status(401).json({ error: 'Please sign in to view your orders.' });

  try {
    const db = supabaseAdmin();
    const { data: userData, error: userError } = await db.auth.getUser(accessToken);
    if (userError || !userData.user) return response.status(401).json({ error: 'Your sign-in session has expired.' });

    const { data, error } = await db
      .from('delivery_orders')
      .select('id, order_number, created_at, status, total, delivery_order_items(id, product_name, quantity, unit_price)')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return response.status(200).json({ orders: data || [] });
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to load order history.' });
  }
}
