# Single-Page Portfolio Retouch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse a seven-page swimming portfolio into one scrolling page plus a single archive page, replace the About typewriter with a pinned scroll-driven beat panel, and make the whole thing work properly on a phone.

**Architecture:** Plain static HTML/CSS/JS, no build step. `index.html` holds seven sections; `gallery.html` holds the photo and video archive. The About section is a tall scroll track containing a `position: sticky` panel — the page appears frozen while story beats cross-fade under the scroll. Achievements animations move from load-time to an `IntersectionObserver` so they are not missed. Sixteen CSS/JS files consolidate down, removing duplicate rules that only ever worked because pages loaded in isolation.

**Tech Stack:** HTML5, CSS3 (custom properties, `position: sticky`, `dvh`), vanilla ES6. Node is used only to run a zero-dependency invariant checker. No frameworks, no package manager, no build.

**Spec:** `docs/superpowers/specs/2026-08-19-single-page-portfolio-design.md`

## Global Constraints

- **No build step, framework, or dependency.** Plain HTML/CSS/JS only. `tools/verify.js` uses Node built-ins exclusively.
- **Gallery photo order is frozen:** `1.jpg` (featured), then `17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 3, 2`. `4.jpg` exists on disk and stays excluded.
- **Video order is frozen:** SWIM 001, SWIM 002, then RACE 001, 002, 003, 004.
- **Preserve verbatim:** the Web3Forms access key `f6ff404a-3fa5-4e5f-9dfb-1f62fca7d62b`, every hidden form field, all six R2 video URLs, all 14 article URLs with their headlines and publication labels, and the hero `<picture>` sources.
- **About copy: typo fixes only.** Exactly the four in Task 4. Do not otherwise reword.
- **Breakpoints:** only `1000px`, `700px`, `500px`.
- **Viewport units:** declare `100vh` first as fallback, then the `dvh`/cached value. Never `!important`.
- **Touch targets:** minimum 44×44px for every interactive element.
- **Section ids:** `#home`, `#about`, `#achievements`, `#featured`, `#gallery`, `#contact`.
- **Fonts:** every page keeps the existing Google Fonts preconnect + stylesheet links (DM Mono, Manrope, Syne, plus IBM Plex Sans on index and Instrument Serif / IBM Plex Mono on gallery).

## A note on testing

This project has no test harness and the spec forbids adding a framework, so there is no unit-test cycle. Verification is two things, and every task uses both:

1. **`node tools/verify.js`** — a zero-dependency invariant checker built in Task 1. It guards exactly the data a refactor like this silently corrupts: photo order, video URLs, article URLs, form wiring, dead links. Run it after every task.
2. **Explicit browser checks** — each task names what to open, what to do, and what you must observe. Not "check it looks right".

Serve over HTTP, never `file://`, or deep links and observer margins misbehave:

```bash
python3 -m http.server 8000
```

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | The single page: seven sections |
| `gallery.html` | Photo + video archive with PHOTOS/VIDEOS tabs |
| `tools/expected.json` | Frozen snapshot of the invariants, generated once |
| `tools/verify.js` | Checks the site still satisfies that snapshot |
| `assets/css/style.css` | Shared shell: reset, nav, hero, contact, mobile nav |
| `assets/css/home.css` | About stage, gallery panel, closing quote |
| `assets/css/achievements.css` | Achievements section (content unchanged) |
| `assets/css/featured.css` | Featured track (unchanged) |
| `assets/css/gallery.css` | Archive page, absorbing video-card styles |
| `assets/js/script.js` | Shared: mobile nav toggle, cross-document fade |
| `assets/js/home.js` | Cached viewport, About beat driver, nav scroll-spy |
| `assets/js/achievements.js` | Achievements (animations become observer-gated) |
| `assets/js/featured.js` | Featured track (unchanged) |
| `assets/js/gallery.js` | Archive: photos, videos, tabs, lightbox, swipe |

**Deleted at Task 11:** `about.html`, `achievements.html`, `featured.html`, `contact.html`, `watch.html`, `swim.html`, `race.html`, `assets/css/about.css`, `assets/css/watch.css`, `assets/css/race.css`, `assets/css/swim.css`, `assets/js/watch.js`, `assets/js/race.js`, `assets/js/swim.js`.

---

## Task 1: Invariant checker

Freeze the site's data guarantees before touching anything, so every later task can prove it did not lose a photo, a video, or the contact form.

**Files:**
- Create: `tools/expected.json`
- Create: `tools/verify.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `node tools/verify.js` — exits 0 printing `PASS — …`; exits 1 printing each failure prefixed ` x `. Every later task runs it.

- [ ] **Step 1: Generate the frozen snapshot from today's files**

Run once. This reads the *current* site and records what must never change. Do not keep this generator and never re-run it after this point — regenerating would bless a regression as the new truth.

```bash
mkdir -p tools && node -e '
const fs = require("fs");
const read = f => fs.readFileSync(f, "utf8");
const uniq = a => [...new Set(a)];

const gallery = read("assets/js/gallery.js");
const videos  = read("assets/js/race.js") + read("assets/js/swim.js");
const feat    = read("featured.html");

/* The Google Fonts links in <head> are hrefs too. Without this filter
   the count comes out at 17 rather than the 14 article cards. */
const FONT_HOST = /fonts\.(googleapis|gstatic)\.com/;

