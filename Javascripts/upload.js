// ─────────────────────────────────────────────
//  upload.js — Dynamic multi-frame photo upload
// ─────────────────────────────────────────────

// Clear old data
localStorage.removeItem('photoStrip');

// Get frame config
const frameConfig = getSelectedFrameConfig();
const { canvasW: WIDTH, canvasH: HEIGHT, slots: TOTAL_SLOTS, cols: COLS, rows: ROWS } = frameConfig;
const SLOT_W = WIDTH / COLS;
const SLOT_H = HEIGHT / ROWS;

// DOM elements
const canvas   = document.getElementById('finalCanvas');
const ctx      = canvas.getContext('2d');
const uploadInput = document.getElementById('uploadPhotoInput');
const uploadBtn   = document.getElementById('uploadPhoto');
const readyBtn    = document.getElementById('readyButton');
const hintEl      = document.getElementById('uploadHint');

// Set canvas dimensions
canvas.width  = WIDTH;
canvas.height = HEIGHT;

// Adjust container aspect ratio
const boothEl = document.getElementById('booth');
boothEl.style.aspectRatio = `${WIDTH} / ${HEIGHT}`;

// Set frame overlay
const frameOverlay = document.getElementById('frameOverlay');
frameOverlay.src = frameConfig.src;

// State
let photoStage = 0;

// ─── Progress Indicator ───────────────────────
function buildProgressUI() {
  const container = document.getElementById('photoProgress');
  container.innerHTML = `<span>Upload</span>`;
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.id = `pdot-${i}`;
    container.appendChild(dot);
  }
  updateProgressUI();
  updateHint();
}

function updateProgressUI() {
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const dot = document.getElementById(`pdot-${i}`);
    if (!dot) continue;
    dot.className = 'progress-dot';
    if (i < photoStage) dot.classList.add('done');
    else if (i === photoStage) dot.classList.add('active');
  }
}

function updateHint() {
  if (photoStage < TOTAL_SLOTS) {
    hintEl.textContent = `Upload foto ke-${photoStage + 1} dari ${TOTAL_SLOTS}`;
  } else {
    hintEl.textContent = 'Semua foto sudah diupload. Klik Selesai untuk lanjut.';
  }
}

// ─── Draw uploaded photo to slot ─────────────
function drawPhoto(img) {
  const col = photoStage % COLS;
  const row = Math.floor(photoStage / COLS);
  const xOffset = col * SLOT_W;
  const yOffset = row * SLOT_H;

  const imgAspect    = img.width / img.height;
  const targetAspect = SLOT_W / SLOT_H;

  let sx, sy, sw, sh;
  if (imgAspect > targetAspect) {
    sh = img.height; sw = img.height * targetAspect; sx = (img.width - sw) / 2; sy = 0;
  } else {
    sw = img.width; sh = img.width / targetAspect; sx = 0; sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, xOffset, yOffset, SLOT_W, SLOT_H);

  photoStage++;
  updateProgressUI();
  updateHint();

  if (photoStage >= TOTAL_SLOTS) {
    finalizePhotoStrip();
  }
}

// ─── Finalize ────────────────────────────────
function finalizePhotoStrip() {
  const frame = new Image();
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    uploadBtn.style.display = 'none';
    readyBtn.style.display = 'inline-block';
    readyBtn.disabled = false;
  };
  frame.src = frameConfig.src;
}

// ─── Events ──────────────────────────────────
readyBtn.addEventListener('click', () => {
  localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
  window.location.href = 'final.html';
});

uploadBtn.addEventListener('click', () => {
  if (photoStage >= TOTAL_SLOTS) return;
  uploadInput.click();
});

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => drawPhoto(img);
  img.src = URL.createObjectURL(file);
  uploadInput.value = '';
});

document.getElementById('logoBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

// ─── Init ────────────────────────────────────
buildProgressUI();
