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
        const filter = button.getAttribute('data-filter');
  
        // Update explanation text instantly (no fade)
        explanation.textContent = tagInfo[filter];
  
        // Show/hide cards instantly with display toggling
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
  
    // Modal logic remains the same
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const heritageCards = document.querySelectorAll('.heritage-card');
  
    function openModal(content) {
      modalBody.innerHTML = '';
      modalBody.appendChild(content.cloneNode(true));
      modalOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  
    function closeModal() {
      modalOverlay.style.display = 'none';
      modalBody.innerHTML = '';
      document.body.style.overflow = '';
    }
  
    heritageCards.forEach(card => {
      card.addEventListener('click', () => {
        openModal(card);
      });
    });
  
    modalClose.addEventListener('click', closeModal);
  
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  });
  