<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ClipboardList, LogOut, MapPin, Pencil, User } from 'lucide-vue-next';
import { supabase } from '../lib/supabase';
import { useHeritageStore } from '../stores/heritageStore';
import type { DeliveryOrderStatus, Order, Product } from '../types';

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  address: string;
  city: string;
  postal_code: string | null;
  delivery_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  mpesa_payment: { mpesa_reference: string | null; status: string } | null;
  delivery_order_items: { id: number; product_id: string; product_name: string; quantity: number; unit_price: number }[];
};

const store = useHeritageStore();
const email = ref(store.authUser?.email || store.shippingDetails.email);
const orders = ref<OrderRow[]>([]);
const loadingOrders = ref(false);
const orderError = ref<string | null>(null);
const editingProfile = ref(false);
const savingProfile = ref(false);
const profileMessage = ref<string | null>(null);
const profile = ref({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '', deliveryNotes: '' });

const statusLabel = (status: string) => status.replaceAll('_', ' ');
const currentOrders = computed(() => orders.value.filter(order => order.status !== 'delivered_successfully'));
const deliveredOrders = computed(() => orders.value.filter(order => order.status === 'delivered_successfully'));

const fallbackProduct = (item: OrderRow['delivery_order_items'][number]): Product => ({
  id: item.product_id,
  name: item.product_name,
  category: 'candles',
  price: Number(item.unit_price),
  image: '',
  description: '',
  collection: 'Sage Candle',
  tag: '',
  details: [],
  specifications: {},
  isAvailable: false
});

const trackOrder = (row: OrderRow) => {
  const order: Order = {
    id: row.order_number,
    date: new Date(row.created_at).toLocaleDateString(),
    items: row.delivery_order_items.map(item => ({
      product: store.products.find(product => product.id === item.product_id) || fallbackProduct(item),
      quantity: item.quantity
    })),
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    shippingDetails: {
      firstName: '', lastName: '', email: '', phone: '', mpesaReference: '',
      address: row.address, city: row.city, postalCode: row.postal_code || '', deliveryNotes: ''
    },
    deliveryMethod: { id: 'saved-delivery-method', name: row.delivery_method, cost: Number(row.shipping_cost), time: '' },
    paymentMethod: 'mobile_pay',
    status: row.status as DeliveryOrderStatus
  };
  store.trackOrder(order);
};

const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

const loadProfile = async () => {
  if (!store.authUser) return;
  profileMessage.value = null;
  const { data: saved, error } = await supabase
    .from('customer_profiles')
    .select('first_name, last_name, email, phone, address, city, postal_code, delivery_notes')
    .eq('user_id', store.authUser.id)
    .maybeSingle();
  if (error) {
    profileMessage.value = 'Your saved delivery details could not be loaded.';
    return;
  }
  if (!saved) {
    profile.value.email = store.authUser.email || '';
    return;
  }
  profile.value = {
    firstName: saved.first_name || '', lastName: saved.last_name || '', email: saved.email || store.authUser.email || '',
    phone: saved.phone || '', address: saved.address || '', city: saved.city || '', postalCode: saved.postal_code || '', deliveryNotes: saved.delivery_notes || ''
  };
  store.shippingDetails = { ...store.shippingDetails, ...profile.value, mpesaReference: '' };
};

