/* ============================================================
   Swayamsiddha Diagnostics — site behaviour
   ============================================================ */

/* ------------------------------------------------------------------
   SITE CONFIG — the only block you need to edit for contact details.
   When the centre gets a Google Business Profile, open Google Maps,
   click Share → Embed a map, copy the src="..." URL out of the iframe
   snippet and paste it into MAP_EMBED below. Everything else updates
   from these values.
   ------------------------------------------------------------------ */
const CONFIG = {
  PHONE: '+917847889009',
  ADDRESS: 'Swayamsiddha Diagnostics — Lab & X-Ray, Odisha',
  MAP_QUERY: 'Swayamsiddha Diagnostics',
  // Replace with the Google Maps "Embed a map" URL once the listing exists.
  MAP_EMBED: '',
};

const mapQuery = encodeURIComponent(CONFIG.MAP_QUERY);
const MAP_SRC = CONFIG.MAP_EMBED || `https://www.google.com/maps?q=${mapQuery}&output=embed`;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ------------------------------------------------------------------
   Boot animation
   ------------------------------------------------------------------ */
(function boot() {
  const el = $('#boot');
  if (!el) return;

  const MIN_SHOW = reduceMotion ? 260 : 1500;
  const started = performance.now();
  let done = false;

  const dismiss = () => {
    if (done) return;
    done = true;
    el.classList.add('is-out');
    document.body.classList.remove('is-locked');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 900);
  };

  document.body.classList.add('is-locked');

  const finish = () => {
    const wait = Math.max(0, MIN_SHOW - (performance.now() - started));
    setTimeout(dismiss, wait);
  };

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });

  // never trap the visitor if something stalls
  setTimeout(dismiss, 5000);
})();

/* ------------------------------------------------------------------
   Header: stuck state + active section
   ------------------------------------------------------------------ */
(function header() {
  const nav = $('#nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = $$('.nav__links a');
  const sections = links
    .map((a) => ({ link: a, sec: $(a.getAttribute('href')) }))
    .filter((x) => x.sec);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const seen = new Set();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      const top = sections.filter((s) => seen.has(s.sec)).pop();
      links.forEach((l) => l.classList.toggle('is-active', !!top && l === top.link));
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => spy.observe(s.sec));
})();

/* ------------------------------------------------------------------
   Mobile menu
   ------------------------------------------------------------------ */
(function mobileMenu() {
  const burger = $('#burger');
  const menu = $('#mobile-menu');
  if (!burger || !menu) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
  };

  burger.addEventListener('click', () => setOpen(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080 && !menu.hidden) setOpen(false);
  });
})();

/* ------------------------------------------------------------------
   Reveal on scroll
   ------------------------------------------------------------------ */
(function reveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
})();

/* ------------------------------------------------------------------
   Quick-action dock (desktop reveals after the hero)
   ------------------------------------------------------------------ */
(function dock() {
  const el = $('#dock');
  if (!el) return;
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches;
  const onScroll = () => el.classList.toggle('is-on', isMobile() || window.scrollY > 520);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

/* ------------------------------------------------------------------
   Map — click to load (keeps Google off the page until asked)
   ------------------------------------------------------------------ */
(function map() {
  const holder = $('#map');
  const trigger = $('#map-load');
  if (!holder || !trigger) return;

  trigger.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = MAP_SRC;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.title = 'Map showing the location of Swayamsiddha Diagnostics';
    frame.allowFullscreen = true;
    holder.replaceChildren(frame);
  });
})();

/* ------------------------------------------------------------------
   Contact links driven by CONFIG
   ------------------------------------------------------------------ */
