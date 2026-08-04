import { supabase } from './supabase';

function base64UrlToUint8Array(value: string) {
  const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}

async function accessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export async function notificationPermission() {
  return pushSupported() ? Notification.permission : 'denied';
}

export async function enablePushNotifications() {
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  const token = await accessToken();
  if (!pushSupported() || !vapidKey || !token) throw new Error('Notifications are not configured for this browser.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');
  const registration = await navigator.serviceWorker.register('/push-sw.js');
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(vapidKey) });
  const result = await fetch('/api/notifications/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(subscription)
  });
  if (!result.ok) throw new Error((await result.json().catch(() => ({}))).error || 'Could not enable notifications.');
}