fs.writeFileSync("tools/expected.json", JSON.stringify({
  galleryOrder: [...gallery.matchAll(/image:\s*"([^"]+)"/g)].map(m => m[1]),
  videoUrls:    uniq([...videos.matchAll(/(https:\/\/pub-[^"]+\.mp4)/g)].map(m => m[1])),
  articleUrls:  uniq([...feat.matchAll(/href="(https?:\/\/[^"]+)"/g)]
                     .map(m => m[1]).filter(u => !FONT_HOST.test(u))),
  formKey:      "f6ff404a-3fa5-4e5f-9dfb-1f62fca7d62b",
  formFields:   ["access_key","subject","from_name","botcheck","name","email","message","redirect"],
  deletedPages: ["about.html","achievements.html","featured.html","contact.html",
                 "watch.html","swim.html","race.html"]
}, null, 2) + "\n");
'
```

- [ ] **Step 2: Confirm the snapshot captured the right values**

```bash
node -e '
const e = require("./tools/expected.json");
console.log("photos  :", e.galleryOrder.length, e.galleryOrder.join(" "));
console.log("videos  :", e.videoUrls.length);
console.log("articles:", e.articleUrls.length);
'
```

Expected exactly:

```
photos  : 16 1.jpg 17.jpg 16.jpg 15.jpg 14.jpg 13.jpg 12.jpg 11.jpg 10.jpg 9.jpg 8.jpg 7.jpg 6.jpg 5.jpg 3.jpg 2.jpg
videos  : 6
articles: 14
```

If photos is not 16, or the order differs, stop — the regex missed entries and every later guarantee would be built on a wrong baseline.

- [ ] **Step 3: Write the checker**

Create `tools/verify.js`:

```js
#!/usr/bin/env node

/* ==========================================
   INVARIANT CHECKER

   Guards the data a large refactor loses quietly: photo order, video
   URLs, article URLs, contact-form wiring, dead links.

   Run: node tools/verify.js
========================================== */

const fs   = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(file){
    try {
        return fs.readFileSync(path.join(ROOT, file), "utf8");
    } catch {
        return "";
    }
}

/* Every file that may legitimately hold site content. Missing files
   read as "" so this works before and after the page deletions. */

const SOURCES = [
    "index.html",
    "gallery.html",
    "featured.html",
    "contact.html",
    "achievements.html",
    "assets/js/gallery.js",
    "assets/js/home.js",
    "assets/js/script.js",
    "assets/js/achievements.js",
    "assets/js/featured.js",
    "assets/js/race.js",
    "assets/js/swim.js"
];

const expected = JSON.parse(read("tools/expected.json"));
const haystack = SOURCES.map(read).join("\n");

const failures = [];

function check(condition, message){
    if(!condition){
        failures.push(message);
    }
}

/* 1. Gallery photo order, exactly */

const order = [...read("assets/js/gallery.js")
    .matchAll(/image:\s*"([^"]+)"/g)].map(m => m[1]);

check(
    JSON.stringify(order) === JSON.stringify(expected.galleryOrder),
    "gallery order changed\n" +
    "      expected: " + expected.galleryOrder.join(" ") + "\n" +
    "      actual:   " + order.join(" ")
);

check(
    !order.includes("4.jpg"),
    "4.jpg was added to the gallery; it is deliberately excluded"
);

/* 2. Media and article URLs all still reachable somewhere */

expected.videoUrls.forEach(url =>
    check(haystack.includes(url), "missing video URL: " + url));

expected.articleUrls.forEach(url =>
    check(haystack.includes(url), "missing article URL: " + url));

/* 3. Contact form wiring */

check(haystack.includes(expected.formKey),
    "Web3Forms access key missing — the contact form is dead");

expected.formFields.forEach(field =>
    check(haystack.includes('name="' + field + '"'),
        "missing form field: " + field));

/* 4. No links to pages that were removed */

expected.deletedPages.forEach(page => {
    if(!fs.existsSync(path.join(ROOT, page))){
        check(!haystack.includes('"' + page + '"'),
            "dead link to removed page: " + page);
    }
});

/* 5. Protocol-less external hrefs resolve as relative paths and 404 */

const protocolLess = [...haystack.matchAll(/href="www\.[^"]+"/g)]
    .map(m => m[0]);

check(protocolLess.length === 0,
    "protocol-less href (resolves relative, 404s): " + protocolLess.join(", "));

/* ==========================================
   REPORT
========================================== */

if(failures.length){
    console.error("FAIL\n" + failures.map(f => "    x " + f).join("\n"));
    process.exit(1);
}

console.log(
    "PASS — " + expected.galleryOrder.length + " photos, " +
    expected.videoUrls.length + " videos, " +
    expected.articleUrls.length + " articles, form intact"
);
```

- [ ] **Step 4: Run it against the untouched site**

```bash
node tools/verify.js
```

Expected: `FAIL` with exactly one failure — the protocol-less LinkedIn href in `contact.html`. That single failure is correct and proves the checker works; Task 2 fixes it.

If it reports anything else, the checker is wrong, not the site. Fix it before moving on.

- [ ] **Step 5: Commit**

```bash
git add tools/expected.json tools/verify.js
git commit -m "Add invariant checker for the single-page refactor

Freezes photo order, video and article URLs, and contact-form wiring so
the seven-page-to-one-page move can be proven not to lose data."
```

---

## Task 2: Shared shell cleanup and bug fixes

Remove the dead and duplicated code that only survived because pages loaded in isolation, and fix the four live bugs. Every existing page must still work at the end of this task — no restructuring yet.

**Files:**
- Modify: `assets/js/script.js` — delete lines 140–232, narrow the fade at 116–135
- Modify: `assets/css/style.css` — delete 452–638, fix 143–157
- Modify: `contact.html:82`
- Modify: `assets/css/achievements.css` — delete 983–1025; `assets/css/gallery.css` — delete 519–565

`assets/css/about.css` also carries a copy of the nav hack, but Task 11 deletes that whole file, so it is deliberately left alone here.

**Line numbers below are exact as of commit `b54ce39`, and every deletion step previews its boundaries with `sed -n` before cutting. Read that output and confirm it matches before running the `sed -i` line** — an off-by-one here leaves a dangling `/* ===` comment opener that silently swallows the rule after it.

**Interfaces:**
- Consumes: `node tools/verify.js` from Task 1.
- Produces: `script.js` exporting nothing, but guaranteeing (a) the mobile nav toggle still works on every page, and (b) `.page-fade` interception applies **only** to links whose target is a different document — Task 3 relies on this so in-page anchors scroll instead of reloading.

- [ ] **Step 1: Fix the LinkedIn href**

`contact.html:82` currently reads `href="www.linkedin.com/in/adhithya-dinesh-5b82bb268"`. With no protocol the browser treats it as a relative path and 404s.

```bash
sed -i '' 's|href="www\.linkedin\.com|href="https://www.linkedin.com|' contact.html
grep -n 'linkedin' contact.html
```

Expected: the href now begins `https://www.linkedin.com/in/`.

- [ ] **Step 2: Verify the checker now passes**

```bash
node tools/verify.js
```

Expected: `PASS — 16 photos, 6 videos, 14 articles, form intact`

- [ ] **Step 3: Delete the dead PB scramble and medal count from `script.js`**

Lines 141–232 hold two blocks that never worked:

- `PERSONAL-BEST TIME SCRAMBLE` reads `time.dataset.time`, an attribute absent from the markup. `finalTime.length` throws a `TypeError` inside a `setInterval` that is never cleared, so four timers fire and throw every 35 ms for as long as the achievements page is open.
- `MEDAL SUMMARY COUNT-UP` selects `.medal-count`; the markup uses `.achievement-medal-count`, so it matches nothing.

The working versions of both live in `achievements.js`. Delete lines **140 through 232** inclusive — line 140 is the `/* ===` that opens the `PERSONAL-BEST TIME SCRAMBLE` comment, and 232 is the blank line before the `/* ===` opening `ABOUT PAGE — FULL SCREEN TYPEWRITER` at 233.

```bash
sed -n '137,143p' assets/js/script.js   # 140 must be the /* === opener
sed -n '228,236p' assets/js/script.js   # 233 must be the next /* === opener
sed -i '' '140,232d' assets/js/script.js
grep -n "dataset.time\|\.medal-count" assets/js/script.js
node -e 'new Function(require("fs").readFileSync("assets/js/script.js","utf8"))' \
  && echo "script.js parses"
```

Expected: the `grep` prints nothing and `script.js parses` is printed. The parse check is what catches a mis-cut that orphaned a brace or a comment opener.

- [ ] **Step 4: Confirm the achievements page console is now clean**

Open `http://localhost:8000/achievements.html`, open DevTools console, and let it sit for 10 seconds.

Expected: no `TypeError`. Before this change it repeated roughly 28 times per second. The PB times and medal tallies must still animate — those come from `achievements.js`, which is untouched.

- [ ] **Step 5: Narrow the page fade to cross-document links only**

`script.js:116-135` calls `preventDefault()` on every `.navbar a` click. Task 3 introduces anchor links, which must scroll rather than reload. Replace the `forEach` body so same-document links are left alone.

Find:

```js
    document.querySelectorAll(".navbar a").forEach(link => {

        if (link.pathname === window.location.pathname) return;
```

Replace with:

```js
    document.querySelectorAll(".navbar a").forEach(link => {

        /* In-page anchors must scroll, not reload. Only fade for links
           that genuinely leave the current document. */

        if (link.getAttribute("href").startsWith("#")) return;

        if (link.pathname === window.location.pathname) return;
```

- [ ] **Step 6: Delete the duplicated achievements CSS from `style.css`**

`style.css:453-638` defines `.achievements-page`, `.pb-card`, `.pb-time`, `.event-name`, `.medal-summary`, `.medal-tally`, `.medal-count` and `.medal-emoji`. `achievements.css` defines all of them again and, loading second, wins. The `style.css` copies are dead weight that will silently fight the real rules once everything shares one page.

Delete lines **452 through 638** — 452 is the `/* ===` opening `ACHIEVEMENTS — PERSONAL BESTS`, and 639 is the `/* ===` opening `PAGE FADE`, which must survive.

```bash
sed -n '449,455p' assets/css/style.css   # 452 must be the /* === opener
sed -n '634,642p' assets/css/style.css   # 639 must be the next /* === opener
sed -i '' '452,638d' assets/css/style.css
grep -n "pb-card\|medal-tally\|achievements-page" assets/css/style.css
grep -c "{" assets/css/style.css && grep -c "}" assets/css/style.css
```

Expected: the brace counts match each other. But the selector `grep` will still report four hits at roughly lines 524–558 — **a second layer of duplication the spec's collision scan missed**, inside `@media (max-width: 600px)` and `@media (max-width: 520px)`. Delete those too, lines **523–562**:

```bash
awk 'NR>=521 && NR<=523 {printf "%d: %s\n", NR, $0}' assets/css/style.css
awk 'NR>=560 && NR<=564 {printf "%d: %s\n", NR, $0}' assets/css/style.css  # 563 must be @keyframes pageFade
sed -i '' '523,562d' assets/css/style.css
grep -n "pb-card\|medal-tally\|achievements-page\|medal-summary\|pb-intro\|personal-bests" assets/css/style.css
```

Both blocks are safe to remove, for two independent reasons:

- `.pb-intro` and `.personal-bests` match **zero** elements in the markup — leftovers from an earlier design.
- `.achievements-page`, `.pb-card`, `.medal-summary` and `.medal-tally` are all redefined at mobile widths inside `achievements.css` (lines 941, 1059, 1111, 1125, and again at 1300, 1316, 1346), which loads afterwards and already wins.

Deleting them also removes a nested `@media (max-width: 1000px)` sitting *inside* the `600px` block, whose outer condition made the inner one unreachable above 600px.

Expected after this second cut: the selector `grep` prints nothing, braces balance, and 227 lines total have left `style.css`.

- [ ] **Step 7: Verify achievements still renders identically**

Reload `http://localhost:8000/achievements.html`.

Expected: personal-best cards, medal tally and results all look exactly as before. If anything lost its styling, a rule was unique to `style.css` after all — restore just that rule into `achievements.css`.

- [ ] **Step 8: Make the nav stagger animation actually run**

`style.css:143-157` targets `.home .navbar a`, but no page sets `class="home"` on `<body>`, so the animation has never run. It also only covers five links while the nav has six.

Change the six selectors from `.home .navbar a` to `.navbar a`, and add a sixth delay:

```css
.navbar a{

    opacity:0;

    transform:translateY(-12px);

    animation:navLinkFade .8s ease forwards;
}

.navbar a:nth-child(1){animation-delay:.2s;}
.navbar a:nth-child(2){animation-delay:.3s;}
.navbar a:nth-child(3){animation-delay:.4s;}
.navbar a:nth-child(4){animation-delay:.5s;}
.navbar a:nth-child(5){animation-delay:.6s;}
.navbar a:nth-child(6){animation-delay:.7s;}
```

Keep these rules where they already sit, after the base `.navbar a` block, so the `opacity` and `transform` here override the base.

- [ ] **Step 9: Consolidate the duplicated mobile nav hack**

**Corrected during execution.** The spec's collision table said three files carried this hack. The real count is **seven**, and `style.css` already holds a canonical copy — at `style.css:1010`, which *looks* homepage-scoped because it sits under a section comment reading `HOMEPAGE — FINAL MOBILE FIX`, but whose selector `.navbar:not(.mobile-open)` is unscoped and so applies to every page. So there is nothing to add; there are six redundant copies to remove.

Two of the copies are in files `index.html` will load (`contact.css`, `featured.css`), which is why they matter rather than being merely untidy.

First strip `!important` from the canonical rule. It is safe to remove: `.navbar:not(.mobile-open)` is two classes' worth of specificity against the base `.navbar` rule's one, and it appears later in the file, so it wins on both counts without help.

```bash
sed -i '' '1010,1047s/ *!important//g' assets/css/style.css
awk 'NR>=1010 && NR<=1014 {printf "%d: %s\n", NR, $0}' assets/css/style.css
```

Then delete the redundant copies. Work **highest line number first within a file**, or earlier deletions shift the later ranges:

| File | Delete | Note |
|---|---|---|
| `assets/css/style.css` | `1190-1233` | a `.featured-page`-prefixed clone, byte-identical to 1010 |
| `assets/css/featured.css` | `255-297` | inert after Task 6 anyway, since `.featured-page` moves onto a section and the nav is not its descendant |
| `assets/css/contact.css` | `25-72` | dedented to column 0, which makes it *look* top-level; it is in fact inside the `@media screen and (max-width:700px)` opened at line 5 |
| `assets/css/achievements.css` | `983-1025` | line 1026 opens `HERO` and must survive |
| `assets/css/gallery.css` | `519-565` | brings its own `@media` wrapper; line 566 opens a different `@media` holding `.gallery-top` |

`about.css`, `watch.css`, `race.css` and `swim.css` keep their copies — Task 11 deletes those files, and only the old pages load them until then.

Verify placement and balance afterwards:

```bash
grep -rln "navbar:not(.mobile-open)" assets/css/
for f in style achievements gallery featured contact; do
  o=$(grep -o '{' assets/css/$f.css | wc -l | tr -d ' ')
  c=$(grep -o '}' assets/css/$f.css | wc -l | tr -d ' ')
  printf "  %-18s %s / %s  %s\n" "$f.css" "$o" "$c" "$([ "$o" = "$c" ] && echo OK || echo MISMATCH)"
done
```

Expected: only `style.css` plus the four Task-11 casualties are listed, and every brace count matches.

<details>
<summary>The canonical rule, for reference — already present at <code>style.css:1010</code>, do not re-add</summary>

```css
@media(max-width:700px){

    .navbar:not(.mobile-open){

        position:fixed;

        top:22px;
        left:22px;
        right:auto;

        width:42px;
        height:42px;

        margin:0;
        padding:0;

        transform:none;

        z-index:10000;
    }

    .navbar:not(.mobile-open) .menu-toggle{

        position:absolute;

        top:0;
        left:0;

        transform:none;

        margin:0;
    }

}
```

</details>

- [ ] **Step 10: Verify the mobile nav on every page**

At 375px wide, load `index.html`, `about.html`, `achievements.html`, `gallery.html`, `featured.html`, `contact.html`.

Expected on each: a 42px hamburger at top-left; tapping opens a full-screen menu; the page behind does not scroll while it is open; tapping a link closes it and navigates.

- [ ] **Step 11: Run the checker and commit**

```bash
node tools/verify.js
git add assets/js/script.js assets/css/style.css \
        assets/css/achievements.css assets/css/gallery.css contact.html
git commit -m "Remove dead code and duplicate rules; fix four live bugs

- script.js PB scramble read a nonexistent data-time attribute, throwing
  a TypeError in an uncleared setInterval ~28x/sec on the achievements page
- script.js medal count-up selected .medal-count; markup uses
  .achievement-medal-count, so it matched nothing
- .home .navbar a nav stagger never ran: no page sets class=\"home\"
- LinkedIn href had no protocol, resolving relative and 404ing

Also drops the achievements CSS duplicated in style.css and collapses the
mobile nav hack that three files each redefined with !important."
```

---

## Task 3: `index.html` shell — nav, hero, closing quote

Build the page frame and the two simplest sections. This produces something viewable end-to-end before the harder sections land.

**Files:**
- Modify: `index.html` (full rewrite)
- Create: `assets/css/home.css`
- Create: `assets/js/home.js`

**Interfaces:**
- Consumes: the narrowed `.page-fade` behaviour from Task 2 Step 5.
- Produces:
  - `home.js` sets `--vh-cached` on `:root` — a px length that Task 4's About track height is calculated from.
  - `home.js` exposes nothing globally; it is an IIFE-free top-level script loaded after `script.js`.
  - CSS custom properties available to later tasks: `--vh-cached` (length), `--beat-h` (unitless multiplier).
  - Section ids `#home` and `#contact` exist; Tasks 4–8 fill in `#about`, `#achievements`, `#featured`, `#gallery`.

- [ ] **Step 1: Write the new `index.html`**

Replace the whole file. Section shells for the not-yet-built sections are present but empty so the nav works from the start.

```html
<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Adhithya Dinesh</title>

    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/achievements.css">
    <link rel="stylesheet" href="assets/css/featured.css">
    <link rel="stylesheet" href="assets/css/home.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@300;400;500;600&family=Syne:wght@500;600;700;800&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">

</head>

<body>

<nav class="navbar">

    <a href="#home">HOME</a>

    <a href="#about">ABOUT</a>

    <a href="#achievements">ACHIEVEMENTS</a>

    <a href="#featured">FEATURED</a>

    <a href="gallery.html">GALLERY</a>

    <a href="#contact">CONTACT</a>

</nav>


<!-- ==========================================
     1 — HERO
========================================== -->

<section class="hero" id="home">

    <picture>

        <source
            media="(max-width:700px)"
            srcset="assets/images/homepage-mobile.jpg">

        <img
            src="assets/images/homepage.jpg"
            alt="Adhithya Dinesh">

    </picture>

    <div class="overlay"></div>

    <div class="hero-text">

        <h1 class="hero-name">
            ADHITHYA<br>
            DINESH
        </h1>

    </div>

</section>


<!-- ==========================================
     2 — ABOUT          (Task 4)
========================================== -->

<section id="about"></section>


<!-- ==========================================
     3 — ACHIEVEMENTS   (Task 5)
========================================== -->

<section id="achievements"></section>


<!-- ==========================================
     4 — FEATURED       (Task 6)
========================================== -->

<section id="featured"></section>


<!-- ==========================================
     5 — GALLERY        (Task 7)
========================================== -->

<section id="gallery"></section>


<!-- ==========================================
     6 — CONTACT        (Task 8)
========================================== -->

<section id="contact"></section>


<!-- ==========================================
     7 — CLOSING QUOTE
========================================== -->

<section class="closing">

    <blockquote class="closing-quote">

        <span>17 years.</span>
        <span>One sport.</span>
        <span>Still not finished.</span>

    </blockquote>

</section>


<script src="assets/js/script.js"></script>
<script src="assets/js/home.js"></script>

</body>

</html>
```

Note there is no `.page-fade` wrapper. It existed to cross-fade between documents; a single page has nothing to fade to. The `GALLERY` link still fades because `script.js` finds `.page-fade` absent and simply skips — verify this in Step 5.

- [ ] **Step 2: Create `assets/css/home.css`**

```css
/* ==========================================
   TOKENS

   --vh-cached is written by home.js from a viewport height that is
   deliberately NOT updated when only the height changes. iOS Safari
   collapses its URL bar mid-scroll, and a sticky panel sized from live
   innerHeight jumps when it does.

   --beat-h is a unitless multiplier of that height, so the About track
   shortens on small screens without changing the beat maths.
========================================== */

:root{
    --beat-h:1;
}

@media(max-width:700px){
    :root{ --beat-h:.7; }
}

@media(max-width:500px){
    :root{ --beat-h:.6; }
}


/* ==========================================
   ANCHOR OFFSET

   Sections must clear the fixed navbar when jumped to.
========================================== */

section[id]{
    scroll-margin-top:96px;
}

@media(max-width:700px){
    section[id]{ scroll-margin-top:80px; }
}


/* ==========================================
   NAV ACTIVE STATE
========================================== */

.navbar a.active{
    color:#fff;
}

.navbar a.active::after{

    content:"";

    position:absolute;

    left:0;
    right:0;
    bottom:-6px;

    height:1px;

    background:rgba(255,255,255,.75);
}


/* ==========================================
   CLOSING QUOTE
========================================== */

.closing{

    display:flex;
    align-items:center;
    justify-content:center;

    min-height:100vh;
    min-height:100dvh;

    padding:12vh 8vw;

    background:#000;
}

.closing-quote{

    margin:0;

    font-family:"Syne",sans-serif;

    font-size:clamp(1.6rem,5.2vw,4.2rem);
    font-weight:700;

    line-height:1.16;
    letter-spacing:-.025em;

    color:#f4f1e8;

    text-align:center;
}

.closing-quote span{
    display:block;
}

.closing-quote span:last-child{
    color:rgba(244,241,232,.55);
}
```

- [ ] **Step 3: Create `assets/js/home.js`**

```js
/* ==========================================
   CACHED VIEWPORT HEIGHT

   Mobile Safari fires resize whenever the URL bar collapses or expands
   during a scroll. Sizing the About track from live innerHeight makes
   the sticky panel jump and shifts beat boundaries under the reader's
   thumb. So: cache the height, and only recompute it when the WIDTH
   actually changed, or on a real orientation change.
========================================== */

let cachedHeight = window.innerHeight;
let cachedWidth  = window.innerWidth;


function publishViewport(){

    cachedHeight = window.innerHeight;
    cachedWidth  = window.innerWidth;

    document.documentElement.style.setProperty(
        "--vh-cached",
        cachedHeight + "px"
    );

}


publishViewport();


window.addEventListener("resize", () => {

    /* Height-only change means the toolbar moved. Ignore it. */

    if(window.innerWidth === cachedWidth) return;

    publishViewport();

});


window.addEventListener("orientationchange", () => {

    /* Safari reports stale dimensions immediately after the flip. */

    setTimeout(publishViewport, 200);

});


/* ==========================================
   NAV SCROLL SPY
========================================== */

const spyLinks = [...document.querySelectorAll(".navbar a[href^='#']")];

const spySections = spyLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);


if(spySections.length){

    const spy = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if(!entry.isIntersecting) return;

            spyLinks.forEach(link =>
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === "#" + entry.target.id
                )
            );

        });

    },{
        rootMargin:"-45% 0px -55% 0px"
    });

    spySections.forEach(section => spy.observe(section));

}
```

- [ ] **Step 4: Verify hero, quote and `--vh-cached`**

Load `http://localhost:8000/`.

