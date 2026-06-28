// Subjects (Dersler) Management
let editingDersId = null;

function openAddDers() {
  editingDersId = null;
  document.getElementById('dersModalTitle').textContent = 'Ders Ekle';
  document.getElementById('dersNameInput').value = '';
  document.getElementById('colorHexInput').value = '#007AFF';
  openModal('addDersModal');
}

function saveDers() {
  const name = document.getElementById('dersNameInput').value.trim();
  const color = document.getElementById('colorHexInput').value;
  
  if(!name) {
    showToast('Ders adı gerekli');
    return;
  }
  
  if(editingDersId) {
    const ders = state.dersler.find(d => d.id === editingDersId);
    if(ders) {
      ders.name = name;
      ders.color = color;
    }
  } else {
    state.dersler.push({
      id: Date.now(),
      name,
      color,
      createdAt: new Date().toISOString()
    });
  }
  
  save();
  closeModal('addDersModal');
  renderDersler();
  renderSubjectSelector();
}

function deleteDers(dersId) {
  state.dersler = state.dersler.filter(d => d.id !== dersId);
  state.sessions = state.sessions.filter(s => s.dersId !== dersId);
  save();
  renderDersler();
  renderSubjectSelector();
}

function renderDersler() {
  const container = document.getElementById('derslerContainer');
  if(!container) return;
  
  if(state.dersler.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-title">Henüz ders eklenmemiş</div><div class="empty-state-sub">+ Tuşu ile yeni ders ekle</div></div>';
    return;
  }
  
  let html = '';
  state.dersler.forEach(ders => {
    const sessions = state.sessions.filter(s => s.dersId === ders.id);
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    html += `
      <div class="card" style="border-left: 4px solid ${ders.color}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
          <div>
            <div style="font-weight: 700; color: var(--label)">${ders.name}</div>
            <div style="font-size: 12px; color: var(--label3)">${sessions.length} oturum</div>
          </div>
          <button onclick="editDers(${ders.id})" style="background: none; border: none; cursor: pointer; font-size: 18px">✏️</button>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: var(--primary)">${formatDuration(totalTime)}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderSubjectSelector() {
  const selector = document.getElementById('subjectSelector');
  const list = document.getElementById('subjectSelectList');
  
  if(!selector) return;
  
  const selectedDers = state.dersler.find(d => d.id === state.selectedDersId);
  const dot = document.getElementById('selectedSubjectDot');
  const name = document.getElementById('selectedSubjectName');
  
  if(selectedDers) {
    if(dot) dot.style.background = selectedDers.color;
    if(name) name.textContent = selectedDers.name;
  } else {
    if(dot) dot.style.background = '#ccc';
    if(name) name.textContent = 'Ders Seç';
  }
  
  if(list) {
    list.innerHTML = state.dersler.map(d => `
      <div onclick="selectDers(${d.id})" style="padding: 12px 16px; border-radius: 10px; margin-bottom: 8px; background: var(--fill2); cursor: pointer; display: flex; align-items: center; gap: 12px">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${d.color}"></div>
        <span style="font-weight: 500; color: var(--label)">${d.name}</span>
        ${state.selectedDersId === d.id ? '<span style="margin-left: auto; color: var(--primary)">✓</span>' : ''}
      </div>
    `).join('');
  }
}

function selectDers(dersId) {
  state.selectedDersId = dersId;
  save();
  closeModal('subjectSelectModal');
  renderSubjectSelector();
}

function openSubjectSelect() {
  renderSubjectSelector();
  openModal('subjectSelectModal');
}

function editDers(dersId) {
  const ders = state.dersler.find(d => d.id === dersId);
  if(!ders) return;
  
  editingDersId = dersId;
  document.getElementById('dersModalTitle').textContent = 'Dersi Düzenle';
  document.getElementById('dersNameInput').value = ders.name;
  document.getElementById('colorHexInput').value = ders.color;
  openModal('addDersModal');
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if(hours > 0) {
    return `${hours}s ${minutes}dk`;
  }
  return `${minutes}dk`;
}
