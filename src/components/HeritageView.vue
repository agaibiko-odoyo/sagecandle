<script setup lang="ts">
import { Sparkles, Hammer, ShieldCheck } from 'lucide-react';
import { useHeritageStore } from '../stores/heritageStore';
import lorettaImage from '../../assets/Lora1-optimized.jpeg';
import img1 from '../../assets/img1.jpeg';
import img2 from '../../assets/img2.jpeg';
import img3 from '../../assets/img3.jpeg';

const store = useHeritageStore();

const setView = (view: 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation') => store.navigateTo(view);
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- Heritage Hero Banner -->
    <div class="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1200" 
          alt="Artisanal Candle Making" 
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover brightness-50"
        />
        <div class="absolute inset-0 bg-neutral-950/70"></div>
      </div>

      <div class="relative z-10 text-center max-w-2xl px-6 space-y-4 text-white">
        <span class="text-xs font-mono tracking-widest uppercase text-gold-400">Crafted with Intent</span>
        <h1 class="font-serif text-3xl md:text-5xl tracking-wide font-light">The Hands Behind<br />the Heritage</h1>
        <p class="text-xs md:text-sm text-neutral-300 font-light leading-relaxed max-w-lg mx-auto">
          Discover the master artisans who blend culture into fragrance, preserving centuries of botanical knowledge through hand-poured wax and hand-turned pit-fired clay.
        </p>
      </div>
    </div>

    <!-- Loretta Rattos Profile Section -->
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Loretta Story Info Column -->
      <div class="lg:col-span-6 space-y-8">
        <div class="space-y-2">
          <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">Master Artisan Spotlight</span>
          <h2 class="font-serif text-3xl md:text-4xl">Loretta Rattos: Master Chandler</h2>
        </div>

        <div class="relative pl-6 border-l-2 border-gold-400 bg-white/20 dark:bg-luxe-gray/20 p-5 rounded-r-lg">
          <p class="font-serif italic text-base md:text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed font-light">
            "Every fragrance is a dialogue between memory and fire. My job is not just to melt wax, but to seal ancestral scents into vessels that illuminate your contemporary sanctuary."
          </p>
        </div>

        <div class="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
          <p>
            For four years, Loretta has studied the rare botanicals of East Africa and the Sub-Sahara. In her Nairobi atelier, she combines indigenous shea butter, desert sage, and wild-harvested resins with pure soy wax, creating candle blends that tell sensory stories of home.
          </p>
          <p>
            By supporting Loretta, you help fund her apprentice program, training young women in sustainable scent-crafting, keeping generational botanical wisdom alive.
          </p>
        </div>

        <button 
          @click="setView('curated')"
          class="px-8 py-3 bg-gold-600 hover:bg-gold-500 text-white font-mono uppercase text-xs tracking-widest rounded-md transition-all active:scale-95 shadow-md"
        >
          View Loretta's Creations
        </button>
      </div>

      <!-- Loretta Image Column -->
      <div class="lg:col-span-6">
        <div class="aspect-[4/5] rounded-lg overflow-hidden border border-gold-200/50 dark:border-gold-900/30 shadow-2xl">
          <img 
            :src="lorettaImage"
            alt="Loretta Rattos hand pouring candles"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

    <!-- Craft Stages Section -->
    <div class="bg-gold-50/40 dark:bg-luxe-gray/20 py-16">
      <div class="max-w-7xl mx-auto px-6 space-y-16">
        <div class="text-center space-y-3">
          <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">The Sourcing Philosophy</span>
          <h2 class="font-serif text-3xl md:text-4xl">The Process</h2>
          <div class="divider-pattern w-32 mx-auto"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 01 Source -->
          <div class="space-y-4 group">
            <div class="aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-gold-100 dark:border-gold-950">
              <img 
                :src="img1" 
                alt="Botanical Harvest" 
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="space-y-2">
              <span class="text-xs font-mono text-gold-600 dark:text-gold-400">01. THE SOURCE</span>
              <h3 class="font-serif text-lg font-semibold">Botanical Harvesting</h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                We partner with local small-scale women cooperatives in Mali and Benin to source pure shea butter, wild cold-pressed essential oils, and organic soy wax.
              </p>
            </div>
          </div>

          <!-- 02 Dye -->
          <div class="space-y-4 group">
            <div class="aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-gold-100 dark:border-gold-950">
              <img 
                :src="img2" 
                alt="Formulation and Blend" 
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="space-y-2">
              <span class="text-xs font-mono text-gold-600 dark:text-gold-400">02. THE SCENT</span>
              <h3 class="font-serif text-lg font-semibold">Scent Formulation</h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                Our signatures—wood ash, smoked amber, desert resin—are developed using generational recipes that speak of sunset rituals and sacred smoke.
              </p>
            </div>
          </div>

          <!-- 03 Finish -->
          <div class="space-y-4 group">
            <div class="aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-gold-100 dark:border-gold-950">
              <img 
                :src="img3" 
                alt="Clay vessels" 
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="space-y-2">
              <span class="text-xs font-mono text-gold-600 dark:text-gold-400">03. THE VESSEL</span>
              <h3 class="font-serif text-lg font-semibold">Hand-Turned Clay</h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                The clay chalices are hand-thrown in Foumban using iron-rich volcanic soils, then pit-fired to create smoke-stained organic patterns on every jar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Huge Manifesto Quote -->
    <div class="max-w-4xl mx-auto px-6 text-center space-y-6">
      <div class="divider-pattern w-48 mx-auto"></div>
      <p class="font-serif italic text-2xl md:text-3xl font-light leading-relaxed text-neutral-800 dark:text-neutral-100">
        "Luxury is the bridge between the hands that created it and the soul that recognizes its story."
      </p>
      <p class="text-[10px] font-mono tracking-[0.3em] uppercase text-gold-600 dark:text-gold-400">
        — THE HERITAGE MANIFESTO
      </p>
    </div>

    <!-- The Journey of a Masterpiece -->
    <div class="max-w-5xl mx-auto px-6 space-y-12">
      <div class="text-center space-y-2">
        <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">Validation of Provenance</span>
        <h2 class="font-serif text-2xl md:text-3xl">The Journey of a Masterpiece</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Step 1 -->
        <div class="space-y-3 p-6 rounded-lg bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10">
          <span class="inline-block p-2 bg-gold-100 dark:bg-gold-950 text-gold-600 dark:text-gold-400 rounded-md font-mono text-sm">
            01
          </span>
          <h3 class="font-serif text-base font-semibold">Scent Formulation Blueprint</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            Scent-smiths and herbalists select native botanicals and premium resins that honor the rich spiritual history of African aromatics.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="space-y-3 p-6 rounded-lg bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10">
          <span class="inline-block p-2 bg-gold-100 dark:bg-gold-950 text-gold-600 dark:text-gold-400 rounded-md font-mono text-sm">
            02
          </span>
          <h3 class="font-serif text-base font-semibold">The Small-Batch Pour</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            A quiet ritual of blessing marks the melting of wax, hand-poured in small batches to ensure precise wax-to-fragrance ratio.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="space-y-3 p-6 rounded-lg bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10">
          <span class="inline-block p-2 bg-gold-100 dark:bg-gold-950 text-gold-600 dark:text-gold-400 rounded-md font-mono text-sm">
            03
          </span>
          <h3 class="font-serif text-base font-semibold">Heritage Verification</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            Each unique vessel is hand-numbered by the master potter and candle maker, accompanied by a certificate of authenticity.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
