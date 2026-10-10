-- Data migration: link the Konu Anlatımı lessons to the seviye tespit (diagnostic) topics they teach,
-- so a level-test result recommends real lessons instead of "Bu konu için kaynaklar yakında
-- eklenecek". Each row names an exam (LIKE pattern on exam_types.slug), a Konu Anlatımı topic slug,
-- a lesson-title LIKE pattern ('%' = every lesson of that topic) and the diagnostic topic slug.
-- Additive and idempotent: ids are merged into "diagnosticTopicIds", never removed, and rows whose
-- exam, topic, lesson or diagnostic topic does not exist are skipped. Admins can still edit the
-- links per lesson in Yönetim → Konu Anlatımı.
WITH map (exam_like, topic_slug, title_like, diag_slug) AS (
  VALUES
    -- YDS
    ('yds', 'kelime-phrasal-verb', '%', 'kelime-bilgisi'),
    ('yds', 'cloze-test', '%', 'cloze-test'),
    ('yds', 'cumle-tamamlama', '%', 'cumle-tamamlama'),
    ('yds', 'ceviri', '%Konuya Giriş%', 'ceviri-en-tr'),
    ('yds', 'ceviri', '%(1/2)%', 'ceviri-en-tr'),
    ('yds', 'ceviri', '%Örnek Sorular%', 'ceviri-en-tr'),
    ('yds', 'ceviri', '%Konuya Giriş%', 'ceviri-tr-en'),
    ('yds', 'ceviri', '%(2/2)%', 'ceviri-tr-en'),
    ('yds', 'ceviri', '%Örnek Sorular%', 'ceviri-tr-en'),
    ('yds', 'paragraf', '%', 'okuma'),
    ('yds', 'paragraf-tamamlama', '%', 'paragraf-tamamlama'),
    ('yds', 'yakin-anlamli-cumle', '%', 'anlamda-en-yakin-cumle'),
    ('yds', 'tense-sorulari', '%Konuya Giriş%', 'zamanlar'),
    ('yds', 'tense-sorulari', '%(1/2)%', 'zamanlar'),
    ('yds', 'tense-sorulari', '%Örnek Sorular%', 'zamanlar'),
    ('yds', 'yds-stratejileri', '%1. Tense System%', 'zamanlar'),
    ('yds', 'tense-sorulari', '%(1/2)%', 'modal-fiiller'),
    ('yds', 'yds-stratejileri', '%2. Modality%', 'modal-fiiller'),
    ('yds', 'tense-sorulari', '%(2/2)%', 'edilgen-cati'),
    ('yds', 'yds-stratejileri', '%3. Passive Voice%', 'edilgen-cati'),
    ('yds', 'tense-sorulari', '%(2/2)%', 'kosul-cumleleri'),
    ('yds', 'yds-stratejileri', '%8. "If"%', 'kosul-cumleleri'),
    ('yds', 'cumle-tamamlama', '%(1/3)%', 'ulac-mastar'),
    ('yds', 'yds-stratejileri', '%4. Gerunds%', 'ulac-mastar'),
    ('yds', 'cumle-tamamlama', '%(2/3)%', 'sifat-cumlecikleri'),
    ('yds', 'yds-stratejileri', '%6. Adjective Clauses%', 'sifat-cumlecikleri'),
    ('yds', 'cloze-test', '%(1/3)%', 'baglaclar'),
    ('yds', 'cloze-test', '%(2/3)%', 'baglaclar'),
    ('yds', 'yds-stratejileri', '%9. Conjunctions%', 'baglaclar'),
    -- YÖKDİL (Fen, Sağlık, Sosyal share topic slugs)
    ('yokdil-%', 'kelime-bilgisi', '%', 'kelime-bilgisi'),
    ('yokdil-%', 'cloze-test', '%', 'cloze-test'),
    ('yokdil-%', 'cloze-test', '%Logical Connectors%', 'baglaclar'),
    ('yokdil-%', 'cumle-tamamlama', '%', 'cumle-tamamlama'),
    ('yokdil-%', 'ceviri', '%İngilizceden Türkçeye%', 'ceviri-en-tr'),
    ('yokdil-%', 'ceviri', '%Akademik Metin%', 'ceviri-en-tr'),
    ('yokdil-%', 'ceviri', '%Örnek Sorular%', 'ceviri-en-tr'),
    ('yokdil-%', 'ceviri', '%Türkçeden İngilizceye%', 'ceviri-tr-en'),
    ('yokdil-%', 'ceviri', '%Teknik Terim%', 'ceviri-tr-en'),
    ('yokdil-%', 'ceviri', '%Örnek Sorular%', 'ceviri-tr-en'),
    ('yokdil-%', 'paragraf-tamamlama', '%', 'paragraf-tamamlama'),
    ('yokdil-%', 'paragraf-okuma-anlama', '%', 'okuma'),
    ('yokdil-%', 'tense-system', '%', 'zamanlar'),
    ('yokdil-%', 'modality', '%', 'modal-fiiller'),
    ('yokdil-%', 'passive-voice-causatives', '%', 'edilgen-cati'),
    ('yokdil-%', 'adjective-clauses', '%', 'sifat-cumlecikleri'),
    ('yokdil-%', 'conditionals', '%', 'kosul-cumleleri'),
    ('yokdil-%', 'gerunds-infinitives', '%', 'ulac-mastar'),
    ('yokdil-%', 'conjunctions-adverbial-clauses', '%', 'baglaclar'),
    -- IELTS Reading
    ('ielts', 'ielts-reading-true-false-not-given', '%', 'ielts-reading-tfng'),
    ('ielts', 'ielts-reading-yes-no-not-given', '%', 'ielts-reading-tfng'),
    ('ielts', 'ielts-reading-matching-headings', '%', 'ielts-reading-matching-headings'),
    ('ielts', 'ielts-reading-multiple-choice', '%', 'ielts-reading-mcq'),
    ('ielts', 'ielts-reading-sentence-summary-table-completion', '%', 'ielts-reading-completion'),
    -- TOEFL Reading
    ('toefl', 'toefl-vocabulary', '%', 'toefl-reading-vocabulary'),
    ('toefl', 'toefl-reference', '%', 'toefl-reading-reference'),
    ('toefl', 'toefl-inference', '%', 'toefl-reading-inference'),
    ('toefl', 'toefl-sentence-simplification', '%', 'toefl-reading-simplification'),
    -- PTE Reading
    ('pte', 'reading-mcq-single', '%', 'pte-reading-mcq-single'),
    ('pte', 'reading-mcq-multiple', '%', 'pte-reading-mcq-multi'),
    ('pte', 'reading-reorder-paragraphs', '%', 'pte-reading-reorder'),
    ('pte', 'reading-fill-in-blanks', '%', 'pte-reading-fill-blanks'),
    ('pte', 'reading-writing-fill-in-blanks', '%', 'pte-reading-fill-blanks')
),
links AS (
  SELECT l.id AS lesson_id, array_agg(DISTINCT d.id) AS diag_ids
  FROM map m
  JOIN "exam_types" e ON e.slug LIKE m.exam_like
  JOIN "exam_topics" t ON t."examTypeId" = e.id AND t.slug = m.topic_slug
  JOIN "topic_lessons" l ON l."topicId" = t.id AND l.title LIKE m.title_like
  JOIN "diagnostic_topics" d ON d.slug = m.diag_slug
  GROUP BY l.id
)
UPDATE "topic_lessons" AS l
SET "diagnosticTopicIds" = ARRAY(SELECT DISTINCT x FROM unnest(l."diagnosticTopicIds" || links.diag_ids) AS x ORDER BY x),
    "updatedAt" = now()
FROM links
WHERE l.id = links.lesson_id
  AND NOT (l."diagnosticTopicIds" @> links.diag_ids);
