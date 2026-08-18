# Youth & Pensa Camp 2026 Recap — Developer Handoff

Context for continuing this project in Claude Code.

---

## 1. What this is

A single-page web recap of five sessions from Youth & Pensa Camp 2026 (Church of Pentecost, Regina, Saskatchewan).

**The purpose is retention, not archiving.** Conference teaching evaporates within weeks. This page exists so attendees can revisit what they heard and actually act on it, and so people who missed the camp get the substance without watching four hours of video. Every design decision should be measured against that: does this help someone remember and apply, or is it decoration?

Audience is teenagers and university-age young adults (PENSA = Pentecost Students and Associates). Mostly Ghanaian-Canadian. Overwhelmingly on phones.

---

## 2. Files

```
camp-recap/
├── index.html        ← the entire application, ~152 KB
├── HANDOFF.md        ← this file
├── README.txt        ← naming + wiring instructions for audio summaries
└── og.jpg            ← 1200×630 link-preview image, 57 KB
```

`og.jpg` is the only asset the page expects beside it, and only for social
previews — the page itself renders fine without it.

That's it. **One HTML file, no build step, no package.json, no dependencies to install, no backend.** This is deliberate — the page needs to outlive whoever built it, be hostable anywhere (Netlify Drop, GitHub Pages, church website), and be editable by a non-developer with a text editor.

**Do not introduce a framework, bundler, or build pipeline.** If a change seems to require one, that's a signal the change is wrong for this project.

Related deliverables produced earlier, not part of the web app:
- A Word version of the same content (superseded by this page)
- `transcripts/Day-1-The-Message-of-the-Gospel-CLEAN.md` — a cleaned Day 1 transcript. Four more to do.

### External dependencies

Exactly one: Google Fonts (Fraunces, Karla, JetBrains Mono) via `<link>`. Everything else is inline. The logo is embedded as a base64 data URI so the file is genuinely standalone — an earlier version referenced `logo.png` externally and broke when opened alone.

---

## 3. Architecture

All content lives in JavaScript arrays inside a single `<script>` tag at the bottom of `index.html`. The DOM is rendered from that data on load. There is no server, no fetch, no API.

### Top of the script — the config a non-developer edits

```js
const SITE_URL = "";          // e.g. "youthpensacamp.ca"
const MEDIA = {
  s1:{ youtube:"", audio:"" },
  ...s5
};
```

Empty string → the button renders greyed out as "coming soon". This lets the page ship before the media exists. Keep that behaviour.

`SITE_URL` follows the same convention: fill it in and every shareable card prints the address along the bottom, so someone who sees a card on WhatsApp can find the page. Leave it empty and the cards simply omit that line.

### The content model

`SESSIONS` is an array of 5 objects:

| Field | Type | Rendered as |
|---|---|---|
| `id` | `"s1"`–`"s5"` | anchor id, storage key prefix, MEDIA lookup |
| `day`, `title`, `speaker`, `role`, `flag` | string | session header (`flag` = red "confirm this" badge) |
| `theme` | string | the one-word theme beside the oversized session numeral |
| `anchor` | string | scripture reference line |
| `overview` | string | intro paragraph |
| `big` | string | the Big Idea panel + the "Start here" list |
| `lessons` | string[] | bulleted key lessons |
| `quotes` | string[] | pull quotes |
| `refs` | string[] | scripture chips |
| `refNote` | string | note under the chips |
| `reflect` | string[] | numbered questions |
| `acts` | string[] | action-step checkboxes |
| `quiz` | object[] | `{q, a:[4 options], c: correctIndex, why}` |
| `deeper` | object[] | `{h, p:[], list:[], p2:[], note}` — the expandable long-form section |

### ⚠️ Escaping is inconsistent by design — know which is which

Some fields go through `esc()`, others are injected as raw HTML so they can carry `<em>`:

