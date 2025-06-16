document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const legendItems = document.querySelectorAll('.legend-item');
 
  // Main map display elements that will fade and are linked by ID
  const introImage = document.getElementById('intro-image');
  const institutionalImage = document.getElementById('institutional-image');
  const mentalRiverImage = document.getElementById('mental-river-image');
  const portLines = document.getElementById('Port_lines'); // Ensure this ID exists in your SVG
  const maasRiverLine = document.getElementById('Maas_River_Line'); // Ensure this ID exists in your SVG
  const mapBackground = document.getElementById('map-background');

  // Group all individual SVG elements (dots and lines) that need fading and interaction
  // Ensure their IDs/classes are correctly referenced here.
  const allControlledSvgElements = document.querySelectorAll(
      '.cls-1, .cls-2, .cls-4, .cls-5, .cls-1-water, .cls-6, #Port_lines, #Maas_River_Line'
  );

  const containers = {
      tangible: document.getElementById('tangible-images'),
      institutional: document.getElementById('institutional-images'),
      intangible: document.getElementById('intangible-images'),
      mental: document.getElementById('mental-images')
  };

  const slides = {
      tangible: {
          images: document.querySelectorAll('#tangible-images .carousel-slide'),
          texts: document.querySelectorAll('#tangible-images .text-slide'),
          dots: Array.from(document.querySelectorAll('.cls-1')) // Assuming cls-1 are tangible dots
      },
      institutional: {
          images: document.querySelectorAll('#institutional-images .carousel-slide'),
          texts: document.querySelectorAll('#institutional-images .text-slide'),
          dots: Array.from(document.querySelectorAll('.cls-5')) // Assuming cls-5 are institutional dots
      },
      intangible: {
          images: document.querySelectorAll('#intangible-images .carousel-slide'),
          texts: document.querySelectorAll('#intangible-images .text-slide'),
          dots: Array.from(document.querySelectorAll('.cls-2')) // Assuming cls-2 are intangible dots
      },
      mental: {
          images: document.querySelectorAll('#mental-images .carousel-slide'),
          texts: document.querySelectorAll('#mental-images .text-slide'),
          dots: Array.from(document.querySelectorAll('.cls-4')) // Assuming cls-4 are mental dots
      }
  };

  const textSections = document.querySelectorAll('.text-section');

  // Store current slide per category to remember user's last position
  const currentSlides = {
      tangible: 0,
      institutional: 0,
      intangible: 0,
      mental: 0
  };

  let activeCategory = null;

  // Add fade-element class to all relevant elements that need to fade
  // This is safer than relying on manual addition in HTML, especially for SVG elements
  [introImage, institutionalImage, mentalRiverImage, ...Array.from(allControlledSvgElements)].forEach(el => {
      if (el) { // Check if element exists before adding class
          el.classList.add('fade-element');
      }
  });


  // Helper to control visibility with fade effect (for images and main SVG elements)
  function setFadeElementVisibility(element, isVisible) {
      if (element) {
          if (isVisible) {
              element.classList.add('is-visible');
          } else {
              element.classList.remove('is-visible');
          }
      }
  }

  // Function to hide all main display elements (images, SVG lines, dots)
  function hideAllDisplayElements() {
      // Hide all main image overlays
      setFadeElementVisibility(introImage, false);
      setFadeElementVisibility(institutionalImage, false);
      setFadeElementVisibility(mentalRiverImage, false);

      // Hide all controlled SVG elements and reset their interaction classes
      allControlledSvgElements.forEach(el => {
          setFadeElementVisibility(el, false); // Hide via fade-element
          // Highlighted class will now fade out with opacity due to CSS transition change
          el.classList.remove('highlighted', 'active-dot', 'flicker'); // Clear interaction classes
          el.style.animation = ''; // Ensure no lingering inline animation styles
      });
      clearFlickerFromAllDots(); // Ensures no lingering flicker state
  }

  // Show a specific slide (image + text + highlight dot)
  // The `highlightActiveDot` parameter controls if a *single* dot is "active" or just all are highlighted
  function showSlide(index, imageSlides, textSlides, svgDots, highlightActiveDot = true) {
      imageSlides.forEach((img, i) => {
          img.classList.toggle('active', i === index);
      });
      textSlides.forEach((txt, i) => {
          txt.classList.toggle('active', i === index);
      });

      // Make sure all dots of this group are highlighted, but only one is 'active-dot'
      svgDots.forEach((dot, i) => {
          dot.classList.add('highlighted');
          dot.classList.toggle('active-dot', highlightActiveDot && i === index);
          setFadeElementVisibility(dot, true); // Ensure the dot is visible via fade-element
      });
  }

  function resetAnimation(dot) {
    dot.classList.remove('flicker');
    void dot.offsetHeight; // Force reflow
    dot.classList.add('flicker');
}


