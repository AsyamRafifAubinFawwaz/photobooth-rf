// ─────────────────────────────────────────────
//  final.js — Sticker decoration & download
// ─────────────────────────────────────────────

// ── Sticker definitions ────────────────────────
const STICKERS = [
  { name: 'Asset 1',   src: 'Assets/fish-photobooth/camerapage/stickers/asset1.png' },
  { name: 'Asset 2',   src: 'Assets/fish-photobooth/camerapage/stickers/asset2.png' },
  { name: 'Awan',      src: 'Assets/fish-photobooth/camerapage/stickers/awan.png' },
  { name: 'Balon',     src: 'Assets/fish-photobooth/camerapage/stickers/balon.png' },
  { name: 'Bear',      src: 'Assets/fish-photobooth/camerapage/stickers/bear.png' },
  { name: 'Bunga',     src: 'Assets/fish-photobooth/camerapage/stickers/bunga.png' },
  { name: 'Camera',    src: 'Assets/fish-photobooth/camerapage/stickers/camera.png' },
  { name: 'Camera 2',  src: 'Assets/fish-photobooth/camerapage/stickers/camera 2.png' },
  { name: 'Flower',    src: 'Assets/fish-photobooth/camerapage/stickers/flower.png' },
  { name: 'Flower 2',  src: 'Assets/fish-photobooth/camerapage/stickers/flower2.png' },
  { name: 'Grizly',   src: 'Assets/fish-photobooth/camerapage/stickers/grizly.png' },
  { name: 'Grizly 2',  src: 'Assets/fish-photobooth/camerapage/stickers/grizly2.png' },
  { name: 'Panda',     src: 'Assets/fish-photobooth/camerapage/stickers/panda.png' },
  { name: 'Payung',    src: 'Assets/fish-photobooth/camerapage/stickers/payung.png' },
  { name: 'Panda 2',   src: 'Assets/fish-photobooth/camerapage/stickers/panda2.png' },
  { name: 'Panda 3',   src: 'Assets/fish-photobooth/camerapage/stickers/panda3.png' },
  { name: 'Pita',      src: 'Assets/fish-photobooth/camerapage/stickers/pita.png' },
  { name: 'Wolf',      src: 'Assets/fish-photobooth/camerapage/stickers/wolf.png' },
];

// ── Get frame config (canvas dimensions) ───────
const frameConfig = getSelectedFrameConfig();
const WIDTH  = frameConfig.canvasW;
const HEIGHT = frameConfig.canvasH;

// ── DOM ────────────────────────────────────────
const canvas      = document.getElementById('finalCanvas');
const ctx         = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn    = document.getElementById('resetBtn');
const homeBtn     = document.getElementById('homeBtn');

// Set canvas dimensions to match the selected frame
canvas.width  = WIDTH;
canvas.height = HEIGHT;

// ── State ──────────────────────────────────────
let stickers = [];
let dragOffset = { x: 0, y: 0 };
let selectedSticker = null;

// ── Load photo from localStorage ───────────────
const finalImage = new Image();
const dataURL = localStorage.getItem('photoStrip');
if (dataURL) {
  finalImage.src = dataURL;
  finalImage.onload = drawCanvas;
  localStorage.removeItem('photoStrip');
} else {
  alert('Foto tidak ditemukan! Kembali ke halaman kamera.');
}

// ── Draw canvas ────────────────────────────────
function drawCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// ── Add sticker ────────────────────────────────
function addSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    // Scale sticker to reasonable size relative to canvas
    const targetW = WIDTH * 0.18;
    const scale   = targetW / img.width;
    stickers.push({
      img,
      x: WIDTH  / 2 - (img.width  * scale) / 2,
      y: HEIGHT / 2 - (img.height * scale) / 2,
      width:  img.width  * scale,
      height: img.height * scale,
      dragging: false,
    });
    drawCanvas();
  };
}

// ── Build sticker panel ────────────────────────
const stickerScroll = document.getElementById('stickerScroll');
STICKERS.forEach(sticker => {
  const btn = document.createElement('button');
  btn.className = 'sticker-item';
  btn.title = sticker.name;
  btn.setAttribute('aria-label', `Tambah stiker ${sticker.name}`);

  const img = document.createElement('img');
  img.src = sticker.src;
  img.alt = sticker.name;
  img.loading = 'lazy';
  btn.appendChild(img);

  btn.addEventListener('click', () => addSticker(sticker.src));
  stickerScroll.appendChild(btn);
});

// ── Pointer position helper ────────────────────
function getPointerPos(e) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = e.touches?.[0]?.clientX ?? e.clientX;
  const clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top)  * scaleY,
  };
}

// ── Drag & drop ────────────────────────────────
function pointerDown(e) {
  const { x: mx, y: my } = getPointerPos(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (mx >= s.x && mx <= s.x + s.width && my >= s.y && my <= s.y + s.height) {
      selectedSticker = s;
      s.dragging = true;
      dragOffset.x = mx - s.x;
      dragOffset.y = my - s.y;
      stickers.splice(i, 1);
      stickers.push(s);
      drawCanvas();
      e.preventDefault();
      break;
    }
  }
}
function pointerMove(e) {
  if (!selectedSticker?.dragging) return;
  const { x: mx, y: my } = getPointerPos(e);
  selectedSticker.x = mx - dragOffset.x;
  selectedSticker.y = my - dragOffset.y;
  drawCanvas();
  e.preventDefault();
}
function pointerUp() {
  if (selectedSticker) selectedSticker.dragging = false;
  selectedSticker = null;
}

// Mouse events
canvas.addEventListener('mousedown',  pointerDown);
canvas.addEventListener('mousemove',  pointerMove);
canvas.addEventListener('mouseup',    pointerUp);
canvas.addEventListener('mouseleave', pointerUp);

// Touch events
canvas.addEventListener('touchstart',  pointerDown,  { passive: false });
canvas.addEventListener('touchmove',   pointerMove,  { passive: false });
canvas.addEventListener('touchend',    pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// ── Action buttons ─────────────────────────────
downloadBtn.addEventListener('click', () => {
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nashallery-photobooth.png';
    a.click();
  }, 'image/png');
});

resetBtn.addEventListener('click', () => {
  stickers = [];
  drawCanvas();
});

homeBtn.addEventListener('click', () => window.location.href = 'index.html');

document.getElementById('logoBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});
