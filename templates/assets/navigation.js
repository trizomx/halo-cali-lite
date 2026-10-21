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
  const storageKey = 'wulong-lite-nav-position';
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
  let interacted = false;
  const restore = () => { if (initialized) draw(selected()); };

  let previous = null;
  try {
    previous = JSON.parse(sessionStorage.getItem(storageKey));
    sessionStorage.removeItem(storageKey);
  } catch (_) {}
  const validPrevious = previous && Number.isFinite(previous.x) && Number.isFinite(previous.width)
    && Number.isFinite(previous.time) && Date.now() - previous.time < 15000 && Date.now() >= previous.time
    && previous.viewport === innerWidth && previous.x >= 0 && previous.width >= 12
    && previous.x + previous.width <= nav.getBoundingClientRect().width;
  indicator.style.transition = 'none';
  if (active && validPrevious && !reduced.matches) {
    indicator.style.transform = `translateX(${previous.x}px)`;
    indicator.style.width = `${previous.width}px`;
    indicator.style.opacity = '1';
  } else draw(active);
  nav.classList.add('is-ready');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      indicator.style.transition = '';
      initialized = true;
      if (!interacted) draw(selected());
    });
  });

  items.forEach(item => {
    const preview = () => { interacted = true; draw(item); };
    item.addEventListener('pointerenter', preview);
    item.addEventListener('focus', preview);
    item.addEventListener('click', event => {
      interacted = true;
      if (item.matches('a[href]') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
        const target = new URL(item.href, location.href);
        if (target.origin === location.origin && active && target.pathname !== location.pathname && (!item.target || item.target === '_self')) {
          try { sessionStorage.setItem(storageKey, JSON.stringify({ ...measure(active), time: Date.now(), viewport: innerWidth })); } catch (_) {}
        }
      }
      draw(item);
    });
  });
  nav.addEventListener('pointerleave', restore);
  nav.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!nav.contains(document.activeElement)) restore();
  }));
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
  const updateScroll = () => header?.classList.toggle('is-scrolled', scrollY > 12);
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
})();
