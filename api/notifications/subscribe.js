import { authenticatedUser, supabaseAdmin } from '../_lib/auth.js';

export default async function handler(request, response) {
  const user = await authenticatedUser(request);
  if (!user) return response.status(401).json({ error: 'Please sign in first.' });
  const db = supabaseAdmin();
  if (request.method === 'DELETE') {
    const { endpoint } = request.body || {};
    if (!endpoint) return response.status(400).json({ error: 'Missing subscription endpoint.' });
    await db.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint);
    return response.status(204).end();
  }
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const { endpoint, keys } = request.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) return response.status(400).json({ error: 'Invalid browser subscription.' });
  const { error } = await db.from('push_subscriptions').upsert({
    user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, updated_at: new Date().toISOString()
  }, { onConflict: 'endpoint' });
  if (error) return response.status(500).json({ error: 'Could not save notification preference.' });
  return response.status(201).json({ message: 'Notifications enabled.' });
}
