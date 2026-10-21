/* Native Halo page links; no client router or content interception. */
(() => {
  const nav = document.querySelector('[data-top-nav]');
  if (!nav) return;
  const indicator = nav.querySelector('.nav-indicator');
  const header = document.querySelector('[data-sticky-header]');
  const items = [...nav.querySelectorAll('.nav-item')];
  const active = nav.querySelector('[aria-current="page"]');
  const about = nav.querySelector('[data-about-open]');
  const dialog = document.getElementById('about-dialog');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'cali-lite-nav-position';
  if (!indicator) return;

  const measure = item => {
    const box = item.getBoundingClientRect();
    const parent = nav.getBoundingClientRect();
    return { x: box.left - parent.left + 10, width: Math.max(12, box.width - 20) };
  };
  const draw = item => {
    if (!item) { indicator.style.opacity = '0'; return; }
    const position = measure(item);
    indicator.style.transform = `translateX(${position.x}px)`;
    indicator.style.width = `${position.width}px`;
    indicator.style.opacity = '1';
  };
  const selected = () => dialog?.open ? about : active;
  let initialized = false;
  const restore = () => { if (initialized && !nav.hidden && !header?.classList.contains('is-reading')) draw(selected()); };

  let previous = null;
  try {
    previous = JSON.parse(sessionStorage.getItem(storageKey));
    sessionStorage.removeItem(storageKey);
  } catch (_) {}
  const validPrevious = previous && Number.isFinite(previous.x) && Number.isFinite(previous.width)
    && Number.isFinite(previous.time) && Date.now() - previous.time < 120000 && Date.now() >= previous.time
    && previous.target === location.pathname
    && previous.viewport === innerWidth && previous.x >= 0 && previous.width >= 12
    && previous.x + previous.width <= nav.getBoundingClientRect().width;
  indicator.style.transition = 'none';
  if (active && validPrevious) {
    indicator.style.transform = `translateX(${previous.x}px)`;
    indicator.style.width = `${previous.width}px`;
    indicator.style.opacity = '1';
  } else indicator.style.opacity = '0';
  nav.classList.add('is-ready');
  const finishLoading = () => {
    // Two frames preserve the previous position before starting the final move.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        indicator.style.transition = reduced.matches ? 'none' : '';
        initialized = true;
        draw(selected());
        document.documentElement.removeAttribute('data-nav-pending');
      });
    });
  };
  if (document.readyState === 'complete') finishLoading();
  else window.addEventListener('load', finishLoading, { once: true });

  items.forEach(item => {
    item.addEventListener('click', event => {
      if (item.matches('a[href]') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
        const target = new URL(item.href, location.href);
        if (target.origin === location.origin && active && target.pathname !== location.pathname && (!item.target || item.target === '_self')) {
          try { sessionStorage.setItem(storageKey, JSON.stringify({ ...measure(active), target: target.pathname, time: Date.now(), viewport: innerWidth })); } catch (_) {}
        }
      }
      // Real page links keep the current marker until the new document finishes loading.
      // About is a dialog; only mark it after main.js has opened the dialog.
      if (item === about && dialog?.open) restore();
    });
  });
  nav.addEventListener('pointermove', event => {
    const box = nav.getBoundingClientRect();
    nav.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
    nav.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
  });
  dialog?.addEventListener('close', restore);
  // The dialog can also be opened by the hero action outside this navigation.
  if (dialog && typeof MutationObserver !== 'undefined') {
    new MutationObserver(restore).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(restore).observe(nav);
  window.addEventListener('resize', restore, { passive: true });
  window.addEventListener('pageshow', event => { if (event.persisted) restore(); });
  let lastScroll = Math.max(0, scrollY);
  let offset = 0;
  let scrollFrame = 0;
  const paintHeader = () => {
    if (!header) return;
    header.style.setProperty('--header-offset', `${-offset}px`);
    header.classList.toggle('is-header-hidden', offset >= header.offsetHeight + 8);
  };
  const showHeader = () => { offset = 0; paintHeader(); };
  const updateScroll = () => {
    scrollFrame = 0;
    const current = Math.max(0, scrollY);
    header?.classList.toggle('is-scrolled', current > 12);
    // Let the home portrait reach its small resting slot before the header
    // starts leaving. Every following scroll pixel moves the header one pixel.
    const anchor = document.querySelector('[data-home-avatar-anchor]');
    const slot = document.querySelector('[data-avatar-slot]');
    const headerTop = header?.getBoundingClientRect().top || 0;
    const delay = anchor && slot ? Math.max(0, anchor.getBoundingClientRect().top + current - (slot.getBoundingClientRect().top - headerTop)) : 0;
    const delta = Math.max(0, current - delay) - Math.max(0, lastScroll - delay);
    if (current <= delay || dialog?.open || (document.activeElement?.matches(':focus-visible') && header?.contains(document.activeElement))) {
      offset = 0;
    } else {
      offset = Math.min((header?.offsetHeight || 100) + 8, Math.max(0, offset + delta));
    }
    paintHeader();
    lastScroll = current;
  };
  const scheduleScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  header?.addEventListener('focusin', showHeader);
  window.addEventListener('pageshow', () => { showHeader(); lastScroll = Math.max(0, scrollY); });
  updateScroll();
})();
