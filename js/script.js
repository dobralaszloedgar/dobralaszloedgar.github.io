document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Observer for animations
    const observerElements = document.querySelectorAll('.animate-on-scroll, .animate-photo');
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

    // Smooth scroll behavior
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

    // Poster viewer logic
    const posterGallery = document.getElementById('poster-gallery');
    let viewer = null;
    let targetSection = null;
    if (posterGallery) {
        viewer = new Viewer(posterGallery, {
            inline: false,
            viewed() {
                if (targetSection && sectionCoords[targetSection]) {
                    const coords = sectionCoords[targetSection];
                    setTimeout(() => {
                        const imageData = viewer.imageData;
                        const containerWidth = viewer.viewer.offsetWidth;
                        const containerHeight = viewer.viewer.offsetHeight;
                        const targetX = imageData.naturalWidth * coords.x;
                        const targetY = imageData.naturalHeight * coords.y;
                        viewer.zoomTo(coords.zoom);
                        setTimeout(() => {
                            const scaledTargetX = targetX * coords.zoom;
                            const scaledTargetY = targetY * coords.zoom;
                            const left = (containerWidth / 2) - scaledTargetX;
                            const top = (containerHeight / 2) - scaledTargetY;
                            viewer.moveTo(left, top);
                        }, 500);
                    }, 200);
                }
            },
            toolbar: {
                zoomIn: 4, zoomOut: 4, oneToOne: 4, reset: 4, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
            },
            title: true, navbar: false, tooltip: true, movable: true, zoomable: true, rotatable: true, scalable: true, transition: true, fullscreen: true, keyboard: true, zoomRatio: 0.1, minZoomRatio: 0.1, maxZoomRatio: 5,
        });
    }

    // GPC viewer logic
    const gpcGallery = document.getElementById('gpc-gallery');
    if (gpcGallery) {
        new Viewer(gpcGallery, {
            inline: false,
            toolbar: {
                zoomIn: 4, zoomOut: 4, oneToOne: 4, reset: 4, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
            },
            title: true, navbar: false, tooltip: true, movable: true, zoomable: true, rotatable: true, scalable: true, transition: true, fullscreen: true, keyboard: true, zoomRatio: 0.1, minZoomRatio: 0.1, maxZoomRatio: 5,
        });
    }

    // MEMS viewer logic
    const pressureSensorGallery = document.getElementById('pressure-sensor-gallery');
    if (pressureSensorGallery) {
        new Viewer(pressureSensorGallery, {
            inline: false,
            url: (image) => image.dataset.original || image.src,
            toolbar: {
                zoomIn: 4, zoomOut: 4, oneToOne: 4, reset: 4, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
            },
            title: (image) => `${image.alt} - Diagram`,
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

    const microfluidicMixerGallery = document.getElementById('microfluidic-mixer-gallery');
    if (microfluidicMixerGallery) {
        new Viewer(microfluidicMixerGallery, {
            inline: false,
            url: (image) => image.dataset.original || image.src,
            toolbar: {
                zoomIn: 4, zoomOut: 4, oneToOne: 4, reset: 4, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
            },
            title: (image) => `${image.alt} - Diagram`,
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

    const sectionCoords = {
        'introduction': { x: 0.13, y: 0.32, zoom: 0.45 },
        'methods': { x: 0.50, y: 0.32, zoom: 0.5 },
        'automation': { x: 0.13, y: 0.72, zoom: 0.35 },
        'results': { x: 0.87, y: 0.32, zoom: 0.5 },
        'future': { x: 0.62, y: 0.86, zoom: 0.3 }
    };

    document.querySelectorAll('.poster-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-section');
            if (viewer) {
                targetSection = section;
                viewer.show();
            }
        });
    });

    // Keep the original left-side simulation; load Three.js only on desktop.
    const desktop = matchMedia('(min-width: 1025px)');
    const flowModule = new URL('liquid-flow.js?v=2', document.querySelector('script[src*="js/script.js"]').src);
    let flowStarted = false;
    async function loadFlow() {
        if (!desktop.matches || flowStarted || !document.getElementById('liquid-flow-canvas')) return;
        flowStarted = true;
        try {
            const { startLiquidFlow } = await import(flowModule.href);
            startLiquidFlow();
        } catch (error) {
            console.warn('Liquid flow could not start:', error);
        }
    }
    desktop.addEventListener('change', loadFlow);
    loadFlow();
});
