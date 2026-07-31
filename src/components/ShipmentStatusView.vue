<script setup lang="ts">
import { computed } from 'vue';
import { Check, ChevronLeft, CircleDot, MapPin, MessageCircle, PackageCheck, Plane, Truck } from 'lucide-vue-next';
import { useHeritageStore } from '../stores/heritageStore';

const store = useHeritageStore();
const order = computed(() => store.trackedOrder || store.activeOrder || store.orderHistory[0] || null);
const timeline = [
  { title: 'Out for Delivery', time: 'Pending arrival', note: '', active: false },
  { title: 'Arrived at Nairobi Hub', time: 'Today, 14:30', note: 'Sorted for final dispatch at the regional distribution center.', active: true },
  { title: 'Departed Atelier', time: 'Yesterday, 09:15', note: 'Hand-signed certificate included.', active: true },
  { title: 'Order Confirmed', time: 'Order placed', note: '', active: true }
];
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-10 md:py-14">
    <template v-if="order">
      <div class="flex flex-col gap-6 border-b border-gold-200/40 pb-8 dark:border-gold-900/30 md:flex-row md:items-end md:justify-between">
        <div>
          <button @click="store.navigateTo('tracking')" class="mb-4 flex items-center gap-1 text-[10px] font-mono tracking-widest text-gold-700 uppercase dark:text-gold-400"><ChevronLeft class="h-4 w-4" /> Back to tracking</button>
          <p class="text-[10px] font-mono tracking-[0.18em] uppercase text-[#E9C349]">Shipment status</p>
          <h1 class="mt-2 font-serif text-3xl">Order #{{ order.id }}</h1>
          <div class="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"><Truck class="h-4 w-4 text-[#E9C349]" /> Courier: <span class="font-medium text-neutral-800 dark:text-neutral-200">{{ order.deliveryMethod.name }}</span><span class="rounded-full border border-[#E9C349]/30 px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#E9C349] uppercase">In transit</span></div>
        </div>
        <button class="flex items-center justify-center gap-2 bg-gold-600 px-6 py-3 text-[10px] font-mono tracking-widest text-white uppercase hover:bg-gold-500"><MessageCircle class="h-4 w-4" /> Contact concierge</button>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <section class="relative lg:col-span-5">
          <div class="absolute bottom-5 left-4 top-7 w-px bg-gold-200 dark:bg-gold-900"></div>
          <div class="space-y-10">
            <div v-for="event in timeline" :key="event.title" class="relative flex gap-4 pl-0">
              <div :class="event.active ? 'border-gold-600 bg-gold-600 text-white' : 'border-gold-300 bg-white text-gold-500 dark:border-gold-800 dark:bg-luxe-dark'" class="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2">
                <Check v-if="event.active" class="h-4 w-4" /><CircleDot v-else class="h-4 w-4" />
              </div>
              <div :class="!event.active && 'opacity-55'"><h2 class="font-serif text-xl">{{ event.title }}</h2><p class="mt-1 text-[10px] font-mono tracking-widest text-[#E9C349] uppercase">{{ event.time }}</p><p v-if="event.note" class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{{ event.note }}</p></div>
            </div>
          </div>
        </section>

        <section class="space-y-6 lg:col-span-7">
          <div class="relative aspect-video overflow-hidden border border-gold-200/40 bg-[radial-gradient(circle_at_2px_2px,rgba(233,195,73,0.16)_1px,transparent_0)] bg-[length:24px_24px] dark:border-gold-900/30">
            <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="shipment-route" x1="0%" x2="100%"><stop stop-color="#E9C349" /><stop offset="1" stop-color="#E65D13" /></linearGradient></defs><path d="M10 80 Q35 68 54 45 T90 20" fill="none" stroke="url(#shipment-route)" stroke-dasharray="4 3" stroke-width="0.8" /></svg>
            <div class="absolute bottom-[18%] left-[10%] text-center"><span class="block h-3 w-3 rounded-full bg-[#E9C349] ring-8 ring-[#E9C349]/15"></span><span class="mt-2 block text-[10px] font-mono tracking-widest text-[#E9C349] uppercase">Atelier</span></div>
            <div class="absolute right-[10%] top-[17%] text-center"><span class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gold-600 bg-white dark:bg-luxe-dark"><MapPin class="h-4 w-4 text-gold-600" /></span><span class="mt-2 block text-[10px] font-mono tracking-widest text-gold-600 uppercase">{{ order.shippingDetails.city }}</span></div>
            <div class="absolute bottom-5 right-5 border border-gold-200/50 bg-white/90 px-4 py-3 backdrop-blur dark:border-gold-900/40 dark:bg-luxe-dark/90"><p class="text-[9px] font-mono tracking-widest text-[#E9C349] uppercase">Current hub</p><p class="mt-1 font-serif">Nairobi Logistics</p><p class="mt-1 text-xs text-neutral-500">Processing for final-mile delivery</p></div>
          </div>

          <div class="flex items-center gap-4 border-t border-gold-200/40 bg-white/40 p-5 dark:border-gold-900/30 dark:bg-luxe-gray/40">
            <img v-if="order.items[0]" :src="order.items[0].product.image" :alt="order.items[0].product.name" class="h-20 w-20 object-cover" />
            <div><p class="font-serif text-lg">{{ order.items[0]?.product.name }}</p><p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Quantity: {{ order.items[0]?.quantity }} · {{ order.items[0]?.product.collection }}</p></div>
            <Plane class="ml-auto h-6 w-6 text-[#E9C349]" />
          </div>
        </section>
      </div>
    </template>
    <div v-else class="py-20 text-center"><PackageCheck class="mx-auto h-10 w-10 text-[#E9C349]" /><p class="mt-4 font-serif text-2xl">No shipment selected</p><button @click="store.navigateTo('tracking')" class="mt-5 text-xs font-mono tracking-widest text-gold-700 uppercase dark:text-gold-400">View tracking</button></div>
  </div>
</template>
