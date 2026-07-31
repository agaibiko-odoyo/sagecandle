import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Account service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

async function getUser(request, db) {
  const accessToken = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!accessToken) return null;
  const { data, error } = await db.auth.getUser(accessToken);
  return error ? null : data.user;
}

export default async function handler(request, response) {
  if (!['GET', 'PUT'].includes(request.method)) return response.status(405).json({ error: 'Method not allowed' });
  try {
    const db = supabaseAdmin();
    const user = await getUser(request, db);
    if (!user) return response.status(401).json({ error: 'Your sign-in session has expired.' });

    if (request.method === 'GET') {
      const { data, error } = await db.from('customer_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      return response.status(200).json({ profile: data });
    }

    const input = request.body || {};
    const profile = {
      user_id: user.id,
      first_name: String(input.firstName || '').trim() || null,
      last_name: String(input.lastName || '').trim() || null,
      email: String(input.email || user.email || '').trim().toLowerCase() || null,
      phone: String(input.phone || '').trim() || null,
      address: String(input.address || '').trim() || null,
      city: String(input.city || '').trim() || null,
      postal_code: String(input.postalCode || '').trim() || null,
      delivery_notes: String(input.deliveryNotes || '').trim() || null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await db.from('customer_profiles').upsert(profile, { onConflict: 'user_id' }).select().single();
    if (error) throw error;
    return response.status(200).json({ profile: data });
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to save your profile.' });
  }
}
