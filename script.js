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

    // Define coordinates for each section (normalized 0-1 coordinates for x and y)
    const sectionCoords = {
        'introduction': { x: 0.15, y: 0.30, zoom: 2.2 },      // Left column - Introduction
        'methods': { x: 0.50, y: 0.30, zoom: 2.2 },           // Middle column - Methods
        'automation': { x: 0.20, y: 0.70, zoom: 2.5 },        // Left bottom - OT-2 Automation
        'results': { x: 0.85, y: 0.35, zoom: 2.2 },           // Right column - Results
        'future': { x: 0.55, y: 0.85, zoom: 2.5 }             // Bottom middle - Future Work
    };

    posterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-section');
            const coords = sectionCoords[section];

            if (viewer && coords) {
                // Show the viewer
                viewer.show();

                // Wait for viewer to initialize
                setTimeout(() => {
                    // First zoom to target level
                    viewer.zoomTo(coords.zoom);

                    // Then move to the target position after zoom completes
                    setTimeout(() => {
                        const viewerCanvas = viewer.viewer;
                        const imageElement = viewer.image;

                        if (viewerCanvas && imageElement) {
                            const viewerRect = viewerCanvas.getBoundingClientRect();
                            const imageData = viewer.imageData;

                            // Calculate target position in viewer coordinates
                            const targetX = imageData.naturalWidth * coords.x * coords.zoom;
                            const targetY = imageData.naturalHeight * coords.y * coords.zoom;

                            // Center the target in the viewport
                            const moveX = (viewerRect.width / 2) - targetX;
                            const moveY = (viewerRect.height / 2) - targetY;

                            viewer.moveTo(moveX, moveY);
                        }
                    }, 400);
                }, 150);
            }
        });
    });
});
