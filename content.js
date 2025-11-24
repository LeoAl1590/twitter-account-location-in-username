// Cache for user locations - persistent storage
let locationCache = new Map();
const CACHE_KEY = 'twitter_location_cache';
const CACHE_EXPIRY_DAYS = 30;
const BLOCKED_KEY = 'blocked_countries';

// Rate limiting settings
const requestQueue = [];
let isProcessingQueue = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;
const MAX_CONCURRENT_REQUESTS = 2;
let activeRequests = 0;
let rateLimitResetTime = 0;

let observer = null;
let extensionEnabled = true;
const TOGGLE_KEY = 'extension_enabled';
const DEFAULT_ENABLED = true;

// Lista de países bloqueados
let blockedCountriesSet = new Set();
const processingUsernames = new Set();

// --- Initialization & State Management ---

async function loadState() {
  try {
    const result = await chrome.storage.local.get([TOGGLE_KEY, BLOCKED_KEY]);
    extensionEnabled = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
    
    const blockedList = result[BLOCKED_KEY] || [];
    blockedCountriesSet = new Set(blockedList.map(c => c.toLowerCase()));
    
    console.log('Extension enabled:', extensionEnabled);
    console.log('Blocked countries loaded:', blockedCountriesSet.size);
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'extensionToggle') {
    extensionEnabled = request.enabled;
    if (extensionEnabled) {
      setTimeout(processUsernames, 500);
    } else {
      removeAllFlags();
    }
  } else if (request.type === 'updateBlocked') {
    const blockedList = request.countries || [];
    blockedCountriesSet = new Set(blockedList.map(c => c.toLowerCase()));
    removeAllFlags(); 
    processUsernames(); 
  }
});

// --- Caching Logic ---

async function loadCache() {
  try {
    if (!chrome.runtime?.id) return;
    const result = await chrome.storage.local.get(CACHE_KEY);
    if (result[CACHE_KEY]) {
      const now = Date.now();
      for (const [username, data] of Object.entries(result[CACHE_KEY])) {
        if (data.expiry && data.expiry > now && data.location !== null) {
          locationCache.set(username, data.location);
        }
      }
    }
  } catch (error) { console.log('Cache load skipped'); }
}

async function saveCache() {
  try {
    if (!chrome.runtime?.id) return;
    const cacheObj = {};
    const now = Date.now();
    const expiry = now + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    for (const [username, location] of locationCache.entries()) {
      cacheObj[username] = { location, expiry, cachedAt: now };
    }
    await chrome.storage.local.set({ [CACHE_KEY]: cacheObj });
  } catch (error) { console.log('Cache save skipped'); }
}

async function saveCacheEntry(username, location) {
  if (!chrome.runtime?.id) return;
  locationCache.set(username, location);
  if (!saveCache.timeout) {
    saveCache.timeout = setTimeout(async () => {
      await saveCache();
      saveCache.timeout = null;
    }, 5000);
  }
}

// --- Page Script Injection & API Calls ---

function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('pageScript.js');
  script.onload = function() { this.remove(); };
  (document.head || document.documentElement).appendChild(script);
  
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === '__rateLimitInfo') {
      rateLimitResetTime = event.data.resetTime;
    }
  });
}

async function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  if (rateLimitResetTime > 0) {
    const now = Math.floor(Date.now() / 1000);
    if (now < rateLimitResetTime) {
      setTimeout(processRequestQueue, 60000);
      return;
    }
    rateLimitResetTime = 0;
  }
  
  isProcessingQueue = true;
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - (now - lastRequestTime)));
    }
    
    const { screenName, resolve, reject } = requestQueue.shift();
    activeRequests++;
    lastRequestTime = Date.now();
    
    makeLocationRequest(screenName)
      .then(resolve).catch(reject)
      .finally(() => {
        activeRequests--;
        setTimeout(processRequestQueue, 200);
      });
  }
  isProcessingQueue = false;
}

function makeLocationRequest(screenName) {
  return new Promise((resolve, reject) => {
    const requestId = Date.now() + Math.random();
    const handler = (event) => {
      if (event.source !== window) return;
      if (event.data?.type === '__locationResponse' && event.data.requestId === requestId) {
        window.removeEventListener('message', handler);
        if (!event.data.isRateLimited) saveCacheEntry(screenName, event.data.location || null);
        resolve(event.data.location || null);
      }
    };
    window.addEventListener('message', handler);
    window.postMessage({ type: '__fetchLocation', screenName, requestId }, '*');
    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(null);
    }, 10000);
  });
}

async function getUserLocation(screenName) {
  if (locationCache.has(screenName)) {
    const cached = locationCache.get(screenName);
    if (cached !== null) return cached;
    locationCache.delete(screenName);
  }
  return new Promise((resolve, reject) => {
    requestQueue.push({ screenName, resolve, reject });
    processRequestQueue();
  });
}

// --- Helper Functions ---

function extractUsername(element) {
  const usernameElement = element.querySelector('[data-testid="UserName"], [data-testid="User-Name"]');
  if (usernameElement) {
    const links = usernameElement.querySelectorAll('a[href^="/"]');
    for (const link of links) {
      const match = link.getAttribute('href').match(/^\/([^\/\?]+)/);
      if (match && match[1] && !['home', 'explore', 'notifications'].includes(match[1])) {
        return match[1];
      }
    }
  }
  return null;
}

