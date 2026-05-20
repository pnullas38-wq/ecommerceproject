import { getSupabase } from './supabase';
import type { CartItem, ShippingInput } from './types';

import { calcShipping } from './utils';

export { calcShipping };

export async function getCartForUser(userId: number): Promise<CartItem[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from('cart_items')
    .select('id, quantity, product_id, products ( id, name, price, image, stock, category )')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return (data || []).map((row: Record<string, unknown>) => {
    const p = (row.products || {}) as Record<string, unknown>;
    return {
      id: row.id as number,
      quantity: row.quantity as number,
      product_id: (row.product_id || p.id) as number,
      name: p.name as string,
      price: Number(p.price),
      image: p.image as string,
      stock: p.stock as number,
      category: p.category as string,
    };
  });
}

export type CreateOrderOptions = {
  paymentMethod: string;
  paymentId?: string | null;
  status?: string;
  paymentStatus?: string;
  isDemo?: boolean;
  skipStockUpdate?: boolean;
};

export async function createOrderFromCart(
  userId: number,
  shipping: ShippingInput,
  options: CreateOrderOptions
) {
  const {
    paymentMethod,
    paymentId = null,
    status = 'awaiting_payment',
    paymentStatus = 'unpaid',
    isDemo = false,
    skipStockUpdate = false,
  } = options;
  const items = await getCartForUser(userId);
  if (!items.length) throw new Error('Cart is empty');

  for (const item of items) {
    if (item.quantity > item.stock) {
      throw new Error(`Only ${item.stock} left for ${item.name}`);
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = calcShipping(subtotal);
  const total = subtotal + shippingCost;
  const db = getSupabase();

  const baseRow = {
    user_id: userId,
    total,
    subtotal,
    shipping: shippingCost,
    status,
    payment_method: paymentMethod,
    payment_id: paymentId,
    shipping_name: shipping.shippingName.trim(),
    shipping_phone: shipping.shippingPhone.trim(),
    shipping_address: shipping.shippingAddress.trim(),
    shipping_city: shipping.shippingCity.trim(),
    shipping_state: shipping.shippingState.trim(),
    shipping_pincode: shipping.shippingPincode.trim(),
  };

  let order;
  let orderErr;
  ({ data: order, error: orderErr } = await db
    .from('orders')
    .insert({ ...baseRow, payment_status: paymentStatus, is_demo: isDemo })
    .select()
    .single());

  if (orderErr?.message?.includes('payment_status') || orderErr?.message?.includes('is_demo')) {
    ({ data: order, error: orderErr } = await db.from('orders').insert(baseRow).select().single());
  }

  if (orderErr || !order) throw new Error(orderErr?.message || 'Could not create order');

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    product_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));

  const { error: itemsErr } = await db.from('order_items').insert(orderItems);
  if (itemsErr) throw new Error(itemsErr.message);

  if (!skipStockUpdate && !isDemo) {
    for (const item of items) {
      const { data: product } = await db.from('products').select('stock').eq('id', item.product_id).single();
      if (product) {
        await db
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.product_id);
      }
    }
  }

  await db.from('cart_items').delete().eq('user_id', userId);

  return { order, items };
}
