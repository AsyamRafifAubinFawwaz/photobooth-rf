// ─────────────────────────────────────────────
//  camera.js — Dynamic multi-frame photo capture
// ─────────────────────────────────────────────

// Get frame config from localStorage
const frameConfig = getSelectedFrameConfig();
const { canvasW: WIDTH, canvasH: HEIGHT, slots: TOTAL_SLOTS, cols: COLS, rows: ROWS } = frameConfig;
const SLOT_W = WIDTH / COLS;
const SLOT_H = HEIGHT / ROWS;

// DOM elements
const canvas = document.getElementById('finalCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions based on selected frame
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Adjust container aspect ratio to match canvas
const boothEl = document.getElementById('booth');
boothEl.style.aspectRatio = `${WIDTH} / ${HEIGHT}`;

// Set frame overlay
const frameOverlay = document.getElementById('frameOverlay');
frameOverlay.src = frameConfig.src;

const elements = {
  video: document.getElementById('liveVideo'),
  canvas,
  ctx,
  takePhotoBtn: document.getElementById('takePhoto'),
  countdownEl: document.querySelector('.countdown-timer'),
};

// State
let photoStage = 0; // current slot index (0 to TOTAL_SLOTS-1)

// ─── Progress Indicator ───────────────────────
function buildProgressUI() {
  const container = document.getElementById('photoProgress');
  container.innerHTML = `<span>Foto</span>`;
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.id = `pdot-${i}`;
    container.appendChild(dot);
  }
  updateProgressUI();
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

// ─── Video positioning ────────────────────────
// Video moves to the current slot so user knows where to pose
function moveVideoToSlot(slotIndex) {
  const { video } = elements;
  video.style.display = 'block';
  video.style.position = 'absolute';

  const col = slotIndex % COLS;
  const row = Math.floor(slotIndex / COLS);

  video.style.left   = `${(col / COLS) * 100}%`;
  video.style.top    = `${(row / ROWS) * 100}%`;
  video.style.width  = `${(1 / COLS) * 100}%`;
  video.style.height = `${(1 / ROWS) * 100}%`;
}

// ─── Countdown ───────────────────────────────
function startCountdown(callback) {
  let count = 3;
  const { countdownEl } = elements;

  // Position countdown near the top of the current slot
  const row = Math.floor(photoStage / COLS);
  const topPct = (row / ROWS) * 100;
  countdownEl.style.top = `calc(${topPct}% + 0.5rem)`;

  countdownEl.textContent = count;
  countdownEl.style.display = 'flex';
  const id = setInterval(() => {
    count--;
    if (count > 0) { countdownEl.textContent = count; }
    else {
      clearInterval(id);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
}

// ─── Flash feedback on capture ────────────────
function flashFeedback() {
  // Flash only on the current slot
  const col = (photoStage - 1) % COLS;
  const row = Math.floor((photoStage - 1) / COLS);
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:absolute;
    left:${(col / COLS) * 100}%;
    top:${(row / ROWS) * 100}%;
    width:${(1 / COLS) * 100}%;
    height:${(1 / ROWS) * 100}%;
    background:rgba(255,255,255,0.75);
    z-index:200;pointer-events:none;
    animation:flashOut 0.3s ease forwards;
  `;
  boothEl.appendChild(flash);
  setTimeout(() => flash.remove(), 350);
}

// ─── Capture ─────────────────────────────────
function capturePhoto() {
  const { video, ctx } = elements;

  const col = photoStage % COLS;
  const row = Math.floor(photoStage / COLS);
  const xOffset = col * SLOT_W;
  const yOffset = row * SLOT_H;

  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = SLOT_W / SLOT_H;
  const vAspect = vW / vH;

  let sx, sy, sw, sh;
  if (vAspect > targetAspect) {
    sh = vH; sw = vH * targetAspect; sx = (vW - sw) / 2; sy = 0;
  } else {
    sw = vW; sh = vW / targetAspect; sx = 0; sy = (vH - sh) / 2;
  }

  // Mirror horizontally (selfie)
  ctx.save();
  ctx.translate(xOffset + SLOT_W, yOffset);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, SLOT_W, SLOT_H);
  ctx.restore();

  photoStage++;
  updateProgressUI();
  flashFeedback();

  if (photoStage < TOTAL_SLOTS) {
    // Move video preview to next slot
    moveVideoToSlot(photoStage);
    elements.takePhotoBtn.disabled = false;
  } else {
    finalizePhotoStrip();
  }
}

// ─── Finalize ────────────────────────────────
function finalizePhotoStrip() {
  const { video } = elements;
  video.style.display = 'none';
  elements.takePhotoBtn.style.display = 'none';

  const frame = new Image();
  frame.src = frameConfig.src;
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    setTimeout(() => window.location.href = 'final.html', 50);
  };
  if (frame.complete && frame.naturalWidth > 0) frame.onload();
}

// ─── Camera Setup ────────────────────────────
function setupCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 2560 }, height: { ideal: 1440 }, facingMode: 'user' },
    audio: false,
  }).then(stream => {
    elements.video.srcObject = stream;
    elements.video.play();
    moveVideoToSlot(0); // start at slot 0
  }).catch(err => alert('Akses kamera gagal: ' + err));
}

// ─── Events ──────────────────────────────────
function setupEventListeners() {
  elements.takePhotoBtn.addEventListener('click', () => {
    if (photoStage >= TOTAL_SLOTS) return;
    elements.takePhotoBtn.disabled = true;
    startCountdown(capturePhoto);
  });

  window.addEventListener('resize', () => {
    if (photoStage < TOTAL_SLOTS) moveVideoToSlot(photoStage);
  });
}

// ─── Init ────────────────────────────────────
buildProgressUI();
setupCamera();
setupEventListeners();

document.getElementById('logoBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});
