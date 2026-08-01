import { defineStore } from 'pinia';
import { ref, computed, nextTick, watch } from 'vue';
import { Product, Artisan, CartItem, ShippingDetails, DeliveryMethod, Order } from '../types';
import { supabase } from '../lib/supabase';
import img7 from '../../assets/img7.jpeg';
import img8 from '../../assets/img8.jpeg';
import img9 from '../../assets/img9.jpeg';
import img10 from '../../assets/img10.jpeg';
import img13 from '../../assets/img13.jpeg';
import img14 from '../../assets/img14.jpeg';
import vanilla from '../../assets/vanilla.jpeg';
import bubblegum from '../../assets/bubblegum.jpeg';
import caramel from '../../assets/caramel.jpeg';
import cubeCandles from '../../assets/cubecandles.jpeg';
import blueberry from '../../assets/blueberry.jpeg';
import sweetPassion from '../../assets/sweetpassion.jpeg';

export type AppView = 'home' | 'curated' | 'heritage' | 'profile' | 'cart' | 'checkout' | 'confirmation' | 'tracking';
type CollectionFilter = 'all' | Product['category'];

const productDisplayOrder = [
  'sunset-nairobi',
  'loomed-horizon',
  'savannah-dusk',
  'bogolan-throw',
  'royal-triptych'
];

const viewPaths: Record<AppView, string> = {
  home: '/',
  curated: '/collections',
  heritage: '/heritage',
  profile: '/profile',
  cart: '/bag',
  checkout: '/checkout',
  confirmation: '/order-confirmation',
  tracking: '/track-order',
};

const pathViews: Record<string, AppView> = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view as AppView])
) as Record<string, AppView>;

