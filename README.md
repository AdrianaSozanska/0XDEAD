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
  boundary data, simplified for a clean vector look — see
  `UKRAINE_OUTLINE` and `COUNTRY_ASPECT` in `assets/js/main.js`) with pins
  for Львів, Тернопіль, Вінниця, Київ, and Харків, positioned from real
  coordinates. The `fitMapView()` helper keeps the shape and its pins from
  being stretched: it sizes `.map-view` to the outline's real aspect ratio
  before laying out anything inside it, so the outline and the percentage-
  positioned pins always agree regardless of the modal's actual pixel
  dimensions — reuse this pattern for any future real-geography shape.

  Clicking a city pin zooms in. Київ drills into its **real administrative
  districts** (районы) — see `KYIV_DISTRICTS` in `assets/js/map-data.js`,
  also traced from real boundary data. The other cities still show a
  decorative placeholder sector grid until real district data is provided
  for them too. Clicking a location pin opens a small popup anchored above
  the pin with an image placeholder ("Фото буде додано" — swap in the real
  photo when provided), name, and address.

  Edit `assets/js/map-data.js` to change cities or locations:
  - Each city has `x`/`y` — percentage position (0-100) on the country map.
  - A city with `unavailable: true` shows `errorMessage` instead of
    drilling in (currently used for Харків, standing in for data still
    being prepared) — set it back to normal by removing `unavailable`/
    `errorMessage` and filling in its `streets` array once ready.
  - A city with `realDistricts: true` (currently only Київ) uses
    `KYIV_DISTRICTS` for its backdrop instead of the placeholder grid.
  - Each city's `streets` array has its own `x`/`y` — percentage position
    (0-100) within that city's zoomed view — plus `name` and `address`
    shown in the popup. Kyiv's three pins are real addresses positioned in
    their correct district (Подільський, Печерський, Дніпровський); the
    other cities are still placeholders. Precise in-district placement
    (and the real photos for the popups) can be refined once provided.

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
