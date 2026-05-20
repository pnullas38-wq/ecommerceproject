import { getUserFromRequest } from '@/lib/auth';
import { notifyOwnerNewOrder } from '@/lib/email';
import { createOrderFromCart } from '@/lib/orders';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { errorResponse, jsonResponse } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Login required', 401);

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shipping } = await request.json();
    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return errorResponse('Payment verification failed', 400);
    }

    const { order, items } = await createOrderFromCart(user.id, shipping, {
      paymentMethod: 'UPI / Razorpay (Prepaid)',
      paymentId: razorpay_payment_id,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    await notifyOwnerNewOrder({ ...order, items }, { name: user.name, email: user.email }, { isDemo: false });
    return jsonResponse({ order: { ...order, items } }, 201);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : 'Verification failed', 500);
  }
}
