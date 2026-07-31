<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHeritageStore } from '../stores/heritageStore';
import { X, ShoppingBag, Globe, } from 'lucide-vue-next';
import cancelIcon from '../../assets/cancel.svg';
import awardIcon from '../../assets/award.svg';
import laureal from '../../assets/laurelwreath.webp';
import cartIcon from '../../assets/cart.svg';
import plusIcon from '../../assets/plus.svg';
import minusIcon from '../../assets/minus.svg';

const store = useHeritageStore();

const quantity = ref(1);

const product = computed(() => store.selectedProduct);

const handleClose = () => {
  store.closeProduct();
  quantity.value = 1;
};

const increment = () => {
  quantity.value++;
};

const decrement = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToBag = () => {
  if (!product.value?.isAvailable) return;
  store.addToCart(product.value.id, quantity.value);
  handleClose();
};
</script>

<template>
  <div 
    v-if="product" 
    class="fixed inset-0 z-50 overflow-hidden"
    aria-labelledby="modal-title" 
    role="dialog" 
    aria-modal="true"
  >
    <!-- Background backdrop -->
    <div 
      @click="handleClose"
      class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <!-- Slide-over panel -->
      <div class="w-screen max-w-2xl transform transition-transform duration-500 bg-luxe-light dark:bg-luxe-dark text-neutral-900 dark:text-neutral-100 shadow-2xl flex flex-col h-full border-l border-gold-200/20 dark:border-gold-900/10">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gold-100 dark:border-gold-950 flex items-center justify-between">
          <h2 class="font-serif text-lg text-gold-700 dark:text-gold-400">Craftsmanship Details</h2>
          <button 
            @click="handleClose"
            class="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors rounded-full hover:bg-gold-50 dark:hover:bg-luxe-gray"
            aria-label="Close panel"
          >
            <img :src="cancelIcon" alt="" class="h-10 w-10 object-contain" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <!-- Main Product presentation -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <!-- Product image -->
            <div class="md:col-span-5 aspect-square rounded-lg overflow-hidden bg-gold-50 dark:bg-neutral-900 border border-gold-100 dark:border-gold-950 shadow-md">
              <img 
                :src="product.image" 
                :alt="product.name" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Key Details -->
            <div class="md:col-span-7 space-y-4">
              <span class="text-xs font-mono tracking-widest text-gold-600 dark:text-gold-400 uppercase bg-gold-100/50 dark:bg-gold-950/20 px-2 py-1 rounded-sm">
                {{ product.tag }}
              </span>
              <h1 class="font-serif text-2xl md:text-3xl font-medium text-neutral-900 dark:text-neutral-50">
                {{ product.name }}
              </h1>
              <p class="font-serif italic text-sm text-gold-600 dark:text-gold-400 font-medium">
                {{ product.collection }}
              </p>
              <p class="text-xl font-mono font-semibold">
                KES {{ product.price.toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-3">
            <h3 class="font-serif text-lg border-b border-gold-100 dark:border-gold-950 pb-2">The Story</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              {{ product.description }}
            </p>
          </div>

          <!-- Artisanal values / details list -->
          <div class="space-y-3">
            <h3 class="font-serif text-lg border-b border-gold-100 dark:border-gold-950 pb-2">Authenticity & Process</h3>
            <ul class="space-y-2.5">
              <li 
                v-for="(detail, i) in product.details" 
                :key="i"
                class="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400"
              >
                <img :src="laureal" class="h-3 w-3 object-contain" />
                <span>{{ detail }}</span>
              </li>
            </ul>
          </div>

          <!-- Specifications -->
          <div class="space-y-3">
            <h3 class="font-serif text-lg border-b border-gold-100 dark:border-gold-950 pb-2">Specifications</h3>
            <div class="grid grid-cols-2 gap-4 bg-white/40 dark:bg-luxe-gray/40 border border-gold-100 dark:border-gold-950 p-4 rounded-md">
              <div 
                v-for="(value, key) in product.specifications" 
                :key="key"
                class="space-y-1"
              >
                <span class="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">
                  {{ key }}
                </span>
                <span class="text-xs font-serif font-medium text-neutral-800 dark:text-neutral-200">
                  {{ value }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sourcing Promise banner -->
          <div class="flex items-start gap-3 bg-gold-50/50 dark:bg-gold-950/10 border border-gold-200/30 dark:border-gold-900/20 p-4 rounded-lg">
            <img :src="awardIcon" alt="" class="h-15 w-15 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
            <div class="space-y-0.5">
              <h4 class="text-xs font-serif font-semibold text-gold-800 dark:text-gold-300">Generational Partnership</h4>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                By purchasing this masterpiece, you participate in direct fair trade supporting independent master weavers, wood carvers, and clay-turners across East Africa.
              </p>
            </div>
          </div>
        </div>

        <!-- Sticky Footer controls -->
        <div class="px-6 py-5 bg-white dark:bg-luxe-gray border-t border-gold-100 dark:border-gold-950 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <!-- Quantity Adjuster -->
          <div class="flex items-center border border-gold-300 dark:border-gold-800 rounded-md bg-gold-50/30 dark:bg-luxe-dark px-2 py-1 select-none">
            <button 
              @click="decrement"
              class="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Decrease quantity"
            >
              <img :src="minusIcon" class="h-4 w-4" />
            </button>
            <span class="px-4 font-mono text-sm w-8 text-center">{{ quantity }}</span>
            <button 
              @click="increment"
              class="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Increase quantity"
            >
              <img :src="plusIcon" class="h-4 w-4" />
            </button>
          </div>

          <!-- Add to bag button -->
          <button 
            @click="handleAddToBag"
            class="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gold-600 hover:bg-gold-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md shadow-md transition-all active:scale-95"
          >
            <img :src="cartIcon" class="h-5.5 w-5.5 mr-1" />
            Add to Bag — KES {{(product.price * quantity).toFixed(2)}}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
