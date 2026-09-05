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

  function initRain(canvasId, frameDelayMs = 0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    const glyphs = "01アイウエオカキクケコサシ0xDEAD".split("");
    let columns = [];
    let fontSize = 16;
    let rafId = null;
    let visible = true;
    let lastDraw = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const count = Math.floor(canvas.width / fontSize);
      columns = new Array(count).fill(0).map(() => Math.random() * -50);
    }

    function draw(timestamp) {
      if (timestamp - lastDraw < frameDelayMs) {
        if (visible) rafId = requestAnimationFrame(draw);
        return;
      }
      lastDraw = timestamp;

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

  initRain("rainCanvas");
  initRain("gateRainCanvas", 60);

  /* ---------------- publish countdown gate ---------------- */

  const PUBLISH_DATE = new Date("2026-11-01T00:00:00");
  const CAMPAIGN_START = new Date("2026-02-26T00:00:00"); // edit to change how "progress" is measured

  const gateScreen = document.getElementById("gateScreen");
  const gateProgressFill = document.getElementById("gateProgressFill");
  const gateProgressPct = document.getElementById("gateProgressPct");
  const gateDays = document.getElementById("gateDays");
  const gateHours = document.getElementById("gateHours");
  const gateMinutes = document.getElementById("gateMinutes");
  const gateSeconds = document.getElementById("gateSeconds");
  const gateEnter = document.getElementById("gateEnter");

  let gateInterval = null;

  function hideGate(instant) {
    if (!gateScreen) return;
    if (gateInterval) {
      clearInterval(gateInterval);
      gateInterval = null;
    }
    document.body.classList.remove("no-scroll");

    if (instant || prefersReducedMotion) {
      gateScreen.style.display = "none";
      return;
    }
    gateScreen.classList.add("is-leaving");
    setTimeout(() => { gateScreen.style.display = "none"; }, 500);
  }

  function updateGateCountdown() {
    const now = new Date();
    const remainingMs = PUBLISH_DATE - now;

    if (remainingMs <= 0) {
      hideGate(true);
      return;
    }

    const totalMs = PUBLISH_DATE - CAMPAIGN_START;
    const elapsedMs = now - CAMPAIGN_START;
    const pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    gateProgressFill.style.width = pct + "%";
    gateProgressPct.textContent = Math.round(pct) + "%";

    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;
    gateDays.textContent = String(Math.floor(remainingMs / day)).padStart(2, "0");
    gateHours.textContent = String(Math.floor((remainingMs % day) / hour)).padStart(2, "0");
    gateMinutes.textContent = String(Math.floor((remainingMs % hour) / minute)).padStart(2, "0");
    gateSeconds.textContent = String(Math.floor((remainingMs % minute) / 1000)).padStart(2, "0");
  }

  if (gateScreen) {
    document.body.classList.add("no-scroll");
    updateGateCountdown();
    gateInterval = setInterval(updateGateCountdown, 1000);
    gateEnter?.addEventListener("click", () => hideGate(false));
  }

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
  const terminalCursor = document.getElementById("terminalCursor");
  const terminalPromptEl = document.getElementById("terminalPrompt");

  const SUDO_PASSWORD = "0xDEAD";
  const SUDO_MAX_ATTEMPTS = 3;
  /* Placeholder easter-egg file contents, revealed via `ls -a` / `cat <file>`
     once sudo is authenticated. Filenames are intentionally odd-looking. */
  const SUDO_FILES = {
    "MmFsaWNl.README.txt": "Це наш. Я його змодифікував. Дані відновити не вийде. Я забрав бекапи.",
    "MnNlcmhpaQ==.README.txt": "Більше ніколи не брати його справ"
  };

  let terminalMode = "command"; // "command" | "sudo-password"
  let sudoAuthenticated = false;
  let sudoAttempts = 0;

  function setTerminalPrompt(text) {
    if (terminalPromptEl) terminalPromptEl.textContent = text;
  }

  function enterSudoPasswordMode() {
    terminalMode = "sudo-password";
    terminalInput.type = "password";
    setTerminalPrompt("Password:");
  }

  function exitSudoPasswordMode(promptText) {
    terminalMode = "command";
    terminalInput.type = "text";
    setTerminalPrompt(promptText);
  }

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

  function updateTerminalCursor() {
    if (!terminalCursor || !terminalInput) return;
    const shouldHide = document.activeElement === terminalInput || terminalInput.value.length > 0;
    terminalCursor.classList.toggle("is-hidden", shouldHide);
  }

  /* Classic falling-code takeover: overlays a canvas on top of the terminal's
     existing scrollback (untouched underneath) for a few seconds, then removes it.
     Appended to the outer `.terminal` (not the scrolling `.terminal__body`) and
     positioned to match the body's rect — a child of the scrolling element would
     scroll away with the content instead of staying pinned over what's visible. */
  function runMatrixEffect(durationMs) {
    if (!terminalBody) return;
    const host = document.getElementById("terminal-window") || terminalBody.parentElement;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.className = "terminal__matrix";
    canvas.style.top = terminalBody.offsetTop + "px";
    canvas.style.left = terminalBody.offsetLeft + "px";
    canvas.style.width = terminalBody.offsetWidth + "px";
    canvas.style.height = terminalBody.offsetHeight + "px";
    host.appendChild(canvas);

    if (prefersReducedMotion) {
      setTimeout(() => {
        canvas.remove();
        printLine("> matrix.exe завершено. з'єднання відновлено.", "t-cyan");
      }, 400);
      return;
    }

    const ctx = canvas.getContext("2d");
    const glyphs = "01アイウエオカキクケコサシ0xDEAD".split("");
    const fontSize = 15;
    let columns = [];
    let rafId = null;

    function resize() {
      canvas.width = terminalBody.offsetWidth;
      canvas.height = terminalBody.offsetHeight;
      const count = Math.floor(canvas.width / fontSize);
      columns = new Array(count).fill(0).map(() => Math.random() * -30);
    }

    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";
      columns.forEach((y, i) => {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillStyle = Math.random() > 0.93 ? "#ffffff" : "#39ff14";
        ctx.fillText(glyph, i * fontSize, y * fontSize);
        columns[i] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
      rafId = requestAnimationFrame(draw);
    }

    resize();
    rafId = requestAnimationFrame(draw);

    setTimeout(() => {
      if (rafId) cancelAnimationFrame(rafId);
      canvas.remove();
      printLine("> matrix.exe завершено. з'єднання відновлено.", "t-cyan");
    }, durationMs);
  }

  const TERMINAL_COMMANDS = {
    help: () => [
      "доступні команди:",
      "  help      — список команд",
      "  about     — про книгу",
      "  author    — про авторку",
      "  timeline  — ключові події історії",
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
    author: () => [
      "Адріана Созанська — авторка.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod",
      "tempor incididunt ut labore et dolore magna aliqua."
    ],
    timeline: () => {
      openTimelineModal();
      return ["> завантаження timeline.log..."];
    },
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
    sudo: () => {
      enterSudoPasswordMode();
      return ["[sudo] password for guest:"];
    },
    "ls -a": () => {
      if (sudoAuthenticated) {
        return [".", "..", "MmFsaWNl.README.txt", "MnNlcmhpaQ==.README.txt"];
      }
      return [".", ".."];
    },
    matrix: () => {
      runMatrixEffect(6000);
      return ["> ініціалізація matrix.exe..."];
    },
    clear: () => { if (terminalBody) terminalBody.innerHTML = ""; return []; }
  };

  if (terminalForm && terminalInput) {
    bootTerminal();
    updateTerminalCursor();
    terminalInput.addEventListener("focus", updateTerminalCursor);
    terminalInput.addEventListener("blur", updateTerminalCursor);
    terminalInput.addEventListener("input", updateTerminalCursor);

    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = terminalInput.value.trim();
      if (!raw) return;
      terminalInput.value = "";

      if (terminalMode === "sudo-password") {
        if (raw === SUDO_PASSWORD) {
          sudoAuthenticated = true;
          sudoAttempts = 0;
          exitSudoPasswordMode("root@0xdead:~#");
          printLine("Пароль прийнято.", "t-cyan");
          printLine("Вітаємо, guest. Доступ root надано.", "");
          printLine("Спробуй ввести: ls -a", "t-dim");
        } else {
          sudoAttempts += 1;
          if (sudoAttempts >= SUDO_MAX_ATTEMPTS) {
            printLine("sudo: 3 некоректні спроби пароля.", "t-red");
            printLine("Permission denied. Nice try.", "t-red");
            sudoAttempts = 0;
            exitSudoPasswordMode("guest@0xdead:~$");
          } else {
            printLine("Sorry, try again.", "t-red");
          }
        }
        updateTerminalCursor();
        return;
      }

      const promptText = terminalPromptEl ? terminalPromptEl.textContent : "guest@0xdead:~$";
      printLine(promptText + " " + raw, "");
      const cmd = raw.toLowerCase();

      if (cmd.startsWith("cat ")) {
        const filename = raw.slice(4).trim();
        if (!sudoAuthenticated) {
          printLine(`cat: ${filename}: Дозвіл заборонено`, "t-red");
        } else if (Object.prototype.hasOwnProperty.call(SUDO_FILES, filename)) {
          printLine(`«${SUDO_FILES[filename]}»`, "t-dim");
        } else {
          printLine(`cat: ${filename}: Файл не знайдено`, "t-red");
        }
        updateTerminalCursor();
        return;
      }

      const handler = TERMINAL_COMMANDS[cmd];
      if (handler) {
        handler().forEach((line) => printLine(line, "t-dim"));
      } else {
        printLine(`команду не знайдено: "${raw}". введи 'help'.`, "t-red");
      }

      updateTerminalCursor();
    });
  }

  /* ---------------- timeline modal ---------------- */

  const timelineEvents = typeof TIMELINE_EVENTS !== "undefined" ? TIMELINE_EVENTS : [];
  const timelineModal = document.getElementById("timelineModal");
  const timelineBackdrop = document.getElementById("timelineBackdrop");
  const timelinePanel = document.getElementById("timelinePanel");
  const timelineLog = document.getElementById("timelineLog");
  const timelineClose = document.getElementById("timelineClose");

  let timelineLastFocused = null;
  let timelineTimers = [];

  function computeTimelineTargetRect() {
    const width = Math.min(window.innerWidth * 0.9, 640);
    const height = Math.min(window.innerHeight * 0.8, 560);
    return {
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height
    };
  }

  function streamTimelineLog() {
    if (!timelineLog) return;
    timelineLog.innerHTML = "";
    timelineTimers.forEach((id) => clearTimeout(id));
    timelineTimers = [];

    timelineEvents.forEach((event, i) => {
      const delay = prefersReducedMotion ? 0 : i * 450;
      const id = setTimeout(() => {
        const line = document.createElement("p");
        line.className = "timeline-modal__line";
        line.innerHTML = `<span class="timeline-modal__date">[${event.date}]</span><span class="timeline-modal__text">${event.text}</span>`;
        timelineLog.appendChild(line);
        timelineLog.scrollTop = timelineLog.scrollHeight;

        if (i === timelineEvents.length - 1) {
          const cursor = document.createElement("span");
          cursor.className = "timeline-modal__cursor";
          cursor.setAttribute("aria-hidden", "true");
          timelineLog.appendChild(cursor);
        }
      }, delay);
      timelineTimers.push(id);
    });
  }

  function openTimelineModal() {
    if (!timelineModal || !timelinePanel) return;

    const originEl = document.getElementById("terminal-window") || terminalBody;
    const originRect = originEl ? originEl.getBoundingClientRect() : computeTimelineTargetRect();
    timelineLastFocused = document.activeElement;

    const target = computeTimelineTargetRect();
    timelinePanel.style.top = target.top + "px";
    timelinePanel.style.left = target.left + "px";
    timelinePanel.style.width = target.width + "px";
    timelinePanel.style.height = target.height + "px";

    timelinePanel.style.transition = "none";
    timelinePanel.style.transform = flipTransformFrom(originRect, target);
    timelineModal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    streamTimelineLog();

    void timelinePanel.offsetWidth;
    timelinePanel.style.transition = "";

    requestAnimationFrame(() => {
      timelineModal.classList.add("is-visible");
      timelinePanel.style.transform = "translate(0, 0) scale(1, 1)";
    });

    document.addEventListener("keydown", onTimelineKeydown);
    timelinePanel.focus();
  }

  function closeTimelineModal() {
    if (!timelineModal || !timelineModal.classList.contains("is-active")) return;

    timelineTimers.forEach((id) => clearTimeout(id));
    timelineTimers = [];

    const target = computeTimelineTargetRect();
    const originEl = document.getElementById("terminal-window") || terminalBody;
    const rect = originEl ? originEl.getBoundingClientRect() : target;
    timelineModal.classList.remove("is-visible");
    timelinePanel.style.transform = flipTransformFrom(rect, target);

    setTimeout(() => {
      timelineModal.classList.remove("is-active");
      timelinePanel.style.transform = "";
      document.body.classList.remove("no-scroll");
    }, prefersReducedMotion ? 0 : 500);

    document.removeEventListener("keydown", onTimelineKeydown);
    if (timelineLastFocused && timelineLastFocused.focus) timelineLastFocused.focus();
  }

  function onTimelineKeydown(e) {
    if (e.key === "Escape") closeTimelineModal();
  }

  if (timelineModal) {
    timelineClose?.addEventListener("click", closeTimelineModal);
    timelineBackdrop?.addEventListener("click", closeTimelineModal);
    window.addEventListener("resize", () => {
      if (!timelineModal.classList.contains("is-active")) return;
      const target = computeTimelineTargetRect();
      timelinePanel.style.top = target.top + "px";
      timelinePanel.style.left = target.left + "px";
      timelinePanel.style.width = target.width + "px";
      timelinePanel.style.height = target.height + "px";
    });
  }

  /* ---------------- map ---------------- */

  const mapData = typeof MAP_DATA !== "undefined" ? MAP_DATA : [];
  const kyivDistricts = typeof KYIV_DISTRICTS !== "undefined" ? KYIV_DISTRICTS : [];
  const mapModal = document.getElementById("mapModal");
  const mapBackdrop = document.getElementById("mapBackdrop");
  const mapPanel = document.getElementById("mapPanel");
  const mapStage = document.getElementById("mapStage");
  const mapTitle = document.getElementById("mapTitle");
  const mapBack = document.getElementById("mapBack");
  const mapInfo = document.getElementById("mapInfo");
  const mapClose = document.getElementById("mapClose");

  let mapLastFocused = null;
  let mapActiveView = null; // 'country' | 'kyiv' | 'city' | 'error'

  /* Ukraine outline traced from real boundary data, simplified for a clean vector
     look. Coordinates are percent positions (0-100 x, 0-100 y) matching the city
     x/y in map-data.js — COUNTRY_ASPECT is the real width:height ratio of that
     bounding box, applied at render time so the shape isn't stretched/squashed. */
  const UKRAINE_OUTLINE = "M79.2,90.6 L73.1,92.7 L65.6,100.0 L62.5,97.4 L63.7,91.6 L57.6,87.9 L58.6,85.5 L63.9,81.3 L62.3,78.4 L53.7,75.3 L53.3,70.6 L48.1,72.1 L41.8,88.3 L39.3,86.2 L36.6,88.2 L34.2,85.9 L38.1,76.2 L37.7,74.0 L38.8,73.0 L39.4,74.7 L44.1,74.1 L40.7,62.6 L38.7,60.5 L39.1,56.3 L30.2,48.5 L25.2,51.6 L22.8,51.6 L21.5,54.5 L15.5,57.7 L12.9,54.6 L5.9,53.2 L3.5,55.8 L3.1,52.5 L0.0,49.1 L2.6,40.8 L3.8,41.5 L2.4,35.8 L7.5,25.4 L10.2,24.0 L10.8,20.4 L8.0,9.5 L10.7,9.0 L13.7,5.6 L18.0,5.3 L34.2,9.6 L36.3,11.4 L38.4,9.2 L39.8,12.1 L44.9,11.5 L47.1,12.7 L47.4,6.4 L49.1,3.7 L56.0,3.4 L57.4,0.6 L64.8,0.0 L68.4,7.1 L67.0,9.6 L67.5,13.5 L71.9,14.1 L73.7,22.0 L80.8,26.5 L85.1,24.5 L88.5,30.3 L91.7,30.2 L99.9,34.3 L97.7,44.5 L99.0,51.5 L98.1,55.6 L92.7,56.6 L89.9,60.1 L89.7,65.6 L85.2,66.6 L81.5,70.7 L76.3,71.3 L71.6,76.0 L71.9,83.8 L74.6,86.9 L80.3,86.1 Z";
  const COUNTRY_ASPECT = 1.5; // real width:height of the outline's bounding box
  const KYIV_ASPECT = 1; // Kyiv's district bounding box is close to square

  /* Sizes `.map-view` so its content box has exactly `aspect` (width/height),
     centered within `.map-modal__stage` — keeps an SVG shape (and any HTML pins
     positioned as percentages of `.map-view`) from being stretched or misaligned
     regardless of the stage's own pixel aspect ratio. */
  function fitMapView(aspect) {
    const view = mapStage?.querySelector(".map-view");
    if (!view) return;
    const outerW = mapStage.clientWidth;
    const outerH = mapStage.clientHeight;
    let width, height;
    if (outerW / outerH > aspect) {
      height = outerH;
      width = height * aspect;
    } else {
      width = outerW;
      height = width / aspect;
    }
    view.style.left = (outerW - width) / 2 + "px";
    view.style.top = (outerH - height) / 2 + "px";
    view.style.width = width + "px";
    view.style.height = height + "px";
  }

  function fillMapView() {
    const view = mapStage?.querySelector(".map-view");
    if (!view) return;
    view.style.left = "0";
    view.style.top = "0";
    view.style.width = "100%";
    view.style.height = "100%";
  }

  function positionPopup(popup, pin, container) {
    const stageRect = mapStage.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const gap = 16;
    const edgeMargin = 8;

    const popupW = popup.offsetWidth;
    const popupH = popup.offsetHeight;
    const pinCenterX = pinRect.left + pinRect.width / 2;

    const spaceAbove = pinRect.top - stageRect.top;
    const placeAbove = spaceAbove >= popupH + gap;
    const top = placeAbove ? pinRect.top - popupH - gap : pinRect.bottom + gap;

    const minLeft = stageRect.left + edgeMargin;
    const maxLeft = stageRect.right - popupW - edgeMargin;
    const left = Math.max(minLeft, Math.min(pinCenterX - popupW / 2, maxLeft));

    popup.style.left = (left - containerRect.left) + "px";
    popup.style.top = (top - containerRect.top) + "px";
    popup.classList.toggle("map-popup--below", !placeAbove);
    popup.style.setProperty("--arrow-x", (pinCenterX - left) + "px");
  }

  function showLocationPopup(pin, location) {
    mapStage.querySelector(".map-popup")?.remove();
    mapStage.querySelectorAll(".map-pin--street").forEach((p) => p.classList.remove("map-pin--active"));
    pin.classList.add("map-pin--active");

    const popup = document.createElement("div");
    popup.className = "map-popup";
    popup.innerHTML = `
      <button type="button" class="map-popup__close" aria-label="Закрити">✕</button>
      <div class="map-popup__image" aria-hidden="true"><span>Фото буде додано</span></div>
      <p class="map-popup__name">${location.name}</p>
      ${location.address ? `<p class="map-popup__address">${location.address}</p>` : ""}
      <span class="map-popup__arrow" aria-hidden="true"></span>
    `;
    popup.querySelector(".map-popup__close").addEventListener("click", (e) => {
      e.stopPropagation();
      popup.remove();
      pin.classList.remove("map-pin--active");
    });

    const pinsLayer = mapStage.querySelector(".map-pins");
    if (!pinsLayer) return;
    pinsLayer.appendChild(popup);
    positionPopup(popup, pin, pinsLayer);
  }

  function renderCountryMap() {
    if (!mapStage) return;
    mapActiveView = "country";
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
        <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path class="map-outline" d="${UKRAINE_OUTLINE}"></path>
        </svg>
        <div class="map-pins">${pins}</div>
      </div>
    `;
    fitMapView(COUNTRY_ASPECT);

    mapStage.querySelectorAll(".map-pin").forEach((pin) => {
      pin.addEventListener("click", () => openCityMap(pin.dataset.city));
    });
  }

  function buildSectorGridHTML() {
    const cols = 4;
    const rows = 3;
    let html = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const label = "СЕКТОР " + String.fromCharCode(65 + c) + (r + 1);
        html += `<div class="map-sector"><span class="map-sector__label">${label}</span></div>`;
      }
    }
    return html;
  }

  function attachLocationPinHandlers(streets) {
    mapStage.querySelectorAll(".map-pin--street").forEach((pin) => {
      pin.addEventListener("click", () => {
        const location = streets.find((s) => s.id === pin.dataset.street);
        if (location) showLocationPopup(pin, location);
      });
    });
  }

  function openCityMap(cityId) {
    if (!mapStage) return;
    const city = mapData.find((c) => c.id === cityId);
    if (!city) return;

    if (city.unavailable) {
      showMapError(city.errorMessage || "Не вдалося завантажити дані.");
      return;
    }

    const streets = city.streets || [];
    const pins = streets.map((s) => `
      <button class="map-pin map-pin--street" style="left:${s.x}%; top:${s.y}%" data-street="${s.id}" aria-label="${s.name}">
        <span class="map-pin__dot"></span>
      </button>
    `).join("");

    mapTitle.textContent = city.name;
    mapBack.hidden = false;
    mapInfo.textContent = "Обери мітку, щоб переглянути деталі.";

    if (city.realDistricts && kyivDistricts.length) {
      mapActiveView = "kyiv";
      const districtShapes = kyivDistricts.map((d, i) => `
        <path class="map-district-path${i % 2 ? " map-district-path--alt" : ""}" d="${d.path}"></path>
      `).join("");

      mapStage.innerHTML = `
        <div class="map-view">
          <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${districtShapes}</svg>
          <div class="map-pins">${pins}</div>
        </div>
      `;
      fitMapView(KYIV_ASPECT);
    } else {
      mapActiveView = "city";
      mapStage.innerHTML = `
        <div class="map-view">
          <div class="map-district-grid" aria-hidden="true">${buildSectorGridHTML()}</div>
          <div class="map-pins">${pins}</div>
        </div>
      `;
      fillMapView();
    }

    attachLocationPinHandlers(streets);
  }

  function showMapError(message) {
    if (!mapStage) return;
    mapActiveView = "error";
    mapTitle.textContent = "Помилка";
    mapBack.hidden = true;
    mapInfo.textContent = "";

    mapStage.innerHTML = `
      <div class="map-error">
        <span class="map-error__icon" aria-hidden="true">⚠</span>
        <p class="map-error__code">ERR_CITY_DATA_UNAVAILABLE</p>
        <p class="map-error__message">${message}</p>
        <button type="button" class="btn btn--ghost map-error__back" id="mapErrorBack">‹ Назад до карти країни</button>
      </div>
    `;

    document.getElementById("mapErrorBack")?.addEventListener("click", renderCountryMap);
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

    mapPanel.style.transition = "none";
    mapPanel.style.transform = flipTransformFrom(originRect, target);
    mapModal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    /* Renders after is-active so mapStage has real layout dimensions —
       fitMapView() (used by country/Kyiv views) measures clientWidth/Height,
       which are 0 while the modal is still display:none. */
    renderCountryMap();

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

      if (mapActiveView === "country") fitMapView(COUNTRY_ASPECT);
      else if (mapActiveView === "kyiv") fitMapView(KYIV_ASPECT);
      else if (mapActiveView === "city") fillMapView();
    });
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
