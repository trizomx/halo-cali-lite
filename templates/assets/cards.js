/* Stable generated palettes; cover palettes are sampled locally, never proxied. */
(() => {
  const cache = new Map();
  const hash = value => {
    let result = 2166136261;
    for (const character of value) result = Math.imul(result ^ character.codePointAt(0), 16777619);
    return result >>> 0;
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
      canvas.width = 32;
      canvas.height = 18;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context || !image.naturalWidth || !image.naturalHeight) return null;
      const aspect = 240 / 135;
      const width = Math.min(image.naturalWidth, image.naturalHeight * aspect);
      const height = width / aspect;
      context.drawImage(image, (image.naturalWidth - width) / 2, (image.naturalHeight - height) / 2, width, height, 0, 0, 32, 18);
      const pixels = context.getImageData(0, 0, 32, 18).data;
      const buckets = new Map();
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 128) continue;
        const [r, g, b] = pixels.slice(index, index + 3);
        const key = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
        const bucket = buckets.get(key) || [0, 0, 0, 0];
        bucket[0]++; bucket[1] += r; bucket[2] += g; bucket[3] += b;
        buckets.set(key, bucket);
      }
      let winner = null;
      let best = 0;
      for (const bucket of buckets.values()) {
        const rgb = bucket.slice(1).map(total => Math.round(total / bucket[0]));
        const saturation = (Math.max(...rgb) - Math.min(...rgb)) / 255;
        const score = bucket[0] * (1 + saturation * .6);
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
    const category = card.querySelector('.home-post-category');
    if (category) category.title = category.textContent.trim();
    const image = card.querySelector('[data-card-image]');
    if (!image) return;
    const unavailable = () => {
      image.hidden = true;
      const backdrop = card.querySelector('.home-post-backdrop');
      if (backdrop) backdrop.hidden = true;
    };
    const loaded = () => {
      if (!image.naturalWidth) { unavailable(); return; }
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
