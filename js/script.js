document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        const setMenuOpen = (open) => {
            navLinks.classList.toggle('active', open);
            menuToggle.setAttribute('aria-expanded', String(open));
        };
        menuToggle.addEventListener('click', () => {
            setMenuOpen(!navLinks.classList.contains('active'));
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                setMenuOpen(false);
            });
        });
        document.addEventListener('click', (event) => {
            if (!event.target.closest('nav')) setMenuOpen(false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });
        matchMedia('(max-width: 1024px)').addEventListener('change', () => setMenuOpen(false));
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
        threshold: 0,
        rootMargin: '0px 0px -32px 0px'
    });
    observerElements.forEach(el => observer.observe(el));

    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Poster viewer logic
    const posterGallery = document.getElementById('poster-gallery');
    let viewer = null;
    let targetSection = null;
    // Native image links remain usable if the external viewer is unavailable.
    function createViewer(gallery, options) {
        if (typeof Viewer === 'undefined') return null;
        const galleryViewer = new Viewer(gallery, {
            ...options,
            transition: !matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
        gallery.addEventListener('click', (event) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            if (gallery === posterGallery) targetSection = null;
            galleryViewer.show();
        });
        return galleryViewer;
    }
    if (posterGallery) {
        viewer = createViewer(posterGallery, {
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
                zoomIn: true, zoomOut: true, oneToOne: true, reset: true, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
            },
            title: true, navbar: false, tooltip: true, movable: true, zoomable: true, rotatable: true, scalable: true, transition: true, fullscreen: true, keyboard: true, zoomRatio: 0.1, minZoomRatio: 0.1, maxZoomRatio: 5,
        });
    }

    // GPC viewer logic
    const gpcGallery = document.getElementById('gpc-gallery');
    if (gpcGallery) {
        createViewer(gpcGallery, {
            inline: false,
            toolbar: {
                zoomIn: true, zoomOut: true, oneToOne: true, reset: true, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
            },
            title: true, navbar: false, tooltip: true, movable: true, zoomable: true, rotatable: true, scalable: true, transition: true, fullscreen: true, keyboard: true, zoomRatio: 0.1, minZoomRatio: 0.1, maxZoomRatio: 5,
        });
    }

    // MEMS viewer logic
    const pressureSensorGallery = document.getElementById('pressure-sensor-gallery');
    if (pressureSensorGallery) {
        createViewer(pressureSensorGallery, {
            inline: false,
            url: (image) => image.dataset.original || image.src,
            toolbar: {
                zoomIn: true, zoomOut: true, oneToOne: true, reset: true, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
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
        createViewer(microfluidicMixerGallery, {
            inline: false,
            url: (image) => image.dataset.original || image.src,
            toolbar: {
                zoomIn: true, zoomOut: true, oneToOne: true, reset: true, prev: false, play: false, next: false, rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
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
            } else if (posterGallery) {
                window.location.href = posterGallery.href;
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
