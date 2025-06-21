document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const mapNavigationLegendItems = document.querySelectorAll('.map-navigation-legend .legend-item');

    // Main map display elements that will fade and are linked by ID
    const introImage = document.getElementById('intro-image');
    const institutionalImage = document.getElementById('institutional-image');
    const mentalRiverImage = document.getElementById('mental-river-image');
    const portLines = document.getElementById('Port_lines');
    const maasRiverLine = document.getElementById('Maas_River_Line');
    const mapBackground = document.getElementById('map-background');

    // IMPORTANT: Get a reference to your main map SVG here
    // This selects the first SVG child of .map-container, which should be your main map.
    const mainMapSVG = document.querySelector('.map-container > svg');

    // A variable to hold our dynamically created connection line element
    let connectionLine = null; // Will be created/removed as needed

    // Group all individual SVG elements (dots and lines) that need fading and interaction
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
            dots: Array.from(document.querySelectorAll('.cls-1'))
        },
        institutional: {
            images: document.querySelectorAll('#institutional-images .carousel-slide'),
            texts: document.querySelectorAll('#institutional-images .text-slide'),
            dots: Array.from(document.querySelectorAll('.cls-5'))
        },
        intangible: {
            images: document.querySelectorAll('#intangible-images .carousel-slide'),
            texts: document.querySelectorAll('#intangible-images .text-slide'),
            dots: Array.from(document.querySelectorAll('.cls-2'))
        },
        mental: {
            images: document.querySelectorAll('#mental-images .carousel-slide'),
            texts: document.querySelectorAll('#mental-images .text-slide'),
            dots: Array.from(document.querySelectorAll('.cls-4'))
        }
    };

    const textSections = document.querySelectorAll('.text-section');

    const currentSlides = {
        tangible: 0,
        institutional: 0,
        intangible: 0,
        mental: 0
    };

    let activeCategory = null;

    function isMobileMode() {
        return window.matchMedia("(max-width: 768px)").matches;
    }

    // `connectionLine` is now created dynamically, so it's not in this initial list.
    [introImage, institutionalImage, mentalRiverImage, ...Array.from(allControlledSvgElements)].forEach(el => {
        if (el) {
            el.classList.add('fade-element');
        }
    });

    function setFadeElementVisibility(element, isVisible) {
        if (element) {
            if (isVisible) {
                element.classList.add('is-visible');
            } else {
                element.classList.remove('is-visible');
            }
        }
    }

    function hideAllDisplayElements() {
        setFadeElementVisibility(introImage, false);
        setFadeElementVisibility(institutionalImage, false);
        setFadeElementVisibility(mentalRiverImage, false);

        // Remove the connection line if it exists
        if (connectionLine && connectionLine.parentNode) {
            connectionLine.parentNode.removeChild(connectionLine);
            connectionLine = null; // Clear the reference
        }

        allControlledSvgElements.forEach(el => {
            setFadeElementVisibility(el, false);
            el.classList.remove('highlighted', 'active-dot', 'flicker');
            el.style.animation = '';
        });
        clearFlickerFromAllDots();
    }

    function showSlide(index, imageSlides, textSlides, svgDots, highlightActiveDot = true) {
        imageSlides.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
        textSlides.forEach((txt, i) => {
            txt.classList.toggle('active', i === index);
        });

        svgDots.forEach((dot, i) => {
            dot.classList.add('highlighted');
            dot.classList.toggle('active-dot', highlightActiveDot && i === index);
            setFadeElementVisibility(dot, true);
        });
    }

    function resetAnimation(dot) {
        dot.classList.remove('flicker');
        void dot.offsetHeight; // Trigger reflow to restart animation
        dot.classList.add('flicker');
    }

    function applyFlickerToDots(dots) {
        requestAnimationFrame(() => {
            dots.forEach(dot => {
                resetAnimation(dot);
            });
        });
    }

    function clearFlickerFromAllDots() {
        Object.values(slides).forEach(group => {
            group.dots.forEach(dot => {
                dot.classList.remove('flicker');
                dot.style.animation = ''; // Remove inline animation style
            });
        });
    }

    function hideAllContainers() {
        Object.values(containers).forEach(container => {
            if (container) container.style.display = 'none';
        });
        // Remove the connection line if it exists when containers hide
        if (connectionLine && connectionLine.parentNode) {
            connectionLine.parentNode.removeChild(connectionLine);
            connectionLine = null;
        }
    }

    function showImageContainer(category) {
        const container = containers[category];
        if (container) {
            container.style.display = 'flex';
        }
    }

    // Function to convert a screen (client) point to SVG coordinates
    // This function takes the screen coordinates and returns the corresponding
    // coordinates within the SVG's viewBox.
    function getSvgCoordinates(clientX, clientY) {
        if (!mainMapSVG) {
            console.error("mainMapSVG not found for coordinate transformation.");
            return { x: 0, y: 0 };
        }
        const svgPoint = mainMapSVG.createSVGPoint();
        svgPoint.x = clientX;
        svgPoint.y = clientY;
        try {
            const CTM = mainMapSVG.getScreenCTM(); // Get CTM from screen to SVG space
            if (CTM) {
                return svgPoint.matrixTransform(CTM.inverse()); // Invert CTM to go from screen to SVG
            }
        } catch (e) {
            console.error("Error getting SVG CTM or transforming point:", e);
        }
        return { x: 0, y: 0 };
    }


    // Function to create or update the connection line
    function updateConnectionLine(dotElement, containerElement) {
        if (!dotElement || !containerElement || !mainMapSVG) {
            // Remove line if elements are missing or main SVG is not ready
            if (connectionLine && connectionLine.parentNode) {
                connectionLine.parentNode.removeChild(connectionLine);
                connectionLine = null;
            }
            return;
        }

        // If line doesn't exist, create it
        if (!connectionLine) {
            connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            connectionLine.setAttribute('id', 'dynamic-connection-line');
            connectionLine.setAttribute('stroke', '#398273'); // Use your website's main green color
            connectionLine.setAttribute('stroke-width', '2'); // Match stroke-width of existing lines
            connectionLine.setAttribute('stroke-linecap', 'round');
            connectionLine.removeAttribute('stroke-dasharray'); // Remove the dashed effect
            connectionLine.style.pointerEvents = 'none'; // Ensure clicks pass through
            connectionLine.style.opacity = '0'; // Start hidden for transition
            connectionLine.style.transition = 'opacity 0.3s ease-in-out'; // Add transition for fading
            mainMapSVG.appendChild(connectionLine);
        }

        // --- Calculate Dot Center in SCREEN Coordinates directly from its bounding box ---
        // This is the key change to improve accuracy for the dot's starting point
        const dotRect = dotElement.getBoundingClientRect();
        const screenDotCenter = {
            x: dotRect.left + dotRect.width / 2,
            y: dotRect.top + dotRect.height / 2
        };
        // console.log('1. Dot Screen Coords (from getBoundingClientRect):', screenDotCenter.x, screenDotCenter.y);


        // --- Get Container's Rect in Screen Coordinates ---
        const containerRect = containerElement.getBoundingClientRect(); // Get container's screen position
        // console.log('2. Container Bounding Rect (screen coords):', containerRect.left, containerRect.top, containerRect.width, containerRect.height);


        // --- Calculate Container Connection Point in Screen Coordinates ---
        let containerScreenX, containerScreenY;
        const containerMidX = containerRect.left + containerRect.width / 2;
        const containerMidY = containerRect.top + containerRect.height / 2;

        // Determine which side of the container the line should connect to
        // If the dot is to the left of the container's center, connect to the container's left edge
        if (screenDotCenter.x < containerMidX) {
            containerScreenX = containerRect.left;
        } else {
            // Otherwise, connect to the container's right edge
            containerScreenX = containerRect.right;
        }
        // Connect to the vertical center of the container
        containerScreenY = containerMidY;
        // console.log('3. Container Connection Screen Point:', containerScreenX, containerScreenY);


        // --- Convert Screen Coordinates of Connection Points to SVG Coordinates for the Line ---
        const startPointInSvg = getSvgCoordinates(screenDotCenter.x, screenDotCenter.y);
        const endPointInSvg = getSvgCoordinates(containerScreenX, containerScreenY);
        // console.log('4. Line Start SVG Coords (for x1,y1):', startPointInSvg.x, startPointInSvg.y);
        // console.log('5. Line End SVG Coords (for x2,y2):', endPointInSvg.x, endPointInSvg.y);

        connectionLine.setAttribute('x1', startPointInSvg.x);
        connectionLine.setAttribute('y1', startPointInSvg.y);
        connectionLine.setAttribute('x2', endPointInSvg.x);
        connectionLine.setAttribute('y2', endPointInSvg.y);

        // Make the line visible after setting its attributes
        connectionLine.style.opacity = '1';
    }


    function changeSlide(direction, category) {
        const current = slides[category];
        if (!current) return;

        const length = current.images.length;
        currentSlides[category] = (currentSlides[category] + direction + length) % length;
        showSlide(currentSlides[category], current.images, current.texts, current.dots, true);
        showImageContainer(category);

        if (activeCategory === category) {
            const currentDot = current.dots[currentSlides[category]];
            const currentContainer = containers[category];
            updateConnectionLine(currentDot, currentContainer);
        }
    }

    function handleLegendClick() {
        mapNavigationLegendItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        const category = this.getAttribute('data-category');

        mapBackground.classList.remove('map-level-full', 'map-level-medium', 'map-level-light', 'map-level-none');

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

        hideAllDisplayElements();
        hideAllContainers(); // This will now also remove the connection line if it exists

        activeCategory = category;

        let dotsToFlicker = [];

        switch (category) {
            case 'introduction':
                setFadeElementVisibility(introImage, true);
                break;

            case 'institutional':
                setFadeElementVisibility(institutionalImage, true);
                slides.institutional.dots.forEach(dot => {
                    dot.classList.add('highlighted');
                    setFadeElementVisibility(dot, true);
                });
                dotsToFlicker = slides.institutional.dots;
                break;

            case 'tangible':
                setFadeElementVisibility(portLines, true);
                slides.tangible.dots.forEach(dot => {
                    dot.classList.add('highlighted');
                    setFadeElementVisibility(dot, true);
                });
                dotsToFlicker = slides.tangible.dots;
                break;

            case 'intangible':
                setFadeElementVisibility(maasRiverLine, true);
                slides.intangible.dots.forEach(dot => {
                    dot.classList.add('highlighted');
                    setFadeElementVisibility(dot, true);
                });
                document.querySelectorAll('.cls-1-water').forEach(el => {
                    el.classList.add('highlighted');
                    setFadeElementVisibility(el, true);
                });
                dotsToFlicker = slides.intangible.dots;
                break;

            case 'mental':
                setFadeElementVisibility(mentalRiverImage, true);
                slides.mental.dots.forEach(dot => {
                    dot.classList.add('highlighted');
                    setFadeElementVisibility(dot, true);
                });
                document.querySelectorAll('.cls-6').forEach(el => {
                    el.classList.add('highlighted');
                    setFadeElementVisibility(el, true);
                });
                dotsToFlicker = slides.mental.dots;
                break;
        }

        textSections.forEach(section => {
            section.classList.toggle('active', section.getAttribute('data-category') === activeCategory);
        });

        if (category !== 'introduction') {
            const selectedSlides = slides[category];
            if (selectedSlides && selectedSlides.dots.length > 0) {
                if (isMobileMode()) {
                    clearFlickerFromAllDots();
                    currentSlides[category] = 0;
                    showSlide(0, selectedSlides.images, selectedSlides.texts, selectedSlides.dots, true);
                    showImageContainer(category);
                    if (selectedSlides.dots[0]) {
                        resetAnimation(selectedSlides.dots[0]);
                        // Update line for the first dot on mobile when category is selected
                        updateConnectionLine(selectedSlides.dots[0], containers[category]);
                    }
                } else {
                    applyFlickerToDots(dotsToFlicker);
                }
            }
        }
    }

    function addCarouselButtonListeners(prevBtnId, nextBtnId, category) {
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (prevBtn) {
            prevBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (activeCategory === category) {
                    changeSlide(-1, category);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (activeCategory === category) {
                    changeSlide(1, category);
                }
            });
        }
    }

    function addDotClickListeners(category) {
        const current = slides[category];
        if (!current) return;

        current.dots.forEach((dot, index) => {
            dot.style.cursor = 'pointer';
            dot.onclick = (event) => {
                event.stopPropagation();
                if (activeCategory === category) {
                    clearFlickerFromAllDots();
                    currentSlides[category] = index;
                    showSlide(currentSlides[category], current.images, current.texts, current.dots, true);
                    showImageContainer(category);
                    if (current.dots[index]) {
                        resetAnimation(current.dots[index]);
                        // Update connection line when a dot is clicked
                        updateConnectionLine(dot, containers[category]);
                    }
                }
            };
        });
    }

    function clearDotClickListeners() {
        Object.values(slides).forEach(group => {
            group.dots.forEach(dot => {
                dot.onclick = null;
                dot.style.cursor = 'default';
                dot.classList.remove('active-dot', 'flicker');
                dot.style.animation = '';
            });
        });
    }

    mapNavigationLegendItems.forEach(item => {
        item.addEventListener('click', function () {
            handleLegendClick.call(this);
            clearDotClickListeners();
            if (this.getAttribute('data-category') !== 'introduction') {
                addDotClickListeners(this.getAttribute('data-category'));
            }
        });
    });

    addCarouselButtonListeners('prev-btn', 'next-btn', 'tangible');
    addCarouselButtonListeners('inst-prev-btn', 'inst-next-btn', 'institutional');
    addCarouselButtonListeners('int-prev-btn', 'int-next-btn', 'intangible');
    addCarouselButtonListeners('men-prev-btn', 'men-next-btn', 'mental');

    document.addEventListener('click', function(event) {
        let clickedInsideCarousel = false;
        for (const key in containers) {
            if (containers[key] && containers[key].contains(event.target)) {
                clickedInsideCarousel = true;
                break;
            }
        }

        const clickedOnDot = event.target.closest('.cls-1, .cls-2, .cls-4, .cls-5');
        const clickedOnLegend = event.target.closest('.map-navigation-legend .legend-item');

        if (!clickedInsideCarousel && !clickedOnDot && !clickedOnLegend) {
            hideAllContainers();
        }
    });

    // Handle window resize to re-draw the line
    window.addEventListener('resize', () => {
        // Only update line if a carousel is currently visible
        if (activeCategory && containers[activeCategory] && containers[activeCategory].style.display !== 'none') {
            const current = slides[activeCategory];
            if (current && current.dots.length > 0) {
                const currentDot = current.dots[currentSlides[activeCategory]];
                const currentContainer = containers[activeCategory];
                if (currentDot && currentContainer) {
                    updateConnectionLine(currentDot, currentContainer);
                }
            }
        }
    });

    // --- Default view setup on page load (Introduction category) ---
    hideAllDisplayElements();
    hideAllContainers(); // This will ensure any previously created line is removed on initial load

    setFadeElementVisibility(introImage, true);

    textSections.forEach(section => {
        section.classList.toggle('active', section.getAttribute('data-category') === 'introduction');
    });

    mapNavigationLegendItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-category') === 'introduction');
    });

    activeCategory = 'introduction';
});