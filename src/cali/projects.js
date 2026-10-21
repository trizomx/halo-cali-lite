/* ProjectCard.tsx pointer mask: same centre/radius and 40% solid falloff. */
(() => {
  document.querySelectorAll('[data-project]').forEach(card => {
    const host = card.querySelector('.source-project-host');
    if (host) { try { host.textContent = new URL(host.textContent).host; } catch (_) {} }
    let queued = false, x = 0, y = 0;
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      x = event.clientX - rect.left; y = event.clientY - rect.top;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        card.style.setProperty('--project-mask', `radial-gradient(circle ${Math.hypot(rect.width, rect.height) / 2}px at ${x}px ${y}px, black 40%, transparent)`);
      });
    });
    card.querySelector('img')?.addEventListener('error', event => { event.target.hidden = true; });
  });
  // Defensive fallback for missing action: never POST personal data to this page.
  document.querySelectorAll('form[data-newsletter-ready="false"]').forEach(form => form.addEventListener('submit', event => event.preventDefault()));
})();
