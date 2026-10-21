/* Independent lightbox. Originals are requested here only for an opened photo;
 * wall previews are supplied by Halo thumbnails or an explicitly uploaded preview. */
(() => {
  const wall = document.querySelector('[data-gallery]');
  if (!wall) return;
  const items = [...wall.querySelectorAll('[data-gallery-item]')];
  if (!items.length) {
    wall.hidden = true;
    const empty = document.querySelector('[data-gallery-empty]');
    if (empty) empty.hidden = false;
    return;
  }
  // v3 PublishedPhotoItem: centre-out reveal. Use the loaded preview's natural
  // ratio; no original request is needed to lay out the masonry.
  const center = (items.length - 1) / 2;
  items.forEach((item, index) => {
    item.style.setProperty('--photo-delay', `${Math.min(700, 120 + Math.abs(index - center) * 50)}ms`);
    const preview = item.querySelector('img');
    if (!preview) return;
    const ready = () => {
      if (preview.naturalWidth > 0) item.classList.add('is-loaded');
    };
    preview.addEventListener('load', ready);
    preview.addEventListener('error', () => item.classList.add('is-unavailable'));
    if (preview.complete) ready();
  });
  const dialog = wall.querySelector('[data-gallery-dialog]');
  const image = wall.querySelector('[data-gallery-image]');
  const title = wall.querySelector('[data-gallery-title]');
  const counter = wall.querySelector('[data-gallery-counter]');
  const status = wall.querySelector('[data-gallery-status]');
  const originalButton = wall.querySelector('[data-gallery-original]');
  const originalLink = wall.querySelector('[data-gallery-open-original]');
  const dimensions = wall.querySelector('[data-gallery-dimensions]');
  const stage = wall.querySelector('[data-gallery-stage]');
  const previous = wall.querySelector('[data-gallery-prev]');
  const next = wall.querySelector('[data-gallery-next]');
  const info = wall.querySelector('[data-gallery-info]');
  if (!dialog || !image || typeof dialog.showModal !== 'function') return;
  const safeUrl = value => {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null;
    } catch (_) { return null; }
  };
  const mode = ['manual', 'auto', 'original'].includes(wall.dataset.loadMode) ? wall.dataset.loadMode : 'manual';
  const connection = navigator.connection;
  const saveData = () => !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  let index = 0, opener = null, request = null, ticket = 0, slowTimer = null;
  let motion = null, motionTimer = null, closing = false, currentRatio = 4 / 3;
  const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const stopMotion = () => { clearTimeout(motionTimer); motion?.cancel(); motion = null; };
  const fitPhoto = (width, height) => {
    if (width > 0 && height > 0) currentRatio = width / height;
    const rect = stage.getBoundingClientRect(), pad = (window.innerWidth || 1024) < 680 ? 36 : 64;
    const maxW = Math.max(1, (rect.width || rect.right - rect.left) - pad * 2);
    if (info) info.style.width = `${Math.min(640, maxW)}px`;
    const captionHeight = info ? info.getBoundingClientRect().height || 80 : 0;
    const captionSpace = captionHeight ? captionHeight + 16 : 0;
    const maxH = Math.max(1, (rect.height || rect.bottom - rect.top) - 20 - captionSpace);
    const w = Math.min(maxW, maxH * currentRatio), h = w / currentRatio;
    image.style.left = `${rect.left + ((rect.width || rect.right - rect.left) - w) / 2}px`;
    const top = rect.top + ((rect.height || rect.bottom - rect.top) - h - captionSpace) / 2;
    image.style.top = `${top}px`;
    if (info) { info.style.top = `${top + h + 16}px`; info.style.left = `${rect.left + (rect.width || rect.right - rect.left) / 2}px`; }
    image.style.width = `${w}px`; image.style.height = `${h}px`;
  };
  // v3 ZoomImage FLIP: map the full image rectangle back to its inline thumbnail.
  const flight = (returning = false) => {
    stopMotion();
    if (reducedMotion() || !image.animate || image.hidden) return null;
    const source = items[index].querySelector('img')?.getBoundingClientRect();
    const target = image.getBoundingClientRect();
    if (!source || !(target.width > 0) || !(source.width > 0)) return null;
    const scale = source.width / target.width;
    const x = source.left + source.width / 2 - (target.left + target.width / 2);
    const y = source.top + source.height / 2 - (target.top + target.height / 2);
    const inline = { transform: `translate(${x}px,${y}px) scale(${scale})`, opacity: .8 };
    const expanded = { transform: 'none', opacity: 1 };
    motion = image.animate(returning ? [expanded, inline] : [inline, expanded], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    return motion;
  };
  const stopRequest = () => {
    ticket++;
    clearTimeout(slowTimer);
    if (request) {
      request.onload = null; request.onerror = null;
      request.removeAttribute?.('src'); request = null;
    }
  };
  const setInfo = item => {
    const data = item.dataset;
    title.textContent = data.photoTitle || '照片浏览';
    counter.textContent = `${index + 1} / ${items.length}`;
    const note = wall.querySelector('[data-gallery-note]');
    if (note) { note.textContent = data.photoNote || ''; note.hidden = !data.photoNote; }
    for (const field of ['date', 'location', 'camera', 'lens', 'focal', 'aperture', 'shutter', 'iso']) {
      const row = wall.querySelector(`[data-gallery-row="${field}"]`);
      const target = wall.querySelector(`[data-gallery-field="${field}"]`);
      const value = data['photo' + field[0].toUpperCase() + field.slice(1)] || '';
      if (row && target) { target.textContent = value; row.hidden = !value; }
    }
    if (dimensions) dimensions.textContent = '等待图片加载';
  };
  const load = (url, quality, onReady) => {
    stopRequest();
    const currentTicket = ticket;
    const candidate = new Image();
    request = candidate;
    candidate.decoding = 'async';
    status.textContent = quality === 'original' ? '正在加载原图，保留当前预览…' : '正在加载预览…';
    originalButton.disabled = quality === 'original';
    originalButton.textContent = quality === 'original' ? '原图加载中…' : '查看原图';
    const complete = () => {
      if (!dialog.open || currentTicket !== ticket) return;
      clearTimeout(slowTimer); request = null;
      // No srcset: a responsive postprocessor must not override quality selection.
      image.removeAttribute('srcset'); image.removeAttribute('sizes');
      image.src = url; image.hidden = false;
      const label = quality === 'original' ? '原图' : '预览';
      status.textContent = quality === 'preview' && mode === 'auto' && saveData() ? '预览已加载；省流量模式下不自动加载原图' : `${label}已加载`;
      if (dimensions) dimensions.textContent = `${label} · ${candidate.naturalWidth} × ${candidate.naturalHeight} px`;
      fitPhoto(candidate.naturalWidth, candidate.naturalHeight);
      originalButton.disabled = quality === 'original';
      originalButton.textContent = quality === 'original' ? '已显示原图' : '查看原图';
      if (onReady) onReady();
    };
    candidate.onload = () => {
      if (!candidate.naturalWidth) { candidate.onerror?.(); return; }
      complete();
    };
    candidate.onerror = () => {
      if (!dialog.open || currentTicket !== ticket) return;
      clearTimeout(slowTimer); request = null;
      status.textContent = quality === 'original' ? '原图加载失败，保留当前预览；可重试或新窗口打开' : '预览加载失败，可尝试查看原图';
      originalButton.disabled = false;
      originalButton.textContent = quality === 'original' ? '重试原图' : '查看原图';
    };
    slowTimer = setTimeout(() => {
      if (dialog.open && currentTicket === ticket) status.textContent = quality === 'original' ? '原图加载较慢，可继续等待或新窗口打开' : '预览加载较慢，可继续等待或查看原图';
    }, 15000);
    candidate.src = url;
  };
  const show = (nextIndex, animate = false) => {
    if (closing) return;
    stopMotion(); stopRequest();
    index = (nextIndex + items.length) % items.length;
    const item = items[index];
    const original = safeUrl(item.dataset.original);
    const preview = safeUrl(item.dataset.preview) || original;
    if (!original) { status.textContent = '照片地址不可用'; return; }
    setInfo(item);
    image.alt = item.dataset.photoTitle || '照片';
    const thumb = item.querySelector('img');
    const cachedPreview = safeUrl(thumb?.currentSrc || thumb?.src || '');
    image.removeAttribute('srcset'); image.removeAttribute('sizes');
    if (cachedPreview) { image.src = cachedPreview; image.hidden = false; }
    else { image.removeAttribute('src'); image.hidden = true; }
    originalLink.href = original;
    previous.disabled = next.disabled = items.length === 1;
    fitPhoto(thumb?.naturalWidth || 800, thumb?.naturalHeight || 600);
    if (animate) flight();
    if (mode === 'original' || preview === original) load(original, 'original');
    else load(preview, 'preview', () => {
      // Automatic upgrading applies only to the photo actually being viewed.
      if (mode === 'auto' && !saveData() && dialog.open) load(original, 'original');
    });
  };
  items.forEach((item, itemIndex) => {
    const thumb = item.querySelector('img');
    thumb?.addEventListener('error', () => { thumb.hidden = true; item.classList.add('is-unavailable'); });
    item.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (!safeUrl(item.dataset.original)) return;
      if (!dialog.open) {
        try { dialog.showModal(); } catch (_) { return; }
      }
      event.preventDefault(); opener = item;
      document.documentElement.classList.add('is-gallery-open');
      show(itemIndex, event.detail !== 0);
    });
  });
  const cleanup = () => {
    stopRequest(); stopMotion(); closing = false; dialog.classList.remove('is-closing');
    document.documentElement.classList.remove('is-gallery-open');
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  };
  const requestClose = (instant = false) => {
    if (!dialog.open || closing) return;
    closing = true; stopRequest();
    dialog.classList.add('is-closing');
    const animation = instant ? null : flight(true);
    if (!animation) { dialog.close(); return; }
    let settled = false;
    const finish = () => { if (settled) return; settled = true; if (dialog.open) dialog.close(); };
    animation.finished.then(finish).catch(() => {});
    motionTimer = setTimeout(finish, 450);
  };
  wall.querySelector('[data-gallery-close]')?.addEventListener('click', () => requestClose());
  dialog.addEventListener('close', cleanup);
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(true); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target === stage || event.target === image) requestClose();
  });
  window.addEventListener('resize', () => { if (dialog.open && !closing) { stopMotion(); fitPhoto(); } });
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  originalButton.addEventListener('click', () => {
    const url = safeUrl(items[index].dataset.original);
    if (url) load(url, 'original');
  });
  dialog.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (items.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touch = null;
  stage.addEventListener('touchstart', event => {
    touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (items.length > 1 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
  window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); else cleanup(); });
})();