const saveProfile = async () => {
  if (!store.authUser) return;
  savingProfile.value = true;
  profileMessage.value = null;
  const { error } = await supabase.from('customer_profiles').upsert({
    user_id: store.authUser.id,
    first_name: profile.value.firstName || null,
    last_name: profile.value.lastName || null,
    email: profile.value.email || null,
    phone: profile.value.phone || null,
    address: profile.value.address || null,
    city: profile.value.city || null,
    postal_code: profile.value.postalCode || null,
    delivery_notes: profile.value.deliveryNotes || null,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  savingProfile.value = false;
  if (error) {
    profileMessage.value = 'Your details could not be saved.';
    return;
  }
  store.shippingDetails = { ...store.shippingDetails, ...profile.value, mpesaReference: '' };
  editingProfile.value = false;
  profileMessage.value = 'Your saved delivery details have been updated.';
};

const loadOrders = async () => {
  if (!store.authUser) {
    orders.value = [];
    return;
  }
  loadingOrders.value = true;
  orderError.value = null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    orderError.value = 'Your sign-in session has expired. Please sign in again.';
    loadingOrders.value = false;
    return;
  }
  const response = await fetch('/api/orders/history', { headers: { Authorization: `Bearer ${session.access_token}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) orderError.value = result.error || 'Your order history could not be loaded. Please try again.';
  else orders.value = (result.orders || []) as OrderRow[];
  loadingOrders.value = false;
};

watch(() => store.authUser?.id, () => {
  void loadOrders();
  void loadProfile();
}, { immediate: true });
watch(() => store.authUser?.email, value => {
  if (value) email.value = value;
});
onMounted(() => void loadOrders());
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8 space-y-10 pb-24">
    <div class="border-b border-gold-200/40 dark:border-gold-900/30 pb-6 space-y-2">
      <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">Atelier Membership</span>
      <h1 class="font-serif text-3xl font-light">Your Account</h1>
    </div>

    <section v-if="!store.authReady" class="bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 p-6 rounded-lg text-sm text-neutral-500">
      Checking your sign-in session…
    </section>

    <section v-else-if="!store.authUser" class="max-w-lg bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg space-y-5 shadow-sm">
      <div class="space-y-1">
        <h2 class="font-serif text-xl">Keep your order history</h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Sign in to see purchases made while signed in, across any device. You can still check out as a guest.</p>
      </div>
      <button @click="store.signInWithGoogle" class="w-full py-3 border border-gold-300 dark:border-gold-800 rounded text-xs font-mono uppercase tracking-widest hover:bg-gold-50 dark:hover:bg-gold-950/20">
        Continue with Google
      </button>
      <div class="flex items-center gap-3 text-[10px] font-mono uppercase text-neutral-400"><span class="h-px flex-1 bg-gold-100"></span>or<span class="h-px flex-1 bg-gold-100"></span></div>
      <form class="flex gap-2" @submit.prevent="store.sendMagicLink(email)">
        <label class="sr-only" for="magic-email">Email address</label>
        <input id="magic-email" v-model="email" required type="email" placeholder="you@example.com" class="min-w-0 flex-1 px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
        <button type="submit" class="px-4 py-2 bg-gold-600 text-white rounded text-xs font-mono uppercase">Email link</button>
      </form>
      <p v-if="store.authMessage" class="text-xs text-gold-700 dark:text-gold-400">{{ store.authMessage }}</p>
    </section>

    <template v-else>
      <section class="bg-white dark:bg-luxe-gray border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg flex items-center justify-between gap-4 shadow-sm">
        <div class="flex items-center gap-4 min-w-0">
          <div class="h-12 w-12 shrink-0 rounded-full bg-gold-50 dark:bg-gold-950/30 flex items-center justify-center text-gold-600"><User class="h-6 w-6" /></div>
          <div class="min-w-0"><h2 class="font-serif text-lg">Signed in</h2><p class="truncate text-xs text-neutral-500">{{ store.authUser.email }}</p></div>
        </div>
        <button @click="store.signOut" class="inline-flex items-center gap-2 text-xs font-mono uppercase text-neutral-500 hover:text-gold-700"><LogOut class="h-4 w-4" /> Sign out</button>
      </section>

      <section class="bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg space-y-4 shadow-sm">
        <div class="flex items-center justify-between gap-4 border-b border-gold-100/40 dark:border-gold-950/20 pb-3"><div class="flex items-center gap-3"><MapPin class="h-5 w-5 text-gold-600" /><h2 class="font-serif text-xl">Saved Delivery Details</h2></div><button v-if="!editingProfile" @click="editingProfile = true" class="inline-flex items-center gap-1 text-xs font-mono uppercase text-gold-700 dark:text-gold-400"><Pencil class="h-3.5 w-3.5" /> Edit</button></div>
        <form v-if="editingProfile" class="grid grid-cols-1 gap-3 sm:grid-cols-2" @submit.prevent="saveProfile">
          <input v-model="profile.firstName" required placeholder="First name" class="px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <input v-model="profile.lastName" required placeholder="Last name" class="px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <input v-model="profile.email" required type="email" placeholder="Email address" class="sm:col-span-2 px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <input v-model="profile.phone" required type="tel" placeholder="Phone number" class="sm:col-span-2 px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <input v-model="profile.address" required placeholder="Street address" class="sm:col-span-2 px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <input v-model="profile.city" required placeholder="City" class="px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <input v-model="profile.postalCode" placeholder="Postal code" class="px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm" />
          <textarea v-model="profile.deliveryNotes" placeholder="Delivery notes (optional)" class="sm:col-span-2 px-3 py-2.5 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-sm"></textarea>
          <div class="sm:col-span-2 flex justify-end gap-3"><button type="button" @click="editingProfile = false" class="px-4 py-2 text-xs font-mono uppercase">Cancel</button><button :disabled="savingProfile" type="submit" class="px-4 py-2 bg-gold-600 text-white rounded text-xs font-mono uppercase disabled:opacity-60">{{ savingProfile ? 'Saving…' : 'Save details' }}</button></div>
        </form>
        <div v-else class="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed"><p v-if="profile.firstName || profile.lastName" class="font-medium">{{ profile.firstName }} {{ profile.lastName }}</p><p v-if="profile.phone">{{ profile.phone }}</p><p v-if="profile.address">{{ profile.address }}, {{ profile.city }} {{ profile.postalCode }}</p><p v-else class="text-neutral-500">No saved delivery details yet. Place a signed-in order or add them here.</p></div>
        <p v-if="profileMessage" class="text-xs text-gold-700 dark:text-gold-400">{{ profileMessage }}</p>
      </section>

      <section class="bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg space-y-4 shadow-sm">
        <div class="flex items-center gap-3 border-b border-gold-100/40 dark:border-gold-950/20 pb-3"><ClipboardList class="h-5 w-5 text-gold-600" /><h2 class="font-serif text-xl">Your Orders</h2></div>
        <p v-if="loadingOrders" class="text-sm text-neutral-500">Loading your orders…</p>
        <p v-else-if="orderError" class="text-sm text-red-600">{{ orderError }}</p>
        <p v-else-if="orders.length === 0" class="text-sm text-neutral-500">No signed-in orders yet. Future purchases made while signed in will appear here.</p>
        <div v-else class="space-y-3">
          <p v-if="currentOrders.length" class="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Current orders</p>
          <article v-for="order in currentOrders" :key="order.id" class="border border-gold-100 dark:border-gold-950 rounded-md p-4 space-y-3">
            <div class="flex justify-between gap-3 text-xs font-mono"><span class="font-semibold text-gold-700 dark:text-gold-400">{{ order.order_number }}</span><span class="capitalize text-neutral-500">{{ statusLabel(order.status) }}</span></div>
            <p class="text-[11px] text-neutral-400">{{ new Date(order.created_at).toLocaleDateString() }}</p>
            <div class="space-y-1 text-xs"><div v-for="item in order.delivery_order_items" :key="item.id" class="flex justify-between gap-3"><span>{{ item.product_name }} × {{ item.quantity }}</span><span class="font-mono">KES {{ (Number(item.unit_price) * item.quantity).toFixed(2) }}</span></div></div>
            <div class="pt-2 border-t border-gold-100 flex items-center justify-between gap-4 text-sm"><div><span>Total</span><strong class="ml-2 font-mono">KES {{ Number(order.total).toFixed(2) }}</strong></div><button @click="trackOrder(order)" class="border border-gold-300 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-gold-700 hover:bg-gold-50 dark:border-gold-800 dark:text-gold-400 dark:hover:bg-gold-950/20">Track order</button></div>
          </article>
          <template v-if="deliveredOrders.length">
            <p class="pt-4 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Order history</p>
            <article v-for="order in deliveredOrders" :key="order.id" class="border border-gold-100 dark:border-gold-950 rounded-md p-4 space-y-3">
              <div class="flex justify-between gap-3 text-xs font-mono"><span class="font-semibold text-gold-700 dark:text-gold-400">{{ order.order_number }}</span><span class="capitalize text-gold-700 dark:text-gold-400">{{ statusLabel(order.status) }}</span></div>
              <p class="text-[11px] text-neutral-400">Delivered order · {{ new Date(order.created_at).toLocaleDateString() }}</p>
              <div class="space-y-1 text-xs"><div v-for="item in order.delivery_order_items" :key="item.id" class="flex justify-between gap-3"><span>{{ item.product_name }} × {{ item.quantity }}</span><span class="font-mono">KES {{ (Number(item.unit_price) * item.quantity).toFixed(2) }}</span></div></div>
              <div class="border-t border-gold-100 pt-3 text-xs text-neutral-500 dark:text-neutral-400"><p>{{ order.delivery_method }} · {{ order.address }}, {{ order.city }} {{ order.postal_code || '' }}</p><p class="mt-1">Payment method: <span class="font-mono text-neutral-700 dark:text-neutral-200">M-Pesa{{ order.mpesa_payment?.mpesa_reference ? ` · ${order.mpesa_payment.mpesa_reference}` : '' }}</span></p></div>
              <div class="pt-2 border-t border-gold-100 flex justify-between text-sm"><span>Total</span><strong class="font-mono">KES {{ Number(order.total).toFixed(2) }}</strong></div>
            </article>
          </template>
        </div>
      </section>
    </template>
  </div>
</template>
