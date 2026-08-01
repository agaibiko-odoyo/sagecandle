import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Newsletter service is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const email = String(request.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return response.status(400).json({ error: 'Enter a valid email address.' });
  }

  try {
    const { error } = await supabaseAdmin().from('newsletter_subscribers').insert({ email });
    if (error?.code === '23505') return response.status(409).json({ error: 'This email is already subscribed.' });
    if (error) throw error;
    return response.status(201).json({ message: 'You are subscribed to the Inner Circle.' });
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Could not save your subscription.' });
  }
}
