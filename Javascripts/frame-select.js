// Frame labels for the UI
const FRAME_UI = [
  {
    key: 'frame1',
    name: 'Frame Lucu 1',
    slots: 2,
    label: '2 foto',
    preview: 'Assets/fish-photobooth/camerapage/frame1.png',
  },
  {
    key: 'frame2',
    name: 'Frame Lucu 2',
    slots: 2,
    label: '2 foto',
    preview: 'Assets/fish-photobooth/camerapage/frame2.png',
  },
  {
    key: 'frame3',
    name: 'Frame Lucu 3',
    slots: 3,
    label: '3 foto',
    preview: 'Assets/fish-photobooth/camerapage/frame3.png',
  },
  {
    key: 'frame4',
    name: 'Frame Lucu 4',
    slots: 6,
    label: '6 foto',
    preview: 'Assets/fish-photobooth/camerapage/frame4.png',
  },
];

let selectedFrameKey = null;

// Build frame cards
const grid = document.getElementById('frameGrid');
const btnSelect = document.getElementById('btnSelect');
const ctaHint = document.getElementById('ctaHint');

FRAME_UI.forEach(frame => {
  const card = document.createElement('div');
  card.className = 'frame-card';
  card.dataset.key = frame.key;

  // Slot dots
  let dotsHTML = '';
  for (let i = 0; i < frame.slots; i++) {
    dotsHTML += `<span class="slot-dot"></span>`;
  }

  card.innerHTML = `
    <img class="frame-preview" src="${frame.preview}" alt="${frame.name}" loading="lazy" />
    <div class="frame-info">
      <span class="frame-name">${frame.name}</span>
      <span class="frame-meta">${frame.label}</span>
      <div class="slot-dots">${dotsHTML}</div>
    </div>
  `;

  card.addEventListener('click', () => selectFrame(frame.key, card));
  grid.appendChild(card);
});

function selectFrame(key, cardEl) {
  // Remove previous selection
  document.querySelectorAll('.frame-card').forEach(c => c.classList.remove('selected'));

  // Mark selected
  cardEl.classList.add('selected');
  selectedFrameKey = key;

  // Activate button
  btnSelect.classList.add('active');
  ctaHint.textContent = `"${cardEl.querySelector('.frame-name').textContent}" dipilih`;
}

// Proceed button
btnSelect.addEventListener('click', () => {
  if (!selectedFrameKey) return;
  localStorage.setItem('selectedFrame', selectedFrameKey);
  window.location.href = 'menu.html?t=' + Date.now();
});

// Logo redirect
document.querySelector('.logo').addEventListener('click', () => {
  window.location.href = 'index.html';
});
