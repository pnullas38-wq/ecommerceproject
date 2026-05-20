import { getUserFromRequest } from '@/lib/auth';
import { getCartForUser } from '@/lib/orders';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function PATCH(request: Request, { params }: { params: { productId: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  const { quantity } = await request.json();
  const db = getSupabase();
  const { data: product } = await db.from('products').select('stock').eq('id', params.productId).maybeSingle();
  if (!product) return errorResponse('Product not found', 404);
  const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
  await db.from('cart_items').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', params.productId);
  return jsonResponse({ items: await getCartForUser(user.id) });
}

export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  const db = getSupabase();
  await db.from('cart_items').delete().eq('user_id', user.id).eq('product_id', params.productId);
  return jsonResponse({ items: await getCartForUser(user.id) });
}
