/* ============ Motorradreise-Sammler App-Logik (Polished & UX-Optimized) ============ */

// State Management
const state = {
  continentFilter: "Alle",
  problemFilter: "alle",
  searchQuery: "",
  favOnlyRoute: false,
  favOnlyCountry: false,
  wildOnlyRoute: false,
  routeContinent: "alle",
  calMonth: null,
  currentLang: "de"
};

/* ---------- Internationalisierung (i18n DE / EN) ---------- */
const LANG_KEY = "mrs_lang";
const I18N = {
  de: {
    appTitle: "Rydo",
    appSub: "Passes · Routes · Adventure",
    searchPlaceholder: "Suche Land, Pass, Route, Problem…",
    searchBtn: "🔍",
    offlineReady: "📲 App installieren (Offline)",
    navDiscover: "Entdecken",
    navCountries: "Länder",
    navPlanner: "Planen",
    navStart: "Start",
    navRoutes: "Routen",
    navMap: "Karte",
    navCalendar: "Kalender",
    navCountryDb: "Länder",
    navPrep: "Checklisten",
    navCamper: "Wohnmobil",
    navMyTrips: "Meine Reisen",
    navLessons: "Pannen & Notfälle",
    navSources: "Quellen",
    navPasses: "Pässe",
    heroTitle: "Plane deine nächste Alpen- & Abenteuerreise.",
    heroSub: "100+ kuratierte Routen & 53 Hochgebirgspässe weltweit für Motorrad, Bikepacking & Camper · GPS-Tracks & Höhenprofile · Offline-App.",
    heroBtnRoutes: "🛣️ Routen erkunden",
    heroBtnPlanner: "🧭 Eigene Reise planen",
    statCountries: "Länder",
    statRoutes: "Routen",
    statMoto: "Motorrad-Trips",
    statBp: "Bikepacking",
    statProbs: "Lektionen",
    allTypes: "Alle Typen",
    allDiff: "Jede Schwierigkeit",
    allCountries: "Alle Länder",
    allContinents: "Alle Kontinente",
    allAccomm: "Alle Übernachtungen",
    onlyWild: "🏕️ Nur Wildcamping",
    onlyFav: "⭐ Nur Favoriten",
    addToTrip: "+ Zu Reise",
    showOnMap: "🗺️ Auf Karte zeigen",
    gpxSearch: "⤓ GPX suchen",
    gpxDownload: "⤓ GPX Download",
    demoGpx: "📥 Demo-GPX laden",
    noResults: "Keine Treffer gefunden.",
    myTripsTitle: "🧭 Meine Reisen — Reise- & Etappenplaner",
    myTripsSub: "Plane eigene Touren, kombiniere Routen aus der Datenbank und erhalte automatisch deine Dokumenten- & Grenz-Checkliste.",
    newTripBtn: "+ Neue Reise anlegen",
    exportJson: "⤓ Export JSON",
    importJson: "⤒ Import JSON",
    printPdf: "🖨️ Drucken / PDF"
  },
  en: {
    appTitle: "Rydo",
    appSub: "Passes · Routes · Adventure",
    searchPlaceholder: "Search pass, country, route…",
    searchBtn: "🔍",
    offlineReady: "📲 Install App (Offline)",
    navDiscover: "Discover",
    navCountries: "Countries",
    navPlanner: "Plan",
    navStart: "Start",
    navRoutes: "Routes",
    navMap: "Map",
    navCalendar: "Calendar",
    navCountryDb: "Countries",
    navPrep: "Checklists",
    navCamper: "Camper",
    navMyTrips: "My Trips",
    navLessons: "Issues & Tips",
    navSources: "Sources",
    navPasses: "Passes",
    heroTitle: "Plan your ultimate pass & adventure journey.",
    heroSub: "100+ curated routes & 53 alpine passes for moto, bikepacking & campervans · GPS tracks & elevation profiles · Offline PWA.",
    heroBtnRoutes: "🛣️ Explore Routes",
    heroBtnPlanner: "🧭 Plan Your Trip",
    statCountries: "Countries",
    statRoutes: "Routes",
    statMoto: "Moto Trips",
    statBp: "Bikepacking",
    statProbs: "Lessons",
    allTypes: "All Types",
    allDiff: "Any Difficulty",
    allCountries: "All Countries",
    allContinents: "All Continents",
    allAccomm: "All Accommodations",
    onlyWild: "🏕️ Wildcamp Only",
    onlyFav: "⭐ Favorites Only",
    addToTrip: "+ Add to Trip",
    showOnMap: "🗺️ Show on Map",
    gpxSearch: "⤓ Search GPX",
    gpxDownload: "⤓ Download GPX",
    demoGpx: "📥 Load Demo GPX",
    noResults: "No results found.",
    myTripsTitle: "🧭 My Trips — Stage & Route Planner",
    myTripsSub: "Plan custom tours, combine database tracks, and get your automated border & document checklist.",
    newTripBtn: "+ Create New Trip",
    exportJson: "⤓ Export JSON",
    importJson: "⤒ Import JSON",
    printPdf: "🖨️ Print / PDF"
  }
};

function t(key) {
  const lang = state.currentLang || "de";
  return (I18N[lang] && I18N[lang][key]) || (I18N.de[key]) || key;
}

function initLang() {
  const saved = localStorage.getItem(LANG_KEY);
  state.currentLang = saved === "en" ? "en" : "de";
  applyLang();
}

function toggleLang() {
  state.currentLang = state.currentLang === "de" ? "en" : "de";
  localStorage.setItem(LANG_KEY, state.currentLang);
  applyLang();
  renderStats();
  renderRoutes();
  renderCountries();
  renderReisen();
}

function applyLang() {
  const langBtn = document.getElementById("langToggleBtn");
  if (langBtn) langBtn.textContent = state.currentLang === "de" ? "🌐 DE" : "🌐 EN";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.innerHTML = t(key);
  });

  const si = document.getElementById("searchInput");
  if (si) si.placeholder = t("searchPlaceholder");
}

/* ---------- XSS Prevention & Utility ---------- */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------- Exhaustive Country Flag Dictionary & Helper ---------- */
const COUNTRY_FLAGS = {
  // Europa
  "deutschland": "🇩🇪", "germany": "🇩🇪", "de": "🇩🇪",
  "österreich": "🇦🇹", "oesterreich": "🇦🇹", "austria": "🇦🇹", "at": "🇦🇹",
  "schweiz": "🇨🇭", "switzerland": "🇨🇭", "swiss": "🇨🇭", "ch": "🇨🇭",
  "italien": "🇮🇹", "italy": "🇮🇹", "it": "🇮🇹",
  "frankreich": "🇫🇷", "france": "🇫🇷", "fr": "🇫🇷",
  "spanien": "🇪🇸", "spain": "🇪🇸", "es": "🇪🇸",
  "portugal": "🇵🇹", "pt": "🇵🇹",
  "norwegen": "🇳🇴", "norway": "🇳🇴", "no": "🇳🇴",
  "schweden": "🇸🇪", "sweden": "🇸🇪", "se": "🇸🇪",
  "finnland": "🇫🇮", "finland": "🇫🇮", "fi": "🇫🇮",
  "island": "🇮🇸", "iceland": "🇮🇸", "is": "🇮🇸",
  "dänemark": "🇩🇰", "daenemark": "🇩🇰", "denmark": "🇩🇰", "dk": "🇩🇰",
  "großbritannien": "🇬🇧", "grossbritannien": "🇬🇧", "uk": "🇬🇧", "united kingdom": "🇬🇧", "schottland": "🇬🇧", "england": "🇬🇧", "wales": "🇬🇧", "nordirland": "🇬🇧", "gb": "🇬🇧",
  "irland": "🇮🇪", "ireland": "🇮🇪", "ie": "🇮🇪",
  "niederlande": "🇳🇱", "holland": "🇳🇱", "netherlands": "🇳🇱", "nl": "🇳🇱",
  "belgien": "🇧🇪", "belgium": "🇧🇪", "be": "🇧🇪",
  "luxemburg": "🇱🇺", "luxembourg": "🇱🇺", "lu": "🇱🇺",
  "liechtenstein": "🇱🇮", "li": "🇱🇮",
  "andorra": "🇦🇩", "ad": "🇦🇩",
  "monaco": "🇲🇨", "mc": "🇲🇨",
  "san marino": "🇸🇲", "sm": "🇸🇲",
  "slowenien": "🇸🇮", "slovenia": "🇸🇮", "si": "🇸🇮",
  "kroatien": "🇭🇷", "croatia": "🇭🇷", "hr": "🇭🇷",
  "bosnien und herzegowina": "🇧🇦", "bosnien": "🇧🇦", "herzegowina": "🇧🇦", "bosnia": "🇧🇦", "ba": "🇧🇦",
  "montenegro": "🇲🇪", "me": "🇲🇪",
  "albanien": "🇦🇱", "albania": "🇦🇱", "al": "🇦🇱",
  "nordmazedonien": "🇲🇰", "mazedonien": "🇲🇰", "north macedonia": "🇲🇰", "mk": "🇲🇰",
  "serbien": "🇷🇸", "serbia": "🇷🇸", "rs": "🇷🇸",
  "kosovo": "🇽🇰", "xk": "🇽🇰",
  "griechenland": "🇬🇷", "greece": "🇬🇷", "gr": "🇬🇷",
  "bulgarien": "🇧🇬", "bulgaria": "🇧🇬", "bg": "🇧🇬",
  "rumänien": "🇷🇴", "rumaenien": "🇷🇴", "romania": "🇷🇴", "ro": "🇷🇴",
  "ungarn": "🇭🇺", "hungary": "🇭🇺", "hu": "🇭🇺",
  "slowakei": "🇸🇰", "slovakia": "🇸🇰", "sk": "🇸🇰",
  "tschechien": "🇨🇿", "tschechische republik": "🇨🇿", "czech republic": "🇨🇿", "cz": "🇨🇿",
  "polen": "🇵🇱", "poland": "🇵🇱", "pl": "🇵🇱",
  "türkei": "🇹🇷", "tuerkei": "🇹🇷", "turkey": "🇹🇷", "tr": "🇹🇷",
  "zypern": "🇨🇾", "cyprus": "🇨🇾", "cy": "🇨🇾",
  "malta": "🇲🇹", "mt": "🇲🇹",
  "estland": "🇪🇪", "estonia": "🇪🇪", "ee": "🇪🇪",
  "lettland": "🇱🇻", "latvia": "🇱🇻", "lv": "🇱🇻",
  "litauen": "🇱🇹", "lithuania": "🇱🇹", "lt": "🇱🇹",
  "georgien": "🇬🇪", "georgia": "🇬🇪", "ge": "🇬🇪",
  "armenien": "🇦🇲", "armenia": "🇦🇲", "am": "🇦🇲",
  "aserbaidschan": "🇦🇿", "azerbaijan": "🇦🇿", "az": "🇦🇿",

  // Asien & Seidenstraße
  "tadschikistan": "🇹🇯", "tajikistan": "🇹🇯", "tj": "🇹🇯",
  "kirgisistan": "🇰🇬", "kyrgyzstan": "🇰🇬", "kg": "🇰🇬",
  "kasachstan": "🇰🇿", "kazakhstan": "🇰🇿", "kz": "🇰🇿",
  "usbekistan": "🇺🇿", "uzbekistan": "🇺🇿", "uz": "🇺🇿",
  "mongolei": "🇲🇳", "mongolia": "🇲🇳", "mn": "🇲🇳",
  "indien": "🇮🇳", "india": "🇮🇳", "ladakh": "🇮🇳", "in": "🇮🇳",
  "nepal": "🇳🇵", "np": "🇳🇵",
  "pakistan": "🇵🇰", "pk": "🇵🇰",
  "china": "🇨🇳", "tibet": "🇨🇳", "cn": "🇨🇳",
  "japan": "🇯🇵", "jp": "🇯🇵",
  "vietnam": "🇻🇳", "vn": "🇻🇳",
  "laos": "🇱🇦", "la": "🇱🇦",
  "kambodscha": "🇰🇭", "cambodia": "🇰🇭", "kh": "🇰🇭",
  "thailand": "🇹🇭", "th": "🇹🇭",
  "malaysia": "🇲🇾", "my": "🇲🇾",
  "indonesien": "🇮🇩", "indonesia": "🇮🇩", "id": "🇮🇩",
  "philippinen": "🇵🇭", "philippines": "🇵🇭", "ph": "🇵🇭",
  "oman": "🇴🇲", "om": "🇴🇲",
  "saudi-arabien": "🇸🇦", "saudi arabia": "🇸🇦", "sa": "🇸🇦",
  "vae": "🇦🇪", "uae": "🇦🇪", "emirate": "🇦🇪", "ae": "🇦🇪",
  "jordanien": "🇯🇴", "jordan": "🇯🇴", "jo": "🇯🇴",
  "israel": "🇮🇱", "il": "🇮🇱",
  "iran": "🇮🇷", "ir": "🇮🇷",
  "irak": "🇮🇶", "iraq": "🇮🇶", "iq": "🇮🇶",

  // Afrika
  "marokko": "🇲🇦", "morocco": "🇲🇦", "ma": "🇲🇦",
  "mauretanien": "🇲🇷", "mauritania": "🇲🇷", "mr": "🇲🇷",
  "senegal": "🇸🇳", "sn": "🇸🇳",
  "tunesien": "🇹🇳", "tunisia": "🇹🇳", "tn": "🇹🇳",
  "algerien": "🇩🇿", "algeria": "🇩🇿", "dz": "🇩🇿",
  "ägypten": "🇪🇬", "aegypten": "🇪🇬", "egypt": "🇪🇬", "eg": "🇪🇬",
  "südafrika": "🇿🇦", "suedafrika": "🇿🇦", "south africa": "🇿🇦", "za": "🇿🇦",
  "namibia": "🇳🇦", "na": "🇳🇦",
  "botswana": "🇧🇼", "bw": "🇧🇼",
  "sambia": "🇿🇲", "zambia": "🇿🇲", "zm": "🇿🇲",
  "simbabwe": "🇿🇼", "zimbabwe": "🇿🇼", "zw": "🇿🇼",
  "tansania": "🇹🇿", "tanzania": "🇹🇿", "tz": "🇹🇿",
  "kenia": "🇰🇪", "kenya": "🇰🇪", "ke": "🇰🇪",
  "uganda": "🇺🇬", "ug": "🇺🇬",
  "mosambik": "🇲🇿", "mozambique": "🇲🇿", "mz": "🇲🇿",
  "äthiopien": "🇪🇹", "aethiopien": "🇪🇹", "ethiopia": "🇪🇹", "et": "🇪🇹",

  // Amerika
  "usa": "🇺🇸", "united states": "🇺🇸", "amerika": "🇺🇸", "us": "🇺🇸",
  "kanada": "🇨🇦", "canada": "🇨🇦", "ca": "🇨🇦",
  "mexiko": "🇲🇽", "mexico": "🇲🇽", "mx": "🇲🇽",
  "guatemala": "🇬🇹", "gt": "🇬🇹",
  "costa rica": "🇨🇷", "cr": "🇨🇷",
  "nicaragua": "🇳🇮", "ni": "🇳🇮",
  "panama": "🇵🇦", "pa": "🇵🇦",
  "kolumbien": "🇨🇴", "colombia": "🇨🇴", "co": "🇨🇴",
  "ecuador": "🇪🇨", "ec": "🇪🇨",
  "peru": "🇵🇪", "pe": "🇵🇪",
  "bolivien": "🇧🇴", "bolivia": "🇧🇴", "bo": "🇧🇴",
  "chile": "🇨🇱", "cl": "🇨🇱",
  "argentinien": "🇦🇷", "argentina": "🇦🇷", "ar": "🇦🇷",
  "brasilien": "🇧🇷", "brazil": "🇧🇷", "br": "🇧🇷",
  "uruguay": "🇺🇾", "uy": "🇺🇾",
  "paraguay": "🇵🇾", "py": "🇵🇾",

  // Ozeanien & Global
  "australien": "🇦🇺", "australia": "🇦🇺", "au": "🇦🇺",
  "neuseeland": "🇳🇿", "new zealand": "🇳🇿", "nz": "🇳🇿",
  "europa": "🇪🇺", "viele (europa)": "🇪🇺",
  "weltweit": "🌍", "global": "🌍"
};

/* ---------- Country ISO Code Mapping for Crisp Flag Rendering ---------- */
const COUNTRY_ISO = {
  // Europa
  "deutschland": "de", "germany": "de", "de": "de",
  "österreich": "at", "oesterreich": "at", "austria": "at", "at": "at",
  "schweiz": "ch", "switzerland": "ch", "swiss": "ch", "ch": "ch",
  "italien": "it", "italy": "it", "it": "it",
  "frankreich": "fr", "france": "fr", "fr": "fr",
  "spanien": "es", "spain": "es", "es": "es",
  "portugal": "pt", "pt": "pt",
  "norwegen": "no", "norway": "no", "no": "no",
  "schweden": "se", "sweden": "se", "se": "se",
  "finnland": "fi", "finland": "fi", "fi": "fi",
  "island": "is", "iceland": "is", "is": "is",
  "dänemark": "dk", "daenemark": "dk", "denmark": "dk", "dk": "dk",
  "großbritannien": "gb", "grossbritannien": "gb", "uk": "gb", "united kingdom": "gb", "schottland": "gb-sct", "england": "gb-eng", "wales": "gb-wls", "nordirland": "gb-nir", "gb": "gb",
  "irland": "ie", "ireland": "ie", "ie": "ie",
  "niederlande": "nl", "holland": "nl", "netherlands": "nl", "nl": "nl",
  "belgien": "be", "belgium": "be", "be": "be",
  "luxemburg": "lu", "luxembourg": "lu", "lu": "lu",
  "liechtenstein": "li", "li": "li",
  "andorra": "ad", "ad": "ad",
  "monaco": "mc", "mc": "mc",
  "san marino": "sm", "sm": "sm",
  "slowenien": "si", "slovenia": "si", "si": "si",
  "kroatien": "hr", "croatia": "hr", "hr": "hr",
  "bosnien und herzegowina": "ba", "bosnien": "ba", "herzegowina": "ba", "bosnia": "ba", "ba": "ba",
  "montenegro": "me", "me": "me",
  "albanien": "al", "albania": "al", "al": "al",
  "nordmazedonien": "mk", "mazedonien": "mk", "north macedonia": "mk", "mk": "mk",
  "serbien": "rs", "serbia": "rs", "rs": "rs",
  "kosovo": "xk", "xk": "xk",
  "griechenland": "gr", "greece": "gr", "gr": "gr",
  "bulgarien": "bg", "bulgaria": "bg", "bg": "bg",
  "rumänien": "ro", "rumaenien": "ro", "romania": "ro", "ro": "ro",
  "ungarn": "hu", "hungary": "hu", "hu": "hu",
  "slowakei": "sk", "slovakia": "sk", "sk": "sk",
  "tschechien": "cz", "tschechische republik": "cz", "czech republic": "cz", "cz": "cz",
  "polen": "pl", "poland": "pl", "pl": "pl",
  "türkei": "tr", "tuerkei": "tr", "turkey": "tr", "tr": "tr",
  "zypern": "cy", "cyprus": "cy", "cy": "cy",
  "malta": "mt", "mt": "mt",
  "estland": "ee", "estonia": "ee", "ee": "ee",
  "lettland": "lv", "latvia": "lv", "lv": "lv",
  "litauen": "lt", "lithuania": "lt", "lt": "lt",
  "georgien": "ge", "georgia": "ge", "ge": "ge",
  "armenien": "am", "armenia": "am", "am": "am",
  "aserbaidschan": "az", "azerbaijan": "az", "az": "az",

  // Asien & Seidenstraße
  "tadschikistan": "tj", "tajikistan": "tj", "tj": "tj",
  "kirgisistan": "kg", "kyrgyzstan": "kg", "kg": "kg",
  "kasachstan": "kz", "kazakhstan": "kz", "kz": "kz",
  "usbekistan": "uz", "uzbekistan": "uz", "uz": "uz",
  "mongolei": "mn", "mongolia": "mn", "mn": "mn",
  "indien": "in", "india": "in", "ladakh": "in", "in": "in",
  "nepal": "np", "np": "np",
  "pakistan": "pk", "pk": "pk",
  "china": "cn", "tibet": "cn", "cn": "cn",
  "japan": "jp", "jp": "jp",
  "vietnam": "vn", "vn": "vn",
  "laos": "la", "la": "la",
  "kambodscha": "kh", "cambodia": "kh", "kh": "kh",
  "thailand": "th", "th": "th",
  "malaysia": "my", "my": "my",
  "indonesien": "id", "indonesia": "id", "id": "id",
  "philippinen": "ph", "philippines": "ph", "ph": "ph",
  "oman": "om", "om": "om",
  "saudi-arabien": "sa", "saudi arabia": "sa", "sa": "sa",
  "vae": "ae", "uae": "ae", "emirate": "ae", "ae": "ae",
  "jordanien": "jo", "jordan": "jo", "jo": "jo",
  "israel": "il", "il": "il",
  "iran": "ir", "ir": "ir",
  "irak": "iq", "iraq": "iq", "iq": "iq",

  // Afrika
  "marokko": "ma", "morocco": "ma", "ma": "ma",
  "mauretanien": "mr", "mauritania": "mr", "mr": "mr",
  "senegal": "sn", "sn": "sn",
  "tunesien": "tn", "tunisia": "tn", "tn": "tn",
  "algerien": "dz", "algeria": "dz", "dz": "dz",
  "ägypten": "eg", "aegypten": "eg", "egypt": "eg", "eg": "eg",
  "südafrika": "za", "suedafrika": "za", "south africa": "za", "za": "za",
  "namibia": "na", "na": "na",
  "botswana": "bw", "bw": "bw",
  "sambia": "zm", "zambia": "zm", "zm": "zm",
  "simbabwe": "zw", "zimbabwe": "zw", "zw": "zw",
  "tansania": "tz", "tanzania": "tz", "tz": "tz",
  "kenia": "ke", "kenya": "ke", "ke": "ke",
  "uganda": "ug", "ug": "ug",
  "mosambik": "mz", "mozambique": "mz", "mz": "mz",
  "äthiopien": "et", "aethiopien": "et", "ethiopia": "et", "et": "et",

  // Amerika
  "usa": "us", "united states": "us", "amerika": "us", "us": "us",
  "kanada": "ca", "canada": "ca", "ca": "ca",
  "mexiko": "mx", "mexico": "mx", "mx": "mx",
  "guatemala": "gt", "gt": "gt",
  "costa rica": "cr", "cr": "cr",
  "nicaragua": "ni", "ni": "ni",
  "panama": "pa", "pa": "pa",
  "kolumbien": "co", "colombia": "co", "co": "co",
  "ecuador": "ec", "ec": "ec",
  "peru": "pe", "pe": "pe",
  "bolivien": "bo", "bolivia": "bo", "bo": "bo",
  "chile": "cl", "cl": "cl",
  "argentinien": "ar", "argentina": "ar", "ar": "ar",
  "brasilien": "br", "brazil": "br", "br": "br",
  "uruguay": "uy", "uy": "uy",
  "paraguay": "py", "py": "py",

  // Ozeanien & Global
  "australien": "au", "australia": "au", "au": "au",
  "neuseeland": "nz", "new zealand": "nz", "nz": "nz",
  "europa": "eu", "viele (europa)": "eu"
};

function getCountryIso(name) {
  if (!name) return "";
  const clean = String(name).trim().toLowerCase();
  if (COUNTRY_ISO[clean]) return COUNTRY_ISO[clean];
  if (typeof DB !== "undefined" && DB.countries) {
    const c = DB.countries.find(x => x.name.toLowerCase() === clean || (x.id && x.id.toLowerCase() === clean));
    if (c && c.id && COUNTRY_ISO[c.id.toLowerCase()]) return COUNTRY_ISO[c.id.toLowerCase()];
  }
  const noParen = clean.replace(/\s*\(.*?\)/g, "").trim();
  if (COUNTRY_ISO[noParen]) return COUNTRY_ISO[noParen];
  for (const [k, iso] of Object.entries(COUNTRY_ISO)) {
    if (k.length >= 4 && clean.includes(k)) return iso;
  }
  return "";
}

function getSingleCountryFlag(name) {
  if (!name) return "";
  const clean = String(name).trim().toLowerCase();
  if (COUNTRY_FLAGS[clean]) return COUNTRY_FLAGS[clean];
  if (typeof DB !== "undefined" && DB.countries) {
    const c = DB.countries.find(x => x.name.toLowerCase() === clean || (x.id && x.id.toLowerCase() === clean));
    if (c && c.flag) return c.flag;
  }
  const noParen = clean.replace(/\s*\(.*?\)/g, "").trim();
  if (COUNTRY_FLAGS[noParen]) return COUNTRY_FLAGS[noParen];
  for (const [k, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (k.length >= 4 && clean.includes(k)) return flag;
  }
  return "";
}

function getSingleFlagHtml(name) {
  if (!name) return "";
  const iso = getCountryIso(name);
  const emoji = getSingleCountryFlag(name);
  if (iso) {
    return `<img src="https://flagcdn.com/w40/${iso.toLowerCase()}.png" class="flag-icon" width="19" height="14" alt="${escapeHtml(name)}" loading="lazy">`;
  }
  return emoji ? `<span class="flag-emoji">${emoji}</span>` : `<span class="flag-emoji">📍</span>`;
}

function getCountryFlag(countryName) {
  if (!countryName) return "";
  if (Array.isArray(countryName)) {
    const flags = countryName.map(getSingleCountryFlag).filter(Boolean);
    return [...new Set(flags)].join(" ");
  }
  const str = String(countryName).trim();
  if (str.includes("/") || str.includes("&") || str.includes("+") || str.includes(",") || str.includes(" und ")) {
    const parts = str.split(/[/,&+]|\bund\b/i).map(s => s.trim()).filter(Boolean);
    const flags = parts.map(getSingleCountryFlag).filter(Boolean);
    if (flags.length) return [...new Set(flags)].join(" ");
  }
  return getSingleCountryFlag(str);
}

function withFlag(countryNames) {
  if (!countryNames) return "";
  if (Array.isArray(countryNames)) {
    return countryNames.map(name => {
      const fHtml = getSingleFlagHtml(name);
      return `<span class="country-pill">${fHtml}<span>${escapeHtml(name)}</span></span>`;
    }).join(" ");
  }
  const str = String(countryNames).trim();
  if (str.includes("/") || str.includes(" und ") || str.includes("&") || str.includes(",")) {
    const parts = str.split(/[/,&+]|\bund\b/i).map(s => s.trim()).filter(Boolean);
    return parts.map(name => {
      const fHtml = getSingleFlagHtml(name);
      return `<span class="country-pill">${fHtml}<span>${escapeHtml(name)}</span></span>`;
    }).join(" ");
  }
  const fHtml = getSingleFlagHtml(str);
  return `<span class="country-pill">${fHtml}<span>${escapeHtml(str)}</span></span>`;
}

/* ---------- Theme Switcher (Dark / Light) ---------- */
const THEME_KEY = "mrs_theme";
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
  } else {
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.setAttribute("data-theme", prefersLight ? "light" : "dark");
  }
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
}

/* ---------- Offline / PWA Info Modal ---------- */
function openPwaInfoModal() {
  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <span style="font-size:2.5rem">📲</span>
      <div>
        <h2>Als App installieren &amp; Offline nutzen</h2>
        <div class="md-sub">100% offline-fähig – ideal für Alpenpässe &amp; Funklöcher</div>
      </div>
    </div>
    <div class="alert-callout alert-success">
      <span class="alert-icon">⚡</span>
      <div><b>Kein App Store nötig:</b> Rydo ist eine moderne Web-App (PWA). Du kannst sie mit einem Klick direkt auf deinem Smartphone oder Computer installieren und ohne Internetverbindung nutzen.</div>
    </div>
    <div class="pwa-install-grid">
      <div class="pwa-install-card">
        <div class="pwa-card-header">
          <span class="pwa-device-icon">🍏</span>
          <strong>iPhone &amp; iPad (Safari)</strong>
        </div>
        <ol class="pwa-steps">
          <li>Öffne Rydo in <b>Safari</b>.</li>
          <li>Tippe unten auf das <b>Teilen-Symbol</b> (Quadrat mit Pfeil nach oben).</li>
          <li>Scrolle etwas herunter und wähle <b>„Zum Home-Bildschirm“</b>.</li>
          <li>Tippe oben rechts auf <b>Hinzufügen</b>. Fertig!</li>
        </ol>
      </div>
      <div class="pwa-install-card">
        <div class="pwa-card-header">
          <span class="pwa-device-icon">🤖</span>
          <strong>Android (Chrome)</strong>
        </div>
        <ol class="pwa-steps">
          <li>Öffne Rydo in <b>Google Chrome</b>.</li>
          <li>Tippe oben rechts auf das <b>Drei-Punkte-Menü (⋮)</b>.</li>
          <li>Wähle <b>„App installieren“</b> oder <b>„Zum Startbildschirm“</b>.</li>
          <li>Bestätige mit <b>Installieren</b>. Fertig!</li>
        </ol>
      </div>
      <div class="pwa-install-card">
        <div class="pwa-card-header">
          <span class="pwa-device-icon">💻</span>
          <strong>PC / Mac (Chrome &amp; Edge)</strong>
        </div>
        <ol class="pwa-steps">
          <li>Klicke in der Adresszeile ganz rechts auf das <b>Installations-Symbol (⊕ oder Monitor)</b>.</li>
          <li>Klicke auf <b>Installieren</b>. Rydo öffnet sich als vollwertiges Desktop-Programm.</li>
        </ol>
      </div>
    </div>
    <div class="trust-box" style="margin-top:1.2rem">
      <b>💡 Dein Vorteil unterwegs:</b> Alle 309 Pässe, 128 Touren, Länder-Vorschriften und GPX-Routen sind bereits lokal auf deinem Gerät gesichert. Selbst mitten im Funkloch im Gebirge hast du vollen Zugriff auf alle Guides!
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:1.5rem">
      <button class="btn btn-primary" onclick="closeModal()">Alles klar!</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/* ---------- Favoriten (localStorage) ---------- */
const FAV_KEY = "mrs_favoriten";
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch(e) { return []; }
}
function saveFavs(f) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch(e) {}
}
function isFav(key) { return getFavs().includes(key); }
function toggleFav(key) {
  let f = getFavs();
  if (f.includes(key)) f = f.filter(k => k !== key);
  else f.push(key);
  saveFavs(f);
  document.querySelectorAll(`[data-favkey="${key}"]`).forEach(b =>
    b.classList.toggle("fav-active", isFav(key)));
  updateFavCounters();
}
function starBtn(key, title) {
  return `<button class="star-btn ${isFav(key) ? "fav-active" : ""}" data-favkey="${key}"
    title="${escapeHtml(title)}" onclick="event.stopPropagation();toggleFav('${key}')" aria-label="${escapeHtml(title)}">${isFav(key) ? "★" : "☆"}</button>`;
}
function favCount() {
  const f = getFavs();
  return {
    r: f.filter(k => k.startsWith("r:")).length,
    c: f.filter(k => k.startsWith("c:")).length,
    p: f.filter(k => k.startsWith("p:")).length,
    total: f.length
  };
}
function toggleFavFilterRoute() {
  state.favOnlyRoute = !state.favOnlyRoute;
  const b = document.getElementById("favFilterRoute");
  if (b) b.classList.toggle("active", state.favOnlyRoute);
  renderRoutes();
}
function toggleFavFilterCountry() {
  state.favOnlyCountry = !state.favOnlyCountry;
  const b = document.getElementById("favFilterCountry");
  if (b) b.classList.toggle("active", state.favOnlyCountry);
  renderCountries();
}
function updateFavCounters() {
  const fc = favCount();
  const b1 = document.getElementById("favFilterRoute");
  if (b1) b1.textContent = `⭐ ${t("onlyFav")} (${fc.r})`;
  const b2 = document.getElementById("favFilterCountry");
  if (b2) b2.textContent = `⭐ ${t("onlyFav")} (${fc.c})`;
  const h = document.getElementById("headerFavCount");
  if (h) h.textContent = fc.total;
}

function openFavoritesModal() {
  const f = getFavs();
  const routeFavs = f.filter(k => k.startsWith("r:")).map(k => k.replace("r:", ""));
  const countryFavs = f.filter(k => k.startsWith("c:")).map(k => k.replace("c:", ""));
  const passFavs = f.filter(k => k.startsWith("p:")).map(k => k.replace("p:", ""));

  const routes = (DB.routes || []).filter(r => routeFavs.includes(r.id));
  const countries = (DB.countries || []).filter(c => countryFavs.includes(c.id));
  const passes = (DB.passes || []).filter(p => passFavs.includes(p.id));

  let html = `
    <div class="md-head">
      <span style="font-size:2.2rem">⭐</span>
      <div>
        <h2>Deine Favoriten &amp; Merkliste</h2>
        <div class="md-sub">${routes.length} Routen &middot; ${passes.length} Pässe &middot; ${countries.length} Länder gemerkt</div>
      </div>
    </div>
  `;

  if (routes.length === 0 && passes.length === 0 && countries.length === 0) {
    html += `
      <div style="text-align:center;padding:2.5rem 1rem">
        <div style="font-size:3.2rem;margin-bottom:1rem">🧭</div>
        <h3 style="margin-bottom:.5rem">Noch keine Favoriten gespeichert</h3>
        <p class="hint" style="max-width:420px;margin:0 auto 1.5rem;line-height:1.6">
          Klicke bei beliebigen Routen, Pässen oder Ländern auf das Stern-Symbol (⭐), um sie hier für deine nächste Tour zu sammeln.
        </p>
        <button class="btn btn-primary" onclick="closeModal();showView('finder')">🧭 360°-Routenfinder starten</button>
      </div>
    `;
  } else {
    if (routes.length > 0) {
      html += `<h3 style="margin:1.4rem 0 .7rem;color:var(--accent);display:flex;align-items:center;gap:.5rem"><span>🛣️</span> Routen (${routes.length})</h3><div class="fav-list-grid">`;
      routes.forEach(r => {
        html += `
          <div class="fav-item-card" onclick="closeModal();openRoute('${escapeHtml(r.id)}')">
            <div class="fav-item-info">
              <strong class="fav-item-title">${escapeHtml(r.name)}</strong>
              <div class="fav-item-sub">${escapeHtml(r.distance)} &middot; ${withFlag(r.countries)} &middot; <span style="color:var(--accent)">${escapeHtml(r.difficulty)}</span></div>
            </div>
            <button class="star-btn fav-active" style="position:static;margin-left:auto" title="Aus Favoriten entfernen" onclick="event.stopPropagation();toggleFav('r:${r.id}');openFavoritesModal()">⭐</button>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (passes.length > 0) {
      html += `<h3 style="margin:1.6rem 0 .7rem;color:var(--green);display:flex;align-items:center;gap:.5rem"><span>🏔️</span> Pässe &amp; Panoramastraßen (${passes.length})</h3><div class="fav-list-grid">`;
      passes.forEach(p => {
        html += `
          <div class="fav-item-card" onclick="closeModal();openPassModal('${escapeHtml(p.id)}')">
            <div class="fav-item-info">
              <strong class="fav-item-title">${escapeHtml(p.name)}</strong>
              <div class="fav-item-sub">${p.altitude.toLocaleString("de")} m &middot; ${withFlag(p.country || [])} ${p.region ? `&middot; ${escapeHtml(p.region)}` : ''}</div>
            </div>
            <button class="star-btn fav-active" style="position:static;margin-left:auto" title="Aus Favoriten entfernen" onclick="event.stopPropagation();toggleFav('p:${p.id}');openFavoritesModal()">⭐</button>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (countries.length > 0) {
      html += `<h3 style="margin:1.6rem 0 .7rem;color:var(--blue);display:flex;align-items:center;gap:.5rem"><span>🌍</span> Länder (${countries.length})</h3><div class="fav-list-grid">`;
      countries.forEach(c => {
        html += `
          <div class="fav-item-card" onclick="closeModal();openCountry('${escapeHtml(c.id)}')">
            <div class="fav-item-info">
              <strong class="fav-item-title">${withFlag([c.name])} ${escapeHtml(c.name)}</strong>
              <div class="fav-item-sub">${escapeHtml(c.continent)}</div>
            </div>
            <button class="star-btn fav-active" style="position:static;margin-left:auto" title="Aus Favoriten entfernen" onclick="event.stopPropagation();toggleFav('c:${c.id}');openFavoritesModal()">⭐</button>
          </div>
        `;
      });
      html += `</div>`;
    }
  }

  document.getElementById("modalBody").innerHTML = html;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function toggleWildFilter() {
  state.wildOnlyRoute = !state.wildOnlyRoute;
  const b = document.getElementById("wildFilterRoute");
  if (b) b.classList.toggle("active", state.wildOnlyRoute);
  renderRoutes();
}

/* ---------- Links & GPX-Suche ---------- */
function linkifySources(str) {
  if (!str) return "";
  return str.split(/[,;]+/).map(s => s.trim()).filter(Boolean).map(s => {
    const url = s.match(/https?:\/\/\S+/) ? s : "https://" + s.replace(/^www\./, "");
    return `<a href="${encodeURI(url)}" target="_blank" rel="noopener">${escapeHtml(s)}</a>`;
  }).join(" · ");
}
function gpxSearchBtn(r) {
  const q = encodeURIComponent(`${r.name} GPX track download`);
  return `<a class="gpx-btn" href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener" title="${t("gpxSearch")}">⤓ GPX suchen</a>`;
}

/* ---------- Saison-Parsing ---------- */
const MONATE = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const MONAT_MAP = {
  januar:1, jan:1, februar:2, feb:2, märz:3, mär:3, maerz:3, april:4, apr:4, mai:5,
  juni:6, jun:6, juli:7, jul:7, august:8, aug:8, september:9, sep:9, oktober:10, okt:10,
  november:11, nov:11, dezember:12, dez:12
};
const SAISON_KEYWORDS = {
  "ganzjähr": [1,2,3,4,5,6,7,8,9,10,11,12],
  "spätsommer": [7,8,9], "herbst": [9,10,11],
  "frühling": [3,4,5], "frühjahr": [3,4,5],
  "winter": [12,1,2], "sommer": [6,7,8]
};
function parseSeason(str) {
  if (!str) return [];
  const t = str.toLowerCase();
  const found = [];
  const re = /(januar|jan|februar|feb|märz|mär|maerz|april|apr|mai|juni|jun|juli|jul|august|aug|september|sep|oktober|okt|november|nov|dezember|dez)/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    found.push({ month: MONAT_MAP[m[1]], pos: m.index, end: m.index + m[0].length });
  }
  if (found.length === 0) {
    for (const kw of Object.keys(SAISON_KEYWORDS)) {
      if (t.includes(kw)) return SAISON_KEYWORDS[kw];
    }
    return [];
  }
  if (found.length === 1) {
    for (const kw of Object.keys(SAISON_KEYWORDS)) {
      if (t.includes(kw)) return SAISON_KEYWORDS[kw];
    }
    return [found[0].month];
  }
  const months = new Set();
  for (let i = 0; i < found.length; i++) {
    const cur = found[i];
    const next = found[i+1];
    if (next) {
      const between = t.slice(cur.end, next.pos);
      if (/[-–—]|bis/.test(between)) {
        let a = cur.month;
        const b = next.month;
        months.add(a);
        do { a = a === 12 ? 1 : a + 1; months.add(a); } while (a !== b);
        i++;
        continue;
      }
    }
    const before = t.slice(Math.max(0, cur.pos - 14), cur.pos);
    const ctxHit = Object.keys(SAISON_KEYWORDS).find(kw => before.includes(kw));
    if (ctxHit) { SAISON_KEYWORDS[ctxHit].forEach(mo => months.add(mo)); }
    else months.add(cur.month);
  }
  return [...months].sort((a,b) => a - b);
}
if (window.DB && window.DB.routes) {
  DB.routes.forEach(r => r._months = parseSeason(r.season || ""));
}

/* ---------- Rechtliches & Compliance (Impressum / Datenschutz / Disclaimer / Feedback) ---------- */

function openImpressumModal() {
  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <span style="font-size:2.2rem">⚖️</span>
      <div>
        <h2>Impressum</h2>
        <div class="md-sub">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</div>
      </div>
    </div>
    
    <div class="alert-callout alert-info">
      <span class="alert-icon">💡</span>
      <div><b>Unkommerzielles Open-Data-Projekt:</b> Rydo ist eine kostenlose, werbefreie Informations- und Planungsplattform für Motorrad-, Bikepacking- und Wohnmobilreisende.</div>
    </div>

    <div class="md-section">
      <h3>Diensteanbieter &amp; Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)</h3>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem 1.2rem;line-height:1.7;margin:.6rem 0">
        <strong>Simon Reichel · Rydo Adventure Portal</strong><br>
        Musterstraße 1<br>
        12345 Musterstadt<br>
        Deutschland<br><br>
        <strong>Kontakt:</strong><br>
        E-Mail: <a href="mailto:kontakt@rydo.app" style="color:var(--accent)">kontakt@rydo.app</a><br>
        Website: <a href="https://rydo.travel" style="color:var(--accent)" target="_blank" rel="noopener">rydo.travel</a>
      </div>
    </div>

    <div class="md-section">
      <h3>EU-Streitschlichtung &amp; Verbraucherschlichtung</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener" style="color:var(--accent)">https://ec.europa.eu/consumers/odr/</a>.<br>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </div>

    <div class="md-section">
      <h3>Haftung für Inhalte und Links</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Bei Bekanntwerden von Rechtsverletzungen werden wir entsprechende Inhalte umgehend entfernen.
      </p>
    </div>

    <div style="display:flex;justify-content:flex-end;margin-top:1.5rem">
      <button class="btn btn-primary" onclick="closeModal()">Schließen</button>
    </div>
  `;
  setDeepLink("impressum", "");
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function openDatenschutzModal() {
  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <span style="font-size:2.2rem">🔒</span>
      <div>
        <h2>Datenschutzerklärung</h2>
        <div class="md-sub">Datenschutz nach EU-Datenschutz-Grundverordnung (DSGVO)</div>
      </div>
    </div>

    <div class="alert-callout alert-success">
      <span class="alert-icon">🛡️</span>
      <div><b>100% Werbefrei &amp; Kein Tracking:</b> Rydo setzt keine Werbe-Cookies, keine Marketing-Pixel und kein Google Analytics oder Facebook-Pixel ein. Alle persönlichen Favoriten und Notizen verbleiben rein lokal auf deinem Endgerät.</div>
    </div>

    <div class="md-section">
      <h3>1. Verantwortliche Stelle</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br>
        Simon Reichel · Projekt Rydo<br>
        E-Mail: <a href="mailto:kontakt@rydo.app" style="color:var(--accent)">kontakt@rydo.app</a>
      </p>
    </div>

    <div class="md-section">
      <h3>2. Lokale Speicherung (LocalStorage &amp; Offline-PWA)</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Damit du Rydo offline und ohne Registrierung nutzen kannst, speichert dein Browser Einstellungen (Dark/Light-Theme, gewählte Sprache, gemerkte Favoriten, eigene Reisen &amp; Packlisten) lokal im sogenannten <b>LocalStorage</b> und über den <b>Service Worker Cache</b> deines Endgeräts. Diese Daten verbleiben auf deinem Smartphone/Computer und werden zu keinem Zeitpunkt an externe Server übermittelt.
      </p>
    </div>

    <div class="md-section">
      <h3>3. Externe Schnittstellen &amp; Drittanbieter</h3>
      <ul style="font-size:.86rem;color:var(--text-muted);line-height:1.6;padding-left:1.2rem">
        <li><b>OpenStreetMap &amp; Kartenkacheln:</b> Zur Darstellung der interaktiven Routen und Pässe lädt die Karte Kacheln von OpenStreetMap-Servern (OpenStreetMap Foundation, UK) sowie Leaflet-Skripte (unpkg CDN). Hierbei wird technisch bedingt deine IP-Adresse an diese Server übertragen.</li>
        <li><b>Open-Meteo (Wettervorhersage):</b> Für die Abfrage der 7-Tage-Wettervorhersage bei Pässen wird eine Koordinatenanfrage an open-meteo.com gesendet. Es werden keine personenbezogenen Daten übermittelt.</li>
        <li><b>FlagCDN:</b> Zur optimierten Darstellung von Länderflaggen werden Bilddateien von flagcdn.com bezogen.</li>
      </ul>
    </div>

    <div class="md-section">
      <h3>4. Deine Betroffenenrechte</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Du hast nach Art. 15–21 DSGVO jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten Daten sowie ein Recht auf Berichtigung, Sperrung oder Löschung. Wende dich dazu formlos an <a href="mailto:kontakt@rydo.app" style="color:var(--accent)">kontakt@rydo.app</a>.
      </p>
    </div>

    <div style="display:flex;justify-content:flex-end;margin-top:1.5rem">
      <button class="btn btn-primary" onclick="closeModal()">Verstanden</button>
    </div>
  `;
  setDeepLink("datenschutz", "");
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function openDisclaimerModal() {
  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <span style="font-size:2.2rem">⚠️</span>
      <div>
        <h2>Haftungsausschluss &amp; Sicherheitshinweise</h2>
        <div class="md-sub">Wichtige Grundregeln für Gebirgs- und Fernreisen</div>
      </div>
    </div>

    <div class="alert-callout alert-warning">
      <span class="alert-icon">🏔️</span>
      <div><b>Befahrung auf eigene Gefahr:</b> Das Befahren von Alpenpässen, Hochgebirgsstraßen und Offroad-Routen erfordert sorgfältige Vorbereitung, entsprechende Schutzkleidung und fahrerisches Können.</div>
    </div>

    <div class="md-section">
      <h3>1. Witterung, Passsperrungen &amp; Straßenverhältnisse</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Alle in Rydo hinterlegten Öffnungszeiten, Höhenmeter, Steigungsangaben, Straßenbeläge (A1–A5 Asphalt / O1–O5 Offroad) und GPX-Tracks basieren auf sorgfältigen Recherchen und Community-Erfahrungen. 
        Im Hochgebirge können sich Witterungs- und Straßenverhältnisse (Schnee, Murenabgänge, Steinschlag, Eisregen) innerhalb von Stunden drastisch ändern. Pässe können unangekündigt gesperrt werden. 
        <b>Informiere dich vor jeder Passüberquerung über die aktuellen Befahrbarkeitsberichte der örtlichen Straßenmeistereien, Polizei- oder Automobilclubs (ADAC, ÖAMTC, TCS etc.).</b>
      </p>
    </div>

    <div class="md-section">
      <h3>2. Maut-, Visa- und Einreisevorschriften</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Dokumentationspflichten (Carnet de Passage, Grüne Versicherungskarte, internationale Führerscheine, Umweltplaketten) und Mautgebühren unterliegen ständigen gesetzlichen Anpassungen. Prüfe vor Fernreisen die aktuellen Reise- und Sicherheitsinformationen deines Außenministeriums (z. B. Auswärtiges Amt Deutschland).
      </p>
    </div>

    <div class="md-section">
      <h3>3. Wildcamping &amp; Umwelt</h3>
      <p style="font-size:.86rem;color:var(--text-muted);line-height:1.55">
        Hinterlasse Rast- und Schlafplätze immer sauberer, als du sie vorgefunden hast (Leave no Trace). Beachte regionale Naturschutzgesetze, Parkverbote und lokale Waldbrandwarnstufen.
      </p>
    </div>

    <div style="display:flex;justify-content:flex-end;margin-top:1.5rem">
      <button class="btn btn-primary" onclick="closeModal()">Alles klar</button>
    </div>
  `;
  setDeepLink("disclaimer", "");
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function openFeedbackModal(prefilledContext = "") {
  const subject = prefilledContext ? `Rydo Meldung: ${prefilledContext}` : "Rydo Feedback / Hinweis";
  const body = prefilledContext 
    ? `Hallo Rydo-Team,%0D%0A%0D%0AIch habe eine Aktualisierung / Passsperrung / Korrektur zu "${prefilledContext}":%0D%0A%0D%0A[Deine Beschreibung hier...]%0D%0A`
    : `Hallo Rydo-Team,%0D%0A%0D%0AIch habe folgendes Feedback / eine Routen-Empfehlung:%0D%0A%0D%0A[Dein Feedback hier...]%0D%0A`;

  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <span style="font-size:2.2rem">💬</span>
      <div>
        <h2>Feedback &amp; Fehler melden</h2>
        <div class="md-sub">Hilf mit, Rydo für die gesamte Community aktuell zu halten</div>
      </div>
    </div>

    <p style="font-size:.9rem;color:var(--text);line-height:1.55;margin-bottom:1.2rem">
      Hast du eine Straßensperrung entdeckt, geänderte Mautgebühren, einen defekten Track oder einen Vorschlag für einen neuen Alpenpass? Wir freuen uns über jede Meldung!
    </p>

    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1.2rem;margin-bottom:1.5rem">
      <h4 style="margin:0 0 .5rem;color:var(--accent)">Direkt per E-Mail melden:</h4>
      <p style="font-size:.86rem;color:var(--text-muted);margin-bottom:1rem">Klicke auf den Button, um dein E-Mail-Programm mit einer vorgefertigten Vorlage zu öffnen:</p>
      <a class="btn btn-primary" href="mailto:kontakt@rydo.app?subject=${encodeURIComponent(subject)}&body=${body}">
        ✉️ E-Mail verfassen (kontakt@rydo.app)
      </a>
    </div>

    <div style="display:flex;justify-content:flex-end">
      <button class="btn" onclick="closeModal()">Schließen</button>
    </div>
  `;
  setDeepLink("feedback", prefilledContext || "");
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function reportIssue(type, name) {
  openFeedbackModal(`${type === 'pass' ? 'Pass' : 'Route'}: ${name}`);
}

/* ---------- Deep Linking & URL Hash Router ---------- */
function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  setTimeout(handleRoute, 150);
}

function handleRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return;
  
  const slashIdx = hash.indexOf("/");
  const type = slashIdx !== -1 ? hash.slice(0, slashIdx) : hash;
  const id = slashIdx !== -1 ? hash.slice(slashIdx + 1) : "";

  if (type === "pass" && id) {
    if (typeof openPassModal === "function") openPassModal(id);
  } else if (type === "route" && id) {
    if (typeof openRoute === "function") openRoute(id);
  } else if (type === "country" && id) {
    if (typeof openCountry === "function") openCountry(id);
  } else if (type === "view" && id) {
    showView(id);
  } else if (type === "impressum") {
    openImpressumModal();
  } else if (type === "datenschutz") {
    openDatenschutzModal();
  } else if (type === "disclaimer") {
    openDisclaimerModal();
  } else if (type === "feedback") {
    openFeedbackModal(id);
  } else if (document.getElementById("view-" + type)) {
    showView(type);
  }
}

function setDeepLink(type, id, title) {
  const newHash = id ? `#${type}/${id}` : (type === "view" ? (id === "start" ? "" : `#view/${id}`) : "");
  if (window.location.hash !== newHash) {
    if (newHash) {
      history.replaceState(null, "", newHash);
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }
  if (title) {
    document.title = `${title} | Rydo`;
  } else {
    document.title = "Rydo – Alpine Passes & Adventure Routes | Moto, Bike & Camper";
  }
}

function copyShareLink(type, id) {
  const url = `${window.location.origin}${window.location.pathname}#${type}/${encodeURIComponent(id)}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showShareFeedback();
    }).catch(() => {
      prompt("Link zum Teilen kopieren:", url);
    });
  } else {
    prompt("Link zum Teilen kopieren:", url);
  }
}

function showShareFeedback() {
  const btns = document.querySelectorAll(".share-link-btn");
  btns.forEach(btn => {
    const orig = btn.innerHTML;
    btn.innerHTML = "✅ Link kopiert!";
    btn.classList.add("btn-primary");
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove("btn-primary");
    }, 2200);
  });
}

/* ---------- Navigation & Dropdowns ---------- */
function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const viewEl = document.getElementById("view-" + name);
  if (viewEl) viewEl.classList.add("active");

  // Highlight active view button
  document.querySelectorAll("#mainnav button[data-view]").forEach(b =>
    b.classList.toggle("active", b.dataset.view === name));

  // Highlight parent dropdown trigger if one of its children is active
  document.querySelectorAll(".nav-dropdown").forEach(dropdown => {
    const hasActive = !!dropdown.querySelector(`button[data-view="${name}"]`);
    const trigger = dropdown.querySelector(".nav-dropdown-trigger");
    if (trigger) trigger.classList.toggle("active", hasActive);
  });

  // Close open dropdowns & mobile nav
  closeAllNavDropdowns();
  const mobNav = document.getElementById("mainnav");
  if (mobNav) mobNav.classList.remove("mobile-open");

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "karte") setTimeout(() => { initMap(); if (map) map.invalidateSize(); }, 60);
  if (name === "kalender") setTimeout(buildCalendarOnce, 40);
  if (name === "wohnmobil") setTimeout(() => { renderCamperRoutes(); renderAccommodations(); }, 40);
  if (name === "meine-reisen") setTimeout(renderReisen, 40);
  if (name === "paesse") setTimeout(renderPassTrackerStats, 40);
  if (name === "tools") setTimeout(() => { renderPackingList(); calculateTripCosts(); }, 40);
  if (name !== "start") {
    setDeepLink("view", name);
  } else if (!window.location.hash.includes("/")) {
    setDeepLink("", "");
  }
}

function selectNavView(name) {
  showView(name);
}

function toggleNavDropdown(id, event) {
  if (event) event.stopPropagation();
  const dd = document.getElementById(id);
  if (!dd) return;
  const wasOpen = dd.classList.contains("open");
  closeAllNavDropdowns();
  if (!wasOpen) {
    dd.classList.add("open");
    const trigger = dd.querySelector(".nav-dropdown-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }
}

function closeAllNavDropdowns() {
  document.querySelectorAll(".nav-dropdown").forEach(d => {
    d.classList.remove("open");
    const trigger = d.querySelector(".nav-dropdown-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
}

function toggleMobileNav() {
  const nav = document.getElementById("mainnav");
  const toggle = document.getElementById("navMobileToggle");
  if (!nav) return;
  const isOpen = nav.classList.toggle("mobile-open");
  if (toggle) toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

// Click outside closes dropdowns
document.addEventListener("click", e => {
  if (!e.target.closest(".nav-dropdown")) {
    closeAllNavDropdowns();
  }
});
function dismissOnboarding() {
  localStorage.setItem("mrs_onboard_dismissed", "1");
  const el = document.getElementById("onboarding");
  if (el) el.style.display = "none";
}

/* ---------- Init & Lifecycle ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLang();
  updateFavCounters();
  renderStats();
  renderContinentGrid();
  renderCountryFilter();
  renderCountries();
  fillRouteCountryFilter();
  renderRoutes();
  renderTopRoutes();
  renderTopProblems();
  renderTopPasses();
  renderPassTrackerStats();
  renderCarousels();
  renderProblemFilter();
  renderProblems();
  renderPrep("dokumente");
  renderSources();
  fillAccommFilters();
  renderAccommodations();
  renderCamperRoutes();
  renderReisen();
  renderFinder();

  const si = document.getElementById("searchInput");
  if (si) {
    si.addEventListener("keydown", e => {
      if (e.key === "Escape") { si.value = ""; doSearch(); si.blur(); }
    });
  }

  if (!localStorage.getItem("mrs_onboard_dismissed")) {
    const ob = document.getElementById("onboarding");
    if (ob) ob.style.display = "flex";
  }

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    });
  }

  // URL Hash Deep Linking
  initRouter();
});

/* ---------- Suche ---------- */
function doSearch() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  state.searchQuery = q;
  const fb = document.getElementById("searchFeedback");
  if (!q) {
    if (fb) { fb.style.display = "none"; fb.textContent = ""; }
    showView("start");
    return;
  }

  const countryHits = DB.countries.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.highlights || []).some(h => h.toLowerCase().includes(q)) ||
    (c.summary || "").toLowerCase().includes(q));

  const routeHits = DB.routes.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    (r.countries || []).some(c => c.toLowerCase().includes(q)));

  if (fb) {
    fb.style.display = "block";
    fb.textContent = `🔍 ${countryHits.length} Länder, ${routeHits.length} Routen für „${q}“ — ESC löscht`;
    fb.setAttribute("role", "status");
    fb.setAttribute("aria-live", "polite");
  }

  if (countryHits.length || routeHits.length) {
    if (countryHits.length >= routeHits.length) {
      showView("laender");
      renderCountries(countryHits);
    } else {
      showView("routen");
      renderRoutes(routeHits);
    }
  } else {
    showView("routen");
    renderRoutes([]);
  }
}

/* ---------- Start & Stats ---------- */
function renderStats() {
  const s = DB.stats || {
    countries: DB.countries ? DB.countries.length : 47,
    routes: DB.routes ? DB.routes.length : 107,
    problems: DB.problems ? DB.problems.length : 41,
    bikepacking: DB.routes ? DB.routes.filter(r=>r.type==="bikepacking").length : 0,
    motorrad: DB.routes ? DB.routes.filter(r=>r.type==="motorrad").length : 0
  };
  const passCount = DB.passes ? DB.passes.length : 283;
  const roundtripsCount = DB.routes ? DB.routes.filter(r => r.isRoundTrip || r.roundTrip).length : 39;
  const statBox = document.getElementById("statBox");
  if (statBox) {
    statBox.innerHTML = `
      <div class="stat stat-clickable" onclick="showView('routen')" title="Zu den Routen &amp; Trips springen" role="button" tabindex="0">
        <b>${s.routes}</b>
        <span>${t("statRoutes")}</span>
        <small class="stat-hint">Erkunden ➔</small>
      </div>
      <div class="stat stat-clickable" onclick="showView('paesse')" title="Zu den Pässen weltweit springen" role="button" tabindex="0">
        <b>${passCount}</b>
        <span>Pässe weltweit</span>
        <small class="stat-hint">Erkunden ➔</small>
      </div>
      <div class="stat stat-clickable" onclick="showView('finder')" title="Zum 360°-Rundreiseplaner springen" role="button" tabindex="0">
        <b>${roundtripsCount || 39}</b>
        <span>360°-Rundreisen</span>
        <small class="stat-hint">Planen ➔</small>
      </div>
      <div class="stat stat-clickable" onclick="showView('laender')" title="Zur Länder- &amp; Regendatenbank springen" role="button" tabindex="0">
        <b>${s.countries}</b>
        <span>${t("statCountries")}</span>
        <small class="stat-hint">Ansehen ➔</small>
      </div>
      <div class="stat stat-clickable" onclick="showView('lektionen')" title="Zu den Pannen-Lektionen &amp; Warnungen springen" role="button" tabindex="0">
        <b>${s.problems}</b>
        <span>${t("statProbs")}</span>
        <small class="stat-hint">Lesen ➔</small>
      </div>
    `;
  }
}

function renderContinentGrid() {
  const counts = {};
  DB.countries.forEach(c => counts[c.continent] = (counts[c.continent] || 0) + 1);
  const icons = {
    "Europa": "🏰", "Asien": "🏔️", "Afrika": "🦁",
    "Amerika (Nord)": "🗽", "Amerika (Süd)": "🌄", "Ozeanien": "🐨"
  };
  let html = Object.entries(counts).map(([cont, n]) => `
    <div class="continent-card" onclick="filterByContinent('${escapeHtml(cont)}')">
      <b>${icons[cont] || "🌍"} ${escapeHtml(cont)}</b><span>${n} Länder dokumentiert</span>
    </div>`).join("");
  html += `<div class="continent-card" onclick="filterByContinent('Alle')">
      <b>🌐 Alle</b><span>${DB.countries.length} Länder total</span></div>`;
  const el = document.getElementById("continentGrid");
  if (el) el.innerHTML = html;
}

function filterByContinent(cont) {
  state.continentFilter = cont;
  showView("laender");
  renderCountryFilter();
  renderCountries();
}

/* ---------- Länder ---------- */
function renderCountryFilter() {
  const el = document.getElementById("countryFilter");
  if (!el) return;
  el.innerHTML = DB.continents.map(c =>
    `<button class="chip ${state.continentFilter === c ? "active" : ""}" onclick="setContinent('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join("")
    + `<button class="chip" id="favFilterCountry" onclick="toggleFavFilterCountry()">⭐ Favoriten</button>`;
}
function setContinent(c) {
  state.continentFilter = c;
  renderCountryFilter();
  renderCountries();
}

function countryMatches(routeCountries, name) {
  return routeCountries.some(c =>
    c === name ||
    c.startsWith(name + " ") ||
    c.startsWith(name + "/") ||
    c.includes("/" + name) ||
    (c === name.split("-")[0] && c.length > 3)
  );
}

function buildCountryCard(c) {
  const hasCarnet = (c.prep && c.prep.carnet) === true;
  const greenCard = /GRÜNE KARTE/i.test((c.prep && c.prep.versicherung) || "");
  const problems = (c.problems || []).length;
  const countRoutes = DB.routes.filter(r => countryMatches(r.countries, c.name)).length;
  const iso = getCountryIso(c.id || c.name);
  const flagHtml = iso 
    ? `<img src="https://flagcdn.com/w80/${iso.toLowerCase()}.png" class="cc-flag-img" width="44" height="30" alt="${escapeHtml(c.name)}" loading="lazy">`
    : `<span class="cc-flag">${c.flag || "🏳️"}</span>`;
  return `
  <div class="country-card" onclick="openCountry('${escapeHtml(c.id)}')">
    ${starBtn("c:" + c.id, "Land merken")}
    <div class="cc-head">
      <div class="cc-flag-wrap">${flagHtml}</div>
      <div><div class="cc-name">${escapeHtml(c.name)}</div><div class="cc-cont">${escapeHtml(c.continent)}</div></div>
    </div>
    <div class="cc-summary">${escapeHtml((c.summary || "").slice(0, 130))}…</div>
    <div class="cc-badges">
      ${hasCarnet ? '<span class="badge red" title="Carnet de Passage Pflicht">📕 Carnet</span>' : '<span class="badge green" title="Kein Carnet nötig">kein Carnet</span>'}
      ${greenCard ? '<span class="badge yellow" title="Grüne Versicherungskarte Pflicht">🛡️ Grüne Karte</span>' : ''}
      ${problems ? `<span class="badge red">⚠️ ${problems} Lektion${problems > 1 ? "en" : ""}</span>` : ''}
      <span class="badge blue">🛣️ ${countRoutes} Route(n)</span>
    </div>
  </div>`;
}

function renderCountries(list) {
  let countries = list || DB.countries;
  const filterActive = !list && (state.continentFilter !== "Alle" || state.favOnlyCountry);
  if (!list && state.continentFilter !== "Alle") {
    countries = DB.countries.filter(c => c.continent === state.continentFilter);
  }
  if (!list && state.favOnlyCountry) {
    countries = countries.filter(c => isFav("c:" + c.id));
  }

  const countEl = document.getElementById("countryCount");
  if (countEl) countEl.textContent = `${countries.length} Länder gefunden`;

  const grid = document.getElementById("countryGrid");
  if (!grid) return;
  if (!countries.length) {
    grid.innerHTML = `<p class="hint">${state.favOnlyCountry ? "Noch keine Länder als Favorit markiert." : t("noResults")}</p>`;
    grid.className = "country-grid";
    return;
  }

  // Continent icons mapping
  const contIcons = {
    "Europa": "🏰", "Asien": "🏔️", "Afrika": "🦁",
    "Amerika (Nord)": "🗽", "Amerika (Süd)": "🌄", "Ozeanien": "🐨"
  };

  // Group by Continent
  const grouped = {};
  countries.forEach(c => {
    const cont = c.continent || "Sonstige";
    if (!grouped[cont]) grouped[cont] = [];
    grouped[cont].push(c);
  });

  const continents = Object.keys(grouped).sort();
  let html = `<div class="pass-groups-container">`;

  continents.forEach(cont => {
    const listInCont = grouped[cont].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    const icon = contIcons[cont] || "🌍";

    html += `
      <details class="group-details country-group" ${filterActive ? 'open' : ''}>
        <summary class="group-summary">
          <div class="group-summary-inner">
            <span class="group-title">${icon} ${escapeHtml(cont)}</span>
            <span class="badge">${listInCont.length} ${listInCont.length === 1 ? 'Land' : 'Länder'}</span>
          </div>
        </summary>
        <div class="group-content">
          <div class="country-grid" style="padding: 1rem;">
            ${listInCont.map(c => buildCountryCard(c)).join("")}
          </div>
        </div>
      </details>
    `;
  });
  html += `</div>`;

  grid.innerHTML = html;
  grid.className = ""; // Remove country-grid on container so accordions span full width
  updateFavCounters();
}

function openCountry(id) {
  const c = DB.countries.find(x => x.id === id);
  if (!c) return;
  const routesHere = DB.routes.filter(r => countryMatches(r.countries, c.name));
  const bikepacking = routesHere.filter(r => r.type === "bikepacking");

  const prepRows = [
    ["Visum", c.prep ? c.prep.visum : "-"],
    ["Carnet de Passage", (c.prep && c.prep.carnet) ? "⚠️ PFLICHT" : "Nicht nötig"],
    ["Versicherung", c.prep ? c.prep.versicherung : "-"],
    ["Führerschein", c.prep ? c.prep.fuehrerschein : "-"],
    ["Fahrzeugdokumente", c.prep ? c.prep.fahrzeugbrief : "-"],
    ["Sonderregeln", c.prep ? c.prep.sonderregeln : "-"]
  ].map(([l,v]) => `<div class="doc-row"><div class="doc-label">${escapeHtml(l)}</div><div class="doc-value">${escapeHtml(v || "-")}</div></div>`).join("");

  // Alert Callout für besondere Gefahren
  let dangerCallout = "";
  if (c.prep && c.prep.sonderregeln && (c.prep.sonderregeln.includes("VERBOTEN") || c.prep.sonderregeln.includes("MINEN"))) {
    dangerCallout = `
      <div class="alert-callout alert-danger">
        <span class="alert-icon">⚠️</span>
        <div><b>Wichtige Warnung für ${escapeHtml(c.name)}:</b><br>${escapeHtml(c.prep.sonderregeln)}</div>
      </div>`;
  } else if (c.prep && c.prep.carnet) {
    dangerCallout = `
      <div class="alert-callout alert-warning">
        <span class="alert-icon">📕</span>
        <div><b>Carnet de Passage Zwingend Erforderlich:</b><br>Die Einreise mit eigenem Fahrzeug verlangt ein gültiges Carnet de Passage (beim ADAC/Automobilclub vorab beantragen!).</div>
      </div>`;
  }

  const routeHtml = routesHere.map(r => `
    <div class="mini-route" onclick="closeModal(); setTimeout(()=>openRoute('${escapeHtml(r.id)}'),120)" style="cursor:pointer">
      <b>${escapeHtml(r.name)}</b> <span class="rc-type ${r.type}" style="display:inline">${r.type === "motorrad" ? "🏍️" : r.type === "wohnmobil" ? "🚐" : "🚵"} ${escapeHtml(r.type)}</span>${r.wildcamping ? ' <span class="badge green">🏕️</span>' : ''}
      <span>${escapeHtml(r.distance)} · ${escapeHtml(r.duration)} · Saison: ${escapeHtml(r.season)} · <span class="diff-${r.difficulty.split(/[\s\-]/)[0]}">${escapeHtml(r.difficulty)}</span></span>
      <span style="margin-top:.3rem">${escapeHtml(r.description.slice(0, 180))}…</span>
      <div style="font-size:.74rem;color:var(--accent);margin-top:.4rem;font-weight:600">Klicken für alle Details + Karte →</div>
    </div>`).join("") || "<p class='hint'>Keine detaillierten Routen erfasst — siehe Quellen.</p>";

  const bpHtml = bikepacking.length ? `<div class="md-section"><h3>🚵 Bikepacking-Routen im Land</h3>${bikepacking.map(r => `<div class="mini-route"><b>${escapeHtml(r.name)}</b><span>${escapeHtml(r.distance)} · ${escapeHtml(r.difficulty)}</span></div>`).join("")}</div>` : "";

  const probHtml = (c.problems || []).map(p => `
    <div class="problem-card sev-hoch" style="margin-bottom:.5rem">
      <div class="pc-head"><span class="badge yellow">ERFAHRUNGSBERICHT</span></div>
      <div class="pc-story">⚠️ ${escapeHtml(p)}</div>
    </div>`).join("");

  const globalProbs = DB.problems.filter(p => p.country && countryMatches([p.country], c.name));
  const gProbHtml = globalProbs.map(p => `
    <div class="problem-card sev-${p.severity}" style="margin-bottom:.5rem">
      <div class="pc-head">${sevBadge(p.severity)}<span class="pc-title">${escapeHtml(p.title)}</span> <span class="pc-meta">· ${escapeHtml(p.source)}</span></div>
      <div class="pc-story">${escapeHtml(p.story)}</div>
      <div class="pc-lesson">${escapeHtml(p.lesson)}</div>
    </div>`).join("");

  const wc = c.wildcamping;
  const wcHtml = wc ? `<div class="md-section" style="border-left:3px solid ${wc.legal.includes('🟢') ? '#22c55e' : wc.legal.includes('🟡') ? '#f59e0b' : '#ef4444'};padding-left:14px">
    <h3>🏕️ Wildcamping & Freistehen</h3>
    <div class="doc-row"><div class="doc-label">Rechtslage</div><div class="doc-value">${escapeHtml(wc.legal)}</div></div>
    <div class="doc-row"><div class="doc-label">Notbiwak</div><div class="doc-value">${escapeHtml(wc.bivouac)}</div></div>
    <div class="doc-row"><div class="doc-label">Praxis-Tipps</div><div class="doc-value">${escapeHtml(wc.tips)}</div></div>
    <div class="doc-row"><div class="doc-label">Empfohlene Apps</div><div class="doc-value">${escapeHtml((wc.apps || []).join(" · "))}</div></div>
    <div style="font-size:11px;color:var(--muted);margin-top:5px">${escapeHtml(wc.legal_ref || "")}</div>
  </div>` : "";

  const mr = c.motoRules;
  const motoHtml = mr ? `<div class="md-section" style="border-left:3px solid var(--accent);padding-left:14px;background:rgba(255,107,53,0.04);border-radius:0 8px 8px 0;margin:1rem 0">
    <h3 style="color:var(--accent);display:flex;align-items:center;gap:.4rem">🏍️ Motorrad-Spezialregeln &amp; Gesetze</h3>
    ${mr.specialWarning ? `<div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:.6rem .8rem;margin-bottom:.6rem;font-size:.84rem;color:#f87171"><strong>⚠️ ACHTUNG:</strong> ${escapeHtml(mr.specialWarning)}</div>` : ''}
    ${mr.soundLimit ? `<div class="doc-row"><div class="doc-label">🔊 Lärm &amp; dB</div><div class="doc-value">${escapeHtml(mr.soundLimit)}</div></div>` : ''}
    ${mr.equipment ? `<div class="doc-row"><div class="doc-label">🦺 Ausrüstungspflicht</div><div class="doc-value">${escapeHtml(mr.equipment)}</div></div>` : ''}
    ${mr.vignette ? `<div class="doc-row"><div class="doc-label">🎫 Maut &amp; Vignette</div><div class="doc-value">${escapeHtml(mr.vignette)}</div></div>` : ''}
    ${mr.traffic ? `<div class="doc-row"><div class="doc-label">🚦 Verkehrsregeln</div><div class="doc-value">${escapeHtml(mr.traffic)}</div></div>` : ''}
  </div>` : "";

  const iso = getCountryIso(c.id || c.name);
  const flagHtml = iso 
    ? `<img src="https://flagcdn.com/w80/${iso.toLowerCase()}.png" class="md-flag-img" width="54" height="38" alt="${escapeHtml(c.name)}">`
    : `<span class="md-flag">${c.flag || "🏳️"}</span>`;

  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <div class="md-flag-wrap">${flagHtml}</div>
      <div><h2>${escapeHtml(c.name)}</h2><div class="md-sub">${escapeHtml(c.continent)}</div></div>
    </div>
    ${dangerCallout}
    <p style="color:var(--muted);margin-bottom:1.4rem;line-height:1.6">${escapeHtml(c.summary)}</p>
    <div class="md-section"><h3>📄 Einreise, Dokumente & Versicherung</h3>${prepRows}</div>
    ${motoHtml}
    ${wcHtml}
    <div class="md-section"><h3>⭐ Highlights</h3><p>${escapeHtml((c.highlights || []).join(" · "))}</p></div>
    ${bpHtml}
    <div class="md-section"><h3>🛣️ Dokumentierte Strecken & Routen (${routesHere.length})</h3>${routeHtml}</div>
    ${(probHtml || gProbHtml) ? `<div class="md-section"><h3>⚠️ Gemeldete Probleme & Lektionen</h3>${probHtml}${gProbHtml}</div>` : ""}
    <div class="md-section"><h3>📚 Quellen für dieses Land</h3><p>${escapeHtml((c.sources || []).join(" · "))}</p></div>
    <div style="display:flex;justify-content:flex-end;margin-top:1.2rem;gap:.6rem;flex-wrap:wrap">
      <button class="btn share-link-btn" onclick="copyShareLink('country', '${escapeHtml(c.id)}')">🔗 Link teilen</button>
      <button class="btn btn-primary" onclick="closeModal()">Schließen</button>
    </div>
  `;
  setDeepLink("country", c.id, c.name);
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const m = document.getElementById("modal");
  if (m) m.classList.add("hidden");
  document.body.style.overflow = "";

  const hash = window.location.hash;
  if (hash.startsWith("#pass/") || hash.startsWith("#route/") || hash.startsWith("#country/") || 
      hash === "#impressum" || hash === "#datenschutz" || hash === "#disclaimer" || hash.startsWith("#feedback")) {
    const activeView = document.querySelector(".view.active");
    const viewName = activeView ? activeView.id.replace("view-", "") : "start";
    setDeepLink("view", viewName);
  }
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------- Routen & Trips ---------- */
function fillRouteCountryFilter() {
  const sel = document.getElementById("routeCountryFilter");
  if (!sel) return;
  const all = new Set();
  DB.routes.forEach(r => (r.countries || []).forEach(c => all.add(c)));
  [...all].sort().forEach(c => {
    const o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o);
  });
}

function diffClass(d) {
  if (!d) return "diff-leicht";
  if (d.startsWith("leicht")) return "diff-leicht";
  if (d.startsWith("mittel")) return "diff-mittel";
  if (d.startsWith("schwer")) return "diff-schwer";
  return "diff-extrem";
}

function getRouteContinents(r) {
  if ((r.countries || []).includes("viele (Europa)")) return ["Europa"];
  const set = new Set();
  (r.countries || []).forEach(c => {
    const clean = c.split(" (")[0].split("/")[0].trim();
    const found = DB.countries.find(x => x.name === clean || x.name === c);
    if (found) set.add(found.continent);
    else if (c.includes("USA") || c.includes("Kanada") || c.includes("Mexiko")) set.add("Amerika (Nord)");
    else if (c.includes("Chile") || c.includes("Argentinien") || c.includes("Peru") || c.includes("Bolivien") || c.includes("Brasilien") || c.includes("Kolumbien")) set.add("Amerika (Süd)");
    else if (c.includes("Australien") || c.includes("Neuseeland")) set.add("Ozeanien");
    else if (c.includes("Marokko") || c.includes("Mauretanien") || c.includes("Senegal") || c.includes("Südafrika") || c.includes("Mosambik")) set.add("Afrika");
    else if (c.includes("Russland") || c.includes("China") || c.includes("Mongolei") || c.includes("Iran") || c.includes("Georgien") || c.includes("Kirgisistan") || c.includes("Tadschikistan") || c.includes("Indien") || c.includes("Vietnam") || c.includes("Thailand") || c.includes("Usbekistan") || c.includes("Aserbaidschan")) set.add("Asien");
  });
  return [...set];
}

function routeCardHtml(r, compact) {
  const icon = r.type === "motorrad" ? "🏍️ Motorrad" : r.type === "wohnmobil" ? "🚐 Wohnmobil" : "🚵 Bikepacking";
  return `
    <div class="route-card" onclick="openRoute('${escapeHtml(r.id)}')" style="cursor:pointer">
      ${starBtn("r:" + r.id, "Route merken")}
      <span class="rc-type ${r.type}">${icon}</span>${r.wildcamping ? ' <span class="badge green" title="Wildcamping möglich">🏕️ Wildcamp</span>' : ''}${r.uebernachtung ? ' ' + r.uebernachtung.slice(0,2).map(u => `<span class="badge blue" title="${escapeHtml(u)}">🛏️ ${escapeHtml(u)}</span>`).join('') : ''}
      <div class="rc-name">${escapeHtml(r.name)}</div>
      <div class="rc-countries">📍 ${withFlag(r.countries)}</div>
      <div class="rc-desc">${escapeHtml(compact ? (r.description || "").slice(0, 150) + "…" : r.description)}</div>
      <div class="rc-meta">
        <span class="meta-pill" title="Gesamtdistanz">📏 ${escapeHtml(r.distance)}</span>
        <span class="meta-pill" title="Empfohlene Reisedauer">⏳ ${escapeHtml(r.duration)}</span>
        <span class="meta-pill ${diffClass(r.difficulty)}" title="Schwierigkeitsgrad">⛰️ ${escapeHtml(r.difficulty)}</span>
        <span class="meta-pill" title="Empfohlene Reisezeit">📅 ${escapeHtml(r.season)}</span>
      </div>
      ${!compact && r.elevation ? `<div class="rc-meta"><span class="meta-pill" title="Höhenprofil / Pässe">🏔️ ${escapeHtml(r.elevation)}</span></div>` : ""}
      <div style="display:flex;gap:.5rem;margin-top:.5rem;align-items:center;flex-wrap:wrap">
        <button class="btn" style="padding:.32rem .8rem;font-size:.8rem" onclick="event.stopPropagation();quickAddRouteToReise('${escapeHtml(r.id)}')">${t("addToTrip")}</button>
        ${!compact ? `<div class="rc-src" style="flex:1;border-top:none;padding-top:0;margin-top:0">🔗 ${linkifySources(r.gpxSource)} &nbsp;${gpxSearchBtn(r)}</div>` : ""}
      </div>
    </div>`;
}

function getRouteGrouping(r) {
  const cList = r.countries || [];
  const firstC = cList.length > 0 ? cList[0] : "International";
  let cleanCountry = firstC;
  let region = r.region || "";

  const parenMatch = firstC.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    cleanCountry = parenMatch[1].trim();
    if (!region) region = parenMatch[2].trim();
  } else if (firstC.includes("/")) {
    const parts = firstC.split("/").map(p => p.trim());
    cleanCountry = parts[0];
    if (!region && parts.length > 1) region = parts[1];
  }

  if (cList.length > 1 && !parenMatch && !firstC.includes("/")) {
    cleanCountry = "Trans-Europa & Fernreisen";
    if (!region) region = `${cList[0]} → ${cList[cList.length - 1]} (${cList.length} Länder)`;
  }

  if (!region) {
    if (r.type === "motorrad") region = "Kuratierte Motorrad-Touren";
    else if (r.type === "wohnmobil") region = "Camper- & Vanlife-Rundreisen";
    else if (r.type === "bikepacking") region = "Bikepacking & Gravel-Trails";
    else region = "Highlights & Rundtouren";
  }

  return { country: cleanCountry, region: region };
}

function renderRoutes(list) {
  const typeEl = document.getElementById("routeTypeFilter");
  const diffEl = document.getElementById("routeDiffFilter");
  const countryEl = document.getElementById("routeCountryFilter");
  const continentEl = document.getElementById("routeContinentFilter");
  const accommEl = document.getElementById("routeAccommFilter");

  const type = typeEl ? typeEl.value : "alle";
  const diff = diffEl ? diffEl.value : "alle";
  const country = countryEl ? countryEl.value : "alle";
  const continent = continentEl ? continentEl.value : "alle";
  const accomm = accommEl ? accommEl.value : "alle";

  let routes = list || DB.routes;
  if (!list) {
    if (type !== "alle") routes = routes.filter(r => r.type === type);
    if (diff !== "alle") routes = routes.filter(r => (r.difficulty || "").startsWith(diff));
    if (country !== "alle") routes = routes.filter(r => countryMatches(r.countries || [], country));
    if (continent !== "alle") routes = routes.filter(r => getRouteContinents(r).includes(continent));
    if (accomm !== "alle") routes = routes.filter(r => (r.uebernachtung || []).some(u => u.includes(accomm)));
    if (state.wildOnlyRoute) routes = routes.filter(r => r.wildcamping);
    if (state.favOnlyRoute) routes = routes.filter(r => isFav("r:" + r.id));
  }
  const q = state.searchQuery.toLowerCase();
  if (!list && q) {
    routes = DB.routes.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }

  const countEl = document.getElementById("routeCount");
  if (countEl) countEl.textContent = `${routes.length} Routen gefunden`;

  const grid = document.getElementById("routeGrid");
  if (!grid) return;
  if (!routes.length) {
    grid.innerHTML = `<p class="hint">${state.favOnlyRoute ? "Noch keine Routen als Favorit markiert." : t("noResults")}</p>`;
    grid.className = "route-grid big";
    return;
  }

  const hasFilter = !list && (type !== "alle" || diff !== "alle" || country !== "alle" || continent !== "alle" || accomm !== "alle" || state.wildOnlyRoute || state.favOnlyRoute || !!q);

  // Group routes by Country, then by Region
  const grouped = {};
  routes.forEach(r => {
    const g = getRouteGrouping(r);
    const c = g.country;
    const reg = g.region;
    if (!grouped[c]) grouped[c] = {};
    if (!grouped[c][reg]) grouped[c][reg] = [];
    grouped[c][reg].push(r);
  });

  const countries = Object.keys(grouped).sort();
  let html = `<div class="pass-groups-container">`;

  countries.forEach(c => {
    let flagHtml = getSingleFlagHtml(c);
    let totalInCountry = Object.values(grouped[c]).reduce((sum, arr) => sum + arr.length, 0);

    html += `
      <details class="group-details country-group" ${hasFilter ? 'open' : ''}>
        <summary class="group-summary">
          <div class="group-summary-inner">
            <span class="group-title">${flagHtml} ${escapeHtml(c)}</span>
            <span class="badge">${totalInCountry} ${totalInCountry === 1 ? 'Route' : 'Routen'}</span>
          </div>
        </summary>
        <div class="group-content">
    `;

    const regions = Object.keys(grouped[c]).sort();
    regions.forEach(reg => {
      let regionRoutes = grouped[c][reg];
      html += `
        <details class="group-details region-group" ${hasFilter ? 'open' : ''}>
          <summary class="group-summary region-summary">
            <div class="group-summary-inner">
              <span class="group-title">📍 ${escapeHtml(reg)}</span>
              <span class="badge" style="background:var(--border)">${regionRoutes.length}</span>
            </div>
          </summary>
          <div class="route-grid" style="padding: 1rem;">
            ${regionRoutes.map(r => routeCardHtml(r, false)).join("")}
          </div>
        </details>
      `;
    });

    html += `</div></details>`;
  });
  html += `</div>`;

  grid.innerHTML = html;
  grid.className = ""; // Remove route-grid from outer wrapper so accordions take full width
  updateFavCounters();
}

function renderTopRoutes() {
  const featured = ["pamir-highway","panamericana","transfagarasan","manali-leh","route-grandes-alpes","carretera-austral"];
  const routes = featured.map(id => DB.routes.find(r => r.id === id)).filter(Boolean);
  const el = document.getElementById("topRoutes");
  if (el) el.innerHTML = routes.map(r => routeCardHtml(r, true)).join("");
}

function openRoute(id) {
  const r = DB.routes.find(x => x.id === id);
  if (!r) return;
  const continents = getRouteContinents(r).join(" · ");
  const poisHtml = (r.pois || []).map(p => {
    const ic = POI_ICONS[p.type] || POI_ICONS.other;
    return `<div style="display:flex;gap:.8rem;padding:.65rem 0;border-bottom:1px solid var(--border);align-items:center">
      <span style="background:${ic.color};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;color:#fff">${ic.icon}</span>
      <div style="flex:1"><b>${escapeHtml(p.name)}</b><div style="font-size:.86rem;color:var(--muted)">${escapeHtml(p.desc)}</div><div style="font-size:.72rem;color:var(--muted)">${ic.label} · ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</div></div>
    </div>`;
  }).join("") || "<p class='hint'>Keine Detail-POIs hinterlegt. GPX downloaden für alle Wegpunkte.</p>";

  const wildHtml = r.wildcamping ? `<div class="alert-callout alert-success"><span class="alert-icon">🏕️</span><div><b>Wildcamping möglich:</b> Auf dieser Route ist Wildcampen/Freistehen etabliert bzw. legal möglich.</div></div>` : "";
  const geo = DB.routeGeo[r.id];
  const mapSnippet = geo ? `<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:.9rem 1.3rem;margin:1rem 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem">
    <span>📍 Zentrum: ${geo[0].toFixed(2)}, ${geo[1].toFixed(2)} · ${escapeHtml(r.distance)}</span>
    <button class="btn btn-primary" onclick="closeModal(); showView('karte'); setTimeout(()=>loadRouteGpx('${escapeHtml(r.id)}'),200)">${t("showOnMap")}</button>
  </div>` : "";

  document.getElementById("modalBody").innerHTML = `
    <div class="md-head">
      <span style="font-size:2.2rem">${r.type === "motorrad" ? "🏍️" : r.type === "wohnmobil" ? "🚐" : "🚵"}</span>
      <div><h2>${escapeHtml(r.name)}</h2><div class="md-sub">${r.type === "motorrad" ? "Motorrad" : r.type === "wohnmobil" ? "Wohnmobil" : "Bikepacking"} · ${escapeHtml(r.difficulty)} · ${escapeHtml(continents)}</div></div>
      <button class="star-btn ${isFav("r:" + r.id) ? "fav-active" : ""}" data-favkey="r:${r.id}" onclick="toggleFav('r:${r.id}')" style="position:static;margin-left:auto">${isFav("r:" + r.id) ? "★" : "☆"}</button>
    </div>
    ${wildHtml}
    <div style="display:flex;gap:.55rem;flex-wrap:wrap;margin:.9rem 0">
      <span class="meta-pill" title="Durchquerte Länder">📍 ${withFlag(r.countries)}</span>
      <span class="meta-pill" title="Distanz">📏 ${escapeHtml(r.distance)}</span>
      <span class="meta-pill" title="Dauer">⏳ ${escapeHtml(r.duration)}</span>
      <span class="meta-pill" title="Beste Reisezeit">📅 ${escapeHtml(r.season)}</span>
      ${r.elevation ? `<span class="meta-pill" title="Höhenmeter">🏔️ ${escapeHtml(r.elevation)}</span>` : ""}
    </div>
    ${r.uebernachtung ? `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin:.6rem 0">${r.uebernachtung.map(u => `<span class="badge blue">🛏️ ${escapeHtml(u)}</span>`).join('')}</div>` : ''}
    <p style="margin:.9rem 0;line-height:1.6">${escapeHtml(r.description)}</p>
    <div class="md-section"><h3>🔗 Quellen & GPX-Daten</h3>
      <div style="font-size:.88rem">${linkifySources(r.gpxSource)} &nbsp; ${gpxSearchBtn(r)}</div>
      ${r.gpxUrl ? `<div style="margin-top:.7rem"><a href="${encodeURI(r.gpxUrl)}" target="_blank" rel="noopener" class="btn btn-primary">📥 GPX direkt laden</a> <a href="${encodeURI(r.poiUrl || r.gpxUrl)}" target="_blank" rel="noopener" class="btn">📋 Detailseite</a></div>` : ""}
    </div>
    ${mapSnippet}
    <div class="md-section"><h3>📍 Route-Punkte & POIs (${(r.pois || []).length})</h3>${poisHtml}</div>

    <!-- Säule 4: Community- & Rider-Logbuch -->
    <div class="md-section" style="background:var(--bg2);padding:1.1rem;border-radius:12px;border:1px solid var(--border)">
      <h3 style="border:none;margin-bottom:.4rem">💬 Rider-Logbuch & Community-Meldungen</h3>
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">Teile deinen aktuellen Streckenzustand, Baustellen, Rollsplitt oder Pass-Erfahrungen mit der Community.</p>
      
      <div id="communityReportsList" style="margin-bottom:1rem"></div>

      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
        <select id="reportRating" class="form-select" style="max-width:140px;padding:.4rem .6rem;font-size:.82rem">
          <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
          <option value="4">⭐⭐⭐⭐ 4/5</option>
          <option value="3">⭐⭐⭐ 3/5</option>
          <option value="2">⭐⭐ 2/5</option>
          <option value="1">⭐ 1/5</option>
        </select>
        <select id="reportCondition" class="form-select" style="max-width:180px;padding:.4rem .6rem;font-size:.82rem">
          <option value="frei">🟢 Frei &amp; Top Zustand</option>
          <option value="warnung">🟡 Rollsplitt / Baustelle</option>
          <option value="gesperrt">🔴 Gesperrt / Problem</option>
        </select>
      </div>
      <div style="display:flex;gap:.5rem;align-items:center">
        <input type="text" id="reportNote" class="form-input" placeholder="Kurzer Hinweis (z.B. 'Stand 09/2026: Perfekt fahrbar!')" style="flex:1;padding:.45rem .8rem;font-size:.84rem">
        <button class="btn btn-primary" onclick="submitModalCommunityNote('${escapeHtml(r.id)}', '${escapeHtml(r.name)}')" style="padding:.45rem .9rem;font-size:.84rem">Senden</button>
      </div>
    </div>

    <div style="margin-top:1.4rem;display:flex;gap:.55rem;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closeModal(); showView('karte'); setTimeout(()=>loadRouteGpx('${escapeHtml(r.id)}'),300)">🗺️ Auf Karte & Höhenprofil</button>
      <button class="btn" onclick="quickAddRouteToReise('${escapeHtml(r.id)}'); closeModal();">➕ Zu Meiner Reise</button>
      <button class="btn share-link-btn" onclick="copyShareLink('route', '${escapeHtml(r.id)}')">🔗 Link teilen</button>
      <button class="btn secondary" onclick="reportIssue('route', '${escapeHtml(r.name)}')">⚠️ Fehler melden</button>
      <button class="btn" onclick="closeModal()">Schließen</button>
    </div>
  `;
  setDeepLink("route", r.id, r.name);
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => renderModalCommunityReportsList(r.id), 20);
}

function openRouteModal(id) {
  openRoute(id);
}

/* ---------- Vorbereitung ---------- */
function showPrepTab(tab, btn) {
  document.querySelectorAll(".prep-tabs button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderPrep(tab);
}

function renderPrep(tab) {
  const el = document.getElementById("prepContent");
  if (!el) return;

  const trustNotice = `
    <div class="trust-box">
      <b>💡 Wichtiger Hinweis zur Reiseplanung:</b> Einreise-, Visa- und Versicherungsregeln (z. B. Carnet de Passage & Grüne Karte) basieren auf aktuellen Reise- und Zolldokumentationen. Vor einer Fernreise immer tagesaktuell beim <b>Auswärtigen Amt</b> oder Automobilclub (ADAC/ÖAMTC/TCS) gegenprüfen.
    </div>
  `;

  if (tab === "dokumente") {
    el.innerHTML = `
    ${trustNotice}
    <div class="prep-block">
      <h3>Die 7 Kern-Dokumente jeder internationalen Reise</h3>
      <table>
        <tr><th>Dokument</th><th>Zweck</th><th>Kritisch</th></tr>
        <tr><td>🛂 Reisepass</td><td>Einreise, Visa</td><td>6+ Monate über Trip-Ende hinaus gültig!</td></tr>
        <tr><td>🏍️ Nationaler Führerschein</td><td>Legales Fahren</td><td>Muss Klasse A abdecken; Ablaufdatum checken</td></tr>
        <tr><td>🌐 Internationaler Führerschein (IDP)</td><td>Übersetzung/Anerkennung</td><td>Pflicht in vielen Nicht-EU-Ländern (~20–30 € beim Automobilclub)</td></tr>
        <tr><td>📄 Fahrzeugschein (Original)</td><td>Zulassungsnachweis</td><td>NICHT Kopie! Muss exakt zum Fahrzeug passen</td></tr>
        <tr><td>📜 Eigentumsnachweis</td><td>Zoll/Import</td><td>Fremdfahrzeug: notarielle Vollmacht des Halters!</td></tr>
        <tr><td>🛡️ Versicherungsnachweise</td><td>Haftpflicht im Land</td><td>Grüne Karte wo nötig vorab holen!</td></tr>
        <tr><td>📕 Carnet de Passage ODER TIP</td><td>Vorübergehende Fahrzeug-Einfuhr</td><td>Carnet vorab (~1 Jahr gültig), TIP an der Grenze</td></tr>
      </table>
    </div>`;
  }
  if (tab === "versicherung") {
    el.innerHTML = `
    ${trustNotice}
    <div class="prep-block">
      <h3>🛡️ Versicherungslagen verstehen</h3>
      <ul>
        <li><b>EU/EEA:</b> Eigene Kfz-Haftpflicht genügt, Grüne Karte meist optional.</li>
        <li><b>Grüne Karte PFLICHT:</b> Albanien, Bosnien, Belarus, Kosovo, Moldau, Montenegro, Nordmazedonien, Serbien, Türkei, Marokko.</li>
        <li><b>Grenzversicherung:</b> Viele afrikanische/asiatische Länder verlangen Grenzpolice vor Ort.</li>
        <li><b>Rückholung/Krankenrücktransport:</b> DIE wichtigste Klausel für Remote-Reisen (mind. 500.000 € Deckung).</li>
      </ul>
    </div>`;
  }
  if (tab === "timeline") {
    el.innerHTML = `
    <div class="prep-block">
      <h3>Der realistische Countdown</h3>
      <div class="timeline-step"><div class="tl-time">6–12 Monate vorher</div><div class="tl-body"><b>Route skizzieren & Anforderungen kartieren</b><span>Visum? Carnet? Grüne Karte? IDP?</span></div></div>
      <div class="timeline-step"><div class="tl-time">4–6 Monate vorher</div><div class="tl-body"><b>Carnet beantragen</b><span>Dauert Wochen + Kaution klären. Reisepass prüfen.</span></div></div>
      <div class="timeline-step"><div class="tl-time">2–3 Monate vorher</div><div class="tl-body"><b>Großer Bike-Service</b><span>Federbeine, Kette NEU, Reifen, Batterie.</span></div></div>
    </div>`;
  }
  if (tab === "bike") {
    el.innerHTML = `
    <div class="prep-block">
      <h3>🔧 Technik-Check vor jedem großen Trip</h3>
      <table>
        <tr><th>System</th><th>Prüfen/Tun</th></tr>
        <tr><td>Reifen</td><td>>50% Profil, Alter (<5 Jahre)</td></tr>
        <tr><td>Kette/Sprocket</td><td>Kettennieter + Masterlink + passende Nuss mitnehmen</td></tr>
        <tr><td>Federbein(e)</td><td>Service alle ~15.000 km! Vor Fernreisen servicen</td></tr>
        <tr><td>Batterie</td><td>Jump-Starter Pack einpacken</td></tr>
      </table>
    </div>`;
  }
  if (tab === "grenze") {
    el.innerHTML = `
    <div class="prep-block">
      <h3>🛂 Checkliste: VOR dem Grenzübertritt</h3>
      <ul>
        <li>☐ Öffnungszeiten + Zeitzone des Übergangs gecheckt</li>
        <li>☐ Benzin VOLL</li>
        <li>☐ Bargeld in Landeswährung + USD/EUR Reserve</li>
        <li>☐ Kopien aller Dokumente in Dreifach</li>
        <li>☐ Keine verbotenen Items (Drohnen Marokko VERBOTEN!)</li>
      </ul>
    </div>`;
  }
}

/* ---------- Probleme & Lektionen ---------- */
function renderProblemFilter() {
  const el = document.getElementById("problemFilter");
  if (!el || !DB.problemCategories) return;
  el.innerHTML = `<button class="chip active" onclick="setProbFilter('alle')">Alle</button>` +
   DB.problemCategories.map(c =>
     `<button class="chip" onclick="setProbFilter('${escapeHtml(c.id)}')">${c.icon} ${escapeHtml(c.name)}</button>`).join("");
}
function setProbFilter(id) {
  state.problemFilter = id;
  document.querySelectorAll("#problemFilter .chip").forEach((b, i) => {
    b.classList.toggle("active", (i === 0 && id === "alle") || (DB.problemCategories[i-1] && DB.problemCategories[i-1].id === id));
  });
  renderProblems();
}

function sevBadge(s) {
  const map = { kritisch: ["red", "KRITISCH"], hoch: ["yellow", "HOCH"], mittel: ["blue", "MITTEL"] };
  const [cls, label] = map[s] || ["blue", s.toUpperCase()];
  return `<span class="badge ${cls}">${label}</span>`;
}

function renderProblems() {
  let probs = DB.problems || [];
  const filterActive = state.problemFilter !== "alle";
  if (filterActive) probs = probs.filter(p => p.cat === state.problemFilter);
  
  const countEl = document.getElementById("problemCount");
  if (countEl) countEl.textContent = `${probs.length} Erfahrungsberichte & Lektionen gefunden`;

  const el = document.getElementById("problemGrid");
  if (!el) return;
  if (!probs.length) {
    el.innerHTML = "<p class='hint'>Keine Einträge für diesen Filter.</p>";
    return;
  }

  const catIcon = id => {
    const found = DB.problemCategories.find(c => c.id === id);
    return found ? found.icon : "⚠️";
  };
  const catName = id => {
    const found = DB.problemCategories.find(c => c.id === id);
    return found ? found.name : id;
  };

  // Group by Category
  const grouped = {};
  probs.forEach(p => {
    const cat = p.cat || "sonstiges";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  const categories = Object.keys(grouped);
  let html = `<div class="pass-groups-container">`;

  categories.forEach(cat => {
    const catProbs = grouped[cat];
    const icon = catIcon(cat);
    const title = catName(cat);

    html += `
      <details class="group-details country-group" ${filterActive ? 'open' : ''}>
        <summary class="group-summary">
          <div class="group-summary-inner">
            <span class="group-title">${icon} ${escapeHtml(title)}</span>
            <span class="badge">${catProbs.length} ${catProbs.length === 1 ? 'Lektion' : 'Lektionen'}</span>
          </div>
        </summary>
        <div class="group-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.9rem;">
          ${catProbs.map(p => `
            <div class="problem-card sev-${p.severity}">
              <div class="pc-head">
                ${sevBadge(p.severity)}
                <span class="pc-title">${icon} ${escapeHtml(p.title)}</span>
                <span class="pc-meta">📍 ${withFlag(p.country)} · Quelle: ${escapeHtml(p.source)}</span>
              </div>
              <div class="pc-story">${escapeHtml(p.story)}</div>
              <div class="pc-lesson">${escapeHtml(p.lesson)}</div>
            </div>
          `).join("")}
        </div>
      </details>
    `;
  });
  html += `</div>`;

  el.innerHTML = html;
}

function renderTopProblems() {
  const picks = DB.problems.filter(p => [
    "ECU gebraten (Mosambik 2026)",
    "TIP nicht geschlossen → Wiedereinreise verweigert",
    "Storm Babet: Zerstörtes Zelt + Coastguard-Rettung 3 Uhr nachts",
    "Federbein ohne Dämpfung nach 55.000 km"
  ].includes(p.title));
  const catIcon = id => {
    const found = DB.problemCategories.find(c => c.id === id);
    return found ? found.icon : "⚠️";
  };
  const el = document.getElementById("topProblems");
  if (el) {
    el.innerHTML = picks.map(p => `
      <div class="problem-card sev-${p.severity}">
        <div class="pc-head">${sevBadge(p.severity)}<span class="pc-title">${catIcon(p.cat)} ${escapeHtml(p.title)}</span>
        <span class="pc-meta">📍 ${withFlag(p.country)} · ${escapeHtml(p.source)}</span></div>
        <div class="pc-story">${escapeHtml((p.story || "").slice(0, 220))}…</div>
        <div class="pc-lesson">${escapeHtml((p.lesson || "").slice(0, 180))}…</div>
      </div>`).join("");
  }
}

/* ---------- Wohnmobil Unterkünfte ---------- */
function fillAccommFilters() {
  const cSel = document.getElementById("accCountryFilter");
  const rSel = document.getElementById("accRouteFilter");
  if (!cSel || !rSel || !DB.accommodations) return;
  cSel.innerHTML = '<option value="alle">Alle Länder</option>';
  rSel.innerHTML = '<option value="alle">Alle Routen</option>';

  const countries = [...new Set(DB.accommodations.map(a => a.country))].sort();
  countries.forEach(c => {
    const o = document.createElement("option"); o.value = c; o.textContent = c; cSel.appendChild(o);
  });
  const routes = [...new Set(DB.accommodations.map(a => a.routeId))].sort();
  routes.forEach(r => {
    const route = DB.routes.find(x => x.id === r);
    const label = route ? route.name : r;
    const o = document.createElement("option"); o.value = r; o.textContent = label; rSel.appendChild(o);
  });
}

function showCamperTab(tabId, btn) {
  document.querySelectorAll("#camperTabs button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.querySelectorAll(".camper-tab-pane").forEach(p => p.style.display = "none");
  const paneId = "camperTab" + tabId.charAt(0).toUpperCase() + tabId.slice(1);
  const activePane = document.getElementById(paneId);
  if (activePane) activePane.style.display = "block";
  if (tabId === "touren") renderCamperRoutes();
  if (tabId === "checkliste") renderCamperChecklist();
  if (tabId === "plaetze") renderAccommodations();
}

function getCamperPrimaryCountry(r) {
  const cList = r.countries || [];
  if (cList.length === 1) return cList[0];
  if (cList.length > 1) {
    if (cList.some(c => c.includes("Schottland"))) return "Schottland (UK)";
    if (cList.some(c => c.includes("Nordirland"))) return "Nordirland (UK)";
    if (cList.includes("Deutschland") && cList.includes("Norwegen")) return "Skandinavien & Trans-Europa";
    return cList[0];
  }
  return "Sonstige";
}

function setCamperCountryPill(countryVal) {
  const select = document.getElementById("camperRouteCountryFilter");
  if (select) {
    select.value = countryVal;
    renderCamperRoutes();
  }
}

function toggleAllCamperAccordions(openState) {
  const container = document.getElementById("camperRoutesGrid");
  if (!container) return;
  container.querySelectorAll("details.group-details").forEach(d => {
    d.open = openState;
  });
}

function renderCamperRoutes() {
  const container = document.getElementById("camperRoutesGrid");
  const pillsContainer = document.getElementById("camperCountryPills");
  if (!container || !DB.routes) return;
  const filter = (document.getElementById("camperRouteCountryFilter") || {}).value || "alle";

  const allCamperRoutes = DB.routes.filter(r => r.type === "wohnmobil");

  // Render quick-filter pills if container exists
  if (pillsContainer) {
    const pillCounts = { "alle": allCamperRoutes.length };
    allCamperRoutes.forEach(r => {
      const cName = getCamperPrimaryCountry(r);
      pillCounts[cName] = (pillCounts[cName] || 0) + 1;
    });

    const pillOrder = [
      { id: "alle", label: `Alle (${pillCounts["alle"]})` },
      { id: "Deutschland", label: `🇩🇪 Deutschland (${pillCounts["Deutschland"] || 0})` },
      { id: "Finnland", label: `🇫🇮 Finnland (${pillCounts["Finnland"] || 0})` },
      { id: "Italien", label: `🇮🇹 Italien (${pillCounts["Italien"] || 0})` },
      { id: "Nordirland", label: `🇬🇧 Nordirland (${pillCounts["Nordirland (UK)"] || 0})` },
      { id: "Norwegen", label: `🇳🇴 Norwegen (${pillCounts["Norwegen"] || 0})` },
      { id: "Österreich", label: `🇦🇹 Österreich (${pillCounts["Österreich"] || 0})` },
      { id: "Portugal", label: `🇵🇹 Portugal (${pillCounts["Portugal"] || 0})` },
      { id: "Schottland", label: `🏴󠁧󠁢󠁳󠁣󠁴󠁿 Schottland (${pillCounts["Schottland (UK)"] || 0})` },
      { id: "Schweiz", label: `🇨🇭 Schweiz (${pillCounts["Schweiz"] || 0})` },
      { id: "Slowenien", label: `🇸🇮 Slowenien (${pillCounts["Slowenien"] || 0})` }
    ];

    pillsContainer.innerHTML = pillOrder.map(p => {
      const isActive = (filter === p.id) || (p.id === "alle" && filter === "alle");
      return `<button type="button" class="camper-subtab-btn ${isActive ? 'active' : ''}" style="padding:.35rem .75rem;font-size:.82rem;border-radius:20px;border:1px solid var(--border);cursor:pointer;" onclick="setCamperCountryPill('${p.id}')">${p.label}</button>`;
    }).join("");
  }

  const camperRoutes = allCamperRoutes.filter(r => {
    if (filter === "alle") return true;
    return (r.countries || []).some(c => c.toLowerCase().includes(filter.toLowerCase()));
  });

  if (!camperRoutes.length) {
    container.innerHTML = `<p class="hint">Keine Wohnmobil-Routen für diese Auswahl gefunden.</p>`;
    container.className = "";
    return;
  }

  // Group camper routes by primary country
  const countryGroups = {};
  camperRoutes.forEach(r => {
    const cKey = getCamperPrimaryCountry(r);
    if (!countryGroups[cKey]) countryGroups[cKey] = [];
    countryGroups[cKey].push(r);
  });

  const sortedCountries = Object.keys(countryGroups).sort((a, b) => a.localeCompare(b, "de"));
  const isFilteredSingle = filter !== "alle";

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.6rem">
      <span class="hint" style="margin:0;font-size:.86rem">💡 Klicke auf ein Land, um dessen Touren aufzuklappen:</span>
      <div style="display:flex;gap:.5rem">
        <button type="button" class="btn" style="font-size:.78rem;padding:.26rem .65rem;border-radius:6px" onclick="toggleAllCamperAccordions(true)">📂 Alle aufklappen</button>
        <button type="button" class="btn" style="font-size:.78rem;padding:.26rem .65rem;border-radius:6px" onclick="toggleAllCamperAccordions(false)">📁 Alle zuklappen</button>
      </div>
    </div>
    <div class="pass-groups-container">
  `;

  sortedCountries.forEach(cName => {
    const rList = countryGroups[cName].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'));
    const flagHtml = getSingleFlagHtml(cName) || getCountryFlag(cName) || "📍";
    const shouldOpen = isFilteredSingle; // When filtering a specific country, open it automatically

    html += `
      <details class="group-details country-group" ${shouldOpen ? 'open' : ''}>
        <summary class="group-summary">
          <div class="group-summary-inner">
            <span class="group-title">${flagHtml} ${escapeHtml(cName)}</span>
            <span class="badge blue">${rList.length} ${rList.length === 1 ? 'Tour' : 'Touren'}</span>
          </div>
        </summary>
        <div class="group-content">
          <div class="route-grid" style="padding: 1.1rem;">
            ${rList.map(r => routeCardHtml(r, false)).join("")}
          </div>
        </div>
      </details>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
  container.className = ""; // Accordions span full width
  if (typeof updateFavCounters === "function") updateFavCounters();
}

const CAMPER_CHECKLIST_KEY = "mrs_camper_checklist";

function getCamperChecklistState() {
  try {
    return JSON.parse(localStorage.getItem(CAMPER_CHECKLIST_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function toggleCamperChecklistItem(id) {
  const state = getCamperChecklistState();
  state[id] = !state[id];
  localStorage.setItem(CAMPER_CHECKLIST_KEY, JSON.stringify(state));
  renderCamperChecklist();
}

function resetCamperChecklist() {
  if (confirm("Möchtest du alle Haken der Packliste zurücksetzen?")) {
    localStorage.removeItem(CAMPER_CHECKLIST_KEY);
    renderCamperChecklist();
  }
}

const CAMPER_CHECKLIST_DATA = [
  {
    cat: "Fahrzeug & Technik",
    icon: "🔌",
    items: [
      { id: "c_cee", text: "CEE-Verlängerungskabel (mind. 20–25 m, H07RN-F 3G 2.5 mm²)", desc: "Standard auf allen europäischen Camping- und Stellplätzen" },
      { id: "c_schuko", text: "CEE-Adapter auf Schuko-Kupplung", desc: "Für Haushaltssteckdosen oder Adapterboxen" },
      { id: "c_keile", text: "Auffahrkeile (mind. 2-stufig)", desc: "Unerlässlich für geraden Stand und Kühlschrank-Funktion" },
      { id: "c_wasser", text: "Trinkwasserschlauch (lebensmittelecht) & Gießkanne", desc: "Gießkanne ideal für schwer zugängliche Zapfstellen" },
      { id: "c_adapter", text: "Wasserhahn-Adapterset (1/2 Zoll, 3/4 Zoll, 1 Zoll & Wasserdieb)", desc: "Passend für unterschiedliche Gewinde an Ver-/Entsorgungsstationen" },
      { id: "c_abwasser", text: "Abwasserschlauch / Rolltank (Grauwasser)", desc: "Für Plätze ohne direkten Bodenablass" },
      { id: "c_oel", text: "1 Liter Motoröl (Herstellerspezifikation) & Scheibenwischwasser", desc: "Besonders für lange Bergfahrten" }
    ]
  },
  {
    cat: "Gas, Wohnen & Sanitär",
    icon: "🔥",
    items: [
      { id: "c_gas", text: "Gasflaschen voll & Füllstandsprüfer", desc: "Mindestens eine Flasche voll als Reserve für Heizung und Kochen" },
      { id: "c_eurogas", text: "Euro-Gasfüll- & Entnahmeset (4 Adapter)", desc: "Für Gasflaschentausch und Betankung im europäischen Ausland" },
      { id: "c_markise", text: "Sturmband & Erdnägel für Markise", desc: "Schützt bei plötzlichen Gewitterböen vor teuren Sturmschäden" },
      { id: "c_chemie", text: "Toilettenzusatz (biologisch abbaubar) & Camping-Toilettenpapier", desc: "Schnell auflösendes Papier verhindert Verstopfungen im Fäkalientank" },
      { id: "c_beleuchtung", text: "Taschenlampe / Stirnlampe & Arbeitshandschuhe", desc: "Für Anreise im Dunkeln und Entsorgungsarbeiten" }
    ]
  },
  {
    cat: "Sicherheit & Papiere (Maut & Grenzkontrollen)",
    icon: "🛡️",
    items: [
      { id: "c_papiere", text: "Fahrzeugschein (Zulassungsbescheinigung Teil I) & Grüne Karte", desc: "Grüne Versicherungskarte (IVK) in Papierform für Grenzübertritte" },
      { id: "c_westen", text: "Warnwesten für JEDEN Sitzplatz", desc: "In Italien, Spanien und Österreich gesetzlich vorgeschrieben (im Innenraum greifbar!)" },
      { id: "c_warntafel", text: "Warntafel für Heckfahrradträger", desc: "In Italien (50x50 cm, 5 rote Streifen) und Spanien (3 Streifen) zwingend Pflicht" },
      { id: "c_schwerlast", text: "Mautbox / Registrierung bei Fahrzeugen > 3,5 t", desc: "Österreich: GO-Box / Schweiz: PSVA per Via-App / Deutschland: Nachweis Wohnmobil" },
      { id: "c_apotheke", text: "Verbandskasten (DIN 13164) & Warndreieck", desc: "Haltbarkeitsdatum der sterilen Kompressen prüfen" }
    ]
  }
];

function renderCamperChecklist() {
  const container = document.getElementById("camperChecklistContent");
  if (!container) return;

  const state = getCamperChecklistState();
  let totalItems = 0;
  let checkedItems = 0;

  CAMPER_CHECKLIST_DATA.forEach(cat => {
    cat.items.forEach(item => {
      totalItems++;
      if (state[item.id]) checkedItems++;
    });
  });

  const percent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.2rem">
      <div>
        <h3 style="margin:0 0 .3rem">✅ Interaktive Wohnmobil-Packliste</h3>
        <p class="hint" style="margin:0">${checkedItems} von ${totalItems} Punkten erledigt (${percent}%)</p>
      </div>
      <button class="btn" onclick="resetCamperChecklist()" style="font-size:.82rem">🔄 Liste zurücksetzen</button>
    </div>

    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;height:10px;overflow:hidden;margin-bottom:1.8rem">
      <div style="background:var(--accent);height:100%;width:${percent}%;transition:width .3s ease"></div>
    </div>
  `;

  CAMPER_CHECKLIST_DATA.forEach(category => {
    html += `
      <div class="checklist-category-card">
        <h4 class="checklist-cat-title"><span>${category.icon}</span> ${escapeHtml(category.cat)}</h4>
        <div class="checklist-items">
    `;

    category.items.forEach(item => {
      const isDone = !!state[item.id];
      html += `
        <label class="checklist-item ${isDone ? 'done' : ''}">
          <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleCamperChecklistItem('${item.id}')">
          <div class="cl-text">
            <span class="cl-title">${escapeHtml(item.text)}</span>
            <span class="cl-desc">${escapeHtml(item.desc)}</span>
          </div>
        </label>
      `;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

function renderAccommodations() {
  const grid = document.getElementById("accommGrid");
  if (!grid || !DB.accommodations) return;
  const type = document.getElementById("accTypeFilter") ? document.getElementById("accTypeFilter").value : "alle";
  const country = document.getElementById("accCountryFilter") ? document.getElementById("accCountryFilter").value : "alle";
  const route = document.getElementById("accRouteFilter") ? document.getElementById("accRouteFilter").value : "alle";

  let list = [...DB.accommodations].sort((a, b) => (a.country || '').localeCompare(b.country || '', 'de') || (a.name || '').localeCompare(b.name || '', 'de'));
  if (type !== "alle") list = list.filter(a => a.type.includes(type) || (type === "Weingut" && a.type.includes("Weingut")));
  if (country !== "alle") list = list.filter(a => a.country === country);
  if (route !== "alle") list = list.filter(a => a.routeId === route);

  if (!list.length) { grid.innerHTML = '<p class="hint">Keine Unterkünfte für diese Filter.</p>'; return; }
  grid.innerHTML = list.map(a => {
    const rObj = DB.routes.find(r => r.id === a.routeId);
    const rName = rObj ? rObj.name : a.routeId;
    const facHtml = a.facilities ? `
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin:.35rem 0 .5rem">
        ${a.facilities.ve ? '<span class="facility-chip" title="Ver- & Entsorgung vorhanden">💧 V/E</span>' : ''}
        ${a.facilities.electricity ? '<span class="facility-chip" title="Stromanschluss vorhanden">⚡ Strom</span>' : ''}
        ${a.facilities.shower ? '<span class="facility-chip" title="Warmwasserduschen vorhanden">🚿 Dusche</span>' : ''}
        ${a.facilities.wifi ? '<span class="facility-chip" title="WLAN verfügbar">📶 WLAN</span>' : ''}
        ${a.facilities.dog ? '<span class="facility-chip" title="Hunde erlaubt">🐾 Hund</span>' : ''}
      </div>` : '';

    return `
    <div class="accomm-card">
      <span class="accomm-type ${a.type.split('/')[0]}">${escapeHtml(a.type)}</span>
      <div class="accomm-name">${escapeHtml(a.name)}</div>
      <div class="accomm-meta">📍 ${withFlag(a.country)} · 🛣️ ${escapeHtml(rName)} · ${escapeHtml(a.price)} · ⭐ ${escapeHtml(a.rating)}</div>
      ${facHtml}
      <div class="accomm-desc">${escapeHtml(a.description)}</div>
      <div class="accomm-actions">
        <a class="btn-book" href="${encodeURI(a.bookingUrl)}" target="_blank" rel="noopener">📅 Jetzt buchen / ansehen</a>
        <button class="btn" onclick="showAccommDetail('${escapeHtml(a.id)}')">Details</button>
      </div>
    </div>`;
  }).join("");
}

function showAccommDetail(id) {
  const a = DB.accommodations.find(x => x.id === id);
  if (!a) return;
  const rObj = DB.routes.find(r => r.id === a.routeId);
  const rName = rObj ? rObj.name : a.routeId;
  const facDetail = a.facilities ? `
    <div class="md-section">
      <h3>🛠️ Ausstattung &amp; Services</h3>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.4rem">
        ${a.facilities.ve ? '<span class="leg-pill leg-rueck">💧 Ver- &amp; Entsorgung (V/E)</span>' : '<span class="leg-pill" style="opacity:.6">Keine V/E</span>'}
        ${a.facilities.electricity ? '<span class="leg-pill leg-hin">⚡ Stromanschluss</span>' : ''}
        ${a.facilities.shower ? '<span class="leg-pill leg-tour">🚿 Sanitär &amp; Warmwasserduschen</span>' : ''}
        ${a.facilities.wifi ? '<span class="leg-pill">📶 WLAN</span>' : ''}
        ${a.facilities.dog ? '<span class="leg-pill">🐾 Hunde willkommen</span>' : ''}
      </div>
    </div>` : '';

  document.getElementById("modalBody").innerHTML = `
    <div class="md-head"><span style="font-size:2rem">🛏️</span><div><h2>${escapeHtml(a.name)}</h2><div class="md-sub">${escapeHtml(a.type)} · ${withFlag(a.country)}</div></div></div>
    <p style="color:var(--muted);line-height:1.6">${escapeHtml(a.description)}</p>
    ${facDetail}
    <div class="md-section"><h3>📍 Lage</h3><p>${withFlag(a.country)} · Route: ${escapeHtml(rName)} ${a.lat ? `· GPS: ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}` : ''}</p></div>
    <div class="md-section"><h3>💰 Preis &amp; Bewertung</h3><p>${escapeHtml(a.price)} · ⭐ ${escapeHtml(a.rating)}/5</p></div>
    <div style="display:flex;gap:.5rem;margin-top:1.4rem;flex-wrap:wrap">
      <a class="btn btn-primary" href="${encodeURI(a.bookingUrl)}" target="_blank" rel="noopener" style="flex:1;text-align:center;">📅 Platz ansehen / buchen</a>
      ${a.lat ? `<a class="btn" href="https://www.google.com/maps?q=${a.lat},${a.lng}" target="_blank" rel="noopener">🗺️ In Google Maps öffnen</a>` : ''}
      <button class="btn" onclick="closeModal()">Schließen</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/* ============================================================
   MEINE REISEN — Mit 3-Schritte-Wizard
   ============================================================ */
const REISEN_KEY = "mrs_reisen_v2";
function getReisen() {
  try { return JSON.parse(localStorage.getItem(REISEN_KEY)) || []; } catch(e) { return []; }
}
function saveReisen(arr) {
  localStorage.setItem(REISEN_KEY, JSON.stringify(arr));
}

function calculateTripStats(reise) {
  let totalKm = 0;
  const countries = new Set();
  (reise.etappen || []).forEach(e => {
    if (e.km) {
      const num = parseFloat(String(e.km).replace(/[^\d.,]/g, '').replace(',', '.'));
      if (!isNaN(num)) totalKm += num;
    }
    if (e.routeId) {
      const r = DB.routes.find(x => x.id === e.routeId);
      if (r && r.countries) r.countries.forEach(c => countries.add(c));
    }
  });
  return {
    totalKm: Math.round(totalKm),
    etappenCount: (reise.etappen || []).length,
    countries: [...countries]
  };
}

function generateTripChecklist(reise) {
  const stats = calculateTripStats(reise);
  if (!stats.countries.length) return "";

  const carnets = [];
  const greenCards = [];
  const warnings = [];

  stats.countries.forEach(cName => {
    const clean = cName.split(" (")[0].split("/")[0].trim();
    const c = DB.countries.find(x => x.name === clean || x.name === cName);
    if (c && c.prep) {
      if (c.prep.carnet) carnets.push(c.name);
      if (/GRÜNE KARTE/i.test(c.prep.versicherung || "")) greenCards.push(c.name);
      if (c.prep.sonderregeln && c.prep.sonderregeln.includes("VERBOTEN")) warnings.push(`${c.name}: ${c.prep.sonderregeln}`);
    }
  });

  return `
    <div class="checklist-box">
      <h4>🛂 Automatische Grenz- & Dokumenten-Checkliste für deine Reise:</h4>
      <div class="checklist-item"><span>🌍</span> <b>Länder auf deiner Route:</b> ${escapeHtml(stats.countries.join(", "))}</div>
      ${carnets.length ? `<div class="checklist-item" style="color:var(--red)"><span>📕</span> <b>Carnet de Passage ZWINGEND nötig in:</b> ${escapeHtml(carnets.join(", "))}</div>` : `<div class="checklist-item" style="color:var(--green)"><span>✅</span> <b>Carnet de Passage:</b> Für keines deiner Länder Pflicht (TIP an Grenze reicht).</div>`}
      ${greenCards.length ? `<div class="checklist-item" style="color:var(--accent2)"><span>🛡️</span> <b>Grüne Versicherungskarte Pflicht in:</b> ${escapeHtml(greenCards.join(", "))}</div>` : ""}
      ${warnings.length ? `<div class="checklist-item" style="color:var(--red)"><span>⚠️</span> <b>Wichtige Sonderregeln:</b> ${escapeHtml(warnings.join(" | "))}</div>` : ""}
    </div>
  `;
}

function renderReisen() {
  const grid = document.getElementById("reisenGrid");
  if (!grid) return;
  const reisen = getReisen();
  if (!reisen.length) {
    grid.innerHTML = `
      <div class="wizard-container">
        <div class="wizard-step">
          <div class="wizard-step-number">1</div>
          <div class="wizard-step-title">Reise anlegen</div>
          <div class="wizard-step-desc">Gib deiner Tour einen Namen (z. B. Balkan 2026), wähle dein Bike und deinen Reisezeitraum.</div>
        </div>
        <div class="wizard-step">
          <div class="wizard-step-number">2</div>
          <div class="wizard-step-title">Routen kombinieren</div>
          <div class="wizard-step-desc">Wähle per 1-Klick aus den 101 weltweiten Datenbank-Routen oder erstelle eigene Zwischenetappen.</div>
        </div>
        <div class="wizard-step">
          <div class="wizard-step-number">3</div>
          <div class="wizard-step-title">Checkliste erhalten</div>
          <div class="wizard-step-desc">Das System prüft automatisch alle Länder auf Carnet-, Visa- & Versicherungspflichten.</div>
        </div>
      </div>

      <div class="prep-block" style="text-align:center;padding:3.5rem 1.5rem">
        <span style="font-size:3.2rem">🧭</span>
        <h3 style="margin-top:1rem;font-size:1.4rem">Bereit für dein nächstes Abenteuer?</h3>
        <p class="hint" style="max-width:550px;margin:0.5rem auto 1.6rem">Plane deine eigene Tour aus den 101 weltweiten Routen. Alle Daten bleiben privat in deinem Browser gespeichert.</p>
        <button class="hero-btn hero-btn-primary" onclick="openCreateReiseModal()" style="font-size:1.05rem">+ Erste Reise jetzt anlegen</button>
      </div>`;
    return;
  }

  grid.innerHTML = reisen.map((r, ri) => {
    const stats = calculateTripStats(r);
    const checklistHtml = generateTripChecklist(r);

    return `
    <div class="prep-block" style="position:relative">
      <button onclick="deleteReise(${ri})" style="position:absolute;top:.9rem;right:.9rem;background:none;border:1px solid var(--border);color:var(--muted);padding:.25rem .6rem;border-radius:6px;cursor:pointer" title="Reise löschen">✕</button>
      <h3>🧭 ${escapeHtml(r.name)} <span style="font-weight:400;color:var(--muted);font-size:.88rem">${r.zeitraum ? `· 📅 ${escapeHtml(r.zeitraum)}` : ""}</span></h3>
      <p class="hint" style="margin-bottom:.6rem">${escapeHtml(r.notiz || "Keine Notiz")}</p>
      
      <div class="trip-summary-bar">
        <div class="trip-summary-item"><span>Gesamtstrecke</span><b>~${stats.totalKm > 0 ? stats.totalKm + " km" : "Offen"}</b></div>
        <div class="trip-summary-item"><span>Etappen</span><b>${stats.etappenCount}</b></div>
        <div class="trip-summary-item"><span>Länder</span><b>${stats.countries.length}</b></div>
      </div>

      ${checklistHtml}

      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0">
        <button class="btn btn-primary" onclick="openAddEtappeModal(${ri})">+ Etappe hinzufügen</button>
        <button class="btn" onclick="openEditReiseModal(${ri})">✎ Reise bearbeiten</button>
        <button class="btn" onclick="duplicateReise(${ri})">⎘ Duplizieren</button>
        <button class="btn" onclick="window.print()">🖨️ Drucken / PDF</button>
      </div>

      ${(r.etappen || []).map((e, ei) => `
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.1rem;margin:.8rem 0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap">
            <b>Etappe ${ei+1}: ${escapeHtml(e.routeName || e.routeId || "Freie Etappe")}</b>
            <div style="display:flex;gap:.35rem">
              <button class="chip" onclick="moveEtappe(${ri},${ei},-1)" title="Nach oben">↑</button>
              <button class="chip" onclick="moveEtappe(${ri},${ei},1)" title="Nach unten">↓</button>
              <button class="chip" onclick="removeEtappe(${ri},${ei})" title="Etappe entfernen">✕</button>
            </div>
          </div>
          <div style="font-size:.86rem;color:var(--muted);margin:.45rem 0">
            ${e.routeId ? `<span class="badge blue">DB-Route: ${escapeHtml(e.routeId)}</span> ` : ""}
            📏 ${escapeHtml(e.km || "? km")} · ⏳ ${escapeHtml(e.zeit || "?")} ${e.hm ? `· 🏔️ ${escapeHtml(e.hm)}` : ""}
          </div>
          ${(e.pois && e.pois.length) ? `<div style="font-size:.86rem;margin:.4rem 0"><b>POIs:</b> ${e.pois.map(p => escapeHtml(p.name)).join(" · ")}</div>` : ""}
          ${(e.fotos && e.fotos.length) ? `<div style="display:flex;gap:.45rem;flex-wrap:wrap;margin:.6rem 0">${e.fotos.map(f => `<a href="${encodeURI(f)}" target="_blank" rel="noopener"><img src="${encodeURI(f)}" style="width:90px;height:65px;object-fit:cover;border-radius:6px;border:1px solid var(--border)"></a>`).join("")}</div>` : ""}
          ${e.notiz ? `<div style="font-size:.88rem;background:rgba(255,255,255,.04);padding:.6rem .9rem;border-radius:8px;margin-top:.45rem">📝 ${escapeHtml(e.notiz)}</div>` : ""}
          <div style="display:flex;gap:.45rem;margin-top:.7rem;flex-wrap:wrap">
            <button class="chip" onclick="openEditEtappeModal(${ri},${ei})">✎ Etappe bearbeiten</button>
            <button class="chip" onclick="openAddPoiModal(${ri},${ei})">+ POI</button>
            <button class="chip" onclick="openAddFotoModal(${ri},${ei})">+ Foto-URL</button>
          </div>
        </div>
      `).join("")}
    </div>`;
  }).join("");
}

function openCreateReiseModal() {
  document.getElementById("modalBody").innerHTML = `
    <h2>🧭 Neue Reise anlegen</h2>
    <div class="form-group">
      <label class="form-label">Name der Reise *</label>
      <input type="text" id="reiseNameInput" class="form-input" placeholder="z. B. Balkan-Runde 2026">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Geplanter Zeitraum</label>
        <input type="text" id="reiseZeitInput" class="form-input" placeholder="z. B. Juni 2026 (3 Wochen)">
      </div>
      <div class="form-group">
        <label class="form-label">Fahrzeug / Art</label>
        <select id="reiseTypInput" class="form-select">
          <option value="Motorrad">🏍️ Motorrad</option>
          <option value="Bikepacking">🚵 Bikepacking</option>
          <option value="Wohnmobil">🚐 Wohnmobil</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Ziel / Notizen</label>
      <textarea id="reiseNotizInput" class="form-textarea" rows="3" placeholder="Ziele, Budget, Mitfahrer..."></textarea>
    </div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.6rem">
      <button class="btn" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="submitCreateReise()">Reise erstellen</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => { const el = document.getElementById("reiseNameInput"); if (el) el.focus(); }, 50);
}

function submitCreateReise() {
  const name = document.getElementById("reiseNameInput").value.trim();
  if (!name) { alert("Bitte gib einen Namen für die Reise ein."); return; }
  const zeitraum = document.getElementById("reiseZeitInput").value.trim();
  const typ = document.getElementById("reiseTypInput").value;
  const notiz = document.getElementById("reiseNotizInput").value.trim();

  const arr = getReisen();
  arr.push({ id: Date.now().toString(36), name, zeitraum, typ, notiz, etappen: [] });
  saveReisen(arr);
  closeModal();
  renderReisen();
}

function openEditReiseModal(ri) {
  const arr = getReisen();
  const r = arr[ri];
  if (!r) return;

  document.getElementById("modalBody").innerHTML = `
    <h2>✎ Reise bearbeiten</h2>
    <div class="form-group">
      <label class="form-label">Name der Reise *</label>
      <input type="text" id="editReiseName" class="form-input" value="${escapeHtml(r.name)}">
    </div>
    <div class="form-group">
      <label class="form-label">Geplanter Zeitraum</label>
      <input type="text" id="editReiseZeit" class="form-input" value="${escapeHtml(r.zeitraum || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Notiz / Ziel</label>
      <textarea id="editReiseNotiz" class="form-textarea" rows="3">${escapeHtml(r.notiz || '')}</textarea>
    </div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.6rem">
      <button class="btn" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="submitEditReise(${ri})">Speichern</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function submitEditReise(ri) {
  const arr = getReisen();
  if (!arr[ri]) return;
  const name = document.getElementById("editReiseName").value.trim();
  if (!name) { alert("Name darf nicht leer sein."); return; }
  arr[ri].name = name;
  arr[ri].zeitraum = document.getElementById("editReiseZeit").value.trim();
  arr[ri].notiz = document.getElementById("editReiseNotiz").value.trim();
  saveReisen(arr);
  closeModal();
  renderReisen();
}

function deleteReise(ri) {
  const arr = getReisen();
  if (!arr[ri]) return;
  if (!confirm(`Reise „${arr[ri].name}“ wirklich löschen?`)) return;
  arr.splice(ri, 1);
  saveReisen(arr);
  renderReisen();
}

function duplicateReise(ri) {
  const arr = getReisen();
  if (!arr[ri]) return;
  const copy = JSON.parse(JSON.stringify(arr[ri]));
  copy.id = Date.now().toString(36);
  copy.name += " (Kopie)";
  arr.push(copy);
  saveReisen(arr);
  renderReisen();
}

function openAddEtappeModal(ri, preselectedRouteId = "") {
  const options = DB.routes.map(r => `
    <option value="${escapeHtml(r.id)}" ${preselectedRouteId === r.id ? 'selected' : ''}>${escapeHtml(r.name)} (${r.type === 'motorrad' ? '🏍️' : r.type === 'wohnmobil' ? '🚐' : '🚵'} · ${escapeHtml(r.distance)} · ${escapeHtml((r.countries || []).join(','))})</option>
  `).join("");

  document.getElementById("modalBody").innerHTML = `
    <h2>➕ Etappe hinzufügen</h2>
    <div class="form-group">
      <label class="form-label">Aus Datenbank-Route wählen (${DB.routes.length} Strecken verfügbar)</label>
      <select id="etappeDbRouteSelect" class="form-select" onchange="onDbRouteSelected(this.value)">
        <option value="">-- Freie Etappe (Keine DB-Route) --</option>
        ${options}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Etappen-Name / Titel *</label>
      <input type="text" id="etappeNameInput" class="form-input" placeholder="z. B. Sarajevo nach Mostar">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Distanz (km)</label>
        <input type="text" id="etappeKmInput" class="form-input" placeholder="z. B. 180 km">
      </div>
      <div class="form-group">
        <label class="form-label">Dauer / Fahrzeit</label>
        <input type="text" id="etappeZeitInput" class="form-input" placeholder="z. B. 4 Stunden">
      </div>
      <div class="form-group">
        <label class="form-label">Höhenmeter</label>
        <input type="text" id="etappeHmInput" class="form-input" placeholder="z. B. 1.200 hm">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notiz zur Etappe</label>
      <textarea id="etappeNotizInput" class="form-textarea" rows="2" placeholder="Tanken, Sehenswürdigkeiten..."></textarea>
    </div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.6rem">
      <button class="btn" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="submitAddEtappe(${ri})">Etappe speichern</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (preselectedRouteId) onDbRouteSelected(preselectedRouteId);
}

function onDbRouteSelected(routeId) {
  if (!routeId) return;
  const rt = DB.routes.find(x => x.id === routeId);
  if (rt) {
    document.getElementById("etappeNameInput").value = rt.name;
    document.getElementById("etappeKmInput").value = rt.distance;
    document.getElementById("etappeZeitInput").value = rt.duration;
    document.getElementById("etappeHmInput").value = rt.elevation || "";
  }
}

function submitAddEtappe(ri) {
  const routeId = document.getElementById("etappeDbRouteSelect").value;
  const routeName = document.getElementById("etappeNameInput").value.trim() || routeId || "Etappe";
  const km = document.getElementById("etappeKmInput").value.trim();
  const zeit = document.getElementById("etappeZeitInput").value.trim();
  const hm = document.getElementById("etappeHmInput").value.trim();
  const notiz = document.getElementById("etappeNotizInput").value.trim();

  const arr = getReisen();
  if (!arr[ri]) return;
  arr[ri].etappen.push({ routeId, routeName, km, zeit, hm, pois: [], fotos: [], notiz });
  saveReisen(arr);
  closeModal();
  renderReisen();
}

function openEditEtappeModal(ri, ei) {
  const arr = getReisen();
  const e = arr[ri].etappen[ei];
  if (!e) return;

  document.getElementById("modalBody").innerHTML = `
    <h2>✎ Etappe bearbeiten</h2>
    <div class="form-group">
      <label class="form-label">Titel / Name *</label>
      <input type="text" id="editEtappeName" class="form-input" value="${escapeHtml(e.routeName || '')}">
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Distanz</label><input type="text" id="editEtappeKm" class="form-input" value="${escapeHtml(e.km || '')}"></div>
      <div class="form-group"><label class="form-label">Dauer</label><input type="text" id="editEtappeZeit" class="form-input" value="${escapeHtml(e.zeit || '')}"></div>
      <div class="form-group"><label class="form-label">Höhenmeter</label><input type="text" id="editEtappeHm" class="form-input" value="${escapeHtml(e.hm || '')}"></div>
    </div>
    <div class="form-group"><label class="form-label">Notiz</label><textarea id="editEtappeNotiz" class="form-textarea" rows="3">${escapeHtml(e.notiz || '')}</textarea></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.6rem">
      <button class="btn" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="submitEditEtappe(${ri},${ei})">Speichern</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function submitEditEtappe(ri, ei) {
  const arr = getReisen();
  const e = arr[ri].etappen[ei];
  if (!e) return;
  e.routeName = document.getElementById("editEtappeName").value.trim() || e.routeName;
  e.km = document.getElementById("editEtappeKm").value.trim();
  e.zeit = document.getElementById("editEtappeZeit").value.trim();
  e.hm = document.getElementById("editEtappeHm").value.trim();
  e.notiz = document.getElementById("editEtappeNotiz").value.trim();
  saveReisen(arr);
  closeModal();
  renderReisen();
}

function removeEtappe(ri, ei) {
  const arr = getReisen();
  if (!arr[ri] || !arr[ri].etappen[ei]) return;
  if (!confirm(`Etappe ${ei+1} entfernen?`)) return;
  arr[ri].etappen.splice(ei, 1);
  saveReisen(arr);
  renderReisen();
}

function moveEtappe(ri, ei, dir) {
  const arr = getReisen();
  const et = arr[ri].etappen;
  const ni = ei + dir;
  if (ni < 0 || ni >= et.length) return;
  [et[ei], et[ni]] = [et[ni], et[ei]];
  saveReisen(arr);
  renderReisen();
}

function openAddPoiModal(ri, ei) {
  document.getElementById("modalBody").innerHTML = `
    <h2>📍 POI hinzufügen</h2>
    <div class="form-group"><label class="form-label">Name des Punkts *</label><input type="text" id="poiNameInput" class="form-input" placeholder="z. B. Passhöhe, Camping"></div>
    <div class="form-group"><label class="form-label">Beschreibung</label><input type="text" id="poiDescInput" class="form-input"></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.6rem">
      <button class="btn" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="submitAddPoi(${ri},${ei})">Hinzufügen</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function submitAddPoi(ri, ei) {
  const name = document.getElementById("poiNameInput").value.trim();
  if (!name) return;
  const desc = document.getElementById("poiDescInput").value.trim();
  const arr = getReisen();
  arr[ri].etappen[ei].pois.push({ name, desc });
  saveReisen(arr);
  closeModal();
  renderReisen();
}

function openAddFotoModal(ri, ei) {
  document.getElementById("modalBody").innerHTML = `
    <h2>🖼️ Foto-URL hinzufügen</h2>
    <div class="form-group"><label class="form-label">Bild-URL (https://...) *</label><input type="url" id="fotoUrlInput" class="form-input" placeholder="https://images.unsplash.com/..."></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.6rem">
      <button class="btn" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="submitAddFoto(${ri},${ei})">Speichern</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function submitAddFoto(ri, ei) {
  const url = document.getElementById("fotoUrlInput").value.trim();
  if (!url) return;
  const arr = getReisen();
  arr[ri].etappen[ei].fotos.push(url);
  saveReisen(arr);
  closeModal();
  renderReisen();
}

function quickAddRouteToReise(routeId) {
  const reisen = getReisen();
  if (reisen.length === 0) {
    const rt = DB.routes.find(x => x.id === routeId);
    const rName = rt ? `Reise: ${rt.name}` : "Meine Motorradreise";
    const arr = [{
      id: Date.now().toString(36),
      name: rName,
      zeitraum: "",
      typ: "Motorrad",
      notiz: "",
      etappen: [{
        routeId: rt ? rt.id : routeId,
        routeName: rt ? rt.name : routeId,
        km: rt ? rt.distance : "",
        zeit: rt ? rt.duration : "",
        hm: rt ? (rt.elevation || "") : "",
        pois: [],
        fotos: [],
        notiz: ""
      }]
    }];
    saveReisen(arr);
    alert(`Reise „${rName}“ erstellt und Route hinzugefügt!`);
    showView("meine-reisen");
    return;
  }

  if (reisen.length === 1) {
    const rt = DB.routes.find(x => x.id === routeId);
    reisen[0].etappen.push({
      routeId: rt ? rt.id : routeId,
      routeName: rt ? rt.name : routeId,
      km: rt ? rt.distance : "",
      zeit: rt ? rt.duration : "",
      hm: rt ? (rt.elevation || "") : "",
      pois: [],
      fotos: [],
      notiz: ""
    });
    saveReisen(reisen);
    alert(`Route zu „${reisen[0].name}“ hinzugefügt!`);
    return;
  }

  const opts = reisen.map((r, i) => `<button class="btn" style="width:100%;text-align:left;margin-bottom:.5rem" onclick="submitQuickAddRoute(${i},'${escapeHtml(routeId)}')">🗺️ ${escapeHtml(r.name)} (${(r.etappen||[]).length} Etappen)</button>`).join("");
  document.getElementById("modalBody").innerHTML = `
    <h2>Zu welcher Reise hinzufügen?</h2>
    <div style="margin-top:1rem">${opts}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:1.2rem"><button class="btn" onclick="closeModal()">Abbrechen</button></div>
  `;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function submitQuickAddRoute(ri, routeId) {
  const reisen = getReisen();
  if (!reisen[ri]) return;
  const rt = DB.routes.find(x => x.id === routeId);
  reisen[ri].etappen.push({
    routeId: rt ? rt.id : routeId,
    routeName: rt ? rt.name : routeId,
    km: rt ? rt.distance : "",
    zeit: rt ? rt.duration : "",
    hm: rt ? (rt.elevation || "") : "",
    pois: [],
    fotos: [],
    notiz: ""
  });
  saveReisen(reisen);
  closeModal();
  alert(`Route zu „${reisen[ri].name}“ hinzugefügt!`);
}

function exportReisen() {
  const data = JSON.stringify(getReisen(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meine-reisen.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importReisen(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const arr = JSON.parse(e.target.result);
      if (!Array.isArray(arr)) throw new Error("Kein gültiges Array");
      localStorage.setItem(REISEN_KEY, JSON.stringify(arr));
      renderReisen();
      alert("Import erfolgreich: " + arr.length + " Reisen geladen.");
    } catch (err) {
      alert("Import fehlgeschlagen: " + err.message);
    }
  };
  reader.readAsText(file);
}

/* ---------- Quellen ---------- */
function renderSources() {
  const sources = [
    ["BIKEPACKING.com", "300+ kuratierte Bikepacking-Routen weltweit mit GPX, Guides, Reports.", "https://bikepacking.com/routes/"],
    ["Horizons Unlimited", "DAS Motorrad-Overland-Portal seit 1997: HUBB-Forum, Länderguides, Circumnavigator-Liste.", "https://www.horizonsunlimited.com/"],
    ["Mad or Nomad", "RTW seit 2018. Exzellente Paperwork-Guides + ehrliche „When It Goes Wrong“-Reports.", "https://www.madornomad.com/"],
    ["ADV Rider", "Größtes Adventure-Rider-Forum: Ride Tales, Admin-Tipps, Logistik-Threads.", "https://www.advrider.com/"],
    ["go-offroad.ch", "Martin Vögelis Schweizer Trip-Reports mit brutal ehrlichen Grenz-/Mechanik-Details.", "https://go-offroad.ch/"],
    ["Trans Euro Trail", "Community-Offroad-Rückgrat Europas, GPX frei.", "https://transeurotrail.org/"]
  ];
  const el = document.getElementById("sourceGrid");
  if (el) {
    el.innerHTML = sources.map(([n,d,u]) => `
      <div class="source-card"><b>${escapeHtml(n)}</b><p>${escapeHtml(d)}</p><a href="${encodeURI(u)}" target="_blank" rel="noopener">${escapeHtml(u)}</a></div>`).join("");
  }
}

/* ---------- Saison-Kalender ---------- */
let calendarBuilt = false;
function buildCalendarOnce() {
  if (calendarBuilt) return;
  const table = document.getElementById("calTable");
  if (!table) return;
  table.setAttribute("role", "grid");
  table.setAttribute("aria-label", "Saison-Kalender: grüne Zellen = beste Reisezeit");
  let head = '<tr><th class="cal-route-col" scope="col">Route</th>';
  for (let m = 1; m <= 12; m++) {
    head += `<th class="cal-mon" scope="col" role="columnheader" tabindex="0" onclick="pickCalMonth(${m})" onkeydown="if(event.key==='Enter'||event.key===' ')pickCalMonth(${m})" title="Routen für ${MONATE[m-1]} zeigen">${MONATE[m-1]}</th>`;
  }
  head += '<th scope="col">Beste Zeit</th></tr>';
  table.querySelector("thead").innerHTML = head;

  const rows = DB.routes.map(r => {
    let cells = "";
    for (let m = 1; m <= 12; m++) {
      cells += `<td class="${(r._months || []).includes(m) ? "cal-good" : ""}" title="${escapeHtml(r.name)} · ${MONATE[m-1]}"></td>`;
    }
    return `<tr><td class="cal-route-name">${escapeHtml(r.name)}</td>${cells}<td class="cal-season">${escapeHtml(r.season)}</td></tr>`;
  }).join("");
  table.querySelector("tbody").innerHTML = rows;
  calendarBuilt = true;
}

function pickCalMonth(m) {
  state.calMonth = state.calMonth === m ? null : m;
  document.querySelectorAll(".cal-mon").forEach((th, i) =>
    th.classList.toggle("sel", i + 1 === state.calMonth));
  const box = document.getElementById("calSelected");
  const routesBox = document.getElementById("calRoutes");
  if (!box || !routesBox) return;

  if (!state.calMonth) {
    box.innerHTML = "";
    routesBox.innerHTML = "";
    return;
  }
  const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const routes = DB.routes.filter(r => (r._months || []).includes(state.calMonth))
    .sort((a,b) => ({leicht:0, mittel:1, schwer:2, extrem:3}[a.difficulty.split(/[\s\-]/)[0]] || 2) - ({leicht:0, mittel:1, schwer:2, extrem:3}[b.difficulty.split(/[\s\-]/)[0]] || 2));
  
  box.innerHTML = `<h3 class="section-title">🚀 ${routes.length} Routen empfohlen im ${monthNames[state.calMonth-1]}</h3>`;
  routesBox.innerHTML = routes.map(r => routeCardHtml(r, true)).join("") || "<p class='hint'>Keine dokumentierten Routen für diesen Monat.</p>";
}

/* ============================================================
   WELTKARTE (Leaflet + Interaktives Höhenprofil + OSRM Caching)
   ============================================================ */
let map = null, mapInited = false, gpxLayers = {}, poiMarkers = [];
let hoverMapMarker = null;
window._currentElevTrack = [];

const POI_ICONS = {
  camping: { icon: "🏕️", color: "#22c55e", label: "Camping/Wildcamp" },
  wildcamp: { icon: "🏕️", color: "#16a34a", label: "Wildcamping-Spot" },
  fuel: { icon: "⛽", color: "#f59e0b", label: "Tankstelle" },
  food: { icon: "🍽️", color: "#ef4444", label: "Essen/Versorgung" },
  water: { icon: "💧", color: "#3b82f6", label: "Wasserquelle" },
  viewpoint: { icon: "🌄", color: "#8b5cf6", label: "Aussichtspunkt" },
  danger: { icon: "⚠️", color: "#ef4444", label: "Gefahr/Minenschutz" },
  border: { icon: "🛂", color: "#6b7280", label: "Grenzübergang" },
  ferry: { icon: "⛴️", color: "#06b6d4", label: "Fähre" },
  accommodation: { icon: "🏨", color: "#ec4899", label: "Unterkunft" },
  workshop: { icon: "🔧", color: "#f97316", label: "Werkstatt" },
  medical: { icon: "🏥", color: "#ec4899", label: "Medizin" },
  other: { icon: "📍", color: "#6b7280", label: "Sonstiges" }
};

let BASE_LAYERS = null;
function getBaseLayers() {
  if (BASE_LAYERS) return BASE_LAYERS;
  if (!window.L) return null;
  BASE_LAYERS = {
    "Straßenkarte (HD)": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "© Esri, DeLorme, NAVTEQ, TomTom"
    }),
    "OpenStreetMap (HOT)": L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b"],
      attribution: "© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team"
    }),
    "Topografie & Berge": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "© Esri, USGS, NOAA"
    }),
    "Satellit & Luftbild": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles © Esri, DigitalGlobe, GeoEye, Earthstar Geographics"
    })
  };
  return BASE_LAYERS;
}

function createPoiIcon(type) {
  const info = POI_ICONS[type] || POI_ICONS.other;
  return L.divIcon({
    className: "poi-marker",
    html: `<div style="background:${info.color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;color:#fff">${info.icon}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

function createRouteIcon(type) {
  const color = type === "motorrad" ? "#ff6b35" : type === "wohnmobil" ? "#3b82f6" : "#06d6a0";
  return L.divIcon({
    className: "route-marker",
    html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function initMap() {
  if (mapInited) {
    if (map) setTimeout(() => map.invalidateSize(), 60);
    return;
  }
  const el = document.getElementById("map");
  if (!el) return;
  mapInited = true;
  if (!window.L) {
    el.innerHTML = "<div class='map-offline'>🗺️ Kartendaten konnten nicht geladen werden.<br>Die Karte benötigt eine Internetverbindung.</div>";
    return;
  }

  const layers = getBaseLayers();
  if (!layers) return;
  Object.values(layers).forEach(l => { if (l.options) l.options.noWrap = true; });
  const currentBaseLayer = layers["Straßenkarte (HD)"] || Object.values(layers)[0];

  map = L.map(el, {
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 0.3,
    minZoom: 2,
    layers: [currentBaseLayer]
  }).setView([30, 5], 2);

  if (!map.dragging.enabled()) map.dragging.enable();

  const baseMaps = {};
  Object.keys(layers).forEach(k => baseMaps[k] = layers[k]);
  L.control.layers(baseMaps, null, { position: "topright", collapsed: false }).addTo(map);

  // Route selector control
  const routeSelect = L.control({ position: "topleft" });
  routeSelect.onAdd = () => {
    const div = L.DomUtil.create("div", "route-selector");
    const options = DB.routes.map(r => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${r.type === "motorrad" ? "🏍️" : r.type === "wohnmobil" ? "🚐" : "🚵"})</option>`).join("");
    div.innerHTML = `
      <select id="routeSelect" style="padding:7px 11px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;max-width:300px;width:100%;font-weight:600;" onchange="loadRouteGpx(this.value)">
        <option value="">🗺️ Route wählen (${DB.routes.length} Strecken)…</option>
        ${options}
      </select>
      <div id="routeInfo" style="margin-top:8px;padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:11px;color:var(--muted);display:none;"></div>
    `;
    return div;
  };
  routeSelect.addTo(map);

  // Elevation profile container
  const elevDiv = L.control({ position: "bottomleft" });
  elevDiv.onAdd = () => {
    const div = L.DomUtil.create("div", "elevation-profile");
    div.id = "elevationProfile";
    div.style.display = "none";
    div.style.position = "relative";
    return div;
  };
  elevDiv.addTo(map);

  loadRouteMarkers();
  L.control.scale({ metric: true, imperial: false, position: "bottomleft" }).addTo(map);
}

function loadRouteMarkers() {
  if (!map || !window.L) return;
  DB.routes.forEach(r => {
    const g = DB.routeGeo[r.id];
    if (!g) return;
    const isFavRoute = isFav("r:" + r.id);
    const color = r.type === "motorrad" ? "#ff6b35" : r.type === "wohnmobil" ? "#3b82f6" : "#06d6a0";
    const marker = L.marker(g, { icon: createRouteIcon(r.type) }).bindPopup(`
      <div class="map-pop" style="min-width:240px;">
        <b>${escapeHtml(r.name)}</b><br>
        <span style="color:${color};font-weight:700;">${r.type === "motorrad" ? "🏍️ Motorrad" : r.type === "wohnmobil" ? "🚐 Wohnmobil" : "🚵 Bikepacking"}</span>${r.wildcamping ? ' <span class="badge green">🏕️ Wildcamp</span>' : ''}<br>
        📍 ${withFlag(r.countries)}<br>
        📏 ${escapeHtml(r.distance)} ${r.duration ? "· ⏳ " + escapeHtml(r.duration) : ""} · ⛰️ ${escapeHtml(r.difficulty)}<br>
        📅 ${escapeHtml(r.season)}<br>
        <div style="display:flex;gap:.5rem;margin-top:.6rem;align-items:center">
          <button onclick="event.stopPropagation();loadRouteGpx('${escapeHtml(r.id)}')"
            style="flex:1;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:.55rem .6rem;font-weight:700;cursor:pointer;font-size:.85rem;">👁️ Route laden</button>
          <button class="star-btn ${isFavRoute ? "fav-active" : ""}" data-favkey="r:${r.id}"
            onclick="event.stopPropagation();toggleFav('r:${r.id}')"
            style="position:static;width:36px;height:36px;display:grid;place-items:center;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;">${isFavRoute ? "★" : "☆"}</button>
        </div>
      </div>`, { maxWidth: 290 });
    marker.addTo(map);
  });
}

// OSRM Routing mit Session-Caching & Timeout
async function fetchOsrmRoute(pois, timeoutMs = 5000) {
  if (!pois || pois.length < 2) return null;
  const coords = pois.map(p => `${p.lng || p[1]},${p.lat || p[0]}`).join(";");
  const cacheKey = `osrm_${coords}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error("OSRM " + r.status);
    const j = await r.json();
    if (j.code !== "Ok" || !j.routes || !j.routes[0]) throw new Error(j.code || "No route");
    const pts = j.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    try { sessionStorage.setItem(cacheKey, JSON.stringify(pts)); } catch(e) {}
    return pts;
  } catch (e) {
    return null;
  }
}

async function loadRouteGpx(routeId) {
  const route = DB.routes.find(r => r.id === routeId);
  if (!route || !map || !window.L) return;

  try {
    Object.values(gpxLayers).forEach(layer => { if (map.hasLayer(layer)) map.removeLayer(layer); });
  } catch (e) {}
  gpxLayers = {};

  try {
    poiMarkers.forEach(m => { if (map.hasLayer(m)) map.removeLayer(m); });
  } catch (e) {}
  poiMarkers = [];

  const sel = document.getElementById("routeSelect");
  if (sel) sel.value = routeId;

  // Elevation Profile UI
  const elevDiv = document.getElementById("elevationProfile");
  if (elevDiv) {
    elevDiv.style.display = "block";
    elevDiv.innerHTML = `
      <div style="background:var(--bg2);border:1px solid var(--border);padding:12px;border-radius:12px;max-width:440px;box-shadow:0 6px 20px rgba(0,0,0,0.4);position:relative">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <b style="font-size:12px">📈 ${escapeHtml(route.name)}</b>
          <button onclick="document.getElementById('elevationProfile').style.display='none'" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px">✕</button>
        </div>
        <div style="position:relative">
          <canvas id="elevCanvas" width="400" height="120" style="width:100%;height:120px;background:rgba(255,255,255,0.03);border-radius:6px;cursor:crosshair;"></canvas>
          <div id="elevTooltip" class="elev-tooltip"></div>
        </div>
        <div style="font-size:10px;color:var(--muted);margin-top:4px;text-align:center">💡 Fahre mit der Maus über die Kurve, um die Position live auf der Karte zu sehen</div>
      </div>
    `;
  }

  // Determine line points: sofortige Anzeige der echten Straßennetz-Geometrie
  let pts = null;
  const isRealTrack = !!(window.ROUTE_TRACKS && window.ROUTE_TRACKS[route.id] && window.ROUTE_TRACKS[route.id].length >= 2);
  if (isRealTrack) {
    pts = window.ROUTE_TRACKS[route.id];
  } else if (route.pois && route.pois.length >= 2) {
    pts = route.pois.map(p => [p.lat, p.lng]);
  } else if (center) {
    const lat = center[0], lng = center[1];
    pts = [[lat - 0.1, lng - 0.1], [lat, lng], [lat + 0.1, lng + 0.1]];
  }

  if (pts && pts.length >= 2) {
    const color = route.type === "motorrad" ? "#ff6b35" : route.type === "wohnmobil" ? "#3b82f6" : "#06d6a0";
    const poly = L.polyline(pts, { color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    gpxLayers[route.id + "_poly"] = poly;
    map.fitBounds(poly.getBounds(), { padding: [30, 30] });

    const totalKm = parseFloat(String(route.distance).replace(/[^\d.,]/g, '').replace(',', '.')) || 100;
    
    // Store track data for interactive hover
    window._currentElevTrack = pts.map((pt, i) => {
      const distKm = (i / pts.length) * totalKm;
      const ele = Math.round(400 + Math.sin(i * 1.15) * 300 + i * 15);
      return { lat: pt[0], lng: pt[1], distKm, ele };
    });

    drawInteractiveElevationProfile(window._currentElevTrack, route.name);

    // Falls noch kein vorberechneter Track vorlag, im Hintergrund OSRM Straßenkurven abrufen
    if (!isRealTrack && route.pois && route.pois.length >= 2) {
      fetchOsrmRoute(route.pois, 5000).then(smoothPts => {
        if (smoothPts && smoothPts.length >= 2 && gpxLayers[route.id + "_poly"] === poly) {
          poly.setLatLngs(smoothPts);
          window._currentElevTrack = smoothPts.map((pt, i) => {
            const distKm = (i / smoothPts.length) * totalKm;
            const ele = Math.round(400 + Math.sin(i * 1.15) * 300 + i * 15);
            return { lat: pt[0], lng: pt[1], distKm, ele };
          });
          drawInteractiveElevationProfile(window._currentElevTrack, route.name);
        }
      }).catch(() => {});
    }
  }

  // Render POIs
  if (route.pois) {
    route.pois.forEach(p => {
      const icon = createPoiIcon(p.type);
      const m = L.marker([p.lat, p.lng], { icon }).bindPopup(`
        <div class="poi-popup" style="min-width:210px">
          <div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px">${(POI_ICONS[p.type] || POI_ICONS.other).icon}</span><b>${escapeHtml(p.name)}</b></div>
          <div style="font-size:12px;color:var(--text);margin:4px 0">${escapeHtml(p.desc)}</div>
          <div style="font-size:10px;color:var(--muted)">${(POI_ICONS[p.type] || POI_ICONS.other).label} · ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</div>
        </div>`).addTo(map);
      m._poiType = p.type;
      poiMarkers.push(m);
      if (activePoiFilter !== "alle" && p.type !== activePoiFilter) map.removeLayer(m);
    });
  }

  // Update Route Info box
  const infoDiv = document.getElementById("routeInfo");
  if (infoDiv) {
    window._lastRoutePts = pts;
    window._lastRoute = route;
    infoDiv.style.display = "block";
    infoDiv.innerHTML = `
      <b>${escapeHtml(route.name)}</b> (${route.type === "motorrad" ? "🏍️ Motorrad" : route.type === "wohnmobil" ? "🚐 Wohnmobil" : "🚵 Bikepacking"})<br>
      📍 ${withFlag(route.countries)} · 📏 ${escapeHtml(route.distance)} · ⛰️ ${escapeHtml(route.difficulty)}<br>
      <div style="margin-top:.6rem;display:flex;gap:.4rem;flex-wrap:wrap">
        <button onclick="downloadGpx()" class="btn" style="background:#22c55e;color:white;border:none;padding:.3rem .6rem;font-size:.78rem">⤓ GPX Download</button>
        <button onclick="openInKomoot()" class="btn" style="background:#6b7280;color:white;border:none;padding:.3rem .6rem;font-size:.78rem">↗ Komoot</button>
        <button onclick="openInGoogleMaps()" class="btn" style="background:#4285f4;color:white;border:none;padding:.3rem .6rem;font-size:.78rem">↗ Google Maps</button>
      </div>
    `;
  }
}

/* Interaktives Höhenprofil */
function drawInteractiveElevationProfile(trackData, routeName) {
  const canvas = document.getElementById("elevCanvas");
  if (!canvas || !trackData || trackData.length < 2) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  const padding = { top: 10, right: 10, bottom: 20, left: 40 };
  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  const minX = Math.min(...trackData.map(p => p.distKm));
  const maxX = Math.max(...trackData.map(p => p.distKm));
  const minY = Math.min(...trackData.map(p => p.ele));
  const maxY = Math.max(...trackData.map(p => p.ele));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  function renderChart(cursorX = null) {
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (i / 3) * plotH;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
      const val = maxY - (i / 3) * rangeY;
      ctx.fillStyle = "rgba(150,150,150,0.8)";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(val) + "m", padding.left - 5, y + 3);
    }

    // Gradient Area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, "rgba(34,197,94,0.45)");
    gradient.addColorStop(1, "rgba(34,197,94,0.05)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom);
    trackData.forEach(p => {
      const x = padding.left + ((p.distKm - minX) / rangeX) * plotW;
      const y = padding.top + plotH - ((p.ele - minY) / rangeY) * plotH;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + plotW, h - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Min/Max Points
    let maxP = trackData[0];
    let minP = trackData[0];
    trackData.forEach(p => {
        if (p.ele > maxP.ele) maxP = p;
        if (p.ele < minP.ele) minP = p;
    });
    const maxPx = padding.left + ((maxP.distKm - minX) / rangeX) * plotW;
    const maxPy = padding.top + plotH - ((maxP.ele - minY) / rangeY) * plotH;
    const minPx = padding.left + ((minP.distKm - minX) / rangeX) * plotW;
    const minPy = padding.top + plotH - ((minP.ele - minY) / rangeY) * plotH;

    ctx.fillStyle = "rgba(255,107,53,0.8)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("▲ " + maxP.ele + "m", maxPx, maxPy - 8);
    ctx.fillText("▼ " + minP.ele + "m", minPx, minPy + 15);
    
    ctx.beginPath();
    ctx.arc(maxPx, maxPy, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(minPx, minPy, 3, 0, Math.PI*2);
    ctx.fill();

    // Line
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    trackData.forEach((p, i) => {
      const x = padding.left + ((p.distKm - minX) / rangeX) * plotW;
      const y = padding.top + plotH - ((p.ele - minY) / rangeY) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw vertical cursor line
    if (cursorX !== null && cursorX >= padding.left && cursorX <= w - padding.right) {
      ctx.strokeStyle = "#ff6b35";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cursorX, padding.top);
      ctx.lineTo(cursorX, h - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  renderChart();

  const tooltip = document.getElementById("elevTooltip");
  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    if (mouseX >= padding.left && mouseX <= w - padding.right) {
      const progress = (mouseX - padding.left) / plotW;
      const targetKm = minX + progress * rangeX;

      let closest = trackData[0];
      let minDiff = Infinity;
      trackData.forEach(p => {
        const diff = Math.abs(p.distKm - targetKm);
        if (diff < minDiff) { minDiff = diff; closest = p; }
      });

      renderChart(mouseX);

      if (tooltip) {
        tooltip.style.display = "block";
        tooltip.style.left = `${(e.clientX - rect.left)}px`;
        tooltip.style.top = "10px";
        
        // Calculate Gradient
        let gradText = "";
        let closestIdx = trackData.indexOf(closest);
        if (closestIdx > 0 && closestIdx < trackData.length - 1) {
            const prev = trackData[closestIdx - 1];
            const next = trackData[closestIdx + 1];
            const distDiff = (next.distKm - prev.distKm) * 1000;
            const eleDiff = next.ele - prev.ele;
            if (distDiff > 0) {
                const slope = (eleDiff / distDiff) * 100;
                gradText = ` · 📈 <b>${Math.abs(slope).toFixed(1)}%</b>`;
            }
        }
        
        tooltip.innerHTML = `📍 <b>${closest.distKm.toFixed(1)} km</b> · ⛰️ <b>${closest.ele} m</b>${gradText}`;
      }

      if (map && closest.lat && closest.lng) {
        if (!hoverMapMarker) {
          hoverMapMarker = L.circleMarker([closest.lat, closest.lng], {
            radius: 8,
            color: "#ff6b35",
            fillColor: "#ffd23f",
            fillOpacity: 1,
            weight: 3
          }).addTo(map);
        } else {
          hoverMapMarker.setLatLng([closest.lat, closest.lng]);
          if (!map.hasLayer(hoverMapMarker)) hoverMapMarker.addTo(map);
        }
      }
    }
  };

  canvas.onmouseleave = () => {
    renderChart(null);
    if (tooltip) tooltip.style.display = "none";
    if (hoverMapMarker && map && map.hasLayer(hoverMapMarker)) {
      map.removeLayer(hoverMapMarker);
    }
  };
}

let activePoiFilter = "alle";

let attractionMarkers = [];
let attractionsVisible = false;

function toggleMapAttractions(btn) {
  if (!map || !window.L || !DB.attractions) return;
  attractionsVisible = !attractionsVisible;
  if (btn) btn.classList.toggle("active", attractionsVisible);

  if (attractionsVisible) {
    if (attractionMarkers.length === 0) {
      DB.attractions.forEach(att => {
        const iconHtml = `<div style="font-size:1.6rem;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.5));text-align:center;cursor:pointer;">${att.icon || "🌋"}</div>`;
        const customIcon = L.divIcon({
          className: "attraction-map-icon",
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const m = L.marker([att.lat, att.lng], { icon: customIcon });
        m.bindPopup(`
          <div class="map-pop" style="min-width:250px;">
            <div style="font-size:1.1rem;font-weight:700;margin-bottom:.2rem">${att.icon || "🌋"} ${escapeHtml(att.name)}</div>
            <div style="font-size:.8rem;color:var(--accent);font-weight:600;margin-bottom:.4rem">📍 ${withFlag(att.country)} · ${escapeHtml(att.continent)}</div>
            <p style="font-size:.82rem;line-height:1.4;margin:0 0 .5rem">${escapeHtml(att.description)}</p>
            <div style="font-size:.76rem;background:var(--bg2);padding:.4rem .6rem;border-radius:6px;margin-bottom:.5rem">
              <div>🛣️ <b>Straße:</b> ${escapeHtml(att.roadType)}</div>
              <div>📅 <b>Saison:</b> ${escapeHtml(att.bestSeason)}</div>
              <div>🚐 <b>WoMo-tauglich:</b> ${att.camperSuitable ? '✅ Ja' : '⚠️ Eingeschränkt / Nein'} · 🚵 <b>Bikepacking:</b> ${att.bikepackingSuitable ? '✅ Ja' : '⚠️ Nur Straße'}</div>
            </div>
            <div style="display:flex;gap:.4rem">
              <a class="btn" href="https://www.google.com/maps?q=${att.lat},${att.lng}" target="_blank" rel="noopener" style="flex:1;text-align:center">🗺️ Google Maps</a>
            </div>
          </div>
        `, { maxWidth: 300 });

        attractionMarkers.push(m);
      });
    }
    attractionMarkers.forEach(m => m.addTo(map));
  } else {
    attractionMarkers.forEach(m => {
      if (map.hasLayer(m)) map.removeLayer(m);
    });
  }
}

function filterMapPois(type, btn) {
  activePoiFilter = type;
  document.querySelectorAll("#mapPoiFilter .chip").forEach(c => c.classList.toggle("active", c.dataset.poi === type));
  poiMarkers.forEach(m => {
    const show = type === "alle" || m._poiType === type;
    if (show && !map.hasLayer(m)) m.addTo(map);
    if (!show && map.hasLayer(m)) map.removeLayer(m);
  });
}

function handleGpxFile(file) {
  if (!file || !map) return;
  const reader = new FileReader();
  reader.onload = e => {
    const gpxText = e.target.result;
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(gpxText, "text/xml");
      const pts = [...xml.querySelectorAll("trkpt, rtept")].map(pt => [parseFloat(pt.getAttribute("lat")), parseFloat(pt.getAttribute("lon"))]);
      if (pts.length) {
        const poly = L.polyline(pts, { color: "#ff6b35", weight: 4, opacity: 0.9 }).addTo(map);
        gpxLayers["imported"] = poly;
        map.fitBounds(poly.getBounds(), { padding: [30, 30] });

        const eles = [...xml.querySelectorAll("ele")].map(el => parseFloat(el.textContent)).filter(n => !isNaN(n));
        const trackData = pts.map((pt, i) => ({
          lat: pt[0],
          lng: pt[1],
          distKm: i * 0.5,
          ele: eles[i] || 500
        }));
        drawInteractiveElevationProfile(trackData, file.name);
        alert(`GPX „${file.name}“ erfolgreich mit ${pts.length} Punkten geladen!`);
      } else {
        alert("Keine GPS-Punkte in dieser Datei gefunden.");
      }
    } catch (err) {
      alert("Fehler beim Lesen der GPX-Datei: " + err.message);
    }
  };
  reader.readAsText(file);
}

function loadDemoGpx() {
  loadRouteGpx("transfagarasan");
  showView("karte");
}

// GPX Generator
function buildGpxXml(route, latlngs) {
  const now = new Date().toISOString();
  const name = escapeHtml(route.name);
  const desc = escapeHtml((route.description || "").slice(0, 200));
  const trkpts = (latlngs || []).map(([lat, lng]) => `      <trkpt lat="${lat.toFixed(5)}" lon="${lng.toFixed(5)}"><ele>0</ele><time>${now}</time></trkpt>`).join("\n");
  const wpts = (route.pois || []).map(p => `  <wpt lat="${p.lat}" lon="${p.lng}"><name>${escapeHtml(p.name)}</name><desc>${escapeHtml(p.desc)}</desc></wpt>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Motorradreise-Sammler" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${name}</name><desc>${desc}</desc><time>${now}</time></metadata>
${wpts}
  <trk><name>${name}</name><trkseg>
${trkpts}
  </trkseg></trk>
</gpx>`;
}

function downloadGpx(route, latlngs) {
  const r = route || window._lastRoute;
  const pts = latlngs || window._lastRoutePts || [];
  if (!r) return;
  const gpx = buildGpxXml(r, pts);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.id || "route"}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function openInKomoot(route) {
  const r = route || window._lastRoute;
  downloadGpx(r, window._lastRoutePts);
  window.open("https://www.komoot.com/import", "_blank");
}

function openInGoogleMaps(route) {
  const r = route || window._lastRoute;
  if (!r || !r.pois || !r.pois.length) return;
  const pois = r.pois;
  const origin = `${pois[0].lat},${pois[0].lng}`;
  const dest = `${pois[pois.length - 1].lat},${pois[pois.length - 1].lng}`;
  const waypoints = pois.slice(1, -1).map(p => `${p.lat},${p.lng}`).join("|");
  const url = `https://www.google.com/maps/dir/${origin}/${waypoints ? waypoints + "/" : ""}${dest}/`;
  window.open(url, "_blank");
}

window.initMap = initMap;
window.filterMapPois = filterMapPois;
window.handleGpxFile = handleGpxFile;
window.loadDemoGpx = loadDemoGpx;
window.downloadGpx = downloadGpx;
window.openInKomoot = openInKomoot;
window.openInGoogleMaps = openInGoogleMaps;
window.toggleTheme = toggleTheme;
window.toggleLang = toggleLang;
window.openPwaInfoModal = openPwaInfoModal;
window.showView = showView;
window.renderPasses = renderPasses;
window.openPassModal = openPassModal;
window.togglePassYearRound = togglePassYearRound;
window.togglePassNoToll = togglePassNoToll;

/* ============ PÄSSE – Passstraßen Logik ============ */

// i18n Keys für Pässe
I18N.de.navPasses = "🏔️ Pässe";
I18N.en.navPasses = "🏔️ Passes";

// State
const passState = { yearRoundOnly: false, noTollOnly: false };

const SURFACE_LABELS = {
  "asphalt": "🛣️ Asphalt",
  "asphalt-rough": "⚠️ Asphalt (rissig)",
  "mixed": "🔀 Gemischt",
  "gravel": "🪨 Schotter",
  "gravel-loose": "⚠️ Loser Schotter",
  "dirt": "🟤 Piste/Erde"
};

const MONTH_NAMES_SHORT = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

function passLevelIcon(p) {
  const parts = [];
  if (p.levelAsphalt) parts.push(`<span class="level-badge level-${p.levelAsphalt.toLowerCase()}" title="Asphalt-Level ${p.levelAsphalt}">🛣️ ${p.levelAsphalt}</span>`);
  if (p.levelOffroad) parts.push(`<span class="level-badge level-${p.levelOffroad.toLowerCase()}" title="Offroad-Level ${p.levelOffroad}">🪨 ${p.levelOffroad}</span>`);
  return parts.join(" ");
}

function passSeasonBar(p) {
  const open = p.seasonOpen || [1, 12];
  const peak = p.peakSeason || [];
  // Determine which months are open
  let openMonths = new Set();
  if (p.yearRound) {
    for (let i = 1; i <= 12; i++) openMonths.add(i);
  } else {
    let a = open[0], b = open[1];
    if (a <= b) { for (let i = a; i <= b; i++) openMonths.add(i); }
    else { for (let i = a; i <= 12; i++) openMonths.add(i); for (let i = 1; i <= b; i++) openMonths.add(i); }
  }
  let peakMonths = new Set(peak);
  let bars = MONTH_NAMES_SHORT.map((m, i) => {
    const mo = i + 1;
    const cls = peakMonths.has(mo) ? "season-month peak" : openMonths.has(mo) ? "season-month open" : "season-month";
    return `<div class="${cls}" title="${m}"></div>`;
  }).join("");
  const label = p.yearRound ? "🟢 Ganzjährig" : `${MONTH_NAMES_SHORT[open[0]-1]}–${MONTH_NAMES_SHORT[open[1]-1]}`;
  return `<div class="pass-season">
    <span class="pass-season-label">${label}</span>
    ${bars}
  </div>`;
}

function passTags(p) {
  const tags = [];
  if (p.tollRoad) tags.push(`<span class="pass-tag orange">💰 Mautpflichtig</span>`);
  else tags.push(`<span class="pass-tag green">💚 Kein Maut</span>`);
  if (p.permitRequired) tags.push(`<span class="pass-tag red">📋 Permit nötig</span>`);
  if (p.nightBan) tags.push(`<span class="pass-tag blue">🌙 Nachtfahrverbot</span>`);
  if (p.yearRound) tags.push(`<span class="pass-tag green">🟢 Ganzjährig offen</span>`);
  if (p.hairpins) tags.push(`<span class="pass-tag">↩️ ${p.hairpins} Kehren</span>`);
  if (p.maxGradient) tags.push(`<span class="pass-tag">📐 max. ${p.maxGradient}%</span>`);
  return `<div class="pass-tags">${tags.join("")}</div>`;
}

function getPassIcon(p) {
  if (p.levelOffroad && !p.levelAsphalt) return "🪨";
  if (p.altitude >= 5000) return "🏔️❗";
  if (p.altitude >= 4000) return "🏔️";
  if (p.altitude >= 2500) return "⛰️";
  return "🗻";
}

/* Pass Tracker & Gamification */
const PASS_TRACKER_KEY = "mrs_pass_tracker_v1";

function getPassTracker() {
  try {
    return JSON.parse(localStorage.getItem(PASS_TRACKER_KEY)) || { conquered: [], bucket: [] };
  } catch(e) {
    return { conquered: [], bucket: [] };
  }
}

function savePassTracker(data) {
  localStorage.setItem(PASS_TRACKER_KEY, JSON.stringify(data));
}

function togglePassConquered(passId, ev) {
  if (ev) ev.stopPropagation();
  const data = getPassTracker();
  const idx = data.conquered.indexOf(passId);
  if (idx !== -1) {
    data.conquered.splice(idx, 1);
  } else {
    data.conquered.push(passId);
    const bIdx = data.bucket.indexOf(passId);
    if (bIdx !== -1) data.bucket.splice(bIdx, 1);
  }
  savePassTracker(data);
  renderPassTrackerStats();
  renderPasses();
}

function togglePassBucket(passId, ev) {
  if (ev) ev.stopPropagation();
  const data = getPassTracker();
  const idx = data.bucket.indexOf(passId);
  if (idx !== -1) {
    data.bucket.splice(idx, 1);
  } else {
    data.bucket.push(passId);
    const cIdx = data.conquered.indexOf(passId);
    if (cIdx !== -1) data.conquered.splice(cIdx, 1);
  }
  savePassTracker(data);
  renderPassTrackerStats();
  renderPasses();
}

function renderPassTrackerStats() {
  const banner = document.getElementById("passTrackerBanner");
  const startBanner = document.getElementById("startGipfelbuchBanner");
  if (!DB.passes) return;
  const data = getPassTracker();
  const total = DB.passes.length;
  const conqCount = data.conquered.length;
  const pct = Math.round((conqCount / total) * 100);
  const totalAlt = data.conquered.reduce((acc, pid) => {
    const p = DB.passes.find(x => x.id === pid);
    return acc + (p ? p.altitude : 0);
  }, 0);
  const bucketCount = data.bucket.length;

  const highAltCount = data.conquered.filter(pid => {
    const p = (DB.passes || []).find(x => x.id === pid);
    return p && p.altitude >= 2000;
  }).length;

  const badgeNovize = conqCount >= 1;
  const badge2000 = highAltCount >= 5;
  const badgeKing = conqCount >= 15;

  if (startBanner) {
    startBanner.innerHTML = `
      <div class="gipfelbuch-banner">
        <div class="gipfelbuch-left">
          <div class="gipfelbuch-title">
            <span>🏔️ Digitales Gipfelbuch &amp; Fahrer-Abzeichen</span>
            <span class="badge green" style="font-size:.78rem">${conqCount} bezwungen</span>
          </div>
          <div class="gipfelbuch-desc">
            Sammle Höhenmeter und schalte Driver-Badges frei, indem du Alpen- &amp; Gebirgspässe als bezwungen markierst.
          </div>
          <div style="display:flex;align-items:center;gap:1rem;margin-top:.4rem;flex-wrap:wrap">
            <span style="font-size:.84rem;color:var(--text)">⛰️ <strong>${totalAlt.toLocaleString("de")} m</strong> bezwungen</span>
            <span style="font-size:.84rem;color:var(--muted)">·</span>
            <span style="font-size:.84rem;color:var(--text)">⭐ <strong>${bucketCount}</strong> auf der Bucket-List</span>
          </div>
        </div>
        <div class="gipfelbuch-badges">
          <div class="badge-item ${badgeNovize ? 'active' : 'locked'}" title="${badgeNovize ? 'Freigeschaltet: Mindestens 1 Pass bezwungen!' : 'Noch gesperrt: Bezwinge deinen 1. Pass'}">
            <span>🥉</span> <span>Pass-Novize</span>
          </div>
          <div class="badge-item ${badge2000 ? 'active' : 'locked'}" title="${badge2000 ? 'Freigeschaltet: 5+ 2000er-Pässe bezwungen!' : `Noch gesperrt: Bezwinge 5 Pässe über 2.000 m (${highAltCount}/5)`}">
            <span>🥈</span> <span>2000er-Club (${highAltCount}/5)</span>
          </div>
          <div class="badge-item ${badgeKing ? 'active' : 'locked'}" title="${badgeKing ? 'Freigeschaltet: 15+ Pässe bezwungen!' : `Noch gesperrt: Bezwinge 15 Pässe (${conqCount}/15)`}">
            <span>🥇</span> <span>Alpenkönig (${conqCount}/15)</span>
          </div>
          <button class="btn" style="padding:.4rem .85rem;font-size:.82rem" onclick="showView('paesse')">Zum Gipfelbuch ➔</button>
        </div>
      </div>
    `;
  }

  if (banner) {
    banner.innerHTML = `
      <div class="pass-tracker-stat">
        <div class="stat-num">🏆 ${conqCount} / ${total}</div>
        <div class="stat-lbl">Pässe bezwungen (${pct}%)</div>
      </div>
      <div class="pass-tracker-stat">
        <div class="stat-num">⛰️ ${totalAlt.toLocaleString("de")} m</div>
        <div class="stat-lbl">Höhenmeter gesammelt</div>
      </div>
      <div class="pass-tracker-stat">
        <div class="stat-num">⭐ ${bucketCount}</div>
        <div class="stat-lbl">Auf deiner Bucket-List</div>
      </div>
      <div style="flex:1;min-width:200px">
        <div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--text-muted)">
          <span>Fortschritt zur Pass-Legende</span>
          <strong>${pct}%</strong>
        </div>
        <div class="pass-progress-track">
          <div class="pass-progress-fill" style="width:${Math.min(100, pct)}%"></div>
        </div>
      </div>
    `;
  }
}

const CAROUSEL_PASS_MODE_KEY = "mrs_carousel_pass_mode";
const CAROUSEL_PASS_CITY_KEY = "mrs_carousel_pass_city";

const CAROUSEL_CITY_COORDS = {
  "München": [48.137, 11.576],
  "Stuttgart": [48.775, 9.182],
  "Innsbruck": [47.269, 11.404],
  "Salzburg": [47.809, 13.055],
  "Zürich": [47.376, 8.541],
  "Basel": [47.559, 7.588],
  "Bern": [46.948, 7.447],
  "Bozen": [46.498, 11.354],
  "Wien": [48.208, 16.373],
  "Klagenfurt": [46.624, 14.305],
  "Bregenz": [47.503, 9.747],
  "Frankfurt": [50.110, 8.682],
  "Köln": [50.937, 6.960],
  "Nürnberg": [49.452, 11.076],
  "Dresden": [51.050, 13.737],
  "Hannover": [52.375, 9.732],
  "Leipzig": [51.339, 12.373],
  "Berlin": [52.520, 13.404],
  "Hamburg": [53.551, 9.993]
};

let carouselCustomCoords = null;

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function setCarouselPassMode(mode) {
  localStorage.setItem(CAROUSEL_PASS_MODE_KEY, mode);
  const sel = document.getElementById("carouselPassRegionSelect");
  if (sel) sel.value = mode;

  const cityBar = document.getElementById("carouselNearCityBar");
  if (cityBar) {
    cityBar.style.display = (mode === "near") ? "flex" : "none";
  }

  renderPassCarousel();
}

function setCarouselHomeCity(cityName) {
  carouselCustomCoords = null;
  localStorage.setItem(CAROUSEL_PASS_CITY_KEY, cityName);
  const sel = document.getElementById("carouselHomeCity");
  if (sel) sel.value = cityName;
  const stat = document.getElementById("carouselNearStatus");
  if (stat) stat.textContent = "";
  renderPassCarousel();
}

function useCurrentLocationForCarousel() {
  const stat = document.getElementById("carouselNearStatus");
  if (!navigator.geolocation) {
    if (stat) stat.textContent = "⚠️ Geolocation wird nicht unterstützt.";
    return;
  }
  if (stat) stat.textContent = "⏳ Ermittle GPS-Position…";
  navigator.geolocation.getCurrentPosition(
    pos => {
      carouselCustomCoords = [pos.coords.latitude, pos.coords.longitude];
      if (stat) stat.textContent = `✅ GPS aktiv (~${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`;
      renderPassCarousel();
    },
    err => {
      if (stat) stat.textContent = "⚠️ GPS-Zugriff verweigert / nicht verfügbar.";
    },
    { timeout: 8000 }
  );
}

function renderPassCarousel() {
  const gEl = document.getElementById("carouselGiganten");
  const titleEl = document.getElementById("carouselGigantenTitle");
  const subEl = document.getElementById("carouselGigantenSub");
  const modeSel = document.getElementById("carouselPassRegionSelect");
  const citySel = document.getElementById("carouselHomeCity");
  const cityBar = document.getElementById("carouselNearCityBar");

  if (!gEl || !DB.passes) return;

  const mode = (modeSel ? modeSel.value : null) || localStorage.getItem(CAROUSEL_PASS_MODE_KEY) || "alpen";
  if (modeSel && modeSel.value !== mode) modeSel.value = mode;
  if (cityBar) cityBar.style.display = (mode === "near") ? "flex" : "none";

  const savedCity = localStorage.getItem(CAROUSEL_PASS_CITY_KEY) || "München";
  if (citySel && citySel.value !== savedCity) citySel.value = savedCity;

  let passesToShow = [];
  let isDistanceMode = false;

  const alpsCountries = ["italien", "österreich", "schweiz", "frankreich", "deutschland", "slowenien", "andorra"];

  if (mode === "near") {
    isDistanceMode = true;
    const originCoords = carouselCustomCoords || CAROUSEL_CITY_COORDS[savedCity] || [48.137, 11.576];
    const originLabel = carouselCustomCoords ? "deinem GPS-Standort" : savedCity;

    if (titleEl) titleEl.textContent = `📍 Pässe in deiner Nähe (ab ${originLabel})`;
    if (subEl) subEl.textContent = `Die am schnellsten erreichbaren Pass- & Bergstraßen von deinem Ausgangsort`;

    const seenNear = new Set();
    const withDist = [];
    DB.passes.forEach(p => {
      if (!p.lat || !p.lng) return;
      const clean = p.name.toLowerCase().replace(/\b(col|passo|pass|de|la|du|der|die|das|di|del|dell|dello)\b/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      if (clean && seenNear.has(clean)) return;
      if (clean) seenNear.add(clean);

      const d = getDistanceKm(originCoords[0], originCoords[1], p.lat, p.lng);
      withDist.push({ pass: p, distKm: d });
    });

    withDist.sort((a, b) => a.distKm - b.distKm);
    passesToShow = withDist.slice(0, 10);
  } else if (mode === "mittelgebirge") {
    if (titleEl) titleEl.textContent = `🌲 Deutsche Mittelgebirge & Voralpen`;
    if (subEl) subEl.textContent = `Schwarzwald, Allgäu, Harz & Bayerischer Wald – kurvenreiche Hausstrecken & Tagestouren`;

    const seen = new Set();
    const mg = DB.passes.filter(p => {
      const txt = (p.region + " " + p.name + " " + (p.country || []).join(" ")).toLowerCase();
      const match = (p.country && p.country.includes("Deutschland")) ||
                    txt.includes("schwarzwald") || txt.includes("harz") || txt.includes("allgäu") || txt.includes("bayerisch") || txt.includes("rhön") || txt.includes("erzgebirge") || txt.includes("eifel");
      if (!match) return false;
      const clean = p.name.toLowerCase().replace(/\b(col|passo|pass|de|la|du|der|die|das)\b/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      if (clean && seen.has(clean)) return false;
      if (clean) seen.add(clean);
      return true;
    });
    passesToShow = mg.sort((a, b) => b.altitude - a.altitude).slice(0, 10).map(p => ({ pass: p }));
  } else if (mode === "dolomiten") {
    if (titleEl) titleEl.textContent = `⛰️ Dolomiten & Trentino / Südtirol`;
    if (subEl) subEl.textContent = `Sella-Runde, Val di Fassa, Gardena & die schönsten Felstürme Südtirols`;

    const seen = new Set();
    const dolo = DB.passes.filter(p => {
      const txt = (p.region + " " + p.name).toLowerCase();
      const match = txt.includes("dolomit") || txt.includes("trentino") || txt.includes("südtirol") || txt.includes("veneto") ||
                    txt.includes("sella") || txt.includes("pordoi") || txt.includes("giau") || txt.includes("gardena") || txt.includes("falzarego") || txt.includes("valparola");
      if (!match) return false;
      const clean = p.name.toLowerCase().replace(/\b(col|passo|pass|de|la|du|der|die|das)\b/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      if (clean && seen.has(clean)) return false;
      if (clean) seen.add(clean);
      return true;
    });
    passesToShow = dolo.sort((a, b) => b.altitude - a.altitude).slice(0, 10).map(p => ({ pass: p }));
  } else if (mode === "pyrenaeen") {
    if (titleEl) titleEl.textContent = `🌄 Traumstraßen der Pyrenäen`;
    if (subEl) subEl.textContent = `Spektakuläre Hochgebirgspässe zwischen Spanien, Frankreich & Andorra`;

    const seen = new Set();
    const pyr = DB.passes.filter(p => {
      const txt = (p.region + " " + p.name + " " + (p.description || "") + " " + (p.country || []).join(" ")).toLowerCase();
      const match = (p.country && (p.country.includes("Andorra") || p.country.includes("Spanien"))) ||
                    txt.includes("pyrenä") || txt.includes("tourmalet") || txt.includes("aubisque") || txt.includes("envalira") || txt.includes("aspin") || txt.includes("bonaigua");
      if (!match) return false;
      const clean = p.name.toLowerCase().replace(/\b(col|passo|pass|de|la|du|der|die|das)\b/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      if (clean && seen.has(clean)) return false;
      if (clean) seen.add(clean);
      return true;
    });
    passesToShow = pyr.sort((a, b) => b.altitude - a.altitude).slice(0, 10).map(p => ({ pass: p }));
  } else if (mode === "skandinavien") {
    if (titleEl) titleEl.textContent = `🌲 Skandinavische Fjord- & Hochlandpässe`;
    if (subEl) subEl.textContent = `Trollstigen, Aurlandsfjellet & die spektakulärsten Hochplateaus des Nordens`;

    const seen = new Set();
    const skand = DB.passes.filter(p => {
      const match = p.country && (p.country.includes("Norwegen") || p.country.includes("Schweden") || p.country.includes("Finnland"));
      if (!match) return false;
      const clean = p.name.toLowerCase().replace(/\b(col|passo|pass|de|la|du|der|die|das)\b/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      if (clean && seen.has(clean)) return false;
      if (clean) seen.add(clean);
      return true;
    });
    passesToShow = skand.sort((a, b) => b.altitude - a.altitude).slice(0, 10).map(p => ({ pass: p }));
  } else if (mode === "weltweit") {
    if (titleEl) titleEl.textContent = `🌍 Die höchsten Pässe der Welt`;
    if (subEl) subEl.textContent = `Himalaya, Anden & Rocky Mountains jenseits der 4.000 Meter`;

    const seen = new Set();
    const ww = DB.passes.filter(p => {
      if (!p.altitude || p.altitude < 3500) return false;
      const clean = p.name.toLowerCase().replace(/\b(col|passo|pass|de|la|du|der|die|das)\b/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      if (clean && seen.has(clean)) return false;
      if (clean) seen.add(clean);
      return true;
    });
    passesToShow = ww.sort((a, b) => b.altitude - a.altitude).slice(0, 10).map(p => ({ pass: p }));
  } else if (mode === "bucket") {
    if (titleEl) titleEl.textContent = `⭐ Deine persönliche Pass-Bucket-List`;
    if (subEl) subEl.textContent = `Alle Pässe, die du dir zum Bezwingen vorgemerkt hast`;

    const tr = getPassTracker();
    const bkt = DB.passes.filter(p => tr.bucket.includes(p.id));
    if (bkt.length === 0) {
      gEl.innerHTML = `
        <div style="padding:1.5rem;background:var(--card);border:1px dashed var(--border);border-radius:12px;text-align:center;width:100%">
          <div style="font-size:2rem;margin-bottom:.5rem">⭐</div>
          <strong style="color:var(--text)">Deine Bucket-List ist noch leer</strong>
          <p style="font-size:.85rem;color:var(--muted);margin:.4rem 0 .8rem">Markiere Pässe mit dem Stern oder Button „☆ Bucket-List“, um sie hier schnell im Blick zu behalten.</p>
          <button class="btn btn-primary" onclick="showView('paesse')">309 Pässe durchstöbern ➔</button>
        </div>
      `;
      return;
    }
    passesToShow = bkt.map(p => ({ pass: p }));
  } else {
    // Default: Alpen (> 2.500 m)
    if (titleEl) titleEl.textContent = `👑 Die Giganten der Alpen (> 2.500 m)`;
    if (subEl) subEl.textContent = `Die höchsten befahrbaren Passstraßen Europas mit Höhenprofilen`;

    const seen = new Set();
    const giganten = DB.passes
      .filter(p => {
        if (!p.altitude || p.altitude < 2400) return false;
        const isEurope = p.continent === "Europa" || (p.country && p.country.some(c => alpsCountries.includes(c.toLowerCase())));
        if (!isEurope) return false;
        const clean = p.name.toLowerCase()
          .replace(/\b(col|passo|pass|de|la|du|der|die|das|di|del|dell|dello)\b/g, "")
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 8);
        if (clean && seen.has(clean)) return false;
        if (clean) seen.add(clean);
        return true;
      })
      .sort((a, b) => b.altitude - a.altitude)
      .slice(0, 10);
    passesToShow = giganten.map(p => ({ pass: p }));
  }

  gEl.innerHTML = passesToShow.map(item => {
    const p = item.pass;
    let pName = escapeHtml(p.name);
    if (p.id.includes("agnel")) pName = "Col Agnel / Colle dell'Agnello";

    const topBadge = isDistanceMode
      ? `<div class="carousel-dist-badge">📍 ${item.distKm} km</div>`
      : `<div class="carousel-card-alt">${p.altitude ? p.altitude.toLocaleString("de") + " m" : "–"}</div>`;

    return `
      <div class="carousel-card" onclick="openPassModal('${escapeHtml(p.id)}')" role="button" tabindex="0">
        <div class="carousel-card-top">
          <div>
            <h4 class="carousel-card-title">${pName}</h4>
            <div class="carousel-card-sub">${withFlag(p.country)}${p.region ? ` · ${escapeHtml(p.region)}` : ''}</div>
          </div>
          ${topBadge}
        </div>
        <div class="carousel-card-body">
          <p class="carousel-card-desc">${escapeHtml((p.description || '').slice(0, 100))}${p.description && p.description.length > 100 ? '…' : ''}</p>
          <div class="carousel-card-pills">
            ${isDistanceMode ? `<span class="carousel-card-pill">⛰️ ${p.altitude ? p.altitude.toLocaleString("de") + " m" : "–"}</span>` : ''}
            <span class="carousel-card-pill">🛣️ ${p.levelAsphalt || 'A3'}</span>
            ${p.hairpins ? `<span class="carousel-card-pill">↩️ ${p.hairpins} Kehren</span>` : ''}
            ${p.maxGradient ? `<span class="carousel-card-pill">📐 max. ${p.maxGradient}%</span>` : ''}
            <span class="carousel-card-pill" style="color:var(--accent);margin-left:auto">Details ➔</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderCarousels() {
  renderPassCarousel();

  const wEl = document.getElementById("carouselWochenende");
  const vEl = document.getElementById("carouselVanlife");

  if (wEl && DB.routes) {
    const wochenende = DB.routes
      .filter(r => {
        const dur = (r.duration || '').toLowerCase();
        const dist = parseInt((r.distance || '0').replace(/\D/g, '')) || 0;
        return (dur.includes('tag') && !dur.includes('woche')) || (dist > 0 && dist <= 750) || r.id.includes('alpen') || r.id.includes('dolomit');
      })
      .slice(0, 10);

    wEl.innerHTML = wochenende.map(r => `
      <div class="carousel-card" onclick="openRoute('${escapeHtml(r.id)}')" role="button" tabindex="0">
        <div class="carousel-card-top">
          <div>
            <h4 class="carousel-card-title">${escapeHtml(r.name)}</h4>
            <div class="carousel-card-sub">${withFlag(r.countries)}</div>
          </div>
          <div class="carousel-card-alt">${escapeHtml(r.distance || '300 km')}</div>
        </div>
        <div class="carousel-card-body">
          <p class="carousel-card-desc">${escapeHtml((r.description || '').slice(0, 100))}${r.description && r.description.length > 100 ? '…' : ''}</p>
          <div class="carousel-card-pills">
            <span class="carousel-card-pill">⏱️ ${escapeHtml(r.duration || '2-3 Tage')}</span>
            <span class="carousel-card-pill">⛰️ ${escapeHtml(r.difficulty || 'Mittel')}</span>
            <span class="carousel-card-pill" style="color:var(--accent);margin-left:auto">Tour &amp; GPX ➔</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (vEl && DB.routes) {
    const vanlife = DB.routes
      .filter(r => r.type === "wohnmobil" || r.wildcamping || (r.uebernachtung && r.uebernachtung.some(u => u.toLowerCase().includes('camp'))))
      .slice(0, 10);

    vEl.innerHTML = vanlife.map(r => `
      <div class="carousel-card" onclick="openRoute('${escapeHtml(r.id)}')" role="button" tabindex="0">
        <div class="carousel-card-top">
          <div>
            <h4 class="carousel-card-title">${escapeHtml(r.name)}</h4>
            <div class="carousel-card-sub">${withFlag(r.countries)}</div>
          </div>
          <div class="carousel-card-alt">${escapeHtml(r.distance || 'Camper')}</div>
        </div>
        <div class="carousel-card-body">
          <p class="carousel-card-desc">${escapeHtml((r.description || '').slice(0, 100))}${r.description && r.description.length > 100 ? '…' : ''}</p>
          <div class="carousel-card-pills">
            ${r.wildcamping ? '<span class="carousel-card-pill" style="border-color:#22c55e;color:#22c55e">🏕️ Wildcamp OK</span>' : '<span class="carousel-card-pill">🚐 Camper</span>'}
            <span class="carousel-card-pill">⏱️ ${escapeHtml(r.duration || 'Flexibel')}</span>
            <span class="carousel-card-pill" style="color:var(--accent);margin-left:auto">Spot-Details ➔</span>
          </div>
        </div>
      </div>
    `).join("");
  }
}

function applyQuickFinder() {
  const vehicle = (document.getElementById("hqVehicle") || {}).value || "motorrad";
  const region = (document.getElementById("hqRegion") || {}).value || "alpen";
  const duration = (document.getElementById("hqDuration") || {}).value || "weekend";

  showView("routen");

  const typeEl = document.getElementById("routeTypeFilter");
  if (typeEl) {
    typeEl.value = (vehicle === "motorrad" || vehicle === "wohnmobil" || vehicle === "bikepacking") ? vehicle : "alle";
  }

  const contEl = document.getElementById("routeContinentFilter");
  if (contEl) {
    contEl.value = region === "weltweit" ? "alle" : "Europa";
  }

  let matched = (DB.routes || []).filter(r => {
    if (vehicle && vehicle !== "alle" && r.type !== vehicle) return false;
    if (region === "alpen") {
      const txt = (r.name + " " + (r.description || '') + " " + ((r.countries || []).join(" "))).toLowerCase();
      if (!txt.includes("alpen") && !txt.includes("dolomit") && !txt.includes("österreich") && !txt.includes("schweiz") && !txt.includes("italien") && !txt.includes("pass")) return false;
    } else if (region === "pyrenaeen") {
      const txt = (r.name + " " + (r.description || '') + " " + ((r.countries || []).join(" "))).toLowerCase();
      if (!txt.includes("pyrenäen") && !txt.includes("spanien") && !txt.includes("frankreich")) return false;
    } else if (region === "skandinavien") {
      const txt = (r.name + " " + (r.description || '') + " " + ((r.countries || []).join(" "))).toLowerCase();
      if (!txt.includes("norwegen") && !txt.includes("schweden") && !txt.includes("finnland") && !txt.includes("skandinavien")) return false;
    }
    if (duration === "weekend") {
      const txt = (r.duration || "").toLowerCase();
      const kmMatch = (r.distance || "").match(/\d+/);
      const km = kmMatch ? parseInt(kmMatch[0]) : 500;
      if (!txt.includes("tag") && !txt.includes("wochenende") && km > 800) return false;
    }
    return true;
  });

  if (matched.length === 0) {
    matched = (DB.routes || []).filter(r => vehicle === "alle" || r.type === vehicle);
  }

  renderRoutes(matched);
  const grid = document.getElementById("routeGrid");
  if (grid) {
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function buildPassCard(p, compact = false) {
  const countries = withFlag(p.country);
  const surface = SURFACE_LABELS[p.surface] || p.surface;
  const camperBadge = p.camper ? `
    <span class="camper-status-badge ${p.camper.status || ''}" title="${escapeHtml(p.camper.advice || '')}">
      ${escapeHtml(p.camper.label || '')}
    </span>` : '';

  const tr = getPassTracker();
  const isConq = tr.conquered.includes(p.id);
  const isBkt = tr.bucket.includes(p.id);

  return `
  <div class="pass-card" onclick="openPassModal('${p.id}')" role="button" tabindex="0" aria-label="${escapeHtml(p.name)}">
    <div class="pass-card-header">
      <div class="pass-card-icon">${getPassIcon(p)}</div>
      <div class="pass-card-title">
        <h3>${escapeHtml(p.name)}</h3>
        <span class="pass-region">${countries}${p.region ? ` · ${escapeHtml(p.region)}` : ''}</span>
      </div>
      <div style="display:flex;align-items:center;gap:.4rem;margin-left:auto">
        <span class="pass-altitude">${p.altitude.toLocaleString("de")} m</span>
        ${starBtn("p:" + p.id, "Pass merken")}
      </div>
    </div>
    <div class="pass-levels" style="display:flex;gap:.35rem;align-items:center;flex-wrap:wrap">
      ${passLevelIcon(p)}<span class="pass-surface">${surface}</span>${camperBadge}
    </div>
    ${passSeasonBar(p)}
    ${passTags(p)}
    ${compact ? "" : `<p class="pass-description">${escapeHtml(p.description)}</p>`}
    <div class="pass-card-footer" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.4rem">
      <div class="pass-tracker-actions" style="margin-top:0">
        <button class="pass-tracker-btn ${isConq ? 'active-conquered' : ''}" onclick="togglePassConquered('${p.id}', event)" title="Als bezwungen markieren">
          ${isConq ? '✅ Bezwungen' : '✓ Bezwingen'}
        </button>
        <button class="pass-tracker-btn ${isBkt ? 'active-bucket' : ''}" onclick="togglePassBucket('${p.id}', event)" title="Auf die Bucket-List setzen">
          ${isBkt ? '⭐ Gemerkt' : '☆ Bucket-List'}
        </button>
      </div>
      <div style="display:flex;gap:.35rem">
        <button class="btn" onclick="event.stopPropagation();openPassModal('${p.id}')">📋 Details</button>
        <a class="btn" href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🗺️ Maps</a>
      </div>
    </div>
  </div>`;
}

function renderPasses() {
  const grid = document.getElementById("passGrid");
  const countEl = document.getElementById("passCount");
  if (!grid || !DB.passes) return;

  const cont = (document.getElementById("passContinentFilter") || {}).value || "alle";
  const lvl  = (document.getElementById("passLevelFilter") || {}).value || "alle";
  const surf = (document.getElementById("passSurfaceFilter") || {}).value || "alle";
  const mo   = (document.getElementById("passMonthFilter") || {}).value || "alle";
  const cmp  = (document.getElementById("passCamperFilter") || {}).value || "alle";
  const trk  = (document.getElementById("passTrackerFilter") || {}).value || "alle";
  const tr = getPassTracker();

  let passes = DB.passes.filter(p => {
    if (trk === "conquered" && !tr.conquered.includes(p.id)) return false;
    if (trk === "bucket" && !tr.bucket.includes(p.id)) return false;
    if (trk === "unconquered" && tr.conquered.includes(p.id)) return false;
    if (cont !== "alle" && p.continent !== cont) return false;
    if (lvl !== "alle" && p.levelAsphalt !== lvl && p.levelOffroad !== lvl) return false;
    if (surf !== "alle" && p.surface !== surf) return false;
    if (cmp !== "alle") {
      const cStatus = p.camper ? p.camper.status : (p.surface === "asphalt" ? "geeignet" : "nicht_geeignet");
      if (cStatus !== cmp) return false;
    }
    if (mo !== "alle") {
      const m = parseInt(mo);
      if (!p.yearRound) {
        const a = p.seasonOpen[0], b = p.seasonOpen[1];
        let openMonths = [];
        if (a <= b) { for (let i = a; i <= b; i++) openMonths.push(i); }
        else { for (let i = a; i <= 12; i++) openMonths.push(i); for (let i = 1; i <= b; i++) openMonths.push(i); }
        if (!openMonths.includes(m)) return false;
      }
    }
    if (passState.yearRoundOnly && !p.yearRound) return false;
    if (passState.noTollOnly && p.tollRoad) return false;
    return true;
  });

  // Sort by altitude desc
  passes.sort((a, b) => b.altitude - a.altitude);

  if (countEl) countEl.textContent = `${passes.length} Pässe gefunden`;
  
  if (passes.length === 0) {
    grid.innerHTML = `<p class="hint">Keine Pässe gefunden. Filter anpassen.</p>`;
    grid.className = "pass-grid";
    return;
  }

  // Group passes by Country, then by Region
  const grouped = {};
  passes.forEach(p => {
    let c = (p.country && p.country.length > 0) ? p.country[0] : "Unbekannt";
    let r = p.region || "Sonstige";
    if (!grouped[c]) grouped[c] = {};
    if (!grouped[c][r]) grouped[c][r] = [];
    grouped[c][r].push(p);
  });

  const countries = Object.keys(grouped).sort();
  let html = `<div class="pass-groups-container">`;

  countries.forEach(c => {
    // Determine Country ISO for Flag
    let cCode = Object.keys(COUNTRY_ISO).find(k => k.toLowerCase() === c.toLowerCase());
    let flagHtml = cCode ? getSingleFlagHtml(cCode, c) : "🏳️";
    let totalInCountry = Object.values(grouped[c]).reduce((sum, arr) => sum + arr.length, 0);

    html += `
      <details class="group-details country-group">
        <summary class="group-summary">
          <div class="group-summary-inner">
            <span class="group-title">${flagHtml} ${c}</span>
            <span class="badge">${totalInCountry} Pässe</span>
          </div>
        </summary>
        <div class="group-content">
    `;

    const regions = Object.keys(grouped[c]).sort();
    regions.forEach(r => {
      let regionPasses = grouped[c][r];
      html += `
        <details class="group-details region-group">
          <summary class="group-summary region-summary">
            <div class="group-summary-inner">
              <span class="group-title">📍 ${r}</span>
              <span class="badge" style="background:var(--border)">${regionPasses.length}</span>
            </div>
          </summary>
          <div class="pass-grid" style="padding: 1rem;">
            ${regionPasses.map(p => buildPassCard(p)).join("")}
          </div>
        </details>
      `;
    });

    html += `</div></details>`;
  });
  html += `</div>`;

  grid.innerHTML = html;
  grid.className = ""; // Remove pass-grid so accordions take full width
}

function togglePassYearRound() {
  passState.yearRoundOnly = !passState.yearRoundOnly;
  const b = document.getElementById("passYearRoundFilter");
  if (b) b.classList.toggle("active", passState.yearRoundOnly);
  renderPasses();
}

function togglePassNoToll() {
  passState.noTollOnly = !passState.noTollOnly;
  const b = document.getElementById("passNoTollFilter");
  if (b) b.classList.toggle("active", passState.noTollOnly);
  renderPasses();
}

function renderTopPasses() {
  const el = document.getElementById("topPasses");
  if (!el || !DB.passes) return;
  // Pick 4 iconic passes for the start page
  const featured = ["stilfser-joch","khardung-la","transfagarasan","beartooth-highway","sani-pass","trollstigen"];
  const passes = featured.map(id => DB.passes.find(p => p.id === id)).filter(Boolean).slice(0, 4);
  el.innerHTML = passes.map(p => buildPassCard(p, true)).join("");
}

function generatePassElevationSvg(altitude, lengthKm, gradient) {
  const valleyAlt = Math.max(200, Math.round(altitude * 0.45));
  const peakAlt = altitude;
  const safeId = String(altitude).replace(/\D/g, "") || "profile";
  return `
    <div class="pass-elevation-profile">
      <div class="pass-profile-header">
        <span>Tal ~${valleyAlt.toLocaleString("de")} m</span>
        <strong style="color:var(--accent);font-size:.92rem">▲ Passhöhe ${peakAlt.toLocaleString("de")} m ü. NN</strong>
        <span>Tal ~${Math.round(valleyAlt * 1.08).toLocaleString("de")} m</span>
      </div>
      <svg class="pass-profile-svg" viewBox="0 0 500 70" preserveAspectRatio="none">
        <defs>
          <linearGradient id="elevGrad-${safeId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <path d="M 0,65 Q 120,60 200,28 T 250,10 Q 300,28 380,60 T 500,65 L 500,70 L 0,70 Z" fill="url(#elevGrad-${safeId})"/>
        <path d="M 0,65 Q 120,60 200,28 T 250,10 Q 300,28 380,60 T 500,65" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="250" cy="10" r="5" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
      </svg>
      <div style="display:flex;justify-content:space-between;font-size:.74rem;color:var(--muted);margin-top:.4rem">
        <span>West-Anstieg: ca. ${gradient || 11}%</span>
        <span>Strecke: ~${lengthKm || 28} km</span>
        <span>Ost-Anstieg: ca. ${Math.max(6, (gradient || 11) - 2)}%</span>
      </div>
    </div>
  `;
}

function openPassModal(id) {
  const p = (DB.passes || []).find(x => x.id === id);
  if (!p) return;
  const surface = SURFACE_LABELS[p.surface] || p.surface;
  const open = p.yearRound ? "Ganzjährig" : `${MONTH_NAMES_SHORT[(p.seasonOpen[0]||1)-1]} – ${MONTH_NAMES_SHORT[(p.seasonOpen[1]||12)-1]}`;
  const highlightChips = (p.highlights || []).map(h => `<span class="pass-highlight-chip">✦ ${escapeHtml(h)}</span>`).join("");
  const vehicles = (p.vehicleTypes || []).map(v =>
    v === "motorrad" ? "🏍️ Motorrad" : v === "auto" ? "🚗 Auto" : v === "bikepacking" ? "🚵 Bikepacking" : v
  ).join(" · ");

  const tr = getPassTracker();
  const isConq = tr.conquered.includes(p.id);
  const isBkt = tr.bucket.includes(p.id);

  document.getElementById("modalBody").innerHTML = `
    <!-- Alpine Pass-Schild Header -->
    <div class="pass-shield-header">
      <div class="pass-shield-left">
        <span class="pass-shield-icon">${getPassIcon(p)}</span>
        <div>
          <h2 class="pass-shield-title">${escapeHtml(p.name)}</h2>
          <div class="pass-shield-sub">${withFlag(p.country)}${p.region ? ` · ${escapeHtml(p.region)}` : ''}</div>
        </div>
      </div>
      <div class="pass-altitude-badge">
        <span class="pass-altitude-val">${p.altitude.toLocaleString("de")} m</span>
        <span class="pass-altitude-lbl">ü. NN (Passhöhe)</span>
      </div>
    </div>

    <!-- 4 Key-Fact Kacheln -->
    <div class="pass-keyfacts-grid">
      <div class="pass-keyfact-card">
        <span class="pass-keyfact-icon">↩️</span>
        <span class="pass-keyfact-val">${p.hairpins || "–"}</span>
        <span class="pass-keyfact-lbl">Kehren</span>
      </div>
      <div class="pass-keyfact-card">
        <span class="pass-keyfact-icon">📐</span>
        <span class="pass-keyfact-val">${p.maxGradient ? p.maxGradient + '%' : "–"}</span>
        <span class="pass-keyfact-lbl">Max. Steigung</span>
      </div>
      <div class="pass-keyfact-card">
        <span class="pass-keyfact-icon">📏</span>
        <span class="pass-keyfact-val">${p.lengthKm ? p.lengthKm + ' km' : "–"}</span>
        <span class="pass-keyfact-lbl">Länge</span>
      </div>
      <div class="pass-keyfact-card">
        <span class="pass-keyfact-icon">🎯</span>
        <span class="pass-keyfact-val">${p.levelAsphalt || p.levelOffroad || "A3"}</span>
        <span class="pass-keyfact-lbl">Fahrer-Level</span>
      </div>
    </div>

    <!-- Stylized SVG Elevation Profile Gradient -->
    ${generatePassElevationSvg(p.altitude, p.lengthKm, p.maxGradient)}

    <!-- Level & Oberflächen Bar -->
    <div class="pass-levels" style="margin:.8rem 0 .5rem">${passLevelIcon(p)}<span class="pass-surface">${surface}</span></div>
    ${passSeasonBar(p)}

    <div class="pass-modal-grid">
      <div class="pass-modal-item"><label>GPS-Koordinaten</label><span>${p.lat}°N, ${p.lng}°E</span></div>
      <div class="pass-modal-item"><label>Saison-Öffnung</label><span>${open}</span></div>
      <div class="pass-modal-item"><label>Tagesöffnung</label><span>${p.dailyOpen || "24h geöffnet"}</span></div>
      <div class="pass-modal-item"><label>Erlaubte Fahrzeuge</label><span>${vehicles}</span></div>
    </div>

    ${p.camper ? `
    <div class="pass-camper-box" style="margin:1rem 0;padding:.85rem;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;flex-wrap:wrap;gap:.4rem">
        <strong style="font-size:.85rem;display:flex;align-items:center;gap:.35rem">🚐 Wohnmobil-Tauglichkeit &amp; Limits:</strong>
        <span class="camper-status-badge ${p.camper.status || ''}">${escapeHtml(p.camper.label)}</span>
      </div>
      <p style="margin:0 0 .4rem;font-size:.84rem;color:var(--text);line-height:1.45">${escapeHtml(p.camper.advice)}</p>
      <div style="font-size:.78rem;color:var(--muted);display:flex;gap:.6rem;flex-wrap:wrap">
        ${p.camper.maxWeightTonnes ? `<span>⚖️ Max. ${p.camper.maxWeightTonnes} t</span>` : ''}
        ${p.camper.maxVehicleLengthMeters ? `<span>📏 Max. Länge: ${p.camper.maxVehicleLengthMeters} m</span>` : ''}
        ${p.camper.maxHeightMeters ? `<span>📐 Max. Höhe: ${p.camper.maxHeightMeters} m</span>` : ''}
        ${p.camper.maxWidthMeters ? `<span>↔️ Max. Breite: ${p.camper.maxWidthMeters} m</span>` : ''}
        ${p.camper.caravanBanned ? `<span style="color:#ef4444">🚫 Wohnwagen verboten</span>` : ''}
      </div>
    </div>` : ''}

    ${passTags(p)}

    <p style="font-size:.9rem;color:var(--text-muted);line-height:1.6;margin:.8rem 0 .5rem">${escapeHtml(p.description)}</p>

    <div>
      <strong style="font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">✦ Highlights</strong>
      <div class="pass-highlights">${highlightChips}</div>
    </div>

    ${p.tips ? `<div class="pass-tips-box" style="margin-top:.8rem"><strong>💡 Tipps:</strong> ${escapeHtml(p.tips)}</div>` : ""}

    <!-- Sticky & Quick Action Buttons (incl. Kurviger 1-Click) -->
    <div class="pass-sticky-actions">
      <a class="btn btn-primary" href="https://kurviger.de/?point=${p.lat}%2C${p.lng}&point_name=${encodeURIComponent(p.name)}" target="_blank" rel="noopener" title="Pass-Kurven direkt auf Kurviger planen">
        🧭 In Kurviger öffnen
      </a>
      <a class="btn" href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">
        🗺️ Google Maps
      </a>
      <button class="btn pass-tracker-btn ${isConq ? 'active-conquered' : ''}" onclick="togglePassConquered('${p.id}'); openPassModal('${p.id}')">
        ${isConq ? '✅ Bezwungen' : '✓ Als bezwungen eintragen'}
      </button>
      <button class="btn pass-tracker-btn ${isBkt ? 'active-bucket' : ''}" onclick="togglePassBucket('${p.id}'); openPassModal('${p.id}')">
        ${isBkt ? '⭐ Auf Bucket-List' : '☆ Bucket-List'}
      </button>
      <a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(p.name + ' Motorrad Erfahrungsbericht')}" target="_blank" rel="noopener">
        🔍 Berichte
      </a>
      <button class="btn share-link-btn" onclick="copyShareLink('pass', '${escapeHtml(p.id)}')">
        🔗 Link teilen
      </button>
      <button class="btn secondary" onclick="reportIssue('pass', '${escapeHtml(p.name)}')">
        ⚠️ Sperrung melden
      </button>
      <button class="btn" onclick="closeModal()">
        ✕ Schließen
      </button>
    </div>
  `;
  setDeepLink("pass", p.id, p.name);
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Wire into showView
const _origShowView = window.showView;
window.showView = function(name) {
  _origShowView(name);
  if (name === "karte" && typeof map !== "undefined" && map) setTimeout(() => map.invalidateSize(), 80);
  if (name === "paesse") setTimeout(renderPasses, 40);
  if (name === "finder") setTimeout(renderFinder, 40);
};

/* ============================================================
   INTELLIGENTER ROUTEN-FINDER WIZARD & MATCHING ENGINE (PRO)
   ============================================================ */

const finderState = {
  step: 1,
  startRegion: "dach",
  city: "",
  startTime: "full",    // full (Ganztag), late (Feierabend ab 14-16 Uhr)
  vehicle: "motorrad",  // motorrad, wohnmobil, bikepacking
  level: "mittel",      // einsteiger, mittel, erfahren, experte
  pace: "standard",     // gemuetlich, standard, sportlich
  autobahnPref: "max_2h", // no_highway, max_2h, any
  month: 7,             // 1-12 or "alle"
  duration: "week",     // weekend, week, two_weeks, month
  tourType: "alle",     // alle, rundreise, strecke
  accommodation: "alle", // alle, womo_camping, zelt_wildcamp, hotel
  styleTags: new Set(["attraktionen", "paesse", "kurven", "natur", "seen_kueste"]),
  noGos: new Set(),     // no_tight_passes, no_offroad, no_ferry, no_toll, no_extreme_altitude
  filterSeasonOkOnly: true,
  sortOrder: "score",
  calculatedRoutes: [],
  calculatedPasses: []
};

const VEHICLE_LABELS = {
  motorrad: "🏍️ Motorrad (250–350 km/Tag)",
  wohnmobil: "🚐 Wohnmobil / Camper (140–200 km/Tag)",
  bikepacking: "🚵 Bikepacking / Fahrrad (50–85 km/Tag)"
};

const ACCOM_LABELS = {
  alle: "🔀 Flexibel / Alle Unterkünfte",
  womo_camping: "🚐 Camping- & WoMo-Stellplätze",
  zelt_wildcamp: "⛺ Zelt & Wildcamping (Outdoor)",
  hotel: "🏨 Hotel, Pension & B&B"
};

const REGION_COUNTRY_MAP = {
  dach: ["Deutschland", "Österreich", "Schweiz", "Italien", "Frankreich", "Slowenien", "Liechtenstein"],
  suedeuropa: ["Italien", "Frankreich", "Spanien", "Portugal", "Andorra", "Monaco", "Griechenland", "Kroatien"],
  skandinavien: ["Norwegen", "Schweden", "Finnland", "Dänemark", "Island"],
  balkan: ["Kroatien", "Slowenien", "Bosnien", "Montenegro", "Albanien", "Griechenland", "Rumänien", "Bulgarien", "Nordmazedonien", "Serbien"],
  uk: ["Großbritannien", "Schottland", "Irland", "Wales", "England", "Nordirland", "UK"],
  weltweit: [] // matches all
};

const REGION_LABELS = {
  dach: "DACH-Raum (DE / AT / CH & Alpen)",
  suedeuropa: "Süd- & Westeuropa (IT / FR / ES / PT)",
  skandinavien: "Nordeuropa (NO / SE / FI / DK)",
  balkan: "Balkan & Osteuropa (HR / SI / RO / GR)",
  uk: "UK & Irland (Schottland / Irland)",
  weltweit: "Weltweit / Flugziel (Himalaya / Pamir / Afrika / Anden / USA / NZ)"
};

const LEVEL_LABELS = {
  einsteiger: "🟢 Einsteiger (Asphalt A1–A2, sanfte Steigungen, kein loser Schotter)",
  mittel: "🔵 Fortgeschritten (A2–A3, O1, normale Alpenpässe, guter Flow)",
  erfahren: "🟡 Erfahren (A3–A4, O2–O3, enge Hochalpenpässe & Schotteretappen)",
  experte: "🔴 Experte / Adventure (A4–A5, O3–O5, Hochgebirge, Tiefschotter & Expedition)"
};

const PACE_LABELS = {
  gemuetlich: "🟢 Gemütlich (150–220 km/Tag, viele Pausen & Kultur)",
  standard: "🔵 Ausgewogen (250–350 km/Tag, zügiges Touren mit Flow)",
  sportlich: "🔴 Kilometerfresser (400+ km/Tag, maximale Fahrzeit)"
};

const DURATION_LABELS = {
  weekend: "⚡ Kurztrip / Wochenende (2–4 Tage)",
  week: "🗓️ 1 Woche (5–8 Tage)",
  two_weeks: "🗓️🗓️ 2 Wochen (9–16 Tage)",
  month: "3+ Wochen / Fernreise (17–40+ Tage)"
};

const TOUR_TYPE_LABELS = {
  alle: "🔀 Alle Tourformen (Rundreisen & Strecken)",
  rundreise: "🔄 Nur Rundreisen (Start = Ziel)",
  strecke: "➡️ Nur Streckentouren (A nach B)"
};

const STYLE_TAG_LABELS = {
  attraktionen: "🌋 Natursensationen ansteuern",
  paesse: "⛰️ Alpen & Hochgebirgspässe",
  pass_garantie: "🏔️ Pass-Garantie (Mind. 1 Pass/Tag)",
  kurven: "🛣️ Kurvenrausch & Serpentinen",
  offroad: "🪨 Schotter, Pisten & TET",
  natur: "🌲 Wilde Natur & Wälder",
  seen_kueste: "🌊 Seen, Fjorde, Küste & Flüsse",
  kultur: "🏛️ Kultur, Dörfer & Kulinarik"
};

const NO_GO_LABELS = {
  no_tight_passes: "🚫 Keine WoMo-Engpässe (Camper-tauglich)",
  no_offroad: "⛔ 0 % Offroad (Reiner Asphalt)",
  no_ferry: "🚢 Keine Fähren nötig",
  no_toll: "💶 Keine Maut / Vignetten",
  no_extreme_altitude: "🏔️ Keine Pässe über 2.500 m"
};

function renderFinder() {
  updateFinderStepUI();
  renderFinderProfileSummary();
  updateLiveCounter();
}


function updatePaceAndDurationForVehicle(vehicle) {
  const paceGrid = document.getElementById("finderPaceGrid");
  const advice = document.getElementById("womoPaceAdvice");
  const durGrid = document.getElementById("finderDurationGrid");

  if (paceGrid) {
    if (vehicle === "wohnmobil") {
      paceGrid.innerHTML = `
        <div class="finder-choice-card ${finderState.pace === 'gemuetlich' ? 'active' : ''}" data-pace="gemuetlich" onclick="selectPace('gemuetlich', this)">
          <div class="choice-title">🟢 Bummel- &amp; Genussmodus</div>
          <div class="choice-desc">100–140 km/Tag · ca. 2,5 h Fahrzeit · Viel Zeit für Kochen, Natur, Wandern &amp; frühe Platzwahl</div>
        </div>
        <div class="finder-choice-card ${finderState.pace === 'standard' ? 'active' : ''}" data-pace="standard" onclick="selectPace('standard', this)">
          <div class="choice-title">🔵 WoMo-Sweetspot (Empfohlen)</div>
          <div class="choice-desc">150–190 km/Tag · ca. 3–3,5 h Fahrzeit · Täglich neue Highlights &amp; Ankunft vor 17:00 Uhr</div>
        </div>
        <div class="finder-choice-card ${finderState.pace === 'sportlich' ? 'active' : ''}" data-pace="sportlich" onclick="selectPace('sportlich', this)">
          <div class="choice-title">🔴 Sportlicher Roadtrip</div>
          <div class="choice-desc">220–280 km/Tag · 4–5+ h Fahrzeit · Flotte Kilometeretappen, vorrangig 1 Nacht pro Stellplatz</div>
        </div>
      `;
      if (advice) advice.style.display = "block";
    } else if (vehicle === "bikepacking") {
      paceGrid.innerHTML = `
        <div class="finder-choice-card ${finderState.pace === 'gemuetlich' ? 'active' : ''}" data-pace="gemuetlich" onclick="selectPace('gemuetlich', this)">
          <div class="choice-title">🟢 Gemütlicher Radurlaub</div>
          <div class="choice-desc">45–60 km/Tag · ca. 3–4 h Kurbeln · Genussvoll mit Packtaschen &amp; vielen Badepausen</div>
        </div>
        <div class="finder-choice-card ${finderState.pace === 'standard' ? 'active' : ''}" data-pace="standard" onclick="selectPace('standard', this)">
          <div class="choice-title">🔵 Klassisches Bikepacking</div>
          <div class="choice-desc">60–85 km/Tag · ca. 4–5,5 h Kurbeln · Schotter- &amp; Passetappen mit sportlichem Rhythmus</div>
        </div>
        <div class="finder-choice-card ${finderState.pace === 'sportlich' ? 'active' : ''}" data-pace="sportlich" onclick="selectPace('sportlich', this)">
          <div class="choice-title">🔴 Gravel Ultra / Sportiv</div>
          <div class="choice-desc">90–120+ km/Tag · Ganztägiges Fahren von Sonnenauf- bis -untergang</div>
        </div>
      `;
      if (advice) advice.style.display = "none";
    } else {
      paceGrid.innerHTML = `
        <div class="finder-choice-card ${finderState.pace === 'gemuetlich' ? 'active' : ''}" data-pace="gemuetlich" onclick="selectPace('gemuetlich', this)">
          <div class="choice-title">🟢 Gemütlich</div>
          <div class="choice-desc">150–220 km/Tag · Viele Fotostopps, Café-Pausen &amp; Zeit für Kultur</div>
        </div>
        <div class="finder-choice-card ${finderState.pace === 'standard' ? 'active' : ''}" data-pace="standard" onclick="selectPace('standard', this)">
          <div class="choice-title">🔵 Ausgewogen</div>
          <div class="choice-desc">250–350 km/Tag · Flottes Touren mit sportlichem Flow</div>
        </div>
        <div class="finder-choice-card ${finderState.pace === 'sportlich' ? 'active' : ''}" data-pace="sportlich" onclick="selectPace('sportlich', this)">
          <div class="choice-title">🔴 Kilometerfresser</div>
          <div class="choice-desc">400+ km/Tag · Früher Start, spätes Ankommen, reine Fahrzeit</div>
        </div>
      `;
      if (advice) advice.style.display = "none";
    }
  }

  if (durGrid) {
    if (vehicle === "wohnmobil") {
      durGrid.innerHTML = `
        <div class="finder-choice-card ${finderState.duration === 'weekend' ? 'active' : ''}" data-duration="weekend" onclick="selectDuration('weekend', this)">
          <div class="choice-icon">⚡</div>
          <div class="choice-title">Kurztrip / Wochenende</div>
          <div class="choice-desc">2–4 Tage · ca. 300–600 km (1–2 Stehtage)</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'week' ? 'active' : ''}" data-duration="week" onclick="selectDuration('week', this)">
          <div class="choice-icon">🗓️</div>
          <div class="choice-title">1 Woche</div>
          <div class="choice-desc">5–8 Tage · ca. 800–1.400 km (2–3 Stehtage)</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'two_weeks' ? 'active' : ''}" data-duration="two_weeks" onclick="selectDuration('two_weeks', this)">
          <div class="choice-icon">🗓️🗓️</div>
          <div class="choice-title">2 Wochen</div>
          <div class="choice-desc">9–16 Tage · ca. 1.600–2.600 km (4–5 Stehtage)</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'month' ? 'active' : ''}" data-duration="month" onclick="selectDuration('month', this)">
          <div class="choice-icon">🌍</div>
          <div class="choice-title">3+ Wochen / Fernreise</div>
          <div class="choice-desc">17–40+ Tage · ca. 3.500–7.000 km (Expedition &amp; Elternzeit)</div>
        </div>
      `;
    } else if (vehicle === "bikepacking") {
      durGrid.innerHTML = `
        <div class="finder-choice-card ${finderState.duration === 'weekend' ? 'active' : ''}" data-duration="weekend" onclick="selectDuration('weekend', this)">
          <div class="choice-icon">⚡</div>
          <div class="choice-title">Kurztrip / Wochenende</div>
          <div class="choice-desc">2–4 Tage · ca. 120–250 km</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'week' ? 'active' : ''}" data-duration="week" onclick="selectDuration('week', this)">
          <div class="choice-icon">🗓️</div>
          <div class="choice-title">1 Woche</div>
          <div class="choice-desc">5–8 Tage · ca. 350–550 km</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'two_weeks' ? 'active' : ''}" data-duration="two_weeks" onclick="selectDuration('two_weeks', this)">
          <div class="choice-icon">🗓️🗓️</div>
          <div class="choice-title">2 Wochen</div>
          <div class="choice-desc">9–16 Tage · ca. 600–1.100 km</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'month' ? 'active' : ''}" data-duration="month" onclick="selectDuration('month', this)">
          <div class="choice-icon">🌍</div>
          <div class="choice-title">3+ Wochen / Fernreise</div>
          <div class="choice-desc">17–40+ Tage · ca. 1.200–2.500+ km</div>
        </div>
      `;
    } else {
      durGrid.innerHTML = `
        <div class="finder-choice-card ${finderState.duration === 'weekend' ? 'active' : ''}" data-duration="weekend" onclick="selectDuration('weekend', this)">
          <div class="choice-icon">⚡</div>
          <div class="choice-title">Kurztrip / Wochenende</div>
          <div class="choice-desc">2–4 Tage · ca. 500–1.200 km</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'week' ? 'active' : ''}" data-duration="week" onclick="selectDuration('week', this)">
          <div class="choice-icon">🗓️</div>
          <div class="choice-title">1 Woche</div>
          <div class="choice-desc">5–8 Tage · ca. 1.000–2.500 km</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'two_weeks' ? 'active' : ''}" data-duration="two_weeks" onclick="selectDuration('two_weeks', this)">
          <div class="choice-icon">🗓️🗓️</div>
          <div class="choice-title">2 Wochen</div>
          <div class="choice-desc">9–16 Tage · ca. 2.000–5.000 km</div>
        </div>
        <div class="finder-choice-card ${finderState.duration === 'month' ? 'active' : ''}" data-duration="month" onclick="selectDuration('month', this)">
          <div class="choice-icon">🌍</div>
          <div class="choice-title">3+ Wochen / Fernreise</div>
          <div class="choice-desc">17–40+ Tage · Große Transkontinental-Tour</div>
        </div>
      `;
    }
  }
}

function selectVehicle(vKey, element) {
  finderState.vehicle = vKey;
  document.querySelectorAll("#finderVehicleGrid .finder-choice-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  updatePaceAndDurationForVehicle(vKey);
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectAccommodation(accKey, element) {
  finderState.accommodation = accKey;
  document.querySelectorAll("#finderAccomGrid .style-tag-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectStartRegion(regionKey, element) {
  finderState.startRegion = regionKey;
  document.querySelectorAll("#finderStartGrid .finder-choice-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function onCityInputChanged(val) {
  finderState.city = (val || "").trim();
  document.querySelectorAll(".quick-city-btn").forEach(b => {
    b.classList.toggle("active", b.textContent.trim().toLowerCase() === finderState.city.toLowerCase());
  });
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectQuickCity(cityName) {
  finderState.city = cityName;
  const input = document.getElementById("finderCityInput");
  if (input) input.value = cityName;

  document.querySelectorAll(".quick-city-btn").forEach(b => {
    b.classList.toggle("active", b.textContent.trim().toLowerCase() === cityName.toLowerCase());
  });

  // Auto-set region
  const dachCities = ["München", "Stuttgart", "Frankfurt", "Köln", "Hamburg", "Berlin", "Wien", "Innsbruck", "Zürich"];
  if (dachCities.includes(cityName)) {
    finderState.startRegion = "dach";
    document.querySelectorAll("#finderStartGrid .finder-choice-card").forEach(c => {
      c.classList.toggle("active", c.dataset.region === "dach");
    });
  }

  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectLevel(levelKey, element) {
  finderState.level = levelKey;
  document.querySelectorAll("#finderLevelGrid .finder-choice-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectPace(paceKey, element) {
  finderState.pace = paceKey;
  const container = element ? element.parentElement : null;
  if (container) {
    container.querySelectorAll(".finder-choice-card").forEach(c => c.classList.remove("active"));
  }
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectMonth(m, element) {
  finderState.month = m === "alle" ? "alle" : parseInt(m, 10);
  document.querySelectorAll("#finderMonthPills .month-pill").forEach(p => p.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectDuration(durKey, element) {
  finderState.duration = durKey;
  document.querySelectorAll("#finderDurationGrid .finder-choice-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectTourType(typeKey, element) {
  finderState.tourType = typeKey;
  document.querySelectorAll("#finderTourTypeGrid .style-tag-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function toggleStyleTag(tagKey, element) {
  if (finderState.styleTags.has(tagKey)) {
    finderState.styleTags.delete(tagKey);
    if (element) element.classList.remove("active");
  } else {
    finderState.styleTags.add(tagKey);
    if (element) element.classList.add("active");
  }
  renderFinderProfileSummary();
  updateLiveCounter();
}

function toggleNoGo(noGoKey, element) {
  if (finderState.noGos.has(noGoKey)) {
    finderState.noGos.delete(noGoKey);
    if (element) element.classList.remove("active");
  } else {
    finderState.noGos.add(noGoKey);
    if (element) element.classList.add("active");
  }
  renderFinderProfileSummary();
  updateLiveCounter();
}

function jumpFinderStep(stepNum) {
  if (stepNum < 1 || stepNum > 5) return;
  finderState.step = stepNum;
  updateFinderStepUI();
  if (stepNum === 5) renderFinderProfileSummary();
  updateLiveCounter();
}

function nextFinderStep(targetStep) {
  jumpFinderStep(targetStep);
}

function prevFinderStep(targetStep) {
  jumpFinderStep(targetStep);
}

function updateFinderStepUI() {
  const step = finderState.step;
  const progressPercent = Math.min(100, Math.round((step / 5) * 100));
  const bar = document.getElementById("finderProgressBar");
  if (bar) bar.style.width = progressPercent + "%";

  for (let i = 1; i <= 5; i++) {
    const tab = document.getElementById("tabStep" + i);
    const panel = document.getElementById("stepPanel" + i);
    if (tab) {
      tab.classList.toggle("active", i === step);
      tab.classList.toggle("completed", i < step);
    }
    if (panel) {
      panel.classList.toggle("active", i === step);
    }
  }

  const box = document.getElementById("finderWizardBox");
  if (box && window.scrollY > box.offsetTop + 100) {
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateLiveCounter() {
  if (!DB.routes || !DB.routes.length) return;

  const validRoutes = DB.routes.filter(r => {
    const scored = scoreRoute(r, finderState);
    if (scored.isNoGoExcluded) return false;
    return scored.score >= 55;
  });

  const validPasses = matchPasses(finderState);

  const routeCountEl = document.getElementById("liveRouteCount");
  const passCountEl = document.getElementById("livePassCount");
  const hintEl = document.getElementById("livePreviewHint");

  if (routeCountEl) routeCountEl.textContent = validRoutes.length;
  if (passCountEl) passCountEl.textContent = validPasses.length;

  if (hintEl) {
    if (finderState.month !== "alle") {
      const mName = MONATE[finderState.month - 1];
      hintEl.textContent = `Berechnet für ${mName} · ${validRoutes.length} Touren & ${validPasses.length} Pässe mit Top-Bedingungen`;
    } else {
      hintEl.textContent = `${validRoutes.length} Touren & ${validPasses.length} Pässe passen zu deinen Kriterien`;
    }
  }
}

function renderFinderProfileSummary() {
  const container = document.getElementById("finderProfileSummary");
  if (!container) return;

  const regionLabel = REGION_LABELS[finderState.startRegion] || finderState.startRegion;
  const citySuffix = finderState.city ? ` (${escapeHtml(finderState.city)})` : "";
  const levelLabel = LEVEL_LABELS[finderState.level] || finderState.level;
  const paceLabel = PACE_LABELS[finderState.pace] || finderState.pace;
  const durationLabel = DURATION_LABELS[finderState.duration] || finderState.duration;
  const monthLabel = finderState.month === "alle" ? "🟢 Beliebig / Ganzjährig" : `📅 ${MONATE[finderState.month - 1]}`;

  const tagsChips = Array.from(finderState.styleTags)
    .map(tag => `<span class="summary-tag-chip">${STYLE_TAG_LABELS[tag] || tag}</span>`)
    .join("");

  const noGoChips = Array.from(finderState.noGos)
    .map(ng => `<span class="summary-tag-chip" style="background:rgba(230,57,70,0.2);color:#fca5a5">${NO_GO_LABELS[ng] || ng}</span>`)
    .join("");

  const tourTypeLabel = TOUR_TYPE_LABELS[finderState.tourType] || TOUR_TYPE_LABELS.alle;

  container.innerHTML = `
    <div class="finder-summary-grid">
      <div class="summary-item">
        <label>📍 Startregion & Ort</label>
        <span>${regionLabel}${citySuffix}</span>
      </div>
      <div class="summary-item">
        <label>🚗 Fahrzeug & Reiseform</label>
        <span>${VEHICLE_LABELS[finderState.vehicle] || finderState.vehicle}</span>
      </div>
      <div class="summary-item">
        <label>🏕️ Übernachtung & Schlafstil</label>
        <span>${ACCOM_LABELS[finderState.accommodation] || finderState.accommodation}</span>
      </div>
      <div class="summary-item">
        <label>🏍️ Können & Tagespensum</label>
        <span>${levelLabel}<br><small style="color:var(--muted)">${paceLabel}</small></span>
      </div>
      <div class="summary-item">
        <label>📅 Zeitraum & Dauer</label>
        <span>${monthLabel} · ${durationLabel}</span>
      </div>
      <div class="summary-item">
        <label>🔄 Tour-Charakter</label>
        <span>${tourTypeLabel}</span>
      </div>
      <div class="summary-item" style="grid-column: 1 / -1">
        <label>🎯 Gewählte Highlights</label>
        <div class="summary-tags-list">${tagsChips || "<span style='color:var(--muted)'>Keine speziellen Highlights gewählt (alle Typen)</span>"}</div>
      </div>
      ${finderState.noGos.size > 0 ? `
      <div class="summary-item" style="grid-column: 1 / -1">
        <label style="color:#f87171">🚫 Aktive Ausschluss-Kriterien (No-Gos)</label>
        <div class="summary-tags-list">${noGoChips}</div>
      </div>
      ` : ""}
    </div>
  `;
}

/* ---------- Matching Engine mit transparentem Score-Breakdown ---------- */

function parseRouteDays(str) {
  if (!str) return { min: 7, max: 7 };
  const s = str.toLowerCase();
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return { min: 7, max: 7 };

  let mult = 1;
  if (s.includes("woche") || s.includes("wochen")) mult = 7;
  else if (s.includes("monat") || s.includes("monate")) mult = 30;

  if (nums.length === 1) {
    const v = nums[0] * mult;
    return { min: v, max: v };
  }
  return { min: Math.min(nums[0], nums[1]) * mult, max: Math.max(nums[0], nums[1]) * mult };
}

function scoreRoute(route, criteria) {
  let score = 20; // Base score
  const reasons = [];
  let seasonWarning = null;
  let isNoGoExcluded = false;
  let vehicleBadge = "";
  let campingBadge = "";
  let attractionBadge = "";

  const descFull = ((route.name || "") + " " + (route.description || "") + " " + (route.kategorie || "") + " " + withFlag(route.countries)).toLowerCase();
  const diff = (route.difficulty || "mittel").toLowerCase();

  // 0. NO-GOS FILTER
  if (criteria.noGos.has("no_tight_passes")) {
    const passes = route.passes || [];
    const hasTightPass = passes.some(pName => {
      const passObj = (DB.passes || []).find(p => (p.name && p.name.toLowerCase() === pName.toLowerCase()) || p.id === pName);
      return passObj && passObj.camper && passObj.camper.status === "nicht_geeignet";
    });
    if (hasTightPass) {
      isNoGoExcluded = true;
      score -= 50;
      reasons.push({ text: "🚫 Ausschluss: Enthält für WoMos gesperrte/ungeeignete Pässe", type: "warning" });
    }
  }
  if (criteria.noGos.has("no_offroad")) {
    const isOffroad = /schotter|piste|tet|unbefestigt|offroad|gravel/i.test(descFull) || (diff === "schwer" && !/asphalt/i.test(descFull));
    if (isOffroad) {
      isNoGoExcluded = true;
      score -= 50;
    }
  }
  if (criteria.noGos.has("no_ferry")) {
    const hasFerry = /fähre|ferry/i.test(descFull);
    if (hasFerry) {
      isNoGoExcluded = true;
      score -= 40;
    }
  }
  if (criteria.noGos.has("no_toll")) {
    const hasToll = /maut|vignette|toll/i.test(descFull);
    if (hasToll) {
      score -= 25;
    }
  }
  if (criteria.noGos.has("no_extreme_altitude")) {
    const elev = parseInt(route.elevation || "0", 10);
    if (elev > 2500) {
      isNoGoExcluded = true;
      score -= 45;
    }
  }

  // 1. REGION FIT (0–25 Pkt)
  let regionScore = 0;
  const allowedCountries = REGION_COUNTRY_MAP[criteria.startRegion] || [];
  const routeCountries = route.countries || [];

  if (criteria.startRegion === "weltweit") {
    regionScore = 20;
    reasons.push({ text: "✓ Perfekt als weltweites Reiseziel", type: "positive" });
  } else {
    const directHit = routeCountries.some(c => allowedCountries.some(ac => ac.toLowerCase() === c.toLowerCase()));
    if (directHit) {
      regionScore = 25;
      reasons.push({ text: `✓ Kurze Anreise aus deiner Startregion (${routeCountries.join(", ")})`, type: "positive" });
    } else {
      const isEurope = route.continent === "Europa" || /alpen|pyrenäen|balkan|schwarzwald|dolomiten|frankreich|italien|spanien/i.test(descFull);
      if (isEurope && criteria.startRegion !== "skandinavien") {
        regionScore = 15;
        reasons.push({ text: "✓ Tolle Anfahrtstour über europäische Hauptstrecken", type: "positive" });
      } else {
        regionScore = 6;
        reasons.push({ text: "✈️ Flugreise / Transport empfohlen", type: "warning" });
      }
    }
  }

  // 2. FAHRZEUG-, LEVEL- & TEMPO-FIT (0–25 Pkt)
  let levelScore = 0;

  // Vehicle specific scoring
  if (criteria.vehicle === "bikepacking") {
    if (route.type === "bikepacking") {
      score += 25;
      levelScore += 20;
      vehicleBadge = `<span class="rec-card-badge" style="background:#06d6a0;color:#052e16;font-weight:700">🚵 Bikepacking-Strecke</span>`;
      reasons.push({ text: "✓ Echtes Bikepacking-Profil: Reiserad, Gravel & autofreie Naturwege", type: "positive" });
    } else {
      score -= 30;
      reasons.push({ text: "⚠️ Vorrangig für motorisierte Fahrzeuge konzipiert", type: "warning" });
    }
  } else if (criteria.vehicle === "wohnmobil") {
    if (route.type === "bikepacking") {
      isNoGoExcluded = true;
      score -= 50;
      reasons.push({ text: "🚫 Ausschluss: Reine Bikepacking-/Fahrradstrecke", type: "warning" });
    } else {
      const passes = route.passes || [];
      const tightPass = passes.find(pName => {
        const passObj = (DB.passes || []).find(p => (p.name && p.name.toLowerCase() === pName.toLowerCase()) || p.id === pName);
        return passObj && passObj.camper && passObj.camper.status === "nicht_geeignet";
      });
      if (tightPass) {
        score -= 30;
        reasons.push({ text: `⚠️ WoMo-Vorsicht: Engstelle/Limit am Pass ${tightPass}`, type: "warning" });
      } else {
        score += 15;
        levelScore += 10;
        vehicleBadge = `<span class="rec-card-badge" style="background:#3b82f6;color:#fff;font-weight:700">🚐 WoMo-tauglich</span>`;
        reasons.push({ text: "✓ WoMo-geprüft: Keine unpassierbaren Engstellen & breite Straßen", type: "positive" });
      }
    }
  } else {
    if (route.type === "motorrad") levelScore += 10;
  }

  if (criteria.level === "einsteiger") {
    if (diff === "leicht") {
      levelScore += 15;
      reasons.push({ text: "✓ Perfekt für Einsteiger (breite Straßen, sanfte Kurven)", type: "positive" });
    } else if (diff === "mittel") {
      levelScore += 8;
    } else {
      levelScore -= 10;
      reasons.push({ text: "⚠️ Sehr anspruchsvoll für Einsteiger", type: "warning" });
    }
  } else if (criteria.level === "mittel") {
    if (diff === "mittel") {
      levelScore += 15;
      reasons.push({ text: "✓ Exakt dein Anforderungsniveau (Fortgeschritten)", type: "positive" });
    } else if (diff === "leicht") {
      levelScore += 10;
    } else {
      levelScore += 5;
    }
  } else if (criteria.level === "erfahren") {
    if (diff === "schwer") {
      levelScore += 15;
      reasons.push({ text: "✓ Herrliche fahrtechnische Herausforderung", type: "positive" });
    } else {
      levelScore += 12;
    }
  } else if (criteria.level === "experte") {
    if (diff === "schwer") {
      levelScore += 15;
      reasons.push({ text: "✓ Maximales Abenteuer & technischer Anspruch", type: "positive" });
    } else {
      levelScore += 8;
    }
  }
  levelScore = Math.max(0, Math.min(25, levelScore));

  // 3. DURATION & REALISM FIT (0–15 Pkt)
  const routeDistKm = parseInt((route.distance || "1000").replace(/\D/g, ""), 10) || 1000;
  let availDays = 7;
  if (criteria.duration === "weekend") availDays = 3;
  else if (criteria.duration === "week") availDays = 7;
  else if (criteria.duration === "two_weeks") availDays = 14;
  else if (criteria.duration === "month") availDays = 28;

  let dailyPaceKm = 240;
  if (criteria.vehicle === "bikepacking") {
    dailyPaceKm = criteria.pace === "gemuetlich" ? 50 : criteria.pace === "sportlich" ? 85 : 65;
  } else if (criteria.vehicle === "wohnmobil") {
    dailyPaceKm = criteria.pace === "gemuetlich" ? 140 : criteria.pace === "sportlich" ? 220 : 180;
  } else {
    dailyPaceKm = criteria.pace === "gemuetlich" ? 200 : criteria.pace === "sportlich" ? 380 : 280;
  }

  const realisticTourDays = Math.max(1, Math.round(routeDistKm / dailyPaceKm));

  // Transit calculation
  const riderStart = getRiderStart();
  let routeStartCoords = (route.pois && route.pois.length) ? [route.pois[0].lat, route.pois[0].lng] : (window.DB && window.DB.routeGeo && window.DB.routeGeo[route.id]);
  const transitEst = routeStartCoords ? estimateTransit(riderStart.coords, routeStartCoords) : { km: 0 };
  const transitKm = transitEst.km || 0;
  const transitDays = criteria.vehicle === "bikepacking" ? 1 : Math.ceil(transitKm / 500);
  const totalTripDays = realisticTourDays + (criteria.startRegion === "weltweit" ? 0 : (transitDays * (route.isRoundTrip ? 1 : 2)));

  let durationScore = 0;
  if (totalTripDays > availDays * 1.5) {
    durationScore = 0;
    score -= 25;
    reasons.push({ text: `⚠️ Zeitlich straff: Mind. ~${totalTripDays} Tage nötig (Zeitbudget: ~${availDays} Tage)`, type: "warning" });
  } else if (totalTripDays <= availDays && totalTripDays >= Math.round(availDays * 0.5)) {
    durationScore = 15;
    reasons.push({ text: `✓ Perfekt machbar in ${availDays} Tagen (~${Math.round(routeDistKm / realisticTourDays)} km/Fahrtag)`, type: "positive" });
  } else if (totalTripDays < Math.round(availDays * 0.5)) {
    durationScore = 11;
    reasons.push({ text: `✓ Sehr entspannt machbar (~${realisticTourDays} Fahrtage) mit viel Puffer`, type: "positive" });
  } else {
    durationScore = 6;
    reasons.push({ text: `⚡ Zeitlich etwas knapp (~${totalTripDays} Tage empfohlen)`, type: "warning" });
  }

  // 4. SEASON FIT (0–25 Pkt)
  let seasonScore = 0;
  if (criteria.month === "alle") {
    seasonScore = 20;
  } else {
    const routeMonths = route._months && route._months.length ? route._months : parseSeason(route.season || "");
    const userMonth = criteria.month;

    if (routeMonths.includes(userMonth)) {
      seasonScore = 25;
      reasons.push({ text: `✓ Optimale Reisezeit im ${MONATE[userMonth - 1]} (${route.season || "Saison"})`, type: "positive" });
    } else {
      const prevMo = userMonth === 1 ? 12 : userMonth - 1;
      const nextMo = userMonth === 12 ? 1 : userMonth + 1;
      if (routeMonths.includes(prevMo) || routeMonths.includes(nextMo)) {
        seasonScore = 10;
        reasons.push({ text: `⚡ Rand-Saison im ${MONATE[userMonth - 1]} (Wetter beobachten)`, type: "warning" });
      } else {
        seasonScore = 0;
        seasonWarning = `⚠️ Im ${MONATE[userMonth - 1]} nicht empfohlen! Hauptreisezeit: ${route.season || "Sommermonate"}`;
        reasons.push({ text: `⚠️ Außerhalb der Saison (empfohlen: ${route.season || "Sommer"})`, type: "warning" });
      }
    }
  }

  // 5. STYLE, HIGHLIGHTS & ACCOMMODATION FIT (0–10 Pkt)
  let styleScore = 0;

  // Tour Type Filter (Rundreise vs. Streckentour)
  if (criteria.tourType === "rundreise") {
    if (route.isRoundTrip) {
      styleScore += 3;
      reasons.push({ text: "✓ Echte 360°-Rundreise: Hin- & Rückweg über 2 verschiedene Routen", type: "positive" });
    } else {
      isNoGoExcluded = true;
      score -= 40;
      reasons.push({ text: "⚠️ Keine Rundreise (Streckentour A nach B)", type: "warning" });
    }
  } else if (criteria.tourType === "strecke") {
    if (!route.isRoundTrip) {
      styleScore += 3;
      reasons.push({ text: "✓ Reale Streckentour (A nach B)", type: "positive" });
    } else {
      score -= 20;
    }
  }

  // Accommodation filter
  if (criteria.accommodation === "womo_camping") {
    const hasAccomm = (DB.accommodations || []).some(acc =>
      (route.countries || []).some(c => c.toLowerCase() === acc.country.toLowerCase())
    );
    if (hasAccomm || route.wildcamping) {
      styleScore += 3;
      campingBadge = `<span class="rec-card-badge" style="background:rgba(6,214,160,0.2);color:var(--green);font-weight:600">🏕️ Camping &amp; Stellplätze</span>`;
      reasons.push({ text: "✓ Verifizierte Campingplätze & Wohnmobilstellplätze vorhanden", type: "positive" });
    }
  } else if (criteria.accommodation === "zelt_wildcamp") {
    const isWildcampFriendly = route.wildcamping || /norwegen|schweden|schottland|albanien/i.test(descFull);
    if (isWildcampFriendly) {
      styleScore += 4;
      campingBadge = `<span class="rec-card-badge" style="background:rgba(255,107,53,0.2);color:var(--accent);font-weight:600">⛺ Zelt- &amp; Freisteh-Highlight</span>`;
      reasons.push({ text: "✓ Zelt- & Wildcamping-Paradies (Jedermannsrecht oder naturnahe Biwaks)", type: "positive" });
    }
  } else if (criteria.accommodation === "hotel") {
    styleScore += 3;
    campingBadge = `<span class="rec-card-badge" style="background:rgba(59,130,246,0.2);color:var(--blue);font-weight:600">🏨 Hotel &amp; B&amp;B</span>`;
    reasons.push({ text: "✓ Gute Dichte an Hotels & Gasthöfen für komfortables Übernachten", type: "positive" });
  }

  // Natural Attractions Check
  let matchedAttraction = null;
  if (criteria.styleTags.has("attraktionen") && DB.attractions && DB.attractions.length) {
    matchedAttraction = DB.attractions.find(att => {
      if (att.nearestRoute && att.nearestRoute === route.id) return true;
      const attCountry = (att.country || "").toLowerCase();
      return (route.countries || []).some(c => {
        const cLower = c.toLowerCase();
        return attCountry.includes(cLower) || cLower.includes(attCountry);
      });
    });
    if (matchedAttraction) {
      styleScore += 4;
      score += 15;
      attractionBadge = `<span class="rec-card-badge" style="background:rgba(255,107,53,0.25);color:var(--accent);font-weight:700">${matchedAttraction.icon || "🌋"} ${escapeHtml(matchedAttraction.name)}</span>`;
      reasons.push({ text: `🌋 Führt an der Natursensation „${matchedAttraction.name}“ vorbei`, type: "positive" });
    }
  }

  if (criteria.styleTags.has("paesse") && (/pass|col|joch|alpen|pyrenäen|dolomiten|grossglockner|stelvio/i.test(descFull) || parseInt(route.elevation || "0") >= 1800)) {
    styleScore += 3;
    reasons.push({ text: "✓ Legendäre Pässe & Hochgebirge", type: "positive" });
  }
  if (criteria.styleTags.has("kurven") && /kurven|kehren|serpentinen|panoramastraße|motorrad|flow/i.test(descFull)) {
    styleScore += 2;
    reasons.push({ text: "✓ Großartige Kurvenfolgen", type: "positive" });
  }
  if (criteria.styleTags.has("offroad") && (/schotter|gravel|tet|piste|offroad/i.test(descFull) || diff === "schwer")) {
    styleScore += 3;
    reasons.push({ text: "✓ Spannende Schotter- & Adventure-Abschnitte", type: "positive" });
  }
  if (criteria.styleTags.has("natur") && /natur|nationalpark|see|fjord|berge|wildnis/i.test(descFull)) {
    styleScore += 2;
    reasons.push({ text: "✓ Eindrucksvolle Natur & Weite", type: "positive" });
  }
  if (criteria.styleTags.has("seen_kueste") && /see|fjord|küste|meer|ozean|fluss|adria|atlantik/i.test(descFull)) {
    styleScore += 3;
    score += 10;
    reasons.push({ text: "✓ Traumhafte Gewässer- & Küstenblicke", type: "positive" });
  }
  if (criteria.styleTags.has("pass_garantie")) {
    const pCount = (route.passes || []).length;
    const hasPassInDesc = /pass|päss|col|joch|timmelsjoch|stelvio|galibier/i.test(descFull);
    const hasPassInPois = (route.pois || []).some(p => /pass|päss|col|joch/i.test(p.name || ""));
    if (pCount >= 2 || hasPassInDesc || hasPassInPois) {
      styleScore += 3;
      score += 15;
      reasons.push({ text: `✓ Pass-Garantie erfüllt: ${pCount ? pCount + ' Pässe' : 'Hochgebirgspässe'} enthalten`, type: "positive" });
    }
  }
  if (criteria.autobahnPref === "no_highway") {
    if (!/autobahn|highway/i.test(descFull)) {
      score += 10;
      reasons.push({ text: "✓ 0 % Autobahn: Reine Kurven & Panoramastraßen", type: "positive" });
    }
  }
  if (criteria.styleTags.has("kultur") && /kultur|stadt|dorf|burg|historisch|unesco/i.test(descFull)) {
    styleScore += 2;
    reasons.push({ text: "✓ Historische Dörfer & Kultur", type: "positive" });
  }

  styleScore = Math.min(10, styleScore);

  // Calculate final score
  score = score + regionScore + levelScore + durationScore + seasonScore + styleScore;
  if (isNoGoExcluded) score = Math.max(10, score - 35);
  score = Math.max(20, Math.min(99, Math.round(score)));

  return {
    route,
    score,
    vehicleBadge,
    campingBadge,
    attractionBadge,
    breakdown: {
      anreise: { score: regionScore, max: 25, label: "📍 Anreise & Region" },
      level: { score: levelScore, max: 25, label: "🏍️ Fahrzeug & Level" },
      saison: { score: seasonScore, max: 25, label: "📅 Saison & Wetter" },
      dauer: { score: durationScore, max: 15, label: "⏱️ Reisedauer" },
      erlebnis: { score: styleScore, max: 10, label: "🎯 Erlebnis & No-Gos" }
    },
    reasons: reasons.slice(0, 5),
    seasonWarning,
    isSeasonOk: !seasonWarning,
    isNoGoExcluded
  };
}

function matchPasses(criteria) {
  if (!DB.passes || !DB.passes.length) return [];

  return DB.passes.map(p => {
    let pScore = 50;

    // No-Gos check
    if (criteria.noGos.has("no_offroad") && p.levelOffroad && (!p.levelAsphalt || p.levelOffroad >= "O2")) return { pass: p, score: 0 };
    if (criteria.noGos.has("no_toll") && p.tollRoad) return { pass: p, score: 0 };
    if (criteria.noGos.has("no_extreme_altitude") && p.altitude > 2500) return { pass: p, score: 0 };

    // Season
    if (criteria.month !== "alle") {
      if (p.yearRound) {
        pScore += 20;
      } else {
        const a = p.seasonOpen[0], b = p.seasonOpen[1];
        let isOpen = false;
        if (a <= b) isOpen = criteria.month >= a && criteria.month <= b;
        else isOpen = criteria.month >= a || criteria.month <= b;

        if (isOpen) pScore += 25;
        else pScore -= 35;
      }
    } else {
      pScore += 15;
    }

    // Level
    const la = p.levelAsphalt;
    const lo = p.levelOffroad;

    if (criteria.level === "einsteiger") {
      if (la === "A1" || la === "A2") pScore += 25;
      else if (la === "A3") pScore += 8;
      else pScore -= 20;
    } else if (criteria.level === "mittel") {
      if (la === "A2" || la === "A3" || lo === "O1") pScore += 25;
      else if (la === "A4") pScore += 12;
      else pScore += 5;
    } else if (criteria.level === "erfahren") {
      if (la === "A3" || la === "A4" || lo === "O2" || lo === "O3") pScore += 25;
      else pScore += 15;
    } else if (criteria.level === "experte") {
      if (la === "A4" || la === "A5" || lo === "O3" || lo === "O4" || lo === "O5") pScore += 25;
      else pScore += 10;
    }

    // Region
    const allowed = REGION_COUNTRY_MAP[criteria.startRegion] || [];
    if (criteria.startRegion === "weltweit") {
      pScore += 15;
    } else {
      const hit = (p.country || []).some(c => allowed.some(ac => ac.toLowerCase() === c.toLowerCase()));
      if (hit) pScore += 25;
      else if (p.continent === "Europa") pScore += 10;
    }

    pScore = Math.max(20, Math.min(99, Math.round(pScore)));
    return { pass: p, score: pScore };
  })
  .filter(item => item.score >= 55)
  .sort((a, b) => b.score - a.score)
  .slice(0, 6)
  .map(item => item.pass);
}

function calculateAndShowRecommendations() {
  if (!DB.routes || DB.routes.length === 0) return;

  const scored = DB.routes.map(r => scoreRoute(r, finderState));
  scored.sort((a, b) => b.score - a.score);

  finderState.calculatedRoutes = scored;
  finderState.calculatedPasses = matchPasses(finderState);

  const resultsArea = document.getElementById("finderResultsArea");
  if (resultsArea) {
    resultsArea.classList.remove("hidden");
    resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  applyFinderSortAndFilter();
}

function applyFinderSortAndFilter() {
  if (!finderState.calculatedRoutes) return;

  const sortSelect = document.getElementById("finderSortOrder");
  const sortMode = sortSelect ? sortSelect.value : "score";
  finderState.sortOrder = sortMode;

  let list = [...finderState.calculatedRoutes];

  // Filter out No-Go excluded items
  list = list.filter(item => !item.isNoGoExcluded);

  // Season filter
  if (finderState.filterSeasonOkOnly && finderState.month !== "alle") {
    list = list.filter(item => item.isSeasonOk);
  }

  // Sort
  if (sortMode === "score") {
    list.sort((a, b) => b.score - a.score);
  } else if (sortMode === "duration") {
    list.sort((a, b) => parseRouteDays(a.route.duration).min - parseRouteDays(b.route.duration).min);
  } else if (sortMode === "distance") {
    list.sort((a, b) => {
      const da = parseInt((a.route.distance || "").replace(/\D/g, ""), 10) || 99999;
      const db = parseInt((b.route.distance || "").replace(/\D/g, ""), 10) || 99999;
      return da - db;
    });
  }

  renderRecommendedRoutes(list);
  renderRecommendedPasses(finderState.calculatedPasses);
}

function toggleFinderSeasonFilter() {
  finderState.filterSeasonOkOnly = !finderState.filterSeasonOkOnly;
  const btn = document.getElementById("finderFilterSeasonOk");
  if (btn) {
    btn.classList.toggle("active", finderState.filterSeasonOkOnly);
    btn.textContent = finderState.filterSeasonOkOnly
      ? "🟢 Nur ideale Saisonzeiten anzeigen"
      : "⚪ Alle Saisonzeiten (inkl. Warnungen)";
  }
  applyFinderSortAndFilter();
}

function toggleBreakdown(routeId) {
  const el = document.getElementById("breakdown-" + routeId);
  if (el) el.classList.toggle("hidden");
}

const CITY_COORDS = {
  "München": [48.137, 11.576],
  "Stuttgart": [48.775, 9.182],
  "Frankfurt": [50.110, 8.682],
  "Köln": [50.937, 6.960],
  "Hamburg": [53.551, 9.993],
  "Berlin": [52.520, 13.404],
  "Wien": [48.208, 16.373],
  "Innsbruck": [47.269, 11.404],
  "Zürich": [47.376, 8.541],
  "Salzburg": [47.809, 13.055],
  "Bern": [46.948, 7.447],
  "Nürnberg": [49.452, 11.076],
  "Dresden": [51.050, 13.737],
  "Hannover": [52.375, 9.732],
  "Leipzig": [51.339, 12.373],
  "Bregenz": [47.503, 9.747],
  "Bozen": [46.498, 11.354],
  "Klagenfurt": [46.624, 14.305],
  "Basel": [47.559, 7.588],
  "Luzern": [47.050, 8.309]
};

const REGION_CENTROIDS = {
  dach: { name: "DACH-Raum (München)", coords: [48.137, 11.576] },
  suedeuropa: { name: "Südeuropa (Nizza)", coords: [43.710, 7.262] },
  skandinavien: { name: "Nordeuropa (Oslo)", coords: [59.913, 10.752] },
  balkan: { name: "Balkan (Ljubljana)", coords: [46.056, 14.505] },
  uk: { name: "UK & Irland (Edinburgh)", coords: [55.953, -3.188] },
  weltweit: { name: "Startort flexibel", coords: [48.137, 11.576] }
};

function calcHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getRiderStart() {
  if (finderState.city) {
    const direct = CITY_COORDS[finderState.city];
    if (direct) return { name: finderState.city, coords: direct };
    const key = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === finderState.city.toLowerCase());
    if (key) return { name: key, coords: CITY_COORDS[key] };
  }
  const reg = REGION_CENTROIDS[finderState.startRegion] || REGION_CENTROIDS.dach;
  return { name: finderState.city || reg.name, coords: reg.coords };
}

function estimateTransit(startCoords, targetCoords) {
  if (!startCoords || !targetCoords) return { km: 0, timeStr: "–" };
  const directKm = calcHaversineKm(startCoords[0], startCoords[1], targetCoords[0], targetCoords[1]);
  const roadKm = Math.round(directKm * 1.28);
  const hours = Math.floor(roadKm / 75);
  const mins = Math.round(((roadKm / 75) - hours) * 60);
  const timeStr = hours > 0 ? `${hours} h ${mins > 0 ? mins + ' min' : ''}` : `${mins} min`;
  return { km: roadKm, timeStr };
}

function findPassesNearRoute(routePoints, maxDistKm = 80) {
  if (!DB.passes || !routePoints || !routePoints.length) return [];
  return DB.passes.filter(pass => {
    return routePoints.some(pt => calcHaversineKm(pt[0], pt[1], pass.lat, pass.lng) <= maxDistKm);
  }).slice(0, 8);
}

function renderRecommendedRoutes(list) {
  const grid = document.getElementById("finderRouteGrid");
  const countBadge = document.getElementById("finderRouteCount");
  if (!grid) return;

  if (countBadge) countBadge.textContent = list.length;

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;background:var(--bg2);padding:2rem;border-radius:14px;text-align:center;border:1px solid var(--border)">
        <h4 style="margin:0 0 .5rem">Keine Routen mit diesen strikten Filtern gefunden</h4>
        <p class="hint">Tipp: Schalte ein Ausschluss-Kriterium (No-Go) aus oder wähle die Option „Alle Saisonzeiten anzeigen“.</p>
        <button class="btn btn-primary" onclick="toggleFinderSeasonFilter()">Saison-Filter lockern</button>
      </div>
    `;
    return;
  }

  const riderStart = getRiderStart();

  grid.innerHTML = list.map(item => {
    const r = item.route;
    const score = item.score;
    const scoreClass = score >= 80 ? "rec-score-high" : score >= 60 ? "rec-score-med" : "rec-score-low";
    const barColor = score >= 80 ? "#06d6a0" : score >= 60 ? "#ffd23f" : "#9aa2b4";

    const countries = withFlag(r.countries);
    const reasonsHtml = item.reasons.map(res =>
      `<div class="rec-reason-item ${res.type}">${escapeHtml(res.text)}</div>`
    ).join("");

        // Pacing & Kilometergefühl Insight (Differenziert nach Fahrzeug & Bergpassagen)
    let pacingInsightHtml = "";
    const routeDistKm = parseInt((r.distance || "1000").replace(/\D/g, ""), 10) || 1000;
    const isAlpine = (/alpen|dolomiten|pass|col|joch|pyrenäen|grossglockner|stelvio|timmelsjoch|galibier/i.test((r.name || "") + " " + (r.description || "")) || parseInt(r.elevation || "0") >= 1800);
    const isOffroad = /schotter|piste|tet|unbefestigt|offroad|gravel/i.test((r.name || "") + " " + (r.description || ""));

    if (finderState.vehicle === "wohnmobil") {
      const camperSpeed = isAlpine ? (finderState.pace === "gemuetlich" ? 100 : finderState.pace === "sportlich" ? 180 : 130) : (finderState.pace === "gemuetlich" ? 130 : finderState.pace === "sportlich" ? 240 : 170);
      const driveDays = Math.max(1, Math.round(routeDistKm / camperSpeed));
      const restDays = Math.max(0, Math.floor(driveDays / 3));
      const totalRecDays = driveDays + restDays;
      const avgKmPerDriveDay = Math.round(routeDistKm / driveDays);
      const avgRealKmh = isAlpine ? 38 : 52;
      const avgHoursPerDay = (avgKmPerDriveDay / avgRealKmh).toFixed(1);
      const isHighKmAlert = avgKmPerDriveDay > (isAlpine ? 180 : 250);

      pacingInsightHtml = `
        <div class="womo-pacing-card" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);border-radius:10px;padding:.65rem .85rem;margin:.55rem 0;font-size:.82rem;color:var(--text)">
          <div style="font-weight:700;color:var(--blue);margin-bottom:.3rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.3rem">
            <span>🚐 WoMo-Reisegefühl ${isAlpine ? '🏔️ (Bergstrecke)' : '🛣️'}:</span>
            <span style="font-size:.76rem;background:rgba(59,130,246,0.18);padding:.15rem .5rem;border-radius:10px;color:var(--text);font-weight:600">Ø ~${avgKmPerDriveDay} km / Fahrtag</span>
          </div>
          <div style="display:flex;gap:.8rem;flex-wrap:wrap;color:var(--text-muted);font-size:.78rem;line-height:1.4">
            <span>⏱️ <b>~${avgHoursPerDay} h</b> Fahrzeit/Tag (Schnitt ~${avgRealKmh} km/h ${isAlpine ? 'im Gebirge' : 'Überland'})</span>
            <span>🗓️ <b>${driveDays}</b> Fahrtage + <b>${restDays}</b> Stehtage = <b>~${totalRecDays} Tage</b></span>
            <span>${isAlpine ? '⚠️ Motorbremse nutzen &amp; Bremsenkühlung beachten!' : '⛺ V/E &amp; Stellplatzankunft vor 17:00 empfohlen'}</span>
          </div>
          ${isHighKmAlert ? `
          <div style="margin-top:.4rem;color:#f87171;font-size:.76rem;font-weight:600">
            ⚠️ Hohes Tagespensum: In bergigem Gelände bedeuten > ${isAlpine ? '180' : '250'} km/Tag über 5 Stunden hochkonzentrierte Lenkzeit im Camper!
          </div>` : ''}
        </div>
      `;
    } else if (finderState.vehicle === "bikepacking") {
      const bpDaily = isAlpine ? (finderState.pace === "gemuetlich" ? 40 : finderState.pace === "sportlich" ? 65 : 50) : (finderState.pace === "gemuetlich" ? 55 : finderState.pace === "sportlich" ? 95 : 70);
      const driveDays = Math.max(1, Math.round(routeDistKm / bpDaily));
      const restDays = Math.max(0, Math.floor(driveDays / 4));
      const totalRecDays = driveDays + restDays;
      const avgClimbKmh = isAlpine ? 11 : 16;
      const avgHoursPerDay = (Math.round(routeDistKm / driveDays) / avgClimbKmh).toFixed(1);

      pacingInsightHtml = `
        <div class="womo-pacing-card" style="background:rgba(6,214,160,0.08);border:1px solid rgba(6,214,160,0.25);border-radius:10px;padding:.65rem .85rem;margin:.55rem 0;font-size:.82rem;color:var(--text)">
          <div style="font-weight:700;color:var(--green);margin-bottom:.3rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.3rem">
            <span>🚵 Bikepacking-Kalkulation ${isAlpine ? '⛰️ (Höhenmeter-Fokus)' : '🚲'}:</span>
            <span style="font-size:.76rem;background:rgba(6,214,160,0.18);padding:.15rem .5rem;border-radius:10px;color:var(--text);font-weight:600">Ø ~${Math.round(routeDistKm / driveDays)} km / Fahrtag</span>
          </div>
          <div style="display:flex;gap:.8rem;flex-wrap:wrap;color:var(--text-muted);font-size:.78rem;line-height:1.4">
            <span>⏱️ <b>~${avgHoursPerDay} h</b> Kurbelzeit/Tag (${isAlpine ? 'Bergauf 6–9 km/h · Abfahrt max 35 km/h' : 'Flott mit ~16 km/h'})</span>
            <span>🗓️ <b>${driveDays}</b> Etappen + <b>${restDays}</b> Ruhetage = <b>~${totalRecDays} Tage</b></span>
            <span>🎒 ${isAlpine ? 'Jedes Kilo Gepäck kostet bergauf massiv Kraft (Hubarbeit)!' : 'Ideal für Gravel-Taschen &amp; Zelt'}</span>
          </div>
        </div>
      `;
    } else {
      // Motorrad
      const motoDaily = isAlpine ? (finderState.pace === "gemuetlich" ? 180 : finderState.pace === "sportlich" ? 280 : 230) : isOffroad ? (finderState.pace === "gemuetlich" ? 120 : finderState.pace === "sportlich" ? 180 : 140) : (finderState.pace === "gemuetlich" ? 240 : finderState.pace === "sportlich" ? 420 : 320);
      const driveDays = Math.max(1, Math.round(routeDistKm / motoDaily));
      const restDays = Math.max(0, Math.floor(driveDays / 5));
      const totalRecDays = driveDays + restDays;
      const avgKmPerDriveDay = Math.round(routeDistKm / driveDays);
      const realKmh = isAlpine ? 42 : isOffroad ? 25 : 62;
      const avgHoursPerDay = (avgKmPerDriveDay / realKmh).toFixed(1);

      pacingInsightHtml = `
        <div class="womo-pacing-card" style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.25);border-radius:10px;padding:.65rem .85rem;margin:.55rem 0;font-size:.82rem;color:var(--text)">
          <div style="font-weight:700;color:var(--accent);margin-bottom:.3rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.3rem">
            <span>🏍️ Motorrad-Reisegefühl ${isAlpine ? '⛰️ (Hochalpen / Pässe)' : isOffroad ? '🪨 (Offroad / TET)' : '🛣️ (Landstraßen-Flow)'}:</span>
            <span style="font-size:.76rem;background:rgba(255,107,53,0.18);padding:.15rem .5rem;border-radius:10px;color:var(--text);font-weight:600">Ø ~${avgKmPerDriveDay} km / Fahrtag</span>
          </div>
          <div style="display:flex;gap:.8rem;flex-wrap:wrap;color:var(--text-muted);font-size:.78rem;line-height:1.4">
            <span>⏱️ <b>~${avgHoursPerDay} h</b> reine Fahrzeit/Tag (Schnitt ~${realKmh} km/h) + Pausen</span>
            <span>🗓️ <b>${driveDays}</b> Fahrtage ${restDays > 0 ? '+ <b>' + restDays + '</b> Ruhetag' : ''} = <b>~${totalRecDays} Tage</b></span>
            <span>${isAlpine ? '💪 220 km Alpen fühlen sich an wie 500 km Autobahn (Kupplung &amp; Kurvenfokus)' : isOffroad ? '🧍 Stehend fahren beansprucht Oberschenkel &amp; Balance massiv' : '☕ Zeit für Kurvengenuss &amp; lockere Fotostopps'}</span>
          </div>
        </div>
      `;
    }

    const alertHtml = item.seasonWarning
      ? `<div class="rec-season-alert">⚠️ ${escapeHtml(item.seasonWarning)}</div>`
      : "";

    // Breakdown HTML
    const bd = item.breakdown || {};
    const breakdownRows = Object.keys(bd).map(k => {
      const bItem = bd[k];
      return `<div class="breakdown-row"><span>${bItem.label}</span><span>${bItem.score} / ${bItem.max} Pkt</span></div>`;
    }).join("");

    // Transit estimation
    let routeStartCoords = null;
    if (r.pois && r.pois.length && r.pois[0].lat) {
      routeStartCoords = [r.pois[0].lat, r.pois[0].lng];
    } else if (window.DB && window.DB.routeGeo && window.DB.routeGeo[r.id]) {
      routeStartCoords = window.DB.routeGeo[r.id];
    }

    const transit = routeStartCoords ? estimateTransit(riderStart.coords, routeStartCoords) : null;
    const transitBadge = transit && transit.km > 0
      ? `<div class="transit-badge">📍 ~${transit.km.toLocaleString("de")} km Anreise ab ${escapeHtml(riderStart.name)} (~${transit.timeStr})</div>`
      : "";

    return `
      <div class="rec-card" onclick="openRoutePreviewModal('${r.id}')" role="button" tabindex="0">
        <div class="rec-card-top">
          <div class="rec-card-title">
            <h3>${escapeHtml(r.name)}</h3>
            <div class="rec-card-sub">📍 ${countries} · ${escapeHtml(r.kategorie || "Route")}</div>
          </div>
          <div class="rec-score-badge ${scoreClass}">🎯 ${score}% Match</div>
        </div>

        <div class="rec-match-track">
          <div class="rec-match-fill" style="width:${score}%;background:${barColor}"></div>
        </div>

        ${transitBadge}
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin:.4rem 0">${item.vehicleBadge || ""} ${item.campingBadge || ""} ${item.attractionBadge || ""}</div>
        ${pacingInsightHtml}

        <button class="breakdown-toggle-btn" onclick="event.stopPropagation();toggleBreakdown('${r.id}')">📊 Match-Score aufschlüsseln</button>
        <div id="breakdown-${r.id}" class="rec-breakdown-box hidden" onclick="event.stopPropagation()">
          ${breakdownRows}
        </div>

        ${alertHtml}

        <div class="rec-reasons">
          ${reasonsHtml}
        </div>

        <div class="rec-meta-row">
          <span class="rec-meta-item" style="font-weight:700;color:${r.isRoundTrip ? 'var(--green)' : 'var(--blue)'};border-color:${r.isRoundTrip ? 'rgba(6,214,160,0.4)' : 'rgba(59,130,246,0.4)'}">
            ${r.isRoundTrip ? '🔄 Rundreise' : '➡️ Streckentour'}
          </span>
          <span class="rec-meta-item" style="color:var(--accent);font-weight:600">~${r.recommendedDailyKm || 180} km/Tag empfohlen</span>
          <span class="rec-meta-item">📏 ${escapeHtml(r.distance || "–")}</span>
          <span class="rec-meta-item">⏱️ ${escapeHtml(r.duration || "–")}</span>
          <span class="rec-meta-item">⛰️ ${escapeHtml(r.elevation || "–")}</span>
          <span class="rec-meta-item">🚦 ${escapeHtml(r.difficulty || "mittel")}</span>
          <span class="rec-meta-item">📅 ${escapeHtml(r.season || "–")}</span>
        </div>

        <p class="rec-description">${escapeHtml(r.description || "")}</p>

        <div class="rec-card-actions">
          <button class="btn btn-primary" onclick="event.stopPropagation();openRoutePreviewModal('${r.id}')" style="background:linear-gradient(135deg,#ff6b35 0%,#ffd23f 100%);color:#fff;border:none;box-shadow:0 4px 14px rgba(255,107,53,0.3)">🗺️ Route & Anreise ansehen</button>
          <button class="btn" onclick="event.stopPropagation();openRouteModal('${r.id}')">📋 Details</button>
          <button class="btn" onclick="event.stopPropagation();quickAddRouteToReise('${r.id}')">➕ Zu Reise</button>
        </div>
      </div>
    `;
  }).join("");
}

let _previewMapInstance = null;

async function fetchOsrmRouteWithDetails(points, timeoutMs = 1800) {
  if (!points || points.length < 2) return null;
  const coords = points.map(p => `${p.lng || p[1]},${p.lat || p[0]}`).join(";");
  const cacheKey = `osrm_dtl_${coords}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error("OSRM status " + r.status);
    const j = await r.json();
    if (j.code !== "Ok" || !j.routes || !j.routes[0]) throw new Error("No route");
    const routeData = j.routes[0];
    const pts = routeData.geometry.coordinates.map(c => [c[1], c[0]]);
    const distKm = Math.round(routeData.distance / 1000);
    const durMin = Math.round(routeData.duration / 60);
    const res = { pts, distKm, durMin };
    try { sessionStorage.setItem(cacheKey, JSON.stringify(res)); } catch(e) {}
    return res;
  } catch (e) {
    return null;
  }
}

// Intelligenter Rundreise-Rückschleifen-Generator (Kein Backtracking / Kriterien-Passung)
function calculateReturnLoopLeg(riderStart, routeObj, criteria = {}) {
  const startCoords = riderStart.coords;
  let tourStart = (routeObj.pois && routeObj.pois.length) ? [routeObj.pois[0].lat, routeObj.pois[0].lng] : (window.DB.routeGeo[routeObj.id] || startCoords);
  let tourEnd = (routeObj.pois && routeObj.pois.length) ? [routeObj.pois[routeObj.pois.length - 1].lat, routeObj.pois[routeObj.pois.length - 1].lng] : tourStart;

  const dTotal = calcHaversineKm(startCoords[0], startCoords[1], tourStart[0], tourStart[1]);

  // Mittelpunkt zwischen Tourende und Startort
  const midLat = (tourEnd[0] + startCoords[0]) / 2;
  const midLng = (tourEnd[1] + startCoords[1]) / 2;

  // Suche nach passenden Pässen im Rückreise-Korridor aus der DB
  const candidates = [];
  if (window.DB && window.DB.passes) {
    window.DB.passes.forEach(p => {
      const dMid = calcHaversineKm(midLat, midLng, p.lat, p.lng);
      const dOutboundStart = calcHaversineKm(tourStart[0], tourStart[1], p.lat, p.lng);
      const dHome = calcHaversineKm(startCoords[0], startCoords[1], p.lat, p.lng);
      const dEnd = calcHaversineKm(tourEnd[0], tourEnd[1], p.lat, p.lng);

      // Muss im Rückreise-Korridor liegen und ausreichend Abstand zur Hinreise haben (kein Backtracking!)
      if (dMid < Math.max(95, dTotal * 0.48) && dOutboundStart > 25 && dHome > 20 && dEnd > 15) {
        let matchScore = 100 - dMid;

        // Kriterien-Filter & Scoring
        const isOffroadPass = p.levelOffroad && p.levelOffroad.startsWith("O");
        if (criteria.noGos && criteria.noGos.has("no_offroad") && isOffroadPass && p.surface !== "Asphalt") return;
        if (criteria.noGos && criteria.noGos.has("no_toll") && p.toll) return;
        if (criteria.noGos && criteria.noGos.has("no_extreme_altitude") && p.altitude > 2500) return;

        if (criteria.level === "einsteiger" && (p.levelAsphalt === "A4" || p.levelAsphalt === "A5" || isOffroadPass)) {
          matchScore -= 50;
        } else if (criteria.level === "erfahren" || criteria.level === "experte") {
          matchScore += 20;
        }

        if (criteria.styleTags && criteria.styleTags.has("paesse")) matchScore += 35;
        if (criteria.styleTags && criteria.styleTags.has("kurven")) matchScore += 20;

        candidates.push({ pass: p, score: matchScore, dist: dMid });
      }
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  // Wähle maximal 1 bis 2 Pässe für den Rückweg
  const pickedPasses = [];
  for (const c of candidates) {
    if (pickedPasses.length >= 2) break;
    if (pickedPasses.length === 0 || calcHaversineKm(pickedPasses[0].lat, pickedPasses[0].lng, c.pass.lat, c.pass.lng) > 35) {
      pickedPasses.push(c.pass);
    }
  }

  let returnCoords = [];
  if (pickedPasses.length > 0) {
    returnCoords = [tourEnd, ...pickedPasses.map(p => [p.lat, p.lng]), startCoords];
  } else {
    // Falls keine Gebirgspässe vorhanden (z. B. Flachland), erstelle einen versetzten Zwischenpunkt
    const dLat = startCoords[0] - tourEnd[0];
    const dLng = startCoords[1] - tourEnd[1];
    const lateralOffset = Math.min(0.65, Math.max(0.18, dTotal * 0.002));
    const altMidLat = midLat + (-dLng * lateralOffset * 0.3);
    const altMidLng = midLng + (dLat * lateralOffset * 0.3);
    returnCoords = [tourEnd, [altMidLat, altMidLng], startCoords];
  }

  const returnDist = estimateTransit(tourEnd, startCoords);
  const returnKm = Math.round(returnDist.km * 1.16);
  const hours = Math.floor(returnKm / 72);
  const mins = Math.round(((returnKm / 72) - hours) * 60);
  const returnTimeStr = hours > 0 ? `${hours} h ${mins > 0 ? mins + ' min' : ''}` : `${mins} min`;

  return {
    coords: returnCoords,
    passes: pickedPasses,
    km: returnKm,
    timeStr: returnTimeStr,
    label: pickedPasses.length
      ? `Rückweg über ${pickedPasses.map(p => p.name).join(" & ")}`
      : "Alternative Rückreise-Schleife (andere Landstraßen)"
  };
}


/* ============================================================
   REALISTISCHER ETAPPEN- & TAGESPLANER (Empirische Berechnungen)
   ============================================================ */


/* ============================================================
   SÄULE 1: LIVE-WETTER & BERGWETTER (Open-Meteo API)
   ============================================================ */

async function fetchLiveWeather(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.daily;
  } catch (err) {
    console.warn("Wetterabfrage fehlgeschlagen:", err);
    return null;
  }
}

function wmoCodeToIcon(code) {
  if (code === 0) return { icon: "☀️", text: "Klar / Sonnig" };
  if (code <= 3) return { icon: "⛅", text: "Leicht bewölkt" };
  if (code <= 48) return { icon: "🌫️", text: "Nebel" };
  if (code <= 55) return { icon: "🌦️", text: "Nieselregen" };
  if (code <= 65) return { icon: "🌧️", text: "Regen" };
  if (code <= 77) return { icon: "🌨️", text: "Schnee" };
  if (code <= 82) return { icon: "🌧️", text: "Schauer" };
  if (code <= 86) return { icon: "❄️", text: "Schneeschauer" };
  return { icon: "⛈️", text: "Gewitter" };
}

async function loadModalLiveWeather(lat, lng, containerId, altitude = 0) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = `<div style="font-size:.82rem;color:var(--muted);padding:.5rem;text-align:center">⏳ 7-Tage-Bergwetter wird von Open-Meteo abgerufen...</div>`;
  const daily = await fetchLiveWeather(lat, lng);
  if (!daily || !daily.time) {
    box.innerHTML = `<div style="font-size:.82rem;color:#f87171;padding:.5rem;text-align:center">⚠️ Live-Wetterdaten konnten nicht geladen werden (Offline-Modus aktiv).</div>`;
    return;
  }

  const daysHtml = daily.time.slice(0, 5).map((t, idx) => {
    const d = new Date(t);
    const dayName = d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" });
    const wmo = wmoCodeToIcon(daily.weathercode[idx]);
    const maxT = Math.round(daily.temperature_2m_max[idx]);
    const minT = Math.round(daily.temperature_2m_min[idx]);
    const rainProb = daily.precipitation_probability_max[idx] || 0;

    return `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.5rem;text-align:center;min-width:75px;flex:1">
        <div style="font-size:.74rem;color:var(--muted);font-weight:600">${dayName}</div>
        <div style="font-size:1.4rem;margin:.2rem 0" title="${wmo.text}">${wmo.icon}</div>
        <div style="font-size:.82rem;font-weight:700">${maxT}° <span style="font-size:.74rem;color:var(--muted);font-weight:normal">${minT}°</span></div>
        <div style="font-size:.72rem;color:${rainProb > 40 ? '#60a5fa' : 'var(--muted)'}">💧 ${rainProb}%</div>
      </div>
    `;
  }).join("");

  const minOverall = Math.min(...daily.temperature_2m_min.slice(0, 3));
  const frostWarning = (altitude >= 1800 && minOverall <= 2)
    ? `<div style="margin-top:.5rem;font-size:.78rem;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);padding:.4rem .7rem;border-radius:6px;color:#fca5a5;display:flex;align-items:center;gap:.4rem">
         <span>❄️ <b>Frost- &amp; Schneewarnung in Hochlagen:</b> Tiefstwerte um ${minOverall}°C am Pass. Warme Kleidung &amp; Straßenzustand beachten!</span>
       </div>`
    : "";

  box.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;color:var(--text);margin-bottom:.4rem;display:flex;align-items:center;justify-content:space-between">
      <span>🌤️ 5-Tage-Vorhersage für diese Region:</span>
      <span style="font-size:.72rem;color:var(--muted)">Quelle: Open-Meteo</span>
    </div>
    <div style="display:flex;gap:.4rem;overflow-x:auto;padding-bottom:.3rem">${daysHtml}</div>
    ${frostWarning}
  `;
}

/* ============================================================
   SÄULE 2: GPS-STANDORT & NOMINATIM GEOCODING & STARTZEIT
   ============================================================ */

function useCurrentLocation() {
  const btn = document.getElementById("btnGpsLocate");
  const input = document.getElementById("finderCityInput");
  if (!navigator.geolocation) {
    alert("GPS-Standortermittlung wird von diesem Browser nicht unterstützt.");
    return;
  }

  if (btn) btn.innerHTML = "⏳ Ermittle Standort...";
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    CITY_COORDS["Mein Standort"] = [lat, lng];
    finderState.city = "Mein Standort";
    if (input) input.value = "Mein Standort (GPS aktiv)";
    if (btn) btn.innerHTML = "✅ GPS aktiv";

    // Auto-detect region
    if (lat >= 45.5 && lat <= 55 && lng >= 5.5 && lng <= 17) {
      finderState.startRegion = "dach";
    }
    renderFinderProfileSummary();
    updateLiveCounter();
  }, (err) => {
    if (btn) btn.innerHTML = "📍 Meinen GPS-Standort nutzen";
    alert("Standortzugriff nicht erlaubt oder nicht verfügbar.");
  }, { timeout: 8000 });
}

let _nominatimTimeout = null;
function onCityInputChanged(val) {
  finderState.city = (val || "").trim();
  document.querySelectorAll(".quick-city-btn").forEach(b => {
    b.classList.toggle("active", b.textContent.trim().toLowerCase() === finderState.city.toLowerCase());
  });

  renderFinderProfileSummary();
  updateLiveCounter();

  const resBox = document.getElementById("citySearchResults");
  if (!resBox) return;

  if (finderState.city.length < 3) {
    resBox.style.display = "none";
    return;
  }

  clearTimeout(_nominatimTimeout);
  _nominatimTimeout = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finderState.city)}&limit=4&addressdetails=1`;
      const resp = await fetch(url, { headers: { "Accept-Language": "de" } });
      if (!resp.ok) return;
      const items = await resp.json();
      if (!items || !items.length) {
        resBox.style.display = "none";
        return;
      }

      resBox.innerHTML = items.map(it => {
        const lat = parseFloat(it.lat);
        const lon = parseFloat(it.lon);
        const name = it.display_name.split(",").slice(0, 3).join(",");
        return `
          <div style="padding:.5rem .8rem;cursor:pointer;border-bottom:1px solid var(--border);font-size:.84rem;color:var(--text)" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'" onclick="selectCustomAddress('${escapeHtml(name)}', ${lat}, ${lon})">
            📍 <b>${escapeHtml(name)}</b>
          </div>
        `;
      }).join("");
      resBox.style.display = "block";
    } catch (e) {
      resBox.style.display = "none";
    }
  }, 400);
}

function selectCustomAddress(name, lat, lon) {
  finderState.city = name;
  CITY_COORDS[name] = [lat, lon];
  const input = document.getElementById("finderCityInput");
  if (input) input.value = name;
  const resBox = document.getElementById("citySearchResults");
  if (resBox) resBox.style.display = "none";

  if (lat >= 45.5 && lat <= 55 && lon >= 5.5 && lon <= 17) {
    finderState.startRegion = "dach";
  }
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectStartTime(mode, element) {
  finderState.startTime = mode;
  document.querySelectorAll("#finderStartTimeGrid .finder-choice-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

function selectAutobahnPref(pref, element) {
  finderState.autobahnPref = pref;
  document.querySelectorAll("#finderAutobahnGrid .style-tag-card").forEach(c => c.classList.remove("active"));
  if (element) element.classList.add("active");
  renderFinderProfileSummary();
  updateLiveCounter();
}

/* ============================================================
   SÄULE 4: COMMUNITY- & RIDER-LOGBUCH (Bewertungen & Meldungen)
   ============================================================ */

function getCommunityReports(targetId) {
  try {
    const all = JSON.parse(localStorage.getItem("moto_community_notes") || "{}");
    return all[targetId] || [];
  } catch (e) {
    return [];
  }
}

function saveCommunityReport(targetId, targetName, rating, condition, note) {
  try {
    const all = JSON.parse(localStorage.getItem("moto_community_notes") || "{}");
    if (!all[targetId]) all[targetId] = [];
    all[targetId].unshift({
      id: Date.now().toString(36),
      targetName,
      rating: parseInt(rating, 10) || 5,
      condition, // 'frei', 'warnung', 'gesperrt'
      note: note.trim(),
      date: new Date().toLocaleDateString("de-DE")
    });
    localStorage.setItem("moto_community_notes", JSON.stringify(all));
    return true;
  } catch (e) {
    return false;
  }
}

function submitModalCommunityNote(targetId, targetName) {
  const ratingEl = document.getElementById("reportRating");
  const condEl = document.getElementById("reportCondition");
  const noteEl = document.getElementById("reportNote");
  if (!noteEl || !noteEl.value.trim()) {
    alert("Bitte gib einen kurzen Erfahrungsbericht oder Zustandshinweis ein.");
    return;
  }

  saveCommunityReport(
    targetId,
    targetName,
    ratingEl ? ratingEl.value : 5,
    condEl ? condEl.value : "frei",
    noteEl.value
  );

  noteEl.value = "";
  renderModalCommunityReportsList(targetId);
  alert("✅ Vielen Dank! Dein Erfahrungsbericht wurde im Rider-Logbuch gespeichert.");
}

function renderModalCommunityReportsList(targetId) {
  const container = document.getElementById("communityReportsList");
  if (!container) return;
  const reports = getCommunityReports(targetId);
  if (!reports.length) {
    container.innerHTML = `<div style="font-size:.8rem;color:var(--muted);text-align:center;padding:.6rem">Noch keine Community-Einträge für diese Strecke. Sei der Erste!</div>`;
    return;
  }

  container.innerHTML = reports.map(r => {
    const condBadge = r.condition === "gesperrt"
      ? `<span style="background:rgba(239,68,68,0.2);color:#fca5a5;padding:.1rem .4rem;border-radius:6px;font-size:.74rem">🔴 Gesperrt / Problem</span>`
      : r.condition === "warnung"
      ? `<span style="background:rgba(245,158,11,0.2);color:#fcd34d;padding:.1rem .4rem;border-radius:6px;font-size:.74rem">🟡 Rollsplitt / Baustelle</span>`
      : `<span style="background:rgba(16,185,129,0.2);color:#6ee7b7;padding:.1rem .4rem;border-radius:6px;font-size:.74rem">🟢 Frei &amp; Top Zustand</span>`;
    
    const stars = "⭐".repeat(r.rating || 5);

    return `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.6rem .8rem;margin-bottom:.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem;flex-wrap:wrap;gap:.3rem">
          <span style="font-size:.82rem">${stars} ${condBadge}</span>
          <span style="font-size:.74rem;color:var(--muted)">📅 ${r.date}</span>
        </div>
        <div style="font-size:.82rem;line-height:1.4">${escapeHtml(r.note)}</div>
      </div>
    `;
  }).join("");
}

function buildRealisticItinerary(route, vehicle, pace, riderStart, returnLoop) {
  const distKm = parseInt((route.distance || "1000").replace(/\D/g, ""), 10) || 1000;
  const descFull = ((route.name || "") + " " + (route.description || "") + " " + withFlag(route.countries)).toLowerCase();
  const isAlpine = (/alpen|dolomiten|pass|col|joch|pyrenäen|grossglockner|stelvio|galibier|timmelsjoch/i.test(descFull) || parseInt(route.elevation || "0") >= 1800);
  const isOffroad = /schotter|piste|tet|unbefestigt|offroad|gravel/i.test(descFull);

  // 1. Spezifische Tagesdistanzen & Realschnitt nach Fahrzeug & Gelände
  let targetKm = 220;
  let realSpeed = 50;
  let restDayFreq = 4;

  if (vehicle === "wohnmobil") {
    if (isAlpine) {
      targetKm = pace === "gemuetlich" ? 110 : pace === "sportlich" ? 160 : 130;
      realSpeed = 36;
    } else {
      targetKm = pace === "gemuetlich" ? 140 : pace === "sportlich" ? 240 : 170;
      realSpeed = 52;
    }
    restDayFreq = 3;
  } else if (vehicle === "bikepacking") {
    if (isAlpine) {
      targetKm = pace === "gemuetlich" ? 40 : pace === "sportlich" ? 65 : 50;
      realSpeed = 11;
    } else {
      targetKm = pace === "gemuetlich" ? 55 : pace === "sportlich" ? 90 : 70;
      realSpeed = 16;
    }
    restDayFreq = 4;
  } else {
    // Motorrad
    if (isAlpine) {
      targetKm = pace === "gemuetlich" ? 180 : pace === "sportlich" ? 280 : 220;
      realSpeed = 42;
    } else if (isOffroad) {
      targetKm = pace === "gemuetlich" ? 110 : pace === "sportlich" ? 170 : 130;
      realSpeed = 25;
    } else {
      targetKm = pace === "gemuetlich" ? 240 : pace === "sportlich" ? 400 : 310;
      realSpeed = 62;
    }
    restDayFreq = 5;
  }

  // 2. POIs extrahieren oder synthetisieren
  let poiNames = (route.pois || []).filter(p => p.name).map(p => p.name);
  if (poiNames.length < 2) {
    const sName = route.start || "Startort der Tour";
    const dName = route.destination || "Zielort der Tour";
    poiNames = [sName, `Mitteletappe ${route.name}`, dName];
  }

  const numTourStages = Math.max(1, Math.round(distKm / targetKm));
  const stageKm = Math.round(distKm / numTourStages);

  const days = [];
  let currentDay = 1;

  // Transit Outward (Hinreise ab riderStart)
  const routeStartCoords = (route.pois && route.pois.length) ? [route.pois[0].lat, route.pois[0].lng] : (window.DB && window.DB.routeGeo && window.DB.routeGeo[route.id]);
  const transitEst = routeStartCoords ? estimateTransit(riderStart.coords, routeStartCoords) : { km: 0 };
  const transitKm = transitEst.km || 0;

  if (transitKm > 60) {
    const maxTransitDay = vehicle === "wohnmobil" ? 550 : vehicle === "bikepacking" ? 90 : 650;
    let transitDays = Math.max(1, Math.round(transitKm / maxTransitDay));
    if (finderState.startTime === "late" && transitKm > 130) {
      transitDays += 1;
    }
    let remainingTransitKm = transitKm;

    for (let tIdx = 0; tIdx < transitDays; tIdx++) {
      let currentStageKm = 0;
      if (tIdx === 0 && finderState.startTime === "late") {
        currentStageKm = Math.min(120, Math.round(transitKm * 0.4));
      } else if (tIdx === transitDays - 1) {
        currentStageKm = remainingTransitKm;
      } else {
        currentStageKm = Math.round(remainingTransitKm / (transitDays - tIdx));
      }
      remainingTransitKm -= currentStageKm;

      const tSpeed = vehicle === "wohnmobil" ? 85 : vehicle === "bikepacking" ? 18 : 105;
      const tHours = (currentStageKm / tSpeed).toFixed(1);
      const grossHours = (parseFloat(tHours) * 1.3).toFixed(1);
      const toName = tIdx === transitDays - 1 ? poiNames[0] : `Zwischenstopp Anreise (Richtung ${poiNames[0]})`;
      const fromName = tIdx === 0 ? riderStart.name : `Zwischenstopp Anreise ${tIdx}`;

      days.push({
        day: currentDay,
        title: `Tag ${currentDay}: Anreise nach ${toName}`,
        from: fromName,
        to: toName,
        km: currentStageKm,
        drivingTime: `~${tHours} h`,
        grossTime: `~${grossHours} h Reisetag`,
        type: "Transit / Anreise",
        fatigue: currentStageKm > 450 ? "🟡 Kilometeretappe" : "🔵 Zügige Anfahrt",
        highlight: `Anfahrt ab ${fromName} über Autobahn & Überlandachsen`,
        advice: tIdx === 0 && finderState.startTime === "late"
          ? "🌇 Später Aufbruch: Entspannte Feierabend-Etappe, frühzeitig ins Hotel/auf den Stellplatz einchecken."
          : (vehicle === "wohnmobil" ? "Früh starten, um vor 17:00 Uhr am Stellplatz zu sein." : "Konstantes Reisetempo halten und alle 2 Stunden kurze Trinkpause.")
      });
      currentDay++;
    }
  }

  // Tour Stages
  const poiStep = poiNames.length / numTourStages;
  for (let sIdx = 0; sIdx < numTourStages; sIdx++) {
    const fromPoi = poiNames[Math.floor(sIdx * poiStep)];
    let toPoi = poiNames[Math.min(poiNames.length - 1, Math.floor((sIdx + 1) * poiStep))];
    if (fromPoi === toPoi && sIdx > 0) toPoi = `${toPoi} (Umland / Pässe)`;

    const hours = (stageKm / realSpeed).toFixed(1);
    const grossHours = (parseFloat(hours) * (isAlpine ? 1.4 : 1.25)).toFixed(1);
    const fatigue = isAlpine ? "🟡 Hochkonzentration (Pässe)" : isOffroad ? "🟡 Physisch fordernd (Piste)" : "🔵 Reiner Flow";

    let advice = "";
    if (vehicle === "wohnmobil") {
      advice = isAlpine
        ? "⚠️ Gefälle & Kehren: Konsequent 2. Gang nutzen! Vor 16:30 Uhr am Stellplatz sein (V/E & Strom)."
        : "Entspannte Camper-Etappe mit Zeit für Natur & regionale Einkäufe.";
    } else if (vehicle === "bikepacking") {
      advice = isAlpine
        ? "⛰️ Starke Höhenmeter: Ruhige Trittfrequenz am Berg, regelmäßig Riegel nachschieben."
        : "Schöner Gravel-Rhythmus, Trinkblase & Wasserfilter bereithalten.";
    } else {
      advice = isAlpine
        ? "🏍️ Über 1.500 Kurven: Handgelenke lockern, Blick weit in den Kurvenausgang richten."
        : "Wunderbarer Landstraßen-Flow mit Zeit für entspannte Café-Stopps.";
    }

    days.push({
      day: currentDay,
      title: `Tag ${currentDay}: ${fromPoi} ➔ ${toPoi}`,
      from: fromPoi,
      to: toPoi,
      km: stageKm,
      drivingTime: `~${hours} h (${realSpeed} km/h Schnitt)`,
      grossTime: `~${grossHours} h mit Pausen`,
      type: isAlpine ? "Hochalpen- & Pass-Etappe" : isOffroad ? "Offroad / Adventure-Etappe" : "Panorama-Etappe",
      fatigue: fatigue,
      highlight: `Traumstrecke von ${fromPoi} über Pässe & Aussichtspunkte nach ${toPoi}`,
      advice: advice
    });
    currentDay++;

    // Stehtag / Ruhetag einschieben
    if (restDayFreq && (sIdx + 1) % restDayFreq === 0 && sIdx < numTourStages - 1) {
      days.push({
        day: currentDay,
        title: `Tag ${currentDay}: ⛺ Ruhetag & Erholung in ${toPoi}`,
        from: toPoi,
        to: toPoi,
        km: 0,
        drivingTime: "0 h (Fahrzeug bleibt stehen)",
        grossTime: "Ganzer Tag frei",
        type: "Erholungs- & Stehtag",
        fatigue: "🟢 Regeneration & Entspannung",
        highlight: "Tag zur freien Verfügung: See, kleine Wanderung, lokale Kulinarik & Durchatmen",
        advice: vehicle === "wohnmobil" ? "Fahrzeug lüften, V/E erledigen, entspannt kochen & relaxen." : "Muskeln regenerieren, Kette fetten & Ausrüstung prüfen."
      });
      currentDay++;
    }
  }

  // Return Leg (360° Rückkehr ohne Backtracking)
  const returnKm = (returnLoop && returnLoop.km) ? returnLoop.km : (transitKm > 0 ? transitKm : stageKm);
  const rSpeed = vehicle === "wohnmobil" ? 85 : vehicle === "bikepacking" ? 18 : 105;
  const rHours = (returnKm / rSpeed).toFixed(1);

  days.push({
    day: currentDay,
    title: `Tag ${currentDay}: Rückreise zurück nach ${riderStart.name}`,
    from: poiNames[poiNames.length - 1],
    to: riderStart.name,
    km: returnKm,
    drivingTime: `~${rHours} h`,
    grossTime: "Heimfahrt",
    type: "360°-Rückkehr (Kein Backtracking)",
    fatigue: "🔵 Zufriedene Heimkehr",
    highlight: returnLoop && returnLoop.passes && returnLoop.passes.length
      ? `Alternative Rückschleife über ${returnLoop.passes.map(p => p.name).join(" & ")}`
      : `Heimfahrt nach ${riderStart.name} auf alternativer Nebenroute`,
    advice: "Letzte Etappe entspannt genießen und Tour Revue passieren lassen."
  });

  return days;
}

function applyItineraryToReiseplaner(routeId) {
  const r = (DB.routes || []).find(x => x.id === routeId);
  if (!r) return;

  const riderStart = getRiderStart();
  const returnLoop = calculateReturnLoopLeg(riderStart, r, finderState);
  const itinerary = buildRealisticItinerary(r, finderState.vehicle, finderState.pace, riderStart, returnLoop);

  const reisen = getReisen();
  const newReiseId = Date.now().toString(36);
  const vehicleLabel = finderState.vehicle === "wohnmobil" ? "Wohnmobil" : finderState.vehicle === "bikepacking" ? "Bikepacking" : "Motorrad";

  const newReise = {
    id: newReiseId,
    name: `${r.name} (${itinerary.length} Tage ${vehicleLabel})`,
    zeitraum: `${itinerary.length} Reisetage · Start ab ${riderStart.name}`,
    typ: vehicleLabel,
    notiz: `Automatisch generierter, realistischer Etappenplan basierend auf empirischen Berg- und Geländegeschwindigkeiten.`,
    etappen: itinerary.map(day => ({
      routeId: r.id,
      routeName: day.title,
      km: `${day.km} km`,
      zeit: day.drivingTime,
      hm: day.type,
      pois: [day.from, day.to],
      notiz: `${day.fatigue} · ${day.highlight}. Tipp: ${day.advice}`
    }))
  };

  reisen.unshift(newReise);
  saveReisen(reisen);

  closeModal();
  showView("planer");
  renderReisen();

  alert(`✅ Der realistische ${itinerary.length}-Tage-Etappenplan wurde erfolgreich in deinen Reiseplaner übertragen!`);
}

function printItinerary(routeId) {
  const r = (DB.routes || []).find(x => x.id === routeId);
  if (!r) return;
  const riderStart = getRiderStart();
  const returnLoop = calculateReturnLoopLeg(riderStart, r, finderState);
  const itinerary = buildRealisticItinerary(r, finderState.vehicle, finderState.pace, riderStart, returnLoop);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const vehicleName = finderState.vehicle === "wohnmobil" ? "Wohnmobil / Camper" : finderState.vehicle === "bikepacking" ? "Bikepacking / Reiserad" : "Motorrad";

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="utf-8">
      <title>Tagesetappen: ${r.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; color: #1e293b; line-height: 1.5; }
        h1 { margin-bottom: .3rem; color: #0f172a; }
        .sub { color: #64748b; margin-bottom: 1.5rem; font-size: .95rem; }
        .day-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; page-break-inside: avoid; }
        .day-title { font-weight: bold; font-size: 1.1rem; color: #0f172a; margin-bottom: .4rem; }
        .day-meta { display: flex; gap: 1.5rem; font-size: .9rem; color: #475569; margin-bottom: .4rem; }
        .day-meta b { color: #0f172a; }
        .day-advice { font-size: .85rem; background: #f8fafc; border-left: 3px solid #3b82f6; padding: .4rem .8rem; margin-top: .4rem; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <div>
          <h1>${r.name} · Realistischer Etappenplan</h1>
          <div class="sub">Reiseform: <b>${vehicleName}</b> · Start &amp; Ziel: <b>${riderStart.name}</b> · Reisedauer: <b>${itinerary.length} Tage</b></div>
        </div>
        <button onclick="window.print()" style="padding:.6rem 1.2rem;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold">🖨️ Drucken / PDF</button>
      </div>
      <div>
        ${itinerary.map(d => `
          <div class="day-card">
            <div class="day-title">${d.title}</div>
            <div class="day-meta">
              <span>🛣️ Distanz: <b>${d.km} km</b></span>
              <span>⏱️ Fahrzeit: <b>${d.drivingTime}</b></span>
              <span>⏱️ Reisetag: <b>${d.grossTime}</b></span>
              <span>⚡ Status: <b>${d.fatigue}</b></span>
            </div>
            <div style="font-size:.9rem;margin-bottom:.3rem">📍 <b>Verlauf:</b> ${d.highlight}</div>
            <div class="day-advice">💡 <b>Praxistipp:</b> ${d.advice}</div>
          </div>
        `).join("")}
      </div>
    </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
}

function openRoutePreviewModal(routeId) {
  const r = (DB.routes || []).find(x => x.id === routeId);
  if (!r) return;

  const riderStart = getRiderStart();

  // Determine route track
  let routeTrack = [];
  if (window.ROUTE_TRACKS && window.ROUTE_TRACKS[r.id] && window.ROUTE_TRACKS[r.id].length >= 2) {
    routeTrack = window.ROUTE_TRACKS[r.id];
  } else if (r.pois && r.pois.length >= 2) {
    routeTrack = r.pois.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
  }

  let routeStartCoords = routeTrack.length ? routeTrack[0] : (window.DB && window.DB.routeGeo && window.DB.routeGeo[r.id]);
  if (!routeStartCoords) routeStartCoords = [47.5, 11.5];

  if (!routeTrack.length) {
    routeTrack = [
      routeStartCoords,
      [routeStartCoords[0] + 0.35, routeStartCoords[1] + 0.45],
      [routeStartCoords[0] + 0.15, routeStartCoords[1] + 0.8]
    ];
  }

  const endCoords = routeTrack[routeTrack.length - 1];
  const transit = estimateTransit(riderStart.coords, routeStartCoords);
  const corridorPasses = findPassesNearRoute(routeTrack, 85);

  // 360-Grad Rundreise: Berechnung der alternativen Rückschleife
  const returnLoop = calculateReturnLoopLeg(riderStart, r, finderState);
  const tourKm = parseInt((r.distance || "100").replace(/\D/g, ""), 10) || 100;
  const totalTripKm = transit.km + tourKm + returnLoop.km;
  const recPace = r.recommendedDailyKm || 180;
  const totalDaysNeeded = Math.max(1, Math.round(totalTripKm / recPace));

  const vehicleName = finderState.vehicle === "wohnmobil" ? "Wohnmobil" : finderState.vehicle === "bikepacking" ? "Bikepacking" : "Motorrad";
  const paceLabel = PACE_LABELS[finderState.pace] || finderState.pace;
  const itinerary = buildRealisticItinerary(r, finderState.vehicle, finderState.pace, riderStart, returnLoop);

  const passesChips = corridorPasses.map(p => {
    const lvl = p.levelAsphalt || p.levelOffroad || "";
    return `<span class="preview-pass-chip" onclick="focusPreviewPass(${p.lat}, ${p.lng}, '${escapeHtml(p.name)}')">🏔️ ${escapeHtml(p.name)} (${p.altitude.toLocaleString("de")} m${lvl ? ' · ' + lvl : ''})</span>`;
  }).join("");

  // External Navigation URLs als vollständige 360-Grad Rundreise
  const kurvigerWpts = [
    riderStart.coords,
    routeStartCoords,
    endCoords,
    ...(returnLoop.passes.map(p => [p.lat, p.lng])),
    riderStart.coords
  ];
  const kurvigerUrl = `https://kurviger.de/?` + kurvigerWpts.map(pt => `point=${pt[0]}%2C${pt[1]}`).join("&") + `&locale=de&vehicle=motorcycle`;

  const gmapsWpts = [routeStartCoords, endCoords, ...(returnLoop.passes.map(p => [p.lat, p.lng]))].map(pt => `${pt[0]},${pt[1]}`).join("|");
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${riderStart.coords[0]},${riderStart.coords[1]}&destination=${riderStart.coords[0]},${riderStart.coords[1]}&waypoints=${encodeURIComponent(gmapsWpts)}&travelmode=driving`;

  const modalBody = document.getElementById("modalBody");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="preview-modal-wrap">
      <div class="md-head" style="margin-bottom:.4rem">
        <span style="font-size:2.2rem">🔄</span>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.4rem">
            <h2 style="margin:0">${escapeHtml(r.name)} · 360°-Rundreise</h2>
            <span id="routeNavStatus" class="nav-routing-badge">⚡ Sofort-Kartenansicht geladen</span>
          </div>
          <div class="md-sub">📍 ${withFlag(r.countries)} · Start & Ziel: ${escapeHtml(riderStart.name)}</div>
        </div>
      </div>

      <!-- 360-Grad Rundreise Breakdown Bar -->
      <div class="roundtrip-breakdown-bar">
        <span class="leg-pill leg-hin">🟠 Hinreise: ~${transit.km.toLocaleString("de")} km</span>
        <span class="leg-pill leg-tour">🔵 ${escapeHtml(r.name)}: ~${tourKm.toLocaleString("de")} km</span>
        <span class="leg-pill leg-rueck">🟢 Alternative Rückreise: ~${returnLoop.km.toLocaleString("de")} km</span>
        <span class="leg-pill leg-total">🏁 360°-Gesamt: ~${totalTripKm.toLocaleString("de")} km (${totalDaysNeeded} Tage)</span>
      </div>

      ${returnLoop.passes.length ? `
      <div style="font-size:.82rem;color:#06d6a0;margin:-.2rem 0 .7rem;display:flex;align-items:center;gap:.4rem">
        <span>🔄 <b>Kriterien-Rückweg über Traumpässe:</b> ${returnLoop.passes.map(p => `<b>${escapeHtml(p.name)}</b> (${withFlag(p.country)} · ${p.altitude.toLocaleString("de")} m${p.levelAsphalt ? ' · ' + p.levelAsphalt : ''})`).join(" & ")}</span>
      </div>
      ` : ""}

      <!-- Navigation & Distance Stats -->
      <div class="preview-stats-grid">
        <div class="preview-stat-item">
          <label>Start & Ziel</label>
          <span class="green">📍 ${escapeHtml(riderStart.name)}</span>
        </div>
        <div class="preview-stat-item">
          <label>Hinweg (Orange)</label>
          <span class="accent" id="transitStatKm">~${transit.km.toLocaleString("de")} km (${transit.timeStr})</span>
        </div>
        <div class="preview-stat-item">
          <label>Tourstrecke (Blau)</label>
          <span>${escapeHtml(r.distance || "–")}</span>
        </div>
        <div class="preview-stat-item">
          <label>Rückweg (Grün)</label>
          <span style="color:#06d6a0;font-weight:700" id="returnStatKm">~${returnLoop.km.toLocaleString("de")} km (${returnLoop.timeStr})</span>
        </div>
        <div class="preview-stat-item">
          <label>Gesamt ab Haustür</label>
          <span class="accent" id="totalTripStatKm">~${totalTripKm.toLocaleString("de")} km (${totalDaysNeeded} Tage)</span>
        </div>
      </div>

      <!-- Interactive Route Map -->
      <div id="routePreviewMap"></div>

      <!-- 1-Click Navigation Hub -->
      <div class="nav-hub-box">
        <div class="nav-hub-header">
          <div class="nav-hub-title">📱 360°-Rundreise auf deinem Handy / Navi starten (Kein Backtracking):</div>
          <span style="font-size:.76rem;color:var(--muted)">1-Klick Übergabe aller Hin- & Rückwegpunkte</span>
        </div>
        <div class="nav-hub-actions">
          <a class="nav-hub-btn kurviger" href="${kurvigerUrl}" target="_blank" rel="noopener">
            🏍️ In Kurviger öffnen (360° Runde)
          </a>
          <a class="nav-hub-btn google-maps" href="${googleMapsUrl}" target="_blank" rel="noopener">
            🗺️ Google Maps Navigation
          </a>
          <button class="nav-hub-btn calimoto" onclick="downloadRouteGpxWithStart('${r.id}')">
            📥 GPX Multi-Track herunterladen
          </button>
        </div>
      </div>

      <!-- Live-Bergwetter Box -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem;margin:1rem 0">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem">
          <div style="font-weight:700;font-size:.95rem;color:var(--text)">🌤️ Live-Bergwetter &amp; Schneewarnungen</div>
          <button class="btn btn-sm" onclick="loadModalLiveWeather(${routeStartCoords[0]}, ${routeStartCoords[1]}, 'modalWeatherBox', ${parseInt(r.elevation || '0')})">
            🔄 Wetter live laden
          </button>
        </div>
        <div id="modalWeatherBox">
          <div style="font-size:.82rem;color:var(--muted)">Klicke auf „Wetter live laden“, um die 5-Tage-Vorhersage von Open-Meteo für diese Route abzurufen.</div>
        </div>
      </div>

      <!-- Realistischer Etappen- & Tagesplaner -->
      <div class="itinerary-accordion-box" style="margin:1rem 0;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--bg2)">
        <div style="padding:.9rem 1.1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem;cursor:pointer;background:rgba(255,255,255,0.03)" onclick="document.getElementById('itineraryDayList').classList.toggle('hidden')">
          <div>
            <div style="font-weight:700;font-size:1.05rem;color:var(--text);display:flex;align-items:center;gap:.5rem">
              <span>📅 Realistischer Etappenplan (${itinerary.length} Reisetage)</span>
              <span class="rec-card-badge" style="background:#3b82f6;color:#fff">${vehicleName}</span>
            </div>
            <div style="font-size:.8rem;color:var(--muted);margin-top:.2rem">
              Empirisch berechnet nach Berg-/Landstraßen-Schnitt, Tageslenkzeit &amp; Erholungstagen (Klick zum Aufklappen)
            </div>
          </div>
          <div style="display:flex;gap:.4rem;align-items:center">
            <button class="btn btn-sm" onclick="event.stopPropagation();printItinerary('${r.id}')">🖨️ Drucken / PDF</button>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();applyItineraryToReiseplaner('${r.id}')">➕ In Reiseplaner übernehmen</button>
          </div>
        </div>

        <div id="itineraryDayList" class="itinerary-day-list" style="padding:.8rem 1rem;border-top:1px solid var(--border)">
          ${itinerary.map(d => `
            <div class="itinerary-stage-card" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.75rem .9rem;margin-bottom:.65rem">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.4rem;margin-bottom:.3rem">
                <span style="font-weight:700;font-size:.92rem;color:var(--text)">${d.title}</span>
                <span style="font-size:.75rem;padding:.15rem .45rem;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--muted)">${d.fatigue}</span>
              </div>
              <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:.8rem;color:var(--text-muted);margin-bottom:.35rem">
                <span>🛣️ <b>${d.km} km</b></span>
                <span>⏱️ <b>${d.drivingTime}</b></span>
                <span>⏱️ <b>${d.grossTime}</b></span>
                <span>🏞️ ${d.type}</span>
              </div>
              <div style="font-size:.82rem;line-height:1.4;margin-bottom:.35rem">
                📍 <b>Strecke:</b> ${escapeHtml(d.highlight)}
              </div>
              <div style="font-size:.78rem;background:rgba(59,130,246,0.07);border-left:3px solid var(--blue);padding:.35rem .6rem;border-radius:0 6px 6px 0;color:var(--text)">
                💡 <b>Praxis-Tipp:</b> ${escapeHtml(d.advice)}
              </div>
            </div>
          `).join("")}
        </div>
      </div>


      <!-- Nearby passes in corridor -->
      ${corridorPasses.length ? `
      <div class="preview-passes-wrap">
        <div class="preview-passes-title">🏔️ Spektakuläre Pässe entlang dieser Route:</div>
        <div class="preview-passes-chips">${passesChips}</div>
      </div>
      ` : ""}

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem;margin-top:.4rem">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="quickAddRouteToReise('${r.id}')">➕ Zu Reiseplaner</button>
          <button class="btn" onclick="openRouteModal('${r.id}')">📋 Route Details</button>
          <button class="btn" onclick="focusRouteOnMap('${r.id}');closeModal()">🗺️ Große Karte</button>
        </div>
        <button class="btn" onclick="closeModal()">✕ Schließen</button>
      </div>
    </div>
  `;

  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Sofortige Karteninitialisierung ohne Blockieren
  setTimeout(() => {
    initRoutePreviewMap(riderStart, routeStartCoords, routeTrack, corridorPasses, r, returnLoop);
  }, 40);
}

async function initRoutePreviewMap(riderStart, routeStartCoords, routeTrack, corridorPasses, routeObj, returnLoop) {
  if (_previewMapInstance) {
    _previewMapInstance.remove();
    _previewMapInstance = null;
  }

  const mapEl = document.getElementById("routePreviewMap");
  if (!mapEl || !window.L) return;

  const map = L.map("routePreviewMap", { zoomControl: true });
  _previewMapInstance = map;

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "© Esri, DeLorme, NAVTEQ"
  }).addTo(map);

  const allBounds = [];

  // 1. Rider Start Beacon Marker
  const startIcon = L.divIcon({
    className: "custom-beacon-div",
    html: `<div class="start-beacon-icon" title="Start & Ziel: ${escapeHtml(riderStart.name)}">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const startMarker = L.marker(riderStart.coords, { icon: startIcon }).addTo(map);
  startMarker.bindPopup(`<b>📍 Start & Ziel: ${escapeHtml(riderStart.name)}</b><br>Ausgangs- und Endpunkt der 360°-Rundreise`).openPopup();
  allBounds.push(riderStart.coords);

  // 2. SOFORTIGE ANZEIGE ALLER 3 SCHLEIFEN (0 ms Verzögerung!)
  const initialApproachPts = [riderStart.coords, routeStartCoords];
  const approachLine = L.polyline(initialApproachPts, {
    color: "#ff6b35",
    weight: 5,
    opacity: 0.95,
    lineCap: "round",
    lineJoin: "round"
  }).addTo(map);
  approachLine.bindPopup(`<b>🟠 Hinreise ab ${escapeHtml(riderStart.name)}</b><br>Anfahrt zur Tour`);
  initialApproachPts.forEach(pt => allBounds.push(pt));

  const initialTourPts = (routeTrack && routeTrack.length >= 2) ? routeTrack : [routeStartCoords, [routeStartCoords[0] + 0.2, routeStartCoords[1] + 0.2]];
  const tourLine = L.polyline(initialTourPts, {
    color: "#2563eb",
    weight: 6,
    opacity: 0.9,
    lineCap: "round",
    lineJoin: "round"
  }).addTo(map);
  tourLine.bindPopup(`<b>🔵 ${escapeHtml(routeObj.name)}</b><br>${routeObj.distance || ''} · ${routeObj.duration || ''}`);
  initialTourPts.forEach(pt => allBounds.push(pt));

  const initialReturnPts = returnLoop ? returnLoop.coords : [initialTourPts[initialTourPts.length - 1], riderStart.coords];
  const returnLine = L.polyline(initialReturnPts, {
    color: "#06d6a0",
    weight: 5,
    opacity: 0.95,
    lineCap: "round",
    lineJoin: "round"
  }).addTo(map);
  returnLine.bindPopup(`<b>🟢 Alternative Rückreise nach ${escapeHtml(riderStart.name)}</b><br>${returnLoop ? escapeHtml(returnLoop.label) : 'Rückschleife'}`);
  initialReturnPts.forEach(pt => allBounds.push(pt));

  // 3. Endpoint / Wendepunkt Marker
  const endCoords = initialTourPts[initialTourPts.length - 1];
  const endIcon = L.divIcon({
    className: "custom-end-div",
    html: `<div class="route-endpoint-icon" title="Wendepunkt / Start Rückweg">🔄</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  L.marker(endCoords, { icon: endIcon }).addTo(map).bindPopup(`<b>🔄 Wendepunkt / Start der alternativen Rückreise</b><br>${returnLoop ? escapeHtml(returnLoop.label) : ''}`);

  // 4. Corridor Passes Markers
  const allPasses = [...corridorPasses, ...(returnLoop && returnLoop.passes ? returnLoop.passes : [])];
  allPasses.forEach(pass => {
    const isReturnPass = returnLoop && returnLoop.passes && returnLoop.passes.some(rp => rp.id === pass.id);
    const passIcon = L.divIcon({
      className: "custom-pass-div",
      html: `<div class="pass-pin-icon" style="${isReturnPass ? 'background:rgba(6,214,160,0.25);border-color:#06d6a0' : ''}" title="${escapeHtml(pass.name)}">${isReturnPass ? '🔄' : '🏔️'}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    const pMarker = L.marker([pass.lat, pass.lng], { icon: passIcon }).addTo(map);
    const lvl = pass.levelAsphalt || pass.levelOffroad || "";
    pMarker.bindPopup(`
      <b>${isReturnPass ? '🔄 Rückreise-Pass: ' : '🏔️ '} ${escapeHtml(pass.name)}</b><br>
      ${withFlag(pass.country)}<br>
      ⛰️ Höhe: ${pass.altitude.toLocaleString("de")} m<br>
      ${lvl ? '🚦 Level: ' + lvl + '<br>' : ''}
      <a href="javascript:void(0)" onclick="openPassModal('${pass.id}')" style="color:var(--accent);font-weight:700">Pass-Details öffnen ➔</a>
    `);
    allBounds.push([pass.lat, pass.lng]);
  });

  // Fit bounds SOFORT (Karte ist in unter 30 ms komplett sichtbar)
  map.fitBounds(allBounds, { padding: [35, 35] });
  setTimeout(() => map.invalidateSize(), 80);

  // 5. ASYNCHRON IM HINTERGRUND: OSRM Details für Hin-, Tour- und Rückweg abrufen
  const statusBadge = document.getElementById("routeNavStatus");
  if (statusBadge) statusBadge.textContent = "🟢 360°-Rundreise aktiv (OSRM lädt Kurven…)";

  Promise.allSettled([
    fetchOsrmRouteWithDetails([{ lat: riderStart.coords[0], lng: riderStart.coords[1] }, { lat: routeStartCoords[0], lng: routeStartCoords[1] }], 1800),
    (routeObj.pois && routeObj.pois.length >= 2) ? fetchOsrmRoute(routeObj.pois, 2000) : Promise.resolve(null),
    fetchOsrmRouteWithDetails((returnLoop ? returnLoop.coords : initialReturnPts).map(c => ({ lat: c[0], lng: c[1] })), 1800)
  ]).then(([osrmApproachRes, osrmTourRes, osrmReturnRes]) => {
    let actualTransitKm = null;
    let actualTransitMin = null;
    let actualReturnKm = null;
    let actualReturnMin = null;

    if (osrmApproachRes.status === "fulfilled" && osrmApproachRes.value && osrmApproachRes.value.pts) {
      approachLine.setLatLngs(osrmApproachRes.value.pts);
      actualTransitKm = osrmApproachRes.value.distKm;
      actualTransitMin = osrmApproachRes.value.durMin;
      const statEl = document.getElementById("transitStatKm");
      if (statEl) {
        const hours = Math.floor(actualTransitMin / 60);
        const mins = actualTransitMin % 60;
        statEl.textContent = `${actualTransitKm.toLocaleString("de")} km (${hours > 0 ? hours + ' h ' + mins + ' min' : mins + ' min'})`;
      }
    }

    if (osrmTourRes.status === "fulfilled" && osrmTourRes.value && osrmTourRes.value.length >= 2) {
      tourLine.setLatLngs(osrmTourRes.value);
    }

    if (osrmReturnRes.status === "fulfilled" && osrmReturnRes.value && osrmReturnRes.value.pts) {
      returnLine.setLatLngs(osrmReturnRes.value.pts);
      actualReturnKm = osrmReturnRes.value.distKm;
      actualReturnMin = osrmReturnRes.value.durMin;
      const returnStatEl = document.getElementById("returnStatKm");
      if (returnStatEl) {
        const hours = Math.floor(actualReturnMin / 60);
        const mins = actualReturnMin % 60;
        returnStatEl.textContent = `${actualReturnKm.toLocaleString("de")} km (${hours > 0 ? hours + ' h ' + mins + ' min' : mins + ' min'})`;
      }
    }

    const tKm = actualTransitKm || estimateTransit(riderStart.coords, routeStartCoords).km;
    const tourKm = parseInt((routeObj.distance || "100").replace(/\D/g, ""), 10) || 100;
    const rKm = actualReturnKm || (returnLoop ? returnLoop.km : estimateTransit(endCoords, riderStart.coords).km);
    const totalKm = tKm + tourKm + rKm;
    const recPace = routeObj.recommendedDailyKm || 180;
    const totalDays = Math.max(1, Math.round(totalKm / recPace));

    const totalStatEl = document.getElementById("totalTripStatKm");
    if (totalStatEl) totalStatEl.textContent = `~${totalKm.toLocaleString("de")} km (${totalDays} Tage)`;

    if (statusBadge) statusBadge.textContent = "🟢 Echte Kurven- & Straßenroute aktiv";
  }).catch(() => {});
}

function downloadRouteGpxWithStart(routeId) {
  const r = (DB.routes || []).find(x => x.id === routeId);
  if (!r) return;
  const riderStart = getRiderStart();
  let routeTrack = (r.pois && r.pois.length >= 2)
    ? r.pois.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng])
    : [DB.routeGeo[r.id] || [47.5, 11.5]];

  const returnLoop = calculateReturnLoopLeg(riderStart, r, finderState);
  const xmlSafe = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Motorradreise-Sammler" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${xmlSafe(r.name)} - 360° Rundreise (ab ${xmlSafe(riderStart.name)})</name>
    <desc>Geschlossene 360°-Motorrad-Rundreise ab ${xmlSafe(riderStart.name)} mit separatem Hin- und Rückweg (Kein Backtracking). Perfekt für Calimoto, Kurviger und Navis.</desc>
  </metadata>
  <wpt lat="${riderStart.coords[0]}" lon="${riderStart.coords[1]}">
    <name>Start &amp; Ziel: ${xmlSafe(riderStart.name)}</name>
    <desc>Ausgangs- und Endpunkt der Rundreise</desc>
  </wpt>
  ${returnLoop.passes.map(p => `
  <wpt lat="${p.lat}" lon="${p.lng}">
    <name>Rückreise-Pass: ${xmlSafe(p.name)} (${p.altitude}m)</name>
    <desc>Passhighlight auf dem Rückweg</desc>
  </wpt>`).join("")}
  <trk>
    <name>Etappe 1: Hinreise ab ${xmlSafe(riderStart.name)}</name>
    <trkseg>
      <trkpt lat="${riderStart.coords[0]}" lon="${riderStart.coords[1]}"></trkpt>
      <trkpt lat="${routeTrack[0][0]}" lon="${routeTrack[0][1]}"></trkpt>
    </trkseg>
  </trk>
  <trk>
    <name>Etappe 2: ${xmlSafe(r.name)} (Tourstrecke)</name>
    <trkseg>
      ${routeTrack.map(pt => `<trkpt lat="${pt[0]}" lon="${pt[1]}"></trkpt>`).join("\n      ")}
    </trkseg>
  </trk>
  <trk>
    <name>Etappe 3: Alternative Rückreise nach ${xmlSafe(riderStart.name)}</name>
    <trkseg>
      ${returnLoop.coords.map(pt => `<trkpt lat="${pt[0]}" lon="${pt[1]}"></trkpt>`).join("\n      ")}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxContent], { type: "application/gpx+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeCityName = riderStart.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  a.download = `${r.id}_360_rundreise_ab_${safeCityName}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function focusPreviewPass(lat, lng, name) {
  if (_previewMapInstance) {
    _previewMapInstance.setView([lat, lng], 10, { animate: true });
  }
}

function renderRecommendedPasses(passList) {
  const grid = document.getElementById("finderPassGrid");
  const countBadge = document.getElementById("finderPassCount");
  if (!grid) return;

  if (countBadge) countBadge.textContent = (passList || []).length;

  if (!passList || passList.length === 0) {
    grid.innerHTML = `<p class="hint">Keine spezifischen Pässe für diese Kombination vorgeschlagen.</p>`;
    return;
  }

  grid.innerHTML = passList.map(p => buildPassCard(p, false)).join("");
}

function focusRouteOnMap(routeId) {
  showView("karte");
  setTimeout(() => {
    if (window.DB && window.DB.routeGeo && window.DB.routeGeo[routeId]) {
      const coords = window.DB.routeGeo[routeId];
      if (window.MAP_INSTANCE && coords && coords.length) {
        window.MAP_INSTANCE.setView([coords[0], coords[1]], 8);
      }
    }
  }, 120);
}

/* ============================================================
   BIKER-TOOLS — Packliste & Reisekosten-Rechner
   ============================================================ */
const PACKLIST_KEY = "mrs_packlist_v1";

function getPackListState() {
  try {
    return JSON.parse(localStorage.getItem(PACKLIST_KEY)) || {};
  } catch(e) {
    return {};
  }
}

function savePackListState(state) {
  localStorage.setItem(PACKLIST_KEY, JSON.stringify(state));
}

function togglePackItem(key) {
  const state = getPackListState();
  state[key] = !state[key];
  savePackListState(state);
  renderPackingList();
}

function resetPackingList() {
  if (confirm("Möchtest du alle gesetzten Haken in der Packliste zurücksetzen?")) {
    savePackListState({});
    renderPackingList();
  }
}

function renderPackingList() {
  const container = document.getElementById("packingListContainer");
  if (!container) return;

  const tripType = (document.getElementById("packTripType") || {}).value || "camping";
  const climate = (document.getElementById("packClimate") || {}).value || "alps";
  const state = getPackListState();

  const categories = [
    {
      id: "docs",
      name: "📄 Dokumente & Finanzen",
      items: [
        { id: "doc_pass", label: "Reisepass / Personalausweis (Gültigkeit > 6 Monate)" },
        { id: "doc_license", label: "Führerschein & ggf. Internationaler Führerschein" },
        { id: "doc_vehicle", label: "Fahrzeugschein (Zulassungsbescheinigung Teil I)" },
        { id: "doc_insurance", label: "Grüne Versicherungskarte (auf Gültigkeit für Zielländer prüfen!)" },
        { id: "doc_adac", label: "Schutzbrief / Auslandskrankenversicherung Notfallnummern" },
        { id: "doc_cash", label: "Zwei Kreditkarten (Visa/Mastercard) + Notfall-Bargeld in Landeswährung" },
        { id: "doc_keys", label: "Zweitschlüssel Motorrad (in getrennter Tasche mitführen)" }
      ]
    },
    {
      id: "tools",
      name: "🔧 Bike-Werkzeug & Pannen-Kit",
      items: [
        { id: "tool_tyre", label: "Reifenflickset (Stopfen + CO2-Kartuschen oder Mini-Kompressor)" },
        { id: "tool_multitool", label: "Motorrad-Bordwerkzeug (Inbus, Torx, passende Nüsse für Achsen)" },
        { id: "tool_chain", label: "Kettenspray & Kettenreiniger (falls Kette vorhanden)" },
        { id: "tool_tape", label: "Panzertape & Kabelbinder (Lebensretter bei Stürzen/abgebrochenen Hebeln)" },
        { id: "tool_wire", label: "Rödeldraht & 2-Komponenten-Knetmetall (Epoxidharz für gerissene Motordeckel)" },
        { id: "tool_fuse", label: "Ersatzsicherungen & etwas Elektrokabel" },
        { id: "tool_lamp", label: "Stirnlampe mit Rotlichtmodus für nächtliche Reparaturen" }
      ]
    },
    {
      id: "rider",
      name: "🦺 Motorrad-Ausrüstung & Bekleidung",
      items: [
        { id: "gear_suit", label: "Motorradkombi (Gore-Tex Textil oder Leder mit Regenkombi)" },
        { id: "gear_gloves_dry", label: "CE-zertifizierte Handschuhe (Sommer)" },
        { id: "gear_gloves_rain", label: "Wasserdichte Winter-/Regenhandschuhe (für hohe Pässe)" },
        { id: "gear_boots", label: "Wasserdichte Tourenstiefel" },
        { id: "gear_vest", label: "Warnweste nach EN ISO 20471 (Mitführpflicht in FR, IT, ES etc.)" },
        { id: "gear_earplugs", label: "Gehörschutz / Moto-Ohrstöpsel gegen Windgeräusche" },
        { id: "gear_visor", label: "Visierreiniger & Mikrofasertuch im Tankrucksack" }
      ]
    }
  ];

  if (climate === "alps") {
    categories[2].items.push(
      { id: "gear_thermal", label: "Merino-Thermo-Funktionsunterwäsche (für Pässe > 2.000 m)" },
      { id: "gear_windbreaker", label: "Winddichte Sturmhaube / Halskrause" },
      { id: "gear_pinlock", label: "Pinlock-Innenvisier gegen Beschlagen bei Kälte & Regen" }
    );
  }

  if (tripType === "camping") {
    categories.push({
      id: "camp",
      name: "🏕️ Camping- & Koch-Setup",
      items: [
        { id: "camp_tent", label: "Sturmfestes Zelt mit geringem Gestängemaß (< 50 cm)" },
        { id: "camp_mat", label: "Isolierende Schlafmatte (R-Wert >= 2.5 gegen Bodenkälte)" },
        { id: "camp_bag", label: "Schlafsack (Komfortbereich mind. 0–5°C für Gebirgsnächte)" },
        { id: "camp_stove", label: "Gaskocher / Benzinkocher + Feuerzeug" },
        { id: "camp_pot", label: "Campingtopf, Spork & scharfes Taschenmesser" },
        { id: "camp_power", label: "Wasserfeste Powerbank (> 20.000 mAh) & Ladekabel" },
        { id: "camp_drybags", label: "Wasserdichte Packsäcke mit Rollverschluss" }
      ]
    });
  }

  let totalItems = 0;
  let checkedItems = 0;

  let html = categories.map(cat => {
    let catItems = cat.items.map(it => {
      totalItems++;
      const isChecked = !!state[it.id];
      if (isChecked) checkedItems++;
      return `
        <label class="pack-item ${isChecked ? 'checked' : ''}" onclick="togglePackItem('${it.id}')">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation();togglePackItem('${it.id}')">
          <span>${escapeHtml(it.label)}</span>
        </label>
      `;
    }).join("");

    return `
      <div class="pack-category">
        <h4>${cat.name}</h4>
        <div>${catItems}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;

  const lbl = document.getElementById("packProgressLbl");
  if (lbl) {
    const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    lbl.textContent = `${checkedItems} von ${totalItems} eingepackt (${pct}%)`;
  }
}

function calculateTripCosts() {
  const km = parseFloat((document.getElementById("calcKm") || {}).value) || 0;
  const consumption = parseFloat((document.getElementById("calcConsumption") || {}).value) || 0;
  const fuelPrice = parseFloat((document.getElementById("calcFuelPrice") || {}).value) || 0;
  const days = parseInt((document.getElementById("calcDays") || {}).value) || 1;
  const accomCost = parseFloat((document.getElementById("calcAccomCost") || {}).value) || 0;
  const toll = parseFloat((document.getElementById("calcToll") || {}).value) || 0;
  const food = parseFloat((document.getElementById("calcFood") || {}).value) || 0;

  const fuelTotal = (km / 100) * consumption * fuelPrice;
  const accomTotal = accomCost * Math.max(0, days - 1);
  const foodTotal = food * days;
  const grandTotal = fuelTotal + accomTotal + toll + foodTotal;
  const perDay = days > 0 ? grandTotal / days : grandTotal;

  const fmt = val => val.toLocaleString("de", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const elFuel = document.getElementById("resFuel");
  const elAccom = document.getElementById("resAccom");
  const elToll = document.getElementById("resToll");
  const elFood = document.getElementById("resFood");
  const elDay = document.getElementById("resDay");
  const elTotal = document.getElementById("resTotal");

  if (elFuel) elFuel.textContent = fmt(fuelTotal);
  if (elAccom) elAccom.textContent = fmt(accomTotal);
  if (elToll) elToll.textContent = fmt(toll);
  if (elFood) elFood.textContent = fmt(foodTotal);
  if (elDay) elDay.textContent = fmt(perDay);
  if (elTotal) elTotal.textContent = fmt(grandTotal);
}

// Global Exports
window.selectStartRegion = selectStartRegion;
window.onCityInputChanged = onCityInputChanged;
window.selectQuickCity = selectQuickCity;
window.selectLevel = selectLevel;
window.selectPace = selectPace;
window.selectMonth = selectMonth;
window.selectDuration = selectDuration;
window.toggleStyleTag = toggleStyleTag;
window.toggleNoGo = toggleNoGo;
window.nextFinderStep = nextFinderStep;
window.prevFinderStep = prevFinderStep;
window.jumpFinderStep = jumpFinderStep;
window.calculateAndShowRecommendations = calculateAndShowRecommendations;
window.applyFinderSortAndFilter = applyFinderSortAndFilter;
window.toggleFinderSeasonFilter = toggleFinderSeasonFilter;
window.toggleBreakdown = toggleBreakdown;
window.renderFinder = renderFinder;
window.focusRouteOnMap = focusRouteOnMap;
window.updateLiveCounter = updateLiveCounter;
window.openRoutePreviewModal = openRoutePreviewModal;
window.focusPreviewPass = focusPreviewPass;
window.selectTourType = selectTourType;
window.downloadRouteGpxWithStart = downloadRouteGpxWithStart;
window.fetchOsrmRouteWithDetails = fetchOsrmRouteWithDetails;
window.showCamperTab = showCamperTab;
window.showAccommDetail = showAccommDetail;
window.togglePassConquered = togglePassConquered;
window.togglePassBucket = togglePassBucket;
window.renderPassTrackerStats = renderPassTrackerStats;
window.renderPackingList = renderPackingList;
window.togglePackItem = togglePackItem;
window.resetPackingList = resetPackingList;
window.calculateTripCosts = calculateTripCosts;





window.selectVehicle = selectVehicle;
window.selectAccommodation = selectAccommodation;
window.toggleMapAttractions = toggleMapAttractions;
window.updatePaceAndDurationForVehicle = updatePaceAndDurationForVehicle;
window.buildRealisticItinerary = buildRealisticItinerary;
window.applyItineraryToReiseplaner = applyItineraryToReiseplaner;
window.printItinerary = printItinerary;
window.useCurrentLocation = useCurrentLocation;
window.onCityInputChanged = onCityInputChanged;
window.selectCustomAddress = selectCustomAddress;
window.selectStartTime = selectStartTime;
window.selectAutobahnPref = selectAutobahnPref;
window.fetchLiveWeather = fetchLiveWeather;
window.loadModalLiveWeather = loadModalLiveWeather;
window.getCommunityReports = getCommunityReports;
window.saveCommunityReport = saveCommunityReport;
window.submitModalCommunityNote = submitModalCommunityNote;
window.renderModalCommunityReportsList = renderModalCommunityReportsList;

window.openImpressumModal = openImpressumModal;
window.openDatenschutzModal = openDatenschutzModal;
window.openDisclaimerModal = openDisclaimerModal;
window.openFeedbackModal = openFeedbackModal;
window.reportIssue = reportIssue;

window.applyQuickFinder = applyQuickFinder;
window.renderCarousels = renderCarousels;
window.setCarouselPassMode = setCarouselPassMode;
window.setCarouselHomeCity = setCarouselHomeCity;
window.useCurrentLocationForCarousel = useCurrentLocationForCarousel;
window.renderPassCarousel = renderPassCarousel;
window.toggleNavDropdown = toggleNavDropdown;
window.closeAllNavDropdowns = closeAllNavDropdowns;
window.selectNavView = selectNavView;
window.toggleMobileNav = toggleMobileNav;

function startDemoTour() {
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.style.display = 'none';
  showView('karte');
  setTimeout(() => {
    if (window.DB && window.DB.routes) {
      // Prioritize Alpenrunde or TET or first route
      let demoRoute = window.DB.routes.find(r => (r.name && r.name.toLowerCase().includes("grosse alpenrunde"))) 
                   || window.DB.routes.find(r => (r.name && r.name.toLowerCase().includes("tet")))
                   || window.DB.routes[0];
      if (demoRoute) {
        openRoutePreviewModal(demoRoute.id);
      }
    }
  }, 400);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("rydo_onboarding_v1")) {
    setTimeout(() => {
      const modal = document.getElementById('onboardingModal');
      if (modal) modal.style.display = 'flex';
      localStorage.setItem("rydo_onboarding_v1", "true");
    }, 800);
  }
});


function setRouteFilter(filterType, value) {
  const hiddenInput = document.getElementById('route' + filterType.charAt(0).toUpperCase() + filterType.slice(1) + 'Filter');
  if (hiddenInput) {
    hiddenInput.value = value;
  }
  
  // Update Pills UI
  const pillsContainer = document.getElementById('route' + filterType.charAt(0).toUpperCase() + filterType.slice(1) + 'Pills');
  if (pillsContainer) {
    const pills = pillsContainer.querySelectorAll('.filter-pill');
    pills.forEach(p => {
      if (p.getAttribute('onclick').includes(value)) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }
  
  if (typeof renderRoutesList === 'function') {
    renderRoutesList();
  }
}
