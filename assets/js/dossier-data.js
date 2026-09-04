/* Police dossier on the syndicate cell from the book's world.
   Placeholder lorem ipsum notes — swap in real world-building content later.
   statusClass: "active" | "deceased" | "redacted" (redacted = no data on file) */
const DOSSIER_FILES = [
  {
    id: "vadym",
    caseNo: "01",
    name: "Вадим",
    roleTag: "Керівник операції",
    statusLabel: "СТАТУС: АКТИВНИЙ",
    statusClass: "active",
    notes: [
      "Очолює цю частину угруповання. У синдикаті його слово остаточне — рішення не обговорюються двічі.",
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
    statusLabel: "ОСОБУ ВСТАНОВЛЕНО. ДАНІ ВІДСУТНІ",
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
