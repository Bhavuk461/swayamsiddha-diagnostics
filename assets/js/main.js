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
  const items = $$('.gal__item');
  if (!dlg || !items.length || typeof dlg.showModal !== 'function') return null;

  let index = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const btn = items[index];
    img.src = btn.dataset.full;
    img.alt = $('img', btn)?.alt || '';
    cap.textContent = btn.dataset.cap || '';
  };

  items.forEach((btn, i) =>
    btn.addEventListener('click', () => {
      show(i);
      dlg.showModal();
      document.body.classList.add('is-locked');
    })
  );

  const open = (i) => {
    show(i);
    dlg.showModal();
    document.body.classList.add('is-locked');
  };

  const close = () => dlg.close();
  $('#lb-close')?.addEventListener('click', close);
  $('#lb-prev')?.addEventListener('click', () => show(index - 1));
  $('#lb-next')?.addEventListener('click', () => show(index + 1));

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });
  dlg.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    items[index]?.focus();
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
  const sources = $$('.gal__item');
  if (!wrap || !stage || !sources.length) return;

  const SPEED = 2.4;        // % of the path per second
  const HOVER_SLOW = 0.25;  // multiplier while pointing at the reel
  const DRAG = 0.085;       // % of the path per pixel dragged
  const clamp = (lo, v, hi) => Math.max(lo, Math.min(v, hi));

  let items = [], base = 0, raf = 0;
  let hovering = false, dragging = false, dragVel = 0, hoverF = 1;
  let lastT = 0, lastX = 0, travelled = 0, lastW = 0;

  /* Geometry derived from the live width: a shallow wave running off both
     edges, tiles sized to stay legible, and just enough tiles to fill it. */
  function geometry(w) {
    const h = Math.round(clamp(200, w * 0.22, 300));
    const tw = Math.round(clamp(96, w * 0.105, 150));
    const th = Math.round(tw * 0.7);
    const y0 = h * 0.70, yT = h * 0.26, yB = h * 0.80, yE = h * 0.45;
    const x = (f) => Math.round(w * f);
    const path = `M${x(-0.12)} ${y0.toFixed(1)}`
      + `C${x(0.05)} ${y0.toFixed(1)} ${x(0.10)} ${yT.toFixed(1)} ${x(0.30)} ${yT.toFixed(1)}`
      + `C${x(0.50)} ${yT.toFixed(1)} ${x(0.55)} ${yB.toFixed(1)} ${x(0.76)} ${yB.toFixed(1)}`
      + `C${x(0.92)} ${yB.toFixed(1)} ${x(1.02)} ${yE.toFixed(1)} ${x(1.14)} ${yE.toFixed(1)}`;
    const count = Math.max(4, Math.round((w * 1.36) / (tw * 1.06)));
    return { h, tw, th, path, count };
  }

  function build(g) {
    stage.replaceChildren();
    items = [];
    for (let i = 0; i < g.count; i++) {
      const src = sources[i % sources.length];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reel__item';
      btn.dataset.idx = String(i % sources.length);
      if (i >= sources.length) { btn.setAttribute('aria-hidden', 'true'); btn.tabIndex = -1; }
      else btn.setAttribute('aria-label', `Enlarge photo: ${src.dataset.cap || ''}`);

      const img = document.createElement('img');
      img.src = src.dataset.full;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      btn.appendChild(img);
      stage.appendChild(btn);
      items.push(btn);
    }
  }

  function fit() {
    const w = wrap.clientWidth;
    if (!w) return;
    const g = geometry(w);
    if (!items.length || items.length !== g.count) build(g);
    wrap.style.height = `${g.h}px`;
    for (const el of items) {
      el.style.width = `${g.tw}px`;
      el.style.height = `${g.th}px`;
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
      el.style.zIndex = String(1 + Math.round((v / 100) * 12));
      // fade through the masked ends so the loop point never shows
      el.style.opacity = v < 7 ? (v / 7).toFixed(3)
        : v > 93 ? ((100 - v) / 7).toFixed(3)
        : '1';
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    const target = hovering && !dragging ? HOVER_SLOW : 1;
    hoverF += (target - hoverF) * Math.min(1, dt * 7);

    if (!dragging) {
      if (Math.abs(dragVel) > 0.015) { base += dragVel; dragVel *= 0.94; }
      else dragVel = 0;
      base += SPEED * dt * hoverF;
    }

    place();
    raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!raf && !reduceMotion) { lastT = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  function rebuildIfNeeded() {
    fit();
    place();
  }

  // pointer: drag to scrub, tap to open
  wrap.addEventListener('pointerdown', (e) => {
    dragging = true; travelled = 0; lastX = e.clientX; dragVel = 0;
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

  wrap.addEventListener('mouseenter', () => (hovering = true));
  wrap.addEventListener('mouseleave', () => (hovering = false));

  stage.addEventListener('click', (e) => {
    const btn = e.target.closest('.reel__item');
    if (!btn || travelled > 6) return;
    Lightbox?.open(Number(btn.dataset.idx) || 0);
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
