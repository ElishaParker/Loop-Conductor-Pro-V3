<!-- 🎛 Screen Controller -->
<script>
  /**
   * Screen Controller for Loop Conductor Pro vFinal
   * Dynamically scales and centers the app window on load and resize.
   * Default scale = 0.67 (for 67% view).
   */
  function applyScreenScale(targetScale = 0.67, animate = true) {
    const app = document.getElementById('mainApp');
    if (!app) return;

    // Apply smooth transition if enabled
    app.style.transition = animate ? 'transform 0.4s ease, margin 0.4s ease' : 'none';
    app.style.transformOrigin = 'top center';
    app.style.transform = `scale(${targetScale})`;

    // Calculate horizontal centering offset
    const screenW = window.innerWidth;
    const scaledWidth = app.offsetWidth * targetScale;
    const offsetX = (screenW - scaledWidth) / 2;

    app.style.marginLeft = `${Math.max(offsetX, 0)}px`;
  }

  // Initialize scale after splash screen loads
  window.addEventListener('load', () => {
    // slight delay ensures layout has rendered
    setTimeout(() => applyScreenScale(0.67, true), 1200);
  });

  // Maintain scale dynamically
  window.addEventListener('resize', () => applyScreenScale(0.67, false));
</script>