Expected:
- The hero fills the viewport with the photo, the dark overlay, and `ADHITHYA DINESH`, animating in exactly as before.
- Nav links stagger in — visible now that Task 2 fixed the selector.
- Scrolling to the bottom shows the closing quote filling a full screen on black, three lines, the last one dimmer.
- In the console, `getComputedStyle(document.documentElement).getPropertyValue('--vh-cached')` returns a px value matching `window.innerHeight`.

- [ ] **Step 5: Verify nav behaviour**

Expected:
- Clicking `CONTACT` scrolls down to the (currently empty) contact section — it does **not** reload the page. If it reloads, Task 2 Step 5 was not applied.
- Clicking `GALLERY` navigates to `gallery.html`.
- Scrolling from top to bottom lights `HOME` then `CONTACT` in turn, underlined. Empty sections have no height so they will be skipped — that is expected until Tasks 4–8 fill them.

- [ ] **Step 6: Commit**

```bash
node tools/verify.js
git add index.html assets/css/home.css assets/js/home.js
git commit -m "Build single-page shell: nav, hero, closing quote

Nav uses in-page anchors plus a scroll spy. home.js caches the viewport
height and refuses to update it on height-only resizes, which is what
mobile Safari fires when its URL bar collapses."
```

---

## Task 4: The About panel

The centrepiece. A tall track with a sticky panel inside it, so the page appears to hold still while seven story beats cross-fade under the scroll.

**Files:**
- Modify: `index.html` — replace `<section id="about"></section>`
- Modify: `assets/css/home.css` — append the About block
- Modify: `assets/js/home.js` — append the beat driver

**Interfaces:**
- Consumes: `--vh-cached` and `--beat-h` from Task 3.
- Produces: `.about-stage` carrying `--beats` as an inline custom property, and the `.is-skipped` class contract that CSS keys off. Nothing later depends on the JS.

