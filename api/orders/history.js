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

    const { data: orders, error: ordersError } = await db
      .from('delivery_orders')
      .select('id, order_number, created_at, status, address, city, postal_code, delivery_method, subtotal, shipping_cost, total')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    if (ordersError) throw new Error(ordersError.message);

    const orderIds = (orders || []).map(order => order.id);
    const { data: items, error: itemsError } = orderIds.length
      ? await db.from('delivery_order_items').select('id, order_id, product_id, product_name, quantity, unit_price').in('order_id', orderIds)
      : { data: [], error: null };
    if (itemsError) throw new Error(itemsError.message);

    const itemsByOrder = new Map();
    for (const item of items || []) {
      const current = itemsByOrder.get(item.order_id) || [];
      current.push(item);
      itemsByOrder.set(item.order_id, current);
    }
    return response.status(200).json({ orders: (orders || []).map(order => ({ ...order, delivery_order_items: itemsByOrder.get(order.id) || [] })) });
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to load order history.' });
  }
}
