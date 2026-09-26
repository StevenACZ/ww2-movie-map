export const STATUSES = [
  "neutral",
  "war",
  "entente",
  "central",
  "allies",
  "axis",
  "soviet",
  "occupied-central",
  "occupied-axis",
  "occupied-allies",
  "occupied-soviet",
  "civil-war",
] as const;
export type Status = (typeof STATUSES)[number];
export type Entry = [string, Status];
type Follow = { follow: string; from?: string };
type Piece = Entry | Follow;

export type CountrySpec = {
  en: string;
  es: string;
  rank?: 1 | 2 | 3;
  timeline: Piece[];
};

const f = (follow: string, from?: string): Follow => ({ follow, from });

const WW1_END = "1918-11-11";

const COUNTRIES: Record<string, CountrySpec> = {
  germany: {
    en: "Germany",
    es: "Alemania",
    rank: 1,
    timeline: [
      ["1914-08-01", "central"],
      [WW1_END, "neutral"],
      ["1939-09-01", "axis"],
      ["1945-05-08", "occupied-allies"],
    ],
  },
  "austria-hungary": {
    en: "Austria-Hungary",
    es: "Austria-Hungría",
    rank: 1,
    timeline: [
      ["1914-07-28", "central"],
      ["1918-11-04", "neutral"],
    ],
  },
  "ottoman-empire": {
    en: "Ottoman Empire",
    es: "Imperio otomano",
    rank: 1,
    timeline: [
      ["1914-11-01", "central"],
      ["1918-10-31", "neutral"],
    ],
  },
  bulgaria: {
    en: "Bulgaria",
    es: "Bulgaria",
    rank: 3,
    timeline: [
      ["1915-10-14", "central"],
      ["1918-09-30", "neutral"],
      ["1941-03-01", "axis"],
      ["1944-09-08", "allies"],
    ],
  },
  france: {
    en: "France",
    es: "Francia",
    rank: 1,
    timeline: [
      ["1914-08-03", "entente"],
      [WW1_END, "neutral"],
      ["1939-09-03", "allies"],
      ["1940-06-22", "occupied-axis"],
      ["1944-08-25", "allies"],
    ],
  },
  uk: {
    en: "United Kingdom",
    es: "Reino Unido",
    rank: 1,
    timeline: [
      ["1914-08-04", "entente"],
      [WW1_END, "neutral"],
      ["1939-09-03", "allies"],
    ],
  },
  russia: {
    en: "Russian Empire",
    es: "Imperio ruso",
    rank: 1,
    timeline: [
      ["1914-08-01", "entente"],
      ["1917-11-07", "civil-war"],
      ["1922-10-25", "neutral"],
    ],
  },
  ussr: {
    en: "Soviet Union",
    es: "Unión Soviética",
    rank: 1,
    timeline: [
      ["1917-11-07", "civil-war"],
      ["1922-10-25", "neutral"],
      ["1939-05-11", "war"],
      ["1939-09-17", "soviet"],
      ["1941-06-22", "allies"],
    ],
  },
  italy: {
    en: "Italy",
    es: "Italia",
    rank: 1,
    timeline: [
      ["1915-05-24", "entente"],
      [WW1_END, "neutral"],
      ["1935-10-03", "war"],
      ["1936-05-09", "neutral"],
      ["1940-06-10", "axis"],
      ["1943-09-08", "occupied-axis"],
      ["1945-05-02", "allies"],
    ],
  },
  usa: {
    en: "United States",
    es: "Estados Unidos",
    rank: 1,
    timeline: [
      ["1917-04-06", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-08", "allies"],
    ],
  },
  japan: {
    en: "Japan",
    es: "Japón",
    rank: 1,
    timeline: [
      ["1914-08-23", "entente"],
      [WW1_END, "neutral"],
      ["1937-07-07", "axis"],
      ["1945-09-02", "occupied-allies"],
    ],
  },
  china: {
    en: "China",
    es: "China",
    rank: 1,
    timeline: [
      ["1917-08-14", "entente"],
      [WW1_END, "neutral"],
      ["1927-08-01", "civil-war"],
      ["1937-07-07", "allies"],
    ],
  },
  serbia: {
    en: "Serbia",
    es: "Serbia",
    rank: 3,
    timeline: [
      ["1914-07-28", "entente"],
      ["1915-11-24", "occupied-central"],
      ["1918-11-01", "entente"],
      [WW1_END, "neutral"],
    ],
  },
  montenegro: {
    en: "Montenegro",
    es: "Montenegro",
    timeline: [
      ["1914-08-05", "entente"],
      ["1916-01-25", "occupied-central"],
      [WW1_END, "neutral"],
    ],
  },
  belgium: {
    en: "Belgium",
    es: "Bélgica",
    rank: 3,
    timeline: [
      ["1914-08-04", "entente"],
      ["1914-08-20", "occupied-central"],
      [WW1_END, "neutral"],
      ["1940-05-10", "allies"],
      ["1940-05-28", "occupied-axis"],
      ["1944-09-03", "allies"],
    ],
  },
  luxembourg: {
    en: "Luxembourg",
    es: "Luxemburgo",
    timeline: [
      ["1914-08-02", "occupied-central"],
      [WW1_END, "neutral"],
      ["1940-05-10", "occupied-axis"],
      ["1944-09-10", "allies"],
    ],
  },
  netherlands: {
    en: "Netherlands",
    es: "Países Bajos",
    rank: 3,
    timeline: [
      ["1940-05-10", "allies"],
      ["1940-05-15", "occupied-axis"],
      ["1945-05-05", "allies"],
    ],
  },
  denmark: {
    en: "Denmark",
    es: "Dinamarca",
    rank: 3,
    timeline: [
      ["1940-04-09", "occupied-axis"],
      ["1945-05-05", "allies"],
    ],
  },
  greenland: {
    en: "Greenland",
    es: "Groenlandia",
    rank: 3,
    timeline: [["1941-04-09", "allies"]],
  },
  iceland: {
    en: "Iceland",
    es: "Islandia",
    rank: 3,
    timeline: [["1940-05-10", "occupied-allies"]],
  },
  norway: {
    en: "Norway",
    es: "Noruega",
    rank: 2,
    timeline: [
      ["1940-04-09", "allies"],
      ["1940-06-10", "occupied-axis"],
      ["1945-05-08", "allies"],
    ],
  },
  sweden: { en: "Sweden", es: "Suecia", rank: 2, timeline: [] },
  switzerland: { en: "Switzerland", es: "Suiza", rank: 3, timeline: [] },
  spain: {
    en: "Spain",
    es: "España",
    rank: 2,
    timeline: [
      ["1936-07-17", "civil-war"],
      ["1939-04-01", "neutral"],
    ],
  },
  andorra: { en: "Andorra", es: "Andorra", timeline: [] },
  portugal: {
    en: "Portugal",
    es: "Portugal",
    rank: 3,
    timeline: [
      ["1916-03-09", "entente"],
      [WW1_END, "neutral"],
    ],
  },
  ireland: {
    en: "Ireland",
    es: "Irlanda",
    rank: 3,
    timeline: [
      ["1919-01-21", "civil-war"],
      ["1921-07-11", "neutral"],
      ["1922-06-28", "civil-war"],
      ["1923-05-24", "neutral"],
    ],
  },
  malta: { en: "Malta", es: "Malta", timeline: [f("uk")] },
  austria: {
    en: "Austria",
    es: "Austria",
    rank: 3,
    timeline: [f("germany", "1938-03-13")],
  },
  hungary: {
    en: "Hungary",
    es: "Hungría",
    rank: 2,
    timeline: [
      ["1919-04-16", "war"],
      ["1919-08-03", "neutral"],
      ["1941-06-27", "axis"],
      ["1945-04-04", "occupied-soviet"],
    ],
  },
  czechoslovakia: {
    en: "Czechoslovakia",
    es: "Checoslovaquia",
    rank: 3,
    timeline: [
      ["1939-03-15", "occupied-axis"],
      ["1945-05-09", "allies"],
    ],
  },
  danzig: {
    en: "Free City of Danzig",
    es: "Ciudad Libre de Dánzig",
    timeline: [
      ["1939-09-01", "axis"],
      ["1945-03-30", "occupied-soviet"],
    ],
  },
  poland: {
    en: "Poland",
    es: "Polonia",
    rank: 2,
    timeline: [
      ["1919-02-14", "war"],
      ["1921-03-18", "neutral"],
      ["1939-09-01", "allies"],
      ["1939-09-28", "occupied-axis"],
      ["1945-01-17", "allies"],
    ],
  },
  romania: {
    en: "Romania",
    es: "Rumania",
    rank: 2,
    timeline: [
      ["1916-08-27", "entente"],
      ["1916-12-06", "occupied-central"],
      ["1918-11-10", "entente"],
      [WW1_END, "neutral"],
      ["1919-04-16", "war"],
      ["1919-08-03", "neutral"],
      ["1941-06-22", "axis"],
      ["1944-08-23", "allies"],
    ],
  },
  yugoslavia: {
    en: "Yugoslavia",
    es: "Yugoslavia",
    rank: 2,
    timeline: [
      ["1941-04-06", "allies"],
      ["1941-04-17", "occupied-axis"],
      ["1944-10-20", "allies"],
    ],
  },
  greece: {
    en: "Greece",
    es: "Grecia",
    rank: 2,
    timeline: [
      ["1917-06-27", "entente"],
      [WW1_END, "neutral"],
      ["1919-05-15", "war"],
      ["1922-10-11", "neutral"],
      ["1940-10-28", "allies"],
      ["1941-04-27", "occupied-axis"],
      ["1944-10-12", "allies"],
    ],
  },
  albania: {
    en: "Albania",
    es: "Albania",
    rank: 3,
    timeline: [
      ["1939-04-07", "occupied-axis"],
      ["1944-11-29", "allies"],
    ],
  },
  turkey: {
    en: "Turkey",
    es: "Turquía",
    rank: 2,
    timeline: [
      ["1919-05-15", "war"],
      ["1922-10-11", "neutral"],
      ["1945-02-23", "allies"],
    ],
  },
  finland: {
    en: "Finland",
    es: "Finlandia",
    rank: 2,
    timeline: [
      ["1914-08-01", "entente"],
      ["1917-12-06", "neutral"],
      ["1918-01-27", "civil-war"],
      ["1918-05-15", "neutral"],
      ["1939-11-30", "war"],
      ["1940-03-13", "neutral"],
      ["1941-06-25", "axis"],
      ["1944-09-19", "allies"],
    ],
  },
  estonia: {
    en: "Estonia",
    es: "Estonia",
    rank: 3,
    timeline: [
      ["1918-11-28", "war"],
      ["1920-02-02", "neutral"],
      ["1940-06-17", "occupied-soviet"],
      ["1941-08-28", "occupied-axis"],
      ["1944-09-22", "occupied-soviet"],
    ],
  },
  latvia: {
    en: "Latvia",
    es: "Letonia",
    rank: 3,
    timeline: [
      ["1918-12-05", "war"],
      ["1920-08-11", "neutral"],
      ["1940-06-17", "occupied-soviet"],
      ["1941-07-01", "occupied-axis"],
      ["1944-10-13", "occupied-soviet"],
    ],
  },
  lithuania: {
    en: "Lithuania",
    es: "Lituania",
    rank: 3,
    timeline: [
      ["1918-12-01", "war"],
      ["1920-11-30", "neutral"],
      ["1940-06-15", "occupied-soviet"],
      ["1941-06-24", "occupied-axis"],
      ["1944-07-13", "occupied-soviet"],
    ],
  },
  mongolia: {
    en: "Mongolia",
    es: "Mongolia",
    rank: 2,
    timeline: [
      ["1939-05-11", "war"],
      ["1939-09-16", "neutral"],
      ["1945-08-10", "allies"],
    ],
  },
  tibet: { en: "Tibet", es: "Tíbet", rank: 3, timeline: [] },
  xinjiang: { en: "Xinjiang", es: "Sinkiang", rank: 3, timeline: [] },
  afghanistan: {
    en: "Afghanistan",
    es: "Afganistán",
    rank: 3,
    timeline: [],
  },
  bhutan: { en: "Bhutan", es: "Bután", timeline: [] },
  nepal: {
    en: "Nepal",
    es: "Nepal",
    timeline: [["1939-09-04", "allies"]],
  },
  iran: {
    en: "Iran (Persia)",
    es: "Irán (Persia)",
    rank: 2,
    timeline: [
      ["1941-08-25", "occupied-allies"],
      ["1943-09-09", "allies"],
    ],
  },
  "saudi-arabia": {
    en: "Saudi Arabia",
    es: "Arabia Saudí",
    rank: 2,
    timeline: [["1945-02-28", "allies"]],
  },
  egypt: {
    en: "Egypt",
    es: "Egipto",
    rank: 2,
    timeline: [
      ["1914-12-18", "entente"],
      [WW1_END, "neutral"],
      ["1945-02-24", "allies"],
    ],
  },
  iraq: {
    en: "Iraq",
    es: "Irak",
    rank: 3,
    timeline: [
      f("uk"),
      ["1932-10-03", "neutral"],
      ["1941-05-02", "war"],
      ["1941-05-31", "occupied-allies"],
      ["1943-01-17", "allies"],
    ],
  },
  palestine: {
    en: "Mandatory Palestine",
    es: "Palestina (Mandato británico)",
    timeline: [f("uk")],
  },
  transjordan: { en: "Transjordan", es: "Transjordania", timeline: [f("uk")] },
  syria: {
    en: "Syria (French Mandate)",
    es: "Siria (Mandato francés)",
    rank: 3,
    timeline: [f("france"), ["1941-07-14", "allies"]],
  },
  lebanon: { en: "Lebanon", es: "Líbano", timeline: [f("syria")] },
  kuwait: { en: "Kuwait", es: "Kuwait", timeline: [f("uk")] },
  qatar: { en: "Qatar", es: "Catar", timeline: [f("uk")] },
  "trucial-states": {
    en: "Trucial States",
    es: "Estados de la Tregua",
    timeline: [f("uk")],
  },
  oman: { en: "Muscat and Oman", es: "Mascate y Omán", timeline: [f("uk")] },
  aden: { en: "Aden", es: "Adén", timeline: [f("uk")] },
  "british-raj": {
    en: "British Raj",
    es: "Raj británico",
    rank: 2,
    timeline: [f("uk")],
  },
  burma: {
    en: "Burma",
    es: "Birmania",
    rank: 2,
    timeline: [
      f("british-raj"),
      ["1942-05-20", "occupied-axis"],
      ["1945-05-03", "allies"],
    ],
  },
  ceylon: { en: "Ceylon", es: "Ceilán", timeline: [f("uk")] },
  "british-malaya": {
    en: "British Malaya",
    es: "Malaya británica",
    rank: 3,
    timeline: [
      f("uk"),
      ["1942-02-15", "occupied-axis"],
      ["1945-09-12", "allies"],
    ],
  },
  brunei: {
    en: "Brunei",
    es: "Brunéi",
    timeline: [
      f("uk"),
      ["1941-12-16", "occupied-axis"],
      ["1945-06-10", "allies"],
    ],
  },
  "hong-kong": {
    en: "Hong Kong",
    es: "Hong Kong",
    timeline: [
      f("uk"),
      ["1941-12-25", "occupied-axis"],
      ["1945-08-30", "allies"],
    ],
  },
  korea: { en: "Korea", es: "Corea", rank: 2, timeline: [f("japan")] },
  taiwan: {
    en: "Taiwan",
    es: "Taiwán",
    timeline: [f("japan"), ["1945-10-25", "allies"]],
  },
  manchuria: {
    en: "Manchuria",
    es: "Manchuria",
    rank: 2,
    timeline: [
      ["1931-09-18", "occupied-axis"],
      ["1945-08-20", "occupied-soviet"],
    ],
  },
  "south-seas-mandate": {
    en: "South Seas Mandate",
    es: "Mandato del Pacífico Sur",
    timeline: [f("japan"), ["1944-08-01", "occupied-allies"]],
  },
  "solomon-islands": {
    en: "Solomon Islands",
    es: "Islas Salomón",
    timeline: [
      f("uk"),
      ["1942-05-03", "occupied-axis"],
      ["1943-02-09", "allies"],
    ],
  },
  "wake-island": {
    en: "Wake Island",
    es: "Isla Wake",
    timeline: [
      f("usa"),
      ["1941-12-23", "occupied-axis"],
      ["1945-09-04", "allies"],
    ],
  },
  thailand: {
    en: "Thailand (Siam)",
    es: "Tailandia (Siam)",
    rank: 2,
    timeline: [
      ["1917-07-22", "entente"],
      [WW1_END, "neutral"],
      ["1940-11-28", "war"],
      ["1941-01-28", "neutral"],
      ["1941-12-21", "axis"],
      ["1945-08-16", "neutral"],
    ],
  },
  "french-indochina": {
    en: "French Indochina",
    es: "Indochina francesa",
    rank: 2,
    timeline: [
      f("france"),
      ["1940-09-22", "occupied-axis"],
      ["1945-09-02", "allies"],
    ],
  },
  philippines: {
    en: "Philippines",
    es: "Filipinas",
    rank: 2,
    timeline: [
      f("usa"),
      ["1942-05-06", "occupied-axis"],
      ["1945-03-03", "allies"],
    ],
  },
  guam: {
    en: "Guam",
    es: "Guam",
    timeline: [
      f("usa"),
      ["1941-12-10", "occupied-axis"],
      ["1944-08-10", "allies"],
    ],
  },
  "dutch-east-indies": {
    en: "Dutch East Indies",
    es: "Indias Orientales Neerlandesas",
    rank: 2,
    timeline: [
      ["1940-05-10", "allies"],
      ["1942-03-08", "occupied-axis"],
      ["1945-09-02", "allies"],
    ],
  },
  "new-guinea": {
    en: "New Guinea",
    es: "Nueva Guinea",
    timeline: [
      f("germany"),
      ["1914-09-17", "entente"],
      f("australia", WW1_END),
    ],
  },
  australia: {
    en: "Australia",
    es: "Australia",
    rank: 2,
    timeline: [f("uk")],
  },
  "new-zealand": {
    en: "New Zealand",
    es: "Nueva Zelanda",
    rank: 3,
    timeline: [f("uk")],
  },
  niue: { en: "Niue", es: "Niue", timeline: [f("new-zealand")] },
  samoa: {
    en: "Samoa",
    es: "Samoa",
    timeline: [
      f("germany"),
      ["1914-08-29", "entente"],
      f("new-zealand", WW1_END),
    ],
  },
  "american-samoa": {
    en: "American Samoa",
    es: "Samoa Americana",
    timeline: [f("usa")],
  },
  tonga: { en: "Tonga", es: "Tonga", timeline: [f("uk")] },
  fiji: { en: "Fiji", es: "Fiyi", timeline: [f("uk")] },
  "gilbert-and-ellice": {
    en: "Gilbert and Ellice Islands",
    es: "Islas Gilbert y Ellice",
    timeline: [
      f("uk"),
      ["1941-12-10", "occupied-axis"],
      ["1943-11-23", "allies"],
    ],
  },
  "new-caledonia": {
    en: "New Caledonia",
    es: "Nueva Caledonia",
    timeline: [f("france"), ["1940-09-19", "allies"]],
  },
  "new-hebrides": {
    en: "New Hebrides",
    es: "Nuevas Hébridas",
    timeline: [f("france"), ["1940-07-22", "allies"]],
  },
  "wallis-and-futuna": {
    en: "Wallis and Futuna",
    es: "Wallis y Futuna",
    timeline: [f("france"), ["1942-05-27", "allies"]],
  },
  canada: {
    en: "Canada",
    es: "Canadá",
    rank: 2,
    timeline: [
      ["1914-08-04", "entente"],
      [WW1_END, "neutral"],
      ["1939-09-10", "allies"],
    ],
  },
  newfoundland: {
    en: "Newfoundland",
    es: "Terranova",
    timeline: [f("uk")],
  },
  "south-africa": {
    en: "South Africa",
    es: "Sudáfrica",
    rank: 2,
    timeline: [
      ["1914-08-04", "entente"],
      [WW1_END, "neutral"],
      ["1939-09-06", "allies"],
    ],
  },
  "south-west-africa": {
    en: "South West Africa",
    es: "África del Sudoeste",
    timeline: [
      f("germany"),
      ["1915-07-09", "entente"],
      f("south-africa", WW1_END),
    ],
  },
  "german-east-africa": {
    en: "German East Africa",
    es: "África Oriental Alemana",
    timeline: [f("germany"), ["1916-09-04", "entente"], [WW1_END, "neutral"]],
  },
  kamerun: {
    en: "Kamerun",
    es: "Camerún alemán",
    timeline: [f("germany"), ["1916-03-10", "entente"], [WW1_END, "neutral"]],
  },
  togoland: {
    en: "Togoland",
    es: "Togolandia",
    timeline: [f("germany"), ["1914-08-26", "entente"], f("france", WW1_END)],
  },
  "french-cameroons": {
    en: "French Cameroons",
    es: "Camerún francés",
    timeline: [f("france"), ["1940-08-27", "allies"]],
  },
  "french-equatorial-africa": {
    en: "French Equatorial Africa",
    es: "África Ecuatorial Francesa",
    rank: 2,
    timeline: [f("france"), ["1940-08-28", "allies"]],
  },
  "french-west-africa": {
    en: "French West Africa",
    es: "África Occidental Francesa",
    rank: 2,
    timeline: [f("france"), ["1942-11-23", "allies"]],
  },
  algeria: {
    en: "Algeria",
    es: "Argelia",
    rank: 2,
    timeline: [f("france"), ["1942-11-11", "allies"]],
  },
  morocco: {
    en: "French Morocco",
    es: "Marruecos francés",
    rank: 3,
    timeline: [f("france"), ["1942-11-11", "allies"]],
  },
  tunisia: {
    en: "Tunisia",
    es: "Túnez",
    timeline: [f("france"), ["1943-05-13", "allies"]],
  },
  "french-somaliland": {
    en: "French Somaliland",
    es: "Somalia Francesa",
    timeline: [f("france"), ["1942-12-28", "allies"]],
  },
  madagascar: {
    en: "Madagascar",
    es: "Madagascar",
    rank: 3,
    timeline: [f("france"), ["1942-11-06", "allies"]],
  },
  "french-guiana": {
    en: "French Guiana",
    es: "Guayana Francesa",
    timeline: [f("france"), ["1943-03-18", "allies"]],
  },
  "french-west-indies": {
    en: "French West Indies",
    es: "Antillas Francesas",
    timeline: [f("france"), ["1943-07-14", "allies"]],
  },
  libya: {
    en: "Libya",
    es: "Libia",
    rank: 2,
    timeline: [f("italy"), ["1943-01-23", "occupied-allies"]],
  },
  eritrea: {
    en: "Eritrea",
    es: "Eritrea",
    timeline: [f("italy"), ["1941-04-01", "occupied-allies"]],
  },
  "italian-somaliland": {
    en: "Italian Somaliland",
    es: "Somalia italiana",
    timeline: [f("italy"), ["1941-02-25", "occupied-allies"]],
  },
  ethiopia: {
    en: "Ethiopia",
    es: "Etiopía",
    rank: 2,
    timeline: [
      ["1935-10-03", "war"],
      ["1936-05-09", "occupied-axis"],
      ["1941-05-05", "allies"],
    ],
  },
  "british-somaliland": {
    en: "British Somaliland",
    es: "Somalilandia británica",
    timeline: [
      f("uk"),
      ["1940-08-19", "occupied-axis"],
      ["1941-03-16", "allies"],
    ],
  },
  sudan: {
    en: "Anglo-Egyptian Sudan",
    es: "Sudán anglo-egipcio",
    rank: 3,
    timeline: [f("uk")],
  },
  kenya: { en: "Kenya", es: "Kenia", rank: 3, timeline: [f("uk")] },
  uganda: { en: "Uganda", es: "Uganda", timeline: [f("uk")] },
  tanganyika: {
    en: "Tanganyika",
    es: "Tanganica",
    rank: 3,
    timeline: [f("uk")],
  },
  nyasaland: { en: "Nyasaland", es: "Nyasalandia", timeline: [f("uk")] },
  rhodesia: { en: "Rhodesia", es: "Rodesia", rank: 3, timeline: [f("uk")] },
  bechuanaland: {
    en: "Bechuanaland",
    es: "Bechuanalandia",
    timeline: [f("uk")],
  },
  basutoland: { en: "Basutoland", es: "Basutolandia", timeline: [f("uk")] },
  swaziland: { en: "Swaziland", es: "Suazilandia", timeline: [f("uk")] },
  nigeria: { en: "Nigeria", es: "Nigeria", rank: 3, timeline: [f("uk")] },
  "gold-coast": {
    en: "Gold Coast",
    es: "Costa de Oro",
    timeline: [f("uk")],
  },
  "sierra-leone": {
    en: "Sierra Leone",
    es: "Sierra Leona",
    timeline: [f("uk")],
  },
  gambia: { en: "Gambia", es: "Gambia", timeline: [f("uk")] },
  liberia: {
    en: "Liberia",
    es: "Liberia",
    timeline: [
      ["1917-08-04", "entente"],
      [WW1_END, "neutral"],
      ["1944-01-27", "allies"],
    ],
  },
  "belgian-congo": {
    en: "Belgian Congo",
    es: "Congo Belga",
    rank: 2,
    timeline: [
      ["1914-08-04", "entente"],
      [WW1_END, "neutral"],
      ["1940-05-10", "allies"],
    ],
  },
  "ruanda-urundi": {
    en: "Ruanda-Urundi",
    es: "Ruanda-Urundi",
    timeline: [f("belgian-congo")],
  },
  angola: { en: "Angola", es: "Angola", rank: 3, timeline: [f("portugal")] },
  mozambique: {
    en: "Mozambique",
    es: "Mozambique",
    rank: 3,
    timeline: [f("portugal")],
  },
  "portuguese-guinea": {
    en: "Portuguese Guinea",
    es: "Guinea Portuguesa",
    timeline: [f("portugal")],
  },
  "spanish-morocco": {
    en: "Spanish Morocco",
    es: "Marruecos español",
    timeline: [f("spain")],
  },
  "spanish-sahara": {
    en: "Spanish Sahara",
    es: "Sahara Español",
    timeline: [f("spain")],
  },
  "spanish-guinea": {
    en: "Spanish Guinea",
    es: "Guinea Española",
    timeline: [f("spain")],
  },
  suriname: {
    en: "Suriname",
    es: "Surinam",
    timeline: [["1940-05-10", "allies"]],
  },
  "netherlands-antilles": {
    en: "Netherlands Antilles",
    es: "Antillas Neerlandesas",
    timeline: [["1940-05-10", "allies"]],
  },
  "british-guiana": {
    en: "British Guiana",
    es: "Guayana Británica",
    timeline: [f("uk")],
  },
  "british-honduras": {
    en: "British Honduras",
    es: "Honduras Británica",
    timeline: [f("uk")],
  },
  "british-west-indies": {
    en: "British West Indies",
    es: "Antillas Británicas",
    timeline: [f("uk")],
  },
  "puerto-rico": {
    en: "Puerto Rico",
    es: "Puerto Rico",
    timeline: [f("usa")],
  },
  "us-virgin-islands": {
    en: "US Virgin Islands",
    es: "Islas Vírgenes de EE. UU.",
    timeline: [f("usa")],
  },
  mexico: {
    en: "Mexico",
    es: "México",
    rank: 2,
    timeline: [
      ["1914-01-01", "civil-war"],
      ["1920-12-01", "neutral"],
      ["1926-08-01", "civil-war"],
      ["1929-06-21", "neutral"],
      ["1942-05-22", "allies"],
    ],
  },
  guatemala: {
    en: "Guatemala",
    es: "Guatemala",
    timeline: [
      ["1918-04-23", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-09", "allies"],
    ],
  },
  honduras: {
    en: "Honduras",
    es: "Honduras",
    timeline: [
      ["1918-07-19", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-08", "allies"],
    ],
  },
  "el-salvador": {
    en: "El Salvador",
    es: "El Salvador",
    timeline: [["1941-12-08", "allies"]],
  },
  nicaragua: {
    en: "Nicaragua",
    es: "Nicaragua",
    timeline: [
      ["1918-05-06", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-08", "allies"],
    ],
  },
  "costa-rica": {
    en: "Costa Rica",
    es: "Costa Rica",
    timeline: [
      ["1918-05-23", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-08", "allies"],
    ],
  },
  panama: {
    en: "Panama",
    es: "Panamá",
    timeline: [
      ["1917-04-07", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-07", "allies"],
    ],
  },
  cuba: {
    en: "Cuba",
    es: "Cuba",
    rank: 3,
    timeline: [
      ["1917-04-07", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-09", "allies"],
    ],
  },
  haiti: {
    en: "Haiti",
    es: "Haití",
    timeline: [
      ["1918-07-12", "entente"],
      [WW1_END, "neutral"],
      ["1941-12-08", "allies"],
    ],
  },
  "dominican-republic": {
    en: "Dominican Republic",
    es: "República Dominicana",
    timeline: [["1941-12-08", "allies"]],
  },
  colombia: {
    en: "Colombia",
    es: "Colombia",
    rank: 3,
    timeline: [
      ["1932-09-01", "war"],
      ["1933-05-24", "neutral"],
      ["1943-11-26", "allies"],
    ],
  },
  venezuela: {
    en: "Venezuela",
    es: "Venezuela",
    rank: 3,
    timeline: [["1945-02-15", "allies"]],
  },
  ecuador: {
    en: "Ecuador",
    es: "Ecuador",
    timeline: [
      ["1941-07-05", "war"],
      ["1941-07-31", "neutral"],
      ["1945-02-02", "allies"],
    ],
  },
  peru: {
    en: "Peru",
    es: "Perú",
    rank: 3,
    timeline: [
      ["1932-09-01", "war"],
      ["1933-05-24", "neutral"],
      ["1941-07-05", "war"],
      ["1941-07-31", "neutral"],
      ["1945-02-12", "allies"],
    ],
  },
  brazil: {
    en: "Brazil",
    es: "Brasil",
    rank: 2,
    timeline: [
      ["1917-10-26", "entente"],
      [WW1_END, "neutral"],
      ["1942-08-22", "allies"],
    ],
  },
  bolivia: {
    en: "Bolivia",
    es: "Bolivia",
    rank: 3,
    timeline: [
      ["1932-06-15", "war"],
      ["1935-06-12", "neutral"],
      ["1943-04-07", "allies"],
    ],
  },
  paraguay: {
    en: "Paraguay",
    es: "Paraguay",
    rank: 3,
    timeline: [
      ["1932-06-15", "war"],
      ["1935-06-12", "neutral"],
      ["1945-02-07", "allies"],
    ],
  },
  chile: {
    en: "Chile",
    es: "Chile",
    rank: 3,
    timeline: [["1945-04-11", "allies"]],
  },
  argentina: {
    en: "Argentina",
    es: "Argentina",
    rank: 2,
    timeline: [["1945-03-27", "allies"]],
  },
  uruguay: {
    en: "Uruguay",
    es: "Uruguay",
    timeline: [["1945-02-15", "allies"]],
  },
};

function statusAt(timeline: Entry[], date: string): Status {
  let status: Status = "neutral";
  for (const [d, s] of timeline) if (d <= date) status = s;
  return status;
}

const resolved = new Map<string, Entry[]>();

export function resolveTimeline(id: string, stack: string[] = []): Entry[] {
  const cached = resolved.get(id);
  if (cached) return cached;
  const spec = COUNTRIES[id];
  if (!spec) throw new Error(`timeline references unknown country "${id}"`);
  if (stack.includes(id))
    throw new Error(`timeline cycle: ${[...stack, id].join(" -> ")}`);
  const explicit = spec.timeline.filter((p): p is Entry => Array.isArray(p));
  const out: Entry[] = [...explicit];
  for (const piece of spec.timeline) {
    if (Array.isArray(piece)) continue;
    const parent = resolveTimeline(piece.follow, [...stack, id]);
    const from = piece.from ?? "";
    const until =
      explicit.map(([d]) => d).find((d) => d > from) ?? "9999-12-31";
    if (piece.from) out.push([from, statusAt(parent, from)]);
    for (const [d, s] of parent) if (d > from && d < until) out.push([d, s]);
  }
  out.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const timeline: Entry[] = [];
  for (const entry of out) {
    const last = timeline[timeline.length - 1];
    if (last && last[0] === entry[0]) {
      const isExplicit = explicit.some(
        ([d, s]) => d === entry[0] && s === entry[1]
      );
      if (isExplicit) timeline[timeline.length - 1] = entry;
      continue;
    }
    timeline.push(entry);
  }
  const compact = timeline.filter((entry, i) =>
    i === 0 ? entry[1] !== "neutral" : entry[1] !== timeline[i - 1]![1]
  );
  resolved.set(id, compact);
  return compact;
}

export { COUNTRIES, statusAt };
