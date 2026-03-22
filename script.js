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
    if (posterGallery) {
        const viewer = new Viewer(posterGallery, {
            inline: false,
            viewed() {
                // Auto zoom to fit on first view
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
            maxZoomRatio: 4,
        });
    }
});
