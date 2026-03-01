// Category & Platform Filter Functionality
(function () {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const platformButtons = document.querySelectorAll('.platform-btn');
  const categorySections = document.querySelectorAll('.category-section');
  const toolCards = document.querySelectorAll('.tool-card');

  let activeCategory = 'all';
  let activePlatform = 'all';

  function applyFilters() {
    const hasVisibleCards = new Set();

    // Filter individual cards by platform
    toolCards.forEach((card) => {
      const cardType = card.getAttribute('data-type') || 'mac';
      const platformMatch = activePlatform === 'all' || cardType === activePlatform;
      card.style.display = platformMatch ? '' : 'none';

      if (platformMatch) {
        const section = card.closest('.category-section');
        if (section) hasVisibleCards.add(section.getAttribute('data-category'));
      }
    });

    // Filter category sections
    categorySections.forEach((section) => {
      const sectionCategory = section.getAttribute('data-category');
      const categoryMatch = activeCategory === 'all' || sectionCategory === activeCategory;
      const hasPlatformCards = hasVisibleCards.has(sectionCategory);
      section.style.display = categoryMatch && hasPlatformCards ? 'block' : 'none';
    });

    // Hide empty subcategory groups
    document.querySelectorAll('.subcategory-group').forEach((group) => {
      const visibleCards = group.querySelectorAll('.tool-card:not([style*="display: none"])');
      group.style.display = visibleCards.length > 0 ? '' : 'none';
    });
  }

  function filterByCategory(categoryId) {
    activeCategory = categoryId;

    filterButtons.forEach((btn) => {
      if (btn.getAttribute('data-category') === categoryId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    applyFilters();

    try {
      localStorage.setItem('tech-stack-filter', categoryId);
    } catch (_e) {}
  }

  function filterByPlatform(platform) {
    activePlatform = platform;

    platformButtons.forEach((btn) => {
      if (btn.getAttribute('data-platform') === platform) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    applyFilters();

    try {
      localStorage.setItem('tech-stack-platform', platform);
    } catch (_e) {}
  }

  // Category button clicks
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterByCategory(btn.getAttribute('data-category'));
    });
  });

  // Platform button clicks
  platformButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterByPlatform(btn.getAttribute('data-platform'));
    });
  });

  // Restore filters on page load
  try {
    const storedFilter = localStorage.getItem('tech-stack-filter');
    if (storedFilter && storedFilter !== 'all') {
      activeCategory = storedFilter;
      filterButtons.forEach((btn) => {
        if (btn.getAttribute('data-category') === storedFilter) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const storedPlatform = localStorage.getItem('tech-stack-platform');
    if (storedPlatform && storedPlatform !== 'all') {
      activePlatform = storedPlatform;
      platformButtons.forEach((btn) => {
        if (btn.getAttribute('data-platform') === storedPlatform) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    if (activeCategory !== 'all' || activePlatform !== 'all') {
      applyFilters();
    }
  } catch (_e) {}

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key >= '0' && e.key <= '9') {
      const index = parseInt(e.key, 10);
      if (filterButtons[index]) {
        e.preventDefault();
        filterButtons[index].click();
      }
    }

    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      filterByCategory('all');
      filterByPlatform('all');
    }
  });
})();