export const useHeritageStore = defineStore('heritageStore', () => {
  const savedShippingDetails = JSON.parse(sessionStorage.getItem('sage_shipping_details') || '{}') as Partial<ShippingDetails>;
  const cachedCatalogue = (() => {
    try {
      const value = JSON.parse(localStorage.getItem('sage_product_catalogue') || '{}') as Record<string, { price: number; isAvailable: boolean; imagePath?: string }>;
      return Object.values(value).every(item => Number.isFinite(item.price) && typeof item.isAvailable === 'boolean') ? value : {};
    } catch {
      return {};
    }
  })();
  // Theme state (Dark Mode)
  const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
  const authUser = ref<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const authReady = ref(false);
  const authMessage = ref<string | null>(null);
  let authSubscription: { unsubscribe: () => void } | null = null;

  const applyAuthenticatedUser = (user: typeof authUser.value) => {
    authUser.value = user;
    if (user?.email && !shippingDetails.value.email) shippingDetails.value.email = user.email;
  };

  const initAuth = async () => {
    const { data } = await supabase.auth.getUser();
    applyAuthenticatedUser(data.user);
    authReady.value = true;
    authSubscription?.unsubscribe();
    authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthenticatedUser(session?.user ?? null);
      authReady.value = true;
    }).data.subscription;
  };

  const destroyAuth = () => authSubscription?.unsubscribe();

  const signInWithGoogle = async () => {
    authMessage.value = null;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/profile` }
    });
    if (error) authMessage.value = error.message;
  };

  const sendMagicLink = async (email: string) => {
    authMessage.value = null;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/profile` }
    });
    authMessage.value = error ? error.message : 'Check your email for a secure sign-in link.';
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      shippingDetails.value = {
        firstName: '', lastName: '', email: '', phone: '', mpesaReference: '',
        address: '', city: '', postalCode: '', deliveryNotes: ''
      };
      await nextTick();
      sessionStorage.removeItem('sage_shipping_details');
    }
    authMessage.value = error ? error.message : null;
  };

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

  // Product presentation is local; prices and availability always come from Supabase
  // or its locally cached response while a fresh response is loading.
  const catalogueLoaded = ref(Object.keys(cachedCatalogue).length > 0);
  const products = ref<Product[]>([
    {
      id: 'sunset-nairobi',
      name: 'Ivory Vanilla',
      category: 'candles',
      price: 0,
      image: vanilla,
      description: 'Meet Ivory Vanilla — soft, warm & irresistibly addictive. A creamy vanilla scent wrapped in pure comfort. Think cozy nights, clean sheets, warm hugs, and that “what smells so good?” moment. Light it. Let the room glow. Let the scent linger.',
      cardDescription: 'Inspired by soft luxury, warm embraces, and the sweet comfort of vanilla.',
      collection: 'Scented Memories',
      tag: 'Ancient Rituals',
      details: [
        'Self-care',
        'Gifting',
        'Making everyday moments feel special'
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
      price: 0,
      image: bubblegum,
      description: 'Your childhood favorite just got a luxury upgrade. Meet Sweet Reverie Bubblegum — sweet, playful, and irresistibly nostalgic. One light and your space transforms into a candy-sweet dream. Think bubblegum, carefree moments, soft-girl energy, and the kind of scent that makes everyone ask: “Wait… what smells THAT good?”',
      cardDescription: 'Inspired by playful sweetness, carefree moments, and the nostalgic joy of bubblegum.',
      collection: 'Scented Memories',
      tag: 'Ancient Rituals',
      details: [
        'Girls’ nights & sleepovers',
        'Romanticizing your space',
        'Self-care Sundays',
        'Gifting your favorite sweet girl'
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
      price: 0,
      image: caramel,
      description: 'WARNING: Golden Caramel is dangerously addictive. Sweet, buttery caramel with a rich, cozy warmth that makes your space smell like pure indulgence. Imagine warm desserts, golden evenings, soft blankets, and that luxurious feeling of having everything just right.',
      cardDescription: 'Inspired by golden moments, warm sweetness, and irresistible caramel indulgence.',
      collection: 'Scented Memories',
      tag: 'Woven Memories',
      details: [
        'Treating yourself',
        'Gifting someone their new favorite scent',
        'Making your space unforgettable'
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
      price: 0,
      image: cubeCandles,
      description: 'Small candle. BIG personality. Meet our Mini Cute Cube Candle — tiny, adorable, and made to add the perfect little touch of luxury to any space. Whether you’re styling your bedside table, gifting your bestie, decorating your vanity, or simply treating yourself… this little cutie belongs in your collection.',
      collection: 'Scented Memories',
      tag: 'Decadent Scents',
      details: [
        'Cute displays',
        'Cozy moments',
        'Gifting loved ones'
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
      price: 0,
      image: sweetPassion,
      description: 'Meet Sunset Passion — where every sunset begins with a spark. Bold, warm, and captivating, Sunset Passion fills your space with an inviting aroma that lingers long after the flame is out. It’s the perfect scent for slowing down, unwinding, and embracing life’s beautiful moments. Whether you’re setting the mood for a cozy evening, enjoying a self-care ritual, or creating memories with loved ones, Sunset Passion is the finishing touch your space deserves.',
      collection: 'Scented Memories',
      tag: 'Coming Soon',
      details: [
        'Warm. Inviting. Unforgettable.',
        'A thoughtful gift for someone special—or yourself.',
        'Hand-poured with care by Sage Candle KE.'
      ],
      specifications: {
        'Weight': '250g',
        'Notes': 'Warm amber, soft spice, and sunset woods',
        'Origin': 'Nairobi, Kenya'
      },
      isAvailable: false
    },
    {
      id: 'royal-triptych',
      name: 'Midnight Blue',
      category: 'candles',
      price: 0,
      image: blueberry,
      description: 'Meet Midnight Blue — your new midnight obsession. Sweet, juicy blueberry wrapped in a deep, dreamy aroma that turns your space into a whole mood. Think late-night conversations, soft music, dim lights, and a little mystery.',
      collection: 'Scented Memories',
      tag: 'Decadent Scents',
      details: [
        'Deep & dreamy nights',
        'Setting the mood'
      ],
      specifications: {
        'Weight': '180g',
        'Notes': 'Juicy Blueberry, Midnight Amber, Soft Vanilla',
        'Origin': 'Mombasa, Kenya'
      },
      isAvailable: true
    },
    {
      id: 'beaded-choker',
      name: 'Solid Brass Candle Care Kit',
      category: 'pottery',
      price: 0,
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
      isAvailable: false,
      isVisible: false
    },
    {
      id: 'scribe-journal',
      name: 'Agadez Amber Travel Tin',
      category: 'textiles',
      price: 0,
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
      isAvailable: false,
      isVisible: false
    }
  ]);

  products.value.sort((a, b) => {
    const aIndex = productDisplayOrder.indexOf(a.id);
    const bIndex = productDisplayOrder.indexOf(b.id);
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

  if (catalogueLoaded.value) {
    products.value = products.value.map(product => {
      const cachedProduct = cachedCatalogue[product.id];
      return cachedProduct ? {
        ...product,
        ...cachedProduct,
        image: cachedProduct.imagePath ? supabase.storage.from('product-images').getPublicUrl(cachedProduct.imagePath).data.publicUrl : product.image
      } : { ...product, isAvailable: false };
    });
  }

  const loadProductPrices = async () => {
    const { data, error } = await supabase.from('products').select('id, price, is_active');
    if (error || !data) return;

    // This is intentionally a separate optional request while existing Supabase
    // projects apply the image-path migration. Prices and availability remain
    // available even before that migration has been run.
    const { data: imageRows } = await supabase.from('products').select('id, image_path');
    const imagePaths = new Map((imageRows || []).map(product => [product.id, product.image_path as string | null]));

    const catalogue = new Map(data.map(product => [product.id, {
      price: Number(product.price), isAvailable: product.is_active, imagePath: imagePaths.get(product.id) || undefined
    }]));
    products.value = products.value.map(product => {
      const databaseProduct = catalogue.get(product.id);
      return databaseProduct ? {
        ...product,
        ...databaseProduct,
        image: databaseProduct.imagePath ? supabase.storage.from('product-images').getPublicUrl(databaseProduct.imagePath).data.publicUrl : product.image
      } : { ...product, isAvailable: false };
    });
    localStorage.setItem('sage_product_catalogue', JSON.stringify(Object.fromEntries(
      data.map(product => [product.id, { price: Number(product.price), isAvailable: product.is_active, imagePath: imagePaths.get(product.id) || undefined }])
    )));
    cart.value = cart.value.filter(item => products.value.find(product => product.id === item.productId)?.isAvailable);
    catalogueLoaded.value = true;
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
    if (!catalogueLoaded.value || !products.value.find(product => product.id === productId)?.isAvailable) return;
    const existing = cart.value.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.value.push({ productId, quantity: qty });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!catalogueLoaded.value || !products.value.find(product => product.id === productId)?.isAvailable) return;
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
    if (!catalogueLoaded.value || cart.value.length === 0) return;

    const requiredFields: Array<[keyof ShippingDetails, string]> = [
      ['firstName', 'first name'], ['lastName', 'last name'], ['email', 'email address'],
      ['phone', 'phone number'], ['address', 'delivery address'], ['city', 'city']
    ];
    const missingFields = requiredFields.filter(([field]) => !shippingDetails.value[field].trim()).map(([, label]) => label);
    if (missingFields.length > 0) {
      orderError.value = `Please complete: ${missingFields.join(', ')}.`;
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(shippingDetails.value.email.trim()) || shippingDetails.value.phone.trim().length < 6) {
      orderError.value = 'Enter a valid email address and phone number.';
      return;
    }

    isSubmittingOrder.value = true;
    orderError.value = null;

    if (!/^[A-Z0-9]{10}$/.test(shippingDetails.value.mpesaReference.trim().toUpperCase())) {
      orderError.value = 'Enter a valid 10-character M-Pesa reference code.';
      isSubmittingOrder.value = false;
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/orders/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      },
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
    authUser,
    authReady,
    authMessage,
    initAuth,
    destroyAuth,
    signInWithGoogle,
    sendMagicLink,
    signOut,
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
    catalogueLoaded,
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
    placeOrder
  };
});
