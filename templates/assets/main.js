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

  const dialog = document.getElementById('about-dialog');
  document.querySelectorAll('[data-about-open]').forEach(button => button.addEventListener('click', () => {
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }));
  document.querySelector('[data-about-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });

  document.querySelectorAll('[data-current-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
  const topButton = document.querySelector('[data-back-top]');
  const updateScroll = () => { if (topButton) topButton.hidden = scrollY < 500; };
  window.addEventListener('scroll', updateScroll, { passive: true });
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  updateScroll();

  const headings = document.querySelectorAll('.article-body h2, .article-body h3');
  const toc = document.querySelector('[data-toc]');
  const list = document.querySelector('[data-toc-list]');
  if (headings.length && toc && list) {
    const links = new Map();
    headings.forEach((heading, index) => {
      if (!heading.id) {
        let id = `cali-section-${index + 1}`;
        while (document.getElementById(id)) id += '-';
        heading.id = id;
      }
      const link = document.createElement('a');
      link.href = '#' + encodeURIComponent(heading.id);
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.className = 'toc-sub';
      list.append(link);
      links.set(heading, link);
    });
    toc.hidden = false;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => link.classList.remove('is-active'));
          links.get(entry.target)?.classList.add('is-active');
        }
      }), { rootMargin: '-10% 0px -70% 0px' });
      headings.forEach(heading => observer.observe(heading));
    }
  }
})();
