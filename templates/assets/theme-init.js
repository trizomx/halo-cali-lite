/* Loaded in head to apply the saved preference before paint. */
(() => {
  let saved = null;
  try { saved = localStorage.getItem('wulong-lite-appearance'); } catch (_) {}
  const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
