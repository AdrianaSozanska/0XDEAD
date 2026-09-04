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
    unlock: () => [`розшифровано файлів: ${unlocked.size} / ${files.length}. натисни на картку в архіві, щоб розшифрувати наступний.`],
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
