-- Data migration: the three Deneme Sınavı plan products, so /planlar and the Deneme Sınavı page have
-- something to sell right after deploy. Prices are placeholders (edit in Yönetim → Ürünler); rows
-- that already exist (e.g. created by `npm run db:seed` or an admin) are left untouched.
INSERT INTO "products" ("id", "slug", "title", "category", "planTier", "accessMonths", "basePrice", "salePrice", "currency", "isPublished", "isFeatured", "displayOrder", "shortDescription", "diagnosticTopicIds", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.slug, v.title, 'PLAN'::"ProductCategory", v.tier::"PlanTier", v.months, v.base, v.sale, 'TRY', true, false, v.ord, v.title || ' — deneme sınavı planı', ARRAY[]::text[], now(), now()
FROM (VALUES
  ('plan-baslangic', 'Başlangıç Planı', 'BASLANGIC', 1, 599.00, 449.00, 1),
  ('plan-cirak', 'Çırak Planı', 'CIRAK', 4, 1999.00, 1499.00, 2),
  ('plan-uzman', 'Uzman Planı', 'UZMAN', 4, 3999.00, 2999.00, 3)
) AS v(slug, title, tier, months, base, sale, ord)
WHERE NOT EXISTS (SELECT 1 FROM "products" p WHERE p.slug = v.slug);
