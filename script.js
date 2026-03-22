document.addEventListener('DOMContentLoaded', () => {
    const observerElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15
    });

    observerElements.forEach(el => observer.observe(el));

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize poster viewer with zoom and pan capabilities
    const posterGallery = document.getElementById('poster-gallery');
    let viewer = null;
    let targetSection = null;

    if (posterGallery) {
        viewer = new Viewer(posterGallery, {
            inline: false,
            viewed() {
                // When viewer opens, check if we need to zoom to a section
                if (targetSection && sectionCoords[targetSection]) {
                    const coords = sectionCoords[targetSection];

                    setTimeout(() => {
                        const imageData = viewer.imageData;
                        const containerWidth = viewer.viewer.offsetWidth;
                        const containerHeight = viewer.viewer.offsetHeight;

                        // Calculate the target point in original image coordinates
                        const targetX = imageData.naturalWidth * coords.x;
                        const targetY = imageData.naturalHeight * coords.y;

                        // Zoom to the specified level
                        viewer.zoomTo(coords.zoom);

                        // Wait for zoom animation, then pan
                        setTimeout(() => {
                            // Get current image position after zoom
                            const currentImageData = viewer.imageData;

                            // Calculate where the target point is now (after zoom)
                            const scaledTargetX = targetX * coords.zoom;
                            const scaledTargetY = targetY * coords.zoom;

                            // Calculate the left/top needed to center the target point
                            const left = (containerWidth / 2) - scaledTargetX;
                            const top = (containerHeight / 2) - scaledTargetY;

                            viewer.moveTo(left, top);
                        }, 500);
                    }, 200);
                }
            },
            toolbar: {
                zoomIn: 4,
                zoomOut: 4,
                oneToOne: 4,
                reset: 4,
                prev: false,
                play: false,
                next: false,
                rotateLeft: 4,
                rotateRight: 4,
                flipHorizontal: 4,
                flipVertical: 4,
            },
            title: true,
            navbar: false,
            tooltip: true,
            movable: true,
            zoomable: true,
            rotatable: true,
            scalable: true,
            transition: true,
            fullscreen: true,
            keyboard: true,
            zoomRatio: 0.1,
            minZoomRatio: 0.1,
            maxZoomRatio: 5,
        });
    }

    // Interactive poster section zoom
    const posterButtons = document.querySelectorAll('.poster-btn');

    // Define coordinates for each section (normalized 0-1 coordinates)
    // Reduced zoom levels for better context visibility
    const sectionCoords = {
        'introduction': { x: 0.13, y: 0.32, zoom: 1.5 },      // Left column - Introduction & BBCPs
        'methods': { x: 0.50, y: 0.32, zoom: 1.5 },           // Middle column - Methods workflow
        'automation': { x: 0.13, y: 0.72, zoom: 1.6 },        // Left bottom - OT-2 Automation
        'results': { x: 0.87, y: 0.32, zoom: 1.5 },           // Right column - GPC Results
        'future': { x: 0.62, y: 0.86, zoom: 1.6 }             // Bottom center - Future Work
    };

    posterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-section');

            if (viewer) {
                // Set target section
                targetSection = section;

                // Show the viewer (the 'viewed' callback will handle zooming)
                viewer.show();
            }
        });
    });
});
