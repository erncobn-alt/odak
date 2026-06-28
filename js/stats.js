// Statistics Management
let statsTab = 'week';

function setStatsTab(tab, btn) {
  statsTab = tab;
  document.querySelectorAll('.stats-tab').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  
  document.getElementById('statsMainView').style.display = tab !== 'summary' ? 'block' : 'none';
  document.getElementById('statsSummaryView').style.display = tab === 'summary' ? 'block' : 'none';
  
  renderStats();
}

function renderStats() {
  if(statsTab === 'summary') {
    renderSummaryStat();
  } else {
    renderChartStats();
  }
}

function renderChartStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let days = [];
  let labels = [];
  
  if(statsTab === 'week') {
    for(let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
      labels.push(d.getDate());
    }
  } else {
    for(let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
  }
  
  // Calculate daily totals
  const dayTotals = days.map(d => {
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
    const sessions = state.sessions.filter(s => {
      const sDate = new Date(s.date);
      return sDate >= dayStart && sDate < dayEnd;
    });
    return sessions.reduce((sum, s) => sum + s.duration, 0) / 3600; // In hours
  });
  
  // Render bar chart
  const maxHours = Math.max(...dayTotals, 1);
  const barChart = document.getElementById('barChart');
  if(barChart) {
    barChart.innerHTML = dayTotals.map(val => `
      <div class="bar-chart-bar" style="height: ${(val / maxHours) * 100}%" title="${val.toFixed(1)}h"></div>
    `).join('');
  }
  
  // Update Y-axis
  const yAxis = document.getElementById('barYAxis');
  if(yAxis) {
    const step = Math.ceil(maxHours / 4);
    yAxis.innerHTML = Array.from({length: 5}, (_, i) => `<span>${(4 - i) * step}h</span>`).join('');
  }
  
  // Update stats
  const totalHours = dayTotals.reduce((a, b) => a + b, 0);
  const sessionCount = state.sessions.filter(s => {
    const sDate = new Date(s.date);
    const daysAgo = Math.floor((today - sDate) / (24 * 3600 * 1000));
    return statsTab === 'week' ? daysAgo <= 6 : daysAgo <= 29;
  }).length;
  const pomoCount = 0; // Can be calculated if pomodoro sessions are tracked
  const avgDaily = sessionCount > 0 ? (totalHours / Math.min(sessionCount, statsTab === 'week' ? 7 : 30)).toFixed(1) : 0;
  
  document.getElementById('statTotalTime').textContent = Math.round(totalHours * 60) + 'dk';
  document.getElementById('statSessions').textContent = sessionCount;
  document.getElementById('statPomos').textContent = pomoCount;
  document.getElementById('statAvgDay').textContent = Math.round(avgDaily * 60) + 'dk';
}

function renderSummaryStat() {
  // Placeholder for summary view
  const content = document.getElementById('weeklySummaryContent');
  if(content) {
    const totalSessions = state.sessions.length;
    const totalSeconds = state.sessions.reduce((sum, s) => sum + s.duration, 0);
    
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <div style="background: var(--fill2); padding: 14px; border-radius: 10px; text-align: center">
          <div style="font-size: 11px; color: var(--label3); font-weight: 600; text-transform: uppercase">Toplam Oturum</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--primary); margin-top: 6px">${totalSessions}</div>
        </div>
        <div style="background: var(--fill2); padding: 14px; border-radius: 10px; text-align: center">
          <div style="font-size: 11px; color: var(--label3); font-weight: 600; text-transform: uppercase">Toplam Süre</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--primary); margin-top: 6px">${formatDuration(totalSeconds)}</div>
        </div>
      </div>
    `;
  }
}

function exportCSV() {
  if(state.sessions.length === 0) {
    showToast('Dışa aktarılacak oturum yok');
    return;
  }
  
  let csv = 'Ders,Tarih,Saat,Süre (dakika)\n';
  
  state.sessions.forEach(s => {
    const ders = state.dersler.find(d => d.id === s.dersId);
    const date = new Date(s.date);
    const dateStr = date.toLocaleDateString('tr-TR');
    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const minutes = Math.floor(s.duration / 60);
    
    csv += `"${ders ? ders.name : 'Bilinmeyen'}",${dateStr},${timeStr},${minutes}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `odak-export-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showToast('CSV olarak indirildi');
}
