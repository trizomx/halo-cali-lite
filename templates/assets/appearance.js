/* Read validated presentation settings before first paint, without inline code. */
(() => {
  const settings = document.currentScript?.dataset;
  if (!settings) return;
  const root = document.documentElement;
  for (const [key, property] of Object.entries({
    lightBackground: '--custom-light-background', darkBackground: '--custom-dark-background',
    lightAccent: '--custom-light-accent', darkAccent: '--custom-dark-accent'
  })) {
    const value = settings[key];
    if (/^#[\da-f]{6}$/i.test(value || '')) root.style.setProperty(property, value);
  }
  const size = Number(settings.navSize), height = Number(settings.indicatorHeight);
  if (Number.isFinite(size) && size >= 12 && size <= 18) root.style.setProperty('--nav-font-size', `${size}px`);
  if (Number.isFinite(height) && height >= 1 && height <= 3) root.style.setProperty('--indicator-height', `${height}px`);
  if (settings.grid === 'false') root.dataset.grid = 'off';
})();
