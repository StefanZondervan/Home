document.addEventListener('DOMContentLoaded', () => {
  const tagInfo = {
    All: "Showing all heritage items.",
    Tangible: "Tangible heritage includes physical artifacts and monuments.",
    Intangible: "Intangible heritage involves traditions, rituals, music, and oral history.",
    Mental: "Mental heritage includes philosophical concepts, knowledge systems, and memory-based culture."
  };

  const buttons = document.querySelectorAll('.filter-bar button');
  const cards = document.querySelectorAll('.heritage-card');
  const explanation = document.getElementById('tagExplanation');

  // Initialize explanation text
  explanation.textContent = tagInfo.All;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove 'active' class from all buttons
      buttons.forEach(btn => btn.classList.remove('active'));
      // Add 'active' class to the clicked button
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      // Update explanation text
      explanation.textContent = tagInfo[filter];

      // Show/hide cards
      cards.forEach(card => {
        const tag = card.getAttribute('data-tag');
        if (filter === 'All' || tag === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Set the 'All' button as active by default on page load
  const allButton = document.querySelector('.filter-bar button[data-filter="All"]');
  if (allButton) {
      allButton.classList.add('active');
  }

  // Modal logic
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const heritageCards = document.querySelectorAll('.heritage-card');

  function openModal(cardElement) {
      modalBody.innerHTML = ''; // Clear previous content

      // Clone the entire card element
      const clonedCard = cardElement.cloneNode(true);
      // Add a class for potential modal-specific styling if needed (and to apply CSS overrides)
      clonedCard.classList.add('modal-card-display');
      clonedCard.style.transform = 'none'; // Remove any hover transform
      clonedCard.style.boxShadow = 'none'; // Remove any hover shadow if it persists

      // Ensure audio elements are playable if present
      const audioPlayer = clonedCard.querySelector('audio');
      if (audioPlayer) {
          audioPlayer.controls = true; // Ensure controls are visible
          audioPlayer.currentTime = 0; // Reset audio to start for replayability
      }

      modalBody.appendChild(clonedCard);

      modalOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent scrolling on the body when modal is open
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    modalBody.innerHTML = ''; // Clear modal content when closing
    document.body.style.overflow = ''; // Restore scrolling on the body
  }

  heritageCards.forEach(card => {
    card.addEventListener('click', () => {
      openModal(card);
    });
  });

  modalClose.addEventListener('click', closeModal);

  // Close modal if user clicks outside the modal content
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
});