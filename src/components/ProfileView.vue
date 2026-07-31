<script setup lang="ts">
import { ref } from 'vue';
import { useHeritageStore } from '../stores/heritageStore';
import { User, MapPin, ClipboardList, CheckCircle } from 'lucide-vue-next';

const store = useHeritageStore();

const isEditingAddress = ref(false);

const tempShipping = ref({
  firstName: store.shippingDetails.firstName,
  lastName: store.shippingDetails.lastName,
  email: store.shippingDetails.email,
  mpesaReference: store.shippingDetails.mpesaReference,
  address: store.shippingDetails.address,
  city: store.shippingDetails.city,
  postalCode: store.shippingDetails.postalCode,
  deliveryNotes: store.shippingDetails.deliveryNotes
});

const saveAddress = () => {
  store.shippingDetails = { ...tempShipping.value };
  isEditingAddress.value = false;
};

const cancelEdit = () => {
  tempShipping.value = { ...store.shippingDetails };
  isEditingAddress.value = false;
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8 space-y-12 pb-24">
    <!-- Header -->
    <div class="border-b border-gold-200/40 dark:border-gold-900/30 pb-6 space-y-2">
      <span class="text-xs font-mono tracking-widest uppercase text-gold-600 dark:text-gold-400">Atelier Membership</span>
      <h1 class="font-serif text-3xl font-light">Your Profile</h1>
    </div>

    <!-- Profile Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Member Identity Card -->
      <div class="md:col-span-1 bg-white dark:bg-luxe-gray border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg text-center space-y-4 shadow-sm">
        <div class="relative mx-auto h-24 w-24 rounded-full border-2 border-gold-400 overflow-hidden bg-gold-50/50 flex items-center justify-center text-gold-600">
          <User class="h-12 w-12" />
        </div>
        <div class="space-y-1">
          <h2 class="font-serif text-lg font-semibold">{{ store.shippingDetails.firstName }} {{ store.shippingDetails.lastName }}</h2>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 font-mono">Member Since Oct 2023</p>
          <span class="inline-block mt-2 text-[9px] font-mono tracking-widest bg-gold-100 dark:bg-gold-950/40 text-gold-700 dark:text-gold-400 px-2.5 py-1 rounded-full uppercase">
            Gold Patron
          </span>
        </div>
      </div>

      <!-- Settings & History -->
      <div class="md:col-span-2 space-y-8">
        
        <!-- Shipping defaults (Allows pre-filling checkout!) -->
        <div class="bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg space-y-4 shadow-sm">
          <div class="flex items-center justify-between border-b border-gold-100/40 dark:border-gold-950/20 pb-3">
            <div class="flex items-center gap-3">
              <MapPin class="h-5 w-5 text-[#E9C349]" />
              <h3 class="font-serif text-base font-semibold">Saved Shipping Address</h3>
            </div>
            <button 
              v-if="!isEditingAddress"
              @click="isEditingAddress = true"
              class="text-xs font-mono tracking-widest text-gold-700 dark:text-gold-400 uppercase hover:text-gold-500"
            >
              Edit Address
            </button>
          </div>

          <!-- Read-only address state -->
          <div v-if="!isEditingAddress" class="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            <p class="font-serif font-semibold text-neutral-800 dark:text-neutral-200">
              {{ store.shippingDetails.firstName }} {{ store.shippingDetails.lastName }}
            </p>
            <p>{{ store.shippingDetails.address }}</p>
            <p>{{ store.shippingDetails.city }}</p>
            <p class="font-mono">Zip/Postal: {{ store.shippingDetails.postalCode }}</p>
          </div>

          <!-- Edit address state -->
          <form v-else @submit.prevent="saveAddress" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">First Name</label>
              <input 
                v-model="tempShipping.firstName" 
                type="text" 
                class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs" 
                required 
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">Last Name</label>
              <input 
                v-model="tempShipping.lastName" 
                type="text" 
                class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs" 
                required 
              />
            </div>
            <div class="sm:col-span-2 space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">M-Pesa Reference Code</label>
              <input v-model="tempShipping.mpesaReference" type="text" maxlength="10" class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs uppercase" />
            </div>
            <div class="sm:col-span-2 space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">Email Address</label>
              <input v-model="tempShipping.email" type="email" class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs" required />
            </div>
            <div class="sm:col-span-2 space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">Street Address</label>
              <input 
                v-model="tempShipping.address" 
                type="text" 
                class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs" 
                required 
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">City</label>
              <input 
                v-model="tempShipping.city" 
                type="text" 
                class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs" 
                required 
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase text-neutral-400">Postal Code</label>
              <input 
                v-model="tempShipping.postalCode" 
                type="text" 
                class="w-full px-3 py-2 border border-gold-200 dark:border-gold-800 rounded bg-transparent text-xs" 
                required 
              />
            </div>
            
            <div class="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                @click="cancelEdit"
                class="px-4 py-2 border border-gold-300 dark:border-gold-800 text-xs font-mono rounded uppercase"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-gold-600 text-white text-xs font-mono rounded uppercase hover:bg-gold-500 shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        <!-- Orders History List -->
        <div class="bg-white/40 dark:bg-luxe-gray/40 border border-gold-200/30 dark:border-gold-900/10 p-6 rounded-lg space-y-4 shadow-sm">
          <div class="flex items-center gap-3 border-b border-gold-100/40 dark:border-gold-950/20 pb-3">
            <ClipboardList class="h-5 w-5 text-[#E9C349]" />
            <h3 class="font-serif text-base font-semibold">Your Historic Orders</h3>
          </div>

          <!-- Empty Order History -->
          <div 
            v-if="store.orderHistory.length === 0" 
            class="text-center py-8 space-y-2"
          >
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              No orders placed yet. Your heirloom selections will appear here.
            </p>
          </div>

          <!-- Populated Order History -->
          <div v-else class="space-y-4">
            <div 
              v-for="order in store.orderHistory" 
              :key="order.id"
              class="border border-gold-100 dark:border-gold-950 rounded-md p-4 space-y-3"
            >
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-gold-700 dark:text-gold-400 font-semibold">{{ order.id }}</span>
                <span class="text-neutral-400">{{ order.date }}</span>
              </div>
              
              <div class="divider-pattern w-full"></div>

              <!-- Mini Item list -->
              <div class="space-y-2">
                <div 
                  v-for="(item, i) in order.items" 
                  :key="i"
                  class="flex items-center justify-between text-xs"
                >
                  <span class="text-neutral-600 dark:text-neutral-300 font-sans">
                    {{ item.product.name }} <span class="text-[10px] font-mono text-neutral-400">x{{ item.quantity }}</span>
                  </span>
                  <span class="font-mono">${{ (item.product.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-gold-100/30 dark:border-gold-950/10">
                <div class="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600">
                  <CheckCircle class="h-3.5 w-3.5 shrink-0" />
                  <span>Handcrafted packing</span>
                </div>
                <div class="text-xs font-mono">
                  Total: <span class="font-bold">${{ order.total.toFixed(2) }}</span>
                </div>
              </div>
              <button
                @click="store.trackOrder(order)"
                class="w-full border border-gold-300 dark:border-gold-800 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-gold-700 dark:text-gold-400 transition-colors hover:bg-gold-50 dark:hover:bg-gold-950/20"
              >
                Track shipment
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
