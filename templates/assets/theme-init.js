/* Loaded in head to apply the saved preference before paint. */
(() => {
  let saved = null;
  try { saved = localStorage.getItem('cali-lite-appearance'); } catch (_) {}
  const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  // Avoid flashing the target underline while the new document is still loading.
  try {
    const pending = JSON.parse(sessionStorage.getItem('cali-lite-nav-position'));
    if (pending?.target === location.pathname && Number.isFinite(pending.time)
        && Date.now() >= pending.time && Date.now() - pending.time < 120000) {
      document.documentElement.setAttribute('data-nav-pending', '');
    }
  } catch (_) {}
})();