(function contacts() {
  const addr = $('#address-line');
  if (addr) addr.textContent = CONFIG.ADDRESS;

  $$('a[href^="tel:"]').forEach((a) => (a.href = `tel:${CONFIG.PHONE}`));
  $$('a[href*="wa.me"]').forEach((a) => {
    const url = new URL(a.href);
    url.pathname = `/${CONFIG.PHONE.replace('+', '')}`;
    a.href = url.toString();
  });
  $$('a[href*="maps.google.com"], a[href*="google.com/maps"]').forEach((a) => {
    a.href = a.href.replace(/(q=|destination=)[^&]*/, `$1${mapQuery}`);
  });

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* ------------------------------------------------------------------
   Gallery lightbox
   ------------------------------------------------------------------ */
const Lightbox = (function lightbox() {
  const dlg = $('#lightbox');
  const img = $('#lb-img');
  const cap = $('#lb-cap');
  const tiles = $$('.gal__item');
  if (!dlg || typeof dlg.showModal !== 'function') return null;

  // The gallery and the reel hold different pictures, so the viewer is handed
  // whichever set was clicked rather than owning one of them.
  const gallery = tiles.map((btn) => ({
    full: btn.dataset.full,
    cap: btn.dataset.cap || '',
    alt: $('img', btn)?.alt || '',
  }));

  let list = gallery;
  let index = 0;
  let opener = null;

  const show = (i) => {
    if (!list.length) return;
    index = (i + list.length) % list.length;
    const it = list[index];
    img.src = it.full;
    img.alt = it.alt || '';
    cap.textContent = it.cap || '';
  };

  const open = (set, i, from) => {
    list = Array.isArray(set) && set.length ? set : gallery;
    opener = from || null;
    show(i);
    dlg.showModal();
    document.body.classList.add('is-locked');
  };

  tiles.forEach((btn, i) => btn.addEventListener('click', () => open(gallery, i, btn)));

  const close = () => dlg.close();
  $('#lb-close')?.addEventListener('click', close);
  $('#lb-prev')?.addEventListener('click', () => show(index - 1));
  $('#lb-next')?.addEventListener('click', () => show(index + 1));

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });
  dlg.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    opener?.focus?.();
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
  });

  // swipe on touch
  let x0 = null;
  dlg.addEventListener('touchstart', (e) => (x0 = e.changedTouches[0].clientX), { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  return { open };
})();

/* ------------------------------------------------------------------
   Photo reel — the gallery photos ride a curved offset-path under the
   hero. Items are laid out at even offsets along the path and a single
   shared position is advanced each frame, so the reel loops seamlessly.
   Hover eases it down, dragging scrubs it with momentum, and z-index
   rolls with position so overlaps stay consistent.
   ------------------------------------------------------------------ */
