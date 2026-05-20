import { getUserFromRequest } from '@/lib/auth';
import { calcShipping, getCartForUser } from '@/lib/orders';
import { getRazorpay } from '@/lib/razorpay';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);

  try {
    const body = await request.json();
    const items = await getCartForUser(user.id);
    if (!items.length) return errorResponse('Cart is empty');

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + calcShipping(subtotal);
    const amountPaise = Math.round(total * 100);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `stuns_${user.id}_${Date.now()}`,
      notes: {
        userId: String(user.id),
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingState: body.shippingState,
        shippingPincode: body.shippingPincode,
      },
    });

    return jsonResponse({
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: 'Stuns Store',
      description: 'Order payment',
      prefill: { name: user.name, email: user.email, contact: body.shippingPhone },
    });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Razorpay failed', 500);
  }
}
