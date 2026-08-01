<script setup lang="ts">
import { defineProps } from 'vue';
import { Product } from '../types';
import { useHeritageStore } from '../stores/heritageStore';
import { Eye, ShoppingBag } from 'lucide-vue-next';
import cartIcon from '../../assets/cart.svg';
import eyeIcon from '../../assets/eye.svg';

const props = defineProps<{
  product: Product;
}>();

const store = useHeritageStore();

const viewProduct = () => {
  if (!props.product.isAvailable) return;
  store.openProduct(props.product);
};

const handleAddToCart = (e: Event) => {
  e.stopPropagation();
  if (!props.product.isAvailable) return;
  store.addToCart(props.product.id);
  // Optional: provide dynamic visual haptic feedback or state
};
</script>

<template>
  <div 
    :id="'product-card-' + product.id"
    @click="viewProduct"
    :class="product.isAvailable ? 'group cursor-pointer hover:border-gold-400 dark:hover:border-gold-600 hover:shadow-xl' : 'cursor-not-allowed opacity-70 grayscale'"
    class="overflow-hidden rounded-lg bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/40 dark:border-gold-900/30 backdrop-blur-sm transition-all duration-500"
  >
    <!-- Image section with overlay -->
    <div class="relative aspect-square w-full overflow-hidden bg-gold-50 dark:bg-neutral-900">
      <img 
        :src="product.image" 
        :alt="product.name"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />
      
      <!-- New product indicator tag -->
      <span 
        v-if="product.isAvailable"
        class="absolute top-4 left-4 text-[10px] tracking-widest font-mono uppercase bg-gold-500 text-white px-2 py-0.5 rounded-sm shadow-md"
      >
        New Release
      </span>

      <span v-if="!product.isAvailable" class="absolute top-4 left-4 text-[10px] tracking-widest font-mono uppercase bg-neutral-900 text-white px-2 py-0.5 rounded-sm shadow-md">
        Coming Soon
      </span>

      <!-- Hover Action Overlay -->
      <div v-if="product.isAvailable" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
        <button
          @click.stop="viewProduct"
          class="p-3 bg-white dark:bg-neutral-900 rounded-full text-gold-600 hover:text-white hover:bg-gold-500 transition-colors shadow-lg"
          aria-label="View Details"
        >
          <img :src= "eyeIcon" alt="" class="h-5 w-5 object-contain" />
        </button>
        <button 
          @click.stop="handleAddToCart"
          class="p-3 bg-white dark:bg-neutral-900 rounded-full text-gold-600 hover:text-white hover:bg-gold-500 transition-colors shadow-lg"
          aria-label="Add to Bag"
        >
          <img :src= "cartIcon" alt = "" class="h-5 w-5 object-contain"/>
        </button>
      </div>
    </div>

    <!-- Info Section -->
    <div class="p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-mono tracking-widest text-gold-600 dark:text-gold-400 uppercase">
            {{ product.tag }}
          </span>
          <span class="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 capitalize">
            {{ product.category }}
          </span>
        </div>
        <h3 class="font-serif text-lg text-neutral-800 dark:text-neutral-100 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
          {{ product.name }}
        </h3>
        <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {{ product.cardDescription || product.description }}
        </p>
      </div>

      <div class="mt-4 flex items-center justify-between pt-3 border-t border-gold-100/30 dark:border-gold-950/20">
        <span class="font-mono text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {{ store.catalogueLoaded ? `KES ${product.price.toFixed(2)}` : 'Loading price…' }}
        </span>
        <button v-if="store.catalogueLoaded && product.isAvailable"
          @click.stop="handleAddToCart"
          class="text-xs font-mono tracking-widest text-gold-700 dark:text-gold-400 uppercase hover:text-gold-500 transition-colors"
        >
          + Add to Bag
        </button>
        <span v-else class="text-xs font-mono tracking-widest text-neutral-400 uppercase">{{ product.isAvailable ? 'Loading' : 'Coming Soon' }}</span>
      </div>
    </div>
  </div>
</template>
