# Swayamsiddha Diagnostics — website

Landing page for Swayamsiddha Diagnostics (Lab & X-Ray). Static HTML/CSS/JS,
no build step, no dependencies. Hosted on GitHub Pages.

**Live:** https://bhavuk461.github.io/swayamsiddha-diagnostics/

---

## Editing the details you'll actually want to change

### Address, phone and the map pin

Everything contact-related is in one block at the top of
[`assets/js/main.js`](assets/js/main.js):

```js
const CONFIG = {
  PHONE: '+917847889009',
  ADDRESS: 'Swayamsiddha Diagnostics — Lab & X-Ray, Odisha',
  MAP_QUERY: 'Swayamsiddha Diagnostics',
  MAP_EMBED: '',
};
```

- `PHONE` — rewrites every call link, WhatsApp link and the dock button.
- `ADDRESS` — the text under "Find us" in the Visit section.
- `MAP_QUERY` — what the "Open in Google Maps" and "Get directions" buttons search for.
- `MAP_EMBED` — leave empty and the map falls back to a search by name.

**To get a real map pin,** first create a free Google Business Profile for the
centre at <https://business.google.com>. Once it is verified and appears on
Google Maps: open the listing → **Share** → **Embed a map** → copy the `src="…"`
URL out of the `<iframe>` snippet → paste it as `MAP_EMBED`. That is the only
change needed; the button links keep working either way.

The postal address should also be filled into the `PostalAddress` block in the
JSON-LD at the bottom of [`index.html`](index.html) — that is what Google reads
for search results.

### Opening hours

Three places, all plain text:

1. Visit section — `.info__hours` lines in `index.html`
2. Footer — `.foot__contact`
3. `openingHoursSpecification` in the JSON-LD script at the bottom of `index.html`

Currently set to **Mon–Sat 7:00 AM – 8:00 PM**, **Sunday 7:00 AM – 1:00 PM**.

### The test list

The test menu lives in the `#tests` section of `index.html` as plain `<ul>` lists.
It was expanded from the list on the previous site plus what the installed
analyzers can run. **Please read it through and delete anything the centre does
not actually offer** — it is better to under-promise. The "Not available at this
centre" notice (MRI / USG / CT) is deliberate and should stay.

---

## Structure

```
index.html            single page — all content and the JSON-LD
assets/css/style.css  all styling
assets/js/main.js     boot animation control, nav, reveals, lightbox, map
assets/favicon.svg    the mark, vectorised
assets/img/           photos + the generated share image (og.jpg)
tools/dev-server.mjs  zero-dependency local static server
```

## The logo mark

The sunflower-and-crown mark is a vector trace of `assets/img/logo.jpeg`, built
by sampling the original raster: **18 identical petals at 20° spacing**, radius
42 → 96.5 in a 200-unit viewBox, and a crown traced from a raster scan of the
centre. It matches the original at ~0.90 pixel IoU, with the remaining
difference being the hand-drawn wobble of the original — deliberately not
reproduced, so the vector stays crisp at any size.

It is defined once in `index.html` (`#ssd-petal`, `#ssd-crown`, `#ssd-pearls`,
`#ssd-mark`) and reused by the header, footer and boot animation via `<use>`.

The boot animation drops the crown in first, then blooms the petals outward in
mirrored pairs from the top, finishing in about 1.2 s. It is skipped entirely
for visitors who have "reduce motion" turned on.

## Running it locally

```bash
node tools/dev-server.mjs . 
```

Then open <http://localhost:5177>. Any static server works — there is nothing to
compile.

## Deploying

Push to `main`. GitHub Pages serves the repository root; `.nojekyll` stops Jekyll
from touching the files.
