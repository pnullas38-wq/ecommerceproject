import { getUserFromRequest } from '@/lib/auth';
import { getCartForUser } from '@/lib/orders';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  try {
    const items = await getCartForUser(user.id);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return jsonResponse({ items, subtotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  try {
    const { productId, quantity = 1 } = await request.json();
    const db = getSupabase();
    const { data: product } = await db.from('products').select('id, stock').eq('id', productId).maybeSingle();
    if (!product) return errorResponse('Product not found', 404);

    const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
    const { data: existing } = await db
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, product.stock);
      await db.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
    } else {
      await db.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: qty });
    }

    const items = await getCartForUser(user.id);
    return jsonResponse({ items, message: 'Added to cart' });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  const db = getSupabase();
  await db.from('cart_items').delete().eq('user_id', user.id);
  return jsonResponse({ items: [] });
}
