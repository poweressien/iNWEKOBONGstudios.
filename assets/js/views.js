/* iNWEKOBONGstudios — public pages (rendered client-side). */
(function () {
  'use strict';
  const IW = window.IW;
  const { esc, fmtSize, fmtDate, safeUrl } = IW;

  const BTN = 'inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600';
  const BTN2 = 'inline-block rounded-md border border-grey-300 px-5 py-2.5 text-sm font-semibold text-ink hover:border-brand-500 dark:border-grey-700 dark:text-grey-50';
  const H1 = 'font-display text-3xl font-bold text-ink dark:text-grey-50';
  const H2 = 'font-display text-lg font-bold text-ink dark:text-grey-50';
  const MUTED = 'text-grey-600 dark:text-grey-300';
  const DL_ICON = '<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>';
  const PLAY_ICON = '<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const PAGE_SIZE = 12;



  const href = (it) => `#/${IW.TYPES[it.type].route}/${encodeURIComponent(it.slug)}`;
  const img = (ref) => IW.fileUrl(ref);
  const badge = (it) => (it.status === 'draft'
    ? '<span class="absolute left-2 top-2 rounded bg-grey-900/80 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white">Draft</span>'
    : it._local ? '<span class="absolute left-2 top-2 rounded bg-brand-600/90 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white" title="Saved in this browser — export to publish">Unpublished</span>' : '');
  const lines = (s) => String(s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const csv = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
  const empty = (msg) => `<p class="mt-8 rounded-lg border border-dashed border-grey-300 px-4 py-12 text-center text-sm text-grey-500 dark:border-grey-700">${msg}</p>`;
  const md = (src) => {
    try { return DOMPurify.sanitize(marked.parse(String(src || ''), { breaks: false })); }
    catch (e) { return `<p>${esc(src)}</p>`; }
  };

  /* Where the Download button should point for an item. */
  function dlTarget(it) {
    if (it.file && (it.file.blob || it.file.path)) return { href: img(it.file), download: it.file.name || true, ext: false };
    const u = safeUrl(it.storeUrl);
    if (u) return { href: u, ext: true };
    return null;
  }
  const dlLink = (it, cls, label, inner) => {
    const t = dlTarget(it);
    if (!t) return '';
    const dAttr = t.download ? ` download="${esc(t.download === true ? '' : t.download)}"` : '';
    return `<a href="${esc(t.href)}"${dAttr}${t.ext ? ' target="_blank" rel="noopener"' : ''} aria-label="${esc(label)}" class="${cls}">${inner}</a>`;
  };

  /* ---------- cards ---------- */
  const cardMeta = (it) => {
    const bits = [];
    if (it.version) bits.push('v' + esc(it.version));
    if (it.file && it.file.size) bits.push(fmtSize(it.file.size));
    return bits.length ? bits.join(' <span>&middot;</span> ') : '<span>New</span>';
  };

  const cards = {
    app: (it) => `
<div class="group overflow-hidden rounded-lg border border-grey-100 transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
  <a href="${href(it)}" class="block">
    <div class="relative flex aspect-square items-center justify-center bg-grey-50 dark:bg-grey-900">
      ${it.icon ? `<img src="${esc(img(it.icon))}" alt="${esc(it.name)}" loading="lazy" class="h-full w-full object-cover">` : ''}${badge(it)}
    </div>
    <div class="p-3 pb-0">
      <p class="truncate font-display text-sm font-semibold text-ink dark:text-grey-50">${esc(it.name)}</p>
      <p class="mt-1 truncate text-xs text-grey-500">${esc(it.short)}</p>
    </div>
  </a>
  <div class="flex items-center justify-between p-3 pt-2">
    <div class="flex items-center gap-1 font-mono text-[11px] text-grey-500">${cardMeta(it)}</div>
    ${dlLink(it, 'rounded-full bg-brand-500 p-1.5 text-white hover:bg-brand-600', 'Download ' + it.name, DL_ICON)}
  </div>
</div>`,
    game: (it) => {
      const play = safeUrl(it.playUrl);
      const action = play
        ? `<a href="${esc(play)}" target="_blank" rel="noopener" aria-label="Play ${esc(it.name)}" class="rounded-full bg-brand-500 p-1.5 text-white hover:bg-brand-600">${PLAY_ICON}</a>`
        : dlLink(it, 'rounded-full bg-brand-500 p-1.5 text-white hover:bg-brand-600', 'Download ' + it.name, DL_ICON);
      return `
<div class="group overflow-hidden rounded-lg border border-grey-100 transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
  <a href="${href(it)}" class="block">
    <div class="relative aspect-video bg-grey-50 dark:bg-grey-900">
      ${it.thumbnail ? `<img src="${esc(img(it.thumbnail))}" alt="${esc(it.name)}" loading="lazy" class="h-full w-full object-cover">` : ''}${badge(it)}
    </div>
    <div class="p-3 pb-0">
      <p class="truncate font-display text-sm font-semibold text-ink dark:text-grey-50">${esc(it.name)}</p>
      <p class="mt-1 truncate text-xs text-grey-500">${esc(it.short)}</p>
    </div>
  </a>
  <div class="flex items-center justify-between p-3 pt-2">
    <div class="flex items-center gap-1 font-mono text-[11px] text-grey-500">${cardMeta(it)}</div>
    ${action}
  </div>
</div>`;
    },
    download: (it) => `
<a href="${href(it)}" class="group relative block rounded-lg border border-grey-100 p-3 transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
  <p class="truncate font-display text-sm font-semibold text-ink dark:text-grey-50">${esc(it.name)}</p>
  <p class="mt-1 truncate text-xs text-grey-500">${esc(it.description)}</p>
  <p class="mt-2 font-mono text-[11px] text-brand-600">${esc(fileTypeLabel(it))}${it.file && it.file.size ? ' · ' + fmtSize(it.file.size) : ''}${it._local ? ' · unpublished' : ''}</p>
</a>`,
    tool: (it) => `
<a href="${href(it)}" class="group rounded-lg border border-grey-100 p-5 transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
  <p class="font-display text-sm font-semibold text-ink group-hover:text-brand-600 dark:text-grey-50">${esc(it.name)}</p>
  ${it.description ? `<p class="mt-1 line-clamp-2 text-xs text-grey-500">${esc(it.description)}</p>` : ''}
</a>`,
    project: (it) => `
<a href="${href(it)}" class="group block overflow-hidden rounded-lg border border-grey-100 transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
  <div class="relative aspect-video bg-grey-50 dark:bg-grey-900">
    ${it.image ? `<img src="${esc(img(it.image))}" alt="${esc(it.name)}" loading="lazy" class="h-full w-full object-cover">` : ''}${badge(it)}
  </div>
  <div class="p-3">
    <p class="truncate font-display text-sm font-semibold text-ink dark:text-grey-50">${esc(it.name)}</p>
    <p class="mt-1 line-clamp-2 text-xs text-grey-500">${esc(it.description)}</p>
    <p class="mt-2 font-mono text-[11px] text-brand-600">${esc(projectStatus(it))}</p>
  </div>
</a>`,
    post: (it) => `
<a href="${href(it)}" class="group block overflow-hidden rounded-lg border border-grey-100 transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
  <div class="relative aspect-video bg-grey-50 dark:bg-grey-900">
    ${it.image ? `<img src="${esc(img(it.image))}" alt="${esc(it.name)}" loading="lazy" class="h-full w-full object-cover">` : ''}${badge(it)}
  </div>
  <div class="p-3">
    <p class="truncate font-display text-sm font-semibold text-ink dark:text-grey-50">${esc(it.name)}</p>
    ${it.excerpt ? `<p class="mt-1 line-clamp-2 text-xs text-grey-500">${esc(it.excerpt)}</p>` : ''}
    <p class="mt-2 font-mono text-[11px] text-brand-600">${esc(fmtDate(it.publishedAt || it.createdAt))}</p>
  </div>
</a>`,
  };

  function fileTypeLabel(it) {
    const n = (it.file && it.file.name) || '';
    const m = /\.([A-Za-z0-9]+)$/.exec(n);
    return m ? m[1].toUpperCase() : 'File';
  }
  function projectStatus(it) {
    return ({ completed: 'Completed', in_progress: 'In progress', archived: 'Archived' })[it.projectStatus] || 'In progress';
  }

  const grid = (type, list, cols) => `<div class="mt-8 grid ${cols || 'grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'}">${list.map(cards[type]).join('')}</div>`;
  const gridSmall = (type, list, cols) => `<div class="mt-4 grid ${cols || 'grid-cols-2 gap-4 sm:grid-cols-4'}">${list.map(cards[type]).join('')}</div>`;

  /* ---------- home ---------- */
  function slideImage(it) {
    return (it.screenshots && it.screenshots[0]) || it.thumbnail || it.image || null;
  }
  const hero = () => `
<section class="hero relative overflow-hidden">
  <div class="relative mx-auto flex max-w-5xl justify-center">
    <img src="assets/hero.jpg" alt="iNWEKOBONG Studios" width="896" height="1200" fetchpriority="high" class="hero-img">
    <div class="absolute inset-x-0 bottom-0 px-4 pb-8 text-center sm:pb-14">
      <h1 class="font-display text-xl font-bold text-white sm:text-3xl">Apps, games &amp; tools — built independently.</h1>
      <p class="mx-auto mt-2 hidden max-w-xl text-sm text-grey-300 sm:block">Download the latest releases straight from the studio. No sign-up, no accounts.</p>
      <div class="mt-4 flex flex-wrap justify-center gap-3 sm:mt-6">
        <a href="#/apps" class="${BTN}">Browse apps</a>
        <a href="#/games" class="inline-block rounded-md border border-brand-500/60 px-5 py-2.5 text-sm font-semibold text-white hover:border-brand-400 hover:bg-brand-500/10">Browse games</a>
      </div>
    </div>
  </div>
</section>`;

  function slider(items) {
    const slides = items.filter((i) => ['app', 'game', 'project'].includes(i.type) && i.featured).slice(0, 5);
    if (!slides.length) return hero();
    const label = { app: 'App', game: 'Game', project: 'Project' };
    return hero() + `
<section class="relative overflow-hidden border-y border-brand-500/20 bg-grey-900" data-slider aria-roledescription="carousel" aria-label="Featured">
  <div class="relative h-[420px] sm:h-[480px]">
    ${slides.map((it, i) => {
      const im = slideImage(it);
      const text = it.short || it.description || '';
      return `<div class="absolute inset-0 transition-opacity duration-700 ${i === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}" data-slide aria-hidden="${i === 0 ? 'false' : 'true'}">
        ${im ? `<img src="${esc(img(im))}" alt="" class="h-full w-full object-cover opacity-60">` : '<div class="h-full w-full bg-linear-to-br from-brand-700 to-grey-900"></div>'}
        <div class="absolute inset-0 flex items-center">
          <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p class="font-mono text-xs uppercase tracking-widest text-brand-400">${label[it.type]}</p>
            <h2 class="mt-2 max-w-xl font-display text-3xl font-bold text-white sm:text-4xl">${esc(it.name)}</h2>
            ${text ? `<p class="mt-2 max-w-lg text-grey-100">${esc(text.slice(0, 160))}</p>` : ''}
            <a href="${href(it)}" class="${BTN} mt-5">Learn more</a>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>
  ${slides.length > 1 ? `
  <button type="button" data-slider-prev aria-label="Previous slide" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-paper-dark/60 p-2 text-white hover:bg-paper-dark/90"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
  <button type="button" data-slider-next aria-label="Next slide" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-paper-dark/60 p-2 text-white hover:bg-paper-dark/90"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
  <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
    ${slides.map((_, i) => `<button type="button" aria-label="Go to slide ${i + 1}" data-slider-dot class="h-2 w-2 rounded-full ${i === 0 ? 'bg-brand-500' : 'bg-white/40'}"></button>`).join('')}
  </div>` : ''}
</section>`;
  }

  function initSlider(root) {
    const el = root.querySelector('[data-slider]');
    if (!el) return null;
    const slides = [...el.querySelectorAll('[data-slide]')], dots = [...el.querySelectorAll('[data-slider-dot]')];
    if (slides.length < 2) return null;
    let cur = 0, timer = null;
    const show = (i) => {
      slides[cur].classList.add('opacity-0', 'pointer-events-none'); slides[cur].classList.remove('opacity-100'); slides[cur].setAttribute('aria-hidden', 'true');
      if (dots[cur]) { dots[cur].classList.remove('bg-brand-500'); dots[cur].classList.add('bg-white/40'); }
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.remove('opacity-0', 'pointer-events-none'); slides[cur].classList.add('opacity-100'); slides[cur].setAttribute('aria-hidden', 'false');
      if (dots[cur]) { dots[cur].classList.remove('bg-white/40'); dots[cur].classList.add('bg-brand-500'); }
    };
    const stop = () => clearInterval(timer);
    const start = () => { stop(); timer = setInterval(() => show(cur + 1), 6000); };
    const n = el.querySelector('[data-slider-next]'), p = el.querySelector('[data-slider-prev]');
    if (n) n.addEventListener('click', () => { show(cur + 1); start(); });
    if (p) p.addEventListener('click', () => { show(cur - 1); start(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
    el.addEventListener('mouseenter', stop); el.addEventListener('mouseleave', start);
    let x0 = 0;
    el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    el.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) show(cur + (d < 0 ? 1 : -1)); start(); }, { passive: true });
    start();
    return stop;
  }

  const section = (heading, url, type, list) => `
<section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
  <div class="flex items-center justify-between">
    <h2 class="font-display text-2xl font-bold text-ink dark:text-grey-50">${heading}</h2>
    <a href="${url}" class="text-sm font-medium text-brand-600 hover:text-brand-700">View all</a>
  </div>
  ${list.length
    ? `<div class="mt-6 grid ${type === 'post' ? 'grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'}">${list.map(cards[type]).join('')}</div>`
    : '<p class="mt-6 rounded-lg border border-dashed border-grey-300 px-4 py-8 text-center text-sm text-grey-500 dark:border-grey-700">Nothing published here yet — check back soon.</p>'}
</section>`;

  const CAT_ICONS = {
    apps: '<rect x="7" y="2" width="10" height="20" rx="2"/><path stroke-linecap="round" d="M11 18h2"/>',
    games: '<rect x="2" y="7" width="20" height="10" rx="4"/><path stroke-linecap="round" d="M7 10v4M5 12h4M15.5 11h.01M18 13h.01"/>',
    downloads: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"/>',
    tools: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L21 6l-3-3-3.3 3.3z"/>',
    projects: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
    blog: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 4h9l3 3v13H6z"/><path stroke-linecap="round" d="M9 10h6M9 14h6M9 18h3"/>',
  };
  const explore = () => `
<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
  <h2 class="font-display text-2xl font-bold text-ink dark:text-grey-50">Explore</h2>
  <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    ${IW.TYPE_LIST.map((t) => `
    <a href="#/${t.route}" class="group rounded-lg border border-grey-100 p-5 text-center transition hover:border-brand-500 hover:shadow-sm dark:border-grey-900">
      <svg class="mx-auto h-6 w-6 text-grey-700 group-hover:text-brand-600 dark:text-grey-300" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${CAT_ICONS[t.route]}</svg>
      <p class="mt-3 font-display text-sm font-semibold text-ink group-hover:text-brand-600 dark:text-grey-50">${t.label}</p>
      <p class="mt-1 font-mono text-[11px] text-grey-500">${IW.visible(t.key).length}</p>
    </a>`).join('')}
  </div>
</section>`;

  function home() {
    const vis = IW.visible();
    const apps = IW.visible('app'), games = IW.visible('game');
    const pick = (list) => { const f = list.filter((i) => i.featured); return (f.length ? f : list).slice(0, 8); };
    return {
      title: 'iNWEKOBONGstudios',
      html: slider(vis) + explore()
        + section('Popular Apps', '#/apps', 'app', pick(apps))
        + section('Popular Games', '#/games', 'game', pick(games))
        + section('Latest Downloads', '#/downloads', 'download', IW.visible('download').slice(0, 8))
        + section('Latest from the Blog', '#/blog', 'post', IW.visible('post').slice(0, 4)),
      after: (root) => initSlider(root),
    };
  }

  /* ---------- list pages ---------- */
  function list(type, params) {
    const t = IW.TYPES[type];
    let items = IW.visible(type);
    const cats = [...new Set(items.map((i) => (i.category || '').trim()).filter(Boolean))].sort();
    const cat = params.get('category') || '';
    if (cat) items = items.filter((i) => (i.category || '').trim() === cat);
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.min(Math.max(parseInt(params.get('page') || '1', 10) || 1, 1), pages);
    const slice = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const q = (p, c) => `#/${t.route}?${new URLSearchParams({ ...(c ? { category: c } : {}), ...(p > 1 ? { page: p } : {}) }).toString()}`.replace(/\?$/, '');
    const chip = (label, c) => `<a href="${q(1, c)}" class="rounded-full px-3 py-1.5 text-xs font-medium ${cat === c ? 'bg-brand-500 text-white' : 'bg-grey-50 text-grey-700 hover:bg-grey-100 dark:bg-grey-900 dark:hover:bg-grey-700 dark:text-grey-300'}">${esc(label)}</a>`;
    const cols = type === 'post' || type === 'project' ? 'grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : type === 'download' || type === 'tool' ? 'grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : '';
    const none = { app: 'No apps published yet — check back soon.', game: 'No games published yet — check back soon.', download: 'No downloads yet — check back soon.', tool: 'No tools yet — check back soon.', project: 'No projects yet — check back soon.', post: 'No posts published yet — check back soon.' }[type];
    return {
      title: t.label,
      html: `<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
  <h1 class="${H1}">${t.label}</h1>
  ${cats.length ? `<div class="mt-5 flex flex-wrap gap-2">${chip('All', '')}${cats.map((c) => chip(c, c)).join('')}</div>` : ''}
  ${slice.length ? grid(type, slice, cols) : empty(none)}
  ${pages > 1 ? `<nav class="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
    ${page > 1 ? `<a href="${q(page - 1, cat)}" class="rounded-md border border-grey-300 px-3 py-1.5 text-sm text-ink hover:border-brand-500 dark:border-grey-700 dark:text-grey-50">Previous</a>` : ''}
    <span class="font-mono text-xs text-grey-500">Page ${page} of ${pages}</span>
    ${page < pages ? `<a href="${q(page + 1, cat)}" class="rounded-md border border-grey-300 px-3 py-1.5 text-sm text-ink hover:border-brand-500 dark:border-grey-700 dark:text-grey-50">Next</a>` : ''}
  </nav>` : ''}
</div>`,
    };
  }

  /* ---------- detail pages ---------- */
  const shots = (it) => (it.screenshots && it.screenshots.length
    ? `<div class="mt-8 flex gap-4 overflow-x-auto">${it.screenshots.map((s) => `<img src="${esc(img(s))}" alt="" loading="lazy" class="h-56 rounded-lg border border-grey-100 object-cover dark:border-grey-900">`).join('')}</div>` : '');
  const related = (it, type, label) => {
    const r = IW.visible(type).filter((x) => x.id !== it.id && (it.category ? x.category === it.category : true)).slice(0, 4);
    return r.length ? `<div class="mt-12"><h2 class="${H2}">${label}</h2>${gridSmall(type, r, type === 'post' ? 'grid-cols-1 gap-4 sm:grid-cols-3' : '')}</div>` : '';
  };
  const features = (it) => (it.features && lines(it.features).length
    ? `<h2 class="mt-8 ${H2}">Features</h2><ul class="mt-3 list-inside list-disc space-y-1 ${MUTED}">${lines(it.features).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '');
  const changelog = (it) => (it.changelog ? `<h2 class="mt-8 ${H2}">What's new</h2><p class="mt-3 whitespace-pre-line ${MUTED}">${esc(it.changelog)}</p>` : '');
  const draftNote = (it) => (it.status === 'draft'
    ? '<p class="mb-6 rounded-md border border-grey-300 bg-grey-50 px-4 py-2 text-sm text-grey-700 dark:border-grey-700 dark:bg-grey-900 dark:text-grey-300">Draft — only visible in this browser. It is left out of exports until you publish it.</p>'
    : it._local ? '<p class="mb-6 rounded-md border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm text-brand-700 dark:text-brand-400">Saved in this browser only. Use Export in the upload page to put it on the live site.</p>' : '');
  const editLink = (it) => (it._local ? `<a href="#/upload/edit/${esc(it.id)}" class="font-mono text-xs text-grey-500 underline hover:text-brand-600">Edit</a>` : '');
  const metaRow = (bits) => `<div class="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-grey-500">${bits.filter(Boolean).join('')}</div>`;
  const sp = (s) => `<span>${s}</span>`;
  const fileBits = (it) => (it.file && it.file.size ? sp(esc(fileTypeLabel(it)) + ' · ' + fmtSize(it.file.size)) : '');

  function appDetail(it) {
    const dl = dlLink(it, BTN + ' mt-5', 'Download ' + it.name, 'Download' + (it.file && it.file.size ? ` (${fmtSize(it.file.size)})` : ''));
    return {
      title: it.name, desc: it.short, image: it.icon && img(it.icon),
      html: `<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">${draftNote(it)}
  <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
    ${it.icon ? `<img src="${esc(img(it.icon))}" alt="${esc(it.name)}" class="h-24 w-24 rounded-2xl border border-grey-100 object-cover dark:border-grey-900">` : '<div class="h-24 w-24 rounded-2xl bg-grey-50 dark:bg-grey-900"></div>'}
    <div class="flex-1">
      <h1 class="${H1}">${esc(it.name)}</h1>
      <p class="mt-1 text-grey-500">${esc(it.short)}</p>
      ${metaRow([it.version && sp('v' + esc(it.version)), it.category && sp(esc(it.category)), sp('Updated ' + fmtDate(it.updatedAt)), editLink(it)])}
      ${dl || '<p class="mt-5 text-sm text-grey-500">No download available yet.</p>'}
    </div>
  </div>
  ${shots(it)}
  <div class="mt-10 grid gap-8 sm:grid-cols-3">
    <div class="sm:col-span-2">
      <h2 class="${H2}">About</h2>
      <p class="mt-3 whitespace-pre-line ${MUTED}">${esc(it.description || it.short)}</p>
      ${features(it)}${changelog(it)}
    </div>
    <div>
      <h2 class="${H2}">Details</h2>
      <dl class="mt-3 space-y-2 text-sm">
        ${it.requirements ? `<div><dt class="text-grey-500">Requirements</dt><dd class="text-ink dark:text-grey-50">${esc(it.requirements)}</dd></div>` : ''}
        <div><dt class="text-grey-500">Released</dt><dd class="text-ink dark:text-grey-50">${esc(fmtDate(it.releaseDate) || '—')}</dd></div>
        ${it.file ? `<div><dt class="text-grey-500">File</dt><dd class="break-all text-ink dark:text-grey-50">${esc(it.file.name)}</dd></div>` : ''}
        ${safeUrl(it.storeUrl) ? `<div><a href="${esc(safeUrl(it.storeUrl))}" target="_blank" rel="noopener" class="text-brand-600 underline">${it.file ? 'Also available here' : 'View on store'}</a></div>` : ''}
      </dl>
    </div>
  </div>
  ${related(it, 'app', 'Related apps')}
</div>`,
    };
  }

  function gameDetail(it) {
    const play = safeUrl(it.playUrl);
    return {
      title: it.name, desc: it.short, image: it.thumbnail && img(it.thumbnail),
      html: `<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">${draftNote(it)}
  ${it.thumbnail ? `<div class="overflow-hidden rounded-xl border border-grey-100 dark:border-grey-900"><img src="${esc(img(it.thumbnail))}" alt="${esc(it.name)}" class="aspect-video w-full object-cover"></div>` : ''}
  <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 class="${H1}">${esc(it.name)}</h1>
      <p class="mt-1 text-grey-500">${esc(it.short)}</p>
      ${metaRow([it.category && sp(esc(it.category)), it.version && sp('v' + esc(it.version)), sp('Updated ' + fmtDate(it.updatedAt)), editLink(it)])}
    </div>
    <div class="flex shrink-0 gap-2">
      ${play ? `<a href="${esc(play)}" target="_blank" rel="noopener" class="${BTN}">Play Now</a>` : ''}
      ${dlLink(it, play ? BTN2 : BTN, 'Download ' + it.name, 'Download' + (it.file && it.file.size ? ` (${fmtSize(it.file.size)})` : ''))}
    </div>
  </div>
  ${shots(it)}
  <div class="mt-10 grid gap-8 sm:grid-cols-3">
    <div class="sm:col-span-2">
      <h2 class="${H2}">About</h2>
      <p class="mt-3 whitespace-pre-line ${MUTED}">${esc(it.description || it.short)}</p>
      ${features(it)}${changelog(it)}
    </div>
    <div>
      <h2 class="${H2}">Details</h2>
      <dl class="mt-3 space-y-2 text-sm">
        ${it.controls ? `<div><dt class="text-grey-500">Controls</dt><dd class="text-ink dark:text-grey-50">${esc(it.controls)}</dd></div>` : ''}
        <div><dt class="text-grey-500">Released</dt><dd class="text-ink dark:text-grey-50">${esc(fmtDate(it.releaseDate) || '—')}</dd></div>
        ${safeUrl(it.storeUrl) ? `<div><a href="${esc(safeUrl(it.storeUrl))}" target="_blank" rel="noopener" class="text-brand-600 underline">${it.file ? 'Also available here' : 'View on store'}</a></div>` : ''}
      </dl>
    </div>
  </div>
  ${related(it, 'game', 'Related games')}
</div>`,
    };
  }

  function downloadDetail(it) {
    return {
      title: it.name, desc: it.description,
      html: `<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">${draftNote(it)}
  <h1 class="${H1}">${esc(it.name)}</h1>
  ${metaRow([sp(esc(fileTypeLabel(it))), it.file && it.file.size && sp(fmtSize(it.file.size)), it.version && sp('v' + esc(it.version)), editLink(it)])}
  ${it.description ? `<p class="mt-4 whitespace-pre-line ${MUTED}">${esc(it.description)}</p>` : ''}
  ${dlLink(it, BTN + ' mt-6', 'Download', 'Download ' + esc(fileTypeLabel(it))) || '<p class="mt-6 text-sm text-grey-500">No file attached.</p>'}
</div>`,
    };
  }

  function toolDetail(it) {
    const u = safeUrl(it.url);
    return {
      title: it.name, desc: it.description,
      html: `<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">${draftNote(it)}
  <div class="flex items-start gap-4">
    ${it.icon ? `<img src="${esc(img(it.icon))}" alt="" class="h-16 w-16 rounded-xl border border-grey-100 object-cover dark:border-grey-900">` : ''}
    <div>
      <h1 class="${H1}">${esc(it.name)}</h1>
      ${metaRow([it.category && sp(esc(it.category)), editLink(it)])}
    </div>
  </div>
  ${it.description ? `<p class="mt-4 whitespace-pre-line ${MUTED}">${esc(it.description)}</p>` : ''}
  ${u ? `<a href="${esc(u)}" target="_blank" rel="noopener" class="${BTN} mt-6">Open tool</a>` : '<p class="mt-6 rounded-md border border-grey-100 bg-grey-50 px-4 py-3 text-sm text-grey-500 dark:border-grey-900 dark:bg-grey-900/40">This tool doesn\'t have a link yet.</p>'}
</div>`,
    };
  }

  function projectDetail(it) {
    const tech = csv(it.tech);
    return {
      title: it.name, desc: it.description, image: it.image && img(it.image),
      html: `<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">${draftNote(it)}
  ${it.image ? `<div class="overflow-hidden rounded-xl border border-grey-100 dark:border-grey-900"><img src="${esc(img(it.image))}" alt="${esc(it.name)}" class="aspect-video w-full object-cover"></div>` : ''}
  <h1 class="mt-6 ${H1}">${esc(it.name)}</h1>
  ${metaRow([sp(esc(projectStatus(it))), it.date && sp(esc(fmtDate(it.date))), editLink(it)])}
  ${tech.length ? `<div class="mt-3 flex flex-wrap gap-2">${tech.map((x) => `<span class="rounded-full bg-grey-50 px-2.5 py-1 text-xs text-grey-700 dark:bg-grey-900 dark:text-grey-300">${esc(x)}</span>`).join('')}</div>` : ''}
  <p class="mt-6 whitespace-pre-line ${MUTED}">${esc(it.description)}</p>
  <div class="mt-6 flex gap-3">
    ${safeUrl(it.demoUrl) ? `<a href="${esc(safeUrl(it.demoUrl))}" target="_blank" rel="noopener" class="${BTN}">View demo</a>` : ''}
    ${safeUrl(it.githubUrl) ? `<a href="${esc(safeUrl(it.githubUrl))}" target="_blank" rel="noopener" class="${BTN2}">Source</a>` : ''}
  </div>
  ${shots(it)}
</div>`,
    };
  }

  function postDetail(it) {
    const tags = csv(it.tags);
    return {
      title: it.name, desc: it.excerpt, image: it.image && img(it.image),
      html: `<article class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">${draftNote(it)}
  ${it.image ? `<img src="${esc(img(it.image))}" alt="${esc(it.name)}" class="aspect-video w-full rounded-xl border border-grey-100 object-cover dark:border-grey-900">` : ''}
  <h1 class="mt-6 ${H1}">${esc(it.name)}</h1>
  ${metaRow([sp(esc(fmtDate(it.publishedAt || it.createdAt))), it.category && sp(esc(it.category)), editLink(it)])}
  <div class="md mt-6 max-w-none ${MUTED}">${md(it.content)}</div>
  ${tags.length ? `<div class="mt-6 flex flex-wrap gap-2">${tags.map((x) => `<span class="rounded-full bg-grey-50 px-2.5 py-1 text-xs text-grey-700 dark:bg-grey-900 dark:text-grey-300">#${esc(x)}</span>`).join('')}</div>` : ''}
  ${related(it, 'post', 'Related posts')}
</article>`,
    };
  }

  const detailFns = { app: appDetail, game: gameDetail, download: downloadDetail, tool: toolDetail, project: projectDetail, post: postDetail };
  function detail(type, slug) {
    const it = IW.find(type, slug);
    if (!it) return notFound();
    return detailFns[type](it);
  }

  /* ---------- search ---------- */
  function search(params) {
    const q = (params.get('q') || '').trim();
    const active = IW.TYPES[Object.keys(IW.TYPES).find((k) => IW.TYPES[k].route === params.get('category'))] || null;
    const hay = (i) => [i.name, i.short, i.description, i.excerpt, i.content, i.category, i.tags, i.tech, i.features].join(' ').toLowerCase();
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = terms.length ? IW.visible().filter((i) => { const h = hay(i); return terms.every((t) => h.includes(t)); }) : [];
    const counts = Object.fromEntries(IW.TYPE_LIST.map((t) => [t.key, hits.filter((h) => h.type === t.key).length]));
    const chip = (label, route, n, on) => `<a href="#/search?q=${encodeURIComponent(q)}${route ? '&category=' + route : ''}" class="rounded-full px-3 py-1.5 text-xs font-medium ${on ? 'bg-brand-500 text-white' : 'bg-grey-50 text-grey-700 hover:bg-grey-100 dark:bg-grey-900 dark:hover:bg-grey-700 dark:text-grey-300'}">${label} (${n})</a>`;
    const groups = IW.TYPE_LIST.filter((t) => (!active || active.key === t.key) && counts[t.key]).map((t) => {
      const items = hits.filter((h) => h.type === t.key);
      return `<div class="mt-10"><div class="flex items-center justify-between"><h2 class="${H2}">${t.label}</h2>${!active && items.length > 4 ? `<a href="#/search?q=${encodeURIComponent(q)}&category=${t.route}" class="text-sm font-medium text-brand-600 hover:text-brand-700">See all ${items.length}</a>` : ''}</div>${gridSmall(t.key, active ? items : items.slice(0, 4), 'grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4')}</div>`;
    }).join('');
    return {
      title: q ? 'Search: ' + q : 'Search',
      html: `<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
  <h1 class="${H1}">Search</h1>
  <form id="search-form" class="mt-6 flex max-w-xl gap-2">
    <input type="text" name="q" value="${esc(q)}" placeholder="Search apps, games, downloads, tools, projects, blog…" autofocus
      class="w-full rounded-md border border-grey-300 bg-paper px-3 py-2 text-sm text-ink placeholder:text-grey-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-grey-700 dark:bg-paper-dark dark:text-grey-50">
    <button type="submit" class="shrink-0 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Search</button>
  </form>
  ${q ? `<div class="mt-6 flex flex-wrap gap-2">${chip('All', '', hits.length, !active)}${IW.TYPE_LIST.map((t) => chip(t.label, t.route, counts[t.key], active && active.key === t.key)).join('')}</div>` : ''}
  ${!q ? '<p class="mt-10 text-sm text-grey-500">Type something above to search across Apps, Games, Downloads, Tools, Projects, and the Blog.</p>'
      : !hits.length ? `<p class="mt-10 rounded-lg border border-dashed border-grey-300 px-4 py-12 text-center text-sm text-grey-500 dark:border-grey-700">No results for &ldquo;${esc(q)}&rdquo;.</p>` : groups}
</div>`,
      after: (root) => {
        const f = root.querySelector('#search-form');
        f.addEventListener('submit', (e) => { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent(f.q.value.trim()) + (active ? '&category=' + active.route : ''); });
      },
    };
  }

  /* ---------- static pages ---------- */
  const prose = (title, inner) => `<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"><h1 class="${H1}">${title}</h1><div class="md mt-6 ${MUTED}">${inner}</div></div>`;
  function about() {
    return { title: 'About', html: prose('About iNWEKOBONGstudios', md(IW.settings.about)) };
  }
  function contact() {
    const s = IW.settings, mail = esc(s.email), wa = String(s.whatsapp || '').replace(/\D/g, '');
    const gh = safeUrl(s.github);
    return {
      title: 'Contact',
      html: prose('Contact', `<p>Questions, bug reports, or business enquiries — reach out:</p>
<ul>
  ${s.email ? `<li>Email: <a href="mailto:${mail}" class="text-brand-600 underline">${mail}</a></li>` : ''}
  ${wa ? `<li>WhatsApp: <a href="https://wa.me/${wa}" target="_blank" rel="noopener" class="text-brand-600 underline">+${wa}</a></li>` : ''}
  ${gh ? `<li>GitHub: <a href="${esc(gh)}" target="_blank" rel="noopener" class="text-brand-600 underline">${esc(gh.replace(/^https?:\/\//, ''))}</a></li>` : ''}
</ul>`),
    };
  }
  function legal(kind) {
    const mail = IW.settings.email ? `<a href="mailto:${esc(IW.settings.email)}" class="text-brand-600 underline">${esc(IW.settings.email)}</a>` : 'the contact page';
    const bodies = {
      privacy: ['Privacy Policy', `<p>This site has no accounts, no sign-up, and no server-side database. We don't collect personal information through the site itself.</p>
<p>Your browser may load fonts from Google Fonts, which can receive your IP address. Files you download come straight from this site's host, which may keep ordinary access logs.</p>
<p>Questions? Contact ${mail}.</p>
<p class="text-sm text-grey-500">This is a plain-language starting template, not legal advice — review it before relying on it.</p>`],
      terms: ['Terms of Use', `<p>Apps, games and files on this site are provided "as is", without warranty of any kind. You use them at your own risk. Always download from the official links on this site.</p>
<p>All content remains the property of iNWEKOBONGstudios unless stated otherwise. Don't redistribute or resell it without permission.</p>
<p>Questions? Contact ${mail}.</p>
<p class="text-sm text-grey-500">This is a plain-language starting template, not legal advice — review it before relying on it.</p>`],
      dmca: ['DMCA', `<p>If you believe content on this site infringes your copyright, email ${mail} with a description of the work, the URL where it appears, and your contact details. We'll review it and remove content that infringes.</p>
<p class="text-sm text-grey-500">This is a plain-language starting template, not legal advice — review it before relying on it.</p>`],
    };
    const [title, inner] = bodies[kind];
    return { title, html: prose(title, inner) };
  }

  function notFound() {
    return {
      title: 'Not found',
      html: `<div class="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8"><p class="font-mono text-xs uppercase tracking-widest text-brand-600">404</p><h1 class="mt-3 ${H1}">Page not found</h1><p class="mt-4 text-grey-500">That page doesn't exist (or hasn't been published yet).</p><a href="#/" class="${BTN} mt-6">Back home</a></div>`,
    };
  }

  IW.views = { home, list, detail, search, about, contact, legal, notFound, cards };
})();
