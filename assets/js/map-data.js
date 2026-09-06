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
   A city with `outline` + `outlineAspect` (Вінниця, Тернопіль) drills into
   its real municipal boundary with the generic placeholder sector grid
   clipped to that real shape instead of filling a plain rectangle. Neither
   city has real internal administrative districts to trace: Вінниця
   abolished its three raions in 2016, and Тернопіль has never had any — so
   unlike Kyiv's real district polygons, this is real outline + generic
   interior, not real interior boundaries. Both outlines were traced
   directly from reference contour images: assets/img/Тернопіль.jpeg
   (filled shape on a checkerboard/white background — thresholded, boundary-
   traced, simplified) and assets/img/Вінниця.jpeg (a real map screenshot
   with a red boundary line on a transparent-flattened-to-checkerboard
   background — the checkerboard was detected and flood-filled from the
   image edges to isolate the interior, then boundary-traced and simplified
   the same way). Вінниця's pin (вулиця Монастирська, 41) was positioned at
   the exact black dot marker in that same reference image, located by
   eroding away the surrounding text label until only the solid dot survived.
   Each location pin's x/y are percentage positions (0-100) within that
   city's zoomed-in view. All pins below are real addresses positioned as
   accurately as their city's own view allows; precise placement can be
   refined further once photos/exact geocoding are available. */
