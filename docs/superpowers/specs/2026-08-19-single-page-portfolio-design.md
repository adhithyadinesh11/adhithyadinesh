# Single-Page Retouch — Adhithya Dinesh Portfolio

**Date:** 2026-08-19
**Status:** Awaiting review

## Goal

Collapse the seven-page site into one scrolling page plus a single
archive page, replace the About typewriter with a pinned
"What's New"-style beat sequence, and close the site on the
*"Still not finished"* line. It has to work on a phone as well as on
desktop.

## What the owner asked to keep, change, and drop

| | |
|---|---|
**Keep untouched** | Hero (photo + name), all achievements animations, the *"Still not finished"* quote
**Replace** | About typewriter — too slow and boring
**Restructure** | Seven pages → `index.html` + `gallery.html`
**Constraint** | Gallery photo order must not change

## Decisions taken

1. Gallery stays a **real second page** (`gallery.html`), reached by a
   normal link. `index.html` is otherwise the whole site.
2. About becomes a **pinned panel**: the section sticks to the viewport
   and story beats swap under the scroll, so the page appears to hold
   still. A SKIP control drops straight to the full text.
3. `index.html` carries a **6-photo gallery panel** with VIEW MORE
   leading to the archive.
4. `gallery.html` opens with **PHOTOS | VIDEOS tabs**; photos keep
   today's exact order, videos are grouped SWIM then RACE.
5. The quote appears **twice** — closing About, and again as the final
   full-viewport frame.
6. About copy gets **typo fixes only**; wording and voice unchanged.
7. The page must **work properly on a phone**, not just avoid breaking —
   see **Mobile**. This is a stated requirement, not a nice-to-have, and
   the pinned About panel is the part most at risk.

## File plan

### Created
- `assets/css/home.css` — about stage, gallery panel, closing quote
- `assets/js/home.js` — about beats, nav active-state, scroll-triggered
  section init

### Rewritten
- `index.html` — all seven sections
- `gallery.html` — photo grid + video tabs, absorbing the video pages
- `assets/js/script.js` — shared nav only; dead code removed
- `assets/css/style.css` — shared shell only; duplicates removed
- `assets/css/gallery.css` — absorbs video-card styles
- `assets/js/gallery.js` — absorbs the swim and race data plus the player

### Deleted
`about.html`, `achievements.html`, `featured.html`, `contact.html`,
`watch.html`, `swim.html`, `race.html`,
`assets/css/about.css`, `assets/css/watch.css`, `assets/css/race.css`,
`assets/css/swim.css`, `assets/js/watch.js`, `assets/js/race.js`,
`assets/js/swim.js`

### Moved as-is
`assets/js/achievements.js` and `assets/css/achievements.css` keep their
content; only the initialisation trigger changes (see below).
`assets/js/featured.js` and `assets/css/featured.css` are unchanged.

## `index.html` structure

```
1  HERO           existing markup, existing animations
2  ABOUT          pinned beat panel, 7 beats, SKIP
3  ACHIEVEMENTS   PBs, medal tally, quick summary, results, lightboxes
4  FEATURED       14 article cards, horizontal drag track
5  GALLERY        6 photos + VIEW MORE → gallery.html
6  CONTACT        form + 4 socials
7  CLOSING        "17 years. One sport. Still not finished."
```

Section ids: `#home`, `#about`, `#achievements`, `#featured`,
`#gallery`, `#contact`.

## The About panel

### Markup

```html
<section id="about" class="about-stage" style="--beats:7">
  <div class="about-panel">
    <div class="about-backdrop"></div>        <!-- blurred about.jpg -->
    <div class="about-beats">
      <article class="beat is-active">…</article>
      <article class="beat">…</article>
      …7 total
    </div>
    <ol class="beat-progress" aria-hidden="true">…7 ticks…</ol>
    <button type="button" class="about-skip">SKIP →</button>
  </div>
  <div class="about-full">…complete story, one readable column…</div>
</section>
```

### Mechanism

```css
.about-stage { position: relative; height: calc(var(--beats) * var(--beat-h)); }
.about-panel { position: sticky; top: 0; height: 100dvh; overflow: hidden; }
.about-full  { display: none; }
.beat        { opacity: 0; transform: translateY(12px);
               transition: opacity .5s ease, transform .5s ease; }
.beat.is-active { opacity: 1; transform: none; }
```

