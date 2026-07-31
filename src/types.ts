export interface Product {
  id: string;
  name: string;
  category: 'candles' | 'textiles' | 'pottery';
  price: number;
  image: string;
  description: string;
  collection: string;
  tag: string;
  details: string[];
  specifications: Record<string, string>;
  isNew?: boolean;
  isAvailable: boolean;
}

export interface Artisan {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  story: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  mpesaReference: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryNotes: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  cost: number;
  time: string;
}

export interface Order {
  id: string;
  date: string;
  items: { product: Product; quantity: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingDetails: ShippingDetails;
  deliveryMethod: DeliveryMethod;
  paymentMethod: 'card' | 'mobile_pay';
}
