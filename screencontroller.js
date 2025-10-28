/* Screen Controller Module — scales app visually like 67% zoom */
function applyScreenScale(targetScale = 0.67) {
  const app = document.getElementById('mainApp');
  if (!app) return;

  app.style.transformOrigin = 'top center';
  app.style.transform = `scale(${targetScale})`;
  app.style.transition = 'transform 0.4s ease';

  // Center horizontally after scaling
  const offsetX = (window.innerWidth - (app.offsetWidth * targetScale)) / 2;
  app.style.marginLeft = `${offsetX}px`;
}

/* Automatically apply on load */
window.addEventListener('load', () => {
  applyScreenScale(0.67);
});

/* Optional: adjust dynamically on resize */
window.addEventListener('resize', () => {
  applyScreenScale(0.67);
});
