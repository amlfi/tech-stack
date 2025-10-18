// Theme Management
(function() {
  const THEME_KEY = 'tech-stack-theme';
  const themeToggle = document.getElementById('theme-toggle');

  // Get stored theme or default to 'auto'
  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || 'auto';
  }

  // Get effective theme (resolves 'auto' to 'light' or 'dark')
  function getEffectiveTheme() {
    const stored = getStoredTheme();
    if (stored !== 'auto') return stored;

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme
  function applyTheme(theme) {
    const effective = theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    document.documentElement.setAttribute('data-theme', effective);
  }

  // Toggle theme
  function toggleTheme() {
    const current = getStoredTheme();
    const next = current === 'light' ? 'dark' : 'light';

    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // Initialize
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  // Listen for toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes (when theme is 'auto')
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getStoredTheme() === 'auto') {
      applyTheme('auto');
    }
  });
})();
