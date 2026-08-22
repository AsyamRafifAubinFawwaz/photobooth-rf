// Shared Frame Configuration
// Used across camera.js, upload.js, final.js

const FRAME_CONFIG = {
  frame1: {
    src: 'Assets/fish-photobooth/camerapage/frame1.png',
    slots: 2,
    canvasW: 1176,
    canvasH: 1470,
    windows: [
      { px: 0.075, py: 0.118, pw: 0.847, ph: 0.382 },
      { px: 0.075, py: 0.538, pw: 0.847, ph: 0.382 },
    ]
  },
  frame2: {
    src: 'Assets/fish-photobooth/camerapage/frame2.png',
    slots: 2,
    canvasW: 3130,
    canvasH: 4422,
    windows: [
      { px: 0.088, py: 0.101, pw: 0.844, ph: 0.364 },
      { px: 0.087, py: 0.576, pw: 0.844, ph: 0.364 },
    ]
  },
  frame3: {
    src: 'Assets/fish-photobooth/camerapage/frame3.png',
    slots: 3,
    canvasW: 3130,
    canvasH: 6188,
    windows: [
      { px: 0.078, py: 0.076, pw: 0.844, ph: 0.261 },
      { px: 0.078, py: 0.362, pw: 0.844, ph: 0.261 },
      { px: 0.078, py: 0.647, pw: 0.844, ph: 0.261 },
    ]
  },
  frame4: {
    src: 'Assets/fish-photobooth/camerapage/frame4.png',
    slots: 6,
    canvasW: 4210,
    canvasH: 6318,
    windows: [
      { px: 0.077, py: 0.167, pw: 0.380, ph: 0.185 },
      { px: 0.568, py: 0.241, pw: 0.380, ph: 0.185 },
      { px: 0.077, py: 0.372, pw: 0.380, ph: 0.185 },
      { px: 0.568, py: 0.448, pw: 0.380, ph: 0.185 },
      { px: 0.077, py: 0.579, pw: 0.380, ph: 0.185 },
      { px: 0.568, py: 0.654, pw: 0.380, ph: 0.185 },
    ]
  },
};

// Get the current frame config from localStorage
function getSelectedFrameConfig() {
  const key = localStorage.getItem('selectedFrame') || 'frame1';
  return FRAME_CONFIG[key] || FRAME_CONFIG['frame1'];
}
