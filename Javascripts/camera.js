const frameConfig = getSelectedFrameConfig();
const { 
  canvasW: WIDTH, 
  canvasH: HEIGHT, 
  slots: TOTAL_SLOTS, 
  cols: COLS, 
  rows: ROWS, 
  offsetX = 35, 
  offsetY = 180, 
  padding = 20 
} = frameConfig;

const SLOT_W = frameConfig.slotW || ((WIDTH - (offsetX * 2) - (padding * (COLS - 1))) / COLS);
const SLOT_H = frameConfig.slotH || ((HEIGHT - offsetY - 120 - (padding * (ROWS - 1))) / ROWS);

const canvas = document.getElementById('finalCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const boothEl = document.getElementById('booth');
boothEl.style.aspectRatio = `${WIDTH} / ${HEIGHT}`;

const frameOverlay = document.getElementById('frameOverlay');
frameOverlay.src = frameConfig.src;

const elements = {
  video: document.getElementById('liveVideo'),
  canvas,
  ctx,
  takePhotoBtn: document.getElementById('takePhoto'),
  countdownEl: document.querySelector('.countdown-timer'),
};

let photoStage = 0;

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

function getSlotDimensions(index) {
  const slotConfig = frameConfig.windows[index];
  return {
    leftPx: slotConfig.px * WIDTH,
    topPx: slotConfig.py * HEIGHT,
    slotW: slotConfig.pw * WIDTH,
    slotH: slotConfig.ph * HEIGHT
  };
}

function moveVideoToSlot(slotIndex) {
  const { video } = elements;
  video.style.display = 'block';
  video.style.position = 'absolute';

  const slotConfig = frameConfig.windows[slotIndex];

  video.style.left   = `${slotConfig.px * 100}%`;
  video.style.top    = `${slotConfig.py * 100}%`;
  video.style.width  = `${slotConfig.pw * 100}%`;
  video.style.height = `${slotConfig.ph * 100}%`;
}

function startCountdown(callback) {
  let count = 3;
  const { countdownEl } = elements;

  const slotConfig = frameConfig.windows[photoStage];
  countdownEl.style.top = `calc(${slotConfig.py * 100}% + 0.5rem)`;

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

function flashFeedback() {
  const slotConfig = frameConfig.windows[photoStage - 1];

  const flash = document.createElement('div');
  flash.style.cssText = `
    position:absolute;
    left:${slotConfig.px * 100}%;
    top:${slotConfig.py * 100}%;
    width:${slotConfig.pw * 100}%;
    height:${slotConfig.ph * 100}%;
    background:rgba(255,255,255,0.75);
    z-index:200;pointer-events:none;
    animation:flashOut 0.3s ease forwards;
  `;
  boothEl.appendChild(flash);
  setTimeout(() => flash.remove(), 350);
}

function capturePhoto() {
  const { video, ctx } = elements;

  const { leftPx, topPx, slotW, slotH } = getSlotDimensions(photoStage);

  const vW = video.videoWidth, vH = video.videoHeight;
  const targetAspect = slotW / slotH;
  const vAspect = vW / vH;

  let sx, sy, sw, sh;
  if (vAspect > targetAspect) {
    sh = vH; sw = vH * targetAspect; sx = (vW - sw) / 2; sy = 0;
  } else {
    sw = vW; sh = vW / targetAspect; sx = 0; sy = (vH - sh) / 2;
  }

  ctx.save();
  ctx.translate(leftPx + slotW, topPx);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, slotW, slotH);
  ctx.restore();

  photoStage++;
  updateProgressUI();
  flashFeedback();

  if (photoStage < TOTAL_SLOTS) {
    moveVideoToSlot(photoStage);
    elements.takePhotoBtn.disabled = false;
  } else {
    finalizePhotoStrip();
  }
}

function finalizePhotoStrip() {
  const { video } = elements;
  video.style.display = 'none';
  elements.takePhotoBtn.style.display = 'none';

  const frame = new Image();
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    
    try {
      localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    } catch (e) {
      console.warn("Local storage quota exceeded for PNG, falling back to JPEG...");
      try {
        localStorage.setItem('photoStrip', canvas.toDataURL('image/jpeg', 0.8));
      } catch (e2) {
        console.warn("Local storage quota exceeded for JPEG, scaling down...");
        const temp = document.createElement('canvas');
        temp.width = canvas.width / 2;
        temp.height = canvas.height / 2;
        const tCtx = temp.getContext('2d');
        tCtx.fillStyle = 'white';
        tCtx.fillRect(0, 0, temp.width, temp.height);
        tCtx.drawImage(canvas, 0, 0, temp.width, temp.height);
        
        try {
          localStorage.setItem('photoStrip', temp.toDataURL('image/jpeg', 0.8));
        } catch (e3) {
          localStorage.setItem('photoStrip', temp.toDataURL('image/jpeg', 0.5));
        }
      }
    }

    setTimeout(() => window.location.href = 'final.html', 50);
  };
  frame.src = frameConfig.src;
}

function setupCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
    audio: false,
  }).then(stream => {
    elements.video.srcObject = stream;
    elements.video.play();
    moveVideoToSlot(0);
  }).catch(err => alert('Akses kamera gagal: ' + err));
}

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

buildProgressUI();
setupCamera();
setupEventListeners();

document.getElementById('logoBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});