- [ ] **Step 1: Replace the About section in `index.html`**

The copy is lifted from `assets/js/script.js:244-260` with exactly four typo fixes: `Iam` to `I'm`, `hundered` to `hundred`, `the spotlight i needed` to `I needed`, and the mid-sentence `, A bronze` to `, a bronze`.

Beat 3 keeps *"most of my life in the water than on land"* verbatim. That is a grammar slip rather than a typo, and the decision was typos only — it is flagged as an open question in the spec, not silently corrected here.

```html
<section id="about" class="about-stage" style="--beats:7">

    <div class="about-panel">

        <div class="about-backdrop"></div>

        <div class="about-beats">

            <article class="beat is-active">
                <p>Hi, I'm Adhi,</p>
            </article>

            <article class="beat">
                <p>I was six when I was first pushed into a swimming pool.</p>
                <p>Not to become a swimmer.</p>
                <p>just to get the fear of water out of my way...</p>
            </article>

            <article class="beat">
                <p>Seventeen years later, I have spent most of my life in the water than on land.</p>
            </article>

            <article class="beat">
                <p>What began as a summer coaching camp became a journey through early mornings, double sessions, school days, competition, failure, growth — and eventually, representing India on the international stages.</p>
            </article>

            <article class="beat">
                <p>A few golds at the South Asian aquatic championships, a bronze at the 10th Asian age group championships and a hundred other medals at national level gave me the spotlight I needed along with countless moments in between that never made the podium but shaped the athlete I became.</p>
            </article>

            <article class="beat">
                <p>Swimming taught me that progress rarely looks dramatic. Most of it happens quietly — at 5 in the morning, when nobody is watching, when you choose to get in again.</p>
            </article>

            <article class="beat beat-final">
                <p>17 years. One sport. Still not finished.</p>
            </article>

        </div>

        <ol class="beat-progress" aria-hidden="true">
            <li class="is-active"></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ol>

        <button type="button" class="about-skip">
            SKIP <span aria-hidden="true">&rarr;</span>
        </button>

    </div>

    <div class="about-full">

        <p>Hi, I'm Adhi,</p>

        <p>I was six when I was first pushed into a swimming pool.</p>

        <p>Not to become a swimmer.</p>

        <p>just to get the fear of water out of my way...</p>

        <p>Seventeen years later, I have spent most of my life in the water than on land.</p>

        <p>What began as a summer coaching camp became a journey through early mornings, double sessions, school days, competition, failure, growth — and eventually, representing India on the international stages.</p>

        <p>A few golds at the South Asian aquatic championships, a bronze at the 10th Asian age group championships and a hundred other medals at national level gave me the spotlight I needed along with countless moments in between that never made the podium but shaped the athlete I became.</p>

        <p>Swimming taught me that progress rarely looks dramatic. Most of it happens quietly — at 5 in the morning, when nobody is watching, when you choose to get in again.</p>

        <p>17 years. One sport. Still not finished.</p>

    </div>

</section>
```

- [ ] **Step 2: Append the About styles to `home.css`**

```css
/* ==========================================
   ABOUT — SCROLL TRACK

   The track is tall; the panel inside it sticks. Height comes from the
   cached viewport value so the maths in home.js and the layout here
   always agree.
========================================== */

.about-stage{

    position:relative;

    height:calc(var(--beats) * var(--beat-h) * var(--vh-cached, 100vh));

    background:#000;
}


.about-panel{

    position:sticky;
    top:0;

    overflow:hidden;

    display:flex;
    align-items:center;
    justify-content:center;

    height:100vh;
    height:var(--vh-cached, 100dvh);

    padding:12vh 10vw;
}


/* ==========================================
   BACKDROP
========================================== */

.about-backdrop{

    position:absolute;
    inset:-15px;

    background:url("../images/about.jpg") center center / cover no-repeat;

    filter:blur(7px);

    transform:scale(1.05);

    z-index:0;
}


.about-panel::after{

    content:"";

    position:absolute;
    inset:0;

    background:
        linear-gradient(
            90deg,
            rgba(0,0,0,.88) 0%,
            rgba(0,0,0,.68) 45%,
            rgba(0,0,0,.48) 75%,
            rgba(0,0,0,.74) 100%
        );

    pointer-events:none;

    z-index:1;
}


/* ==========================================
   BEATS

   All beats are stacked; exactly one carries .is-active. Only opacity
   and transform animate, so transitions stay off the layout path.
========================================== */

.about-beats{

    position:relative;

    z-index:2;

    width:min(900px,100%);
}


.beat{

    position:absolute;

    top:50%;
    left:0;
    right:0;

    opacity:0;

    transform:translateY(12px) translateZ(0);

    transition:
        opacity .5s ease,
        transform .5s ease;

    pointer-events:none;
}


.beat.is-active{

    opacity:1;

    transform:translateY(0) translateZ(0);
}


.beat p{

    margin:0 0 .9em;

    font-family:"DM Mono",monospace;

    font-size:clamp(.95rem,1.5vw,1.35rem);

    line-height:1.55;
    letter-spacing:.01em;

    color:rgba(244,241,232,.88);

    text-shadow:
        0 0 6px rgba(150,230,240,.28),
        0 0 18px rgba(80,200,220,.12),
        0 2px 12px rgba(0,0,0,.55);
}


.beat p:last-child{
    margin-bottom:0;
}


.beat-final p{

    font-family:"Syne",sans-serif;

    font-size:clamp(1.5rem,4vw,3rem);
    font-weight:700;

    line-height:1.15;
    letter-spacing:-.02em;

    color:#f4f1e8;
}


/* ==========================================
   PROGRESS TICKS
========================================== */

.beat-progress{

    position:absolute;

    left:max(3vw,18px);
    top:50%;

    transform:translateY(-50%);

    z-index:3;

    display:flex;
    flex-direction:column;
    gap:10px;

    margin:0;
    padding:0;

    list-style:none;
}


.beat-progress li{

    width:2px;
    height:16px;

    background:rgba(255,255,255,.22);

    transition:background .35s ease;
}


.beat-progress li.is-active{
    background:rgba(255,255,255,.85);
}


/* ==========================================
   SKIP

   Bottom centre, 44px minimum hit area. On a phone this is the escape
   hatch from several screens of scrolling, so it must be reachable.
========================================== */

.about-skip{

    position:absolute;

    left:50%;
    bottom:24px;

    transform:translateX(-50%);

    z-index:4;

    min-width:88px;
    min-height:44px;

    padding:12px 18px;

    background:none;
    border:1px solid rgba(255,255,255,.18);
    border-radius:2px;

    font-family:"DM Mono",monospace;

    font-size:.62rem;

    letter-spacing:.2em;

    color:rgba(255,255,255,.55);

    cursor:pointer;

    transition:
        color .3s ease,
        border-color .3s ease;
}


.about-skip:hover,
.about-skip:focus-visible{

    color:#fff;

    border-color:rgba(255,255,255,.5);
}


/* ==========================================
   FULL TEXT — hidden until skipped
========================================== */

.about-full{
    display:none;
}


/* ==========================================
   SKIPPED STATE

   Collapse the track, release the panel, swap beats for the full story.
========================================== */

.about-stage.is-skipped{
    height:auto;
}


.about-stage.is-skipped .about-panel{

    position:static;

    height:auto;

    min-height:100vh;
    min-height:100dvh;

    align-items:flex-start;
}


.about-stage.is-skipped .about-beats,
.about-stage.is-skipped .beat-progress,
.about-stage.is-skipped .about-skip{
    display:none;
}


.about-stage.is-skipped .about-full{

    display:block;

    position:relative;

    z-index:2;

    width:min(900px,100%);

    margin:0 auto;
}


.about-full p{

    margin:0 0 1.15em;

    font-family:"DM Mono",monospace;

    font-size:clamp(.9rem,1.3vw,1.15rem);

    line-height:1.6;

    color:rgba(244,241,232,.85);
}


.about-full p:last-child{

    margin-top:1.6em;

    font-family:"Syne",sans-serif;

    font-size:clamp(1.2rem,2.6vw,2rem);
    font-weight:700;

    color:#f4f1e8;
}
```

- [ ] **Step 3: Append the beat driver to `home.js`**

```js
/* ==========================================
   ABOUT — BEAT DRIVER

   Maps scroll position within the track to one active beat. Reads the
   cached viewport height, never live innerHeight, so a collapsing
   mobile toolbar cannot shift the boundaries mid-gesture.
========================================== */

const aboutStage = document.querySelector(".about-stage");

if(aboutStage){

    const beats = [...aboutStage.querySelectorAll(".beat")];

    const ticks = [...aboutStage.querySelectorAll(".beat-progress li")];

    const skipButton = aboutStage.querySelector(".about-skip");

    let activeBeat = 0;
    let frameQueued = false;
    let skipped = false;


    function setActiveBeat(next){

        if(next === activeBeat) return;

        beats[activeBeat].classList.remove("is-active");

        if(ticks[activeBeat]){
            ticks[activeBeat].classList.remove("is-active");
        }

        activeBeat = next;

        beats[activeBeat].classList.add("is-active");

        if(ticks[activeBeat]){
            ticks[activeBeat].classList.add("is-active");
        }

    }


    function measure(){

        const travel = aboutStage.offsetHeight - cachedHeight;

        if(travel <= 0) return;

        const offset = -aboutStage.getBoundingClientRect().top;

        const progress = Math.min(Math.max(offset / travel, 0), 1);

        setActiveBeat(
            Math.min(
                beats.length - 1,
                Math.floor(progress * beats.length)
            )
        );

    }


    function onScroll(){

        if(frameQueued || skipped) return;

        frameQueued = true;

        requestAnimationFrame(() => {
            frameQueued = false;
            measure();
        });

    }


    function skip(){

        if(skipped) return;

        skipped = true;

        aboutStage.classList.add("is-skipped");

        window.removeEventListener("scroll", onScroll);

    }


    skipButton.addEventListener("click", skip);


    document.addEventListener("keydown", event => {

        if(event.key === "Enter" && !skipped){
            skip();
        }

    });


    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){

        skip();

    }else{

        window.addEventListener("scroll", onScroll, { passive:true });

        measure();

    }

}
```

- [ ] **Step 4: Verify the beat sequence**

