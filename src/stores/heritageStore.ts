import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { Product, Artisan, CartItem, ShippingDetails, DeliveryMethod, Order } from '../types';
import { supabase } from '../lib/supabase';
import img7 from '../../assets/img7.jpeg';
import img8 from '../../assets/img8.jpeg';
import img9 from '../../assets/img9.jpeg';
import img10 from '../../assets/img10.jpeg';
import img11 from '../../assets/img11.jpeg';
import img12 from '../../assets/img12.jpeg';
import img13 from '../../assets/img13.jpeg';
import img14 from '../../assets/img14.jpeg';

export type AppView = 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation' | 'tracking' | 'shipment';
type CollectionFilter = 'all' | Product['category'];

const viewPaths: Record<AppView, string> = {
  home: '/',
  curated: '/collections',
  heritage: '/heritage',
  profile: '/profile',
  cart: '/bag',
  checkout: '/checkout',
  confirmation: '/order-confirmation',
  tracking: '/track-order',
  shipment: '/shipment-status'
};

const pathViews: Record<string, AppView> = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view as AppView])
) as Record<string, AppView>;

export const useHeritageStore = defineStore('heritageStore', () => {
  // Theme state (Dark Mode)
  const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize theme class on store load
  const initTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Active View / Navigation State
  const activeView = ref<AppView>('home');
  const selectedProduct = ref<Product | null>(null);
  const collectionFilter = ref<CollectionFilter>('all');

  const applyLocation = () => {
    const url = new URL(window.location.href);
    const view = pathViews[url.pathname] || 'home';
    const filter = url.searchParams.get('filter');
    const productId = url.searchParams.get('product');

    activeView.value = view;
    collectionFilter.value = filter === 'candles' || filter === 'textiles' || filter === 'pottery' ? filter : 'all';
    selectedProduct.value = productId ? products.value.find(product => product.id === productId) || null : null;
  };

  const navigationState = () => window.history.state as { sageCandle?: true; index?: number } | null;

  const navigateTo = (
    view: AppView,
    options: { filter?: CollectionFilter; productId?: string; replace?: boolean } = {}
  ) => {
    const url = new URL(viewPaths[view], window.location.origin);
    if (view === 'curated' && options.filter && options.filter !== 'all') url.searchParams.set('filter', options.filter);
    if (options.productId) url.searchParams.set('product', options.productId);

    const currentIndex = navigationState()?.index ?? 0;
    const state = { sageCandle: true as const, index: options.replace ? currentIndex : currentIndex + 1 };
    window.history[options.replace ? 'replaceState' : 'pushState'](state, '', `${url.pathname}${url.search}`);
    applyLocation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: Product) => navigateTo(activeView.value, {
    filter: collectionFilter.value,
    productId: product.id
  });

  const closeProduct = () => {
    if (!selectedProduct.value) return;
    if ((navigationState()?.index ?? 0) > 0) {
      window.history.back();
      return;
    }
    navigateTo(activeView.value, { filter: collectionFilter.value, replace: true });
  };

  const initNavigation = () => {
    if (!navigationState()?.sageCandle) {
      window.history.replaceState({ sageCandle: true, index: 0 }, '', window.location.href);
    }
    applyLocation();
    window.addEventListener('popstate', applyLocation);
  };

  const destroyNavigation = () => window.removeEventListener('popstate', applyLocation);
  
  // Checkout Multi-step State
  const checkoutStep = ref<number>(1);
  const shippingDetails = ref<ShippingDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryNotes: ''
  });
  
  const deliveryMethods = ref<DeliveryMethod[]>([
    { id: 'standard', name: 'Standard Heritage Courier', cost: 15.00, time: '3-5 Business Days' },
    { id: 'express', name: 'Express Boutique Delivery', cost: 45.00, time: 'Next Day Delivery' }
  ]);
  const selectedDeliveryMethodId = ref<string>('standard');
  const selectedDeliveryMethod = computed(() => {
    return deliveryMethods.value.find(m => m.id === selectedDeliveryMethodId.value) || deliveryMethods.value[0];
  });

  // Order Confirmation placeholder
  const activeOrder = ref<Order | null>(JSON.parse(localStorage.getItem('activeOrder') || 'null'));
  const orderHistory = ref<Order[]>(JSON.parse(localStorage.getItem('orderHistory') || '[]'));
  const trackedOrder = ref<Order | null>(JSON.parse(localStorage.getItem('trackedOrder') || 'null'));

  watch(activeOrder, (order) => localStorage.setItem('activeOrder', JSON.stringify(order)), { deep: true });
  watch(orderHistory, (orders) => localStorage.setItem('orderHistory', JSON.stringify(orders)), { deep: true });
  watch(trackedOrder, (order) => localStorage.setItem('trackedOrder', JSON.stringify(order)), { deep: true });

  // Static Products Database
  const products = ref<Product[]>([
    {
      id: 'sunset-nairobi',
      name: 'Sunset in Nairobi',
      category: 'candles',
      price: 85.00,
      image: img7,
      description: 'Scented Artisanal Candle inspired by the warm evening sun setting over the Nairobi. Hand-poured with natural soy wax and local botanicals.',
      collection: 'Scented Memories',
      tag: 'Ancient Rituals',
      details: [
        'Burn time: 60 hours',
        '100% natural soy wax',
        'Hand-crafted terracotta vessel',
        'Lead-free natural cotton wick'
      ],
      specifications: {
        'Weight': '250g',
        'Notes': 'Ochred Amber, Bergamot, Shea, Sandalwood',
        'Origin': 'Nairobi, Kenya'
      },
      isNew: true
    },
    {
      id: 'savannah-dusk',
      name: 'The Savannah Dusk',
      category: 'candles',
      price: 88.00,
      image: img8,
      description: 'Rich sandalwood and rare baobab wood fusion that creates a peaceful dusk sanctuary in your home. Hand-poured by women cooperatives.',
      collection: 'Scented Memories',
      tag: 'Ancient Rituals',
      details: [
        'Burn time: 55 hours',
        'Infused with rare essential oils',
        'Matte black blown-glass vessel',
        'Wooden crackling wick'
      ],
      specifications: {
        'Weight': '220g',
        'Notes': 'Baobab wood, Sandalwood, Clove, Orange',
        'Origin': 'Kisumu, Kenya'
      }
    },
    {
      id: 'loomed-horizon',
      name: 'Loomed Linen & Amber',
      category: 'candles',
      price: 95.00,
      image: img9,
      description: 'A luxury scented soy candle that evokes the peaceful breeze over the Mombasa. Hand-poured into a premium ceramic jar inspired by traditional loom patterns.',
      collection: 'Scented Memories',
      tag: 'Woven Memories',
      details: [
        'Burn time: 70 hours',
        '100% natural soy & coconut wax',
        'Woven cotton double wick for even burn',
        'Premium container inspired by hand-loomed fibers'
      ],
      specifications: {
        'Weight': '300g',
        'Notes': 'Loomed Cotton, Amber, Wild Sage, Bergamot',
        'Origin': 'Nairobi, Kenya'
      },
      isNew: true
    },
    {
      id: 'bogolan-throw',
      name: 'Bogolan Smoked Oud',
      category: 'candles',
      price: 98.00,
      image: img10,
      description: 'A deeply aromatic candle featuring smoked wood, desert sage, and rich resins. Inspired by the earth-baked protection symbols of West African Bogolan art.',
      collection: 'Scented Memories',
      tag: 'Smoked Wood',
      details: [
        'Burn time: 65 hours',
        'Hand-painted clay reusable jar',
        'All-natural plant-based wax formulation',
        'Whispering wood crackle wick'
      ],
      specifications: {
        'Weight': '280g',
        'Notes': 'Smoked Oud, Vetiver, Dry Sage, Sandalwood',
        'Origin': 'Mombasa, Kenya'
      }
    },
    {
      id: 'sculpted-vase',
      name: 'Artisan Clay Candle Vessel',
      category: 'pottery',
      price: 125.00,
      image: img11,
      description: 'A stunning hand-turned clay vessel designed to hold our Signature candles. Coated with organic resin and pit-fired to create beautiful, smoky textures.',
      collection: 'Vessel Pottery',
      tag: 'Artisan Accessories',
      details: [
        'Hand-harvested volcanic clay',
        'Satin-matte natural charcoal finish',
        'Waterproof inner glazing',
        'Fits all standard 250g-300g candle jars'
      ],
      specifications: {
        'Height': '14cm',
        'Diameter': '12cm',
        'Material': 'Pit-Fired Volcanic Clay',
        'Origin': 'Nairobi, Kenya'
      }
    },
    {
      id: 'royal-triptych',
      name: 'Cacao & Spiced Honey Candle',
      category: 'textiles',
      price: 75.00,
      image: img12,
      description: 'A decadent candle featuring single-origin dark cacao, wild honey, and warm indigenous spices. Hand-poured into a gorgeous amber glass jar.',
      collection: 'Aromatic Travel Tins',
      tag: 'Decadent Scents',
      details: [
        'Burn time: 45 hours',
        'Natural soy wax blend',
        'Hand-polished premium glass',
        'Lead-free natural cotton wick'
      ],
      specifications: {
        'Weight': '180g',
        'Notes': 'Dark Cacao, Wild Honey, Grains of Paradise, Cloves',
        'Origin': 'Mombasa, Kenya'
      }
    },
    {
      id: 'beaded-choker',
      name: 'Solid Brass Candle Care Kit',
      category: 'pottery',
      price: 75.00,
      image: img13,
      description: 'A handcrafted solid brass wick trimmer and snuffer set to care for your luxury candle flames. Enhances burn quality and keeps vessels clean.',
      collection: 'Vessel Pottery',
      tag: 'Candle Care',
      details: [
        'Recycled sand-cast brass tools',
        'Includes wick trimmer & candle snuffer',
        'Presented in an organic linen pouch',
        'Hand-crafted by generational metal artisans'
      ],
      specifications: {
        'Trimmer Length': '18cm',
        'Snuffer Length': '21cm',
        'Material': '100% Solid Sand-Cast Brass',
        'Origin': 'Kisumu, Kenya'
      }
    },
    {
      id: 'scribe-journal',
      name: 'Agadez Amber Travel Tin',
      category: 'textiles',
      price: 38.00,
      image: img14,
      description: 'A compact travel-ready scented candle in a hand-hammered brass tin. Scented with warm desert amber, wood ash, and sweet frankincense.',
      collection: 'Aromatic Travel Tins',
      tag: 'Travel Tins',
      details: [
        'Burn time: 30 hours',
        'Hand-hammered reusable brass container',
        'Lid included for secure transit',
        'Organic cotton wick'
      ],
      specifications: {
        'Weight': '120g',
        'Notes': 'Desert Amber, Wood Ash, Frankincense, Cardamom',
        'Origin': 'Nairobi, Kenya'
      }
    }
  ]);

  const loadProductPrices = async () => {
    const { data, error } = await supabase.from('products').select('id, price');
    if (error || !data) return;

    const prices = new Map(data.map(product => [product.id, Number(product.price)]));
    products.value = products.value.map(product => {
      const price = prices.get(product.id);
      return price === undefined ? product : { ...product, price };
    });
  };

  // Cart State loaded from localStorage
  const cart = ref<CartItem[]>(
    JSON.parse(localStorage.getItem('cart') || '[]')
  );

  // Sync cart to localStorage
  watch(cart, (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
  }, { deep: true });

  const cartDetailedItems = computed(() => {
    return cart.value.map(item => {
      const p = products.value.find(prod => prod.id === item.productId);
      return {
        product: p!,
        quantity: item.quantity
      };
    }).filter(item => item.product !== undefined);
  });

  const cartTotalItems = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const cartSubtotal = computed(() => {
    return cartDetailedItems.value.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
  });

  const cartTotal = computed(() => {
    return cartSubtotal.value + selectedDeliveryMethod.value.cost;
  });

  // Actions
  const addToCart = (productId: string, qty: number = 1) => {
    const existing = cart.value.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.value.push({ productId, quantity: qty });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const existing = cart.value.find(item => item.productId === productId);
    if (existing) {
      existing.quantity = Math.max(1, quantity);
    }
  };

  const removeFromCart = (productId: string) => {
    cart.value = cart.value.filter(item => item.productId !== productId);
  };

  const clearCart = () => {
    cart.value = [];
  };

  const trackOrder = (order?: Order | null) => {
    trackedOrder.value = order ?? activeOrder.value ?? orderHistory.value[0] ?? null;
    navigateTo('tracking');
  };

  const viewShipment = () => navigateTo('shipment');

  const isSubmittingOrder = ref(false);
  const orderError = ref<string | null>(null);

  const placeOrder = async () => {
    if (cart.value.length === 0) return;

    if (!shippingDetails.value.firstName.trim() || !shippingDetails.value.lastName.trim() || !shippingDetails.value.address.trim() || !shippingDetails.value.city.trim()) {
      orderError.value = 'Please complete your name and delivery address.';
      return;
    }

    isSubmittingOrder.value = true;
    orderError.value = null;

    if (!shippingDetails.value.phone.trim()) {
      orderError.value = 'Enter the M-Pesa number you want to pay with.';
      isSubmittingOrder.value = false;
      return;
    }

    const response = await fetch('/api/mpesa/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingDetails: shippingDetails.value,
        deliveryMethodId: selectedDeliveryMethodId.value,
        items: cart.value
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.orderId) {
      orderError.value = result.error || 'We could not start the M-Pesa payment. Please try again.';
      isSubmittingOrder.value = false;
      return;
    }

    const orderId = result.orderId;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);

    const newOrder: Order = {
      id: orderId,
      date: dateStr,
      items: [...cartDetailedItems.value],
      subtotal: cartSubtotal.value,
      shippingCost: selectedDeliveryMethod.value.cost,
      total: cartTotal.value,
      shippingDetails: { ...shippingDetails.value },
      deliveryMethod: { ...selectedDeliveryMethod.value },
      paymentMethod: 'mobile_pay'
    };

    activeOrder.value = newOrder;
    orderHistory.value.unshift(newOrder);
    
    // Clear cart and record confirmation as a browser navigation.
    clearCart();
    navigateTo('confirmation');
    checkoutStep.value = 1;
    isSubmittingOrder.value = false;
  };

  return {
    isDarkMode,
    toggleDarkMode,
    initTheme,
    activeView,
    selectedProduct,
    collectionFilter,
    navigateTo,
    openProduct,
    closeProduct,
    initNavigation,
    destroyNavigation,
    checkoutStep,
    shippingDetails,
    deliveryMethods,
    selectedDeliveryMethodId,
    selectedDeliveryMethod,
    isSubmittingOrder,
    orderError,
    activeOrder,
    orderHistory,
    trackedOrder,
    products,
    loadProductPrices,
    cart,
    cartDetailedItems,
    cartTotalItems,
    cartSubtotal,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    trackOrder,
    viewShipment,
    placeOrder
  };
});
