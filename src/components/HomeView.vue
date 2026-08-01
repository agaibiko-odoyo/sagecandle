<script setup lang="ts">
import { useHeritageStore } from '../stores/heritageStore';
import ProductCard from './ProductCard.vue';
import { Sparkles, ArrowRight, BookOpen, Quote, Star } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import scentedMemoriesImage from '../../assets/img18.jpeg';

const store = useHeritageStore();
const newsletterEmail = ref('');
const newsletterMessage = ref<string | null>(null);
const newsletterError = ref<string | null>(null);
const subscribing = ref(false);

const featuredProducts = computed(() => {
  return store.products.slice(0, 3);
});

const setView = (view: 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation') => store.navigateTo(view);
const viewCollection = () => store.navigateTo('curated');

const subscribeToNewsletter = async () => {
  newsletterMessage.value = null;
  newsletterError.value = null;
  const email = newsletterEmail.value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    newsletterError.value = 'Enter a valid email address.';
    return;
  }

  subscribing.value = true;
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Could not save your subscription.');
    newsletterEmail.value = '';
    newsletterMessage.value = result.message || 'You are subscribed to the Inner Circle.';
  } catch (error) {
    newsletterError.value = error instanceof Error ? error.message : 'Could not save your subscription.';
  } finally {
    subscribing.value = false;
  }
};
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- Hero Section -->
    <div 
      class="relative min-h-[90vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      <!-- Background Image with premium dark filter -->
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1600" 
          alt="Artisan Background" 
          referrerpolicy="no-referrer"
          fetchpriority="high"
          decoding="async"
          class="w-full h-full object-cover object-center"
        />
        <div class="absolute inset-0 bg-neutral-950/80 backdrop-brightness-75"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 w-full max-w-4xl mx-auto px-6 text-center space-y-8 py-12">
        <img
          src="/sage-logo.jpeg"
          alt="Sage Candle Kenya"
          class="mx-auto h-28 w-28 rounded-full object-cover shadow-2xl ring-1 ring-white/40 md:h-36 md:w-36"
        />
        <span class="text-xs font-mono tracking-[0.3em] text-gold-400 uppercase inline-block animate-pulse">
          Established in Heritage
        </span>
        
        <h1 class="font-serif text-4xl font-bold leading-[1.2] tracking-[-0.02em] text-white md:text-6xl lg:text-7xl md:leading-[1.1]">
          Crafting the Soul <br class="hidden md:inline" /> of the Continent
        </h1>
        
        <p class="max-w-2xl mx-auto text-sm md:text-base text-neutral-300 font-light leading-relaxed tracking-wide">
          Experience a modern fusion of ancient craftsmanship and contemporary luxury. Our collections tell stories of earth, fire, and hand-woven dreams.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button 
            @click="setView('curated')"
            class="w-full sm:w-auto px-8 py-4 bg-gold-600 hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md transition-all active:scale-95 shadow-lg"
          >
            Explore Collection
          </button>
          <button 
            @click="setView('heritage')"
            class="w-full sm:w-auto px-8 py-4 bg-transparent border border-white hover:bg-white hover:text-neutral-950 text-white font-mono uppercase text-xs tracking-widest rounded-md transition-all active:scale-95"
          >
            Our Story
          </button>
        </div>
      </div>

      <!-- Bottom Gradient fading into page -->
      <div class="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-luxe-light dark:from-luxe-dark to-transparent z-0"></div>
    </div>

    <!-- Heritage Reimagined Section -->
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Story Column -->
      <div class="lg:col-span-7 space-y-8">
        <div class="inline-flex items-center gap-2">
          <div class="h-[2px] w-8 bg-gold-500"></div>
          <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">Heritage Reimagined</span>
        </div>
        
        <!-- Big elegant quote -->
        <div class="relative pl-6 border-l-2 border-gold-400">
          <blockquote class="font-serif italic text-xl md:text-2xl text-neutral-800 dark:text-neutral-200 leading-relaxed font-light">
            "We do not just create objects; we preserve the whispers of ancestors through the lens of modern design."
          </blockquote>
        </div>

        <div class="space-y-4 text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
          <p>
            Sage Candle was born from a desire to showcase the unparalleled artistry of African craftsmen to a global audience. By blending traditional techniques with a minimalist, luxury aesthetic, we create pieces that are both timeless and deeply rooted in cultural identity.
          </p>
          <p>
            Every candle is hand-poured, every vessel is hand-turned, and every design is a unique testament to the enduring spirit of our heritage.
          </p>
        </div>
      </div>

      <!-- Image Column (pottery visual) -->
      <div class="lg:col-span-5 relative">
        <div class="aspect-[4/5] rounded-lg overflow-hidden border border-gold-200/50 dark:border-gold-900/30 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800" 
            alt="Artisan molding pottery" 
            referrerpolicy="no-referrer"
            class="w-full h-full object-cover"
          />
        </div>
        <!-- Decorative back card representing luxury frames -->
        <div class="absolute -bottom-6 -left-6 w-1/2 h-1/2 border border-gold-500/20 rounded-lg -z-10 hidden sm:block"></div>
      </div>
    </div>

    <!-- The Collections Categories Grid -->
    <div class="bg-gold-50/40 dark:bg-luxe-gray/20 py-16">
      <div class="max-w-7xl mx-auto px-6 space-y-12">
        <div class="text-center space-y-3">
          <h2 class="font-serif text-3xl md:text-4xl">The Collections</h2>
          <div class="divider-pattern w-32 mx-auto"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Scented Memories -->
          <div 
            @click="viewCollection()"
            class="group relative aspect-[3/4] rounded-lg overflow-hidden border border-gold-200/30 dark:border-gold-900/20 cursor-pointer shadow-md hover:shadow-xl transition-all"
          >
            <img 
          :src="scentedMemoriesImage"
          alt="Scented Memories"
          referrerpolicy="no-referrer"
          loading="lazy"
          decoding="async"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white space-y-1">
              <span class="text-[10px] font-mono tracking-widest text-gold-400 uppercase">Candles & Incense</span>
              <h3 class="font-serif text-xl tracking-wide">Scented Memories</h3>
            </div>
          </div>

          <!-- Aromatic Travel Tins -->
          <div 
            @click="viewCollection()"
            class="group relative aspect-[3/4] rounded-lg overflow-hidden border border-gold-200/30 dark:border-gold-900/20 cursor-pointer shadow-md hover:shadow-xl transition-all"
          >
            <img 
          src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=600"
          alt="Aromatic Travel Tins"
          referrerpolicy="no-referrer"
          loading="lazy"
          decoding="async"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white space-y-1">
              <span class="text-[10px] font-mono tracking-widest text-gold-400 uppercase">Portable Aromatics</span>
              <h3 class="font-serif text-xl tracking-wide">Aromatic Travel Tins</h3>
            </div>
          </div>

          <!-- Vessels & Candle Accessories -->
          <div 
            @click="viewCollection()"
            class="group relative aspect-[3/4] rounded-lg overflow-hidden border border-gold-200/30 dark:border-gold-900/20 cursor-pointer shadow-md hover:shadow-xl transition-all"
          >
            <img 
          src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600"
          alt="Vessels & Candle Accessories"
          referrerpolicy="no-referrer"
          loading="lazy"
          decoding="async"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white space-y-1">
              <span class="text-[10px] font-mono tracking-widest text-gold-400 uppercase">Artisan Vessels</span>
              <h3 class="font-serif text-xl tracking-wide">Vessels & Accessories</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Creations Grid -->
    <div class="max-w-7xl mx-auto px-6 space-y-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="space-y-2">
          <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">Collections</span>
          <h2 class="font-serif text-3xl md:text-4xl font-normal text-neutral-900 dark:text-neutral-50">Featured Creations</h2>
        </div>
        <button 
          @click="setView('curated')"
          class="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-gold-700 dark:text-gold-400 uppercase hover:text-gold-500 border-b border-gold-500 pb-1 self-start sm:self-auto transition-all"
        >
          View All 
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <!-- Featured Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProductCard 
          v-for="product in featuredProducts" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </div>

    <!-- Newsletter "Join the Inner Circle" -->
    <div class="max-w-3xl mx-auto px-6 text-center space-y-8 bg-white dark:bg-luxe-gray/40 border border-gold-200 dark:border-gold-900/20 p-8 md:p-12 rounded-lg shadow-lg">
      <div class="space-y-3">
        <h2 class="font-serif text-2xl md:text-3xl font-medium tracking-wide">Join the Inner Circle</h2>
        <p class="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Receive exclusive early access to our limited artisan drops, seasonal heritage catalogs, and behind-the-loom stories.
        </p>
      </div>

      <form @submit.prevent="subscribeToNewsletter" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input 
          v-model="newsletterEmail"
          type="email" 
          placeholder="YOUR EMAIL" 
          autocomplete="email"
          maxlength="320"
          class="flex-1 px-4 py-3 border border-gold-300 dark:border-gold-800 rounded-md bg-transparent text-xs font-mono tracking-wider text-center focus:outline-none focus:border-gold-500 transition-colors"
          required
        />
        <button 
          type="submit"
          :disabled="subscribing"
          class="px-8 py-3 bg-neutral-950 dark:bg-gold-600 hover:bg-neutral-800 dark:hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md transition-all active:scale-95 shadow-md disabled:cursor-wait disabled:opacity-60"
        >
          {{ subscribing ? 'Subscribing…' : 'Subscribe' }}
        </button>
      </form>
      <p v-if="newsletterMessage" role="status" class="text-xs text-gold-700 dark:text-gold-400">{{ newsletterMessage }}</p>
      <p v-else-if="newsletterError" role="alert" class="text-xs text-red-600 dark:text-red-400">{{ newsletterError }}</p>
    </div>
  </div>
</template>
