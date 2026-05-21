import { getUserFromRequest } from '@/lib/auth';
import { notifyOwnerNewOrder } from '@/lib/email';
import { createOrderFromCart } from '@/lib/orders';
import { buildPaymentMethodField, type PaymentMethodId } from '@/lib/payment-methods';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

const VALID_METHODS = ['demo', 'phonepe', 'googlepay', 'cod', 'upi_other'] as const;

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  const db = getSupabase();
  const { data: orders, error } = await db
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return errorResponse(error.message, 500);

  const withItems = await Promise.all(
    (orders || []).map(async (o: any) => {
      const { data: items } = await db.from('order_items').select('product_name, price, quantity').eq('order_id', o.id);
      return { ...o, items: items || [] };
    })
  );
  return jsonResponse({ orders: withItems });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);
  try {
    const body = await request.json();
    const shipping = {
      shippingName: body.shippingName,
      shippingPhone: body.shippingPhone,
      shippingAddress: body.shippingAddress,
      shippingCity: body.shippingCity,
      shippingState: body.shippingState,
      shippingPincode: body.shippingPincode,
    };
    if (!Object.values(shipping).every((v) => String(v || '').trim())) {
      return errorResponse('Complete shipping details required');
    }

    const methodId = body.paymentMethodId as PaymentMethodId;
    if (!VALID_METHODS.includes(methodId)) {
      return errorResponse('Invalid payment method');
    }

    const isDemo = methodId === 'demo';
    const paymentMethod = buildPaymentMethodField(methodId);

    const { order, items } = await createOrderFromCart(user.id, shipping, {
      paymentMethod,
      isDemo,
      skipStockUpdate: isDemo,
      status: isDemo ? 'demo' : 'awaiting_payment',
      paymentStatus: 'unpaid',
    });

    await notifyOwnerNewOrder(
      { ...order, items },
      { name: user.name, email: user.email },
      { isDemo }
    );

    return jsonResponse(
      {
        order: { ...order, items },
        message: isDemo
          ? 'Demo order placed — store owner notified'
          : 'Order placed — pay after delivery',
      },
      201
    );
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Order failed', 500);
  }
}
