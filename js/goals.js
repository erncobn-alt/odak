// Goals Management
let editingHedef = null;

function openHedefEdit(type) {
  editingHedef = type;
  const goal = state.goals[type === 'daily' ? 'daily' : 'weekly'];
  const minutes = Math.floor(goal / 60);
  const seconds = goal % 60;
  
  document.getElementById('hedefModalTitle').textContent = type === 'daily' ? 'Günlük Hedefi Düzenle' : 'Haftalık Hedefi Düzenle';
  document.getElementById('hedefHour').value = '';
  document.getElementById('hedefMin').value = minutes;
  openModal('hedefModal');
}

function saveHedef() {
  const hours = parseInt(document.getElementById('hedefHour').value) || 0;
  const minutes = parseInt(document.getElementById('hedefMin').value) || 0;
  const totalSeconds = (hours * 3600) + (minutes * 60);
  
  if(totalSeconds === 0) {
    showToast('Geçerli bir süre girin');
    return;
  }
  
  if(editingHedef === 'daily') {
    state.goals.daily = totalSeconds / 60; // Store in minutes for backwards compatibility
  } else {
    state.goals.weekly = totalSeconds / 60;
  }
  
  save();
  closeModal('hedefModal');
  renderGoals();
}

function renderGoals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Daily goal
  const todaySessions = state.sessions.filter(s => {
    const sessionDate = new Date(s.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
  const todaySeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const dailyGoalSeconds = state.goals.daily * 60;
  const dailyProgress = Math.min((todaySeconds / dailyGoalSeconds) * 100, 100);
  
  document.getElementById('gunlukText').textContent = `${formatDuration(todaySeconds)} / ${formatDuration(dailyGoalSeconds)}`;
  document.getElementById('gunlukFill').style.width = dailyProgress + '%';
  document.getElementById('gunlukPct').textContent = Math.round(dailyProgress) + '%';
  
  // Weekly goal
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weeklySessions = state.sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= weekStart && sessionDate < new Date(today.getTime() + 24 * 3600 * 1000);
  });
  const weeklySeconds = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
  const weeklyGoalSeconds = state.goals.weekly * 60;
  const weeklyProgress = Math.min((weeklySeconds / weeklyGoalSeconds) * 100, 100);
  
  document.getElementById('haftalikText').textContent = `${formatDuration(weeklySeconds)} / ${formatDuration(weeklyGoalSeconds)}`;
  document.getElementById('haftalikFill').style.width = weeklyProgress + '%';
  document.getElementById('haftalikPct').textContent = Math.round(weeklyProgress) + '%';
}
