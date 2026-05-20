import { notifyOwnerNewOrder } from '@/lib/email';
import { createOrderFromCart } from '@/lib/orders';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return Response.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};
    const userId = Number(meta.userId);
    if (!userId) return Response.json({ received: true });

    const shipping = {
      shippingName: meta.shippingName || '',
      shippingPhone: meta.shippingPhone || '',
      shippingAddress: meta.shippingAddress || '',
      shippingCity: meta.shippingCity || '',
      shippingState: meta.shippingState || '',
      shippingPincode: meta.shippingPincode || '',
    };

    try {
      const { order, items } = await createOrderFromCart(userId, shipping, {
        paymentMethod: 'Card (Stripe)',
        paymentId: session.payment_intent as string,
        status: 'confirmed',
        paymentStatus: 'paid',
      });

      const db = getSupabase();
      const { data: user } = await db.from('users').select('name, email').eq('id', userId).single();
      if (user) await notifyOwnerNewOrder({ ...order, items }, user, { isDemo: false });
    } catch (err) {
      console.error('Stripe webhook order error:', err);
    }
  }

  return Response.json({ received: true });
}
