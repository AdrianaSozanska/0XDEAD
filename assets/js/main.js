(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- storage helpers ---------------- */

  const STORAGE_KEYS = {
    unlocked: "0xdead:unlockedFiles",
    signup: "0xdead:signup"
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* localStorage unavailable (private mode / quota) — fail silently, feature degrades gracefully */
    }
  }

  /* ---------------- nav toggle ---------------- */

  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- hero digital rain ---------------- */

  function initRain() {
    const canvas = document.getElementById("rainCanvas");
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    const glyphs = "01アイウエオカキクケコサシ0xDEAD".split("");
    let columns = [];
    let fontSize = 16;
    let rafId = null;
    let visible = true;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const count = Math.floor(canvas.width / fontSize);
      columns = new Array(count).fill(0).map(() => Math.random() * -50);
    }

    function draw() {
      ctx.fillStyle = "rgba(5,7,10,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";

      columns.forEach((y, i) => {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        ctx.fillStyle = Math.random() > 0.95 ? "#00e5ff" : "#39ff14";
        ctx.fillText(glyph, x, y * fontSize);
        columns[i] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });

      if (visible) rafId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    rafId = requestAnimationFrame(draw);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible && !rafId) rafId = requestAnimationFrame(draw);
        if (!visible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      });
    });
    observer.observe(canvas);
  }

  initRain();

  /* ---------------- classified archive ---------------- */

  const archiveGrid = document.getElementById("archiveGrid");
  const archiveFill = document.getElementById("archiveFill");
  const archiveCount = document.getElementById("archiveCount");
  const unlockBadge = document.getElementById("unlockBadge");

  const files = typeof ARCHIVE_FILES !== "undefined" ? ARCHIVE_FILES : [];
  let unlocked = new Set(loadJSON(STORAGE_KEYS.unlocked, []));

  function updateArchiveProgress() {
    const total = files.length;
    const count = unlocked.size;
    const pct = total ? Math.round((count / total) * 100) : 0;
    if (archiveFill) archiveFill.style.width = pct + "%";
    if (archiveCount) archiveCount.textContent = `${count} / ${total} файлів розшифровано`;
    if (unlockBadge) unlockBadge.textContent = `${count}/${total}`;
  }

  function renderArchive() {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = "";

    files.forEach((file) => {
      const isUnlocked = unlocked.has(file.id);

      const card = document.createElement("button");
      card.type = "button";
      card.className = "case-file" + (isUnlocked ? " is-unlocked" : "");
      card.setAttribute("aria-pressed", String(isUnlocked));

      card.innerHTML = `
        <span class="case-file__id">${file.id}</span>
        <h3 class="case-file__title">${file.title}</h3>
        <p class="case-file__body">${file.body}</p>
        <span class="case-file__lock">${isUnlocked ? "✓ Розшифровано" : "🔒 Натисни, щоб розшифрувати"}</span>
      `;

      card.addEventListener("click", () => {
        if (unlocked.has(file.id)) return;
        unlocked.add(file.id);
        saveJSON(STORAGE_KEYS.unlocked, Array.from(unlocked));
        renderArchive();
        updateArchiveProgress();
      });

      archiveGrid.appendChild(card);
    });
  }

  renderArchive();
  updateArchiveProgress();

  /* ---------------- dossier: folder cards + file-opening modal ---------------- */

  const dossierGrid = document.getElementById("dossierGrid");
  const dossierFiles = typeof DOSSIER_FILES !== "undefined" ? DOSSIER_FILES : [];
  const dossierModal = document.getElementById("dossierModal");
  const dossierBackdrop = document.getElementById("dossierBackdrop");
  const dossierPanel = document.getElementById("dossierPanel");
  const dossierModalContent = document.getElementById("dossierModalContent");
  const dossierClose = document.getElementById("dossierClose");
  const dossierPrev = document.getElementById("dossierPrev");
  const dossierNext = document.getElementById("dossierNext");

  const DOSSIER_ROTATIONS = [-1.6, 1.1, -0.7, 1.7, -1.1, 0.8];

  let dossierOpenIndex = null;
  let dossierOriginRect = null;
  let dossierLastFocused = null;

  function buildDossierModalHTML(person) {
    const isDeceased = person.statusClass === "deceased";
    const isRedacted = person.statusClass === "redacted";

    const notesHtml = isRedacted
      ? `<div class="redaction"></div><div class="redaction"></div><div class="redaction"></div>
         <p class="dossier-modal__redacted-note">${person.statusLabel}</p>`
      : person.notes.map((line) => `<p class="dossier-modal__note">${line}</p>`).join("");

    return `
      <span class="dossier-modal__stamp">0xDEAD // ЦІЛКОМ ТАЄМНО</span>
      <span class="dossier-modal__case">СПРАВА №${person.caseNo}</span>
      <h3 class="dossier-modal__name">${person.name}</h3>
      <p class="dossier-modal__role">${person.roleTag}</p>
      <div class="dossier-modal__body">
        <div class="dossier-modal__photo${isDeceased ? " dossier-modal__photo--deceased" : ""}" aria-hidden="true"></div>
        <div class="dossier-modal__details">
          ${isRedacted ? "" : `<span class="dossier-status dossier-status--${person.statusClass}">${person.statusLabel}</span>`}
          ${notesHtml}
        </div>
      </div>
    `;
  }

  function renderDossierGrid() {
    if (!dossierGrid) return;
    dossierGrid.innerHTML = "";

    dossierFiles.forEach((person, idx) => {
      const isDeceased = person.statusClass === "deceased";
      const isRedacted = person.statusClass === "redacted";

      const card = document.createElement("button");
      card.type = "button";
      card.className = "dossier-card" + (isDeceased ? " dossier-card--deceased" : "") + (isRedacted ? " dossier-card--redacted" : "");
      card.style.setProperty("--rot", DOSSIER_ROTATIONS[idx % DOSSIER_ROTATIONS.length] + "deg");

      card.innerHTML = `
        <span class="dossier-card__id">СПРАВА №${person.caseNo}</span>
        <h3 class="dossier-card__name">${person.name}</h3>
        <span class="dossier-card__role">${person.roleTag}</span>
        <span class="dossier-card__hint">Відкрити файл</span>
      `;

      card.addEventListener("click", () => openDossier(idx, card));
      dossierGrid.appendChild(card);
    });
  }

  function computeDossierTargetRect() {
    const width = Math.min(window.innerWidth * 0.92, 760);
    const height = Math.min(window.innerHeight * 0.86, 620);
    return {
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height
    };
  }

  function flipTransformFrom(rect, target) {
    const scaleX = rect.width / target.width;
    const scaleY = rect.height / target.height;
    const translateX = rect.left - target.left;
    const translateY = rect.top - target.top;
    return `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  }

  function openDossier(idx, originEl) {
    if (!dossierModal || !dossierPanel) return;

    dossierOpenIndex = idx;
    dossierOriginRect = originEl.getBoundingClientRect();
    dossierLastFocused = originEl;

    const target = computeDossierTargetRect();
    dossierPanel.style.top = target.top + "px";
    dossierPanel.style.left = target.left + "px";
    dossierPanel.style.width = target.width + "px";
    dossierPanel.style.height = target.height + "px";

    dossierModalContent.innerHTML = buildDossierModalHTML(dossierFiles[idx]);
    dossierModal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    dossierPanel.style.transition = "none";
    dossierPanel.style.transform = flipTransformFrom(dossierOriginRect, target);
    void dossierPanel.offsetWidth;
    dossierPanel.style.transition = "";

    requestAnimationFrame(() => {
      dossierModal.classList.add("is-visible");
      dossierPanel.style.transform = "translate(0, 0) scale(1, 1)";
    });

    document.addEventListener("keydown", onDossierKeydown);
    dossierPanel.focus();
  }

  function closeDossier() {
    if (dossierOpenIndex === null || !dossierPanel) return;

    const target = computeDossierTargetRect();
    const rect = dossierOriginRect || target;
    dossierModal.classList.remove("is-visible");
    dossierPanel.style.transform = flipTransformFrom(rect, target);

    setTimeout(() => {
      dossierModal.classList.remove("is-active");
      dossierPanel.style.transform = "";
      document.body.classList.remove("no-scroll");
    }, prefersReducedMotion ? 0 : 500);

    document.removeEventListener("keydown", onDossierKeydown);
    dossierOpenIndex = null;
    if (dossierLastFocused) dossierLastFocused.focus();
  }

  function showDossierAt(newIdx) {
    if (dossierOpenIndex === null) return;
    const len = dossierFiles.length;
    dossierOpenIndex = (newIdx + len) % len;

    dossierModalContent.classList.add("is-swapping");
    setTimeout(() => {
      dossierModalContent.innerHTML = buildDossierModalHTML(dossierFiles[dossierOpenIndex]);
      dossierModalContent.classList.remove("is-swapping");
    }, prefersReducedMotion ? 0 : 160);
  }

  function onDossierKeydown(e) {
    if (e.key === "Escape") closeDossier();
    if (e.key === "ArrowLeft") showDossierAt(dossierOpenIndex - 1);
    if (e.key === "ArrowRight") showDossierAt(dossierOpenIndex + 1);
  }

  if (dossierGrid) {
    renderDossierGrid();
    dossierClose?.addEventListener("click", closeDossier);
    dossierBackdrop?.addEventListener("click", closeDossier);
    dossierPrev?.addEventListener("click", () => showDossierAt(dossierOpenIndex - 1));
    dossierNext?.addEventListener("click", () => showDossierAt(dossierOpenIndex + 1));
    window.addEventListener("resize", () => {
      if (dossierOpenIndex === null) return;
      const target = computeDossierTargetRect();
      dossierPanel.style.top = target.top + "px";
      dossierPanel.style.left = target.left + "px";
      dossierPanel.style.width = target.width + "px";
      dossierPanel.style.height = target.height + "px";
    });
  }

  /* ---------------- terminal ---------------- */

  const terminalBody = document.getElementById("terminalBody");
  const terminalForm = document.getElementById("terminalForm");
  const terminalInput = document.getElementById("terminalInput");

  const BOOT_LINES = [
    { text: "> booting 0xDEAD network shell...", cls: "t-dim" },
    { text: "> connection secured. welcome, guest.", cls: "" },
    { text: "> введи 'help' для списку команд", cls: "t-cyan" }
  ];

  function printLine(text, cls) {
    if (!terminalBody) return;
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.textContent = text;
    terminalBody.appendChild(p);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function bootTerminal() {
    if (!terminalBody) return;
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => printLine(line.text, line.cls), i * (prefersReducedMotion ? 0 : 350));
    });
  }

  const TERMINAL_COMMANDS = {
    help: () => [
      "доступні команди:",
      "  help      — список команд",
      "  about     — про книгу",
      "  archive   — перейти до архіву",
      "  dossier   — перейти до досьє угруповання",
      "  map       — відкрити карту мережі",
      "  unlock    — підказка щодо розшифрування файлів",
      "  clear     — очистити термінал"
    ],
    about: () => [
      "0xDEAD: Код смерті — lorem ipsum кіберпанк-трилер про хакерку,",
      "яка розплутує мережу вбивств, закодовану глибоко в місті."
    ],
    archive: () => {
      document.getElementById("archive")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      return ["> перенаправлення до /archive ..."];
    },
    dossier: () => {
      document.getElementById("dossier")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      return ["> перенаправлення до /dossier ..."];
    },
    unlock: () => [`розшифровано файлів: ${unlocked.size} / ${files.length}. натисни на картку в архіві, щоб розшифрувати наступний.`],
    map: () => {
      openMapModal();
      return ["> ініціалізація мережевої карти...", "> знайдено 5 активних вузлів"];
    },
    clear: () => { if (terminalBody) terminalBody.innerHTML = ""; return []; }
  };

  if (terminalForm && terminalInput) {
    bootTerminal();

    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = terminalInput.value.trim();
      if (!raw) return;

      printLine("guest@0xdead:~$ " + raw, "");
      const cmd = raw.toLowerCase();
      const handler = TERMINAL_COMMANDS[cmd];

      if (handler) {
        handler().forEach((line) => printLine(line, "t-dim"));
      } else {
        printLine(`команду не знайдено: "${raw}". введи 'help'.`, "t-red");
      }

      terminalInput.value = "";
    });
  }

  /* ---------------- map ---------------- */

  const mapData = typeof MAP_DATA !== "undefined" ? MAP_DATA : [];
  const mapModal = document.getElementById("mapModal");
  const mapBackdrop = document.getElementById("mapBackdrop");
  const mapPanel = document.getElementById("mapPanel");
  const mapStage = document.getElementById("mapStage");
  const mapTitle = document.getElementById("mapTitle");
  const mapBack = document.getElementById("mapBack");
  const mapInfo = document.getElementById("mapInfo");
  const mapClose = document.getElementById("mapClose");

  let mapLastFocused = null;

  /* Stylized, simplified Ukraine outline (not survey-accurate) in a 0-100 viewBox
     matching the city x/y percentages in map-data.js. Crimea is a separate shape. */
  const UKRAINE_OUTLINE = "M3,10 L20,4 L45,3 L58,9 L67,7 L75,14 L82,18 L90,24 L96,29 L94,38 L98,44 L92,50 L88,56 L78,58 L70,62 L60,63 L50,64 L40,63 L30,61 L20,58 L14,52 L9,46 L6,38 L4,30 L2,22 L3,15 Z";
  const CRIMEA_OUTLINE = "M56,64 L60,63 L66,66 L70,72 L68,80 L62,86 L55,84 L50,78 L52,70 Z";

  function renderCountryMap() {
    if (!mapStage) return;
    mapTitle.textContent = "Україна";
    mapBack.hidden = true;
    mapInfo.textContent = "Обери місто на карті, щоб наблизити його.";

    const pins = mapData.map((city) => `
      <button class="map-pin" style="left:${city.x}%; top:${city.y}%" data-city="${city.id}" aria-label="${city.name}">
        <span class="map-pin__dot"></span>
        <span class="map-pin__label">${city.name}</span>
      </button>
    `).join("");

    mapStage.innerHTML = `
      <div class="map-view">
        <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <path class="map-outline" d="${UKRAINE_OUTLINE}"></path>
          <path class="map-crimea" d="${CRIMEA_OUTLINE}"></path>
        </svg>
        <div class="map-pins">${pins}</div>
      </div>
    `;

    mapStage.querySelectorAll(".map-pin").forEach((pin) => {
      pin.addEventListener("click", () => openCityMap(pin.dataset.city));
    });
  }

  function openCityMap(cityId) {
    if (!mapStage) return;
    const city = mapData.find((c) => c.id === cityId);
    if (!city) return;

    mapTitle.textContent = city.name;
    mapBack.hidden = false;
    mapInfo.textContent = "Обери мітку, щоб переглянути деталі.";

    const streets = city.streets || [];
    const pins = streets.map((s) => `
      <button class="map-pin map-pin--street" style="left:${s.x}%; top:${s.y}%" data-street="${s.id}" aria-label="${s.name}">
        <span class="map-pin__dot"></span>
        <span class="map-pin__label">${s.name}</span>
      </button>
    `).join("");

    mapStage.innerHTML = `
      <div class="map-view">
        <div class="map-city-grid" aria-hidden="true"></div>
        <div class="map-pins">${pins}</div>
      </div>
    `;

    mapStage.querySelectorAll(".map-pin--street").forEach((pin) => {
      pin.addEventListener("click", () => {
        mapStage.querySelectorAll(".map-pin--street").forEach((p) => p.classList.remove("map-pin--active"));
        pin.classList.add("map-pin--active");
        const street = streets.find((s) => s.id === pin.dataset.street);
        if (street) mapInfo.innerHTML = `<strong>${street.name}</strong>${street.note}`;
      });
    });
  }

  function computeMapTargetRect() {
    const width = Math.min(window.innerWidth * 0.94, 920);
    const height = Math.min(window.innerHeight * 0.88, 680);
    return {
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height
    };
  }

  function openMapModal() {
    if (!mapModal || !mapPanel) return;

    const originEl = document.getElementById("terminal-window") || terminalBody;
    const originRect = originEl ? originEl.getBoundingClientRect() : computeMapTargetRect();
    mapLastFocused = document.activeElement;

    const target = computeMapTargetRect();
    mapPanel.style.top = target.top + "px";
    mapPanel.style.left = target.left + "px";
    mapPanel.style.width = target.width + "px";
    mapPanel.style.height = target.height + "px";

    renderCountryMap();
    mapModal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    mapPanel.style.transition = "none";
    mapPanel.style.transform = flipTransformFrom(originRect, target);
    void mapPanel.offsetWidth;
    mapPanel.style.transition = "";

    requestAnimationFrame(() => {
      mapModal.classList.add("is-visible");
      mapPanel.style.transform = "translate(0, 0) scale(1, 1)";
    });

    document.addEventListener("keydown", onMapKeydown);
    mapPanel.focus();
  }

  function closeMapModal() {
    if (!mapModal || !mapModal.classList.contains("is-active")) return;

    const target = computeMapTargetRect();
    const originEl = document.getElementById("terminal-window") || terminalBody;
    const rect = originEl ? originEl.getBoundingClientRect() : target;
    mapModal.classList.remove("is-visible");
    mapPanel.style.transform = flipTransformFrom(rect, target);

    setTimeout(() => {
      mapModal.classList.remove("is-active");
      mapPanel.style.transform = "";
      document.body.classList.remove("no-scroll");
    }, prefersReducedMotion ? 0 : 500);

    document.removeEventListener("keydown", onMapKeydown);
    if (mapLastFocused && mapLastFocused.focus) mapLastFocused.focus();
  }

  function onMapKeydown(e) {
    if (e.key === "Escape") closeMapModal();
  }

  if (mapModal) {
    mapClose?.addEventListener("click", closeMapModal);
    mapBackdrop?.addEventListener("click", closeMapModal);
    mapBack?.addEventListener("click", renderCountryMap);
    window.addEventListener("resize", () => {
      if (!mapModal.classList.contains("is-active")) return;
      const target = computeMapTargetRect();
      mapPanel.style.top = target.top + "px";
      mapPanel.style.left = target.left + "px";
      mapPanel.style.width = target.width + "px";
      mapPanel.style.height = target.height + "px";
    });
  }

  /* ---------------- reviews carousel ---------------- */

  const REVIEWS = [
    { quote: "Lorem ipsum dolor sit amet — не могла відірватись від першої сторінки до останньої.", meta: "— Читачка, Goodreads" },
    { quote: "Атмосфера настільки густа, що відчуваєш неон на шкірі. Consectetur adipiscing elit.", meta: "— Книжковий блогер" },
    { quote: "Найкращий кіберпанк-трилер, який я читав за останні роки. Sed do eiusmod tempor.", meta: "— Читач, Instagram" }
  ];

  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  let activeReview = 0;
  let carouselTimer = null;

  function renderCarousel() {
    if (!track || !dotsWrap) return;
    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    REVIEWS.forEach((review, i) => {
      const card = document.createElement("blockquote");
      card.className = "review-card" + (i === activeReview ? " is-active" : "");
      card.innerHTML = `<p class="review-card__quote">"${review.quote}"</p><cite class="review-card__meta">${review.meta}</cite>`;
      track.appendChild(card);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Відгук ${i + 1}`);
      if (i === activeReview) dot.classList.add("is-active");
      dot.addEventListener("click", () => { activeReview = i; renderCarousel(); resetCarouselTimer(); });
      dotsWrap.appendChild(dot);
    });
  }

  function nextReview() {
    activeReview = (activeReview + 1) % REVIEWS.length;
    renderCarousel();
  }

  function resetCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    if (!prefersReducedMotion) carouselTimer = setInterval(nextReview, 6000);
  }

  if (track) {
    renderCarousel();
    resetCarouselTimer();
  }

  /* ---------------- newsletter signup (front-end demo) ---------------- */

  const signupForm = document.getElementById("signupForm");
  const signupEmail = document.getElementById("signupEmail");
  const signupStatus = document.getElementById("signupStatus");

  const existingSignup = loadJSON(STORAGE_KEYS.signup, null);
  if (existingSignup && signupStatus) {
    signupStatus.textContent = `✓ ${existingSignup.email} вже підписано на оновлення.`;
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupEmail.value.trim();
      if (!email) return;

      /* Front-end only for now: persists locally as a working demo.
         Wire this up to a real email service (e.g. Buttondown/Mailchimp) later. */
      saveJSON(STORAGE_KEYS.signup, { email, ts: Date.now() });
      signupStatus.textContent = `✓ Дякуємо! ${email} додано до списку очікування.`;
      signupForm.reset();
    });
  }
})();
