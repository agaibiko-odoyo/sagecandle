<script setup lang="ts">
import { useHeritageStore } from '../stores/heritageStore';
import { Minus, Plus, Trash2, ShieldCheck, Truck, ArrowRight, Heart } from 'lucide-vue-next';
import { computed } from 'vue';
import plusIcon from '../../assets/plus.svg';
import minusIcon from '../../assets/minus.svg';
import trashIcon from '../../assets/trash.svg';
import rightarrowIcon from '../../assets/rightarrow.svg';
import truckIcon from '../../assets/truck.svg';
import shieldIcon from '../../assets/shield.svg';

const store = useHeritageStore();

// Recommendations
const recommendations = computed(() => {
  const cartIds = store.cart.map(item => item.productId);
  return store.products.filter(p => p.isAvailable && !cartIds.includes(p.id)).slice(0, 2);
});

const handleQuantityChange = (productId: string, quantity: number) => {
  store.updateQuantity(productId, quantity);
};

const handleRemove = (productId: string) => {
  store.removeFromCart(productId);
};

const handleAddFromRecommendation = (productId: string) => {
  store.addToCart(productId, 1);
};

const viewProduct = (productId: string) => {
  const p = store.products.find(prod => prod.id === productId);
  if (p) store.openProduct(p);
};

