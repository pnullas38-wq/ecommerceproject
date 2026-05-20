export function calcShipping(subtotal: number) {
  return subtotal >= 499 ? 0 : 40;
}

export function formatPrice(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function discountPercent(price: number, original: number | null) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
