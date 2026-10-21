/* Generated from src/cali/navigation.js; edit source and rebuild. */
/* Port of blog/[slug]/loading.tsx, adapted to native full-page navigation. */
(() => {
  const loading = document.querySelector('[data-post-loading]');
  if (!loading) return;
  // The loading sheet is a viewport sibling, never a transformed card child.
  if (document.body && loading.parentElement !== document.body) document.body.append(loading);
  let pending, guard;
  const reset = () => {
    clearTimeout(pending); clearTimeout(guard);
    loading.hidden = true;
  };
  const start = () => {
    reset();
    pending = setTimeout(() => { loading.hidden = false; }, 120);
    guard = setTimeout(reset, 12000);
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[data-post-link]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
    start();
  });
  document.addEventListener('cali:page-loading', event => { if (event.detail?.post) start(); });
  window.addEventListener('pageshow', reset);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reset(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') reset(); });
})();