const setView = (view: 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation') => store.navigateTo(view);
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-8 space-y-16 pb-24">
    <!-- Header Title -->
    <div class="border-b border-gold-200/40 dark:border-gold-900/30 pb-6 space-y-2">
      <h1 class="font-serif text-3xl font-light">Your Bag</h1>
      <p class="text-xs font-mono tracking-widest text-gold-600 dark:text-gold-400 uppercase">
        {{ store.cartTotalItems }} {{ store.cartTotalItems === 1 ? 'EXCEPTIONAL HANDCRAFTED ITEM' : 'EXCEPTIONAL HANDCRAFTED ITEMS' }}
      </p>
    </div>

    <!-- Empty Bag State -->
    <div 
      v-if="store.cartDetailedItems.length === 0" 
      class="text-center py-20 bg-white/20 dark:bg-luxe-gray/20 border border-gold-100 dark:border-gold-950 rounded-xl space-y-6"
    >
      <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
        Your shopping bag is currently empty. Our master artisans are waiting to share their creations with you.
      </p>
      <button 
        @click="setView('curated')"
        class="px-8 py-3 bg-gold-600 hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md shadow-md transition-all active:scale-95"
      >
        Browse Collections
      </button>
    </div>

    <!-- Filled Bag Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      <!-- Cart Items list -->
      <div class="lg:col-span-8 space-y-8">
        <div 
          v-for="item in store.cartDetailedItems" 
          :key="item.product.id"
          class="flex flex-col sm:flex-row gap-6 p-6 rounded-lg bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
        >
          <!-- Product image -->
          <div 
            @click="viewProduct(item.product.id)"
            class="aspect-square w-full sm:w-32 rounded bg-gold-50 dark:bg-neutral-900 overflow-hidden shrink-0 border border-gold-100 dark:border-gold-950 cursor-pointer"
          >
            <img 
              :src="item.product.image" 
              :alt="item.product.name" 
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Product info -->
          <div class="flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-1">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-mono tracking-widest text-gold-600 dark:text-gold-400 uppercase">
                    {{ item.product.tag }}
                  </span>
                  <h3 
                    @click="viewProduct(item.product.id)"
                    class="font-serif text-lg font-medium text-neutral-900 dark:text-neutral-50 hover:text-gold-600 cursor-pointer transition-colors"
                  >
                    {{ item.product.name }}
                  </h3>
                  <p class="text-xs text-neutral-400 dark:text-neutral-500 italic">
                    {{ item.product.collection }}
                  </p>
                </div>
                <span class="font-mono text-base font-semibold">
                  KES {{ (item.product.price * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Controls (adjust quantity and remove) -->
            <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gold-100/30 dark:border-gold-950/20">
              <!-- Quantity Selector -->
              <div class="flex items-center border border-gold-300 dark:border-gold-800 rounded bg-transparent px-1 select-none">
                <button 
                  @click="handleQuantityChange(item.product.id, item.quantity - 1)"
                  class="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <img :src="minusIcon" alt="" class="h-3.5 w-3.5" />
                </button>
                <span class="px-3 font-mono text-xs w-6 text-center">{{ item.quantity }}</span>
                <button 
                  @click="handleQuantityChange(item.product.id, item.quantity + 1)"
                  class="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  aria-label="Increase quantity"
                >
                  <img :src="plusIcon" alt="" class="h-3.5 w-3.5" />
                </button>
              </div>

              <!-- Remove CTA -->
              <button 
                @click="handleRemove(item.product.id)"
                class="inline-flex items-center gap-1 text-[11px] font-mono tracking-widest text-red-700 hover:text-red-500 uppercase transition-colors"
              >
                <img :src="trashIcon" alt="" class="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Summary Sidebar -->
      <div class="lg:col-span-4 bg-white dark:bg-luxe-gray border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg shadow-sm space-y-6">
        <h2 class="font-serif text-xl tracking-wide border-b border-gold-100 dark:border-gold-950 pb-3">Summary</h2>
        
        <div class="space-y-3.5 text-xs font-sans">
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Subtotal</span>
            <span class="font-mono">KES {{ store.cartSubtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Shipping</span>
            <span class="font-mono text-gold-600 dark:text-gold-400 font-semibold tracking-wider uppercase">Calculated at next step</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Taxes</span>
            <span class="font-mono">KES 0.00</span>
          </div>
          
          <div class="divider-pattern w-full py-1"></div>

          <div class="flex justify-between text-sm font-serif font-bold">
            <span>Total</span>
            <span class="font-mono">KES {{ store.cartSubtotal.toFixed(2) }}</span>
          </div>
        </div>

        <button 
          @click="setView('checkout')"
          class="w-full flex items-center justify-center gap-2 py-4 bg-gold-600 hover:bg-gold-500 dark:bg-gold-600 dark:hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md shadow-md transition-all active:scale-95"
        >
          Proceed to Checkout <img :src="rightarrowIcon" class="h-4 w-4" />
        </button>

        <p class="text-[9px] font-mono text-center text-neutral-400 dark:text-neutral-500 uppercase">
          Secure Payment Processing. Multiple Options.
        </p>

        <!-- Trust badges -->
        <div class="space-y-3 pt-4 border-t border-gold-100/30 dark:border-gold-950/20 text-xs">
          <div class="flex gap-2.5 items-center text-neutral-600 dark:text-neutral-400">
            <img :src="truckIcon" alt="" class="h-4 w-4 text-gold-500 shrink-0" />
            <span class="text-[11px] leading-relaxed">Free Worldwide Shipping on Luxury Items</span>
          </div>
          <div class="flex gap-2.5 items-center text-neutral-600 dark:text-neutral-400">
            <img :src="shieldIcon" alt="" class="h-4 w-4 text-gold-500 shrink-0" />
            <span class="text-[11px] leading-relaxed">Authenticity Certificate Signed by Artisan Included</span>
          </div>
        </div>
      </div>
    </div>

    <!-- "You May Also Love" Recommendations (Screenshot 4 layout) -->
    <div v-if="recommendations.length > 0" class="space-y-8 border-t border-gold-200/40 dark:border-gold-900/30 pt-12">
      <div class="space-y-1">
        <h2 class="font-serif text-2xl font-light">You May Also Love</h2>
        <div class="h-px w-12 bg-gold-400"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          v-for="rec in recommendations" 
          :key="rec.id"
          class="flex flex-col sm:flex-row gap-6 p-4 rounded-lg bg-white/20 dark:bg-luxe-gray/20 border border-gold-100/30 dark:border-gold-950/10 hover:border-gold-400/50 transition-all duration-300"
        >
          <!-- Image -->
          <div 
            @click="viewProduct(rec.id)"
            class="aspect-square w-full sm:w-24 rounded bg-gold-50 dark:bg-neutral-900 overflow-hidden shrink-0 border border-gold-100 dark:border-gold-950 cursor-pointer"
          >
            <img 
              :src="rec.image" 
              :alt="rec.name" 
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          <!-- Description and add -->
          <div class="grow flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[9px] font-mono tracking-widest text-gold-600 dark:text-gold-400 uppercase">
                {{ rec.tag }}
              </span>
              <h3 
                @click="viewProduct(rec.id)"
                class="font-serif text-base font-semibold hover:text-gold-600 cursor-pointer transition-colors"
              >
                {{ rec.name }}
              </h3>
              <p class="font-mono text-xs font-semibold mt-1">
                KES {{ rec.price.toFixed(2) }}
              </p>
            </div>

            <button 
              @click="handleAddFromRecommendation(rec.id)"
              class="self-start text-[11px] font-mono tracking-widest text-red-700 hover:text-red-500 uppercase border-b border-gold-500 pb-0.5 transition-colors"
            >
              + Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
