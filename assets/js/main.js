/* iNWEKOBONGstudios — router + shell behaviour. */
(function () {
  'use strict';
  const IW = window.IW;
  const app = document.getElementById('app');
  let cleanup = null;
  const SUFFIX = ' · iNWEKOBONGstudios';

  function resolve(parts, params) {
    const [a, b, c] = parts;
    const V = IW.views, M = IW.manage;
    if (!a) return V.home();
    if (a === 'upload') {
      if (b === 'new') return M.editor(null, c);
      if (b === 'edit' && c) return M.editor(c);
      if (b === 'settings') return M.settingsPage();
      return M.manager();
    }
    if (IW.BY_ROUTE[a]) return b ? V.detail(IW.BY_ROUTE[a].key, b) : V.list(IW.BY_ROUTE[a].key, params);
    if (a === 'search') return V.search(params);
    if (a === 'about') return V.about();
    if (a === 'contact') return V.contact();
    if (a === 'privacy-policy') return V.legal('privacy');
    if (a === 'terms') return V.legal('terms');
    if (a === 'dmca') return V.legal('dmca');
    return V.notFound();
  }

  function setMeta(page) {
    document.title = page.title === 'iNWEKOBONGstudios' ? page.title : (page.title || '') + SUFFIX;
    const desc = page.desc || 'Apps, games, tools, and downloads from iNWEKOBONGstudios.';
    const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', page.title || 'iNWEKOBONGstudios');
    set('meta[property="og:description"]', 'content', desc);
  }

  function render() {
    if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { /* ignore */ } }
    cleanup = null;
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map((s) => { try { return decodeURIComponent(s); } catch (e) { return s; } });
    let page;
    try { page = resolve(parts, new URLSearchParams(query)); }
    catch (e) { console.error(e); page = { title: 'Error', html: '<div class="mx-auto max-w-3xl px-4 py-24 text-center"><h1 class="font-display text-2xl font-bold">Something went wrong</h1><p class="mt-3 text-grey-500">' + IW.esc(e && e.message) + '</p></div>' }; }
    app.innerHTML = page.html;
    setMeta(page);
    if (page.after) { try { cleanup = page.after(app); } catch (e) { console.error(e); } }
    window.scrollTo(0, 0);
    document.getElementById('mobile-menu').classList.add('hidden');
    document.getElementById('mobile-menu-button').setAttribute('aria-expanded', 'false');
  }
  IW.rerender = render;

  function shell() {
    const mb = document.getElementById('mobile-menu-button'), menu = document.getElementById('mobile-menu');
    mb.addEventListener('click', () => { const open = !menu.classList.contains('hidden'); menu.classList.toggle('hidden'); mb.setAttribute('aria-expanded', String(!open)); });
    document.getElementById('year').textContent = new Date().getFullYear();
  }

  function footerText() { const el = document.getElementById('footer-tagline'); if (el) el.textContent = IW.settings.tagline || ''; }

  async function boot() {
    shell();
    try { await IW.load(); } catch (e) { console.error(e); }
    footerText();
    window.addEventListener('hashchange', render);
    render();
  }
  boot();
})();
