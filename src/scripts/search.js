// Search Functionality
(function () {
  const searchInput = document.getElementById('search-input');
  const toolCards = document.querySelectorAll('.tool-card');
  const categorySection = document.querySelectorAll('.category-section');

  if (!searchInput) return;

  let searchTimeout;

  function getActivePlatform() {
    const activeBtn = document.querySelector('.platform-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-platform') : 'all';
  }

  function performSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const activePlatform = getActivePlatform();

    if (!normalizedQuery) {
      // Restore platform filter visibility (don't show platform-hidden cards)
      toolCards.forEach((card) => {
        const cardType = card.getAttribute('data-type') || 'mac';
        const platformMatch = activePlatform === 'all' || cardType === activePlatform;
        card.style.display = platformMatch ? '' : 'none';
      });
      categorySection.forEach((section) => {
        section.style.display = '';
      });
      return;
    }

    // Search through cards
    const hasVisibleCards = new Set();

    toolCards.forEach((card) => {
      const cardType = card.getAttribute('data-type') || 'mac';
      const platformMatch = activePlatform === 'all' || cardType === activePlatform;

      if (!platformMatch) {
        card.style.display = 'none';
        return;
      }

      const name = card.getAttribute('data-name')?.toLowerCase() || '';
      const tags = card.getAttribute('data-tags')?.toLowerCase() || '';
      const description = card.querySelector('.tool-description')?.textContent.toLowerCase() || '';

      const matches =
        name.includes(normalizedQuery) || tags.includes(normalizedQuery) || description.includes(normalizedQuery);

      if (matches) {
        card.style.display = '';
        const category = card.closest('.category-section')?.getAttribute('data-category');
        if (category) hasVisibleCards.add(category);
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide category sections based on visible cards
    categorySection.forEach((section) => {
      const category = section.getAttribute('data-category');
      section.style.display = hasVisibleCards.has(category) ? '' : 'none';
    });
  }

  // Debounced search
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value);
    }, 250);
  });

  // Clear search on escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      performSearch('');
      searchInput.blur();
    }
  });
})();
