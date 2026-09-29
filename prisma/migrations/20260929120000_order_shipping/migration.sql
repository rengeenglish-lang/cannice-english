-- Printed books are shipped, so an order can now carry a delivery address and a shipping fee.
ALTER TABLE "orders" ADD COLUMN "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "shippingAddress" JSONB;
-- Existing orders were digital-only: zero shipping, and no address to invent for them.