function getNormalizedCountryName(locationString) {
  if (!locationString) return null;
  if (COUNTRY_FLAGS[locationString]) return locationString;
  const normalized = locationString.trim().toLowerCase();
  for (const country of Object.keys(COUNTRY_FLAGS)) {
    if (country.toLowerCase() === normalized) return country;
  }
  return null;
}

function findInsertionPoint(usernameElement, screenName) {
    const userNameContainer = usernameElement.querySelector('[data-testid="UserName"], [data-testid="User-Name"]');
    if (!userNameContainer) return null;

    const allDivs = Array.from(userNameContainer.querySelectorAll('div'));
    const handleSection = allDivs.find(div => {
        const link = div.querySelector(`a[href="/${screenName}"]`);
        return link && link.textContent?.trim() === `@${screenName}`;
    });

    if (handleSection && handleSection.parentNode === userNameContainer) {
        return { parent: userNameContainer, ref: handleSection };
    }
    
    return { parent: userNameContainer, ref: null };
}

// --- Main Logic ---

async function addFlagToUsername(usernameElement, screenName) {
  if (usernameElement.dataset.flagAdded === 'true') return;
  
  if (processingUsernames.has(screenName)) {
    await new Promise(r => setTimeout(r, 500));
    return;
  }
  
  processingUsernames.add(screenName);
  usernameElement.dataset.flagAdded = 'processing';
  
  try {
    const location = await getUserLocation(screenName);
    if (!location) {
      usernameElement.dataset.flagAdded = 'failed';
      return;
    }

    const countryName = getNormalizedCountryName(location);
    const isBlocked = countryName && blockedCountriesSet.has(countryName.toLowerCase());
    
    let contentElement = null;

    if (isBlocked) {
        // --- CARTEL ROJO (Ahora con fuente correcta) ---
        contentElement = document.createElement('span');
        contentElement.textContent = `${countryName}`;
        contentElement.setAttribute('data-twitter-flag', 'true');
        
        // Estilos
        contentElement.style.backgroundColor = '#f4212e';
        contentElement.style.color = '#ffffff';
        contentElement.style.padding = '2px 8px';
        contentElement.style.borderRadius = '4px';
        contentElement.style.fontSize = '12px'; // Subí un poco el tamaño
        contentElement.style.fontWeight = '700';
        contentElement.style.marginLeft = '8px';
        contentElement.style.marginRight = '4px';
        contentElement.style.whiteSpace = 'nowrap';
        contentElement.style.verticalAlign = 'middle';
        contentElement.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        contentElement.style.letterSpacing = '0.2px';
        
        // ESTA ES LA LÍNEA NUEVA PARA LA FUENTE
        contentElement.style.fontFamily = '"TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    } else {
        // --- BANDERA NORMAL ---
        const flag = getCountryFlag(location);
        if (flag) {
            contentElement = document.createElement('span');
            contentElement.textContent = ` ${flag}`;
            contentElement.setAttribute('data-twitter-flag', 'true');
            contentElement.style.marginLeft = '4px';
            contentElement.style.color = 'inherit';
            contentElement.style.fontFamily = '"TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        }
    }

    if (!contentElement) {
        usernameElement.dataset.flagAdded = 'failed';
        return;
    }

    const insertion = findInsertionPoint(usernameElement, screenName);
    if (insertion && insertion.parent) {
        if (insertion.ref) {
            insertion.parent.insertBefore(contentElement, insertion.ref);
        } else {
            insertion.parent.appendChild(contentElement);
        }
        usernameElement.dataset.flagAdded = 'true';
    } else {
        const simpleContainer = usernameElement.querySelector('[data-testid="UserName"], [data-testid="User-Name"]');
        if (simpleContainer) {
            simpleContainer.appendChild(contentElement);
            usernameElement.dataset.flagAdded = 'true';
        }
    }

  } catch (error) {
    console.error(`Error processing ${screenName}:`, error);
    usernameElement.dataset.flagAdded = 'failed';
  } finally {
    processingUsernames.delete(screenName);
  }
}

function removeAllFlags() {
  document.querySelectorAll('[data-twitter-flag]').forEach(f => f.remove());
  document.querySelectorAll('[data-flag-added]').forEach(c => delete c.dataset.flagAdded);
}

async function processUsernames() {
  if (!extensionEnabled) return;
  const containers = document.querySelectorAll('article[data-testid="tweet"], [data-testid="UserCell"], [data-testid="User-Names"], [data-testid="User-Name"]');
  for (const container of containers) {
    const screenName = extractUsername(container);
    if (screenName) {
      const status = container.dataset.flagAdded;
      if (!status || status === 'failed') {
        addFlagToUsername(container, screenName).catch(() => {});
      }
    }
  }
}

function initObserver() {
  if (observer) observer.disconnect();
  observer = new MutationObserver((mutations) => {
    if (!extensionEnabled) return;
    if (mutations.some(m => m.addedNodes.length > 0)) {
      setTimeout(processUsernames, 500);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function init() {
  await loadState();
  await loadCache();
  if (!extensionEnabled) return;
  
  injectPageScript();
  setTimeout(processUsernames, 2000);
  initObserver();
  
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(processUsernames, 2000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  setInterval(saveCache, 30000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}