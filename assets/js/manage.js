/* iNWEKOBONGstudios — upload manager (no login) + site export. */
(function () {
  'use strict';
  const IW = window.IW;
  const { esc, fmtSize, fmtDate } = IW;

  const BTN = 'inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60';
  const BTN2 = 'inline-block rounded-md border border-grey-300 px-4 py-2 text-sm font-semibold text-ink hover:border-brand-500 dark:border-grey-700 dark:text-grey-50';
  const BTN_DANGER = 'inline-block rounded-md border border-grey-300/40 px-3 py-1.5 text-xs font-semibold text-grey-300 hover:border-white hover:bg-white/10 hover:text-white';
  const BTN_SM = 'inline-block rounded-md border border-grey-300 px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand-500 dark:border-grey-700 dark:text-grey-50';
  const INPUT = 'w-full rounded-md border border-grey-300 bg-paper px-3 py-2 text-sm text-ink placeholder:text-grey-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-grey-700 dark:bg-paper-dark dark:text-grey-50';
  const FILE_INPUT = 'block w-full text-sm text-grey-300 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-paper-dark hover:file:bg-brand-400 dark:text-grey-300';
  const H1 = 'font-display text-3xl font-bold text-ink dark:text-grey-50';
  const H2 = 'font-display text-lg font-bold text-ink dark:text-grey-50';
  const WRAP = 'mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8';

  /* All files an item references, with the path they'll have in the exported site. */
  const SITE_FILES = [
    'index.html', 'assets/favicon.png', 'assets/logo-mark.png', 'assets/logo-wordmark.png', 'assets/hero.jpg', 'assets/css/output.css',
    'assets/js/store.js', 'assets/js/views.js', 'assets/js/manage.js', 'assets/js/main.js',
    'assets/js/vendor/jszip.min.js', 'assets/js/vendor/marked.min.js', 'assets/js/vendor/purify.min.js',
    'README.md',
  ];

  /* ---------- toast ---------- */
  IW.toast = (msg, bad) => {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.className = 'fixed bottom-5 left-1/2 z-[100] max-w-[90vw] -translate-x-1/2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-lg ' + (bad ? 'bg-grey-700 ring-1 ring-white/40' : 'bg-grey-900 ring-1 ring-brand-500/50');
    t.textContent = msg;
    clearTimeout(t._h); t._h = setTimeout(() => t.remove(), 4500);
  };

  /* ---------- manager home ---------- */
  function stateOf(it) {
    if (it.status === 'draft') return ['Draft', 'bg-grey-100 text-grey-700 dark:bg-grey-900 dark:text-grey-300'];
    if (it._new) return ['Not published yet', 'bg-brand-500/10 text-brand-700 dark:text-brand-400'];
    if (it._local) return ['Edited — not published', 'bg-brand-500/10 text-brand-700 dark:text-brand-400'];
    return ['Live', 'bg-grey-50 text-grey-700 dark:bg-grey-900 dark:text-grey-300'];
  };

  function manager() {
    const all = IW.items;
    const pending = IW.pendingCount;
    const rows = all.map((it) => {
      const [label, cls] = stateOf(it);
      const T = IW.TYPES[it.type];
      return `<li class="flex flex-wrap items-center gap-3 border-b border-grey-100 py-3 dark:border-grey-900">
        <div class="min-w-0 flex-1">
          <p class="truncate font-display text-sm font-semibold text-ink dark:text-grey-50">${esc(it.name)}</p>
          <p class="mt-0.5 font-mono text-[11px] text-grey-500">${T.single}${it.version ? ' · v' + esc(it.version) : ''}${it.file && it.file.size ? ' · ' + fmtSize(it.file.size) : ''} · ${esc(fmtDate(it.updatedAt))}</p>
        </div>
        <span class="rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}">${label}</span>
        <div class="flex gap-2">
          <a href="#/${T.route}/${encodeURIComponent(it.slug)}" class="${BTN_SM}">View</a>
          <a href="#/upload/edit/${esc(it.id)}" class="${BTN_SM}">Edit</a>
          ${it._local && !it._new ? `<button type="button" data-revert="${esc(it.id)}" class="${BTN_SM}" title="Discard local edits and go back to the live version">Revert</button>` : ''}
          <button type="button" data-del="${esc(it.id)}" class="${BTN_DANGER}">Delete</button>
        </div>
      </li>`;
    }).join('');
    const dels = IW.pendingDeletes.map((it) => `<li class="flex items-center gap-3 border-b border-grey-100 py-3 text-sm text-grey-500 dark:border-grey-900"><span class="min-w-0 flex-1 truncate line-through">${esc(it.name)}</span><span class="text-xs">Will be removed on next export</span><button type="button" data-undel="${esc(it.id)}" class="${BTN_SM}">Undo</button></li>`).join('');
    const html = `<div class="${WRAP}">
  <h1 class="${H1}">Upload &amp; manage</h1>
  <p class="mt-2 text-sm text-grey-500">No login needed. Add apps, games and files below — they're saved in <em>this browser</em>. When you're happy, press <strong>Export site</strong> and upload the zip to your host to publish.</p>

  <div id="dropzone" class="mt-6 rounded-xl border-2 border-dashed border-grey-300 p-8 text-center dark:border-grey-700">
    <p class="font-display text-lg font-semibold text-ink dark:text-grey-50">Drop an app file here</p>
    <p class="mt-1 text-sm text-grey-500">APK, ZIP, EXE… — or pick what you're adding:</p>
    <div class="mt-4 flex flex-wrap justify-center gap-2">
      ${IW.TYPE_LIST.map((t) => `<a href="#/upload/new/${t.key}" class="${t.key === 'app' ? BTN : BTN2}">+ ${t.single}</a>`).join('')}
    </div>
  </div>

  <div class="mt-8 rounded-xl border ${pending ? 'border-brand-500/40 bg-brand-500/5' : 'border-grey-100 dark:border-grey-900'} p-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="${H2}">Publish</h2>
        <p class="mt-1 text-sm text-grey-500" id="pending-text">${pending ? `<strong class="text-ink dark:text-grey-50">${pending} change${pending === 1 ? '' : 's'}</strong> only in this browser — not on the live site yet.` : 'Everything here matches the live site.'}</p>
      </div>
      <button type="button" id="export-btn" class="${BTN}">Export site (.zip)</button>
    </div>
    <p id="export-status" class="mt-3 hidden font-mono text-xs text-grey-500"></p>
    <details class="mt-3 text-sm text-grey-500">
      <summary class="cursor-pointer">How publishing works</summary>
      <ol class="mt-2 list-inside list-decimal space-y-1">
        <li>Export the site — you get a zip containing the whole website plus everything you've added.</li>
        <li>Upload that zip's contents to your static host (Netlify Drop, Cloudflare Pages, GitHub Pages…), replacing the old version.</li>
        <li>Once the new version is live, the "not published" labels here clear themselves.</li>
      </ol>
      <p class="mt-2">Because there's no server, uploads are kept in this browser until exported. Don't clear this browser's site data before exporting — export regularly as a backup.</p>
    </details>
  </div>

  <div class="mt-10 flex items-center justify-between">
    <h2 class="${H2}">Your content (${all.length})</h2>
    <a href="#/upload/settings" class="${BTN_SM}">Site settings</a>
  </div>
  ${all.length || dels ? `<ul class="mt-2">${rows}${dels}</ul>` : '<p class="mt-4 rounded-lg border border-dashed border-grey-300 px-4 py-10 text-center text-sm text-grey-500 dark:border-grey-700">Nothing yet — drop a file above to add your first app.</p>'}
  ${IW.storageFallback ? '<p class="mt-6 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm text-white">This browser blocked local storage (private window?). Your uploads will be lost when you close the tab — export before leaving.</p>' : ''}
</div>`;

    return {
      title: 'Upload', html,
      after: (root) => {
        root.addEventListener('click', async (e) => {
          const b = e.target.closest('[data-del],[data-undel],[data-revert]');
          if (!b) return;
          if (b.dataset.del) {
            const it = IW.items.find((i) => i.id === b.dataset.del);
            if (!confirm(`Delete "${it ? it.name : 'this item'}"?${it && !it._new ? '\n\nIt stays on the live site until you export and re-upload.' : ''}`)) return;
            await IW.remove(b.dataset.del); IW.rerender();
          } else if (b.dataset.undel) { await IW.undoRemove(b.dataset.undel); IW.rerender(); }
          else if (b.dataset.revert) {
            if (!confirm('Discard your local edits and go back to the live version?')) return;
            await IW.revert(b.dataset.revert); IW.rerender();
          }
        });
        root.querySelector('#export-btn').addEventListener('click', () => exportSite(root));
        const dz = root.querySelector('#dropzone');
        ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('border-brand-500', 'bg-brand-500/5'); }));
        ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('border-brand-500', 'bg-brand-500/5'); }));
        dz.addEventListener('drop', (e) => {
          const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
          if (!f) return;
          IW._prefill = { file: f };
          location.hash = '#/upload/new/app';
        });
      },
    };
  }

  /* ---------- editor form ---------- */
  function fieldWrap(f, st) {
    const v = st.item[f.k];
    const id = 'f-' + f.k;
    const label = `<label for="${id}" class="mb-1 block text-sm font-medium text-ink dark:text-grey-50">${esc(f.l)}${f.req ? ' <span class="text-brand-400">*</span>' : ''}</label>`;
    if (f.t === 'textarea') return `<div>${label}<textarea id="${id}" data-k="${f.k}" rows="${f.rows || 4}" class="${INPUT}" placeholder="${esc(f.ph || '')}">${esc(v || '')}</textarea></div>`;
    if (f.t === 'select') return `<div>${label}<select id="${id}" data-k="${f.k}" class="${INPUT}">${f.opts.map(([val, l]) => `<option value="${val}" ${(v || f.opts[0][0]) === val ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`;
    if (f.t === 'file' || f.t === 'files') return `<div data-filewrap="${f.k}">${label}${fileInner(f, st)}</div>`;
    const type = f.t === 'url' ? 'url' : f.t === 'date' ? 'date' : 'text';
    return `<div>${label}<input id="${id}" data-k="${f.k}" type="${type}" ${f.max ? `maxlength="${f.max}"` : ''} value="${esc(v || '')}" placeholder="${esc(f.ph || '')}" class="${INPUT}"></div>`;
  }

  function fileInner(f, st) {
    const v = st.item[f.k];
    const refs = f.t === 'files' ? (v || []) : (v ? [v] : []);
    const row = (r, i) => `<li class="flex items-center gap-3 rounded-md border border-grey-100 p-2 dark:border-grey-900">
      ${f.img && IW.fileUrl(r) ? `<img src="${esc(IW.fileUrl(r))}" alt="" class="h-12 w-12 rounded object-cover">` : '<span class="flex h-12 w-12 items-center justify-center rounded bg-grey-50 font-mono text-[10px] text-grey-500 dark:bg-grey-900">FILE</span>'}
      <span class="min-w-0 flex-1"><span class="block truncate text-sm text-ink dark:text-grey-50">${esc(r.name)}</span><span class="font-mono text-[11px] text-grey-500">${fmtSize(r.size)}${r.blob ? ' · new' : ''}</span></span>
      <button type="button" data-rmfile="${f.k}" data-i="${i}" class="${BTN_SM}">Remove</button></li>`;
    const big = refs.some((r) => r.size > 20 * 1024 * 1024);
    return `${refs.length ? `<ul class="mb-2 space-y-2">${refs.map(row).join('')}</ul>` : ''}
      <input type="file" data-file="${f.k}" accept="${esc(f.accept || '')}" ${f.t === 'files' ? 'multiple' : ''} class="${FILE_INPUT}">
      ${f.big ? '<p class="mt-1 text-xs text-grey-500">Free hosts cap single files (e.g. Cloudflare Pages 25 MiB, GitHub 100 MB). For anything bigger, host the file elsewhere and paste the link in the external link field.</p>' : ''}
      ${big ? '<p class="mt-1 text-xs text-brand-400">This file is over 20 MB — check your host\'s per-file limit before publishing.</p>' : ''}`;
  }

  function guessFromFile(st, file) {
    const base = file.name.replace(/\.[^.]+$/, '');
    if (!st.item.name) st.item.name = base.replace(/[_-]+/g, ' ').replace(/\bv?\d+(\.\d+)+.*$/i, '').trim() || base;
    const m = /v?(\d+(?:\.\d+){1,3})/i.exec(file.name);
    if (m && !st.item.version) st.item.version = m[1];
  }

  function editor(id, newType) {
    let st;
    if (id) {
      const it = IW.items.find((i) => i.id === id);
      if (!it) return { title: 'Not found', html: `<div class="${WRAP}"><p>That item no longer exists. <a class="text-brand-600 underline" href="#/upload">Back</a></p></div>` };
      st = { item: Object.assign({}, it), isNew: false };
    } else {
      st = { item: { type: IW.TYPES[newType] ? newType : 'app', status: 'published' }, isNew: true };
      if (IW._prefill && IW._prefill.file) {
        const f = IW._prefill.file; IW._prefill = null;
        st.item.file = IW.makeRef(f);
        guessFromFile(st, f);
      }
    }

    const render = (root) => {
      const T = IW.TYPES[st.item.type];
      root.querySelector('#form-fields').innerHTML = T.fields.map((f) => fieldWrap(f, st)).join('');
    };

    const html = `<div class="${WRAP}">
  <a href="#/upload" class="font-mono text-xs text-grey-500 hover:text-brand-600">&larr; Back to upload</a>
  <h1 class="mt-2 ${H1}">${id ? 'Edit' : 'New'} ${esc(IW.TYPES[st.item.type].single.toLowerCase())}</h1>
  <form id="edit-form" class="mt-6 space-y-5" novalidate>
    ${st.isNew ? `<div><label for="f-type" class="mb-1 block text-sm font-medium text-ink dark:text-grey-50">Type</label>
      <select id="f-type" class="${INPUT}">${IW.TYPE_LIST.map((t) => `<option value="${t.key}" ${t.key === st.item.type ? 'selected' : ''}>${t.single}</option>`).join('')}</select></div>` : ''}
    <div id="form-fields" class="space-y-5"></div>
    <label class="flex items-center gap-2 text-sm text-ink dark:text-grey-50"><input type="checkbox" id="f-draft" ${st.item.status === 'draft' ? 'checked' : ''}> Save as draft (hidden from the public site and left out of exports)</label>
    <label class="flex items-center gap-2 text-sm text-ink dark:text-grey-50"><input type="checkbox" id="f-featured" ${st.item.featured ? 'checked' : ''}> Featured (shown on the homepage slider &amp; popular lists)</label>
    <p id="form-error" class="hidden rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white"></p>
    <div class="flex gap-3"><button type="submit" id="save-btn" class="${BTN}">Save</button><a href="#/upload" class="${BTN2}">Cancel</a></div>
  </form></div>`;

    return {
      title: id ? 'Edit' : 'New upload', html,
      after: (root) => {
        const form = root.querySelector('#edit-form');
        render(root);
        const err = (m) => { const e = root.querySelector('#form-error'); e.textContent = m; e.classList.toggle('hidden', !m); if (m) e.scrollIntoView({ block: 'center' }); };

        const typeSel = root.querySelector('#f-type');
        if (typeSel) typeSel.addEventListener('change', () => { st.item.type = typeSel.value; root.querySelector('h1').textContent = 'New ' + IW.TYPES[st.item.type].single.toLowerCase(); render(root); });

        form.addEventListener('input', (e) => { const k = e.target.dataset && e.target.dataset.k; if (k) st.item[k] = e.target.value; });
        form.addEventListener('change', (e) => {
          const k = e.target.dataset && e.target.dataset.file;
          if (!k) return;
          const f = IW.TYPES[st.item.type].fields.find((x) => x.k === k);
          const files = [...e.target.files];
          if (!files.length) return;
          if (f.t === 'files') st.item[k] = (st.item[k] || []).concat(files.map(IW.makeRef));
          else {
            st.item[k] = IW.makeRef(files[0]);
            if (k === 'file') {
              guessFromFile(st, files[0]);
              const n = form.querySelector('[data-k="name"]'); if (n && !n.value) n.value = st.item.name || '';
              const v = form.querySelector('[data-k="version"]'); if (v && !v.value) v.value = st.item.version || '';
            }
          }
          form.querySelector(`[data-filewrap="${k}"]`).innerHTML = fieldWrap(f, st).replace(/^<div[^>]*>|<\/div>$/g, '');
        });
        form.addEventListener('click', (e) => {
          const b = e.target.closest('[data-rmfile]'); if (!b) return;
          const k = b.dataset.rmfile, f = IW.TYPES[st.item.type].fields.find((x) => x.k === k);
          if (f.t === 'files') st.item[k] = st.item[k].filter((_, i) => i !== Number(b.dataset.i)); else delete st.item[k];
          form.querySelector(`[data-filewrap="${k}"]`).innerHTML = fieldWrap(f, st).replace(/^<div[^>]*>|<\/div>$/g, '');
        });

        form.addEventListener('submit', async (e) => {
          e.preventDefault(); err('');
          const T = IW.TYPES[st.item.type];
          st.item.status = root.querySelector('#f-draft').checked ? 'draft' : 'published';
          st.item.featured = root.querySelector('#f-featured').checked;
          for (const f of T.fields) {
            if (!f.req) continue;
            const v = st.item[f.k];
            if (!v || (typeof v === 'string' && !v.trim())) return err(`${f.l} is required.`);
          }
          // keep only keys belonging to this type
          const keep = new Set(['id', 'type', 'slug', 'status', 'featured', 'createdAt', 'updatedAt', ...T.fields.map((f) => f.k)]);
          const rec = {};
          for (const k of Object.keys(st.item)) if (keep.has(k)) rec[k] = st.item[k];
          if (rec.type === 'post' && !rec.publishedAt) rec.publishedAt = new Date().toISOString().slice(0, 10);
          const btn = root.querySelector('#save-btn'); btn.disabled = true; btn.textContent = 'Saving…';
          try {
            await IW.save(rec);
            IW.toast('Saved in this browser. Export the site to publish it.');
            location.hash = '#/upload';
          } catch (ex) {
            btn.disabled = false; btn.textContent = 'Save';
            err(ex && ex.name === 'QuotaExceededError' ? 'This browser has run out of storage space for that file. Free some space or use an external link instead.' : 'Could not save: ' + (ex && ex.message ? ex.message : ex));
          }
        });
      },
    };
  }

  function settingsPage() {
    const s = IW.settings;
    const html = `<div class="${WRAP}">
  <a href="#/upload" class="font-mono text-xs text-grey-500 hover:text-brand-600">&larr; Back to upload</a>
  <h1 class="mt-2 ${H1}">Site settings</h1>
  <form id="settings-form" class="mt-6 space-y-5">
    ${IW.SETTINGS_FIELDS.map((f) => `<div><label for="s-${f.k}" class="mb-1 block text-sm font-medium text-ink dark:text-grey-50">${esc(f.l)}</label>${f.t === 'textarea'
      ? `<textarea id="s-${f.k}" name="${f.k}" rows="${f.rows || 4}" class="${INPUT}">${esc(s[f.k] || '')}</textarea>`
      : `<input id="s-${f.k}" name="${f.k}" type="text" value="${esc(s[f.k] || '')}" placeholder="${esc(f.ph || '')}" class="${INPUT}">`}</div>`).join('')}
    <div class="flex gap-3"><button type="submit" class="${BTN}">Save</button><button type="button" id="reset-settings" class="${BTN2}">Reset to published</button></div>
  </form></div>`;
    return {
      title: 'Site settings', html,
      after: (root) => {
        const f = root.querySelector('#settings-form');
        f.addEventListener('submit', async (e) => { e.preventDefault(); await IW.saveSettings(Object.fromEntries(new FormData(f))); IW.toast('Settings saved. Export to publish.'); location.hash = '#/upload'; });
        root.querySelector('#reset-settings').addEventListener('click', async () => { await IW.resetSettings(); IW.toast('Local settings discarded.'); IW.rerender(); });
      },
    };
  }

  /* ---------- export ---------- */
  async function fetchBlob(path) {
    const r = await fetch(path.split('/').map(encodeURIComponent).join('/'), { cache: 'no-store' });
    if (!r.ok) throw new Error(`${path} (${r.status})`);
    return r.blob();
  }

  async function exportSite(root) {
    const btn = root.querySelector('#export-btn'), status = root.querySelector('#export-status');
    const say = (m) => { status.classList.remove('hidden'); status.textContent = m; };
    if (location.protocol === 'file:') {
      return say('Export needs the site to be served over http(s) — open your hosted URL, or run "python3 -m http.server" in the site folder and open http://localhost:8000.');
    }
    if (typeof JSZip === 'undefined') return say('JSZip failed to load.');
    btn.disabled = true;
    try {
      const zip = new JSZip();
      const out = [];
      const items = IW.items.filter((i) => i.status !== 'draft');
      let n = 0;
      for (const it of items) {
        const o = {};
        for (const k of Object.keys(it)) if (k[0] !== '_') o[k] = it[k];
        for (const f of IW.FILE_FIELDS(it.type)) {
          const conv = async (ref, idx) => {
            let path = ref.path;
            let blob = ref.blob;
            if (blob) path = `data/files/${it.id}/${f.k}${idx != null ? '-' + idx : ''}-${IW.safeName(ref.name)}`;
            else { say(`Collecting ${ref.name}…`); blob = await fetchBlob(path); }
            zip.file(path, blob, { compression: 'STORE' });
            return { name: ref.name, type: ref.type, size: ref.size, path };
          };
          const v = o[f.k];
          if (!v) continue;
          if (f.t === 'files') { const arr = []; for (let i = 0; i < v.length; i++) arr.push(await conv(v[i], i)); o[f.k] = arr; }
          else o[f.k] = await conv(v);
        }
        out.push(o);
        say(`Preparing ${++n}/${items.length}: ${it.name}`);
      }
      const settings = IW.localSettings ? Object.assign({}, IW.localSettings) : Object.assign({}, (window.SITE_DATA && SITE_DATA.settings) || {});
      delete settings.id;
      if (!settings.updatedAt && Object.keys(settings).length) settings.updatedAt = new Date().toISOString();
      const data = { version: 1, generatedAt: new Date().toISOString(), settings, items: out };
      zip.file('data/site.js', 'window.SITE_DATA = ' + JSON.stringify(data) + ';\n', { compression: 'DEFLATE' });

      for (const p of SITE_FILES) { say(`Adding ${p}…`); zip.file(p, await fetchBlob(p), { compression: 'DEFLATE' }); }

      const blob = await zip.generateAsync({ type: 'blob', streamFiles: true }, (m) => say(`Zipping… ${Math.round(m.percent)}%`));
      const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `inwekobongstudios-site-${stamp}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
      say(`Done — ${out.length} item${out.length === 1 ? '' : 's'}, ${fmtSize(blob.size)}. Upload the zip's contents to your host to publish.`);
    } catch (ex) {
      say('Export failed: ' + (ex && ex.message ? ex.message : ex));
    } finally { btn.disabled = false; }
  }

  IW.manage = { manager, editor, settingsPage };
})();
