/* Data for the terminal "map" command.
   City x/y are percentage positions on the Ukraine map (0-100 viewBox, derived
   from real coordinates — see UKRAINE_OUTLINE in main.js).
   A city with `unavailable: true` shows `errorMessage` instead of drilling in
   (used for Харків right now, standing in for data still being prepared).
   Street x/y are percentage positions within that city's zoomed-in district
   view (0-100) — placeholder positions/notes except Kyiv's three real
   addresses below. Swap in real coordinates/notes as they're provided; the
   structure stays the same. */
const MAP_DATA = [
  {
    id: "lviv",
    name: "Львів",
    x: 12,
    y: 32,
    streets: [
      { id: "lviv-1", name: "Вулиця (уточнюється)", address: "Львів, Україна", x: 32, y: 40, note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { id: "lviv-2", name: "Вулиця (уточнюється)", address: "Львів, Україна", x: 66, y: 62, note: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." }
    ]
  },
  {
    id: "ternopil",
    name: "Тернопіль",
    x: 25,
    y: 40,
    streets: [
      { id: "ternopil-1", name: "Вулиця (уточнюється)", address: "Тернопіль, Україна", x: 40, y: 35, note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { id: "ternopil-2", name: "Вулиця (уточнюється)", address: "Тернопіль, Україна", x: 60, y: 65, note: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." }
    ]
  },
  {
    id: "vinnytsia",
    name: "Вінниця",
    x: 36,
    y: 39,
    streets: [
      { id: "vinnytsia-1", name: "Вулиця (уточнюється)", address: "Вінниця, Україна", x: 35, y: 38, note: "Duis aute irure dolor in reprehenderit in voluptate velit esse." },
      { id: "vinnytsia-2", name: "Вулиця (уточнюється)", address: "Вінниця, Україна", x: 68, y: 58, note: "Excepteur sint occaecat cupidatat non proident, sunt in culpa." }
    ]
  },
  {
    id: "kyiv",
    name: "Київ",
    x: 47,
    y: 24,
    streets: [
      { id: "kyiv-1", name: "вулиця Максима Берлинського, 27", address: "Київ, Україна, 02000", x: 28, y: 28, note: "" },
      { id: "kyiv-2", name: "вулиця Князів Острозьких, 30", address: "Київ, Україна, 01010", x: 55, y: 50, note: "" },
      { id: "kyiv-3", name: "Дніпровська набережна, 1", address: "Київ, Україна, 02000", x: 76, y: 62, note: "" }
    ]
  },
  {
    id: "kharkiv",
    name: "Харків",
    x: 79,
    y: 30,
    unavailable: true,
    errorMessage: "Не вдалося завантажити дані. В процесі створення.",
    streets: []
  }
];