- **Raw HTML allowed:** `overview`, `big`, `lessons`, `refNote`, all `deeper` fields, all `quiz` fields
- **Escaped via `esc()`:** `title`, `day`, `speaker`, `role`, `flag`, `anchor`, `quotes`, `refs`, `reflect`, `acts`

Note that `esc()` only escapes bare ampersands — it does **not** escape `<` or `>`. It exists to stop `&` breaking entities, not as an XSS guard. That's acceptable because all content is authored, not user-supplied. Don't treat it as sanitisation.

### Render functions

- `sessionHTML(s, i)` — builds one session
- `deeperHTML(s)` — the `<details>` expandable panel
- `quizHTML(s)` — the quiz block
- Start-here card is rendered inline from `SESSIONS.map(...)` after sessions

### Progress tracking

- Checkboxes carry `data-key="s1-0"` and `data-sess="s1"`
- Persisted to `localStorage` under key `ypc2026-progress`, wrapped in try/catch so a blocked storage API degrades silently rather than throwing
- **The denominator is 5 sessions, not 20 steps.** The page tells people to pick *one* action per session; showing "3/20" would contradict that instruction. Total steps display as a secondary line only. Don't "fix" this back to 20.

### The daily layer — "Remember this" and "Can you still remember?"

Between the intro and the Start-here card sits a two-card row that changes every
day, built entirely from content that already exists further down the page.

- **The daily line** is one of the 25 verbatim quotes. **The daily question** is one of the 15 quiz questions.
- Selection is **deterministic, not random**: `dayNumber()` returns days since epoch in the reader's own timezone, and the index is `(DAY * stride) % pool.length`. Everyone who opens the page on the same day sees the same line, so it can be talked about — a random pick would make that impossible.
- The strides (7 for quotes, 4 for questions) are **coprime with the pool sizes** (25 and 15). That guarantees every item appears once before any repeats, and that consecutive days jump between sessions rather than walking through session 1 five times. **If you add or remove quotes or quiz questions, check the stride is still coprime with the new pool size**, or the rotation will start skipping items permanently.
- The homepage question reuses the existing `.q` markup and the existing document-level quiz handler. There is no second quiz implementation — don't add one.

### Other behaviour

- **Surprise me** scrolls to a random quote, big idea, reflection question, quiz question or action step, forcing any `.rv` ancestors visible first, then applies a `.flash` ring (a plain static outline under `prefers-reduced-motion`).
- **Welcome back** shows a dismissible strip above the sticky nav, but only when `ypc2026-last-visit` exists and the gap is **3 days or more** — never on a first visit, never for someone who was here yesterday. Wrapped in try/catch like all other storage use.
- `.rv` → `.in` scroll reveal via IntersectionObserver, disabled under `prefers-reduced-motion`
- `beforeprint` force-opens all `<details>` and reveals quiz answers, `afterprint` restores
- Quiz is single-attempt per question, reveals the correct answer and explanation either way

### Shareable cards

Every quote and every big idea carries a discreet "Make a card" button that opens
a sheet and draws a card on a `<canvas>`. Nothing is uploaded; there is no service
involved. Sizes are 1080×1920 (status/story) and 1080×1080 (square).

Three things about this code are deliberate:

1. **Quote cards and big-idea cards are not the same card.** A quote is drawn in quotation marks, labelled `SAID AT CAMP`, and attributed to the speaker where we have a real name. A big idea is a summary *written by the compiler*, so it is labelled `THE BIG IDEA`, carries **no quotation marks**, and is attributed to the camp — never to a person. Rule 5 in §5 is about not putting words in someone's mouth, and a card that travels on WhatsApp without any surrounding context is exactly where that would do damage. Keep the two card types distinct.
2. **Output is JPEG at quality 0.92, not PNG.** A full-bleed gradient at 1080×1920 lands around 800 KB as a PNG — slow to share on mobile data, and above what WhatsApp will fetch for a link preview. At this resolution the visual difference is nil.
3. **The preview is an `<img>`, not the canvas itself.** Long-pressing a canvas on iOS offers nothing; long-pressing an image offers "Save to Photos". On phones that support it, the Share button hands the file straight to the OS share sheet via `navigator.share`; where that's unavailable it hides itself and the download link takes over.