(function reel() {
  const wrap = $('#reel');
  const stage = $('#reel-stage');
  const hint = $('#reel-hint');
  if (!wrap || !stage) return;

  const REEL = [
    { full: 'assets/img/reel-vials.jpg', cap: 'Blood samples ready for the analyzer' },
    { full: 'assets/img/reel-microscope.jpg', cap: 'Microscopy bench' },
    { full: 'assets/img/reel-heart.jpg', cap: 'Cardiac testing — digital 12-lead ECG' },
    { full: 'assets/img/reel-testtube.jpg', cap: 'Haematology — cell counts and morphology' },
    { full: 'assets/img/reel-kidney.jpg', cap: 'Kidney function testing (KFT / RFT)' },
  ];

  const SPEED = 2.4;   // % of the path per second
  const DRAG = 0.085;  // % of the path per pixel dragged
  const clamp = (lo, v, hi) => Math.max(lo, Math.min(v, hi));

  let items = [], base = 0, raf = 0, hoverEl = null;
  let hovering = false, dragging = false, dragVel = 0, hoverF = 1;
  let lastT = 0, lastX = 0, travelled = 0, lastW = -1, tries = 0;
  let lastBase = NaN, lastHover = null;

  /* Single source of truth for the hover: the class drives the visual lift and
     the same flag drives the stacking order, so they cannot disagree. */
  function setHover(el) {
    if (hoverEl === el) return;
    if (hoverEl) hoverEl.classList.remove('is-hot');
    hoverEl = el;
    if (hoverEl) hoverEl.classList.add('is-hot');
  }

  /* Two path shapes, both authored as unit coordinates and mapped onto the
     live box, so the curve always spans the full width and the tiles are
     sized independently of it.
       LOOP  — the curl: runs in low, sweeps up, loops back on itself, exits.
               Needs horizontal room, so it is desktop only.
       WAVE  — a shallow S for narrow screens, where a loop would be illegible. */
  const LOOP = [
    [0, 0.6849],
    [0.0579, 0.8109, 0.3893, 1, 0.4845, 0.6849],
    [0.6035, 0.2902, 0.5277, 0, 0.4289, 0.1712],
    [0.3301, 0.3424, 0.3540, 0.7751, 0.5172, 0.8417],
    [0.6476, 0.8949, 0.9483, 0.6104, 1, 0.5415],
  ];
  const WAVE = [
    [0, 0.72],
    [0.17, 0.72, 0.22, 0.16, 0.42, 0.16],
    [0.62, 0.16, 0.67, 0.9, 0.87, 0.9],
    [1.0, 0.9, 1.05, 0.62, 1.12, 0.55],
  ];

  const measure = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  function geometry(w) {
    const loop = w >= 860;
    const tile = Math.round(loop ? clamp(64, w * 0.062, 104) : clamp(84, w * 0.2, 104));
    const h = Math.round(loop ? clamp(280, w * 0.30, 420) : clamp(190, w * 0.52, 250));
    const pts = loop ? LOOP : WAVE;

    // rotated tiles swing a half-diagonal wide, so inset the curve by that much
    const pad = tile * 0.72;
    const ox = tile * 0.7;
    const X = (f) => (-ox + f * (w + 2 * ox)).toFixed(1);
    const Y = (f) => (pad + f * (h - 2 * pad)).toFixed(1);

    let d = `M${X(pts[0][0])} ${Y(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const c = pts[i];
      d += `C${X(c[0])} ${Y(c[1])} ${X(c[2])} ${Y(c[3])} ${X(c[4])} ${Y(c[5])}`;
    }

    measure.setAttribute('d', d);
    const len = measure.getTotalLength() || w * 1.4;
    const count = Math.max(5, Math.round(len / (tile * 0.86)));
    return { h, tile, path: d, count, loop };
  }

  function build(g) {
    hoverEl = null;            // the node it pointed at is about to be discarded
    lastHover = null;
    stage.replaceChildren();
    items = [];
    for (let i = 0; i < g.count; i++) {
      const k = i % REEL.length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reel__item';
      btn.dataset.idx = String(k);
      if (i >= REEL.length) { btn.setAttribute('aria-hidden', 'true'); btn.tabIndex = -1; }
      else btn.setAttribute('aria-label', `Enlarge: ${REEL[k].cap}`);

      const img = document.createElement('img');
      img.src = REEL[k].full;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      btn.appendChild(img);
      stage.appendChild(btn);
      items.push(btn);
    }
  }

  function fit(w) {
    const g = geometry(w);
    if (!items.length || items.length !== g.count) build(g);
    wrap.style.height = `${g.h}px`;
    for (const el of items) {
      el.style.width = `${g.tile}px`;
      el.style.height = `${g.tile}px`;
      el.style.offsetPath = `path("${g.path}")`;
    }
    lastW = w;
  }

  function place() {
    const n = items.length;
    for (let i = 0; i < n; i++) {
      let v = (base + (i * 100) / n) % 100;
      if (v < 0) v += 100;
      const el = items[i];
      el.style.offsetDistance = `${v.toFixed(3)}%`;
      // Fine-grained so neighbours never share a value — a coarse scale makes
      // adjacent tiles swap stacking order every frame, which reads as flicker.
      // A hovered tile is lifted clear of the pack so it can never enlarge
      // behind its neighbours (which would let them steal the hover).
      el.style.zIndex = el === hoverEl ? '2000' : String(1 + Math.round(v * 10));
      // fade through the masked ends so the loop point never shows
      el.style.opacity = v < 7 ? (v / 7).toFixed(3)
        : v > 93 ? ((100 - v) / 7).toFixed(3)
        : '1';
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // Halt the instant the pointer is over the reel — easing to a stop keeps
    // the tile sliding out from under the cursor, which drops the hover and
    // starts it flickering. Ease back up only on the way out.
    if (!dragging) {
      if (hovering) hoverF = 0;
      else hoverF += (1 - hoverF) * Math.min(1, dt * 4);

      if (Math.abs(dragVel) > 0.015) { base += dragVel; dragVel *= 0.94; }
      else dragVel = 0;
      base += SPEED * dt * hoverF;
    }

    // Only touch the DOM when something actually moved.
    if (base !== lastBase || hoverEl !== lastHover) {
      place();
      lastBase = base;
      lastHover = hoverEl;
    }
    raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!raf && !reduceMotion) { lastT = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  /* The wrapper can still measure 0 on the first pass, before the band has
     been laid out. Keep asking until it has a width rather than giving up —
     otherwise the reel silently never builds. */
  function rebuildIfNeeded() {
    const w = wrap.clientWidth;
    if (!w) {
      if (tries++ < 180) requestAnimationFrame(rebuildIfNeeded);
      return;
    }
    tries = 0;
    fit(w);
    place();
  }

  // pointer: drag to scrub, tap to open
  wrap.addEventListener('pointerdown', (e) => {
    dragging = true; travelled = 0; lastX = e.clientX; dragVel = 0;
    setHover(null);
    wrap.classList.add('is-dragging');
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    travelled += Math.abs(dx);
    const step = -dx * DRAG;
    base += step;
    dragVel = step;
    place();
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-dragging');
    try { wrap.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  };
  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);

  // Touch taps can emit mouseenter, which would freeze the belt for good on a
  // phone — so hover pausing is limited to devices with a real pointer.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  wrap.addEventListener('mouseenter', () => { if (canHover) hovering = true; });
  wrap.addEventListener('mouseleave', () => { hovering = false; setHover(null); });

  // delegated, so a tile moving under a stationary cursor is still tracked
  wrap.addEventListener('pointerover', (e) => {
    if (!canHover || e.pointerType === 'touch' || dragging) return;
    hovering = true;
    setHover(e.target.closest('.reel__item'));
  });
  wrap.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch') return;
    const to = e.relatedTarget;
    if (!to || !to.closest || !to.closest('.reel__item')) setHover(null);
  });

  stage.addEventListener('click', (e) => {
    const btn = e.target.closest('.reel__item');
    if (!btn || travelled > 6) return;
    Lightbox?.open(REEL, Number(btn.dataset.idx) || 0, btn);
  });

  rebuildIfNeeded();
  if (hint) hint.hidden = false;

  // Run straight away; the observer below only pauses it when it scrolls out
  // of view. Never gate starting on the observer firing.
  start();

  window.addEventListener('resize', () => { if (wrap.clientWidth !== lastW) rebuildIfNeeded(); });
  window.addEventListener('load', rebuildIfNeeded, { once: true });

  // keep the observers referenced so they are not collected while observing
  const ro = new ResizeObserver(() => { if (wrap.clientWidth !== lastW) rebuildIfNeeded(); });
  ro.observe(wrap);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '160px' })
    : null;
  io?.observe(wrap);
  wrap.__keep = { ro, io };
})();

/* ------------------------------------------------------------------
   Subtle hero parallax
   ------------------------------------------------------------------ */
(function parallax() {
  const frame = $('.hero__frame img');
  if (!frame || reduceMotion) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, 700);
      frame.style.transform = `translate3d(0, ${y * 0.055}px, 0) scale(1.06)`;
      ticking = false;
    });
  }, { passive: true });
})();
