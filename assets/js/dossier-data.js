/* Police dossier on the syndicate cell from the book's world.
   Placeholder lorem ipsum notes — swap in real world-building content later.
   statusClass: "active" | "deceased" | "redacted" (redacted = no data on file)

   DOSSIER_NETWORK (below) drives the section's node/connection-line layout
   — see the comment above it for how nodes, ghosts, and edges work. */
const DOSSIER_FILES = [
  {
    id: "holovnyi",
    caseNo: "07",
    name: "Головний",
    roleTag: "Курує кілька угруповань",
    statusLabel: "ІСНУВАННЯ ПІДТВЕРДЖЕНО. ОСОБА НЕВІДОМА",
    statusClass: "redacted",
    notes: []
  },
  {
    id: "vadym",
    caseNo: "01",
    name: "Вадим",
    roleTag: "Права рука Антона",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    notes: [
      "Виконує накази Антона без зайвих питань — і стежить, щоб інші теж не ставили.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ]
  },
  {
    id: "anton",
    caseNo: "02",
    name: "Антон",
    roleTag: "Кодер групи",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    notes: [
      "Пише код, яким угруповання пробиває периметри чужих систем. Немає мережі, яку б він не міг прочитати як відкриту книгу.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    ]
  },
  {
    id: "mark",
    caseNo: "03",
    name: "Марк",
    roleTag: "Колишній член групи",
    statusLabel: "СТАТУС: ЛІКВІДОВАНО",
    statusClass: "deceased",
    notes: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Був частиною групи до інциденту.",
      "Тіло виявлено. Причина смерті — не встановлена. Файл залишається відкритим."
    ]
  },
  {
    id: "mykola",
    caseNo: "04",
    name: "Микола",
    roleTag: "Роль уточнюється",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    notes: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    ]
  },
  {
    id: "alisa",
    caseNo: "05",
    name: "Аліса",
    roleTag: "Роль невідома",
    statusLabel: "ОСОБУ ВСТАНОВЛЕНО. ЗВ'ЯЗОК З УГРУПОВАННЯМ НЕ ПІДТВЕРДЖЕНО",
    statusClass: "redacted",
    notes: []
  },
  {
    id: "kurator",
    caseNo: "06",
    name: "Куратор",
    roleTag: "Роль невідома",
    statusLabel: "ІСНУВАННЯ ПІДТВЕРДЖЕНО. ОСОБА НЕВІДОМА",
    statusClass: "redacted",
    notes: []
  }
];

/* Node/connection layout for the dossier network diagram (// 03 section).
   Node x/y are percentage positions (0-100) within the diagram's 100x100
   viewBox — same fixed-viewBox + percent-positioned-HTML pattern used by
   the terminal map (see fitMapView() in main.js), just without the
   aspect-ratio-fitting step since this diagram isn't tied to real geometry.
   Every id must match a DOSSIER_FILES entry above.

   `ghosts` are small non-interactive stub nodes with no dossier file of
   their own — they represent the other groups Головний also runs, shown
   only to make that fact visible on the board. `ghostLinks` draws a faint
   dashed line from Головний to each one.

   Each edge in `edges` connects two real dossier nodes. `confirmed: false`
   draws a dashed, dimmer line instead of a solid one — used for every line
   touching Аліса, since the police only have her connection to the group
   from Марк's testimony, not confirmed evidence. */
const DOSSIER_NETWORK = {
  nodes: [
    { id: "holovnyi", x: 50, y: 10 },
    { id: "kurator", x: 50, y: 34 },
    { id: "anton", x: 40, y: 58 },
    { id: "mark", x: 68, y: 63 },
    { id: "vadym", x: 25, y: 87 },
    { id: "mykola", x: 47, y: 87 },
    { id: "alisa", x: 75, y: 90 }
  ],
  ghosts: [
    { id: "ghost-1", x: 20, y: 10 },
    { id: "ghost-2", x: 80, y: 10 }
  ],
  ghostLinks: ["ghost-1", "ghost-2"],
  edges: [
    { from: "holovnyi", to: "kurator", confirmed: true },
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
