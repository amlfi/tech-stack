// Category Filter Functionality
(function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const categorySections = document.querySelectorAll('.category-section');
  const searchInput = document.getElementById('search-input');

  function filterByCategory(categoryId) {
    if (categoryId === 'all') {
      // Show all sections
      categorySections.forEach(section => {
        section.style.display = 'block';
      });
    } else {
      // Show only selected category
      categorySections.forEach(section => {
        const sectionCategory = section.getAttribute('data-category');
        const shouldShow = sectionCategory === categoryId;
        section.style.display = shouldShow ? 'block' : 'none';
      });
    }

    // Update active button
    filterButtons.forEach(btn => {
      const btnCategory = btn.getAttribute('data-category');
      if (btnCategory === categoryId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Store filter preference
    try {
      localStorage.setItem('tech-stack-filter', categoryId);
    } catch (e) {
      // localStorage might be unavailable
    }
  }

  // Add click listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      filterByCategory(category);
    });
  });

  // Restore filter on page load
  try {
    const storedFilter = localStorage.getItem('tech-stack-filter');
    if (storedFilter && storedFilter !== 'all') {
      filterByCategory(storedFilter);
    }
  } catch (e) {
    // localStorage might be unavailable
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Alt + Number for category shortcuts
    if (e.altKey && e.key >= '0' && e.key <= '9') {
      const index = parseInt(e.key, 10);
      if (filterButtons[index]) {
        e.preventDefault();
        filterButtons[index].click();
      }
    }

    // Alt + A for "All"
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      filterByCategory('all');
    }
  });
})();
