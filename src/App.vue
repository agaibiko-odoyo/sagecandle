<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { Analytics } from '@vercel/analytics/vue';
import { useHeritageStore } from './stores/heritageStore';
import HomeView from './components/HomeView.vue';
import CuratedView from './components/CuratedView.vue';
import HeritageView from './components/HeritageView.vue';
import ProfileView from './components/ProfileView.vue';
import CartView from './components/CartView.vue';
import CheckoutView from './components/CheckoutView.vue';
import ConfirmationView from './components/ConfirmationView.vue';
import OrderTrackingView from './components/OrderTrackingView.vue';
import ProductDetailModal from './components/ProductDetailModal.vue';
import { Moon, Sun } from 'lucide-vue-next';
import homeIcon from '../assets/home.svg';
import curatedIcon from '../assets/curated.svg';
import heritageIcon from '../assets/heritage.svg';
import profileIcon from '../assets/profile.svg';
import orderIcon from '../assets/order.svg';

const store = useHeritageStore();

onMounted(() => {
  store.initTheme();
  store.initNavigation();
  void store.initAuth();
  void store.loadProductPrices();
});

onBeforeUnmount(() => {
  store.destroyNavigation();
  store.destroyAuth();
});

const setView = (view: 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation' | 'tracking') => store.navigateTo(view);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-luxe-light dark:bg-luxe-dark text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
    
    <!-- Top Elegant Header -->
    <header class="sticky top-0 z-40 bg-luxe-light/85 dark:bg-luxe-dark/85 backdrop-blur-md border-b border-gold-200/20 dark:border-gold-900/10">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between ">
        
        <!-- Brand mark -->
        <button 
          @click="setView('home')"
          class=" -ml-2 flex items-center gap-3 p-2 text-neutral-600 dark:text-neutral-300 transition-colors rounded-md "
          aria-label="Sage Candle home"
        >
        <!-- hover:text-gold-600 hover:bg-gold-50/50 dark:hover:bg-neutral-900-->
          <img
            src="/sage-logo.jpeg"
            alt="Sage Candle Kenya"
            class="h-9 w-9 rounded-full object-cover ring-1 ring-gold-500/30"
          />
          <h1 class="font-serif text-base md:text-lg font-light tracking-[0.25em] text-neutral-900 dark:text-white uppercase transition-colors ">
            Sage Candle
          </h1>
        </button>

        <!-- Desktop navigation -->
        <div class="hidden md:flex md:ml-auto md:mr-2 items-center justify-end gap-1">
          <button
            v-for="tab in [
              { view: 'home', label: 'Home' },
              { view: 'curated', label: 'Collections' },
              { view: 'heritage', label: 'Heritage' },
              { view: 'profile', label: 'Profile' }
            ]"
            :key="tab.view"
            @click="setView(tab.view as 'home' | 'curated' | 'heritage' | 'profile')"
            :class="[
              'px-3 py-2 text-[14px] font-mono uppercase tracking-wider transition-colors rounded-sm',
              store.activeView === tab.view
                ? 'text-gold-600 dark:text-gold-400'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-gold-600 dark:hover:text-gold-400'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="ga-2 flex shrink-0 items-center gap-1">
          <!-- Cart Shopping Bag Badge -->
          <button 
            @click="setView('cart')"
            class="p-2 -mr-2 relative text-neutral-600 dark:text-neutral-300 hover:text-gold-600 transition-colors rounded-full hover:bg-gold-50/50 dark:hover:bg-neutral-900"
            aria-label="Your Bag"
          >
            <img :src="orderIcon" alt="" class="h-5 w-5 object-contain" />
            <span 
              v-if="store.cartTotalItems > 0"
              class="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-gold-600 text-[9px] font-mono font-bold text-white flex items-center justify-center shadow-sm"
            >
              {{ store.cartTotalItems }}
            </span>
          </button>

          <button
            v-if="store.activeView === 'home' || 'heritage' || 'profile' || 'collections'"
            @click="store.toggleDarkMode"
            class="p-2 text-neutral-600 dark:text-gold-400 hover:text-gold-600 transition-colors rounded-full hover:bg-gold-50/50 dark:hover:bg-neutral-900"
            :aria-label="store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            :title="store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun v-if="store.isDarkMode" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Dynamic Content with Vue transitions -->
    <main class="grow pb-20 md:pb-0">
      <Transition name="fade" mode="out-to-in">
        <component :is="
          store.activeView === 'home' ? HomeView :
          store.activeView === 'curated' ? CuratedView :
          store.activeView === 'heritage' ? HeritageView :
          store.activeView === 'profile' ? ProfileView :
          store.activeView === 'cart' ? CartView :
          store.activeView === 'checkout' ? CheckoutView :
          store.activeView === 'confirmation' ? ConfirmationView :
          OrderTrackingView
        " />
      </Transition>
    </main>

    <!-- Bottom Nav Tab Bar (Anchored for mobile-first comfort and beautiful tactile buttons) -->
    <nav class="fixed bottom-0 inset-x-0 z-40 bg-luxe-light/95 dark:bg-luxe-dark/95 border-t border-gold-200/20 dark:border-gold-900/10 backdrop-blur-md py-2 shadow-2xl safe-bottom md:hidden">
      <div class="max-w-md mx-auto px-6 flex items-center justify-between">
        
        <!-- Home tab -->
        <button 
          @click="setView('home')"
          :class="[
            'flex flex-col items-center gap-1 flex-1 py-1 transition-all',
            store.activeView === 'home' ? 'text-gold-600 dark:text-gold-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
          ]"
        >
          <img :src="homeIcon" alt="" class="h-5 w-5 shrink-0 object-contain" />
          <span class="text-[9px] font-mono uppercase tracking-wider">Home</span>
        </button>

        <!-- Collections tab -->
        <button 
          @click="setView('curated')"
          :class="[
            'flex flex-col items-center gap-1 flex-1 py-1 transition-all',
            store.activeView === 'curated' ? 'text-gold-600 dark:text-gold-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
          ]"
        >
          <img :src="curatedIcon" alt="" class="h-5 w-5 shrink-0 object-contain" />
          <span class="text-[9px] font-mono uppercase tracking-wider">Collections</span>
        </button>

        <!-- Heritage tab -->
        <button 
          @click="setView('heritage')"
          :class="[
            'flex flex-col items-center gap-1 flex-1 py-1 transition-all',
            store.activeView === 'heritage' ? 'text-gold-600 dark:text-gold-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
          ]"
        >
          <img :src="heritageIcon" alt="" class="h-5 w-5 shrink-0 object-contain" />
          <span class="text-[9px] font-mono uppercase tracking-wider">Heritage</span>
        </button>

        <!-- Profile tab -->
        <button 
          @click="setView('profile')"
          :class="[
            'flex flex-col items-center gap-1 flex-1 py-1 transition-all',
            store.activeView === 'profile' ? 'text-gold-600 dark:text-gold-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
          ]"
        >
          <img :src="profileIcon" alt="" class="h-5 w-5 shrink-0 object-contain" />
          <span class="text-[9px] font-mono uppercase tracking-wider">Profile</span>
        </button>

      </div>
    </nav>

    <!-- Product Details sliding side modal overlay -->
    <ProductDetailModal />

    <Analytics />
  </div>
</template>

<style>
/* Safe area padding for newer mobile viewports */
.safe-bottom {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
