// Country name to flag emoji mapping
// Expanded list with more countries and regions
const COUNTRY_FLAGS = {
  // --- South Asia ---
  "India": "🇮🇳",
  "Pakistan": "🇵🇰",
  "Bangladesh": "🇧🇩",
  "Sri Lanka": "🇱🇰",
  "Nepal": "🇳🇵",
  "Bhutan": "🇧🇹",
  "Maldives": "🇲🇻",
  "Afghanistan": "🇦🇫",
  "South Asia": "🌏", // Región general

  // --- North America ---
  "United States": "🇺🇸",
  "USA": "🇺🇸",
  "Canada": "🇨🇦",
  "Mexico": "🇲🇽",

  // --- South & Central America & Caribbean ---
  "Argentina": "🇦🇷",
  "Brazil": "🇧🇷",
  "Chile": "🇨🇱",
  "Colombia": "🇨🇴",
  "Peru": "🇵🇪",
  "Ecuador": "🇪🇨",
  "Venezuela": "🇻🇪",
  "Bolivia": "🇧🇴",
  "Paraguay": "🇵🇾",
  "Uruguay": "🇺🇾",
  "Guyana": "🇬🇾",
  "Suriname": "🇸🇷",
  "Panama": "🇵🇦",
  "Costa Rica": "🇨🇷",
  "Nicaragua": "🇳🇮",
  "Honduras": "🇭🇳",
  "El Salvador": "🇸🇻",
  "Guatemala": "🇬🇹",
  "Belize": "🇧🇿",
  "Cuba": "🇨🇺",
  "Dominican Republic": "🇩🇴",
  "Puerto Rico": "🇵🇷",
  "Jamaica": "🇯🇲",
  "Haiti": "🇭🇹",
  "Bahamas": "🇧🇸",
  "Trinidad and Tobago": "🇹🇹",
  "Barbados": "🇧🇧",

  // --- Europe ---
  "Europe": "🇪🇺",
  "European Union": "🇪🇺",
  "United Kingdom": "🇬🇧",
  "UK": "🇬🇧",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Ireland": "🇮🇪",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "Portugal": "🇵🇹",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Iceland": "🇮🇸",
  "Greece": "🇬🇷",
  "Poland": "🇵🇱",
  "Czech Republic": "🇨🇿",
  "Czechia": "🇨🇿",
  "Hungary": "🇭🇺",
  "Romania": "🇷🇴",
  "Bulgaria": "🇧🇬",
  "Croatia": "🇭🇷",
  "Serbia": "🇷🇸",
  "Slovenia": "🇸🇮",
  "Slovakia": "🇸🇰",
  "Bosnia": "🇧🇦",
  "Montenegro": "🇲🇪",
  "Albania": "🇦🇱",
  "Macedonia": "🇲🇰",
  "Ukraine": "🇺🇦",
  "Russia": "🇷🇺",
  "Belarus": "🇧🇾",
  "Estonia": "🇪🇪",
  "Latvia": "🇱🇻",
  "Lithuania": "🇱🇹",
  "Moldova": "🇲🇩",
  "Malta": "🇲🇹",
  "Cyprus": "🇨🇾",
  "Luxembourg": "🇱🇺",
  "Monaco": "🇲🇨",
  "Andorra": "🇦🇩",

  // --- Asia (East & Southeast) ---
  "China": "🇨🇳",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "Korea": "🇰🇷",
  "North Korea": "🇰🇵",
  "Taiwan": "🇹🇼",
  "Hong Kong": "🇭🇰",
  "Macau": "🇲🇴",
  "Mongolia": "🇲🇳",
  "Indonesia": "🇮🇩",
  "Malaysia": "🇲🇾",
  "Philippines": "🇵🇭",
  "Singapore": "🇸🇬",
  "Thailand": "🇹🇭",
  "Vietnam": "🇻🇳",
  "Cambodia": "🇰🇭",
  "Laos": "🇱🇦",
  "Myanmar": "🇲🇲",
  "Burma": "🇲🇲",
  "Brunei": "🇧🇳",

  // --- Middle East & Central Asia ---
  "Turkey": "🇹🇷",
  "Israel": "🇮🇱",
  "Palestine": "🇵🇸",
  "Saudi Arabia": "🇸🇦",
  "United Arab Emirates": "🇦🇪",
  "UAE": "🇦🇪",
  "Iran": "🇮🇷",
  "Iraq": "🇮🇶",
  "Qatar": "🇶🇦",
  "Kuwait": "🇰🇼",
  "Bahrain": "🇧🇭",
  "Oman": "🇴🇲",
  "Yemen": "🇾🇪",
  "Jordan": "🇯🇴",
  "Lebanon": "🇱🇧",
  "Syria": "🇸🇾",
  "Kazakhstan": "🇰🇿",
  "Uzbekistan": "🇺🇿",
  "Azerbaijan": "🇦🇿",
  "Georgia": "🇬🇪",
  "Armenia": "🇦🇲",

  // --- Oceania ---
  "Australia": "🇦🇺",
  "New Zealand": "🇳🇿",
  "Fiji": "🇫🇯",
  "Papua New Guinea": "🇵🇬",

  // --- Africa ---
  "Egypt": "🇪🇬",
  "South Africa": "🇿🇦",
  "Nigeria": "🇳🇬",
  "Kenya": "🇰🇪",
  "Morocco": "🇲🇦",
  "Algeria": "🇩🇿",
  "Tunisia": "🇹🇳",
  "Libya": "🇱🇾",
  "Ethiopia": "🇪🇹",
  "Ghana": "🇬🇭",
  "Ivory Coast": "🇨🇮",
  "Senegal": "🇸🇳",
  "Cameroon": "🇨🇲",
  "Uganda": "🇺🇬",
  "Tanzania": "🇹🇿",
  "Zimbabwe": "🇿🇼",
  "Zambia": "🇿🇲",
  "Angola": "🇦🇴",
  "Congo": "🇨🇩",

  // --- Generic / Other ---
  "World": "🌍",
  "Earth": "🌍",
  "Global": "🌐"
};

function getCountryFlag(countryName) {
  if (!countryName) return null;
  
  // Try exact match first
  if (COUNTRY_FLAGS[countryName]) {
    return COUNTRY_FLAGS[countryName];
  }
  
  // Try case-insensitive match
  const normalized = countryName.trim();
  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country.toLowerCase() === normalized.toLowerCase()) {
      return flag;
    }
    
    // Check for "City, Country" format (e.g. "Mumbai, India")
    // This allows detection even if the exact string isn't just the country name
    if (normalized.toLowerCase().endsWith(country.toLowerCase())) {
       // Ensure it's a separate word (preceded by space or comma)
       const index = normalized.toLowerCase().lastIndexOf(country.toLowerCase());
       if (index > 0) {
         const charBefore = normalized.charAt(index - 1);
         if (charBefore === ' ' || charBefore === ',') {
           return flag;
         }
       }
    }
  }
  
  // Common mappings for different spellings
  const mappings = {
    "usa": "United States",
    "uk": "United Kingdom",
    "uae": "United Arab Emirates",
    "korea": "South Korea",
    "prc": "China",
    "roc": "Taiwan",
    "brasil": "Brazil",
    "espana": "Spain",
    "españa": "Spain",
    "deutschland": "Germany",
    "italia": "Italy",
    "nederland": "Netherlands",
    "turkiye": "Turkey",
    "türkiye": "Turkey"
  };
  
  const mappedName = mappings[normalized.toLowerCase()];
  if (mappedName && COUNTRY_FLAGS[mappedName]) {
    return COUNTRY_FLAGS[mappedName];
  }
  
  return null;
}