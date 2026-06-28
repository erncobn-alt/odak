// Timer State
let timer = {
  running: false,
  paused: false,
  seconds: 0,
  interval: null,
  startTime: null,
  accumulated: 0,
  pomoStartRem: 0
};

let timerMode = 'free'; // 'free' or 'pomo'
let pomoConfig = {
  workDuration: 25 * 60,
  breakDuration: 5 * 60
};

function setTimerMode(mode, btn) {
  timerMode = mode;
  document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  
  const badge = document.getElementById('pomoBadge');
  const row = document.getElementById('pomoSetRow');
  
  if(mode === 'pomo') {
    if(badge) badge.style.display = 'block';
    if(row) row.style.display = 'flex';
  } else {
    if(badge) badge.style.display = 'none';
    if(row) row.style.display = 'none';
  }
}

function setPomoWork(delta) {
  pomoConfig.workDuration = Math.max(5 * 60, pomoConfig.workDuration + delta * 60);
  updatePomoSetRow();
  save();
}

function setPomoBreak(delta) {
  pomoConfig.breakDuration = Math.max(1 * 60, pomoConfig.breakDuration + delta * 60);
  updatePomoSetRow();
  save();
}

function updatePomoSetRow() {
  const workMins = Math.floor(pomoConfig.workDuration / 60);
  const breakMins = Math.floor(pomoConfig.breakDuration / 60);
  
  const workDisp = document.getElementById('pomoWorkDisp');
  const breakDisp = document.getElementById('pomoBreakDisp');
  
  if(workDisp) workDisp.textContent = `${workMins}dk`;
  if(breakDisp) breakDisp.textContent = `${breakMins}dk`;
}

function handleMainBtn() {
  if(!timer.running) {
    startTimer();
  } else if(!timer.paused) {
    pauseTimer();
  } else {
    resumeTimer();
  }
}

function startTimer() {
  const selectedDersId = state.selectedDersId;
  if(!selectedDersId && timerMode === 'free') {
    showToast('Lütfen bir ders seçin');
    return;
  }
  
  timer.running = true;
  timer.paused = false;
  timer.startTime = Date.now();
  
  updateTimerButton();
  
  timer.interval = setInterval(() => {
    timer.accumulated = Math.floor((Date.now() - timer.startTime) / 1000);
    updateTimerDisplay();
  }, 100);
}

function pauseTimer() {
  timer.paused = true;
  if(timer.interval) clearInterval(timer.interval);
  updateTimerButton();
}

function resumeTimer() {
  timer.paused = false;
  timer.startTime = Date.now() - timer.accumulated * 1000;
  
  timer.interval = setInterval(() => {
    timer.accumulated = Math.floor((Date.now() - timer.startTime) / 1000);
    updateTimerDisplay();
  }, 100);
  updateTimerButton();
}

function stopTimer() {
  if(timer.interval) clearInterval(timer.interval);
  
  if(timer.accumulated > 0 && state.selectedDersId) {
    const session = {
      id: Date.now(),
      dersId: state.selectedDersId,
      duration: timer.accumulated,
      date: new Date().toISOString(),
      notes: ''
    };
    state.sessions.push(session);
    save();
  }
  
  timer.running = false;
  timer.paused = false;
  timer.accumulated = 0;
  timer.seconds = 0;
  
  updateTimerDisplay();
  updateTimerButton();
  renderHistory();
}

function updateTimerDisplay() {
  const totalSeconds = timer.accumulated;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerEl = document.getElementById('timerDisplay');
  if(timerEl) timerEl.textContent = display;
  
  // Update ring progress
  const selectedDers = state.dersler.find(d => d.id === state.selectedDersId);
  if(selectedDers) {
    const ringFill = document.getElementById('ringFill');
    if(ringFill) {
      const progress = Math.min(totalSeconds / (2 * 3600), 1); // Assume 2 hour max
      const circumference = 2 * Math.PI * 88;
      ringFill.style.strokeDashoffset = circumference * (1 - progress);
    }
  }
}

function updateTimerButton() {
  const btn = document.getElementById('mainBtn');
  if(!btn) return;
  
  if(!timer.running) {
    btn.textContent = 'Başlat';
    btn.onclick = handleMainBtn;
  } else if(timer.paused) {
    btn.textContent = 'Devam Et';
    btn.onclick = handleMainBtn;
  } else {
    btn.textContent = 'Duraklat';
    btn.onclick = handleMainBtn;
  }
}

function togglePomoSound() {
  state.pomodoroSound = !state.pomodoroSound;
  const btn = document.getElementById('pomoSoundBtn');
  if(btn) btn.classList.toggle('active', state.pomodoroSound);
  save();
}

function togglePomoVibe() {
  state.pomodoroVibe = !state.pomodoroVibe;
  const btn = document.getElementById('pomoVibeBtn');
  if(btn) btn.classList.toggle('active', state.pomodoroVibe);
  save();
}
