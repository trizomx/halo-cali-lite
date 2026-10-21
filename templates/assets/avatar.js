/* One real avatar on home: scroll it into the header; retain native Halo pages. */
(() => {
  const anchor = document.querySelector('[data-home-avatar-anchor]');
  const slot = document.querySelector('[data-avatar-slot]');
  const avatar = anchor?.querySelector('[data-site-avatar]');
  if (!anchor || !slot || !avatar) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let geometry = null;
  let frame = 0;
  let leaving = false;
  let compact = false;
  let departure = null;
  // Move the existing node, never clone a second visible portrait.
  slot.append(avatar);

  const draw = () => {
    frame = 0;
    if (!geometry || leaving) return;
    const { top, left, targetTop, targetLeft, size, targetSize } = geometry;
    const distance = Math.max(1, top - targetTop);
    let progress = Math.min(1, Math.max(0, window.scrollY / distance));
    if (reduced.matches) progress = window.scrollY > 12 ? 1 : 0;
    compact = progress === 1;
    const remaining = 1 - progress;
    const x = (left - targetLeft) * remaining;
    const y = distance * remaining;
    const scale = 1 + (size / targetSize - 1) * remaining;
    avatar.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    document.body.style.setProperty('--avatar-compact', String(progress));
  };
  const measure = () => {
    const origin = anchor.getBoundingClientRect();
    const target = slot.getBoundingClientRect();
    if (!origin.width || !target.width) return;
    geometry = {
      top: origin.top + window.scrollY,
      left: origin.left,
      targetTop: target.top,
      targetLeft: target.left,
      size: origin.width,
      targetSize: target.width
    };
    draw();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
  measure();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  reduced.addEventListener('change', schedule);
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    observer.observe(slot);
  }

  // Modern browsers morph the named avatar between real documents. Older
  // browsers play the short shrink first, then follow the ordinary page URL.
  const crossDocumentTransitions = 'onpageswap' in window && 'onpagereveal' in window
    && typeof CSS !== 'undefined' && CSS.supports('view-transition-name', 'theme-avatar');
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
    if (crossDocumentTransitions || reduced.matches || compact || typeof avatar.animate !== 'function') return;
    if (leaving) { event.preventDefault(); return; }
    event.preventDefault();
    leaving = true;
    departure = avatar.animate([
      { transform: avatar.style.transform },
      { transform: 'translate3d(0, 0, 0) scale(1)' }
    ], { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    departure.finished.then(() => {
      if (leaving) location.assign(target.href);
    }).catch(() => {});
  });
  window.addEventListener('pageshow', () => {
    leaving = false;
    departure?.cancel();
    departure = null;
    measure();
  });
})();