`--beat-h` steps down by breakpoint — `100vh` on desktop, `70vh` under
700px, `60vh` under 500px — so seven beats cost ~420vh of scrolling on a
phone instead of 700vh. See **Mobile** for why the height is read from a
cached value rather than live `innerHeight`.

Scroll handler, throttled with `requestAnimationFrame`:

```js
const total    = stage.offsetHeight - window.innerHeight;
const progress = clamp(-stage.getBoundingClientRect().top / total, 0, 1);
const active   = Math.min(beats.length - 1,
                          Math.floor(progress * beats.length));
```

Only `.is-active` moves between beats — nothing else is written to the
DOM per frame.

### SKIP

Adds `.is-skipped` to the stage, which collapses the track to its
natural height, unsticks the panel, hides the beat machinery and reveals
`.about-full`. The scroll listener detaches and the button removes
itself. Normal scrolling continues into Achievements.

```css
.about-stage.is-skipped                { height: auto; }
.about-stage.is-skipped .about-panel   { position: static; height: auto; }
.about-stage.is-skipped .about-beats,
.about-stage.is-skipped .beat-progress,
.about-stage.is-skipped .about-skip    { display: none; }
.about-stage.is-skipped .about-full    { display: block; }
```

`prefers-reduced-motion: reduce` applies `.is-skipped` on load, so the
story is readable without any motion. Enter still skips, as it does now.

### The seven beats

| # | Content |
|---|---|
1 | Hi, I'm Adhi
2 | Six years old · not to become a swimmer · just to get the fear of water out of the way
3 | Seventeen years later — most of my life in the water rather than on land
4 | A summer camp became early mornings, double sessions, competition, failure, growth → representing India
5 | South Asian golds · Asian Age Group bronze · a hundred national medals · the moments that never made a podium
6 | Progress rarely looks dramatic — 5 a.m., nobody watching, you get in again
7 | **17 years. One sport. Still not finished.**

Text is lifted verbatim from `assets/js/script.js:244-260`, with only
the typo fixes listed below.

## Achievements — one required change

The PB scramble and medal count-up currently run on page load. On a
single page they would finish while the visitor is still on the hero and
be missed entirely. `achievements.js` is wrapped so its animation entry
points fire from an `IntersectionObserver` on `#achievements`
(`threshold: 0.15`, fires once). Results data, tabs, year selector and
both lightboxes are untouched.

## Gallery panel on `index.html`

`1.jpg` large, with `17, 16, 15, 14, 13` beside it — first six of the
existing order, no reordering. It reflows to a 2-column grid under 700px
with `1.jpg` spanning both columns, and to a single column under 500px;
reading order stays 1, 17, 16, 15, 14, 13 in every layout. Cards are lazy-loaded and each links to
`gallery.html#p-<image>`, which opens the archive with that photo
already in its lightbox. No lightbox CSS or JS is duplicated onto
`index.html`.

## `gallery.html`

PHOTOS and VIDEOS tabs at the top, PHOTOS active by default.

- **PHOTOS** — featured `1.jpg`, then the grid, in exactly today's
  order: `17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 3, 2`.
  `4.jpg` is on disk but absent from the current list; it stays absent.
- **VIDEOS** — SWIM (001, 002) then RACE (001–004), matching the order
  the collection cards use today. The existing fullscreen player and
  R2 video URLs carry over unchanged.

Its nav points back to `index.html#about` and friends.

## Nav

Six items. Five are in-page anchors; `GALLERY ↗` is a real link.
Sticky, with the current section lit via `IntersectionObserver`
(`rootMargin: '-45% 0px -55% 0px'`). Sections get `scroll-margin-top` so
anchor jumps clear the bar.

`.page-fade` link interception in `script.js:116-135` currently
`preventDefault`s every nav click. It is narrowed to cross-document
links only, so anchors scroll instead of reloading.

## CSS and JS consolidation

Sixteen files, ~9,800 lines, written when only one page's CSS loaded at
a time. Several files re-hack the same shared elements with
`!important`, which breaks once they co-load. Confirmed collisions:

