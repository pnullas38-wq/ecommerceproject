import { Resend } from 'resend';
import type { Order } from './types';

export async function notifyOwnerNewOrder(
  order: Order & { items: { product_name: string; price: number; quantity: number }[] },
  customer: { name: string; email: string },
  meta?: { isDemo?: boolean }
) {
  const ownerEmail = process.env.OWNER_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!ownerEmail || !resendKey) return;

  const resend = new Resend(resendKey);
  const itemsHtml = order.items
    .map((i) => `<li>${i.product_name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}</li>`)
    .join('');

  const demoBadge = meta?.isDemo
    ? '<p style="background:#f59e0b;color:#000;padding:8px 12px;border-radius:8px;font-weight:bold">DEMO ORDER (test — pay after delivery not required)</p>'
    : '<p style="background:#3b82f6;color:#fff;padding:8px 12px;border-radius:8px">Pay after delivery — payment not collected yet</p>';

  await resend.emails.send({
    from: process.env.RESEND_FROM || 'Stuns Store <onboarding@resend.dev>',
    to: ownerEmail,
    subject: meta?.isDemo
      ? `[DEMO] New order #${order.id} — ₹${Number(order.total).toLocaleString('en-IN')}`
      : `New order #${order.id} — Pay after delivery — ₹${Number(order.total).toLocaleString('en-IN')}`,
    html: `
      <h2>New order received</h2>
      ${demoBadge}
      <p><strong>Order #${order.id}</strong> · ${order.status} · ${order.payment_method}</p>
      <p><strong>Payment:</strong> ${order.payment_status || 'unpaid'} (collect after delivery)</p>
      <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
      <p><strong>Phone:</strong> ${order.shipping_phone}</p>
      <p><strong>Address:</strong> ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_pincode}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total due on delivery: ₹${Number(order.total).toLocaleString('en-IN')}</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin">View in admin dashboard</a></p>
    `,
  });
}
