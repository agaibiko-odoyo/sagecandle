<script setup lang="ts">
import { computed } from 'vue';
import { BookOpenCheck, Check, MapPin, PackageCheck, Palette, Truck, Verified } from 'lucide-vue-next';
import { useHeritageStore } from '../stores/heritageStore';
import type { DeliveryOrderStatus } from '../types';

const store = useHeritageStore();
const order = computed(() => store.trackedOrder || store.activeOrder || store.orderHistory[0] || null);
const steps = [
  { key: 'awaiting_confirmation', label: 'Awaiting Confirmation', icon: Check },
  { key: 'order_confirmed', label: 'Order Confirmed', icon: Palette },
  { key: 'departed_store', label: 'Departed Store', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: PackageCheck },
  { key: 'delivered_successfully', label: 'Delivered Successfully', icon: Verified }
] as const;
const currentStatus = computed<DeliveryOrderStatus>(() => {
  const status = order.value?.status;
  return steps.some(step => step.key === status) ? status : 'awaiting_confirmation';
});
const currentStep = computed(() => steps.findIndex(step => step.key === currentStatus.value));
const currentLabel = computed(() => steps[currentStep.value].label);
</script>

<template>
  <div class="min-h-full bg-[radial-gradient(circle_at_2px_2px,rgba(233,195,73,0.1)_1px,transparent_0)] bg-[length:24px_24px]">
    <div class="max-w-7xl mx-auto px-6 py-10 md:py-14 space-y-12">
      <section>
        <p class="text-[10px] font-mono tracking-[0.2em] uppercase text-[#E9C349]">Order tracking</p>
        <h1 class="mt-2 font-serif text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">Track Your Heritage</h1>
        <p class="mt-3 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">Your order status is updated by Sage Candle once each delivery stage has been confirmed.</p>
      </section>

      <template v-if="order">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section class="lg:col-span-8 border border-gold-200/40 dark:border-gold-900/30 bg-white/50 dark:bg-luxe-gray/50 p-6 md:p-8 space-y-8">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-[10px] font-mono tracking-[0.18em] text-[#E9C349] uppercase">Order status</p>
                <h2 class="mt-1 font-serif text-2xl text-neutral-900 dark:text-neutral-100">Order #{{ order.id }}</h2>
              </div>
              <span class="border border-gold-300/50 bg-gold-100/50 dark:bg-gold-950/30 px-3 py-2 text-[10px] font-mono tracking-widest uppercase text-gold-700 dark:text-gold-400">{{ currentLabel }}</span>
            </div>

            <div class="relative py-7">
              <div class="absolute left-4 right-4 top-[3.1rem] h-px bg-gold-200 dark:bg-gold-900"></div>
              <div class="absolute left-4 right-4 top-[3.1rem] h-0.5 origin-left bg-gold-600 transition-transform duration-500" :style="{ transform: `scaleX(${currentStep / (steps.length - 1)})` }"></div>
              <div class="relative grid grid-cols-5 gap-1">
                <div v-for="step in steps" :key="step.label" class="flex flex-col items-center gap-3 text-center">
                  <div :class="[steps.findIndex(item => item.key === step.key) <= currentStep ? 'bg-gold-600 text-white ring-4 ring-white dark:ring-luxe-gray' : 'border border-gold-200 dark:border-gold-800 bg-white dark:bg-luxe-dark text-neutral-400', 'z-10 flex h-10 w-10 items-center justify-center rounded-full']">
                    <component :is="step.icon" class="h-4 w-4" />
                  </div>
                  <span :class="steps.findIndex(item => item.key === step.key) <= currentStep ? 'text-gold-700 dark:text-gold-400' : 'text-neutral-400 dark:text-neutral-500'" class="text-[9px] font-mono leading-tight uppercase tracking-wide">{{ step.label }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 border-t border-gold-200/40 pt-6 dark:border-gold-900/30 md:grid-cols-2">
              <div class="flex items-start gap-3">
                <MapPin class="mt-0.5 h-5 w-5 shrink-0 text-[#E9C349]" />
                <div><p class="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">Shipping to</p><p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{{ order.shippingDetails.address }}<br>{{ order.shippingDetails.city }}, {{ order.shippingDetails.postalCode }}</p></div>
              </div>
              <div><p class="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">Delivery method</p><p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{{ order.deliveryMethod.name }}</p><p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">This page does not show live location or estimated arrival times.</p></div>
            </div>
          </section>

          <aside class="lg:col-span-4 space-y-6">
            <div class="border border-gold-200/40 dark:border-gold-900/30 bg-white/50 dark:bg-luxe-gray/50 p-6">
              <p class="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">In this shipment</p>
              <div class="mt-5 space-y-4">
                <div v-for="item in order.items" :key="item.product.id" class="flex items-center gap-3">
                  <img v-if="item.product.image" :src="item.product.image" :alt="item.product.name" class="h-14 w-14 object-cover" />
                  <div class="min-w-0"><p class="truncate font-serif text-sm">{{ item.product.name }}</p><p class="mt-1 text-[10px] font-mono uppercase tracking-wider text-[#E9C349]">{{ item.product.collection }} · ×{{ item.quantity }}</p></div>
                </div>
              </div>
            </div>
            <div class="relative min-h-48 overflow-hidden bg-neutral-900 p-6 text-white">
              <BookOpenCheck class="absolute -right-6 -bottom-6 h-40 w-40 text-[#E9C349] opacity-10" />
              <p class="relative font-serif text-lg italic leading-relaxed text-gold-100">“Crafted with patience, delivered with care.”</p>
              <p class="relative mt-4 text-[10px] font-mono tracking-widest text-[#E9C349] uppercase">Our commitment to excellence</p>
            </div>
          </aside>
        </div>

        <section v-if="store.orderHistory.length > 1" class="border-t border-gold-200/40 pt-10 dark:border-gold-900/30">
          <p class="text-[10px] font-mono tracking-[0.18em] uppercase text-[#E9C349]">Your acquired heritage</p>
          <h2 class="mt-2 font-serif text-2xl">Recently honored</h2>
          <div class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <button v-for="pastOrder in store.orderHistory.filter(item => item.id !== order?.id).slice(0, 3)" :key="pastOrder.id" @click="store.trackOrder(pastOrder)" class="border-t border-[#E9C349]/50 pt-4 text-left">
              <div class="flex items-center justify-between"><span class="text-[10px] font-mono text-neutral-400">{{ pastOrder.date }}</span><Circle class="h-4 w-4 text-[#E9C349]" /></div>
              <p class="mt-3 font-serif text-lg">Order #{{ pastOrder.id }}</p>
              <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{{ pastOrder.items.map(item => item.product.name).join(', ') }}</p>
            </button>
          </div>
        </section>
      </template>

      <div v-else class="border border-gold-200/40 bg-white/50 p-10 text-center dark:border-gold-900/30 dark:bg-luxe-gray/50">
        <PackageCheck class="mx-auto h-10 w-10 text-[#E9C349]" />
        <h2 class="mt-4 font-serif text-2xl">No active shipment yet</h2>
        <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Once an order is placed, its journey will appear here.</p>
        <button @click="store.navigateTo('curated')" class="mt-6 border border-gold-300 px-5 py-3 text-[10px] font-mono tracking-widest text-gold-700 uppercase">Explore collections</button>
      </div>
    </div>
  </div>
</template>
