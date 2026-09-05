/* Data for the terminal "map" command.
   City x/y are percentage positions (0-100) on the Ukraine map, derived from
   real coordinates with the same lon/lat -> percent transform used for
   UKRAINE_OUTLINE in main.js (see COUNTRY_ASPECT there for the aspect ratio
   that keeps the shape undistorted).
   A city with `unavailable: true` shows `errorMessage` instead of drilling in
   (used for Харків right now, standing in for data still being prepared).
   A city with `realDistricts: true` (currently only Київ) drills into its
   real administrative districts (see KYIV_DISTRICTS below) instead of the
   generic placeholder sector grid.
   Each location pin's x/y are percentage positions (0-100) within that
   city's zoomed-in view. Kyiv's three pins are real addresses positioned in
   their correct district; the other cities' pins are still placeholders. */
const MAP_DATA = [
  {
    id: "ternopil",
    name: "Тернопіль",
    x: 19.5,
    y: 34.9,
    streets: [
      { id: "ternopil-1", name: "Вулиця (уточнюється)", address: "Тернопіль, Україна", x: 40, y: 35, note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { id: "ternopil-2", name: "Вулиця (уточнюється)", address: "Тернопіль, Україна", x: 60, y: 65, note: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." }
    ]
  },
  {
    id: "vinnytsia",
    name: "Вінниця",
    x: 35.5,
    y: 38.9,
    streets: [
      { id: "vinnytsia-1", name: "Вулиця (уточнюється)", address: "Вінниця, Україна", x: 35, y: 38, note: "Duis aute irure dolor in reprehenderit in voluptate velit esse." },
      { id: "vinnytsia-2", name: "Вулиця (уточнюється)", address: "Вінниця, Україна", x: 68, y: 58, note: "Excepteur sint occaecat cupidatat non proident, sunt in culpa." }
    ]
  },
  {
    id: "kyiv",
    name: "Київ",
    x: 46.9,
    y: 23.6,
    realDistricts: true,
    streets: [
      { id: "kyiv-1", name: "вулиця Максима Берлинського, 27", address: "Київ, Україна, 02000", district: "podilskyi", x: 36, y: 21, note: "" },
      { id: "kyiv-2", name: "вулиця Князів Острозьких, 30", address: "Київ, Україна, 01010", district: "pecherskyi", x: 57, y: 42, note: "" },
      { id: "kyiv-3", name: "Дніпровська набережна, 1", address: "Київ, Україна, 02000", district: "dniprovskyi", x: 61, y: 32, note: "" }
    ]
  },
  {
    id: "kharkiv",
    name: "Харків",
    x: 78.6,
    y: 29.4,
    unavailable: true,
    errorMessage: "Не вдалося завантажити дані. В процесі створення.",
    streets: []
  }
];

/* Kyiv's 10 real administrative districts (адміністративні райони), traced
   from real boundary data and simplified for a clean vector look. Paths and
   centroids are percentage positions (0-100) within the Kyiv district view —
   see KYIV_ASPECT in main.js for the matching aspect ratio (Kyiv's bounding
   box is close to square, ~1:1). */
const KYIV_DISTRICTS = [
  { id: "holosiivskyi", name: "Голосіївський", centroid: [53.8, 68.5], path: "M68.9,96.6 L67.7,94.1 L69.2,93.6 L69.1,92.9 L67.2,91.1 L65.8,88.4 L66.0,86.8 L64.5,86.1 L63.2,82.6 L63.3,82.1 L68.4,82.3 L69.3,80.8 L69.3,77.5 L64.8,68.3 L60.5,63.0 L58.8,58.5 L58.8,55.8 L61.0,48.3 L59.9,46.0 L56.9,47.2 L54.7,49.8 L49.1,48.8 L47.3,43.1 L47.3,40.1 L44.8,39.4 L43.6,40.3 L46.2,42.9 L47.2,45.7 L45.2,44.7 L44.3,46.3 L45.8,47.7 L43.5,48.0 L42.1,50.8 L39.8,50.8 L39.8,52.6 L37.9,52.8 L36.8,54.7 L35.9,54.0 L34.6,55.1 L32.8,58.0 L34.0,59.1 L34.0,62.0 L36.5,62.6 L37.4,60.8 L39.2,61.1 L39.2,63.1 L40.0,63.4 L40.0,65.7 L40.9,66.5 L40.4,68.1 L43.1,67.6 L44.1,68.4 L42.6,69.9 L43.9,71.2 L46.1,70.1 L47.4,71.5 L50.3,72.5 L49.9,76.4 L50.9,76.9 L49.2,79.5 L52.4,79.4 L52.7,81.6 L51.7,83.6 L53.7,85.1 L53.5,87.9 L57.5,88.0 L59.2,91.5 L60.3,100.0 Z" },
  { id: "solomianskyi", name: "Солом'янський", centroid: [36.6, 44.2], path: "M30.3,34.8 L27.2,39.6 L32.3,48.4 L30.7,51.4 L34.6,55.1 L35.9,54.0 L36.8,54.7 L37.9,52.8 L39.8,52.6 L39.8,50.8 L41.9,50.9 L43.4,48.1 L45.8,47.7 L44.3,46.3 L45.2,44.7 L47.2,45.7 L46.2,42.9 L43.4,39.4 L40.6,38.1 L39.1,38.4 L39.0,37.0 Z" },
  { id: "sviatoshynskyi", name: "Святошинський", centroid: [15.5, 31.3], path: "M11.3,11.4 L11.2,15.5 L9.5,15.4 L9.1,17.2 L6.3,18.4 L4.0,21.4 L5.7,23.4 L5.7,24.5 L4.4,27.3 L2.6,28.1 L2.2,30.9 L3.6,32.1 L0.7,36.8 L1.8,39.9 L0.0,42.4 L1.5,44.3 L3.1,42.1 L5.6,43.5 L6.8,42.5 L7.6,38.0 L14.4,39.3 L18.2,38.4 L18.2,36.1 L19.5,38.4 L20.6,38.6 L21.0,41.8 L22.6,45.1 L26.6,48.9 L30.7,51.1 L32.3,48.3 L27.2,39.6 L30.3,34.8 L27.0,35.2 L27.0,27.6 L21.8,24.4 L21.3,19.9 Z" },
  { id: "darnytskyi", name: "Дарницький", centroid: [77.6, 50.0], path: "M59.5,61.2 L63.6,67.1 L64.2,66.5 L63.4,64.7 L65.8,64.1 L63.7,61.7 L67.5,60.5 L69.3,60.3 L69.5,62.0 L74.1,61.6 L74.4,62.9 L77.9,64.5 L80.6,62.6 L79.6,59.6 L80.9,58.8 L80.4,56.2 L81.3,55.2 L82.7,55.8 L83.0,57.0 L86.2,58.3 L87.9,57.8 L91.5,58.3 L90.8,57.4 L91.3,55.9 L90.7,55.8 L92.0,54.4 L91.2,53.4 L91.5,51.7 L93.7,51.0 L95.1,52.2 L97.6,52.8 L97.6,54.1 L98.9,54.3 L99.0,50.7 L100.0,49.1 L96.8,48.0 L95.0,46.5 L95.6,43.4 L94.0,41.6 L91.4,40.3 L91.4,39.1 L88.4,37.6 L85.6,35.1 L87.7,34.2 L87.0,33.5 L87.5,32.3 L85.6,32.2 L79.2,38.3 L59.9,46.0 L61.0,48.3 L58.8,55.8 Z" },
  { id: "dniprovskyi", name: "Дніпровський", centroid: [66.0, 34.5], path: "M88.5,28.4 L87.6,26.6 L86.7,27.3 L86.4,26.2 L85.5,26.3 L70.9,32.6 L70.2,33.4 L71.6,35.2 L71.6,37.2 L70.0,38.0 L69.7,37.1 L66.7,36.9 L67.1,35.8 L65.8,32.8 L63.7,31.4 L62.8,29.7 L63.7,28.0 L62.9,25.3 L55.1,25.3 L50.9,26.4 L52.1,28.5 L49.6,32.3 L49.6,34.8 L55.0,38.6 L58.7,43.1 L59.9,46.0 L79.4,38.2 L86.9,30.8 L86.2,30.0 L86.6,28.3 Z" },
  { id: "desnianskyi", name: "Деснянський", centroid: [75.8, 18.0], path: "M49.0,23.8 L50.9,26.4 L55.1,25.3 L62.9,25.3 L63.7,28.0 L62.8,29.7 L63.7,31.4 L65.8,32.8 L67.1,35.8 L66.7,36.9 L69.7,37.1 L70.0,38.0 L71.6,37.2 L71.6,35.2 L70.2,33.4 L70.9,32.6 L85.5,26.3 L84.8,24.3 L88.9,21.7 L88.7,19.7 L87.6,19.7 L87.7,19.0 L99.3,14.2 L98.0,6.8 L94.9,5.5 L92.6,2.9 L92.5,3.5 L90.4,4.0 L89.7,1.9 L87.6,2.0 L81.5,0.0 L82.0,1.3 L79.8,4.8 L80.8,9.3 L78.2,9.6 L78.0,7.6 L73.3,9.8 L72.3,10.4 L71.0,14.3 L69.6,14.8 L54.2,13.4 L53.5,15.0 L56.1,18.5 L55.9,19.7 L53.7,20.6 L51.1,17.6 Z" },
  { id: "obolonskyi", name: "Оболонський", centroid: [33.2, 13.6], path: "M52.0,28.4 L49.0,23.8 L49.5,20.7 L51.0,17.8 L50.1,14.9 L44.2,10.7 L43.0,6.1 L41.8,6.1 L41.5,4.9 L38.6,5.1 L38.3,1.7 L22.8,1.2 L22.7,4.6 L12.0,5.4 L17.8,8.9 L16.1,9.1 L16.3,10.5 L15.2,10.8 L15.2,11.8 L12.6,9.5 L10.4,9.6 L10.3,10.4 L20.0,19.3 L21.6,19.9 L31.8,18.5 L35.6,17.0 L36.4,23.9 L38.9,26.8 L41.4,27.4 L43.9,30.1 L44.9,28.4 Z" },
  { id: "podilskyi", name: "Подільський", centroid: [34.5, 25.7], path: "M51.0,36.1 L49.6,34.8 L49.6,32.3 L51.9,29.6 L52.0,28.4 L44.9,28.4 L43.9,30.1 L41.4,27.4 L38.9,26.8 L36.4,23.9 L35.6,17.0 L31.9,18.4 L21.3,19.9 L21.8,24.4 L29.8,29.9 L32.7,30.2 L33.7,27.7 L34.6,27.6 L37.0,28.5 L38.3,30.2 L40.5,28.8 L42.2,31.1 L43.8,31.5 L43.5,33.0 L44.7,33.1 L45.1,32.3 L46.3,33.4 L45.6,34.2 L46.0,35.3 L48.8,34.9 L50.4,36.7 Z" },
  { id: "pecherskyi", name: "Печерський", centroid: [52.8, 43.3], path: "M59.9,46.0 L58.7,43.1 L55.0,38.6 L51.0,36.1 L50.4,36.7 L49.3,36.1 L48.4,39.4 L47.3,40.2 L47.3,43.1 L49.1,47.7 L48.7,48.5 L54.7,49.8 L56.9,47.2 Z" },
  { id: "shevchenkivskyi", name: "Шевченківський", centroid: [37.9, 33.7], path: "M27.0,27.7 L27.0,35.2 L30.4,34.8 L39.0,37.0 L39.1,38.4 L41.0,38.2 L43.4,39.4 L43.6,40.3 L44.8,39.4 L47.3,40.1 L48.4,39.4 L48.4,37.8 L49.4,36.8 L49.1,35.2 L47.5,34.8 L47.0,35.5 L46.5,34.8 L46.0,35.3 L45.6,34.2 L46.3,33.4 L45.1,32.3 L44.7,33.1 L43.5,33.0 L43.8,31.5 L42.2,31.1 L40.5,28.8 L38.3,30.2 L37.0,28.5 L34.6,27.6 L33.7,27.7 L32.3,30.3 L29.9,30.0 Z" }
];
