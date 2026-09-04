# 0xDEAD: Код смерті — Promo Site

Static promo website for the book *0xDEAD: Код смерті*. Plain HTML/CSS/JS,
no build step, no backend — uses `localStorage` for its interactive
persistence (bonus archive unlocks, newsletter signup demo).

## Running locally

No build step is required. Either:

- Open `index.html` directly in a browser, **or**
- Serve the folder with any static server for a nicer dev loop, e.g.:
  ```bash
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

## Deploying

This is a static site — deploy by uploading the repo contents as-is to any
static host:

- **GitHub Pages**: enable Pages on this repo (serve from the branch root)
- **Netlify / Vercel**: point a new static site at this repo, no build
  command needed, publish directory = repo root
- Any other static host / CDN / plain web server

## Project structure

```
index.html                   Single-page site (sections linked by anchor)
assets/css/style.css          All styling (cyberpunk theme, CSS variables)
assets/js/main.js             Nav, hero rain effect, terminal, archive
                               unlock logic, reviews carousel, signup form
assets/js/archive-data.js     Lorem-ipsum bonus "case file" lore entries
assets/js/dossier-data.js     Police dossier entries on the syndicate cell
assets/js/map-data.js         Cities + street pins for the terminal "map" command
assets/img/                   Placeholder cover art + favicon (SVG)
```

## Editing content

- **Synopsis / author bio / hero tagline**: edit the text directly in
  `index.html` — all current copy is lorem ipsum placeholder.
- **Bonus lore "Classified Archive" entries**: edit the `ARCHIVE_FILES`
  array in `assets/js/archive-data.js`. Add/remove objects (`id`, `title`,
  `body`) — the grid, unlock counter, and progress bar update automatically.
  `id` values must stay unique since they're used as the localStorage key.
- **Syndicate dossier entries**: edit the `DOSSIER_FILES` array in
  `assets/js/dossier-data.js`. Each entry has a `statusClass` of `active`,
  `deceased`, or `redacted` (redacted entries render as a blacked-out file
  with no `notes` shown, for characters the police know exist but have no
  data on) — the card's status badge and stamp follow this automatically.
- **Reviews carousel**: edit the `REVIEWS` array near the top of the
  "reviews carousel" section in `assets/js/main.js`.
- **Real book cover**: replace `assets/img/cover-placeholder.svg` with the
  real artwork (e.g. `cover.jpg`) and update the `<img src="...">` in the
  hero section of `index.html`.
- **Terminal easter egg commands**: edit `TERMINAL_COMMANDS` in
  `assets/js/main.js`.
- **Terminal `map` command**: typing `map` in the terminal opens a
  fullscreen map modal with an outline of Ukraine (traced from real
  boundary data, then simplified for a clean vector look — see
  `UKRAINE_OUTLINE` in `assets/js/main.js`) with pins for Львів,
  Тернопіль, Вінниця, Київ, and Харків. Clicking a city pin zooms into a
  per-city "district" view (a decorative sector grid) with street/address
  pins; clicking a pin shows its name, address, and note in the info panel
  below the map. Edit `assets/js/map-data.js` to change cities or streets:
  - Each city has `x`/`y` — percentage position (0-100) on the country map.
  - A city with `unavailable: true` shows `errorMessage` instead of
    drilling in (currently used for Харків, standing in for data still
    being prepared) — set it back to normal by removing `unavailable`/
    `errorMessage` and filling in its `streets` array once ready.
  - Each city's `streets` array has its own `x`/`y` — percentage position
    (0-100) within that city's zoomed view — plus `name`, `address`, and
    `note` shown when the pin is clicked. Kyiv already has three real
    addresses wired in; the others are still placeholders. Position is the
    only approximate part: convert real coordinates to a 0-100 position
    within the city view (or ask to have this wired up to precise
    coordinates) as they're provided.

## Newsletter signup

The signup form in the "Запросити доступ" section is currently a front-end
only demo — it stores the submitted email in `localStorage` and shows a
confirmation message, but does not send anything anywhere. To go live,
wire the form submit handler in `assets/js/main.js` (marked with a comment)
to a real email service (Buttondown, Mailchimp, ConvertKit, etc.).

## Notes on data persistence

All "saved" state (archive unlock progress, newsletter demo signup) lives
in the visitor's own browser via `localStorage` — there is no server or
database. Clearing browser data resets it; it does not sync across devices.
