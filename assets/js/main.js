(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------------- classified archive: evidence cold storage ---------------- */

  const archiveGrid = document.getElementById("archiveGrid");
  const archiveFiles = typeof ARCHIVE_FILES !== "undefined" ? ARCHIVE_FILES : [];
  const archiveModal = document.getElementById("archiveModal");
  const archiveBackdrop = document.getElementById("archiveBackdrop");
  const archivePanel = document.getElementById("archivePanel");
  const archiveModalContent = document.getElementById("archiveModalContent");
  const archiveClose = document.getElementById("archiveClose");
  const archivePrev = document.getElementById("archivePrev");
  const archiveNext = document.getElementById("archiveNext");

  let archiveOpenIndex = null;
  let archiveOriginRect = null;
  let archiveLastFocused = null;

  function noticeHTML(n) {
    return `
      <div class="archive-doc archive-doc--notice">
        <div class="notice__bar">
          <span class="notice__flag">🌐 INTERPOL</span>
          <span class="notice__type">CYBERCRIME NOTICE</span>
        </div>
        <p class="notice__ref">Reference: ${n.reference} · Classification: ${n.classification}</p>
        <p class="notice__ref">Date of issue: ${n.dateOfIssue} · Issuing authority: ${n.issuingAuthority}</p>

        <div class="notice__section">
          <span class="notice__section-label">1. Group Identification</span>
          <p>Назва угруповання (за оперативними даними): ${n.group.name}</p>
          <p>Тип активності: ${n.group.activityType}</p>
          <p>Географія діяльності: ${n.group.geography}</p>
          <p>Статус: ${n.group.status}</p>
          <p>${n.group.note}</p>
        </div>

        <div class="notice__section">
          <span class="notice__section-label">2. Known / Suspected Members</span>
          <span class="notice__aliases-label">Псевдоніми, зафіксовані оперативним шляхом:</span>
          <div class="notice__alias-list">${n.members.map((m) => `<span class="notice__alias">${m.alias} — ${m.role}</span>`).join("")}</div>
        </div>

        <div class="notice__section">
          <span class="notice__section-label">3. Modus Operandi</span>
          ${n.modusOperandi.map((p) => `<p>${p}</p>`).join("")}
        </div>

        <div class="notice__charges">
          <span class="notice__charges-label">4. Associated Charges / Predicate Offenses</span>
          <ul>${n.charges.map((c) => `<li>${c}</li>`).join("")}</ul>
        </div>

        <div class="notice__section">
          <span class="notice__section-label">5. Threat Assessment</span>
          <p>Рівень небезпеки: ${n.threat.level}</p>
          <p>Рекомендації: ${n.threat.recommendation}</p>
        </div>

        <div class="notice__section">
          <span class="notice__section-label">6. Distribution</span>
          <p>${n.distribution}</p>
        </div>

        <p class="notice__warning">${n.disclaimer}</p>
      </div>
    `;
  }

  function mugshotHTML(m) {
    return `
      <div class="archive-doc archive-doc--mugshot">
        <div class="mugshot__photo">
          <img src="${m.photo}" alt="Фото з протоколу затримання" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
          <span style="display:none">Фото буде додано</span>
        </div>
        <div class="mugshot__plate">
          <p><strong>Ім'я:</strong> ${m.name}</p>
          <p><strong>Дата народження</strong> ${m.dob}</p>
          <p><strong>№ протоколу:</strong> ${m.bookingNo}</p>
          <p><strong>Підрозділ:</strong> ${m.department}</p>
          <p><strong>Звинувачення:</strong> ${m.charge}</p>
          <p class="mugshot__note">${m.note}</p>
        </div>
      </div>
    `;
  }

  function chatHTML(c) {
    const bubbles = c.messages.map((m) => `
      <div class="chat__msg chat__msg--${m.from === "ashln" ? "right" : "left"}">
        <span class="chat__author">${m.from}</span>
        <p>${m.text}</p>
        <span class="chat__time">${m.time}</span>
      </div>
    `).join("");
    return `
      <div class="archive-doc archive-doc--chat">
        <div class="chat__header">💬 ${c.participants}</div>
        <div class="chat__log">${bubbles}</div>
      </div>
    `;
  }

  function newsHTML(n) {
    return `
      <div class="archive-doc archive-doc--news">
        <div class="news__masthead">${n.outlet}</div>
        <p class="news__meta">${n.section} · ${n.date}</p>
        <h3 class="news__headline">${n.headline}</h3>
        <p class="news__byline">${n.byline}</p>
        ${n.paragraphs.map((p) => `<p class="news__paragraph">${p}</p>`).join("")}
      </div>
    `;
  }

  function firewallHTML(f) {
    return `
      <div class="archive-doc archive-doc--firewall">
        <div class="firewall__header"># ${f.device} — traffic.log</div>
        <pre class="firewall__log">${f.lines.join("\n")}</pre>
      </div>
    `;
  }

  function redactedDocHTML(note) {
    return `
      <div class="archive-doc archive-doc--redacted">
        <div class="redaction"></div><div class="redaction"></div><div class="redaction"></div>
        <p class="dossier-modal__redacted-note">${note}</p>
      </div>
    `;
  }

  function renderArchiveDoc(file) {
    switch (file.type) {
      case "notice": return noticeHTML(file.notice);
      case "mugshot": return mugshotHTML(file.mugshot);
      case "chat": return chatHTML(file.chat);
      case "news": return newsHTML(file.news);
      case "firewall": return firewallHTML(file.firewall);
      case "redacted": return redactedDocHTML(file.redactedNote);
      default: return "";
    }
  }

  function buildArchiveModalHTML(file) {
    return `
      <div class="archive-modal__header">
        <span class="archive-modal__stamp">0xDEAD // ЦІЛКОМ ТАЄМНО</span>
        <span class="archive-modal__tag">${file.tag}</span>
        <h3 class="archive-modal__label">${file.label}</h3>
      </div>
      <div class="archive-modal__body">${renderArchiveDoc(file)}</div>
    `;
  }

  function renderArchiveGrid() {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = "";

    archiveFiles.forEach((file, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "case-file" + (file.type === "redacted" ? " case-file--redacted" : "");

      card.innerHTML = `
        <span class="case-file__id">${file.tag}</span>
        <span class="case-file__icon" aria-hidden="true">${file.icon}</span>
        <h3 class="case-file__title">${file.label}</h3>
        <span class="case-file__hint">Переглянути файл</span>
      `;

      card.addEventListener("click", () => openArchive(idx, card));
      archiveGrid.appendChild(card);
    });
  }

  function computeArchiveTargetRect() {
    const width = Math.min(window.innerWidth * 0.92, 820);
    const height = Math.min(window.innerHeight * 0.86, 680);
    return {
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height
    };
  }

  function openArchive(idx, originEl) {
    if (!archiveModal || !archivePanel) return;

    archiveOpenIndex = idx;
    archiveOriginRect = originEl.getBoundingClientRect();
    archiveLastFocused = originEl;

    const target = computeArchiveTargetRect();
    archivePanel.style.top = target.top + "px";
    archivePanel.style.left = target.left + "px";
    archivePanel.style.width = target.width + "px";
    archivePanel.style.height = target.height + "px";

    archiveModalContent.innerHTML = buildArchiveModalHTML(archiveFiles[idx]);
    archiveModal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    archivePanel.style.transition = "none";
    archivePanel.style.transform = flipTransformFrom(archiveOriginRect, target);
    void archivePanel.offsetWidth;
    archivePanel.style.transition = "";

    requestAnimationFrame(() => {
      archiveModal.classList.add("is-visible");
      archivePanel.style.transform = "translate(0, 0) scale(1, 1)";
    });

    document.addEventListener("keydown", onArchiveKeydown);
    archivePanel.focus();
  }

  function closeArchive() {
    if (archiveOpenIndex === null || !archivePanel) return;

    const target = computeArchiveTargetRect();
    const rect = archiveOriginRect || target;
    archiveModal.classList.remove("is-visible");
    archivePanel.style.transform = flipTransformFrom(rect, target);

    setTimeout(() => {
      archiveModal.classList.remove("is-active");
      archivePanel.style.transform = "";
      document.body.classList.remove("no-scroll");
    }, prefersReducedMotion ? 0 : 500);

    document.removeEventListener("keydown", onArchiveKeydown);
    archiveOpenIndex = null;
    if (archiveLastFocused) archiveLastFocused.focus();
  }

  function showArchiveAt(newIdx) {
    if (archiveOpenIndex === null) return;
    const len = archiveFiles.length;
    archiveOpenIndex = (newIdx + len) % len;

    archiveModalContent.classList.add("is-swapping");
    setTimeout(() => {
      archiveModalContent.innerHTML = buildArchiveModalHTML(archiveFiles[archiveOpenIndex]);
      archiveModalContent.classList.remove("is-swapping");
    }, prefersReducedMotion ? 0 : 160);
  }

  function onArchiveKeydown(e) {
    if (e.key === "Escape") closeArchive();
    if (e.key === "ArrowLeft") showArchiveAt(archiveOpenIndex - 1);
    if (e.key === "ArrowRight") showArchiveAt(archiveOpenIndex + 1);
  }

  if (archiveGrid) {
    renderArchiveGrid();
    archiveClose?.addEventListener("click", closeArchive);
    archiveBackdrop?.addEventListener("click", closeArchive);
    archivePrev?.addEventListener("click", () => showArchiveAt(archiveOpenIndex - 1));
    archiveNext?.addEventListener("click", () => showArchiveAt(archiveOpenIndex + 1));
    window.addEventListener("resize", () => {
      if (archiveOpenIndex === null) return;
      const target = computeArchiveTargetRect();
      archivePanel.style.top = target.top + "px";
      archivePanel.style.left = target.left + "px";
      archivePanel.style.width = target.width + "px";
      archivePanel.style.height = target.height + "px";
    });
  }

  /* ---------------- dossier: network diagram + file-opening modal ---------------- */

  const dossierGrid = document.getElementById("dossierGrid");
  const dossierNetSvg = document.getElementById("dossierNetSvg");
  const dossierFiles = typeof DOSSIER_FILES !== "undefined" ? DOSSIER_FILES : [];
  const dossierNetwork = typeof DOSSIER_NETWORK !== "undefined" ? DOSSIER_NETWORK : { nodes: [], ghosts: [], ghostLinks: [], edges: [] };
  const dossierModal = document.getElementById("dossierModal");
  const dossierBackdrop = document.getElementById("dossierBackdrop");
  const dossierPanel = document.getElementById("dossierPanel");
  const dossierModalContent = document.getElementById("dossierModalContent");
  const dossierClose = document.getElementById("dossierClose");
  const dossierPrev = document.getElementById("dossierPrev");
  const dossierNext = document.getElementById("dossierNext");

  let dossierOpenIndex = null;
  let dossierOriginRect = null;
  let dossierLastFocused = null;

  function buildDossierModalHTML(person) {
    const isDeceased = person.statusClass === "deceased";
    const isRedacted = person.statusClass === "redacted";

    const notesHtml = person.blackout
      ? `<div class="redaction"></div><div class="redaction"></div><div class="redaction"></div>
         <p class="dossier-modal__redacted-note">${person.statusLabel}</p>`
      : person.notes.map((line) => `<p class="dossier-modal__note">${line}</p>`).join("");

    const photoHtml = person.photo ? `<img src="${person.photo}" alt="${person.name}">` : "";

    return `
      <span class="dossier-modal__stamp">0xDEAD // ЦІЛКОМ ТАЄМНО</span>
      <span class="dossier-modal__case">СПРАВА №${person.caseNo}</span>
      <h3 class="dossier-modal__name">${person.name}</h3>
      <p class="dossier-modal__role">${person.roleTag}</p>
      <div class="dossier-modal__body">
        <div class="dossier-modal__photo${isDeceased ? " dossier-modal__photo--deceased" : ""}" aria-hidden="true">${photoHtml}</div>
        <div class="dossier-modal__details">
          ${isRedacted ? "" : `<span class="dossier-status dossier-status--${person.statusClass}">${person.statusLabel}</span>`}
          ${notesHtml}
        </div>
      </div>
    `;
  }

  function renderDossierNetwork() {
    if (!dossierGrid || !dossierNetSvg) return;
    dossierGrid.innerHTML = "";
    dossierNetSvg.innerHTML = "";

    const nodesById = {};
    dossierNetwork.nodes.forEach((n) => { nodesById[n.id] = n; });

    const svgNS = "http://www.w3.org/2000/svg";
    function drawLine(x1, y1, x2, y2, cls) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("class", cls);
      dossierNetSvg.appendChild(line);
    }

    /* faint dashed stubs from each ghost's owner to the other group it stands in for */
    dossierNetwork.ghosts.forEach((g) => {
      const from = nodesById[g.from];
      if (from) drawLine(from.x, from.y, g.x, g.y, "dossier-link dossier-link--ghost");
    });

    /* relationship lines between real dossier files */
    dossierNetwork.edges.forEach((edge) => {
      const from = nodesById[edge.from];
      const to = nodesById[edge.to];
      if (!from || !to) return;
      const cls = "dossier-link" + (edge.confirmed ? "" : " dossier-link--unconfirmed");
      drawLine(from.x, from.y, to.x, to.y, cls);
    });

    /* decorative, non-interactive stub nodes for other groups a person also runs */
    dossierNetwork.ghosts.forEach((g) => {
      const stub = document.createElement("div");
      stub.className = "dossier-ghost";
      stub.style.left = g.x + "%";
      stub.style.top = g.y + "%";
      stub.innerHTML = `<span>?</span><small>інша група</small>`;
      dossierGrid.appendChild(stub);
    });

    /* one folder card per dossier file, positioned by DOSSIER_NETWORK */
    dossierFiles.forEach((person, idx) => {
      const pos = nodesById[person.id];
      if (!pos) return;
      const isDeceased = person.statusClass === "deceased";
      const isRedacted = person.statusClass === "redacted";

      const card = document.createElement("button");
      card.type = "button";
      card.className = "dossier-card" + (isDeceased ? " dossier-card--deceased" : "") + (isRedacted ? " dossier-card--redacted" : "");
      card.style.left = pos.x + "%";
      card.style.top = pos.y + "%";

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
    renderDossierNetwork();
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

  /* ---------------- mini-game: investigate ---------------- */

  const gameFiles = typeof GAME_FILES !== "undefined" ? GAME_FILES : {};
  const gameHints = typeof GAME_HINTS !== "undefined" ? GAME_HINTS : {};
  const gameStage1Solution = typeof GAME_STAGE1_SOLUTION !== "undefined" ? GAME_STAGE1_SOLUTION : null;
  const gameStage2Solution = typeof GAME_STAGE2_SOLUTION !== "undefined" ? GAME_STAGE2_SOLUTION : null;
  const gameInitialUnlocked = typeof GAME_INITIAL_UNLOCKED !== "undefined" ? GAME_INITIAL_UNLOCKED : [];
  const gameEndingMessage = typeof GAME_ENDING_MESSAGE_UA !== "undefined" ? GAME_ENDING_MESSAGE_UA : "";

  const gameState = {
    active: false,
    stage: 1,
    unlockedFiles: [],
    connectionMade: false,
    hintsUsed: 0,
    completed: false
  };
  let gameStageHintIndex = 0;

  function startGame() {
    if (gameState.active && !gameState.completed) {
      return ["Розслідування вже триває. Введи 'game-help' для списку команд."];
    }
    gameState.active = true;
    gameState.stage = 1;
    gameState.unlockedFiles = gameInitialUnlocked.slice();
    gameState.connectionMade = false;
    gameState.hintsUsed = 0;
    gameState.completed = false;
    gameStageHintIndex = 0;
    const intro = gameFiles.intro;
    const lines = intro ? [intro.content_ua] : ["Гру не вдалося завантажити."];
    lines.push("Введи 'game-help', щоб побачити список команд гри.");
    return lines;
  }

  function gameEvidenceFormatHint() {
    if (gameState.stage === 1) return "Формат відповіді, щоб отримати наступні дані: connect XXX-XXXX XXX-XXXX";
    if (gameState.stage === 2) return "Формат відповіді, щоб отримати фінальні дані: decrypt final_note XXXX";
    return null;
  }

  function gameEvidence() {
    const lines = ["[EVIDENCE] Розшифровані файли:"];
    gameState.unlockedFiles.forEach((id) => {
      const file = gameFiles[id];
      if (file) lines.push(`  — ${file.filename}`);
    });
    lines.push("Введи 'open <file>', щоб прочитати вміст файлу.");
    const formatHint = gameEvidenceFormatHint();
    if (formatHint) lines.push(formatHint);
    return lines;
  }

  function gameOpen(fileId) {
    if (!fileId) return ["Вкажи файл: open <fileId>"];
    if (!gameState.unlockedFiles.includes(fileId) || !gameFiles[fileId]) {
      return ["Файл не знайдено."];
    }
    const file = gameFiles[fileId];
    const lines = [`[${file.filename}]`];

    if (file.table || file.chat) {
      openFileModal(file);
      lines.push("> файл візуалізовано в окремому вікні");
    } else {
      lines.push(file.content_ua);
    }

    if (fileId === "final_note" && gameState.stage === 3 && !gameState.completed) {
      gameState.completed = true;
      lines.push(gameEndingMessage.replace("{hintsUsed}", String(gameState.hintsUsed)));
    }
    return lines;
  }

  function gameConnect(code1, code2) {
    if (!gameStage1Solution) return ["Файл не знайдено."];
    if (gameState.stage !== 1) return ["Ця команда зараз не потрібна."];

    const attempt = `connect ${code1 || ""} ${code2 || ""}`.trim().toLowerCase();
    if (attempt === gameStage1Solution.requiredCommand.toLowerCase()) {
      gameState.connectionMade = true;
      gameState.unlockedFiles.push(...gameStage1Solution.unlocks);
      gameState.stage = gameStage1Solution.advanceToStage;
      gameStageHintIndex = 0;
      return [gameStage1Solution.successMessage_ua];
    }
    return [gameStage1Solution.failMessage_ua];
  }

  function gameDecrypt(fileId, code) {
    if (!gameStage2Solution) return ["Файл не знайдено."];
    if (gameState.stage !== 2) return ["Ця команда зараз не потрібна."];

    const attempt = `decrypt ${fileId || ""} ${code || ""}`.trim().toLowerCase();
    if (attempt === gameStage2Solution.requiredCommand.toLowerCase()) {
      gameState.unlockedFiles.push(...gameStage2Solution.unlocks);
      gameState.stage = gameStage2Solution.advanceToStage;
      gameStageHintIndex = 0;
      return [gameStage2Solution.successMessage_ua];
    }
    return [gameStage2Solution.failMessage_ua];
  }

  function gameHint() {
    const hints = gameHints[gameState.stage] || [];
    if (gameStageHintIndex >= hints.length) {
      return ["Підказок для цього етапу більше немає."];
    }
    const text = hints[gameStageHintIndex];
    gameStageHintIndex += 1;
    gameState.hintsUsed += 1;
    return [`[Підказка ${gameStageHintIndex}/${hints.length}]: ${text}`];
  }

  function gameHelp() {
    return [
      "команди гри:",
      "  evidence                — список розшифрованих файлів",
      "  open <file>             — відкрити файл",
      "  connect <code1> <code2> — зіставити два коди",
      "  decrypt <file> <code>   — розшифрувати файл кодом",
      "  hint                    — підказка для поточного етапу",
      "  game-help               — цей список команд"
    ];
  }

  const TERMINAL_COMMANDS = {
    help: () => [
      "доступні команди:",
      "  help      — список команд",
      "  timeline  — ключові події історії",
      "  game      — розпочати міні-гру-розслідування",
      "  map       — відкрити карту мережі"
    ],
    timeline: () => {
      openTimelineModal();
      return ["> завантаження timeline.log..."];
    },
    map: () => {
      openMapModal();
      return ["> ініціалізація мережевої карти...", "> знайдено 5 активних вузлів"];
    },
    game: () => startGame(),
    sudo: () => {
      enterSudoPasswordMode();
      return ["[sudo] password for guest:"];
    },
    "ls -a": () => {
      if (sudoAuthenticated) {
        return [
          ".", "..", "MmFsaWNl.README.txt", "MnNlcmhpaQ==.README.txt",
          "> підказка: спробуй cat <filename>"
        ];
      }
      return [".", ".."];
    },
    matrix: () => {
      runMatrixEffect(6000);
      return ["> ініціалізація matrix.exe..."];
    }
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

      /* While the investigate mini-game is active, its own commands take
         priority — anything else (help, clear, sudo, ...) still falls
         through to the normal dispatch below, so the game never traps you. */
      if (gameState.active) {
        let gameLines = null;
        if (cmd === "evidence") gameLines = gameEvidence();
        else if (cmd === "game-help") gameLines = gameHelp();
        else if (cmd === "hint") gameLines = gameHint();
        else if (cmd.startsWith("open ")) gameLines = gameOpen(cmd.slice(5).trim());
        else if (cmd.startsWith("connect ")) {
          const [c1, c2] = cmd.slice(8).trim().split(/\s+/);
          gameLines = gameConnect(c1, c2);
        } else if (cmd.startsWith("decrypt ")) {
          const [fileId, code] = cmd.slice(8).trim().split(/\s+/);
          gameLines = gameDecrypt(fileId, code);
        }

        if (gameLines) {
          gameLines.forEach((line) => printLine(line, "t-dim"));
          updateTerminalCursor();
          return;
        }
      }

      const handler = TERMINAL_COMMANDS[cmd];
      if (handler) {
        handler().forEach((line) => printLine(line, "t-dim"));
      } else {
        const helpCmd = gameState.active ? "game-help" : "help";
        printLine(`команду не знайдено: "${raw}". введи '${helpCmd}'.`, "t-red");
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

  /* ---------------- game evidence file modal (transfer_log / ledger_fragment) ---------------- */
  /* Same FLIP-from-terminal chrome as the timeline modal, but renders a
     recovered file's `table` data as an actual table instead of a log
     stream — flagged rows (cancelled/marked transactions) get a red
     highlight so the suspicious TRX-4471 entries jump out. */

  const fileModal = document.getElementById("fileModal");
  const fileBackdrop = document.getElementById("fileBackdrop");
  const filePanel = document.getElementById("filePanel");
  const fileEyebrow = document.getElementById("fileEyebrow");
  const fileTitle = document.getElementById("fileTitle");
  const fileBody = document.getElementById("fileBody");
  const fileClose = document.getElementById("fileClose");

  let fileLastFocused = null;
  let fileRowTimers = [];

  function computeFileTargetRect() {
    const width = Math.min(window.innerWidth * 0.92, 640);
    const height = Math.min(window.innerHeight * 0.8, 520);
    return {
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height
    };
  }

  function renderFileChat(file) {
    if (!fileBody) return;
    fileBody.innerHTML = "";
    fileRowTimers.forEach((id) => clearTimeout(id));
    fileRowTimers = [];

    const chat = file.chat;

    if (chat.meta) {
      const meta = document.createElement("div");
      meta.className = "file-modal__meta";
      meta.innerHTML = `
        <p class="file-modal__meta-title">[${chat.meta.title}]</p>
        <div class="file-modal__meta-fields">${chat.meta.fields.map((f) => `<p>${f}</p>`).join("")}</div>
      `;
      fileBody.appendChild(meta);
    } else {
      const header = document.createElement("div");
      header.className = "chat__header";
      header.textContent = `💬 ${chat.participants}`;
      fileBody.appendChild(header);
    }

    const log = document.createElement("div");
    log.className = "chat__log";
    fileBody.appendChild(log);

    chat.messages.forEach((m, i) => {
      const delay = prefersReducedMotion ? 0 : i * 180;
      const id = setTimeout(() => {
        const side = m.from === chat.rightAlign ? "right" : "left";
        const bubble = document.createElement("div");
        bubble.className = `chat__msg chat__msg--${side} file-modal__row`;
        bubble.innerHTML = `
          <span class="chat__author">${m.from}</span>
          <p>${m.text}</p>
          ${m.time ? `<span class="chat__time">${m.time}</span>` : ""}
        `;
        log.appendChild(bubble);
      }, delay);
      fileRowTimers.push(id);
    });

    if (chat.footnote) {
      const delay = prefersReducedMotion ? 0 : chat.messages.length * 180;
      const id = setTimeout(() => {
        const footnote = document.createElement("p");
        footnote.className = "file-modal__footnote";
        footnote.textContent = chat.footnote;
        fileBody.appendChild(footnote);
      }, delay);
      fileRowTimers.push(id);
    }
  }

  function renderFileTable(file) {
    if (!fileBody) return;
    fileBody.innerHTML = "";
    fileRowTimers.forEach((id) => clearTimeout(id));
    fileRowTimers = [];

    const table = file.table;
    if (table.note) {
      const note = document.createElement("p");
      note.className = "file-modal__note";
      note.textContent = table.note;
      fileBody.appendChild(note);
    }

    const tableEl = document.createElement("table");
    tableEl.className = "file-modal__table";
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>${table.columns.map((c) => `<th>${c}</th>`).join("")}</tr>`;
    const tbody = document.createElement("tbody");
    tableEl.appendChild(thead);
    tableEl.appendChild(tbody);
    fileBody.appendChild(tableEl);

    table.rows.forEach((row, i) => {
      const delay = prefersReducedMotion ? 0 : i * 220;
      const id = setTimeout(() => {
        const tr = document.createElement("tr");
        tr.className = "file-modal__row" + (row.flagged ? " is-flagged" : "");
        tr.innerHTML = row.cells.map((cell) => `<td>${cell}</td>`).join("");
        tbody.appendChild(tr);
      }, delay);
      fileRowTimers.push(id);
    });

    if (table.footnote) {
      const delay = prefersReducedMotion ? 0 : table.rows.length * 220;
      const id = setTimeout(() => {
        const footnote = document.createElement("p");
        footnote.className = "file-modal__footnote";
        footnote.textContent = table.footnote;
        fileBody.appendChild(footnote);
      }, delay);
      fileRowTimers.push(id);
    }
  }

  function openFileModal(file) {
    if (!fileModal || !filePanel) return;

    const originEl = document.getElementById("terminal-window") || terminalBody;
    const originRect = originEl ? originEl.getBoundingClientRect() : computeFileTargetRect();
    fileLastFocused = document.activeElement;

    if (fileEyebrow) fileEyebrow.textContent = `// ${file.filename} — відновлено`;
    if (fileTitle) fileTitle.textContent = file.filename;

    const target = computeFileTargetRect();
    filePanel.style.top = target.top + "px";
    filePanel.style.left = target.left + "px";
    filePanel.style.width = target.width + "px";
    filePanel.style.height = target.height + "px";

    filePanel.style.transition = "none";
    filePanel.style.transform = flipTransformFrom(originRect, target);
    fileModal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    if (file.chat) renderFileChat(file);
    else renderFileTable(file);

    void filePanel.offsetWidth;
    filePanel.style.transition = "";

    requestAnimationFrame(() => {
      fileModal.classList.add("is-visible");
      filePanel.style.transform = "translate(0, 0) scale(1, 1)";
    });

    document.addEventListener("keydown", onFileKeydown);
    filePanel.focus();
  }

  function closeFileModal() {
    if (!fileModal || !fileModal.classList.contains("is-active")) return;

    fileRowTimers.forEach((id) => clearTimeout(id));
    fileRowTimers = [];

    const target = computeFileTargetRect();
    const originEl = document.getElementById("terminal-window") || terminalBody;
    const rect = originEl ? originEl.getBoundingClientRect() : target;
    fileModal.classList.remove("is-visible");
    filePanel.style.transform = flipTransformFrom(rect, target);

    setTimeout(() => {
      fileModal.classList.remove("is-active");
      filePanel.style.transform = "";
      document.body.classList.remove("no-scroll");
    }, prefersReducedMotion ? 0 : 500);

    document.removeEventListener("keydown", onFileKeydown);
    if (fileLastFocused && fileLastFocused.focus) fileLastFocused.focus();
  }

  function onFileKeydown(e) {
    if (e.key === "Escape") closeFileModal();
  }

  if (fileModal) {
    fileClose?.addEventListener("click", closeFileModal);
    fileBackdrop?.addEventListener("click", closeFileModal);
    window.addEventListener("resize", () => {
      if (!fileModal.classList.contains("is-active")) return;
      const target = computeFileTargetRect();
      filePanel.style.top = target.top + "px";
      filePanel.style.left = target.left + "px";
      filePanel.style.width = target.width + "px";
      filePanel.style.height = target.height + "px";
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
  let mapActiveView = null; // 'country' | 'kyiv' | 'cityOutline' | 'city' | 'error'
  let currentCityOutlineAspect = 1; // set by openCityMap() for the 'cityOutline' view

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
    const imageHTML = location.photo
      ? `<img src="${location.photo}" alt="${location.name}">`
      : `<span>Фото буде додано</span>`;
    popup.innerHTML = `
      <button type="button" class="map-popup__close" aria-label="Закрити">✕</button>
      <div class="map-popup__image" aria-hidden="true">${imageHTML}</div>
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

  /* Converts a polyline SVG path's "M x,y L x,y ... Z" points into a CSS
     clip-path polygon() string, so the generic sector grid can be clipped to
     a real city outline instead of filling a plain rectangle. */
  function pathToClipPolygon(d) {
    const nums = d.match(/-?[\d.]+/g) || [];
    const points = [];
    for (let i = 0; i < nums.length; i += 2) {
      points.push(`${nums[i]}% ${nums[i + 1]}%`);
    }
    return `polygon(${points.join(", ")})`;
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
    } else if (city.outline) {
      mapActiveView = "cityOutline";
      currentCityOutlineAspect = city.outlineAspect || 1;
      const clipPath = pathToClipPolygon(city.outline);

      mapStage.innerHTML = `
        <div class="map-view">
          <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path class="map-outline" d="${city.outline}"></path>
          </svg>
          <div class="map-district-grid" aria-hidden="true" style="clip-path:${clipPath}">${buildSectorGridHTML()}</div>
          <div class="map-pins">${pins}</div>
        </div>
      `;
      fitMapView(currentCityOutlineAspect);
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
      else if (mapActiveView === "cityOutline") fitMapView(currentCityOutlineAspect);
      else if (mapActiveView === "city") fillMapView();
    });
  }

})();
