<script setup lang="ts">
import { computed } from 'vue';
import { useHeritageStore } from '../stores/heritageStore';
import ProductCard from './ProductCard.vue';
import { Gift } from 'lucide-vue-next';
import flameIcon from '../../assets/flame.svg';
import potIcon from '../../assets/pottery.svg';
import soulIcon from '../../assets/soul.svg';

const store = useHeritageStore();

const activeFilter = computed({
  get: () => store.collectionFilter,
  set: (filter: 'all' | 'signature') => {
    if (filter !== store.collectionFilter) store.navigateTo('curated', { filter });
  }
});

const filteredProducts = computed(() => {
  const candleProducts = store.products.filter(product => product.isVisible !== false && product.category === 'candles');
  const signatureIds = new Set(['sunset-nairobi', 'loomed-horizon', 'savannah-dusk', 'royal-triptych']);
  const products = activeFilter.value === 'signature'
    ? candleProducts.filter(product => signatureIds.has(product.id))
    : candleProducts;
  return [...products].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
});

// Description maps for category header sections
const categoryHeader = computed(() => {
  switch (activeFilter.value) {
    case 'signature':
      return {
        tag: 'Signature Candles',
        title: 'Our Essential Scents',
        desc: 'The four candles that define Sage Candle: distinct fragrances for your most memorable moments.'
      };
    default:
      return {
        tag: 'Collections',
        title: 'The Masterpiece Collection',
        desc: 'Discover generational luxury pieces that preserve ancestral stories through sustainable contemporary design.'
      };
  }
});
</script>

<template>
  <div class="space-y-16 pb-20">
    <!-- Category Hero / Showcase -->
    <div class="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
      <!-- Background images depending on selection -->
      <div class="absolute inset-0 z-0">
        <img 
          v-if="activeFilter === 'signature'"
          src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1200" 
          alt="Candles collection" 
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover brightness-50"
        />
        <img 
          v-else
          src="https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&q=80&w=1200" 
          alt="All curation" 
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover brightness-50"
        />
        <div class="absolute inset-0 bg-neutral-950/70"></div>
      </div>

      <!-- Header Content -->
      <div class="relative z-10 text-center max-w-2xl px-6 space-y-4 text-white">
        <span class="text-xs font-mono tracking-widest uppercase text-gold-400">
          {{ categoryHeader.tag }}
        </span>
        <h1 class="font-serif text-3xl md:text-5xl tracking-wide font-light">
          {{ categoryHeader.title }}
        </h1>
        <p class="text-xs md:text-sm text-neutral-300 font-light leading-relaxed max-w-lg mx-auto">
          {{ categoryHeader.desc }}
        </p>
      </div>
    </div>

    <!-- Category Filter Selector Pill System -->
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-center border-b border-gold-200/40 dark:border-gold-900/30 pb-4">
        <div class="flex flex-wrap gap-2 justify-center">
          <button 
            @click="activeFilter = 'all'"
            :class="[
              'px-6 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 border',
              activeFilter === 'all' 
                ? 'bg-gold-600 text-white border-gold-600 shadow-md' 
                : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:border-gold-300 dark:hover:border-gold-800'
            ]"
          >
            All Creations
          </button>
          <button 
            @click="activeFilter = 'candles'"
            :class="[
              'px-6 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 border',
              activeFilter === 'candles' 
                ? 'bg-gold-600 text-white border-gold-600 shadow-md' 
                : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:border-gold-300 dark:hover:border-gold-800'
            ]"
          >
            Signature Candles
          </button>
        </div>
      </div>
    </div>

    <!-- Curation Quote / Manifest -->
    <div class="max-w-3xl mx-auto px-6 text-center space-y-6 bg-white/20 dark:bg-luxe-gray/20 p-8 rounded-lg border border-gold-200/20 dark:border-gold-950/10">
      <div class="flex justify-center">
        <img :src="soulIcon" alt="Soul Flame" class="h-15 w-15" />
      </div>
      <h2 class="font-serif text-2xl font-light text-neutral-900 dark:text-neutral-100">The Soul of the Craft</h2>
      <div class="divider-pattern w-20 mx-auto"></div>
      <p class="font-serif italic text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
        "Every piece is a dialogue. Between the artisan and the earth, between the past and the present. At Sage Candle, we don't just sell products; we preserve the cadence of stories told in light, smoke, and stone."
      </p>
    </div>

    <!-- Shop Grid -->
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </div>

    <!-- Craft Highlights Section (matching screenshot 2 list) -->
    <div class="border-t border-gold-200/40 dark:border-gold-900/30 pt-16 max-w-5xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Poured Souls -->
        <div class="text-center space-y-3 p-4 rounded-lg bg-white/30 dark:bg-luxe-gray/30 border border-gold-100/40 dark:border-gold-950/20">
          <div class="mx-auto h-15 w-15 rounded-full bg-gold-100 dark:bg-gold-950/40 flex items-center justify-center text-gold-600 dark:text-gold-400">
            <img :src="flameIcon" alt="" class="h-10 w-10" />
          </div>
          <h3 class="font-serif text-base font-semibold">Poured Souls</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Small batch candles infused with rare African botanicals and poured by hand.
          </p>
        </div>

        <!-- Ancestral Clay -->
        <div class="text-center space-y-3 p-4 rounded-lg bg-white/30 dark:bg-luxe-gray/30 border border-gold-100/40 dark:border-gold-950/20">
          <div class="mx-auto h-15 w-15 rounded-full bg-gold-100 dark:bg-gold-950/40 flex items-center justify-center text-gold-600 dark:text-gold-400">
            <img :src="potIcon" alt="" class="h-10 w-10" />
          </div>
          <h3 class="font-serif text-base font-semibold">Ancestral Clay</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Hand-turned clay candle vessels and brass care tools crafted by master artisans.
          </p>
        </div>

        <!-- Gift-ready glow -->
        <div class="text-center space-y-3 p-4 rounded-lg bg-white/30 dark:bg-luxe-gray/30 border border-gold-100/40 dark:border-gold-950/20">
          <div class="mx-auto h-15 w-15 rounded-full bg-gold-100 dark:bg-gold-950/40 flex items-center justify-center text-gold-600 dark:text-gold-400">
            <Gift class="h-8 w-8 text-gold-600 dark:text-gold-400" aria-hidden="true" />
          </div>
          <h3 class="font-serif text-base font-semibold">Gift-Ready Glow</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Thoughtfully made for gifting, self-care rituals, and the moments you want to make memorable.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
