export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviews_count: number;
  featured: boolean;
};

export type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

export type CartItem = {
  id: number;
  quantity: number;
  product_id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
};

export type Order = {
  id: number;
  user_id: number;
  total: number;
  subtotal: number;
  shipping: number;
  status: string;
  payment_status?: string;
  is_demo?: boolean;
  payment_method: string;
  payment_id: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: string;
  items?: OrderItem[];
  user?: { name: string; email: string };
};

export type OrderItem = {
  product_name: string;
  price: number;
  quantity: number;
};

export type ShippingInput = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
};
