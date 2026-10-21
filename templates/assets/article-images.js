/* PortableTextImage trigger/label adaptation: keep Halo img/picture nodes and
 * reuse the photo ZoomImage viewer instead of a second lightbox implementation. */
(() => {
  const viewer = document.querySelector('[data-gallery][data-viewer-kind="article"]');
  const body = document.querySelector('[data-post-detail] .article-body');
  const dialog = viewer?.querySelector('[data-gallery-dialog]');
  if (!body || !dialog || typeof dialog.showModal !== 'function') return;
  const safe = value => {
    try { const url = new URL(value, location.href); return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null; }
    catch (_) { return null; }
  };
  body.querySelectorAll('img').forEach(image => {
    // Let intentional links and plugin-owned viewers keep their own interaction.
    if (image.closest('a,button,pre,code,[data-no-zoom],[data-fancybox],[data-lightbox]') || image.classList.contains('emoji')) return;
    const original = safe(image.src);
    if (!original) return;
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'article-image-trigger';
    trigger.setAttribute('data-gallery-item', '');
    trigger.setAttribute('aria-label', image.alt ? `放大图片：${image.alt}` : '放大图片');
    trigger.dataset.original = original;
    trigger.dataset.preview = safe(image.currentSrc) || original;
    trigger.dataset.photoTitle = image.alt || '';
    trigger.dataset.photoNote = image.closest('figure')?.querySelector('figcaption')?.textContent.trim() || '';
    const print = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
    print.before(trigger); trigger.append(print);
  });
})();