Load `http://localhost:8000/` and scroll slowly from the hero into About.

Expected:
- The panel locks to the viewport; the blurred portrait and gradient stay put.
- Beat 1 (`Hi, I'm Adhi,`) is showing on arrival.
- Continuing to scroll advances through all seven beats in order, each cross-fading and rising slightly. The panel itself does not move.
- The progress ticks on the left advance in step.
- Beat 7 is the quote, in large Syne type.
- Scrolling further releases the panel and Achievements follows.
- Scrolling back **up** walks the beats in reverse.

- [ ] **Step 5: Verify SKIP**

Reload, scroll to beat 3, click `SKIP`.

Expected:
- The beat machinery, ticks and button all disappear.
- The full story appears as one readable column, ending in the quote at larger size.
- The page is immediately scrollable onward to Achievements — no dead space where the track used to be.
- No console errors, and scrolling further does nothing beat-related.

Reload and press `Enter` instead. Same outcome.

- [ ] **Step 6: Verify reduced motion**

macOS: System Settings > Accessibility > Display > Reduce motion. Or DevTools: Rendering panel > Emulate CSS `prefers-reduced-motion: reduce`.

Expected: About loads already in the skipped state — full text, no beats, no SKIP button, no pinning.

- [ ] **Step 7: Commit**

```bash
node tools/verify.js
git add index.html assets/css/home.css assets/js/home.js
git commit -m "Replace About typewriter with pinned beat panel

Seven beats cross-fade under the scroll while a sticky panel holds the
page visually still. SKIP and Enter both collapse the track and reveal
the full story; reduced-motion starts there. Track height derives from
the cached viewport so a collapsing mobile toolbar cannot shift beat
boundaries mid-scroll.

Copy carries four typo fixes only: Iam, hundered, lowercase i, and a
mid-sentence capital A."
```

---

## Task 5: Achievements section

Move the markup in, and change *when* the animations fire — on a single page, load-time animations finish while the visitor is still looking at the hero.

**Files:**
- Modify: `index.html` — replace `<section id="achievements"></section>`
- Modify: `assets/js/achievements.js:74-82` and `:1331`

**Interfaces:**
- Consumes: `achievements.css`, already linked in Task 3.
- Produces: nothing other tasks depend on. `achievements.js` stays a self-contained IIFE plus its trailing quick-summary block.

- [ ] **Step 1: Move the markup**

Copy three blocks out of `achievements.html` verbatim:

| From | Lines | Into |
|---|---|---|
| `<div class="achievements-background">` | `24` | just inside the new section |
| `<main class="achievements-page">` … `</main>` | `52-277` | the section body |
| `<div class="result-lightbox">` … `</div>` | `284-314` | end of `index.html`, before the scripts |
| `<div class="quick-summary-lightbox" id="…">` … `</div>` | `320-463` | end of `index.html`, before the scripts |

Both lightboxes are fixed-position overlays; they belong as siblings of the sections, not inside `#achievements`.

Replace `<section id="achievements"></section>` with:

```html
<section id="achievements">

    <div class="achievements-background"></div>

    <!-- paste achievements.html:52-277 (<main class="achievements-page"> … </main>) here -->

</section>
```

Change the inner `<h1>ACHIEVEMENTS</h1>` hero heading nothing — leave it exactly as it is.

- [ ] **Step 2: Add the scripts to `index.html`**

The script block at the end becomes:

```html
<script src="assets/js/script.js"></script>
<script src="assets/js/achievements.js?v=4"></script>
<script src="assets/js/home.js"></script>
```

Bump the cache-buster from `v=3` to `v=4` — the file changes in Step 4 and the old query string is already pinned in browsers that visited the site.

- [ ] **Step 3: Verify it renders and animates (wrongly, for now)**

Load `http://localhost:8000/` and scroll to Achievements.

Expected: everything renders — PB cards, medal tally, quick-summary button, results tabs, year selector, competition rows. Both lightboxes open and close.

Expected **and wrong**: the PB times and medal counts are already at their final values, because they animated during the hero. Step 4 fixes this. Confirm you see the bug now, so you can confirm the fix later.

- [ ] **Step 4: Gate the animations behind an observer**

Two edits inside `achievements.js`.

First, replace lines 74–82 — the block that scrambles the PB times immediately:

```js
pbTimes.forEach((time,index)=>{

    scramblePB(
        time,
        time.textContent.trim(),
        index * 120
    );

});
```

with a version that captures the values now and animates later. Capturing at load matters: the markup holds the real times, and blanking them straight away avoids a visible flip from the real value to `00.00` when the section scrolls in.

```js
/* Capture the real times before anything overwrites them, blank the
   display, and hold the animation until the section is actually seen. */

const pbValues = [...pbTimes].map(time => time.textContent.trim());

pbTimes.forEach(time => {
    time.textContent = "00.00";
});


function startPersonalBests(){

    pbTimes.forEach((time,index)=>{

        scramblePB(
            time,
            pbValues[index],
            index * 120
        );

    });

}
```

Second, in the `INITIALISE` block at line 1331, remove the immediate `displayMedals();` call and register the observer instead. `buildYears()` and `buildResults()` stay immediate — they build DOM, they do not animate.

```js
/* ==========================================
   INITIALISE
========================================== */

buildYears();

buildResults();


/* ==========================================
   ANIMATE ON FIRST VIEW

   On a single page these ran during the hero and were finished before
   anyone scrolled down to them.
========================================== */

const achievementsSection =
    document.querySelector("#achievements");


function startAchievementAnimations(){

    startPersonalBests();

    displayMedals();

}


if(achievementsSection && "IntersectionObserver" in window){

    const achievementsObserver = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if(!entry.isIntersecting) return;

            achievementsObserver.disconnect();

            startAchievementAnimations();

        });

    },{
        threshold:0.15
    });

    achievementsObserver.observe(achievementsSection);

}else{

    startAchievementAnimations();

}
```

- [ ] **Step 5: Verify the animation now waits**

Hard-reload `http://localhost:8000/` and stay on the hero for five seconds.

Expected:
- PB times read `00.00`; medal counts read `00`.
- Scrolling until Achievements is roughly 15% visible starts both animations — times scramble to `24.59`, `54.83`, `23.68`, `51.15`; medals count up.
- Scrolling away and back does **not** replay them (the observer disconnects on first fire).
- Console clean.

- [ ] **Step 6: Verify nothing else regressed**

Expected: INTERNATIONAL / NATIONAL / STATE tabs switch; the year selector rebuilds per tab; clicking a competition opens the result lightbox with location, title, date and events; `QUICK SUMMARY` opens its overlay and all six numbered items read correctly; both close via the X and via Escape.

- [ ] **Step 7: Commit**

```bash
node tools/verify.js
git add index.html assets/js/achievements.js
git commit -m "Move achievements into the single page, gate animations on view

The PB scramble and medal count-up ran at load, which on one page meant
they finished while the visitor was still on the hero. Both now fire from
an IntersectionObserver on first sight and do not replay. PB values are
captured before blanking so no real time flashes before the scramble."
```

---

## Task 6: Featured section

**Files:**
- Modify: `index.html` — replace `<section id="featured"></section>`

**Interfaces:**
- Consumes: `featured.css` (linked in Task 3) and `featured.js`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Move the markup**

`featured.html` sets `class="featured-page"` on `<body>`, and `featured.css` hangs rules off it. Move that onto a wrapper instead so it does not affect the whole single page.

Replace `<section id="featured"></section>` with:

```html
<section id="featured" class="featured-page">

    <!-- paste featured.html:36-44 (<section class="featured-hero"> … </section>) here -->

    <!-- paste featured.html:46-515 (<section class="featured-track"> … </section>) here -->

</section>
```

Copy both blocks verbatim, all 14 cards, keeping every URL, headline, publication label and image path exactly as they are.

- [ ] **Step 2: Add the script**

```html
<script src="assets/js/script.js"></script>
<script src="assets/js/achievements.js?v=4"></script>
<script src="assets/js/featured.js"></script>
<script src="assets/js/home.js"></script>
```

- [ ] **Step 3: Check the `body.featured-page` rules**

```bash
grep -n "featured-page" assets/css/featured.css assets/css/style.css
```

Any rule written as `body.featured-page` must lose the `body`, becoming `.featured-page`, so it matches the wrapper. Any rule that set a page-wide background or height on `body.featured-page` should be dropped — the single page owns `body` now.

- [ ] **Step 4: Verify**

Load `http://localhost:8000/` and scroll to Featured.

Expected:
- `MEDIA FEATURES` heading and its intro line.
- All 14 cards present in the original order, each with image, publication label, headline, blurb and read link.
- Drag the track sideways with the mouse — it moves and the cursor becomes a grab hand.
- The mouse wheel scrolls the track horizontally while over it.
- Clicking a card opens the article in a new tab.
- Neither the hero nor Achievements changed appearance.

- [ ] **Step 5: Verify all 14 URLs survived**

```bash
node tools/verify.js
```

Expected: `PASS — 16 photos, 6 videos, 14 articles, form intact`. This is the check that catches a card dropped during the copy.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/featured.css
git commit -m "Move featured articles into the single page

body.featured-page becomes a section wrapper class so its rules no longer
apply to the whole document."
```

---

## Task 7: Gallery panel

Six photos as a teaser, linking into the archive rather than opening a local lightbox — that avoids duplicating gallery lightbox CSS onto a page where `.lightbox-close` would collide with the achievements lightbox.

**Files:**
- Modify: `index.html` — replace `<section id="gallery"></section>`
- Modify: `assets/css/home.css` — append the panel block

**Interfaces:**
- Consumes: `--vh-cached` (not required here, but the file's tokens are shared).
- Produces: links of the form `gallery.html#p-<basename>`, e.g. `gallery.html#p-17`. **Task 9 must read `location.hash` in this format and open that photo's lightbox.**

- [ ] **Step 1: Write the panel markup**

The first six of the frozen order: `1, 17, 16, 15, 14, 13`.

