// Shared Frame Configuration
// Used across camera.js, upload.js, final.js

const FRAME_CONFIG = {
  frame1: {
    src: 'Assets/fish-photobooth/camerapage/frame1.png',
    slots: 2,
    cols: 1,
    rows: 2,
    canvasW: 1176,
    canvasH: 1470,
  },
  frame2: {
    src: 'Assets/fish-photobooth/camerapage/frame2.png',
    slots: 2,
    cols: 1,
    rows: 2,
    canvasW: 1176,
    canvasH: 1470,
  },
  frame3: {
    src: 'Assets/fish-photobooth/camerapage/frame3.png',
    slots: 3,
    cols: 1,
    rows: 3,
    canvasW: 1176,
    canvasH: 2205,
  },
  frame4: {
    src: 'Assets/fish-photobooth/camerapage/frame4.png',
    slots: 6,
    cols: 2,
    rows: 3,
    canvasW: 1176,
    canvasH: 1470,
  },
};

// Get slot dimensions for a given frame config
function getSlotDimensions(config) {
  return {
    slotW: config.canvasW / config.cols,
    slotH: config.canvasH / config.rows,
  };
}

// Get the current frame config from localStorage
function getSelectedFrameConfig() {
  const key = localStorage.getItem('selectedFrame') || 'frame1';
  return FRAME_CONFIG[key] || FRAME_CONFIG['frame1'];
}
