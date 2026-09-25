# Opus prompt — Netfener explainer video (netfener.com)

Paste everything inside the box below into Claude Opus (claude.ai with Artifacts on, or Claude Code).
It returns a script and a storyboard, then builds the whole video as one self-contained animated HTML file.
You can screen-record that file at 1920×1080, or export it with a headless browser, to get an MP4.

To change the length, language or format, edit the **Deliverable settings** block before you paste.

---

````text
You are a senior motion designer and SaaS explainer-video scriptwriter. Make a complete, production-ready explainer video for my product, Netfener (https://netfener.com).

## Deliverable settings
- Length: 90 seconds (also give a 30-second cut list at the end)
- Aspect ratio: 16:9, 1920×1080 (also note how each scene reflows to 9:16 for Reels/Shorts)
- Language: Turkish voiceover and on-screen text, using the informal "sen" form. Give an English translation of the script next to it for my reference.
- Audience: Turkish learners aged 16–35 (high-school and university students, graduate applicants, academics) preparing for IELTS, TOEFL iBT, PTE Academic, YDS/e-YDS, YÖKDİL and YDT.
- Goal: get viewers to sign up free and start the free level test ("Ücretsiz seviye tespitine başla").

## What Netfener is
Netfener ("fener" means lighthouse) is a Turkish online English exam-prep SaaS. The promise: no random studying, just a clear, planned path to your target score, like a lighthouse showing the way. It puts everything in one platform with one teacher:

1. **Seviye Tespit (free level test):** find your CEFR level (A1–C1) and your weak topics. You get a results and analysis page and can set a target.
2. **Ücretsiz Öğrenci Koçluğu (free automated coaching):** onboarding asks for your exam, target score on that exam's own scale, exam date, level and weekly schedule. It then builds an editable weekly plan linked to real lessons, practice topics and mock exams. It has a busy-day mode, auto-completes tasks from real activity, runs weekly check-ins and gives printable weekly and monthly reports.
3. **Konu Anlatımı (topic lessons):** exam-specific lessons with example questions and step-by-step solutions.
4. **Pratik Bankası and Deneme Sınavları (practice bank and mock exams):** timed mocks with a results page, performance by skill, topic and question type, and mock score trends.
5. **Hatalarım (mistake notebook):** every wrong answer with your answer in red, the correct one in green, an explanation and a one-tap link to the matching lesson. A word or mistake counts as mastered after three days of spaced review.
6. **Kelime Motoru (vocabulary engine):** 6,000 hand-written words across A1–C1 in themed sets of 20. Flashcards flip in 3D to show the Turkish meaning, an example sentence and a usage tip, with read-aloud. Mark each word "Biliyorum" or "Tekrar çalışacağım", then take a test after each set (70% passes).
7. **Speaking Practice:** exam-style speaking tasks recorded with your microphone in the browser.
8. **Canlı Grup Dersleri (live small-group lessons):** join live classes and message your teacher directly.
9. **Hedeflerim and İlerleme Raporu (goals and progress report):** daily, weekly and monthly study goals with history, plus a progress dashboard (accuracy, mocks taken, study streak and visit frequency).
10. **Planlar (plans):** Başlangıç, Çırak (most popular) and Uzman. Each unlocks more mocks, lessons, practice and live classes.
11. **Free tools:** dictionary, score calculator, ÖSYM exam calendar, guidance tool and free resources.

## Brand look (match it exactly)
- Logo: a gold lighthouse with light beams on both sides and diagonal stripes on the tower, on a dark charcoal rounded tile, with a gold "Netfener" wordmark.
- Palette, light mode: paper background #F8F6F1, canvas #F2EEE5, white cards #FFFFFF, charcoal text/brand #161B26, gold accent #D9A12E (deep gold #8F6206, soft gold #FBF1D9), border #E6DFCF, success green #17A568, warning #E08A1F, danger red #E5484D, muted text #5B6270.
- Night mode ("gece"), used for the hook and the closing scene: #121826 and #1B2232 with glowing gold #F2C14E beams.
- Typeface: Inter at calm weights (650–750 for headings), with tight heading tracking (-0.03em). It must render Turkish characters (ç, ğ, ı, İ, ö, ş, ü) correctly.
- UI style: warm and calm. Rounded white cards, soft shadows, pill badges, lots of whitespace. Premium and trustworthy, not flashy.
- Visual motif: a lighthouse beam sweeps across the screen to reveal each new feature. A dark sea of scattered, confusing study materials turns into a calm, lit path.

## Story structure (keep to about 12–14 words of voiceover per 5 seconds)
1. **Hook (0–8s):** night. A student is buried in books and tabs and asks "IELTS mi, YDS mi… nereden başlamalıyım?" The lighthouse beam switches on.
2. **Meet Netfener (8–15s):** the logo reveal and a one-line promise ("Rastgele çalışma yok, planlı ilerleme var.")
3. **Step 1, know your level (15–27s):** the Seviye Tespit flow. A CEFR badge (for example "B2") lands and the weak topics light up.
4. **Step 2, get your plan (27–42s):** coaching onboarding (exam, target, date), then the weekly plan fills in with lessons, practice and a mock.
5. **Step 3, study smart (42–65s):** a quick-cut montage of Konu Anlatımı, a mock-exam timer, Hatalarım (red to green to lesson link), Kelime Motoru flashcards flipping in 3D, Speaking Practice with a mic waveform, and a live group lesson.
6. **Step 4, see your progress (65–78s):** İlerleme Raporu and Hedeflerim. Numbers count up, bars grow and the mock trend line rises toward the target line.
7. **Plans and CTA (78–90s):** the Başlangıç, Çırak and Uzman cards, then the exam names in plain text (IELTS · TOEFL · PTE · YDS · YÖKDİL), then the logo, "netfener.com" and the button "Ücretsiz seviye tespitine başla".

## Rules
- Do not use official exam-body logos or names (IDP, British Council, ETS, Pearson, ÖSYM branding). Show exam names only as plain text.
- Do not promise scores. No "garanti puan" and no "kesin başarı". Level-test results are estimates.
- Do not show prices unless I give them to you.
- Keep the UI faithful to the real product but simplified and readable at video size: at least 28px body text at 1080p and no more than 6 elements per screen.
- Use sample data that looks realistic and Turkish (names like "Elif" or "Mert", real-looking exam dates). Never use lorem ipsum.
- Accessibility: burned-in captions for every voiceover line, contrast of at least WCAG AA, and no flashing faster than 3 times per second.

## Output: produce all of the following in this order
1. **Creative concept:** 3 bullet points covering the big idea, the tone and the music direction (tempo in BPM and genre).
2. **Script table** with the columns: Scene · Time · Voiceover (TR) · Voiceover (EN) · On-screen text · Visuals and UI · Motion and transitions · SFX.
3. **Voiceover direction:** the full Turkish VO as one clean block ready for a TTS tool or voice actor, plus the voice type, pace and which words to stress.
4. **Storyboard:** one short frame description per scene (composition, focal point, camera move) and its 9:16 reflow note.
5. **The video itself:** one self-contained HTML file (inline CSS and JS; Inter from Google Fonts is the only external request) that:
   - plays the full 90-second animation automatically on a fixed 1920×1080 stage that scales to fit the window,
   - builds every UI mock-up in HTML and CSS or inline SVG (no stock images), including the lighthouse logo as inline SVG,
   - runs from a single timeline with a scene-and-time table in the code, so each scene is easy to retime,
   - shows captions synced to the script,
   - has minimal controls (play/pause, restart, scrub bar, keyboard Space and ←/→) that hide after 2 seconds idle so they don't appear in a screen recording,
   - supports `?scene=N` to jump straight to a scene and `?vertical=1` for the 9:16 layout,
   - uses eased, purposeful motion (cubic-bezier, staggered reveals, the lighthouse-beam wipe as the signature transition) and stays smooth at 60 fps.
6. **Export notes:** how to turn the HTML into an MP4, both by screen recording and with a short Playwright or Puppeteer + ffmpeg script. Also explain how to lay the voiceover and music under it.
7. **30-second cut:** which scenes and lines to keep, with new timings.

Before writing the HTML, quickly check that the script timing adds up to 90 seconds and that every feature named above appears at least once. Then build it. If the file is long, keep going until it is complete. Do not stop partway or leave "…rest of scenes" placeholders.
````

---

## Tips
- **Shorter ad instead:** set the length to 30s and tell it to keep only Hook, Step 1, Hatalarım, Kelime Motoru and CTA.
- **English version:** change the language line to "English voiceover and on-screen text" and remove the translation column.
- **Real screenshots:** attach screenshots of netfener.com pages and add "Match these screenshots for the UI mock-ups."
- **Iterate by scene:** after the first pass, ask things like "Make scene 5 faster, 2s per feature, and add a whoosh on each cut." The timeline table makes these edits quick.
- **Prices:** if you want prices in the plans scene, give Opus the current prices from Yönetim → Ürünler.
- The older 30s Google Flow ad prompt (`docs/flow-video-ad-prompt.md`) still uses the pre-rebrand navy/blue look. This prompt uses the current gold-lighthouse brand.
