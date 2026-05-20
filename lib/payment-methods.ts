export type PaymentMethodId = 'demo' | 'phonepe' | 'googlepay' | 'cod' | 'upi_other';

export type PaymentMethodOption = {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  icon: string;
  isDemo?: boolean;
};

/** All methods place order now — customer pays after delivery (no upfront gateway). */
export const PAY_ON_DELIVERY_METHODS: PaymentMethodOption[] = [
  {
    id: 'demo',
    title: 'Demo Order',
    subtitle: 'Test checkout — you still receive this order in Admin (no real payment)',
    icon: '🧪',
    isDemo: true,
  },
  {
    id: 'phonepe',
    title: 'PhonePe',
    subtitle: 'Pay via PhonePe after delivery (UPI / wallet)',
    icon: '📱',
  },
  {
    id: 'googlepay',
    title: 'Google Pay',
    subtitle: 'Pay via GPay after delivery (UPI)',
    icon: '💳',
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay cash when your order arrives',
    icon: '💵',
  },
  {
    id: 'upi_other',
    title: 'Other UPI',
    subtitle: 'Any UPI app after delivery',
    icon: '↗',
  },
];

export function getPaymentMethodLabel(id: PaymentMethodId): string {
  return PAY_ON_DELIVERY_METHODS.find((m) => m.id === id)?.title ?? id;
}

export function buildPaymentMethodField(id: PaymentMethodId): string {
  const label = getPaymentMethodLabel(id);
  if (id === 'demo') return `Demo Order — ${label}`;
  return `${label} (Pay after delivery)`;
}