Text is auto-fitted: `fitText()` steps the size down until the wrapped block fits,
then the block is centred in the space between the label and the footer rule, so a
short line doesn't leave a hole in the middle of the card.

### The link preview image

`og.jpg` already exists in the folder. The `og:image` meta tag is deliberately left
as `https://REPLACE-WITH-YOUR-DOMAIN/og.jpg` — **it must be an absolute URL**, or
WhatsApp and Facebook ignore it, which is why it can't be filled in ahead of
knowing where the page is published.

To regenerate it (say the title changes), open the page with `#og` on the end of
the address. That opens the same sheet in link-preview mode at 1200×630 and offers
the file for download. The committed `og.jpg` was rendered separately with the real
Fraunces/Karla/JetBrains Mono files to the identical layout, so the two match.

---

## 4. Design system

Palette derived from the official camp logo and the event's "Thank You" graphic — these are the real brand colours, not invented:

```css
--navy:#0B0C42    --royal:#141571   --royal-2:#3A3180
--violet:#7B3FE4  --violet-mid:#AA70FA  --violet-light:#BDA4FE
--violet-tint:#EDE7FD  --red:#DA171B  --red-tint:#FCEDEE
--paper:#F8F8FC   --paper-alt:#EFF0F8  --rule:#DBDDEC
--ink:#15163A     --ink-soft:#54567C
```

Type: **Fraunces** (display), **Karla** (body), **JetBrains Mono** (labels, scripture refs, section eyebrows).

Alternating sessions use `--paper-alt` via `:nth-child(even)`. Cards inside those rows shift to `#FCFCFF`.

### Conventions to preserve

- Section labels are mono, uppercase, letterspaced — **no emoji icons**, they'd undercut the typographic system
- Each session opens with an oversized display numeral in `--violet-light` beside a one-word theme (`Gospel · Transformation · Power · Identity · Impact`). Those words are not decoration — they map to the event's own tagline, *Gospel · Power · Impact*, already in the hero. Don't invent new ones
- The daily card and the closing section share the navy radial-gradient treatment. That's the only "loud" surface in the system; adding a third would cheapen all of them
- Quotes get a violet left border; big ideas get a violet tinted panel; editor's notes get the red tint
- Body copy constrained to `--read` (68ch)
- Mobile-first; verified no horizontal overflow at 390px

---

## 5. Rules that came from the client

These are settled decisions, not open questions.

1. **No photographs.** Many attendees are minors and consent wasn't obtained. Text and logo only.
2. **No backend, no data collection.** No comments, forms, surveys, or submissions. Progress stays on-device.
3. **Panelists are not named.** Session 4 uses "one panelist", "another panelist", "the senior minister on the panel". Sermon speakers *are* named. If names are supplied later they go in `speaker`/`role`, but the panel stays anonymised unless the client says otherwise.
4. **No gamification.** Badges, points, streaks and journey maps were explicitly considered and rejected — turning prayer and surrender into point-collection trivialises the content. The session tracker is the ceiling.
5. **Quotes are verbatim.** Every quote was verified word-for-word against the source transcripts. Several were dropped or corrected during an accuracy pass. **Do not paraphrase, tighten, or "improve" a quote.** If a quote seems awkward, that's how it was said.

---

## 6. Outstanding work

### Blocking publication

- [ ] **Two speaker names unknown** — Session 2 (Day 2 morning) and Session 5 (Day 4 closing, called only "Bishop" in the recording). Both currently show a red `flag` badge.
- [ ] **Confirm spelling of "Apostle George Amoah"** (Session 3) — transcribed by ear.
- [ ] **Session 4 editorial note** — the panel included teaching on responsibility within courtship and on women's dress that was deliberately not reproduced, because it sat immediately next to an audience question about sexual harassment by a leader. The omission is surfaced in an on-page editor's note rather than hidden. **This is the client's decision to make** — do not quietly resolve it either way.
- [ ] **Barna statistics (Session 1)** — the recording is garbled on the numbers. Only two figures were kept; the rest is marked unclear. Verify against the original June 2026 Barna article before any percentage is published.

