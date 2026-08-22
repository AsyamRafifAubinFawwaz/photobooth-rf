// Bubbles only appear for frame1 (water/fish theme)
(function() {
  const selectedFrame = localStorage.getItem('selectedFrame') || 'frame1';
  if (selectedFrame !== 'frame1') return; // skip for non-water frames

  const bubbleContainer = document.querySelector(".bubble-container");
  if (!bubbleContainer) return;

  // bubble image paths
  const bubbleImages = [
    "Assets/fish-photobooth/camerapage/bubbles/bubble4.png",
    "Assets/fish-photobooth/camerapage/bubbles/bubble1.png",
    "Assets/fish-photobooth/camerapage/bubbles/bubble2.png",
    "Assets/fish-photobooth/camerapage/bubbles/bubble3.png",
    "Assets/fish-photobooth/camerapage/bubbles/bubble5.png",
  ];

  const createBubble = () => {
    const bubble = document.createElement("img");
    bubble.src = bubbleImages[Math.floor(Math.random() * bubbleImages.length)];
    bubble.classList.add("bubble");

    bubble.style.left = Math.random() * 100 + "%";
    const size = 20 + Math.random() * 20;
    bubble.style.width = size + "px";
    const duration = 12 + Math.random() * 8;
    bubble.style.animationDuration = duration + "s";

    bubbleContainer.appendChild(bubble);
    setTimeout(() => bubble.remove(), duration * 1000);
  };

  setInterval(createBubble, 400);
})();
