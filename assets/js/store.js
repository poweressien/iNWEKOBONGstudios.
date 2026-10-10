/* iNWEKOBONGstudios — data layer.
 * Published content lives in data/site.js (window.SITE_DATA).
 * Anything you add/edit/delete in the browser is stored in IndexedDB on top of it,
 * and "Export" bakes both into a new static site bundle. No server involved. */
(function () {
  'use strict';
  const IW = (window.IW = window.IW || {});

  /* ---------- small helpers ---------- */
  IW.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  IW.safeUrl = (u) => { u = String(u || '').trim(); return /^(https?:\/\/|mailto:|tel:)/i.test(u) ? u : ''; };
  IW.slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'item';
  IW.safeName = (s) => String(s || 'file').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^\.+/, '').slice(0, 120) || 'file';
  IW.fmtSize = (n) => {
    let size = Number(n) || 0;
    for (const u of ['B', 'KB', 'MB', 'GB']) {
      if (size < 1024) return u === 'B' ? `${Math.round(size)} B` : `${size.toFixed(1)} ${u}`;
      size /= 1024;
    }
    return `${size.toFixed(1)} TB`;
  };
  IW.fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  IW.uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  /* ---------- content types & form schema ---------- */
  const FILE_KINDS = '.apk,.aab,.ipa,.exe,.msi,.dmg,.zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.mp3,.mp4,.png,.jpg,.jpeg,.webp,.svg';
  const IMG = 'image/*';
  const commonTop = [{ k: 'name', l: 'Name', t: 'text', req: 1 }];
  IW.TYPES = {
    app: {
      key: 'app', route: 'apps', label: 'Apps', single: 'App',
      fields: [
        ...commonTop,
        { k: 'short', l: 'Short description', t: 'text', max: 255, ph: 'One line shown on cards' },
        { k: 'icon', l: 'Icon', t: 'file', accept: IMG, img: 1 },
        { k: 'file', l: 'App file (APK, ZIP, EXE…)', t: 'file', accept: FILE_KINDS, big: 1 },
        { k: 'storeUrl', l: 'External download / store link (optional)', t: 'url', ph: 'https://play.google.com/…  or a GitHub Releases / Drive link' },
        { k: 'version', l: 'Version', t: 'text', ph: '1.0.0' },
        { k: 'category', l: 'Category', t: 'text', ph: 'e.g. Productivity' },
        { k: 'description', l: 'Full description', t: 'textarea', rows: 5 },
        { k: 'features', l: 'Features (one per line)', t: 'textarea', rows: 4 },
        { k: 'changelog', l: "What's new", t: 'textarea', rows: 3 },
        { k: 'requirements', l: 'Requirements', t: 'text', ph: 'Android 8.0+' },
        { k: 'releaseDate', l: 'Release date', t: 'date' },
        { k: 'screenshots', l: 'Screenshots', t: 'files', accept: IMG, img: 1 },
      ],
    },
    game: {
      key: 'game', route: 'games', label: 'Games', single: 'Game',
      fields: [
        ...commonTop,
        { k: 'short', l: 'Short description', t: 'text', max: 255, ph: 'One line shown on cards' },
        { k: 'thumbnail', l: 'Thumbnail (16:9 works best)', t: 'file', accept: IMG, img: 1 },
        { k: 'playUrl', l: 'Play-in-browser URL (optional)', t: 'url', ph: 'https://…' },
        { k: 'file', l: 'Game file (APK, ZIP, EXE…)', t: 'file', accept: FILE_KINDS, big: 1 },
        { k: 'storeUrl', l: 'External download / store link (optional)', t: 'url', ph: 'https://…' },
        { k: 'version', l: 'Version', t: 'text', ph: '1.0.0' },
        { k: 'category', l: 'Category', t: 'text', ph: 'e.g. Racing' },
        { k: 'description', l: 'Full description', t: 'textarea', rows: 5 },
        { k: 'features', l: 'Features (one per line)', t: 'textarea', rows: 4 },
        { k: 'controls', l: 'Controls', t: 'text' },
        { k: 'changelog', l: "What's new", t: 'textarea', rows: 3 },
        { k: 'releaseDate', l: 'Release date', t: 'date' },
        { k: 'screenshots', l: 'Screenshots', t: 'files', accept: IMG, img: 1 },
      ],
    },
    download: {
      key: 'download', route: 'downloads', label: 'Downloads', single: 'Download',
      fields: [
        ...commonTop,
        { k: 'file', l: 'File', t: 'file', accept: FILE_KINDS, big: 1, req: 1 },
        { k: 'description', l: 'Description', t: 'textarea', rows: 3 },
        { k: 'version', l: 'Version', t: 'text' },
        { k: 'category', l: 'Category', t: 'text', ph: 'e.g. Resources' },
      ],
    },
    tool: {
      key: 'tool', route: 'tools', label: 'Tools', single: 'Tool',
      fields: [
        ...commonTop,
        { k: 'icon', l: 'Icon (optional)', t: 'file', accept: IMG, img: 1 },
        { k: 'description', l: 'Description', t: 'textarea', rows: 4 },
        { k: 'url', l: 'Link to the tool', t: 'url', ph: 'https://… (opens in a new tab)' },
        { k: 'category', l: 'Category', t: 'text' },
      ],
    },
    project: {
      key: 'project', route: 'projects', label: 'Projects', single: 'Project',
      fields: [
        ...commonTop,
        { k: 'image', l: 'Cover image', t: 'file', accept: IMG, img: 1 },
        { k: 'description', l: 'Description', t: 'textarea', rows: 5 },
        { k: 'tech', l: 'Technologies (comma separated)', t: 'text', ph: 'Django, React, Flutter' },
        { k: 'projectStatus', l: 'Status', t: 'select', opts: [['in_progress', 'In progress'], ['completed', 'Completed'], ['archived', 'Archived']] },
        { k: 'date', l: 'Date', t: 'date' },
        { k: 'demoUrl', l: 'Demo URL', t: 'url' },
        { k: 'githubUrl', l: 'Source URL', t: 'url' },
        { k: 'screenshots', l: 'Screenshots', t: 'files', accept: IMG, img: 1 },
      ],
    },
    post: {
      key: 'post', route: 'blog', label: 'Blog', single: 'Post',
      fields: [
        { k: 'name', l: 'Title', t: 'text', req: 1 },
        { k: 'image', l: 'Featured image', t: 'file', accept: IMG, img: 1 },
        { k: 'excerpt', l: 'Excerpt', t: 'text', max: 255 },
        { k: 'content', l: 'Content (Markdown)', t: 'textarea', rows: 12 },
        { k: 'tags', l: 'Tags (comma separated)', t: 'text' },
        { k: 'category', l: 'Category', t: 'text' },
        { k: 'publishedAt', l: 'Publish date', t: 'date' },
      ],
    },
  };
  IW.TYPE_LIST = Object.values(IW.TYPES);
  IW.BY_ROUTE = Object.fromEntries(IW.TYPE_LIST.map((t) => [t.route, t]));
  IW.SETTINGS_FIELDS = [
    { k: 'tagline', l: 'Footer tagline', t: 'text' },
    { k: 'about', l: 'About page (Markdown)', t: 'textarea', rows: 8 },
    { k: 'email', l: 'Contact email', t: 'text' },
    { k: 'whatsapp', l: 'WhatsApp number (international format, digits only)', t: 'text', ph: '2348012345678' },
    { k: 'github', l: 'GitHub profile URL', t: 'url' },
  ];
  IW.DEFAULT_SETTINGS = {
    tagline: 'Apps, games, tools, and downloads — built and published independently.',
    about: 'iNWEKOBONGstudios is an independent studio building web apps, mobile games, and backend services, with a focus on users in Nigeria and across Africa.\n\nEverything published here — apps, games, tools, downloads, and write-ups — is made in-house.',
    email: 'hello@inwekobongstudios.com',
    whatsapp: '',
    github: 'https://github.com/poweressien',
  };
  IW.FILE_FIELDS = (type) => (IW.TYPES[type] ? IW.TYPES[type].fields : []).filter((f) => f.t === 'file' || f.t === 'files');

  /* ---------- IndexedDB (with in-memory fallback) ---------- */
  const DB_NAME = 'iw-studio-v1', STORE = 'items', SETTINGS_ID = '__settings__';
  const mem = new Map();
  let useMem = false, dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('blocked'));
      } catch (e) { reject(e); }
    });
    return dbPromise;
  }
  const txDone = (t) => new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('aborted')); });

  async function dbAll() {
    if (useMem) return [...mem.values()];
    try {
      const d = await openDB();
      return await new Promise((res, rej) => { const r = d.transaction(STORE).objectStore(STORE).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    } catch (e) { useMem = true; IW.storageFallback = true; return [...mem.values()]; }
  }
  async function dbPut(rec) {
    mem.set(rec.id, rec);
    if (useMem) return;
    const d = await openDB();
    const t = d.transaction(STORE, 'readwrite');
    t.objectStore(STORE).put(rec);
    await txDone(t);
  }
  async function dbDelete(id) {
    mem.delete(id);
    if (useMem) return;
    try { const d = await openDB(); const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).delete(id); await txDone(t); } catch (e) { /* ignore */ }
  }

  /* ---------- files ---------- */
  const urlCache = new WeakMap();
  IW.fileUrl = (ref) => {
    if (!ref) return '';
    if (ref.blob) {
      let u = urlCache.get(ref.blob);
      if (!u) { u = URL.createObjectURL(ref.blob); urlCache.set(ref.blob, u); }
      return u;
    }
    return ref.path ? ref.path.split('/').map(encodeURIComponent).join('/') : '';
  };
  IW.makeRef = (file) => ({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, blob: file });

  /* ---------- merge published + local ---------- */
  IW.items = [];
  IW.pendingDeletes = [];
  IW.settings = { ...IW.DEFAULT_SETTINGS };
  IW.localSettings = null;
  IW.publishedItems = [];

  IW.load = async function () {
    const sd = window.SITE_DATA || {};
    const published = Array.isArray(sd.items) ? sd.items : [];
    IW.publishedItems = published;
    const pubMap = new Map(published.map((i) => [i.id, i]));
    let local = await dbAll();

    // Drop local records that the deployed site already contains.
    for (const r of local.slice()) {
      if (r.id === SETTINGS_ID) {
        if (sd.settings && sd.settings.updatedAt && r.updatedAt <= sd.settings.updatedAt) { await dbDelete(r.id); local = local.filter((x) => x !== r); }
        continue;
      }
      const p = pubMap.get(r.id);
      if ((r.deleted && !p) || (!r.deleted && p && r.updatedAt <= p.updatedAt)) { await dbDelete(r.id); local = local.filter((x) => x !== r); }
    }

    const localMap = new Map(local.map((r) => [r.id, r]));
    const out = [], dels = [];
    for (const p of published) {
      const r = localMap.get(p.id);
      if (r && r.deleted) { dels.push(p); continue; }
      out.push(r ? Object.assign({}, r, { _local: true }) : Object.assign({}, p, { _local: false }));
    }
    for (const r of local) {
      if (r.id === SETTINGS_ID || r.deleted || pubMap.has(r.id)) continue;
      out.push(Object.assign({}, r, { _local: true, _new: true }));
    }
    out.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    IW.items = out;
    IW.pendingDeletes = dels;
    IW.localSettings = localMap.get(SETTINGS_ID) || null;
    IW.settings = Object.assign({}, IW.DEFAULT_SETTINGS, sd.settings || {}, IW.localSettings || {});
    IW.pendingCount = out.filter((i) => i._local).length + dels.length + (IW.localSettings ? 1 : 0);
  };

  /* Visible on the public pages: published items, plus this browser's own drafts for preview. */
  IW.visible = (type) => IW.items.filter((i) => (!type || i.type === type) && (i.status !== 'draft' || i._local));
  IW.find = (type, slug) => IW.visible(type).find((i) => i.slug === slug);

  const strip = (item) => {
    const o = {};
    for (const k of Object.keys(item)) if (k[0] !== '_') o[k] = item[k];
    return o;
  };

  IW.save = async function (item) {
    const rec = strip(item);
    const now = new Date().toISOString();
    rec.updatedAt = now;
    if (!rec.createdAt) rec.createdAt = now;
    if (!rec.id) rec.id = IW.uid();
    rec.status = rec.status === 'draft' ? 'draft' : 'published';
    // unique slug within the type
    const base = IW.slugify(rec.slug || rec.name);
    let slug = base, n = 2;
    const taken = (s) => IW.items.some((i) => i.type === rec.type && i.slug === s && i.id !== rec.id) || IW.pendingDeletes.some((i) => i.type === rec.type && i.slug === s && i.id !== rec.id);
    while (taken(slug)) slug = `${base}-${n++}`;
    rec.slug = slug;
    if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) { /* ignore */ } }
    await dbPut(rec);
    await IW.load();
    return rec;
  };

  IW.remove = async function (id) {
    const pub = IW.publishedItems.find((i) => i.id === id);
    if (pub) await dbPut({ id, type: pub.type, deleted: true, updatedAt: new Date().toISOString() });
    else await dbDelete(id);
    await IW.load();
  };
  IW.undoRemove = async function (id) { await dbDelete(id); await IW.load(); };
  IW.revert = async function (id) { await dbDelete(id); await IW.load(); };

  IW.saveSettings = async function (s) {
    const rec = { id: SETTINGS_ID, updatedAt: new Date().toISOString() };
    for (const f of IW.SETTINGS_FIELDS) rec[f.k] = String(s[f.k] == null ? '' : s[f.k]);
    await dbPut(rec);
    await IW.load();
  };
  IW.resetSettings = async function () { await dbDelete(SETTINGS_ID); await IW.load(); };

  IW.dropAllLocal = async function () {
    for (const r of await dbAll()) await dbDelete(r.id);
    await IW.load();
  };
})();
