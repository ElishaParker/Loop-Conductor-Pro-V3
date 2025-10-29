/* Screen Controller Module — scales app visually like 63% zoom */
function applyScreenScale(targetScale = 0.63) {
  const app = document.getElementById('mainApp');
  if (!app) return;

  app.style.transformOrigin = 'top left';
  app.style.transform = `scale(${targetScale})`;
  app.style.transition = 'transform 0.4s ease';

  // Slight left alignment instead of full centering
  const offsetX = (window.innerWidth - (app.offsetWidth * targetScale)) / -5.5;
  app.style.marginLeft = `${offsetX}px`;
}

/* Automatically apply on load */
window.addEventListener('load', () => {
  applyScreenScale(0.63);
});

/* Optional: adjust dynamically on resize */
window.addEventListener('resize', () => {
  applyScreenScale(0.63);
});