| Collision | Resolution |
|---|---|
`.navbar:not(.mobile-open)` mobile hack duplicated with `!important` in `about.css:243`, `achievements.css:987`, `gallery.css:525` | One canonical rule in `style.css`; per-page copies deleted |
`.pb-card`, `.pb-time`, `.medal-count`, `.medal-emoji`, `.medal-summary`, `.medal-tally`, `.achievements-page`, `.event-name` defined in **both** `style.css:453-638` and `achievements.css` | Remove the `style.css` copies; `achievements.css` is the live version |
`.lightbox-close` in both `achievements.css` and `gallery.css` | Never co-load under this plan — panel photos link out instead of opening a local lightbox |
Three overlapping mobile layers in `style.css` (`HOMEPAGE — MOBILE`, `FINAL MOBILE FIX`, `MOBILE BRIGHTNESS`) | Fold into one homepage-mobile block |
`about.css:210` injects a **`position:fixed`** "ABOUT" title via `.about-text::before` at `z-index:1001` | Deleted with `about.css`. On a single page a fixed element leaks across every section, so this cannot be ported |
`100vh` and `100dvh` mixed across 8 declarations, several with `!important` | One convention: `100vh` first as fallback, `100dvh` after. No `!important` |
Seven different breakpoints in use (1000, 900, 850, 700, 600, 520, 500) | Standardise on three: 1000px, 700px, 500px |

Load order on `index.html`: `style.css` → `achievements.css` →
`featured.css` → `home.css`.

## Bugs found on the way

These are live defects in the current site, fixed as part of the work:

1. **`script.js:144-194`** — an old copy of the PB scramble reads
   `time.dataset.time`, an attribute that does not exist in the markup.
   `finalTime.length` throws a `TypeError` inside a `setInterval` that
   is never cleared, so four timers fire and throw every 35 ms for as
   long as the achievements page is open. The working version lives in
   `achievements.js`. Delete the `script.js` copy.
2. **`script.js:199`** — selects `.medal-count`; the markup uses
   `.achievement-medal-count`. Matches nothing. Delete.
3. **`style.css:143-157`** — `.home .navbar a` drives the nav stagger
   animation, but no page sets `class="home"` on `<body>`, so it never
   runs. It also only covers 5 of 6 links. Fix the selector and extend
   to six.
4. **`contact.html:82`** — the LinkedIn href has no protocol
   (`www.linkedin.com/in/...`), so it resolves as a relative path and
   404s. Add `https://`.

## Copy edits

Typo-only, per the owner's instruction:

| Current | Fixed |
|---|---|
`Hi, Iam Adhi,` | `Hi, I'm Adhi,` |
`a hundered other medals` | `a hundred other medals` |
`the spotlight i needed` | `the spotlight I needed` |
`championships, A bronze at the 10th` | `championships, a bronze at the 10th` |

**Needs a decision at review:** *"I have spent most of my life in the
water than on land"* is a grammar error rather than a typo — the
comparative wants *"more of my life in the water than on land."*
Flagged rather than changed.

**Noticed outside the About text**, not changed without approval:
`featured.html:369` reads `Article aout me topping tamil Nadu sports
quota list`, and card 14 is labelled `THE NEW INDIAN EXPRESS` while its
URL points at thehindu.com.

## Preserved exactly

- Gallery photo order and the omission of `4.jpg`
- All ~600 lines of results data in `achievements.js`
- The Web3Forms access key and every hidden form field
- All six R2 video URLs
- All 14 article URLs, headlines and publication labels
- Hero desktop/mobile `<picture>` sources

## Mobile

The site must work on a phone, not merely not-break on one. Existing
mobile CSS is extensive but was written per-page and patched three times
over with `!important`; it gets consolidated rather than carried across.

### Breakpoints

Three, replacing the seven currently in use: **1000px**, **700px**,
**500px**. Existing 900/850/600/520 rules fold into the nearest.

### The pinned panel on iOS — the main risk

Mobile Safari collapses and re-expands the URL bar while you scroll,
which changes `innerHeight` mid-gesture. A sticky `100dvh` panel whose
beat maths depends on live `innerHeight` will visibly jump and its beat
boundaries will shift under the reader's thumb. Mitigation:

- Panel height is `100vh` then `100dvh`, so old browsers get a
  reasonable fallback and current ones get the stable unit.
- JS caches the viewport height at init and publishes it as
  `--vh-cached`, which the track height is calculated from. CSS and the
  scroll maths therefore always agree.
