// Apply the saved theme before first paint (no flash). Falls back to the system preference.
try {
  var t = localStorage.getItem('studyhub-theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.dataset.theme = 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0c1d22');
  }
} catch (e) { /* storage blocked: stay light */ }