const MAP_DATA = [
  {
    id: "ternopil",
    name: "Тернопіль",
    x: 19.5,
    y: 34.9,
    outline: "M5.7,0.0 L13.1,1.8 L12.7,6.4 L15.3,9.2 L20.4,18.6 L22.9,20.1 L27.1,17.3 L28.7,17.3 L30.6,18.6 L33.1,16.5 L32.8,14.8 L33.8,14.0 L37.6,16.3 L37.9,15.5 L36.0,12.2 L36.9,11.5 L41.7,10.2 L42.4,11.7 L43.3,12.0 L48.4,8.9 L50.0,8.4 L51.6,9.2 L56.1,7.9 L60.5,10.4 L68.8,13.5 L76.4,12.0 L85.4,13.5 L95.9,28.0 L96.5,30.3 L100.0,30.5 L99.0,35.9 L95.9,39.7 L94.3,43.3 L95.2,45.0 L94.9,47.1 L92.7,47.3 L92.7,51.1 L91.4,54.7 L83.8,52.9 L82.5,54.5 L79.6,63.4 L75.5,68.2 L73.6,69.7 L68.5,72.0 L65.0,72.8 L60.2,72.8 L61.1,78.9 L62.1,77.9 L63.1,77.9 L66.9,81.2 L73.9,81.4 L80.3,82.4 L81.5,83.2 L82.2,84.7 L80.9,89.6 L79.6,89.3 L79.0,90.3 L76.4,90.3 L75.5,91.3 L72.9,90.6 L69.4,94.7 L76.4,96.4 L77.1,97.5 L79.0,97.7 L78.3,100.0 L63.4,97.5 L56.1,98.2 L54.1,97.7 L48.1,80.7 L42.0,74.0 L41.7,71.2 L43.3,68.4 L42.7,63.9 L42.0,63.4 L39.8,63.1 L32.2,59.8 L29.3,59.8 L28.3,62.1 L22.0,61.3 L21.3,61.1 L21.3,58.8 L14.6,57.5 L13.4,58.8 L12.4,58.5 L11.8,59.0 L10.5,63.4 L6.1,60.6 L4.8,54.2 L1.0,52.7 L2.2,50.9 L2.5,48.6 L0.3,39.7 L4.5,39.4 L9.6,36.6 L11.8,37.4 L12.4,36.9 L9.6,35.9 L6.4,33.1 L9.2,30.8 L9.6,28.0 L5.7,24.7 L4.1,22.1 L7.6,19.3 L6.7,18.3 L3.8,18.3 L0.3,10.4 L0.0,3.6 L5.1,2.3 Z",
    outlineAspect: 0.799,
    streets: [
      { id: "ternopil-1", name: "вулиця Над Ставом, 16", address: "Розділ 0x30", x: 37.5, y: 49.0, note: "" },
      { id: "ternopil-2", name: "Підволочиське шосе, 5", address: "Розділ 0x29", x: 90, y: 49.0, note: "" }
    ]
  },
  {
    id: "vinnytsia",
    name: "Вінниця",
    x: 35.5,
    y: 38.9,
    outline: "M52.1,0.0 L53.5,0.8 L55.1,3.3 L56.0,6.6 L57.7,7.2 L60.0,10.5 L63.4,12.0 L66.7,11.5 L67.4,9.7 L67.4,7.7 L68.5,6.6 L69.4,6.6 L72.0,9.0 L77.1,5.9 L79.9,6.6 L79.9,5.4 L80.6,4.3 L82.0,3.8 L84.2,0.5 L84.7,0.8 L85.4,2.6 L84.3,3.8 L81.7,13.3 L83.1,13.3 L85.7,11.5 L86.3,12.5 L84.9,17.1 L93.7,25.3 L96.3,24.0 L96.8,24.8 L97.0,28.1 L96.1,29.2 L92.6,27.1 L91.5,33.5 L90.8,34.3 L87.0,33.0 L84.2,40.2 L85.4,42.2 L89.6,44.2 L93.7,49.1 L96.5,50.4 L99.3,52.7 L100.0,54.2 L96.5,65.7 L92.1,62.9 L90.5,63.2 L88.4,60.4 L84.7,58.3 L82.9,61.6 L82.9,65.2 L82.0,67.0 L78.9,68.5 L78.7,74.2 L78.0,77.0 L78.7,81.1 L77.5,82.9 L73.8,81.3 L70.2,83.4 L69.5,84.9 L67.8,84.4 L65.3,87.0 L63.2,83.4 L62.0,79.8 L61.8,83.6 L60.7,84.7 L60.0,83.9 L59.0,84.7 L58.3,86.7 L56.9,88.0 L54.2,87.2 L52.1,88.5 L48.6,88.7 L45.1,85.4 L43.5,85.9 L43.0,87.7 L47.0,93.9 L47.2,97.7 L46.0,99.2 L44.9,99.2 L43.5,97.7 L41.4,97.2 L36.6,100.0 L35.6,97.4 L36.6,90.5 L34.9,89.0 L35.7,84.1 L35.2,83.4 L34.3,85.9 L31.7,86.7 L29.8,82.9 L31.3,79.8 L31.2,78.5 L30.1,78.3 L29.6,80.1 L28.7,80.8 L27.5,79.8 L26.4,77.5 L23.6,77.2 L20.8,79.0 L18.3,82.4 L15.7,77.7 L14.4,76.7 L13.6,77.5 L12.7,76.5 L11.8,78.3 L13.7,81.1 L12.7,82.6 L11.6,82.4 L8.1,79.3 L8.1,76.5 L6.9,73.9 L6.5,70.3 L7.7,67.0 L6.2,65.0 L4.0,68.5 L2.8,68.8 L0.0,62.1 L2.6,59.3 L13.2,51.2 L13.9,47.3 L15.5,45.3 L15.5,43.7 L14.3,41.9 L14.6,40.7 L17.1,37.9 L18.5,38.9 L19.0,38.4 L19.7,40.7 L21.1,41.2 L22.2,42.7 L22.9,45.5 L24.1,45.8 L24.8,45.0 L27.3,46.8 L27.5,45.3 L26.6,42.2 L27.5,40.7 L28.2,40.7 L29.9,37.3 L32.9,39.9 L34.0,38.4 L36.3,39.6 L38.0,34.3 L37.3,32.5 L37.3,29.7 L36.1,26.3 L36.6,24.6 L35.2,22.5 L35.4,21.5 L36.3,20.2 L37.7,20.5 L38.4,19.4 L39.4,20.7 L40.3,20.7 L42.4,18.7 L44.0,15.9 L47.9,18.7 L48.4,12.5 L47.9,9.0 L48.6,2.8 L49.3,1.5 L50.4,1.8 Z",
    outlineAspect: 1.453,
    streets: [
      { id: "vinnytsia-1", name: "вулиця Монастирська, 41", address: "Розділ 0x32", x: 51.1, y: 54.1, note: "" }
    ]
  },
  {
    id: "kyiv",
    name: "Київ",
    x: 46.9,
    y: 23.6,
    realDistricts: true,
    streets: [
      { id: "kyiv-1", name: "вулиця Максима Берлинського, 27", address: "Житло Аліси", district: "podilskyi", x: 36, y: 21, note: "" },
      { id: "kyiv-2", name: "вулиця Князів Острозьких, 30", address: "Відділок поліції", district: "pecherskyi", x: 57, y: 42, note: "" },
      { id: "kyiv-3", name: "Дніпровська набережна, 1", address: "Житло Антона", district: "dniprovskyi", x: 61, y: 32, note: "" },
      { id: "kyiv-4", name: "вулиця Левка Лук'яненка, 15Г", address: "Житло Марка", district: "podilskyi", x: 32, y: 20, note: "" },
      { id: "kyiv-5", name: "вулиця Антоновича, 44", address: "Житло Вадима", district: "holosiivskyi", x: 47.5, y: 45, note: "" },
      { id: "kyiv-6", name: "вулиця Андріївська, 9", address: "Розділ 0x35", district: "podilskyi", x: 46.5, y: 33.5, note: "" }
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
