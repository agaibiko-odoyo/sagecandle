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
import vanilla from '../../assets/vanilla.jpeg';
import bubblegum from '../../assets/bubblegum.jpeg';
import caramel from '../../assets/caramel.jpeg';
import cubeCandles from '../../assets/cubecandles.jpeg';

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
  const savedShippingDetails = JSON.parse(sessionStorage.getItem('sage_shipping_details') || '{}') as Partial<ShippingDetails>;
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
    selectedProduct.value = productId ? products.value.find(product => product.id === productId && product.isAvailable) || null : null;
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

  const openProduct = (product: Product) => {
    if (!product.isAvailable) return;
    navigateTo(activeView.value, { filter: collectionFilter.value, productId: product.id });
  };

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
    firstName: savedShippingDetails.firstName || '',
    lastName: savedShippingDetails.lastName || '',
    email: savedShippingDetails.email || '',
    phone: savedShippingDetails.phone || '',
    mpesaReference: '',
    address: savedShippingDetails.address || '',
    city: savedShippingDetails.city || '',
    postalCode: savedShippingDetails.postalCode || '',
    deliveryNotes: savedShippingDetails.deliveryNotes || ''
  });
  
  const deliveryMethods = ref<DeliveryMethod[]>([
    { id: 'standard', name: 'Standard Heritage Courier', cost: 15.00, time: '3-5 Business Days' },
    { id: 'express', name: 'Express Boutique Delivery', cost: 45.00, time: 'Next Day Delivery' }
  ]);

  watch(shippingDetails, details => {
    const { mpesaReference: _mpesaReference, ...detailsToCache } = details;
    sessionStorage.setItem('sage_shipping_details', JSON.stringify(detailsToCache));
  }, { deep: true });
  const selectedDeliveryMethodId = ref<string>('standard');
  const selectedDeliveryMethod = computed(() => {
    return deliveryMethods.value.find(m => m.id === selectedDeliveryMethodId.value) || deliveryMethods.value[0];
  });

  // Order Confirmation placeholder
  const activeOrder = ref<Order | null>(null);
  const orderHistory = ref<Order[]>([]);
  const trackedOrder = ref<Order | null>(null);

  // Remove delivery details saved by earlier versions of the app.
  localStorage.removeItem('activeOrder');
  localStorage.removeItem('orderHistory');
  localStorage.removeItem('trackedOrder');

  // Static Products Database
  const products = ref<Product[]>([
    {
      id: 'sunset-nairobi',
      name: 'Ivory Vanilla',
      category: 'candles',
      price: 85.00,
      image: vanilla,
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
      isNew: true,
      isAvailable: true
    },
    {
      id: 'savannah-dusk',
      name: 'Sweet Reverie',
      category: 'candles',
      price: 88.00,
      image: bubblegum,
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
      },
      isAvailable: true
    },
    {
      id: 'loomed-horizon',
      name: 'Golden Caramel',
      category: 'candles',
      price: 95.00,
      image: caramel,
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
      isNew: true,
      isAvailable: true
    },
    {
      id: 'bogolan-throw',
      name: 'Mini Cute Cube Candle',
      category: 'candles',
      price: 950.00,
      image: cubeCandles,
      description: 'A blend of bubblegum and vanilla scents, to bring out the extra joy on bright sunny days.',
      collection: 'Scented Memories',
      tag: 'Decadent Scents',
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
      },
      isAvailable: false
    },
    {
      id: 'sculpted-vase',
      name: 'Sunset Passion',
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
      },
      isAvailable: false
    },
    {
      id: 'royal-triptych',
      name: 'Quiet Woods',
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
      },
      isAvailable: false
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
      },
      isAvailable: false
    },
    {
      id: 'scribe-journal',
      name: 'Agadez Amber Travel Tin',
      category: 'textiles',
      price: 38.00,
      image: img7,
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
      },
      isAvailable: false
    }
  ]);

  const loadProductPrices = async () => {
    const { data, error } = await supabase.from('products').select('id, price, is_active');
    if (error || !data) return;

    const catalogue = new Map(data.map(product => [product.id, { price: Number(product.price), isAvailable: product.is_active }]));
    products.value = products.value.map(product => {
      const databaseProduct = catalogue.get(product.id);
      return databaseProduct ? { ...product, ...databaseProduct } : { ...product, isAvailable: false };
    });
  };

  // Cart State loaded from localStorage
  const cart = ref<CartItem[]>(
    JSON.parse(localStorage.getItem('cart') || '[]')
  );

  cart.value = cart.value.filter(item => products.value.find(product => product.id === item.productId)?.isAvailable);

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
    if (!products.value.find(product => product.id === productId)?.isAvailable) return;
    const existing = cart.value.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.value.push({ productId, quantity: qty });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!products.value.find(product => product.id === productId)?.isAvailable) return;
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
  const paymentStatus = ref<'idle' | 'pending' | 'paid' | 'failed'>(
    sessionStorage.getItem('sage_order_token') ? 'pending' : 'idle'
  );
  const paymentMessage = ref('');
  const orderAccessToken = ref<string | null>(sessionStorage.getItem('sage_order_token'));
  let paymentPollingId: number | null = null;

  watch(orderAccessToken, token => {
    if (token) sessionStorage.setItem('sage_order_token', token);
    else sessionStorage.removeItem('sage_order_token');
  });

  const stopPaymentStatusPolling = () => {
    if (paymentPollingId !== null) window.clearInterval(paymentPollingId);
    paymentPollingId = null;
  };

  const checkPaymentStatus = async () => {
    if (!orderAccessToken.value || paymentStatus.value !== 'pending') return;
    const response = await fetch(`/api/mpesa/status?token=${encodeURIComponent(orderAccessToken.value)}`);
    if (!response.ok) return;
    const result = await response.json();
    if (result.status === 'pending' || result.status === 'initiated' || result.status === 'awaiting_confirmation') return;

    paymentStatus.value = result.status === 'paid' ? 'paid' : 'failed';
    paymentMessage.value = result.result_description || (result.status === 'paid' ? 'Payment received.' : 'Payment was not completed.');
    orderAccessToken.value = null;
    stopPaymentStatusPolling();

    if (result.status === 'paid') {
      if (activeOrder.value && !orderHistory.value.some(order => order.id === activeOrder.value?.id)) {
        orderHistory.value.unshift(activeOrder.value);
      }
      clearCart();
    }
  };

  const startPaymentStatusPolling = () => {
    stopPaymentStatusPolling();
    void checkPaymentStatus();
    if (paymentStatus.value === 'pending') paymentPollingId = window.setInterval(() => void checkPaymentStatus(), 3000);
  };

  const placeOrder = async () => {
    if (cart.value.length === 0) return;

    if (!shippingDetails.value.firstName.trim() || !shippingDetails.value.lastName.trim() || !shippingDetails.value.address.trim() || !shippingDetails.value.city.trim() || !/^\S+@\S+\.\S+$/.test(shippingDetails.value.email.trim()) || shippingDetails.value.phone.trim().length < 6) {
      orderError.value = 'Please complete your name, email, phone number, and delivery address.';
      return;
    }

    isSubmittingOrder.value = true;
    orderError.value = null;

    if (!/^[A-Z0-9]{10}$/.test(shippingDetails.value.mpesaReference.trim().toUpperCase())) {
      orderError.value = 'Enter a valid 10-character M-Pesa reference code.';
      isSubmittingOrder.value = false;
      return;
    }

    const response = await fetch('/api/orders/submit', {
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
    paymentStatus.value = 'pending';
    paymentMessage.value = result.message || 'Your order is awaiting manual payment confirmation.';
    orderAccessToken.value = result.orderAccessToken;
    clearCart();
    shippingDetails.value.mpesaReference = '';
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
    paymentStatus,
    paymentMessage,
    startPaymentStatusPolling,
    stopPaymentStatusPolling,
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
