// State Management
let state = JSON.parse(localStorage.getItem('derstakip') || 'null') || {
  dark: false,
  dersler: [],
  sessions: [],
  goals: { daily: 150, weekly: 600 },
  selectedDersId: null,
  dayNotes: {},
  calEvents: [],
  notes: {},
  badges: [],
  pomodoroSound: true,
  pomodoroVibe: true,
  reminderTime: null
};

if(!state.dayNotes)   state.dayNotes = {};
if(!state.calEvents)  state.calEvents = [];
if(!state.badges)     state.badges = [];
if(state.pomodoroSound === undefined) state.pomodoroSound = true;
if(state.pomodoroVibe === undefined)  state.pomodoroVibe = true;

let _saveTimer = null;
let _saveQuotaWarned = false;

function _doSave() {
  try {
    localStorage.setItem('derstakip', JSON.stringify(state));
  } catch(e) {
    if(!_saveQuotaWarned) {
      _saveQuotaWarned = true;
      showToast('⚠️ Depolama dolu! Eski oturumları sil veya CSV olarak dışa aktar.');
    }
    console.error('localStorage save failed:', e);
  }
}

function save() {
  if(_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_doSave, 150);
}

window.addEventListener('beforeunload', () => {
  if(_saveTimer) { clearTimeout(_saveTimer); _doSave(); }
});

window.addEventListener('pagehide', () => {
  if(_saveTimer) { clearTimeout(_saveTimer); _doSave(); }
});

// Render Coalescing
const _pendingRenders = new Map();
let _renderFlushScheduled = false;

function _coalesce(name, fn) {
  return function(...args) {
    _pendingRenders.set(name, () => fn.apply(this, args));
    if(_renderFlushScheduled) return;
    _renderFlushScheduled = true;
    requestAnimationFrame(() => {
      _renderFlushScheduled = false;
      const fns = Array.from(_pendingRenders.values());
      _pendingRenders.clear();
      fns.forEach(f => { try { f(); } catch(e) { console.error('render error:', e); } });
    });
  };
}

// Toast Notifications
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) {
    modal.classList.add('active');
    modal.addEventListener('click', (e) => {
      if(e.target === modal) closeModal(modalId);
    });
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) modal.classList.remove('active');
}

// Page Navigation
function navigate(pageName, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + pageName).classList.add('active');
  if(btn) btn.classList.add('active');
}

// Clock Update
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'short', month: 'short', day: 'numeric' });
  
  const clockEl = document.getElementById('headerClock');
  const dateEl = document.getElementById('headerDate');
  if(clockEl) clockEl.textContent = `${hours}:${minutes}`;
  if(dateEl) dateEl.textContent = dateStr;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
  
  // Apply saved theme
  if(state.dark) {
    document.body.classList.add('dark-mode');
  }
});
