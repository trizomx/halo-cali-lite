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

  // cali.so v3 PostToc/buildPostRail: landmarks, three quiet ticks,
  // reading cursor, progress toggle and a compact phone island. Halo supplies HTML.
  const headings = [...body.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => h.textContent.trim());
  const list = document.querySelector('[data-toc-list]');
  const toc = document.querySelector('[data-toc]');
  const panel = document.querySelector('[data-toc-panel]');
  const toggle = document.querySelector('[data-toc-toggle]');
  const island = document.querySelector('[data-toc-island]');
  const currentLabel = document.querySelector('[data-toc-current]');
  const ring = document.querySelector('[data-toc-progress]');
  const desktop = matchMedia('(min-width:1024px)');
  const links = [], targets = [];
  let open = desktop.matches;
  const setOpen = (next, instant = false) => {
    open = next;
    if (!toc || !panel || !toggle) return;
    if (next) toc.setAttribute('data-open', ''); else toc.removeAttribute('data-open');
    panel.hidden = !next;
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? '收起文章地图' : '展开文章地图');
    if (next && !instant && !reduced.matches && article.dataset.entryAnimation !== 'false') {
      const nodes = [...list.children], center = (nodes.length - 1) / 2;
      nodes.forEach((item, index) => item.animate?.([
        { opacity: 0, transform: 'translateY(8px) rotate(-2deg)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 260, delay: Math.min(100, Math.abs(index - center) * 12), easing: 'cubic-bezier(.2,.8,.2,1)' }));
    }
  };
  if (list && toc && headings.length) {
    const title = article.querySelector('h1');
    const landmarks = title && !headings.includes(title) ? [title, ...headings] : headings;
    landmarks.forEach((heading, index) => {
      if (!heading.id) {
        let id = `cali-section-${index + 1}`;
        while (document.getElementById(id)) id += '-';
        heading.id = id;
      }
      if (index) for (let tick = 0; tick < 3; tick++) {
        const gap = document.createElement('li'); gap.className = 'source-map-gap';
        gap.setAttribute('aria-hidden', 'true');
        const mark = document.createElement('span'); mark.className = 'source-map-tick';
        gap.append(mark); list.append(gap);
      }
      const label = heading.textContent.trim();
      const item = document.createElement('li');
      const level = Math.max(1, Math.min(6, Number(heading.tagName.slice(1))));
      item.className = 'source-toc-item'; item.dataset.level = String(level);
      const link = document.createElement('a');
      link.className = 'source-toc-link'; link.href = '#' + encodeURIComponent(heading.id);
      link.setAttribute('aria-label', `H${level}：${label}`); link.title = label;
      if (heading === title) link.dataset.variant = 'title';
      const marker = document.createElement('span');
      marker.className = 'source-map-tick'; marker.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span'); text.className = 'source-toc-label'; text.textContent = label;
      link.append(marker, text); item.append(link); list.append(item); links.push(link); targets.push(heading);
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        heading.setAttribute('tabindex', '-1'); heading.focus?.({ preventScroll: true });
        window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - 104, behavior: reduced.matches || event.detail === 0 ? 'instant' : 'smooth' });
        history.replaceState(null, '', link.href);
        if (!desktop.matches) setOpen(false, event.detail === 0);
      });
      if (heading !== title && !heading.querySelector('a[href^="#"]')) {
        const anchor = document.createElement('a'); anchor.className = 'source-heading-anchor'; anchor.href = link.href;
        anchor.textContent = '#'; anchor.setAttribute('aria-label', '链接到：' + label); heading.append(anchor);
      }
    });
    toc.hidden = false; setOpen(open, true);
    toggle?.addEventListener('click', event => setOpen(!open, event.detail === 0));
    desktop.addEventListener?.('change', () => { setOpen(desktop.matches, true); schedule(); });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && open && !desktop.matches) { setOpen(false, true); toggle?.focus(); }
    });
    window.addEventListener('pointerdown', event => {
      if (open && !desktop.matches && !toc.contains(event.target)) setOpen(false, true);
    });
    document.querySelector('[data-toc-top]')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
      if (!desktop.matches) setOpen(false, true);
    });
  }
  const progress = document.querySelector('[data-reading-progress]');
  const update = () => {
    const rect = body.getBoundingClientRect(), range = rect.height - window.innerHeight;
    const fraction = Math.max(0, Math.min(1, range > 0 ? -rect.top / range : (rect.bottom <= window.innerHeight ? 1 : 0)));
    if (progress) progress.textContent = `${Math.round(fraction * 100)}%`;
    ring?.setAttribute('stroke-dasharray', `${fraction} 1`);
    if (!links.length) return;
    let index = 0;
    targets.forEach((heading, current) => { if (heading.getBoundingClientRect().top <= 105) index = current; });
    if (rect.bottom <= window.innerHeight) index = targets.length - 1;
    links.forEach((link, current) => {
      const active = current === index && article.getBoundingClientRect().bottom > 0;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    if (currentLabel) currentLabel.textContent = links[index].title;
    if (island) {
      const visible = desktop.matches || (article.querySelector('h1') || body).getBoundingClientRect().bottom <= 104;
      // hidden also removes offscreen controls from keyboard navigation.
      island.hidden = !visible;
      if (!visible && open && !desktop.matches) setOpen(false, true);
    }
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true; requestAnimationFrame(() => { queued = false; update(); });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule); window.addEventListener('load', schedule); update();
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
