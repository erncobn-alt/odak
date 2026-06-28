// History Management
function renderHistory() {
  const container = document.getElementById('historyContainer');
  if(!container) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = state.sessions.filter(s => {
    const sessionDate = new Date(s.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
  
  if(todaySessions.length === 0) {
    container.innerHTML = '<div class="empty-state"><svg class="empty-state-svg" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="28" stroke-width="2.5"/><polyline points="40 24 40 40 50 47" stroke-width="2.5"/><circle cx="40" cy="40" r="3" fill="currentColor" stroke="none"/></svg><div class="empty-state-title">Henüz çalışma yok</div><div class="empty-state-sub">Sayacı başlatarak ilk oturumunu oluştur</div></div>';
    return;
  }
  
  // Update today summary
  const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const summary = document.getElementById('todaySummary');
  if(summary) {
    summary.style.display = 'flex';
    const text = document.getElementById('todayTotalText');
    const count = document.getElementById('todaySessionCount');
    if(text) text.textContent = formatDuration(totalSeconds);
    if(count) count.textContent = `${todaySessions.length} oturum`;
  }
  
  // Update daily progress
  const dailyGoal = state.goals.daily * 60;
  const progress = Math.min((totalSeconds / dailyGoal) * 100, 100);
  const fill = document.getElementById('dailyProgFill');
  const val = document.getElementById('dailyProgVal');
  if(fill) fill.style.width = progress + '%';
  if(val) val.textContent = Math.round(progress) + '%';
  
  // Render history items
  let html = '';
  todaySessions.forEach(session => {
    const ders = state.dersler.find(d => d.id === session.dersId);
    const time = new Date(session.date);
    const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    html += `
      <div class="card" style="cursor: pointer" onclick="openSessionDetail(${session.id})">
        <div style="display: flex; align-items: center; gap: 12px">
          <div style="width: 6px; height: 48px; border-radius: 3px; background: ${ders ? ders.color : '#ccc'}"></div>
          <div style="flex: 1">
            <div style="font-weight: 600; color: var(--label)">${ders ? ders.name : 'Bilinmeyen'}</div>
            <div style="font-size: 12px; color: var(--label3)">${timeStr}</div>
          </div>
          <div style="text-align: right">
            <div style="font-weight: 700; color: var(--primary)">${formatDuration(session.duration)}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function clearAllHistory() {
  openModal('clearHistoryModal');
}

function confirmClearHistory() {
  state.sessions = [];
  save();
  closeModal('clearHistoryModal');
  renderHistory();
  showToast('Geçmiş temizlendi');
}

function openSessionDetail(sessionId) {
  const session = state.sessions.find(s => s.id === sessionId);
  if(!session) return;
  
  const ders = state.dersler.find(d => d.id === session.dersId);
  const time = new Date(session.date);
  const timeStr = time.toLocaleTimeString('tr-TR');
  const dateStr = time.toLocaleDateString('tr-TR');
  
  const modal = document.getElementById('sessionDetailModal');
  const title = document.getElementById('sdTitle');
  const body = document.getElementById('sdBody');
  
  if(title) title.textContent = ders ? ders.name : 'Oturum Detayı';
  if(body) {
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="background: var(--fill2); padding: 12px; border-radius: 10px">
          <div style="font-size: 11px; color: var(--label3); font-weight: 600; text-transform: uppercase">Süre</div>
          <div style="font-size: 20px; font-weight: 800; color: var(--primary); margin-top: 4px">${formatDuration(session.duration)}</div>
        </div>
        <div style="background: var(--fill2); padding: 12px; border-radius: 10px">
          <div style="font-size: 11px; color: var(--label3); font-weight: 600; text-transform: uppercase">Tarih & Saat</div>
          <div style="font-size: 14px; color: var(--label); margin-top: 4px">${dateStr} ${timeStr}</div>
        </div>
      </div>
    `;
  }
  
  openModal('sessionDetailModal');
}
