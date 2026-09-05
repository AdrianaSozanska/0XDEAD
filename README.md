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
                               unlock logic, signup form
assets/js/archive-data.js     Lorem-ipsum bonus "case file" lore entries
assets/js/dossier-data.js     Police dossier entries on the syndicate cell
assets/js/map-data.js         Cities + street pins for the terminal "map" command
assets/js/timeline-data.js    Backstory events for the terminal "timeline" command
assets/js/game-data.js        Files/hints/endings for the terminal "game" mini-game
assets/img/                   Placeholder cover art + favicon (SVG)
```

## Editing content

- **Author bio / hero tagline / terminal section lede**: edit the text
  directly in `index.html` — all current copy is lorem ipsum placeholder.
  The "Термінал" section is the site's flagship — it's meant to sell the
  book's vibe through the interactive terminal, so give its lede real
  personality when the time comes rather than treating it as filler.
- **Bonus lore "Classified Archive" entries**: edit the `ARCHIVE_FILES`
  array in `assets/js/archive-data.js`. Add/remove objects (`id`, `title`,
  `body`) — the grid, unlock counter, and progress bar update automatically.
  `id` values must stay unique since they're used as the localStorage key.
- **Syndicate dossier entries**: edit the `DOSSIER_FILES` array in
  `assets/js/dossier-data.js`. Each entry has a `statusClass` of `active`,
  `deceased`, or `redacted` (redacted entries render as a blacked-out file
  with no `notes` shown, for characters the police know exist but have no
  data on) — the card's status badge and stamp follow this automatically.
- **Book cover**: the hero now shows the real cover art
  (`assets/img/initialbookcover.jpeg`) — it's a deliberately partial
  reveal (a puzzle-piece treatment baked into the artwork itself, not a
  CSS effect), meant to be swapped for the fully-revealed cover closer to
  release. Just replace the file and update the `<img>`'s `width`/`height`
  attributes in the hero section of `index.html` to match its real pixel
  dimensions (avoids layout shift).
- **Marketplace links** (`// 05 — access_request.sh` / "Де купити"): the
  three buttons are currently non-interactive placeholders
  (`<span class="btn btn--ghost btn--disabled">`, not real links) with
  "— скоро" labels, since presell marketplace links don't exist yet. Once
  they do, swap each `<span>` back to a real `<a href="...">` (drop the
  `btn--disabled` class and the "— скоро" text) in `index.html`.
- **Real author photo**: drop the file in as `assets/img/author.jpg` — no
  other change needed. `.author__portrait-frame` layers that path over the
  gradient placeholder (`center top / cover`, cropped to the 3:4 frame), so
  until the file exists the browser just skips that layer and the gradient
  shows through instead of a broken-image icon.
- **Terminal commands**: edit `TERMINAL_COMMANDS` in `assets/js/main.js`.
  `about` and `author` print placeholder lorem-ipsum lines — replace the
  text when it's ready. `sudo`, `ls -a`, `cat <file>`, and `matrix` are
  undocumented easter eggs (not listed in `help`, on purpose — part of the
  fun is finding them).
- **`sudo` easter egg**: typing `sudo` switches the input to a masked
  password prompt (`terminalInput.type = "password"`, prompt text changes
  to "Password:"). The password is `0xDEAD` (`SUDO_PASSWORD` in
  `main.js`). Three wrong attempts locks it out with a joke refusal
  ("Permission denied. Nice try."); the right one sets `sudoAuthenticated`,
  switches the live prompt to `root@0xdead:~#` for the rest of the visit,
  and suggests `ls -a`. Once authenticated, `ls -a` also lists two oddly
  named files, and `cat <filename>` prints their contents — both the
  filenames and the file contents (in Ukrainian, framed as found notes)
  are set in `SUDO_FILES` in `main.js`.
- **`matrix` easter egg**: overlays a falling-code animation on top of the
  terminal's existing scrollback for a few seconds (via `runMatrixEffect()`)
  without touching it, then removes itself.
- **`game` mini-game ("investigate")**: a documented command (listed in
  `help`), unlike the easter eggs above. Typing `game` starts a three-stage
  investigation with its own sub-commands (`evidence`, `open <file>`,
  `connect <code1> <code2>`, `decrypt <file> <code>`, `hint`, `game-help`)
  — these take priority over the normal terminal commands only while
  `gameState.active` is true, and everything else (help, clear, sudo, ...)
  still falls through normally, so the game never traps a visitor. All
  content — file text, the two solution commands, per-stage hints
  (unlimited uses; `gameState.hintsUsed` just tracks a running total shown
  in the ending stats), and the ending message —
  lives in `assets/js/game-data.js`; the engine (`main.js`) only holds the
  state machine and dispatch. A file only appears in `evidence`/`open`
  once its id is added to `gameState.unlockedFiles`; nothing about locked
  files is shown ahead of time.
- **Terminal `timeline` command**: opens a modal that streams
  `TIMELINE_EVENTS` (from `assets/js/timeline-data.js`) into a scrolling,
  `tail -f`-style log — each `{date, text}` entry appears a beat after the
  last, auto-scrolling, with a blinking cursor after the final line.
  Content is lorem ipsum placeholder; swap in the real backstory events
  whenever they're ready, same shape.
- **Terminal `map` command**: typing `map` in the terminal opens a
  fullscreen map modal with an outline of Ukraine (traced from real
  boundary data, simplified for a clean vector look — see
  `UKRAINE_OUTLINE` and `COUNTRY_ASPECT` in `assets/js/main.js`) with pins
  for Тернопіль, Вінниця, Київ, and Харків, positioned from real
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

## Publish countdown gate

On every page load, a fullscreen "LOADING" gate appears first with a
progress bar and a live D/H/M/S countdown to the publish date, before the
"0xDEAD" button reveals the site underneath (already fully rendered, just
hidden behind the gate — clicking through is instant). Edit the two dates
in `assets/js/main.js`:

- `PUBLISH_DATE` — the release date the countdown counts down to.
- `CAMPAIGN_START` — where the progress bar's 0% starts. The bar's fill is
  just elapsed-time-since-start divided by total time until `PUBLISH_DATE`,
  so pushing `CAMPAIGN_START` earlier/later changes how "full" the bar
  looks today without touching the actual countdown numbers.

If `PUBLISH_DATE` has already passed when the page loads, the gate is
skipped entirely and visitors land straight on the site.

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
