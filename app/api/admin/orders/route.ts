import { getUserFromRequest } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user?.is_admin) return errorResponse('Admin access required', 403);

  const db = getSupabase();
  const { data: orders, error } = await db.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return errorResponse(error.message, 500);

  const enriched = await Promise.all(
    (orders || []).map(async (o) => {
      const [{ data: items }, { data: customer }] = await Promise.all([
        db.from('order_items').select('product_name, price, quantity').eq('order_id', o.id),
        db.from('users').select('name, email').eq('id', o.user_id).single(),
      ]);
      return { ...o, items: items || [], user: customer };
    })
  );

  return jsonResponse({ orders: enriched });
}

export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user?.is_admin) return errorResponse('Admin access required', 403);

  const { orderId, status, paymentStatus } = await request.json();
  const db = getSupabase();
  const updates: Record<string, string> = {};
  if (status) updates.status = status;
  if (paymentStatus) updates.payment_status = paymentStatus;
  const { data, error } = await db.from('orders').update(updates).eq('id', orderId).select().single();
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ order: data });
}
