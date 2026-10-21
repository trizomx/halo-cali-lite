(() => {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');
  const sync = () => toggles.forEach(button => button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark')));
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let manual = false;
  try { manual = ['light', 'dark'].includes(localStorage.getItem('cali-lite-appearance')); } catch (_) {}
  toggles.forEach(button => button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    manual = true;
    try { localStorage.setItem('cali-lite-appearance', root.dataset.theme); } catch (_) {}
    sync();
  }));
  preference.addEventListener('change', event => { if (!manual) { root.dataset.theme = event.matches ? 'dark' : 'light'; sync(); } });
  sync();

  document.querySelectorAll('[data-current-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
  const topButton = document.querySelector('[data-back-top]');
  const updateScroll = () => { if (topButton) topButton.hidden = scrollY < 500; };
  window.addEventListener('scroll', updateScroll, { passive: true });
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  updateScroll();

})();