```html
<section id="gallery" class="gallery-panel">

    <div class="gallery-panel-head">

        <div>

            <p class="gallery-panel-label">GALLERY</p>

            <h2>BEHIND THE PODIUM</h2>

        </div>

        <a href="gallery.html" class="gallery-panel-more">
            VIEW MORE <span aria-hidden="true">&rarr;</span>
        </a>

    </div>

    <div class="gallery-panel-grid">

        <a class="gallery-panel-item is-lead" href="gallery.html#p-1">
            <img src="assets/images/gallery/1.jpg" alt="" loading="lazy" decoding="async">
        </a>

        <a class="gallery-panel-item" href="gallery.html#p-17">
            <img src="assets/images/gallery/17.jpg" alt="" loading="lazy" decoding="async">
        </a>

        <a class="gallery-panel-item" href="gallery.html#p-16">
            <img src="assets/images/gallery/16.jpg" alt="" loading="lazy" decoding="async">
        </a>

        <a class="gallery-panel-item" href="gallery.html#p-15">
            <img src="assets/images/gallery/15.jpg" alt="" loading="lazy" decoding="async">
        </a>

        <a class="gallery-panel-item" href="gallery.html#p-14">
            <img src="assets/images/gallery/14.jpg" alt="" loading="lazy" decoding="async">
        </a>

        <a class="gallery-panel-item" href="gallery.html#p-13">
            <img src="assets/images/gallery/13.jpg" alt="" loading="lazy" decoding="async">
        </a>

    </div>

</section>
```

- [ ] **Step 2: Append the panel styles to `home.css`**

Desktop is a lead image plus a 2x2-plus-one cluster. Reading order stays 1, 17, 16, 15, 14, 13 at every breakpoint — the mobile reflow lands in Task 10.

```css
/* ==========================================
   GALLERY PANEL
========================================== */

.gallery-panel{

    padding:14vh 6vw;

    background:#000;
}


.gallery-panel-head{

    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:24px;

    margin-bottom:42px;
}


.gallery-panel-label{

    margin:0 0 10px;

    font-family:"DM Mono",monospace;

    font-size:.62rem;

    letter-spacing:.24em;

    color:rgba(244,241,232,.45);
}


.gallery-panel-head h2{

    margin:0;

    font-family:"Syne",sans-serif;

    font-size:clamp(1.5rem,3.6vw,2.9rem);
    font-weight:700;

    line-height:1.05;
    letter-spacing:-.02em;

    color:#f4f1e8;
}


.gallery-panel-more{

    display:inline-flex;
    align-items:center;
    gap:8px;

    min-height:44px;

    padding:12px 0;

    font-family:"DM Mono",monospace;

    font-size:.66rem;

    letter-spacing:.18em;

    color:rgba(244,241,232,.6);

    text-decoration:none;

    white-space:nowrap;

    transition:color .3s ease;
}


.gallery-panel-more:hover,
.gallery-panel-more:focus-visible{
    color:#fff;
}


.gallery-panel-grid{

    display:grid;

    grid-template-columns:repeat(4,1fr);
    grid-auto-rows:1fr;

    gap:14px;
}


.gallery-panel-item{

    position:relative;

    overflow:hidden;

    display:block;

    aspect-ratio:1 / 1;

    background:#0b0b0b;
}


.gallery-panel-item.is-lead{

    grid-column:span 2;
    grid-row:span 2;

    aspect-ratio:auto;
}


.gallery-panel-item img{

    width:100%;
    height:100%;

    object-fit:cover;

    display:block;

    transition:
        transform .6s cubic-bezier(.19,1,.22,1),
        opacity .4s ease;
}


.gallery-panel-item:hover img{

    transform:scale(1.045);

    opacity:.9;
}
```

- [ ] **Step 3: Verify**

Load `http://localhost:8000/` and scroll to Gallery.

Expected:
- `GALLERY` / `BEHIND THE PODIUM` heading with `VIEW MORE →` on the right.
- Exactly six photos: `1.jpg` large on the left spanning two rows, then 17, 16, 15, 14, 13.
- Hovering a photo scales it slightly.
- `VIEW MORE` goes to `gallery.html`.
- Clicking the `17` tile goes to `gallery.html#p-17`. The lightbox will not open yet — Task 9 wires that. Confirm the URL hash is right.
- In the Network panel, gallery images load lazily rather than during the initial page load.

- [ ] **Step 4: Commit**

```bash
node tools/verify.js
git add index.html assets/css/home.css
git commit -m "Add six-photo gallery panel with deep links into the archive

Panel tiles link to gallery.html#p-<n> rather than opening a local
lightbox, which keeps gallery lightbox CSS off a page where
.lightbox-close would collide with the achievements lightbox."
```

---

## Task 8: Contact section

**Files:**
- Modify: `index.html` — replace `<section id="contact"></section>`, add the stylesheet link

**Interfaces:**
- Consumes: `contact.css`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Add the stylesheet**

In `<head>`, after `featured.css`:

```html
    <link rel="stylesheet" href="assets/css/contact.css?v=2">
```

- [ ] **Step 2: Move the markup**

Copy `contact.html:39-156` — `<section class="contact-page">` through its `</section>` — and use it to replace `<section id="contact"></section>`, merging the id onto the existing element:

```html
<section class="contact-page" id="contact">

    <!-- body of contact.html:39-156, unchanged -->

</section>
```

Every hidden input must survive verbatim: `access_key`, `subject`, `from_name`, `botcheck`, `redirect`. The LinkedIn href must carry the `https://` added in Task 2.

- [ ] **Step 3: Neutralise the fixed-position CONTACT title**

**Found during Task 2.** `contact.css` pins the page title to the viewport on mobile:

```css
    .contact-title{
        position:fixed !important;
        top:28px !important;
        left:50% !important;
        transform:translateX(-50%) !important;
```

That was fine when `contact.html` was its own document. On a single page a fixed element never leaves, so `CONTACT` would float over the hero, About, achievements — everything — for the entire scroll. This is the same leak class as the `position:fixed` "ABOUT" title in `about.css:210`, which Task 11 removes by deleting the file; here the file survives, so the rule has to change.

Replace `position:fixed` with `position:static` and drop the offsets, keeping the centring:

```bash
grep -n "contact-title" assets/css/contact.css
```

Then in the mobile block, rewrite the rule as:

```css
    .contact-title{

        position:static;

        width:auto;

        margin:0 0 40px;

        text-align:center;
    }
```

Verify by scrolling the whole single page at 390px wide: the word `CONTACT` must appear **only** when the contact section is on screen, and must never overlap the hero or the About panel.

- [ ] **Step 4: Verify the form is intact**

```bash
node tools/verify.js
```

Expected: `PASS`. This is the check that catches a dropped hidden field — the form would still look fine and silently fail to deliver.

- [ ] **Step 5: Verify in the browser**

Expected:
- `CONTACT` heading, four info blocks with SVG icons, the form beside them.
- Email, X, Instagram and LinkedIn all open correctly — LinkedIn included, which was broken before Task 2.
- Submitting with a name, email and message reaches the Web3Forms success page.
- Nav `CONTACT` scrolls here; the nav item lights up on arrival.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Move contact section into the single page"
```

---

## Task 9: Rebuild `gallery.html` as the archive

Absorb `watch.html`, `swim.html` and `race.html` into a tabbed archive.

**Files:**
- Modify: `gallery.html` (full rewrite)
- Modify: `assets/js/gallery.js` — add video data, tabs, deep links, swipe
- Modify: `assets/css/gallery.css` — append tab and video-card styles

**Interfaces:**
- Consumes: `gallery.html#p-<basename>` deep links produced by Task 7.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Rewrite `gallery.html`**

```html
<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Gallery</title>

    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/gallery.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@300;400;500;600&family=Syne:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">

</head>

<body>

<div class="page-fade">

    <nav class="navbar">

        <a href="index.html#home">HOME</a>

        <a href="index.html#about">ABOUT</a>

        <a href="index.html#achievements">ACHIEVEMENTS</a>

        <a href="index.html#featured">FEATURED</a>

        <a href="gallery.html" class="active">GALLERY</a>

        <a href="index.html#contact">CONTACT</a>

    </nav>

    <main class="gallery-page">

        <section class="gallery-header">

            <div class="gallery-top">

                <div>

                    <p class="gallery-label">GALLERY</p>

                    <h1>BEHIND THE PODIUM</h1>

                </div>

                <a href="index.html" class="watch-link">
                    &larr; BACK TO SITE
                </a>

            </div>

            <div class="archive-tabs" role="tablist">

                <button type="button" class="archive-tab is-active"
                        role="tab" aria-selected="true"
                        data-panel="photos">
                    PHOTOS
                </button>

                <button type="button" class="archive-tab"
                        role="tab" aria-selected="false"
                        data-panel="videos">
                    VIDEOS
                </button>

            </div>

        </section>

        <div class="archive-panel is-active" id="panel-photos">

            <section id="featured-photo"></section>

            <section id="gallery-grid"></section>

        </div>

        <div class="archive-panel" id="panel-videos">

            <section id="video-list"></section>

        </div>

    </main>

</div>


<!-- ==========================================
     PHOTO LIGHTBOX
========================================== -->

<div id="lightbox">

    <button class="lightbox-close" aria-label="Close">&times;</button>

    <button class="lightbox-prev" aria-label="Previous">&#10094;</button>

    <img id="lightbox-image" src="" alt="">

    <button class="lightbox-next" aria-label="Next">&#10095;</button>

    <div class="lightbox-info">
        <h2></h2>
        <p></p>
    </div>

</div>


<!-- ==========================================
     VIDEO PLAYER
========================================== -->

<div id="video-player">

    <span class="close-player" role="button" tabindex="0" aria-label="Close">&times;</span>

    <video id="fullscreen-video" controls playsinline></video>

    <div class="video-info">
        <h2></h2>
        <p></p>
    </div>

</div>


<script src="assets/js/script.js"></script>
<script src="assets/js/gallery.js"></script>

</body>

</html>
```

- [ ] **Step 2: Add the video data to `gallery.js`**

Insert directly after the existing `gallery` array. Order is frozen: both SWIM entries, then all four RACE entries, matching the collection-card order in the old `watch.html`.

