// Service Worker Registration
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registered:', reg);
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Theme Management
function toggleDarkMode() {
  state.dark = !state.dark;
  if(state.dark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  save();
}

// Color Pickers
const COLORS = ['#007AFF','#34C759','#FF3B30','#FF9500','#AF52DE','#5AC8FA','#FF2D55','#FFCC00','#00C7BE','#FF6B35','#8B4513','#FF69B4','#20B2AA','#9370DB','#DC143C','#228B22','#FF8C00','#4169E1'];

function onHexInput(val) {
  if(!/^#[0-9A-F]{6}$/i.test(val)) return;
  const circle = document.getElementById('colorPreviewCircle');
  if(circle) circle.style.background = val;
}

function onEvHexInput(val) {
  if(!/^#[0-9A-F]{6}$/i.test(val)) return;
  const circle = document.getElementById('evColorCircle');
  if(circle) circle.style.background = val;
  editingEventColor = val;
}

function onBgHexInput(val) {
  if(!/^#[0-9A-F]{6}$/i.test(val)) return;
  const circle = document.getElementById('bgColorCircle');
  if(circle) circle.style.background = val;
}

function onAccentHexInput(val) {
  if(!/^#[0-9A-F]{6}$/i.test(val)) return;
  const circle = document.getElementById('accentColorCircle');
  if(circle) circle.style.background = val;
}
