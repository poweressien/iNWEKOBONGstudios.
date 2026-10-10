# iNWEKOBONGstudios — static site

A fully static site: plain HTML/CSS/JS, **no backend, no database, no logins**.
Host it anywhere that serves files (Netlify, Cloudflare Pages, GitHub Pages, any web server).

## Adding apps (no login)

1. Open the site and go to **Studio upload** (footer link, or `/#/upload`).
2. Drop an app file (APK, ZIP, EXE…) on the box, or press **+ App / + Game / + Download / + Tool / + Project / + Post**.
3. Fill in the details and **Save**. Items are stored in *your browser* (IndexedDB).
4. Press **Export site (.zip)**. Unzip it and upload the contents to your host, replacing the old files.
   The export contains the whole website plus everything you've added, so the zip is always a complete, deployable site.

Anyone can open `/#/upload`, but what they add only exists in their own browser — it never reaches your live site.
Only you can publish, because only you can upload files to the host.

> A static site cannot receive uploads from visitors and show them to everyone — that needs a server.
> This design gives you "no login, no backend" by making the upload page a local editor + exporter.

## Notes

- Export needs the site served over http(s) (your hosted URL, or `python3 -m http.server` in this folder).
  Browsing the page via `file://` works for viewing, but not for export.
- Uploads live in browser storage until exported. Don't clear the site's data before exporting; export regularly as a backup.
- **Drafts** are visible only in your browser and are left out of exports.
- Per-file host limits apply (Cloudflare Pages: 25 MiB per file, GitHub: 100 MB). For bigger files, host the file elsewhere
  (GitHub Releases, Drive…) and paste the link into the **External download link** field.
- Routes use `#/…` URLs so it works on any host with zero config. (Trade-off: search engines index only the homepage.)
- Edit the About/Contact text and social links under **Upload → Site settings**.
- Legal pages (Privacy / Terms / DMCA) are plain starting templates — review before launch.

## Files

```
index.html              app shell
data/site.js            published content (written by Export)
data/files/…            uploaded files (written by Export)
assets/js/store.js      data layer (IndexedDB + published data)
assets/js/views.js      public pages
assets/js/manage.js     upload manager + export
assets/js/main.js       router
assets/css/output.css   compiled Tailwind v4
src/input.css           Tailwind source (optional rebuild:
                        npx @tailwindcss/cli -i src/input.css -o assets/css/output.css --minify)
```
# iNWEKOBONGstudios.
