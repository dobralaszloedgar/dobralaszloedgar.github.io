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

    if (posterGallery) {
        viewer = new Viewer(posterGallery, {
            inline: false,
            viewed() {
                viewer.zoomTo(1);
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

    // Define coordinates for each section (as percentages of image dimensions)
    const sectionCoords = {
        'introduction': { x: 0.13, y: 0.35, zoom: 2.5 },      // Left column - Introduction
        'methods': { x: 0.5, y: 0.35, zoom: 2.5 },           // Middle column - Methods
        'automation': { x: 0.13, y: 0.72, zoom: 2.8 },       // Left bottom - OT-2 Automation
        'results': { x: 0.87, y: 0.40, zoom: 2.5 },          // Right column - Results
        'future': { x: 0.63, y: 0.88, zoom: 2.8 }            // Bottom middle - Future Work
    };

    posterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-section');
            const coords = sectionCoords[section];

            if (viewer && coords) {
                // Show the viewer
                viewer.show();

                // Wait for viewer to be ready, then zoom to section
                setTimeout(() => {
                    const image = viewer.image;
                    const container = viewer.viewer;

                    if (image && container) {
                        // Calculate position to center the section
                        const imageWidth = image.naturalWidth;
                        const imageHeight = image.naturalHeight;

                        // Zoom to the specified level
                        viewer.zoomTo(coords.zoom);

                        // Move to center the section
                        setTimeout(() => {
                            const viewerWidth = container.offsetWidth;
                            const viewerHeight = container.offsetHeight;
                            const scaledWidth = imageWidth * coords.zoom;
                            const scaledHeight = imageHeight * coords.zoom;

                            // Calculate offset to center the target coordinates
                            const targetX = coords.x * scaledWidth;
                            const targetY = coords.y * scaledHeight;
                            const offsetX = (viewerWidth / 2) - targetX;
                            const offsetY = (viewerHeight / 2) - targetY;

                            viewer.moveTo(offsetX, offsetY);
                        }, 300);
                    }
                }, 100);
            }
        });
    });
});
