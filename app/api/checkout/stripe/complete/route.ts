import { getUserFromRequest } from '@/lib/auth';
import { notifyOwnerNewOrder } from '@/lib/email';
import { createOrderFromCart } from '@/lib/orders';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);

  try {
    const { sessionId } = await request.json();
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return errorResponse('Payment not completed');
    }

    const meta = session.metadata || {};
    const db = getSupabase();
    const { data: existing } = await db
      .from('orders')
      .select('id')
      .eq('payment_id', session.payment_intent as string)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ order: existing, alreadyProcessed: true });
    }

    const shipping = {
      shippingName: meta.shippingName || '',
      shippingPhone: meta.shippingPhone || '',
      shippingAddress: meta.shippingAddress || '',
      shippingCity: meta.shippingCity || '',
      shippingState: meta.shippingState || '',
      shippingPincode: meta.shippingPincode || '',
    };

    const { order, items } = await createOrderFromCart(user.id, shipping, {
      paymentMethod: 'Card (Stripe)',
      paymentId: session.payment_intent as string,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    await notifyOwnerNewOrder({ ...order, items }, { name: user.name, email: user.email }, { isDemo: false });
    return jsonResponse({ order: { ...order, items } });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Failed', 500);
  }
}