- The cache is recomputed **only** on `orientationchange`, or on
  `resize` when `innerWidth` actually changed. A height-only resize —
  which is exactly what the toolbar fires — is ignored.
- Beat transitions are `opacity`/`transform` only, so they stay on the
  compositor and do not trigger layout mid-scroll.

This is the one behaviour DevTools emulation gets wrong, so it needs
checking on a real iPhone.

### Touch targets

Everything interactive gets a minimum 44×44px hit area: nav links in the
menu overlay, SKIP, the PHOTOS/VIDEOS tabs, result category tabs, year
chips, and the lightbox close/prev/next. The current `.mobile-skip` is
`font-size:.55rem` with zero padding — far under the threshold — so it
gains padding while keeping its visual weight.

### SKIP

Fixed bottom-centre, visible from beat 1, above the beat content. On a
phone this matters more than on desktop: it is the escape hatch from
~420vh of scrolling, so it must be obvious and thumb-reachable.

### Navigation

One canonical mobile rule in `style.css`: a 42px hamburger pinned
top-left, a full-screen menu overlay, and `body.mobile-menu-open`
locking scroll. `script.js` already closes the menu on link tap; with
anchors it must close the menu *and then* scroll to the target.
`scroll-margin-top` is set per breakpoint, since the desktop bar and the
mobile button occupy different heights.

### Lightbox — add swipe

Small prev/next arrows are poor on a phone. The archive lightbox gains
horizontal swipe (threshold ~50px, ignoring vertical drags so the page
can still be scrolled away from the image). Arrows stay for desktop and
grow to 44px on touch.

### Video previews

`race.js:59` and `swim.js:43` both set `autoplay` unconditionally. Six
autoplaying R2 streams on a cellular connection is a real cost in data
and battery. Replaced with:

- Under 700px: no autoplay. `preload="metadata"` shows the first frame;
  playback starts on tap.
- 700px and up: an `IntersectionObserver` plays only the preview in
  view and pauses the rest.

`playsinline` is already set on both and stays — without it iOS takes
video fullscreen on play.

### Everything else

- **Hero** already ships `homepage-mobile.jpg` through `<picture>`; the
  three overlapping mobile fix layers merge into one block.
- **Featured track** already uses Pointer Events
  (`featured.js:215-254`), so touch drag works today. No change; verify
  only.
- **Closing quote** uses `clamp()` sizing so the three sentences stack
  one per line at 375px without overflowing.
- **Results and year selector** keep their existing mobile CSS; the year
  row scrolls horizontally rather than wrapping.
- No horizontal page overflow at any breakpoint — the featured track and
  year row scroll inside their own containers, never the body.

## Testing

Manual, in a browser, since the project has no test harness:

1. Every nav item scrolls to its section; GALLERY navigates out.
2. About: all 7 beats appear in order on the way down and in reverse on
   the way up; the panel does not drift; the last beat is the quote.
3. SKIP mid-sequence reveals the full story and leaves the page
   scrollable; the button disappears.
4. PB scramble and medal count-up start when Achievements enters view,
   not on load.
5. Results tabs, year selector, result lightbox and quick summary all
   still work.
6. Featured track still drags and its cards still open.
7. Gallery panel shows 6 photos; a card opens the archive on that photo;
   VIEW MORE reaches the archive.
8. `gallery.html`: PHOTOS order matches the list above; VIDEOS plays all
   six; lightbox arrows and Escape work.
9. Contact form submits; all four social links open, LinkedIn included.
10. Closing quote fills the viewport and is the last thing on the page.
11. Repeat 1–10 at 375×667, 390×844 and 414×896, plus one landscape
    pass.
12. On a **real iPhone in Safari**: scroll the About panel slowly enough
    that the URL bar collapses, and confirm the panel does not jump and
    the beats do not skip. Emulation will not catch this.
13. Confirm no horizontal body scroll at any breakpoint.
14. Confirm video previews do not autoplay under 700px.
15. Swipe the archive lightbox left and right.
16. One pass with reduced-motion enabled.
17. Console clean throughout.

## Out of scope

- Redesigning the hero, achievements, featured or contact visuals
- Changing gallery order or adding `4.jpg`
- New content, photos or videos
- A build step, framework or dependency — it stays plain HTML/CSS/JS
- Rewriting his prose beyond the typos above
