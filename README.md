# Stuns — Premium E-Commerce (Vercel Ready)

A production-style online store with **real payments**, **admin order dashboard**, and **email alerts** when customers buy.

## What works

- **Razorpay** — UPI, cards, netbanking (test/live keys)
- **Stripe** — international card checkout
- **Cash on Delivery** — instant order, no gateway
- **Admin dashboard** (`/admin`) — see every order, customer, address, update status
- **Owner email** — new order emails via Resend
- **Premium UI** — fast, dark luxury theme
- **Deploy on Vercel** — serverless Next.js + Supabase cloud DB

---

## 1. Supabase (database)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste and run `supabase/schema.sql`
3. Copy from **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

## 2. Payments

### Razorpay (UPI / India)

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → **Test Mode** keys
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Test UPI: use Razorpay test wallet in checkout popup.

### Stripe (cards)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **Test** API keys
2. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. For webhooks after deploy: add endpoint `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe` → event `checkout.session.completed` → copy signing secret to `STRIPE_WEBHOOK_SECRET`

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## 3. Admin & notifications

```env
ADMIN_EMAIL=your@gmail.com          # Register with this email → /admin access
OWNER_EMAIL=your@gmail.com          # Receives order emails
RESEND_API_KEY=re_...               # From resend.com (free)
JWT_SECRET=long-random-string-32+
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 4. Local development

```bash
npm install
cp .env.example .env
# Fill in .env values, then:
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

1. Register with your **ADMIN_EMAIL**
2. Add products to cart → checkout with Razorpay test / Stripe test / COD
3. Open **Admin** in header — your order appears
4. Check **OWNER_EMAIL** inbox if Resend is configured

---

## Deploy to Vercel

1. Push this folder to **GitHub**
2. [vercel.com](https://vercel.com) → **Import** the repo
3. Add all variables from `.env.example` in **Settings → Environment Variables**
4. Deploy
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://stuns.vercel.app`)
6. Add Stripe webhook URL (see above)
7. Run seed once locally pointing at production Supabase, or insert products in Supabase Table Editor

### Vercel env checklist

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `JWT_SECRET` | Yes |
| `ADMIN_EMAIL` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes |
| `RAZORPAY_*` | For UPI |
| `STRIPE_SECRET_KEY` | For cards |
| `STRIPE_WEBHOOK_SECRET` | After deploy |
| `RESEND_API_KEY` + `OWNER_EMAIL` | For emails |

---

## Customer flow

1. Browse → add to cart (sign in required)
2. Checkout → choose payment
3. Pay (real gateway) or COD
4. Order saved in database → you see it in **Admin** + email

## Legacy files

`stuns.html`, `server/`, and `public/js/` are the old local-only version. The Next.js app is the one to deploy.
