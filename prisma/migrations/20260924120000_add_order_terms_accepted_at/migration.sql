-- Proof that the buyer accepted the Ön Bilgilendirme Formu and Mesafeli Satış Sözleşmesi at checkout.
ALTER TABLE "orders" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
