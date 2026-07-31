<script setup lang="ts">
import { useHeritageStore } from '../stores/heritageStore';
import { BookOpen, MapPin, Calendar, Compass, ArrowRight } from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted } from 'vue';

const store = useHeritageStore();

const order = computed(() => {
  return store.activeOrder || {
    id: 'HL-928471',
    date: 'October 24, 2023',
    total: 310.00,
    shippingDetails: {
      firstName: 'Loretta',
      lastName: 'Rattos',
      address: '12 Kahawa west, Ruiru',
      city: 'Nairobi',
      postalCode: '101241'
    }
  };
});

// Dynamic delivery dates: Today + 10 to 14 days
const deliveryEstimate = computed(() => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
  
  const start = new Date();
  start.setDate(start.getDate() + 10);
  const end = new Date();
  end.setDate(end.getDate() + 14);
  
  return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
});

const returnToHome = () => {
  store.navigateTo('home');
};

const trackOrder = () => store.trackOrder(store.activeOrder);

onMounted(() => {
  if (store.paymentStatus === 'pending') store.startPaymentStatusPolling();
});

onBeforeUnmount(() => store.stopPaymentStatusPolling());
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8 space-y-12 pb-24 text-center">
    
    <!-- Large Circle Icon -->
    <div class="mx-auto h-20 w-20 rounded-full border border-gold-400 flex items-center justify-center bg-gold-50/50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400 shadow-lg">
      <BookOpen class="h-10 w-10 animate-pulse" />
    </div>

    <!-- Main Message -->
    <div class="space-y-4 max-w-xl mx-auto">
      <span class="text-xs font-mono tracking-widest text-gold-600 dark:text-gold-400 uppercase">
        {{ store.paymentStatus === 'pending' ? 'AWAITING CONFIRMATION' : store.paymentStatus === 'failed' ? 'PAYMENT NOT COMPLETED' : 'CONFIRMATION' }}
      </span>
      <h1 v-if="store.paymentStatus === 'pending'" class="font-serif text-3xl md:text-5xl tracking-wide font-light">
        Payment Reference <br /><span class="italic font-normal text-gold-600">Awaiting Confirmation</span>
      </h1>
      <h1 v-else class="font-serif text-3xl md:text-5xl tracking-wide font-light">
        Thank You for <br /><span class="italic font-normal text-gold-600">Honoring</span> the Heritage
      </h1>
      
      <p class="text-xs font-mono text-neutral-400">
        Order #{{ order.id }} • Placed on {{ order.date }}
      </p>

      <div class="divider-pattern w-32 mx-auto py-1"></div>

      <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans font-light">
        {{ store.paymentStatus === 'pending' ? store.paymentMessage || 'We are confirming your M-Pesa reference. This page will update automatically once the order is confirmed.' : store.paymentStatus === 'failed' ? store.paymentMessage || 'The M-Pesa payment was not completed. Return to your bag and try again.' : 'Your selection from the Ancestral Artisans collection has been registered. We are now carefully preparing your items for their journey from our craft studio to your home.' }}
      </p>
    </div>

    <!-- Artisan Note Card (Screenshot 6 layout) -->
    <div class="bg-neutral-950 dark:bg-luxe-gray text-white p-6 md:p-8 rounded-lg text-left relative overflow-hidden border border-gold-900/30 shadow-xl space-y-4">
      <div class="flex items-center gap-2">
        <div class="h-[1px] w-6 bg-gold-400"></div>
        <span class="text-[9px] font-mono tracking-widest text-gold-400 uppercase">Artisan Note</span>
      </div>

      <p class="font-serif italic text-base md:text-lg leading-relaxed font-light text-neutral-200">
        "Each stitch and scent carries the soul of our lineage. By choosing Sage Candle, you are not merely purchasing an object; you are preserving the hands that made it. We thank you for supporting the craft."
      </p>

      <p class="text-[9px] font-mono tracking-widest text-gold-400 text-right uppercase">
        — THE MASTER CRAFTSMEN CIRCLE
      </p>

      <!-- Watermark vector background -->
      <div class="absolute -right-8 -bottom-8 opacity-5 text-gold-100 select-none pointer-events-none">
        <Compass class="h-32 w-32" />
      </div>
    </div>

    <!-- Delivery Estimate & Destination info -->
    <div class="bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg text-left grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
      <!-- Delivery Dates -->
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-neutral-400">
          <Calendar class="h-4 w-4 text-gold-600 shrink-0" />
          <span class="text-[10px] font-mono uppercase tracking-wider">Delivery Estimate</span>
        </div>
        <p class="font-serif text-2xl font-semibold text-gold-700 dark:text-gold-400">
          {{ deliveryEstimate }}
        </p>
        <p class="text-[11px] text-neutral-400 font-light leading-relaxed">
          Each item is inspected by hand to ensure pristine museum-grade quality prior to global dispatch.
        </p>
      </div>

      <!-- Address detail -->
      <div class="space-y-3 border-t md:border-t-0 md:border-l border-gold-100 dark:border-gold-950 pt-4 md:pt-0 md:pl-8">
        <div class="flex items-center gap-2 text-neutral-400">
          <MapPin class="h-4 w-4 text-gold-600 shrink-0" />
          <span class="text-[10px] font-mono uppercase tracking-wider">Shipping To</span>
        </div>
        <div class="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 font-sans">
          <p class="font-serif font-bold text-neutral-800 dark:text-neutral-200">
            {{ order.shippingDetails.firstName }} {{ order.shippingDetails.lastName }}
          </p>
          <p>{{ order.shippingDetails.address }}</p>
          <p>{{ order.shippingDetails.city }}, {{ order.shippingDetails.postalCode }}</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button v-if="store.paymentStatus !== 'pending' && store.paymentStatus !== 'failed'"
        @click="trackOrder"
        class="w-full sm:w-auto px-8 py-3.5 bg-gold-600 hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md shadow-md transition-all active:scale-95"
      >
        Track Order
      </button>
      <button v-if="store.paymentStatus === 'failed'"
        @click="store.navigateTo('checkout')"
        class="w-full sm:w-auto px-8 py-3.5 bg-gold-600 hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md shadow-md transition-all active:scale-95"
      >
        Try Again
      </button>
      <button 
        @click="returnToHome"
        class="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-neutral-300 dark:border-gold-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 hover:border-neutral-800 dark:hover:text-white dark:hover:border-gold-400 font-mono uppercase text-xs tracking-widest rounded-md transition-all active:scale-95"
      >
        Return to Home
      </button>
    </div>

    <!-- Craft image footer (Screenshot 6 bottom) -->
    <div class="relative rounded-lg overflow-hidden h-64 border border-gold-200/40 dark:border-gold-900/30 shadow-md group">
      <img 
        src="https://images.unsplash.com/photo-1601921004897-b7d582836990?auto=format&fit=crop&q=80&w=800" 
        alt="Artisan loom hands" 
        referrerpolicy="no-referrer"
        class="absolute inset-0 h-full w-full object-cover grayscale brightness-50 contrast-125 transition-transform duration-700 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-neutral-950/60"></div>
      <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-6 space-y-2 text-white">
        <span class="text-[10px] font-mono tracking-widest uppercase text-gold-400">Heritage Matters</span>
        <h2 class="font-serif text-lg md:text-xl font-light">Crafted for the future,<br />inspired by the past.</h2>
      </div>
    </div>
  </div>
</template>