```js
/* ==========================================
   VIDEOS

   Merged from the former swim.js and race.js. Order is frozen: SWIM
   then RACE, matching the old collection-card order.
========================================== */

const R2 = "https://pub-214e94a3a6cb4f28be70b88cfa1b2d80.r2.dev/";

const videos = [

    {
        group:"SWIM",
        number:"SWIM 001",
        title:"DIVE TECHNIQUE",
        meet:"Session with SWIMPLE",
        details:"Bangalore, India",
        video:R2 + "swim1-web.mp4"
    },

    {
        group:"SWIM",
        number:"SWIM 002",
        title:"100M Butterfly drone shot",
        meet:"Senior state 2024",
        details:"First time swimming sub 55 in 100 fly",
        video:R2 + "swim2-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 001",
        title:"100M Freestyle",
        meet:"78th Senior State Aquatic Championships",
        details:"Chennai • 2024 • PB 51.62",
        video:R2 + "race1-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 002",
        title:"50M Freestyle",
        meet:"1st All India Invitational Senior Nationals",
        details:"Bangalore • 2021 • PB 23.68",
        video:R2 + "race2-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 003",
        title:"50M Butterfly",
        meet:"77th Senior National Aquatic Championships",
        details:"Mangalore • 2026 • PB 24.59",
        video:R2 + "race3-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 004",
        title:"100M Freestyle",
        meet:"79th Senior National Aquatic Championships",
        details:"Ahmedabad • 2026 • PB 51.15",
        video:R2 + "race4-web.mp4"
    }

];
```

- [ ] **Step 3: Give each photo card a deep-link id**

In the existing `gallery.forEach` loop that builds cards, add an id derived from the filename so Task 7's links can find it. Insert after `card.dataset.subtitle = photo.subtitle;`:

```js
    /* index.html links here as gallery.html#p-17 */

    card.id = "p-" + photo.image.replace(".jpg","");
```

- [ ] **Step 4: Build the video list and the tabs**

Append to `gallery.js`, after the photo lightbox code:

```js
/* ==========================================
   BUILD VIDEO LIST
========================================== */

const videoList = document.querySelector("#video-list");

let currentGroup = "";

videos.forEach(item => {

    if(item.group !== currentGroup){

        currentGroup = item.group;

        const heading = document.createElement("h2");

        heading.className = "video-group";

        heading.textContent = currentGroup;

        videoList.appendChild(heading);

    }

    const card = document.createElement("div");

    card.className = "race-card";

    card.innerHTML = `

        <video
            class="race-preview"
            muted
            loop
            playsinline
            preload="metadata">

            <source src="${item.video}" type="video/mp4">

        </video>

        <div>

            <div class="race-number">${item.number}</div>

            <div class="race-title">${item.title}</div>

            <div class="race-meet">${item.meet}</div>

            <div class="race-details">${item.details}</div>

        </div>
    `;

    card.dataset.video   = item.video;
    card.dataset.title   = item.title;
    card.dataset.details = item.details;

    videoList.appendChild(card);

});


/* ==========================================
   VIDEO PLAYER
========================================== */

const player      = document.querySelector("#video-player");
const playerVideo = document.querySelector("#fullscreen-video");
const playerTitle = document.querySelector(".video-info h2");
const playerText  = document.querySelector(".video-info p");
const playerClose = document.querySelector(".close-player");


document.querySelectorAll(".race-card").forEach(card => {

    card.addEventListener("click", () => {

        playerVideo.src        = card.dataset.video;
        playerTitle.textContent = card.dataset.title;
        playerText.textContent  = card.dataset.details;

        player.classList.add("active");

        playerVideo.play();

    });

});


function closePlayer(){

    player.classList.remove("active");

    playerVideo.pause();

    playerVideo.removeAttribute("src");

    playerVideo.load();

}


playerClose.addEventListener("click", closePlayer);

playerClose.addEventListener("keydown", event => {
    if(event.key === "Enter" || event.key === " ") closePlayer();
});

player.addEventListener("click", event => {
    if(event.target === player) closePlayer();
});


/* ==========================================
   TABS
========================================== */

const tabs   = [...document.querySelectorAll(".archive-tab")];
const panels = [...document.querySelectorAll(".archive-panel")];


function showPanel(name){

    tabs.forEach(tab => {

        const on = tab.dataset.panel === name;

        tab.classList.toggle("is-active", on);

        tab.setAttribute("aria-selected", on ? "true" : "false");

    });

    panels.forEach(panel =>
        panel.classList.toggle("is-active", panel.id === "panel-" + name)
    );

    /* Never leave a video playing behind a hidden panel. */

    if(name !== "videos"){

        document.querySelectorAll(".race-preview").forEach(v => v.pause());

        if(player.classList.contains("active")) closePlayer();

    }

}


tabs.forEach(tab =>
    tab.addEventListener("click", () => showPanel(tab.dataset.panel))
);


/* ==========================================
   DEEP LINK

   index.html sends people here as gallery.html#p-17
========================================== */

if(location.hash.startsWith("#p-")){

    const target = document.getElementById(location.hash.slice(1));

    if(target){

        showPanel("photos");

        const index = cards.indexOf
            ? cards.indexOf(target)
            : [...cards].indexOf(target);

        if(index > -1){
            currentIndex = index;
            showImage();
        }

    }

}
```

`cards` is the existing `NodeList` from the lightbox code. `[...cards].indexOf(target)` handles it either way.

- [ ] **Step 5: Append the tab and video styles to `gallery.css`**

```css
/* ==========================================
   ARCHIVE TABS
========================================== */

.archive-tabs{

    display:flex;
    gap:8px;

    margin-top:32px;
}


.archive-tab{

    min-height:44px;

    padding:12px 22px;

    background:none;
    border:1px solid rgba(244,241,232,.16);
    border-radius:2px;

    font-family:"DM Mono",monospace;

    font-size:.66rem;

    letter-spacing:.2em;

    color:rgba(244,241,232,.5);

    cursor:pointer;

    transition:
        color .3s ease,
        border-color .3s ease,
        background .3s ease;
}


.archive-tab:hover,
.archive-tab:focus-visible{
    color:#fff;
}


.archive-tab.is-active{

    color:#0b0b0b;

    background:#f4f1e8;

    border-color:#f4f1e8;
}


/* ==========================================
   PANELS
========================================== */

.archive-panel{
    display:none;
}

.archive-panel.is-active{
    display:block;
}


/* ==========================================
   VIDEO GROUP HEADINGS
========================================== */

.video-group{

    margin:56px 0 22px;

    font-family:"DM Mono",monospace;

    font-size:.66rem;
    font-weight:400;

    letter-spacing:.26em;

    color:rgba(244,241,232,.42);
}


.video-group:first-child{
    margin-top:24px;
}
```

Then copy the `.race-card`, `.race-preview`, `.race-number`, `.race-title`, `.race-meet`, `.race-details`, `#video-player`, `.close-player` and `.video-info` rules out of `assets/css/race.css` into `gallery.css`. Take them from `race.css` and not `swim.css` — the two are near-identical and `race.css` is the longer, more complete of the pair. Check afterwards that no rule you copied is scoped to `.race-page`, which no longer exists; drop that ancestor where you find it.

- [ ] **Step 6: Verify the photos tab**

Load `http://localhost:8000/gallery.html`.

Expected:
- PHOTOS tab active, `1.jpg` as the featured image, then exactly `17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 3, 2`. Confirm `4.jpg` does not appear.
- Clicking any photo opens the lightbox; prev/next cycle through all 16 and wrap; Escape and the X close it; clicking the backdrop closes it.

- [ ] **Step 7: Verify the videos tab**

Expected:
- Clicking VIDEOS swaps panels. A `SWIM` heading with 2 cards, then `RACE` with 4, in the frozen order.
- Each card shows a still first frame, not an autoplaying loop — `autoplay` was deliberately dropped.
- Clicking a card opens the fullscreen player and plays with audio and controls.
- Closing stops playback and clears the `src`, so it does not keep streaming.
- Switching back to PHOTOS while a video plays stops it.

- [ ] **Step 8: Verify the deep link**

Go to `http://localhost:8000/gallery.html#p-17` directly.

Expected: the PHOTOS tab is active and the lightbox is already open on `17.jpg`. Then from `index.html`, click the `16` tile in the gallery panel and confirm the archive opens with `16.jpg` showing.

- [ ] **Step 9: Verify no URL was lost**

```bash
node tools/verify.js
```

Expected: `PASS — 16 photos, 6 videos, 14 articles, form intact`. All six video URLs now live in `gallery.js` instead of `race.js`/`swim.js`, and the checker confirms every one made the move.

- [ ] **Step 10: Commit**

```bash
git add gallery.html assets/js/gallery.js assets/css/gallery.css
git commit -m "Rebuild gallery.html as a tabbed archive

Absorbs watch/swim/race into PHOTOS | VIDEOS tabs. Photo order unchanged
and 4.jpg still excluded. Video previews no longer autoplay. Accepts
#p-<n> deep links from the gallery panel on index.html."
```

---

## Task 10: Mobile pass

Phone support is a stated requirement, not a nice-to-have. This task consolidates the breakpoints, fixes the touch targets, reflows the gallery panel, and adds lightbox swipe.

**Files:**
- Modify: `assets/css/home.css`, `assets/css/gallery.css`, `assets/css/style.css`
- Modify: `assets/js/gallery.js`

**Interfaces:**
- Consumes: everything from Tasks 3–9.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Normalise the breakpoints**

```bash
grep -rn "@media" assets/css/*.css | sed 's/.*@media//' | sort | uniq -c | sort -rn
```

Rewrite each of `900px`, `850px`, `600px` and `520px` to the nearest of the three allowed values — `1000px`, `700px`, `500px`. Work one file at a time and reload after each so a mis-mapped breakpoint is easy to attribute.

- [ ] **Step 2: Normalise the viewport units**

```bash
grep -rn "100vh\|100dvh\|!important" assets/css/*.css | grep -i "height"
```

Every viewport height becomes a two-line fallback pair, and the `!important` comes off:

```css
    min-height:100vh;
    min-height:100dvh;
```

Leave `home.css`'s `var(--vh-cached, 100dvh)` on `.about-panel` alone — that one is intentional and must keep agreeing with the JS.

- [ ] **Step 3: Reflow the gallery panel**

Append to `home.css`:

```css
@media(max-width:700px){

    .gallery-panel{
        padding:10vh 6vw;
    }

    .gallery-panel-head{

        flex-direction:column;
        align-items:flex-start;
        gap:14px;
    }

    .gallery-panel-grid{
        grid-template-columns:repeat(2,1fr);
    }

    .gallery-panel-item.is-lead{

        grid-column:span 2;
        grid-row:auto;

        aspect-ratio:4 / 3;
    }

}


@media(max-width:500px){

    .gallery-panel-grid{
        grid-template-columns:1fr;
    }

    .gallery-panel-item.is-lead{
        grid-column:span 1;
    }

}
```

