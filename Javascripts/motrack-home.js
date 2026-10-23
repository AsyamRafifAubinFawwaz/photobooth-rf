const selectButton = document.getElementById('select-button');

if (selectButton) {
  selectButton.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'button_click', {
        button_id: selectButton.id,
        button_text: selectButton.innerText || 'no-text',
      });
    }

    window.location.href = `frame-select.html?t=${Date.now()}`;
  });
}