### Done since the last handoff

- [x] **Shareable quote cards** — canvas-based, client-side, two sizes, share-sheet aware.
- [x] **Open Graph preview image** — `og.jpg` bundled. Still needs the absolute URL filled into the meta tag at publish time.
- [x] **Daily "Remember this" line and daily retrieval question** — the page now changes every day with no maintenance.
- [x] **Surprise me**, **welcome-back strip**, **session theme words**, **oversized session numerals**.

### Next planned features

- [ ] **QR code** for announcement slides and the bulletin.
- [ ] **Fill in `SITE_URL`** once the page has an address, so cards carry it.
- [ ] **Replace the `og:image` placeholder domain** at publish time.

### Nice to have

- [ ] Extract `SESSIONS` into a separate data file so next year's team edits content without touching markup. Trade-off: breaks the single-file property, so only do this if the client asks.
- [ ] Per-session printable one-pager.
- [ ] Scenario framing ("you're at school and someone says X") — a sound pedagogical idea, deliberately deferred because it needs to be written by youth leaders who know these young people, not invented.
- [ ] Clean transcripts for the remaining four sessions (Day 1 is done). The panel needs a decision on whether to mark speaker turns by name or keep them anonymised.

---

## 7. Pitfalls

- **Editing content is string-editing inside JS arrays.** Apostrophes in double-quoted strings are fine; a stray unescaped quote silently breaks the whole array and the page renders blank. An earlier edit did exactly this. After any content change, load the page and check the console.
- **The base64 logo is a ~16 KB single line** in the `<img src>`. Don't reformat, prettify, or wrap it.
- **Don't add `localStorage` usage that isn't try/catch wrapped.** It fails in some embedded/preview contexts and an unguarded call throws.
- **Verify visually after changes.** A headless browser screenshot at 1280px and 390px catches layout regressions that reading the diff won't.
- **Adding or removing quotes/quiz questions changes the daily rotation.** The strides must stay coprime with the pool sizes — see the daily-layer notes in §3.
- **`[hidden]{display:none !important}` near the top of the CSS is load-bearing.** Any element given a `display` by a class (`.btn`, `.size`) would otherwise ignore its own `hidden` attribute, and the Share button would appear on browsers that can't share.
- **The share sheet markup must stay *above* the `<script>` block.** It's queried at parse time; move it below and every card button throws.
- **Scripture quotations:** modern translations (NIV, NLT) are copyrighted. The page quotes only short phrases integrated into the speakers' own sentences, which is fine. The cleaned transcript deliberately uses reference placeholders instead of reproducing long passages. Keep that approach.

---

## 8. Quick verification

```bash
# open at both breakpoints, check console is clean
# expected counts on a correct build:
#   .session         → 5
#   details.deep     → 5
#   .deep-item       → 51
#   .bigidea         → 5
#   #sessions .q     → 15     (+1 more on the homepage, so .q → 16)
#   .act input       → 20
#   .start-list li   → 5
#   .quote           → 25
#   .qshare          → 30     (25 quotes + 5 big ideas)
#   .s-theme         → 5
```

Also worth checking after any change:

- The daily card and the daily question both render, and the question's options
  mark right/wrong and reveal the explanation — that proves the homepage question
  is still going through the one shared quiz handler.
- "Make a card" opens the sheet and the preview image appears (not a blank navy
  rectangle — that means a font or the logo failed to load).
- A big-idea card says `THE BIG IDEA` with no quotation marks; a quote card says
  `SAID AT CAMP` with them.
- With `localStorage` blocked entirely, the page still renders and the console
  stays clean. Verified — every storage call is guarded.

Progress sanity check: ticking one box in two different sessions should show **2 / 5 sessions acted on** and "2 steps ticked".
