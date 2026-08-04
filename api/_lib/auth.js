import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Server database access is not configured.');
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
}

export async function authenticatedUser(request) {
  const accessToken = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!accessToken) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(accessToken);
  return error ? null : data.user;
}

export function isAdmin(user) {
  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(user?.email && allowedEmails.includes(user.email.toLowerCase()));
}

export async function requireAdmin(request, response) {
  const user = await authenticatedUser(request);
  if (!user || !isAdmin(user)) {
    response.status(403).json({ error: 'Administrator access is required.' });
    return null;
  }
  return user;
}
