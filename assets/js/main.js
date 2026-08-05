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
(function lightbox() {
  const dlg = $('#lightbox');
  const img = $('#lb-img');
  const cap = $('#lb-cap');
  const items = $$('.gal__item');
  if (!dlg || !items.length || typeof dlg.showModal !== 'function') return;

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