function applyFlickerToDots(dots) {
  // Wait until next frame so elements are visible before flicker starts
  requestAnimationFrame(() => {
      dots.forEach(dot => {
          resetAnimation(dot); // Safely restart flicker
      });
  });
}


  // Function to clear flicker from all dots, stopping any ongoing animations
  function clearFlickerFromAllDots() {
      Object.values(slides).forEach(group => {
          group.dots.forEach(dot => {
              dot.classList.remove('flicker');
              dot.style.animation = ''; // Clear any inline animation styles that might persist
          });
      });
  }

  // Hide all image containers helper (for carousels)
  function hideAllContainers() {
      Object.values(containers).forEach(container => {
          if (container) container.style.display = 'none';
      });
  }

  // Show container helper (for carousels)
  function showImageContainer(category) {
      const container = containers[category];
      if (container) {
          container.style.display = 'flex';
      }
  }

  // Change slide index by direction (+1 or -1) for a category
  function changeSlide(direction, category) {
      const current = slides[category];
      if (!current) return;

      const length = current.images.length;
      currentSlides[category] = (currentSlides[category] + direction + length) % length;
      showSlide(currentSlides[category], current.images, current.texts, current.dots, true); // Ensure active dot is shown
      showImageContainer(category); // Ensure carousel is visible
  }

  // Handle legend item click to switch categories
  function handleLegendClick() {
      // Remove active class from all legend items
      legendItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      const category = this.getAttribute('data-category');

      // Remove all map-level classes first
mapBackground.classList.remove('map-level-full', 'map-level-medium', 'map-level-light', 'map-level-none');

// Apply background fade based on active category
switch (category) {
  case 'introduction':
  case 'institutional':
    mapBackground.classList.add('map-level-full');
    break;
  case 'tangible':
    mapBackground.classList.add('map-level-medium');
    break;
  case 'intangible':
    mapBackground.classList.add('map-level-light');
    break;
  case 'mental':
    mapBackground.classList.add('map-level-none');
    break;
}


      // 1. Hide ALL elements that can transition (images, lines, dots) and ALL carousels.
      hideAllDisplayElements();
      hideAllContainers();

      activeCategory = category;

      // 2. Display logic based on new active category
      switch (category) {
          case 'introduction':
              setFadeElementVisibility(introImage, true); // Fade in intro image
              break;

          case 'institutional':
              setFadeElementVisibility(institutionalImage, true); // Fade in institutional image overlay
              slides.institutional.dots.forEach(dot => {
                  dot.classList.add('highlighted'); // Highlight relevant dots
                  setFadeElementVisibility(dot, true); // Make them visible via fade-element
              });
              applyFlickerToDots(slides.institutional.dots); // Apply flicker
              break;

          case 'tangible':
              setFadeElementVisibility(portLines, true); // Fade in port lines
              slides.tangible.dots.forEach(dot => {
                  dot.classList.add('highlighted'); // Highlight relevant dots
                  setFadeElementVisibility(dot, true); // Make them visible via fade-element
              });
              applyFlickerToDots(slides.tangible.dots); // Apply flicker
              break;

          case 'intangible':
              setFadeElementVisibility(maasRiverLine, true); // Fade in maas river line
              slides.intangible.dots.forEach(dot => {
                  dot.classList.add('highlighted'); // Highlight relevant dots
                  setFadeElementVisibility(dot, true); // Make them visible via fade-element
              });
              // Ensure cls-1-water (if distinct elements) also gets highlighted and visible
              document.querySelectorAll('.cls-1-water').forEach(el => {
                  el.classList.add('highlighted'); // Apply highlight to water if desired
                  setFadeElementVisibility(el, true);
              });
              applyFlickerToDots(slides.intangible.dots); // Apply flicker
              break;

          case 'mental':
              setFadeElementVisibility(mentalRiverImage, true); // Fade in mental river image overlay
              slides.mental.dots.forEach(dot => {
                  dot.classList.add('highlighted'); // Highlight relevant dots
                  setFadeElementVisibility(dot, true); // Make them visible via fade-element
              });
              // Ensure cls-6 (if distinct elements) also gets highlighted and visible
              document.querySelectorAll('.cls-6').forEach(el => {
                  el.classList.add('highlighted'); // Apply highlight to other mental elements
                  setFadeElementVisibility(el, true);
              });
              applyFlickerToDots(slides.mental.dots); // Apply flicker
              break;
      }

      // Update text sections visibility
      textSections.forEach(section => {
          section.classList.toggle('active', section.getAttribute('data-category') === activeCategory);
      });
  }

  // Add carousel button event listeners for prev/next
  function addCarouselButtonListeners(prevBtnId, nextBtnId, category) {
      const prevBtn = document.getElementById(prevBtnId);
      const nextBtn = document.getElementById(nextBtnId);

      if (prevBtn) {
          prevBtn.addEventListener('click', () => {
              if (activeCategory === category) {
                  changeSlide(-1, category);
              }
          });
      }

      if (nextBtn) {
          nextBtn.addEventListener('click', () => {
              if (activeCategory === category) {
                  changeSlide(1, category);
              }
          });
      }
  }

  // Add click listeners on dots for direct navigation in carousel
  function addDotClickListeners(category) {
      const current = slides[category];
      if (!current) return;

      current.dots.forEach((dot, index) => {
          dot.style.cursor = 'pointer';
          dot.onclick = () => {
              if (activeCategory === category) {
                  currentSlides[category] = index;
                  showSlide(currentSlides[category], current.images, current.texts, current.dots, true); // Make the clicked dot active
                  showImageContainer(category); // Make the carousel visible here
              }
          };
      });
  }

  // Remove dot click listeners and reset cursor style
  function clearDotClickListeners() {
      Object.values(slides).forEach(group => {
          group.dots.forEach(dot => {
              dot.onclick = null;
              dot.style.cursor = 'default';
              dot.classList.remove('active-dot', 'flicker'); // Remove active-dot and flicker states
              dot.style.animation = ''; // Ensure no lingering flicker animation
          });
      });
  }

  // Attach event listeners to legend items
  legendItems.forEach(item => {
      item.addEventListener('click', function () {
          handleLegendClick.call(this);
          clearDotClickListeners(); // Ensure old dot listeners are cleared
          if (this.getAttribute('data-category') !== 'introduction') {
              addDotClickListeners(this.getAttribute('data-category')); // Add new dot listeners for active category
          }
      });
  });

  // Initialize carousel buttons for each category
  addCarouselButtonListeners('prev-btn', 'next-btn', 'tangible');
  addCarouselButtonListeners('inst-prev-btn', 'inst-next-btn', 'institutional');
  addCarouselButtonListeners('int-prev-btn', 'int-next-btn', 'intangible');
  addCarouselButtonListeners('men-prev-btn', 'men-next-btn', 'mental');

  // --- Default view setup on page load (Introduction category) ---
  // 1. Hide ALL elements that can transition and ALL carousels initially
  hideAllDisplayElements();
  hideAllContainers();

  // 2. Set up the initial 'introduction' state
  setFadeElementVisibility(introImage, true); // Show the intro image fading in

  textSections.forEach(section => {
      section.classList.toggle('active', section.getAttribute('data-category') === 'introduction');
  });

  legendItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-category') === 'introduction');
  });

  activeCategory = 'introduction';
});

