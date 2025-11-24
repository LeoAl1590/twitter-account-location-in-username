// Popup script for extension toggle
const TOGGLE_KEY = 'extension_enabled';
const BLOCKED_KEY = 'blocked_countries'; // Nueva clave para storage
const DEFAULT_ENABLED = true;

// Elementos UI
const toggleSwitch = document.getElementById('toggleSwitch');
const status = document.getElementById('status');
const countryInput = document.getElementById('countryInput');
const addBtn = document.getElementById('addBtn');
const blockedList = document.getElementById('blockedList');

// Estado local
let blockedCountries = [];

// Inicialización
chrome.storage.local.get([TOGGLE_KEY, BLOCKED_KEY], (result) => {
  const isEnabled = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
  blockedCountries = result[BLOCKED_KEY] || [];
  
  updateToggle(isEnabled);
  renderBlockedList();
});

// Toggle handler
toggleSwitch.addEventListener('click', () => {
  chrome.storage.local.get([TOGGLE_KEY], (result) => {
    const currentState = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
    const newState = !currentState;
    
    chrome.storage.local.set({ [TOGGLE_KEY]: newState }, () => {
      updateToggle(newState);
      notifyContentScript({ type: 'extensionToggle', enabled: newState });
    });
  });
});

// Manejador para añadir país
addBtn.addEventListener('click', addCountry);
countryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addCountry();
});

function addCountry() {
  const country = countryInput.value.trim();
  if (!country) return;
  
  // Normalizar a Capitalizado (opcional, ayuda a que se vea bien)
  const normalized = country.charAt(0).toUpperCase() + country.slice(1);
  
  if (!blockedCountries.includes(normalized)) {
    blockedCountries.push(normalized);
    saveBlockedCountries();
    countryInput.value = '';
  }
}

function removeCountry(country) {
  blockedCountries = blockedCountries.filter(c => c !== country);
  saveBlockedCountries();
}

function saveBlockedCountries() {
  chrome.storage.local.set({ [BLOCKED_KEY]: blockedCountries }, () => {
    renderBlockedList();
    // Notificar al content script para actualizar bloqueo en tiempo real
    notifyContentScript({ type: 'updateBlocked', countries: blockedCountries });
  });
}

function renderBlockedList() {
  blockedList.innerHTML = '';
  blockedCountries.forEach(country => {
    const div = document.createElement('div');
    div.className = 'blocked-item';
    div.innerHTML = `
      <span>${country}</span>
      <span class="remove-btn">×</span>
    `;
    div.querySelector('.remove-btn').onclick = () => removeCountry(country);
    blockedList.appendChild(div);
  });
}

function updateToggle(isEnabled) {
  if (isEnabled) {
    toggleSwitch.classList.add('enabled');
    status.textContent = 'Extension is enabled';
    status.style.color = '#1d9bf0';
  } else {
    toggleSwitch.classList.remove('enabled');
    status.textContent = 'Extension is disabled';
    status.style.color = '#536471';
  }
}

function notifyContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
    }
  });
}