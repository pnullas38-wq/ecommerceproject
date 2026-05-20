import { getUserFromRequest } from '@/lib/auth';
import { calcShipping, getCartForUser } from '@/lib/orders';
import { getStripe } from '@/lib/stripe';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);

  try {
    const body = await request.json();
    const items = await getCartForUser(user.id);
    if (!items.length) return errorResponse('Cart is empty');

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = calcShipping(subtotal);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=1`,
      metadata: {
        userId: String(user.id),
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingState: body.shippingState,
        shippingPincode: body.shippingPincode,
      },
      line_items: [
        ...items.map((i) => ({
          price_data: {
            currency: 'inr',
            product_data: { name: i.name, images: [i.image] },
            unit_amount: Math.round(i.price * 100),
          },
          quantity: i.quantity,
        })),
        ...(shipping > 0
          ? [
              {
                price_data: {
                  currency: 'inr',
                  product_data: { name: 'Shipping' },
                  unit_amount: Math.round(shipping * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
    });

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Stripe checkout failed', 500);
  }
}
