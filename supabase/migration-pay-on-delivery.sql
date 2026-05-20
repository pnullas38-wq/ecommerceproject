-- Run in Supabase SQL Editor if you already created tables earlier

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'awaiting_payment';
