import { authenticatedUser } from '../_lib/auth.js';
import { sendPushToUsers } from '../_lib/push.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const user = await authenticatedUser(request);
  if (!user) return response.status(401).json({ error: 'Please sign in first.' });
  try {
    const delivery = await sendPushToUsers([user.id], { title: 'Sage Candle test', body: 'Notifications are connected on this device.', url: '/profile' });
    return response.status(200).json({ delivery });
  } catch (error) {
    console.error('Test push failed', error);
    return response.status(500).json({ error: 'Could not send the test notification.' });
  }
}
