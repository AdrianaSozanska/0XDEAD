/* Data for the terminal "map" command.
   City x/y are percentage positions on the stylized Ukraine map (0-100 viewBox).
   Street x/y are percentage positions within that city's zoomed-in view (0-100) —
   placeholder positions and lorem ipsum notes for now. Swap in the real
   coordinates/notes once they're provided; the structure stays the same. */
const MAP_DATA = [
  {
    id: "lviv",
    name: "Львів",
    x: 12,
    y: 32,
    streets: [
      { id: "lviv-1", name: "Вулиця (уточнюється)", x: 32, y: 40, note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { id: "lviv-2", name: "Вулиця (уточнюється)", x: 66, y: 62, note: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." }
    ]
  },
  {
    id: "ternopil",
    name: "Тернопіль",
    x: 25,
    y: 40,
    streets: [
      { id: "ternopil-1", name: "Вулиця (уточнюється)", x: 40, y: 35, note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { id: "ternopil-2", name: "Вулиця (уточнюється)", x: 60, y: 65, note: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." }
    ]
  },
  {
    id: "vinnytsia",
    name: "Вінниця",
    x: 36,
    y: 39,
    streets: [
      { id: "vinnytsia-1", name: "Вулиця (уточнюється)", x: 35, y: 38, note: "Duis aute irure dolor in reprehenderit in voluptate velit esse." },
      { id: "vinnytsia-2", name: "Вулиця (уточнюється)", x: 68, y: 58, note: "Excepteur sint occaecat cupidatat non proident, sunt in culpa." }
    ]
  },
  {
    id: "kyiv",
    name: "Київ",
    x: 47,
    y: 24,
    streets: [
      { id: "kyiv-1", name: "Вулиця (уточнюється)", x: 30, y: 30, note: "Curabitur non nulla sit amet nisl tempus convallis quis ac lectus." },
      { id: "kyiv-2", name: "Вулиця (уточнюється)", x: 62, y: 60, note: "Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus." }
    ]
  },
  {
    id: "kharkiv",
    name: "Харків",
    x: 79,
    y: 30,
    streets: [
      { id: "kharkiv-1", name: "Вулиця (уточнюється)", x: 38, y: 42, note: "Nulla porttitor accumsan tincidunt. Vivamus magna justo." },
      { id: "kharkiv-2", name: "Вулиця (уточнюється)", x: 62, y: 30, note: "Pellentesque in ipsum id orci porta dapibus." }
    ]
  }
];
