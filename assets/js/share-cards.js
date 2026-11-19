/* 0xDEAD — share cards (PROPOSAL, not wired into the site yet).
   Draws 1080×1920 story-format cards on a <canvas> entirely in the
   visitor's browser — no server needed — and shares them through the
   phone's native share sheet (Instagram Stories, TikTok, Telegram…),
   falling back to a PNG download on desktop.

   Public API (window.ShareCards):
     ShareCards.solved({ hints, timeMs })          → Promise<HTMLCanvasElement>
     ShareCards.suspect({ suspect })               → Promise<HTMLCanvasElement>
       suspect = an entry of DOSSIER_FILES (name, roleTag, photo, statusClass…)
     ShareCards.root()                             → Promise<HTMLCanvasElement>
     ShareCards.prepare(canvas, filename)          → Promise<File>   (do this ahead of the click)
     ShareCards.shareFile(file, { text })          → Promise<"shared"|"downloaded"|"cancelled">
                                                     (call synchronously inside the click handler)
     ShareCards.share(canvas, { filename, text })  → one-shot convenience (desktop-safe)
     ShareCards.rankFor(hints)                     → { code, label }

   Requires on the page: assets/js/dossier-data.js (for suspect entries),
   and the Google Fonts "Share Tech Mono" + "IBM Plex Mono" the site
   already loads. Images are read from assets/img/ (same origin).

   No answers (codes, password, file contents) are ever printed on a card. */
