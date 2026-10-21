/* Halo adapter for Sanity metadata.palette.dominant background/foreground.
 * Sample the whole asset by population; never invert, boost or proxy colours.
 */
(() => {
  const cache = new Map();
  const hash = value => {
    let result = 2166136261;
    for (const character of value) result = Math.imul(result ^ character.codePointAt(0), 16777619);
    // Avalanche the seed: similar generated post IDs should not cluster in one hue.
    result = Math.imul(result ^ (result >>> 16), 0x85ebca6b);
    result = Math.imul(result ^ (result >>> 13), 0xc2b2ae35);
    return (result ^ (result >>> 16)) >>> 0;
  };
  const foreground = rgb => {
    const luminance = rgb.map(channel => {
      const value = channel / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
  };
  const sample = image => {
    try {
      const canvas = document.createElement('canvas');
      if (!image.naturalWidth || !image.naturalHeight) return null;
      const scale = Math.min(1, 64 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return null;
      // Sanity's palette describes the asset, not a centre crop of its cover.
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map();
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 128) continue;
        const [r, g, b] = pixels.slice(index, index + 3);
        const key = (r >> 5) * 64 + (g >> 5) * 8 + (b >> 5);
        const bucket = buckets.get(key) || [0, 0, 0, 0];
        bucket[0]++; bucket[1] += r; bucket[2] += g; bucket[3] += b;
        buckets.set(key, bucket);
      }
      let winner = null;
      let best = 0;
      for (const bucket of buckets.values()) {
        const rgb = bucket.slice(1).map(total => Math.round(total / bucket[0]));
        const score = bucket[0];
        if (score > best) { winner = rgb; best = score; }
      }
      return winner;
    } catch (_) {
      // Cross-origin images without CORS can display but cannot be read.
      return null;
    }
  };
  const palette = (url, image) => {
    if (cache.has(url)) return cache.get(url);
    let result;
    if (new URL(url, location.href).origin === location.origin) {
      result = Promise.resolve(sample(image));
    } else {
      result = new Promise(resolve => {
        const readable = new Image();
        readable.crossOrigin = 'anonymous';
        readable.onload = () => resolve(sample(readable));
        readable.onerror = () => resolve(null);
        readable.src = url;
      });
    }
    cache.set(url, result);
    return result;
  };

  document.querySelectorAll('[data-card-key]').forEach(card => {
    const key = card.dataset.cardKey || card.querySelector('a')?.href || '';
    card.style.setProperty('--card-hue', String(hash(key) % 360));
    const category = card.querySelector('[data-card-category]');
    if (category) category.title = category.textContent.trim();
    const image = card.querySelector('[data-card-image]');
    if (!image) return;
    const unavailable = () => {
      image.hidden = true;
      card.style.setProperty('--post-image', 'none');
      const backdrop = card.querySelector('[data-card-backdrop]');
      if (backdrop) backdrop.hidden = true;
    };
    const loaded = () => {
      if (!image.naturalWidth) { unavailable(); return; }
      card.style.setProperty('--post-image', `url(${JSON.stringify(image.currentSrc || image.src)})`);
      palette(image.currentSrc || image.src, image).then(rgb => {
        if (!rgb) return;
        card.style.setProperty('--post-image-bg', `rgb(${rgb.join(',')})`);
        card.style.setProperty('--post-image-fg', foreground(rgb));
        card.classList.add('is-color-sampled');
      });
    };
    image.addEventListener('load', loaded, { once: true });
    image.addEventListener('error', unavailable, { once: true });
    if (image.complete) loaded();
  });
})();
