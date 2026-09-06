/* Police dossier on the syndicate cell from the book's world.
   Placeholder lorem ipsum notes — swap in real world-building content later.
   statusClass: "active" | "deceased" | "redacted" — just controls the status
   badge's color and hides it for "redacted" (no clean short status to show).
   It's independent from whether `notes` renders normally: set `blackout:
   true` on an entry to show three black redaction bars instead of its
   `notes` (for a file with truly nothing on it) — none currently use this;
   Аліса and Куратор are "redacted" (identity unknown) but still show a full
   field list, same shape as everyone else, ending in a "Коментар:" line.

   DOSSIER_NETWORK (below) drives the section's node/connection-line layout
   — see the comment above it for how nodes, ghosts, and edges work. */
const DOSSIER_FILES = [
  {
    id: "vadym",
    caseNo: "01",
    name: "Вадим Ярчук",
    roleTag: "Права рука Антона",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    photo: "assets/img/ГрупаВадим.jpeg",
    notes: [
      "Місто народження: м.Конотоп, Сумщина",
      "Сімейний стан: розлучений",
      "Освіта: вища, інформатична",
      "Місце роботи (навчання): не працює",
      "Підозра: немає",
      "Розшук: в розшуку не перебуває",
      "Відомий у мережі за нікнеймом: rad0n",
      "Коментар: Ймовірно, координував дії групи до та під час інциденту, про який йдеться у справі [REDACTED]"
    ]
  },
  {
    id: "anton",
    caseNo: "03",
    name: "Антон Ткаченко",
    roleTag: "Лідер групи",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    photo: "assets/img/ГрупаАнтон_new.jpeg",
    notes: [
      "Місто народження: м.Київ",
      "Сімейний стан: не одружений",
      "Освіта: вища",
      "Місце роботи (навчання): не працює",
      "Підозра: немає",
      "Розшук: в розшуку не перебуває",
      "Відомий у мережі за нікнеймом: xaerith",
      "Коментар: За оперативною інформацією, здійснює координацію групи після інциденту, про який йдеться у справі [REDACTED]. Основні завдання, ймовірно, здебільшого обмежуються створенням шкідливого програмного забезпечення (malicious software)."
    ]
  },
  {
    id: "mark",
    caseNo: "02",
    name: "Марк Гуменюк",
    roleTag: "Фінансові операції групи",
    statusLabel: "СТАТУС: ПОМЕР",
    statusClass: "deceased",
    photo: "assets/img/ГрупаМарк.jpeg",
    notes: [
      "Місто народження: м. Львів",
      "Сімейний стан: не одружений",
      "Освіта: вища, економічна",
      "Місце роботи (навчання): ФОП з надання фінансового консультування",
      "Підозра: ст. 209 ч. 3 ККУ — Легалізація (відмивання) майна, одержаного злочинним шляхом, вчинена організованою групою.",
      "Розшук: Розшук призупинено у зв'язку зі встановленням факту смерті.",
      "Відомий у мережі за нікнеймом: caterpillar99",
      "Коментар: [REDACTED]"
    ]
  },
  {
    id: "mykola",
    caseNo: "04",
    name: "Микола Шепель",
    roleTag: "Роль уточнюється",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    notes: [
      "Місто народження: м.Житомир",
      "Сімейний стан: не одружений",
      "Освіта: незакінчена вища",
      "Місце роботи (навчання): не працює",
      "Підозра: немає",
      "Розшук: в розшуку не перебуває",
      "Відомий у мережі за нікнеймом: kolOFF",
      "Коментар: немає"
    ]
  },
  {
    id: "alisa",
    caseNo: "05",
    name: "Аліса",
    roleTag: "Роль невідома",
    statusLabel: "ОСОБУ НЕ ВСТАНОВЛЕНО",
    statusClass: "redacted",
    notes: [
      "Місто народження: не встановлено",
      "Сімейний стан: не встановлено",
      "Освіта: не встановлено",
      "Місце роботи (навчання): не встановлено",
      "Підозра: не встановлено",
      "Розшук: не встановлено",
      "Відома у мережі за нікнеймом: ashln",
      "Коментар: ОСОБУ НЕ ВСТАНОВЛЕНО. ЗВ'ЯЗОК З УГРУПОВАННЯМ НЕ ПІДТВЕРДЖЕНО."
    ]
  },
  {
    id: "kurator",
    caseNo: "06",
    name: "Куратор",
    roleTag: "Керує кіберзлочинними підрозділами",
    statusLabel: "ОСОБА НЕВІДОМА",
    statusClass: "redacted",
    notes: [
      "Місто народження: не встановлено",
      "Сімейний стан: не встановлено",
      "Освіта: не встановлено",
      "Місце роботи (навчання): не встановлено",
      "Підозра: керівництво кіберзлочинними підрозділами",
      "Розшук: не оголошено",
      "Відомий у мережі за нікнеймом: stern",
      "Коментар: ІСНУВАННЯ ПІДТВЕРДЖЕНО. ОСОБА НЕВІДОМА."
    ]
  }
];

/* Node/connection layout for the dossier network diagram (// 03 section).
   Node x/y are percentage positions (0-100) within the diagram's 100x100
   viewBox — same fixed-viewBox + percent-positioned-HTML pattern used by
   the terminal map (see fitMapView() in main.js), just without the
   aspect-ratio-fitting step since this diagram isn't tied to real geometry.
   Every id must match a DOSSIER_FILES entry above.

   `ghosts` are small non-interactive stub nodes with no dossier file of
   their own — each has a `from` (a real node id) it draws a faint dashed
   line to, representing another group that person also has a hand in:
   Куратор runs this cell alongside others (two stubs), and Марк handles
   money for more than just this one (one stub).

   Each edge in `edges` connects two real dossier nodes. `confirmed: false`
   draws a dashed, dimmer line instead of a solid one — used for every line
   touching Аліса, since the police only have her connection to the group
   from Марк's testimony, not confirmed evidence. */
const DOSSIER_NETWORK = {
  nodes: [
    { id: "kurator", x: 50, y: 12 },
    { id: "anton", x: 38, y: 46 },
    { id: "mark", x: 66, y: 48 },
    { id: "vadym", x: 46, y: 82 },
    { id: "mykola", x: 24, y: 82 },
    { id: "alisa", x: 74, y: 86 }
  ],
  ghosts: [
    { id: "ghost-kurator-1", x: 20, y: 12, from: "kurator" },
    { id: "ghost-kurator-2", x: 80, y: 12, from: "kurator" },
    { id: "ghost-mark-1", x: 90, y: 34, from: "mark" }
  ],
  edges: [
    { from: "kurator", to: "anton", confirmed: true },
    { from: "kurator", to: "vadym", confirmed: true },
    { from: "kurator", to: "mark", confirmed: true },
    { from: "anton", to: "mykola", confirmed: true },
    { from: "anton", to: "vadym", confirmed: true },
    { from: "anton", to: "mark", confirmed: true },
    { from: "anton", to: "alisa", confirmed: false },
    { from: "vadym", to: "mark", confirmed: true },
    { from: "vadym", to: "alisa", confirmed: false },
    { from: "mark", to: "alisa", confirmed: false }
  ]
};
