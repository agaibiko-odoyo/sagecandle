import webpush from 'web-push';
import { supabaseAdmin } from './auth.js';

function configurePush() {
  const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_SUBJECT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
}

export async function sendPushToUsers(userIds, payload) {
  if (!configurePush() || !userIds.filter(Boolean).length) return;
  const db = supabaseAdmin();
  const { data: subscriptions, error } = await db.from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('user_id', [...new Set(userIds.filter(Boolean))]);
  if (error || !subscriptions?.length) return;

  await Promise.allSettled(subscriptions.map(async subscription => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth }
      }, JSON.stringify(payload));
    } catch (error) {
      // A 404/410 means the device unsubscribed; retaining it only causes
      // future delivery attempts to fail.
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await db.from('push_subscriptions').delete().eq('id', subscription.id);
      }
      console.error('Push delivery failed', error?.message || error);
    }
  }));
}

export async function notifyAdmins(payload) {
  const emails = (process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  if (!emails.length) return;
  const { data: users } = await supabaseAdmin().auth.admin.listUsers({ perPage: 1000 });
  await sendPushToUsers((users?.users || []).filter(user => emails.includes((user.email || '').toLowerCase())).map(user => user.id), payload);
}
