<script setup lang="ts">
import { useHeritageStore } from '../stores/heritageStore';
import { ArrowLeft, Wallet } from 'lucide-vue-next';

const store = useHeritageStore();

const setView = (view: 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation') => store.navigateTo(view);

const handlePlaceOrder = async () => {
  await store.placeOrder();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-8 space-y-12 pb-24">
    <!-- Step Progress Indicator -->
    <div class="flex items-center justify-center max-w-md mx-auto pt-4">
      <div class="flex items-center w-full">
        <!-- Step 1 -->
        <div class="flex items-center relative">
          <div class="h-8 w-8 rounded-full border-2 border-gold-500 bg-gold-500 text-white flex items-center justify-center text-xs font-mono font-bold shadow-md">
            1
          </div>
          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-wider text-gold-600 font-semibold whitespace-nowrap">Shipping</span>
        </div>
        <div class="flex-grow h-[1px] bg-gold-400"></div>

        <!-- Step 2 -->
        <div class="flex items-center relative">
          <div class="h-8 w-8 rounded-full border-2 border-gold-300 dark:border-gold-800 bg-transparent text-neutral-400 flex items-center justify-center text-xs font-mono font-bold">
            2
          </div>
          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-wider text-neutral-400 whitespace-nowrap">Delivery</span>
        </div>
        <div class="flex-grow h-[1px] bg-gold-200 dark:bg-gold-950"></div>

        <!-- Step 3 -->
        <div class="flex items-center relative">
          <div class="h-8 w-8 rounded-full border-2 border-gold-200 dark:border-gold-950 bg-transparent text-neutral-300 dark:text-neutral-700 flex items-center justify-center text-xs font-mono font-bold">
            3
          </div>
          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-wider text-neutral-400 whitespace-nowrap">Payment</span>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-6">
      
      <!-- Checkout Forms -->
      <div class="lg:col-span-8 space-y-10">
        
        <!-- Step Title -->
        <div class="border-b border-gold-100 dark:border-gold-950 pb-4 flex justify-between items-baseline">
          <h1 class="font-serif text-2xl md:text-3xl font-light">Shipping Details</h1>
          <span class="text-[10px] font-mono text-neutral-400 uppercase">Step 1 of 3</span>
        </div>

        <!-- Form fields (prefilled Kwame Mensah) -->
        <form @submit.prevent class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">First Name</label>
            <input 
              v-model="store.shippingDetails.firstName" 
              type="text" 
              class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" 
              placeholder="First Name"
              required 
            />
          </div>
          <div class="space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Last Name</label>
            <input 
              v-model="store.shippingDetails.lastName" 
              type="text" 
              class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" 
              placeholder="Last Name"
              required 
            />
          </div>
          <div class="space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Email Address</label>
            <input v-model="store.shippingDetails.email" type="email" class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" placeholder="you@example.com" required />
          </div>
          <div class="space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Phone Number</label>
            <input v-model="store.shippingDetails.phone" type="tel" class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" placeholder="e.g. 0712 345 678" required />
          </div>
          <div class="sm:col-span-2 space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Address</label>
            <input 
              v-model="store.shippingDetails.address" 
              type="text" 
              class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" 
              placeholder="Address"
              required 
            />
          </div>
          <div class="space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">City</label>
            <input 
              v-model="store.shippingDetails.city" 
              type="text" 
              class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" 
              placeholder="City"
              required 
            />
          </div>
          <div class="space-y-1.5">
            <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Postal Code</label>
            <input 
              v-model="store.shippingDetails.postalCode" 
              type="text" 
              class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-serif focus:outline-none focus:border-gold-500" 
              placeholder="Postal Code"
              required 
            />
          </div>
        </form>

        <!-- Delivery Method section -->
        <div class="space-y-4">
          <h2 class="font-serif text-xl border-b border-gold-100 dark:border-gold-950 pb-2">Delivery Method</h2>
          
          <div class="grid grid-cols-1 gap-4">
            <label 
              v-for="method in store.deliveryMethods" 
              :key="method.id"
              :class="[
                'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all',
                store.selectedDeliveryMethodId === method.id 
                  ? 'border-gold-500 bg-gold-50/20 dark:bg-gold-950/10' 
                  : 'border-gold-200 dark:border-gold-900 bg-transparent hover:border-gold-300'
              ]"
            >
              <div class="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="delivery_method" 
                  :value="method.id"
                  v-model="store.selectedDeliveryMethodId"
                  class="accent-gold-600"
                />
                <div class="space-y-0.5">
                  <span class="text-xs font-serif font-semibold block">{{ method.name }}</span>
                  <span class="text-[10px] font-mono text-neutral-400">{{ method.time }}</span>
                </div>
              </div>
              <span class="font-mono text-xs font-semibold">KES {{ method.cost.toFixed(2) }}</span>
            </label>
          </div>
        </div>

        <div class="rounded-lg border border-gold-300/70 bg-gold-50/50 p-5 dark:border-gold-800 dark:bg-gold-950/15 space-y-2">
          <p class="text-[10px] font-mono uppercase tracking-widest text-gold-700 dark:text-gold-400">Payment instructions</p>
          <p class="font-serif text-base text-neutral-800 dark:text-neutral-100">Send your payment to M-Pesa number <span class="font-mono font-semibold text-gold-700 dark:text-gold-400">0790019174</span>.</p>
          <p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">After paying the full order amount, paste the M-Pesa reference code from your confirmation message into the field below. We will confirm your order manually.</p>
          <p class="text-xs leading-relaxed text-red-700 dark:text-red-300">Payments below the full order amount will be reversed, and products will not be delivered.</p>
        </div>

        <div class="space-y-4">
          <h2 class="font-serif text-xl border-b border-gold-100 dark:border-gold-950 pb-2">Payment Method</h2>
          <div class="p-5 rounded-lg border border-gold-500 bg-gold-50/20 dark:bg-gold-950/10 space-y-4">
            <div class="flex items-center gap-2">
              <Wallet class="h-4 w-4 text-gold-600" />
              <span class="text-xs font-serif font-semibold">M-Pesa</span>
            </div>
            <div class="space-y-1.5">
              <label class="shipping-label text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">M-Pesa Reference Code</label>
              <input v-model="store.shippingDetails.mpesaReference" @input="store.shippingDetails.mpesaReference = store.shippingDetails.mpesaReference.toUpperCase()" type="text" maxlength="10" class="shipping-input w-full px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-mono uppercase focus:outline-none focus:border-gold-500" placeholder="e.g. UGV3L251HQ" required />
            </div>
            <p class="text-[10px] text-neutral-500 dark:text-neutral-400">Submit the reference shown after completing your M-Pesa payment. We will confirm it manually.</p>
          </div>
        </div>

      </div>

      <!-- Checkout Order Summary Pane -->
      <div class="lg:col-span-4 bg-white dark:bg-luxe-gray border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg shadow-sm space-y-6">
        <h2 class="font-serif text-xl tracking-wide border-b border-gold-100 dark:border-gold-950 pb-3">Order Summary</h2>
        
        <!-- Cart Items mini cards -->
        <div class="space-y-4 max-h-[250px] overflow-y-auto pr-2">
          <div 
            v-for="item in store.cartDetailedItems" 
            :key="item.product.id"
            class="flex items-center gap-3 py-2 border-b border-gold-50/50 dark:border-gold-950/10"
          >
            <div class="h-12 w-12 rounded bg-neutral-900 overflow-hidden shrink-0 border border-gold-100 dark:border-gold-950">
              <img 
                :src="item.product.image" 
                :alt="item.product.name" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-grow min-w-0">
              <span class="text-[10px] font-serif font-semibold truncate block">{{ item.product.name }}</span>
              <span class="text-[9px] font-mono text-neutral-400 block">{{ item.product.tag }} (x{{ item.quantity }})</span>
            </div>
            <span class="font-mono text-xs font-semibold shrink-0">
              KES {{ (item.product.price * item.quantity).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Prices breakdown -->
        <div class="space-y-3.5 text-xs font-sans">
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Subtotal</span>
            <span class="font-mono">KES {{ store.cartSubtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400 font-semibold uppercase">Shipping ({{ store.selectedDeliveryMethod.name }})</span>
            <span class="font-mono">KES {{ store.selectedDeliveryMethod.cost.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Taxes</span>
            <span class="font-mono">KES 0.00</span>
          </div>
          
          <div class="divider-pattern w-full py-1"></div>

          <div class="flex justify-between text-base font-serif font-bold text-neutral-900 dark:text-white">
            <span>Total</span>
            <span class="font-mono text-lg">KES {{ store.cartTotal.toFixed(2) }}</span>
          </div>
        </div>

        <p v-if="store.orderError" class="text-xs text-red-600" role="alert">{{ store.orderError }}</p>
        <button 
          @click="handlePlaceOrder"
          :disabled="store.isSubmittingOrder || store.cart.length === 0"
          class="w-full flex items-center justify-center gap-2 py-4 bg-gold-600 hover:bg-gold-500 dark:bg-gold-600 dark:hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md shadow-md transition-all active:scale-95"
        >
          {{ store.isSubmittingOrder ? 'Submitting order…' : `Submit Order — KES ${store.cartTotal.toFixed(2)} →` }}
        </button>

        <!-- Back link -->
        <button 
          @click="setView('cart')"
          class="w-full flex items-center justify-center gap-1.5 text-[11px] font-mono tracking-widest text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 uppercase transition-all"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          <span>Back to Bag</span>
        </button>
      </div>
    </div>
  </div>
</template>