Reading order stays 1, 17, 16, 15, 14, 13 in all three layouts because the grid follows source order.

- [ ] **Step 4: Tighten the About panel for phones**

Append to `home.css`:

```css
@media(max-width:700px){

    .about-panel{
        padding:14vh 7vw 96px;
    }

    .beat-progress{

        left:auto;
        right:14px;

        gap:8px;
    }

    .beat-progress li{
        height:12px;
    }

    .about-skip{
        bottom:20px;
    }

}
```

The ticks move to the right edge so they do not sit under the hamburger, and the panel gains bottom padding so long beats never run under the SKIP button.

- [ ] **Step 5: Add swipe to the photo lightbox**

Append to `gallery.js`. Tapping small arrows on a phone is poor; horizontal swipe replaces it while leaving vertical drags to the page.

```js
/* ==========================================
   LIGHTBOX SWIPE
========================================== */

let touchStartX = 0;
let touchStartY = 0;

const SWIPE_THRESHOLD = 50;


lightbox.addEventListener("touchstart", event => {

    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;

},{ passive:true });


lightbox.addEventListener("touchend", event => {

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;

    /* Ignore mostly-vertical drags so the page can still be scrolled. */

    if(Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if(Math.abs(deltaX) < Math.abs(deltaY)) return;

    if(deltaX < 0){
        nextBtn.click();
    }else{
        prevBtn.click();
    }

},{ passive:true });
```

- [ ] **Step 6: Grow the lightbox controls for touch**

Append to `gallery.css`:

```css
@media(max-width:700px){

    .lightbox-close,
    .lightbox-prev,
    .lightbox-next{

        min-width:44px;
        min-height:44px;

        display:flex;
        align-items:center;
        justify-content:center;
    }

    .lightbox-prev{ left:8px; }

    .lightbox-next{ right:8px; }

    .archive-tab{
        flex:1;
        padding:12px 14px;
    }

}
```

- [ ] **Step 7: Play only the visible video preview on larger screens**

The previews no longer autoplay at all after Task 9, which is the right default for a phone on cellular. Above 700px, bring motion back for the one in view only. Append to `gallery.js`:

```js
/* ==========================================
   PREVIEW PLAYBACK

   No autoplay on phones — six R2 streams is real data and battery.
   Above 700px, play only the preview actually in view.
========================================== */

if(window.matchMedia("(min-width:701px)").matches
   && "IntersectionObserver" in window){

    const previewObserver = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            const video = entry.target;

            if(entry.isIntersecting){
                video.play().catch(() => {});
            }else{
                video.pause();
            }

        });

    },{
        threshold:0.4
    });

    document.querySelectorAll(".race-preview")
        .forEach(video => previewObserver.observe(video));

}
```

- [ ] **Step 8: Verify at three widths**

At 375x667, 390x844 and 414x896, load `index.html` and go top to bottom.

Expected at each:
- No horizontal page scrolling anywhere. Check with `document.documentElement.scrollWidth <= window.innerWidth` in the console — it must be `true`.
- Hero uses `homepage-mobile.jpg` (confirm in the Network panel) and the name fits without clipping.
- About pins correctly; all seven beats advance; ticks sit at the right edge, clear of the hamburger; SKIP is comfortably tappable and works.
- Achievements: PB cards, medal tally and results all readable; the year row scrolls sideways inside itself rather than widening the page.
- Featured drags with a finger.
- Gallery panel: 2 columns with the lead spanning both at 390px; single column at 375px if that is below your 500px breakpoint — check which applies and confirm the order is still 1, 17, 16, 15, 14, 13.
- Contact form fields are full width and comfortably tappable.
- Closing quote fits on three lines with no overflow.

- [ ] **Step 9: Verify the archive on mobile**

At 390px, load `gallery.html`.

Expected: tabs span the width and are tappable; the photo grid is comfortable; the lightbox opens and **swipes** left and right; close/prev/next are all easy to hit; no video preview autoplays; tapping a card opens the player, and it plays inline rather than jumping to iOS fullscreen — that is `playsinline` doing its job.

- [ ] **Step 10: Verify on a real iPhone**

This is the one thing DevTools cannot emulate, and the one most likely to be broken.

On an actual iPhone in Safari, reach the dev server on your LAN (`http://<your-ip>:8000/`). Scroll into About slowly enough that the URL bar collapses, then scroll back up so it re-expands.

Expected: the sticky panel does **not** jump or resize when the toolbar moves, and the beats do not skip or repeat. If they do, `--vh-cached` is being recomputed on a height-only resize — recheck the `innerWidth` guard in `home.js`.

Also confirm: rotating to landscape and back re-measures correctly, and the beats still advance afterwards.

- [ ] **Step 11: Verify landscape and reduced motion**

Expected in landscape at 844x390: About beats still readable and not clipped; the panel still pins. With reduced motion on: About opens already skipped.

- [ ] **Step 12: Commit**

```bash
node tools/verify.js
git add assets/css/home.css assets/css/gallery.css assets/css/style.css assets/js/gallery.js
git commit -m "Mobile pass: breakpoints, touch targets, swipe, reflow

Collapses seven breakpoints to three and pairs every viewport height with
a vh fallback, dropping the !important patches. Gallery panel reflows to
2 then 1 column keeping source order. Lightbox gains swipe and 44px
controls. Video previews stay paused on phones and play only when in view
above 700px."
```

---

## Task 11: Delete the obsolete files

Only now, with everything verified working, remove what the single page replaced.

**Files:**
- Delete: 7 HTML, 4 CSS, 3 JS files

**Interfaces:**
- Consumes: a fully working `index.html` and `gallery.html`.
- Produces: the final site.

- [ ] **Step 1: Confirm nothing references the doomed files**

```bash
grep -rn "about\.html\|achievements\.html\|featured\.html\|contact\.html\|watch\.html\|swim\.html\|race\.html" \
     index.html gallery.html assets/ 2>/dev/null

grep -rn "about\.css\|watch\.css\|race\.css\|swim\.css\|watch\.js\|race\.js\|swim\.js" \
     index.html gallery.html 2>/dev/null
```

Expected: both print nothing. Any hit is a link that will 404 — fix it before deleting.

- [ ] **Step 2: Delete**

```bash
git rm about.html achievements.html featured.html contact.html \
       watch.html swim.html race.html \
       assets/css/about.css assets/css/watch.css \
       assets/css/race.css assets/css/swim.css \
       assets/js/watch.js assets/js/race.js assets/js/swim.js
```

- [ ] **Step 3: Confirm the checker still passes with the files gone**

```bash
node tools/verify.js
```

Expected: `PASS — 16 photos, 6 videos, 14 articles, form intact`.

This is the moment the checker earns its keep. The video URLs originally lived in the files just deleted; a `PASS` here proves all six survived the move into `gallery.js`. It also now actively enforces that no dead link to a removed page remains.

- [ ] **Step 4: Confirm the final file list**

```bash
find . -type f -not -path "./.git/*" -not -path "./docs/*" \
     \( -name "*.html" -o -name "*.css" -o -name "*.js" \) | sort
```

Expected exactly:

```
./assets/css/achievements.css
./assets/css/contact.css
./assets/css/featured.css
./assets/css/gallery.css
./assets/css/home.css
./assets/css/style.css
./assets/js/achievements.js
./assets/js/featured.js
./assets/js/gallery.js
./assets/js/home.js
./assets/js/script.js
./gallery.html
./index.html
./tools/verify.js
```

- [ ] **Step 5: Full run-through**

Walk the complete spec test list one final time at desktop width and at 390px: nav, all seven sections, About beats and SKIP, achievements animations firing on view, all their tabs and lightboxes, featured drag, gallery panel and deep link, contact submit, all four socials, archive tabs, video playback, lightbox swipe, closing quote. Console clean throughout, on both pages.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Remove the seven-page structure

index.html and gallery.html now cover everything the deleted pages did.
Invariant checker confirms all photos, videos, articles and form fields
survived the consolidation."
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Decisions 1, 4 — gallery as 2nd page, PHOTOS/VIDEOS tabs | 9 |
| Decision 2 — pinned About panel with SKIP | 4 |
| Decision 3 — 6-photo panel with VIEW MORE | 7 |
| Decision 5 — quote twice | 4 (beat 7), 3 (closing section) |
| Decision 6 — typo fixes only | 4 Step 1 |
| Decision 7 / Mobile | 10, plus mobile nav in 2 |
| `index.html` structure | 3, 4, 5, 6, 7, 8 |
| Achievements observer gating | 5 |
| Nav sticky + anchors + scroll spy | 3 |
| CSS/JS consolidation table | 2 (dupes, nav hack), 10 (breakpoints, viewport units) |
| Bugs found on the way, all four | 2 |
| Preserved exactly | 1 (checker), enforced in every task |
| Testing | every task's verify steps; device matrix in 10 |

**Placeholder scan:** no TBD/TODO. Every code step carries real code. Markup moves cite exact source line ranges rather than saying "copy the relevant part". The one unresolved item — the *"most of my life in the water than on land"* phrasing — is deliberately named as an open question in Task 4 Step 1 with the reason it was left alone, not a hidden gap.

**Type and name consistency:**
- `--vh-cached` written in Task 3, consumed in Task 4's `.about-stage` and `.about-panel`. Matches.
- `cachedHeight` declared in Task 3, read by `measure()` in Task 4. Matches.
- `--beat-h` defined in Task 3, used in Task 4's track height. Matches.
- `.is-skipped` set by Task 4's JS, keyed by Task 4's CSS. Matches.
- `gallery.html#p-<basename>` produced in Task 7, parsed in Task 9 Step 4, with the id set in Task 9 Step 3. Matches.
- `showPanel()`, `closePlayer()`, `startPersonalBests()`, `startAchievementAnimations()` each defined once and called only where defined.
- `cards`, `currentIndex`, `showImage()`, `nextBtn`, `prevBtn` are pre-existing `gallery.js` identifiers reused by Tasks 9 and 10, not redeclared.

**One risk worth naming:** Task 2 deletes CSS and JS by line number. Those numbers are correct as of commit `b54ce39` but shift as soon as an earlier edit lands. Each deletion step therefore prints its boundaries with `sed -n` before cutting — read that output and confirm it matches before running the `sed -i` line.
