/* ============================================================
   Travis Tran — Portfolio
   Scroll progress bar, reveal-on-scroll, PDF first-page thumbnails
   ============================================================ */

// --- Preview-environment nav fix ------------------------------
// On hosts that don't auto-serve folder/index.html (e.g. local file://
// or sandboxed preview environments), rewrite nav links that point at a
// directory to include `index.html` explicitly. GitHub Pages and the
// production domain serve directory requests natively, so this is a no-op
// there and clean URLs stay clean.
(function () {
  const host = location.hostname;
  const isProd =
    host === 'travtran.com' ||
    host === 'www.travtran.com' ||
    host.endsWith('.github.io');
  if (isProd) return;
  document.querySelectorAll('.pill-nav a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    if (href.endsWith('/')) a.setAttribute('href', href + 'index.html');
  });
})();

// --- Open external links / docs in new tab -------------------
// Nav links stay in-page; everything else gets target="_blank".
(function () {
  document.querySelectorAll('a[href]').forEach((a) => {
    if (a.closest('.pill-nav')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
})();

// --- Scroll progress bar --------------------------------------
(function () {
  const fill = document.getElementById('progress-fill');
  if (!fill) return;
  function update() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    fill.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// --- Reveal-on-scroll -----------------------------------------
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
})();

// --- PDF first-page thumbnails --------------------------------
// Renders the first page of each PDF referenced by [data-pdf-thumb]
// into a canvas inside that element. Requires pdf.js (loaded on page).
(function () {
  const thumbs = document.querySelectorAll('[data-pdf-thumb]');
  if (!thumbs.length || typeof pdfjsLib === 'undefined') return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        renderThumb(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '200px 0px' });

  thumbs.forEach((t) => io.observe(t));

  async function renderThumb(el) {
    const url = el.dataset.pdfThumb;
    const loader = el.querySelector('.proj-thumb__loader');
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const targetW = el.clientWidth || 280;
      const scale = (targetW * 2) / baseViewport.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      if (loader) loader.remove();
      el.prepend(canvas);
    } catch (err) {
      if (loader) loader.textContent = 'PDF';
      console.warn('thumb render failed', url, err);
    }
  }
})();
