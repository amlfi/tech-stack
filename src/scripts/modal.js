// Modal functionality for tool details
(function () {
  let currentModal = null;

  // Open modal
  function openModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (!modal) return;

    currentModal = modal;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  // Close modal
  function closeModal() {
    if (!currentModal) return;

    currentModal.setAttribute('aria-hidden', 'true');
    currentModal.classList.remove('modal-open');
    document.body.style.overflow = '';
    currentModal = null;
  }

  // Event delegation for modal triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-trigger]');
    if (trigger) {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-trigger');
      openModal(modalId);
    }

    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      e.preventDefault();
      closeModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
      closeModal();
    }
  });

  // Prevent clicks inside modal content from closing
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tool-modal-overlay')) {
      closeModal();
    }
  });
})();
