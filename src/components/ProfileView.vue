<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ClipboardList, LogOut, Mail, User } from 'lucide-vue-next';
import { supabase } from '../lib/supabase';
import { useHeritageStore } from '../stores/heritageStore';

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  delivery_order_items: { id: number; product_name: string; quantity: number; unit_price: number }[];
};

const store = useHeritageStore();
const email = ref(store.authUser?.email || store.shippingDetails.email);
const orders = ref<OrderRow[]>([]);
const loadingOrders = ref(false);
const orderError = ref<string | null>(null);

const statusLabel = (status: string) => status.replaceAll('_', ' ');

const loadOrders = async () => {
  if (!store.authUser) {
    orders.value = [];
    return;
  }
  loadingOrders.value = true;
  orderError.value = null;
  const { data, error } = await supabase
    .from('delivery_orders')
    .select('id, order_number, created_at, status, total, delivery_order_items(id, product_name, quantity, unit_price)')
    .order('created_at', { ascending: false });
  if (error) orderError.value = 'Your order history could not be loaded. Please try again.';
  else orders.value = (data || []) as OrderRow[];
  loadingOrders.value = false;
};

watch(() => store.authUser?.id, () => void loadOrders(), { immediate: true });
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
        <div class="flex items-center gap-3 border-b border-gold-100/40 dark:border-gold-950/20 pb-3"><ClipboardList class="h-5 w-5 text-gold-600" /><h2 class="font-serif text-xl">Your Orders</h2></div>
        <p v-if="loadingOrders" class="text-sm text-neutral-500">Loading your orders…</p>
        <p v-else-if="orderError" class="text-sm text-red-600">{{ orderError }}</p>
        <p v-else-if="orders.length === 0" class="text-sm text-neutral-500">No signed-in orders yet. Future purchases made while signed in will appear here.</p>
        <div v-else class="space-y-3">
          <article v-for="order in orders" :key="order.id" class="border border-gold-100 dark:border-gold-950 rounded-md p-4 space-y-3">
            <div class="flex justify-between gap-3 text-xs font-mono"><span class="font-semibold text-gold-700 dark:text-gold-400">{{ order.order_number }}</span><span class="capitalize text-neutral-500">{{ statusLabel(order.status) }}</span></div>
            <p class="text-[11px] text-neutral-400">{{ new Date(order.created_at).toLocaleDateString() }}</p>
            <div class="space-y-1 text-xs"><div v-for="item in order.delivery_order_items" :key="item.id" class="flex justify-between gap-3"><span>{{ item.product_name }} × {{ item.quantity }}</span><span class="font-mono">KES {{ (Number(item.unit_price) * item.quantity).toFixed(2) }}</span></div></div>
            <div class="pt-2 border-t border-gold-100 flex justify-between text-sm"><span>Total</span><strong class="font-mono">KES {{ Number(order.total).toFixed(2) }}</strong></div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>
