-- Site renamed from "Cannice English" to "Netfener": update brand text stored as data by the seed.
-- Exact-match updates only; login emails (…@canniceenglish.com) are intentionally left unchanged.
UPDATE "users" SET "name" = 'Netfener Hoca' WHERE "name" = 'Cannice Hoca';
UPDATE "books" SET "author" = 'Netfener Hoca' WHERE "author" = 'Cannice Hoca';
UPDATE "testimonials" SET "quote" = REPLACE("quote", 'Cannice English ile', 'Netfener ile') WHERE "quote" LIKE '%Cannice English ile%';
UPDATE "testimonials" SET "quote" = REPLACE("quote", 'Cannice English', 'Netfener') WHERE "quote" LIKE '%Cannice English%';
