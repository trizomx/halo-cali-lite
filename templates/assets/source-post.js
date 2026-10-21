/* Generated from src/cali/post.js; edit source and rebuild. */
/* Port of BlogPostPage, BlogPostTableOfContents and PortableTextCodeBlock.
 * React motion springs are integrated into native WAAPI frames; Halo owns HTML.
 */
(() => {
  const article = document.querySelector('[data-post-detail]');
  if (!article) return;
  const body = article.querySelector('.article-body');
  if (!body) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Unit mass, same stiffness/damping as the source Framer Motion transitions.
  const spring = (stiffness, damping) => {
    let x = 0, velocity = 0;
    const values = [0], dt = 1 / 120;
    for (let step = 0; step < 240; step++) {
      velocity += (stiffness * (1 - x) - damping * velocity) * dt;
      x += velocity * dt;
      values.push(x);
      if (step > 12 && Math.abs(1 - x) < .001 && Math.abs(velocity) < .01) break;
    }
    values[values.length - 1] = 1;
    return { values, duration: (values.length - 1) * dt * 1000 };
  };
  const reveal = (element, { y = 5, scale = 1, stiffness = 150, damping = 20, delay = 0, blur = 0 } = {}) => {
    if (reduced.matches || article.dataset.entryAnimation === 'false' || !element?.animate) return;
    const { values, duration } = spring(stiffness, damping);
    const animation = element.animate(values.map((value, index) => ({
      offset: index / (values.length - 1),
      opacity: Math.max(0, Math.min(1, value)),
      transform: `translateY(${y * (1 - value)}px) scale(${scale + (1 - scale) * value})`,
      filter: `blur(${Math.max(0, blur * (1 - value))}px)`
    })), { duration, delay: delay * 1000, easing: 'linear', fill: 'both' });
    animation.finished.then(() => animation.cancel()).catch(() => {});
  };
  const variants = {
    cover: { y: 10, scale: .96, stiffness: 120, damping: 20 },
    meta: { y: 10, delay: .1 },
    title: { y: 8, damping: 30, delay: .2 },
    summary: { y: 8, delay: .23 },
    stats: { y: 5, delay: .255 }
  };
  article.querySelectorAll('[data-reveal]').forEach(element => reveal(element, variants[element.dataset.reveal]));

  const headings = [...body.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const list = document.querySelector('[data-toc-list]');
  const toc = document.querySelector('[data-toc]');
  const links = [];
  if (list && toc && headings.length) {
    headings.forEach((heading, index) => {
      if (!heading.id) {
        let id = `cali-section-${index + 1}`;
        while (document.getElementById(id)) id += '-';
        heading.id = id;
      }
      const label = heading.textContent.trim();
      const item = document.createElement('li');
      const level = Math.max(1, Math.min(6, Number(heading.tagName.slice(1))));
      item.className = 'source-toc-item';
      item.dataset.level = String(level);
      const link = document.createElement('a');
      link.className = 'source-toc-link';
      link.href = '#' + encodeURIComponent(heading.id);
      link.setAttribute('aria-label', `H${level}：${label}`);
      const marker = document.createElement('span');
      marker.className = 'source-toc-level'; marker.textContent = `H${level}`;
      marker.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.className = 'source-toc-label'; text.textContent = label;
      link.append(marker, text);
      item.append(link); list.append(item); links.push(link);
      if (!heading.querySelector('a[href^="#"]')) {
        const anchor = document.createElement('a');
        anchor.className = 'source-heading-anchor'; anchor.href = link.href;
        anchor.textContent = '#'; anchor.setAttribute('aria-label', '链接到：' + label);
        heading.append(anchor);
      }
      reveal(item, { delay: .255 + index * .08, blur: 8 });
    });
    toc.hidden = false;
  }
  const progress = document.querySelector('[data-reading-progress]');
  const update = () => {
    const rect = body.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    const fraction = range > 0 ? -rect.top / range : (rect.bottom <= window.innerHeight ? 1 : 0);
    if (progress) progress.textContent = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`;
    if (!links.length) return;
    // Highlight the section being read, rather than the next heading below it.
    let index = 0;
    headings.forEach((heading, current) => { if (heading.getBoundingClientRect().top <= 128) index = current; });
    links.forEach((link, current) => {
      const active = current === index && article.getBoundingClientRect().bottom > 0;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  update();
  const copy = async (button, value, normal, success) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      button.textContent = success;
    } catch (_) { button.textContent = '复制失败'; }
    setTimeout(() => { button.textContent = normal; }, 3000);
  };
  body.querySelectorAll('pre').forEach(pre => {
    if (pre.closest('.source-code-block')) return;
    const code = pre.querySelector('code');
    const value = (code || pre).textContent;
    const block = document.createElement('div');
    block.className = 'source-code-block group relative rounded-3xl border border-[--tw-prose-pre-border] dark:bg-zinc-800/80';
    const toolbar = document.createElement('div');
    toolbar.className = 'source-code-toolbar not-prose';
    const language = document.createElement('span');
    language.textContent = pre.dataset.filename || code?.className.match(/language-([\w+-]+)/)?.[1] || '代码';
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = '复制';
    button.setAttribute('aria-label', '复制代码'); button.setAttribute('aria-live', 'polite');
    button.addEventListener('click', () => copy(button, value, '复制', '已复制'));
    toolbar.append(language, button);
    pre.before(block); block.append(toolbar, pre);
  });
  const share = document.querySelector('[data-copy-post]');
  share?.setAttribute('aria-live', 'polite');
  share?.addEventListener('click', () => copy(share, location.href, '↗', '✓'));
  document.querySelector('[data-post-top]')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }));
})();