(function () {
  "use strict";

  const W = 1080;
  const H = 1920;
  const SITE_URL = "adrianasozanska.github.io/0XDEAD";
  const HASHTAG = "#0xDEAD_розкрито";
  /* Instagram/TikTok cover roughly the top ~220px and bottom ~270px of a
     story with their own UI — everything that must be read stays inside. */
  const SAFE_BOTTOM = H - 270;

  const C = {
    bg: "#05070a",
    panel: "#0d1417",
    border: "#1c2a2c",
    text: "#d9f5e8",
    dim: "#7f9c95",
    green: "#39ff14",
    greenSoft: "#00ffa2",
    cyan: "#00e5ff",
    red: "#ff2b4d"
  };

  /* Latin glyphs come from Share Tech Mono (the site's display font);
     it has no Cyrillic, so Ukrainian falls through to IBM Plex Mono. */
  const DISPLAY = '"Share Tech Mono", "IBM Plex Mono", monospace';
  const MONO = '"IBM Plex Mono", "Share Tech Mono", monospace';

  const COVER_SRC = "assets/img/cover_final.jpeg";

  /* ---------------- helpers ---------------- */

  const imageCache = new Map();
  function loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (!imageCache.has(src)) {
      imageCache.set(src, new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      }));
    }
    return imageCache.get(src);
  }

  async function ensureFonts() {
    if (!document.fonts) return;
    await Promise.all([
      document.fonts.load('48px "Share Tech Mono"', "0xDEAD"),
      document.fonts.load('400 48px "IBM Plex Mono"', "Справу розкрито"),
      document.fonts.load('600 48px "IBM Plex Mono"', "Справу розкрито")
    ]).catch(() => {});
  }

  function newCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    return canvas;
  }

  /* Seeded RNG so a given card always looks the same (stable previews). */
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function drawBackground(ctx, seed) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // faint falling-code columns, like the hero "rain"
    const rand = rng(seed);
    const glyphs = "01アイウエオカキクケコ0xDEAD".split("");
    ctx.font = `26px ${DISPLAY}`;
    for (let x = 12; x < W; x += 34) {
      const len = 6 + Math.floor(rand() * 18);
      const startY = Math.floor(rand() * H);
      for (let i = 0; i < len; i++) {
        const a = (i / len) * 0.16;
        ctx.fillStyle = `rgba(57,255,20,${a.toFixed(3)})`;
        ctx.fillText(glyphs[Math.floor(rand() * glyphs.length)], x, startY + i * 30);
      }
    }

    // vignette
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawScanlines(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  }

  function drawFrame(ctx) {
    // outer HUD frame with corner brackets
    const m = 40;
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 4;
    const L = 60;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * L);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * L, y);
      ctx.stroke();
    });
  }

  function drawTerminalBar(ctx, y, title) {
    const x = 90, w = W - 180, h = 64;
    ctx.fillStyle = C.panel;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    [C.red, "#ffbd2e", C.green].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x + 36 + i * 32, y + h / 2, 9, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = C.dim;
    ctx.font = `28px ${DISPLAY}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(title, x + 150, y + h / 2 + 1);
    ctx.textBaseline = "alphabetic";
  }

  function glitchText(ctx, text, x, y, font, color) {
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = C.red;
    ctx.fillText(text, x - 5, y + 2);
    ctx.fillStyle = C.cyan;
    ctx.fillText(text, x + 5, y - 2);
    ctx.globalAlpha = 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }

  /* Shrinks the font until the text fits maxWidth. */
  function fitFont(ctx, text, maxWidth, startPx, weight, family) {
    let px = startPx;
    do {
      ctx.font = `${weight} ${px}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      px -= 2;
    } while (px > 20);
    return ctx.font;
  }

  function drawImageCover(ctx, img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function glowRect(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  function drawFooter(ctx, cta) {
    ctx.textAlign = "center";
    ctx.fillStyle = C.text;
    ctx.font = `600 52px ${MONO}`;
    ctx.fillText(cta, W / 2, SAFE_BOTTOM - 135);
    ctx.fillStyle = C.green;
    ctx.font = `40px ${DISPLAY}`;
    ctx.fillText("> " + SITE_URL, W / 2, SAFE_BOTTOM - 65);
    ctx.fillStyle = C.dim;
    ctx.font = `32px ${MONO}`;
    ctx.fillText(HASHTAG, W / 2, SAFE_BOTTOM - 10);
  }

  function stamp(ctx, text, x, y, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `600 54px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const w = ctx.measureText(text).width + 60;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.92;
    ctx.strokeRect(-w / 2, -48, w, 96);
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 2);
    ctx.restore();
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  /* 0 hints → ROOT, 1–3 → АНАЛІТИК, 4+ → СТАЖЕР (max is 6: three per stage). */
  function rankFor(hints) {
    if (hints === 0) return { code: "ROOT", label: "ROOT" };
    if (hints <= 3) return { code: "ANALYST", label: "АНАЛІТИК" };
    return { code: "INTERN", label: "СТАЖЕР" };
  }

  /* ---------------- card 1: case solved ---------------- */

  async function solved({ hints = 0, timeMs = 0 } = {}) {
    await ensureFonts();
    const cover = await loadImage(COVER_SRC);
    const canvas = newCanvas();
    const ctx = canvas.getContext("2d");
    const rank = rankFor(hints);

    drawBackground(ctx, 0xdead);
    drawFrame(ctx);
    drawTerminalBar(ctx, 100, "root@0xdead:~# case --status");

    ctx.textAlign = "center";
    ctx.fillStyle = C.dim;
    ctx.font = `34px ${DISPLAY}`;
    ctx.fillText("// case_file: 0x000", W / 2, 250);

    glitchText(ctx, "СПРАВУ", W / 2, 360, `600 110px ${MONO}`, C.green);
    glitchText(ctx, "РОЗКРИТО", W / 2, 480, `600 110px ${MONO}`, C.green);

    // cover
    const cw = 400, ch = Math.round(cw * 984 / 692);
    const cx = (W - cw) / 2, cy = 540;
    if (cover) drawImageCover(ctx, cover, cx, cy, cw, ch);
    else { ctx.fillStyle = C.panel; ctx.fillRect(cx, cy, cw, ch); }
    glowRect(ctx, cx, cy, cw, ch, C.green);

    // stats panel
    const px = 130, pw = W - 260, py = cy + ch + 45, ph = 250;
    ctx.fillStyle = "rgba(13,20,23,0.92)";
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    const rows = [
      ["ПІДКАЗОК", String(hints), hints === 0 ? C.green : C.text],
      ["ЧАС", formatTime(timeMs), C.text],
      ["РІВЕНЬ ДОСТУПУ", rank.label, rank.code === "ROOT" ? C.green : rank.code === "ANALYST" ? C.cyan : C.text]
    ];
    rows.forEach(([k, v, col], i) => {
      const y = py + 70 + i * 72;
      ctx.textAlign = "left";
      ctx.fillStyle = C.dim;
      ctx.font = `40px ${MONO}`;
      ctx.fillText(k, px + 45, y);
      ctx.textAlign = "right";
      ctx.fillStyle = col;
      ctx.font = `600 48px ${MONO}`;
      ctx.fillText(v, px + pw - 45, y);
    });

    drawScanlines(ctx);
    drawFooter(ctx, hints === 0 ? "А ти зможеш без підказок?" : "А ти зможеш швидше?");
    return canvas;
  }

  /* ---------------- card 2: "I suspect…" ---------------- */

  async function suspect({ suspect: s } = {}) {
    if (!s) throw new Error("suspect required");
    await ensureFonts();
    const photo = await loadImage(s.photo);
    const canvas = newCanvas();
    const ctx = canvas.getContext("2d");

    drawBackground(ctx, (s.caseNo ? parseInt(s.caseNo, 10) : 7) * 7919);
    drawFrame(ctx);
    drawTerminalBar(ctx, 100, "guest@0xdead:~$ ./citizen_report.sh");

    ctx.textAlign = "center";
    ctx.fillStyle = C.dim;
    ctx.font = `34px ${DISPLAY}`;
    ctx.fillText("// dossier/syndicate", W / 2, 250);

    glitchText(ctx, "Я ПІДОЗРЮЮ:", W / 2, 365, `600 96px ${MONO}`, C.red);

    // photo slot (CCTV stills are landscape or portrait — cover-fit a fixed box)
    const bx = 130, bw = W - 260, by = 425, bh = 700;
    ctx.fillStyle = C.panel;
    ctx.fillRect(bx, by, bw, bh);
    if (photo) {
      drawImageCover(ctx, photo, bx, by, bw, bh);
    } else {
      // no photo on file — same treatment as the dossier's redacted folders
      ctx.fillStyle = "#0a0f12";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#000";
      for (let i = 0; i < 5; i++) ctx.fillRect(bx + 70, by + 180 + i * 85, bw - 140 - (i % 3) * 90, 46);
      ctx.fillStyle = C.dim;
      ctx.font = `600 52px ${MONO}`;
      ctx.textAlign = "center";
      ctx.fillText(s.statusClass === "redacted" ? "[ОСОБУ НЕ ВСТАНОВЛЕНО]" : "[ФОТО ВІДСУТНЄ]", W / 2, by + 110);
    }
    glowRect(ctx, bx, by, bw, bh, C.red);

    // case number tag on the photo
    ctx.fillStyle = "rgba(5,7,10,0.85)";
    ctx.fillRect(bx, by, 260, 64);
    ctx.fillStyle = C.text;
    ctx.font = `34px ${DISPLAY}`;
    ctx.textAlign = "left";
    ctx.fillText(`CASE #${s.caseNo || "??"}`, bx + 22, by + 44);

    stamp(ctx, "ПІДОЗРЮВАНИЙ", W / 2 + 150, by + bh - 110, -0.18, C.red);

    // name + role
    ctx.textAlign = "center";
    ctx.fillStyle = C.text;
    ctx.font = fitFont(ctx, s.name, W - 220, 92, 600, MONO);
    ctx.fillText(s.name, W / 2, by + bh + 115);
    ctx.fillStyle = C.dim;
    ctx.font = fitFont(ctx, s.roleTag || "", W - 220, 42, 400, MONO);
    ctx.fillText(s.roleTag || "", W / 2, by + bh + 180);

    drawScanlines(ctx);
    drawFooter(ctx, "А ти кого підозрюєш?");
    return canvas;
  }

  /* ---------------- card 3: root access ---------------- */

  async function root() {
    await ensureFonts();
    const canvas = newCanvas();
    const ctx = canvas.getContext("2d");

    drawBackground(ctx, 0xbeef);
    drawFrame(ctx);
    drawTerminalBar(ctx, 100, "root@0xdead:~#");

    ctx.textAlign = "center";
    ctx.fillStyle = C.dim;
    ctx.font = `34px ${DISPLAY}`;
    ctx.fillText("// access_level: classified", W / 2, 250);

    // padlock (open)
    const lx = W / 2, ly = 470;
    ctx.save();
    ctx.shadowColor = C.green;
    ctx.shadowBlur = 50;
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(lx + 70, ly - 90, 95, Math.PI, Math.PI * 1.95);
    ctx.stroke();
    ctx.fillStyle = C.green;
    ctx.fillRect(lx - 150, ly - 40, 300, 230);
    ctx.restore();
    ctx.fillStyle = C.bg;
    ctx.beginPath();
    ctx.arc(lx, ly + 50, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(lx - 12, ly + 60, 24, 70);

    glitchText(ctx, "ДОСТУП ROOT", W / 2, 810, `600 104px ${MONO}`, C.green);
    glitchText(ctx, "ОТРИМАНО", W / 2, 920, `600 104px ${MONO}`, C.green);

    // fake session log — no password, no file names
    const lines = [
      ["$ sudo", C.dim],
      ["[sudo] password: [приховано]", C.dim],
      ["Пароль прийнято.", C.cyan],
      ["Вітаємо. Доступ root надано.", C.text],
      ["root@0xdead:~# ls -a", C.green],
      ["2 приховані файли знайдено.", C.text]
    ];
    const tx = 140, ty = 990, tw = W - 280, th = 430;
    ctx.fillStyle = "rgba(13,20,23,0.92)";
    ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(tx, ty, tw, th);
    ctx.textAlign = "left";
    lines.forEach(([t, col], i) => {
      ctx.fillStyle = col;
      ctx.font = `36px ${MONO}`;
      ctx.fillText(t, tx + 40, ty + 72 + i * 62);
    });

    drawScanlines(ctx);
    drawFooter(ctx, "Пароль? Шукай сам(-а).");
    return canvas;
  }

  /* ---------------- sharing ---------------- */

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  /* Turn a drawn card into a PNG File. Do this BEFORE the visitor clicks
     "share": mobile Safari only opens the share sheet if navigator.share()
     runs straight away inside the click, without awaiting anything first. */
  async function prepare(canvas, filename = "0xdead.png") {
    const blob = await canvasToBlob(canvas);
    return new File([blob], filename, { type: "image/png" });
  }

  function download(file) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return "downloaded";
  }

  /* Call directly from a click handler with an already-prepared File. */
  function shareFile(file, { text = "" } = {}) {
    const fullText = [text, "https://" + SITE_URL + "/", HASHTAG].filter(Boolean).join("\n");
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file], text: fullText })
        .then(() => "shared")
        .catch((e) => (e && e.name === "AbortError" ? "cancelled" : download(file)));
    }
    return Promise.resolve(download(file));
  }

  /* Convenience one-shot (fine on desktop; prefer prepare + shareFile on phones). */
  async function share(canvas, { filename = "0xdead.png", text = "" } = {}) {
    return shareFile(await prepare(canvas, filename), { text });
  }

  window.ShareCards = { solved, suspect, root, prepare, shareFile, share, rankFor, formatTime };
})();
