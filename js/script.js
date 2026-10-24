const scriptURL = document.currentScript.src;

document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
        document.addEventListener('click', event => {
            if (!event.target.closest('nav')) setMenuOpen(false);
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });
        matchMedia('(max-width: 1024px)').addEventListener('change', () => setMenuOpen(false));
    }

    // Content remains readable without JavaScript. Observe each entrance only once.
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -32px 0px' });
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            if (element.getBoundingClientRect().top < innerHeight) return;
            element.classList.add('will-animate');
            observer.observe(element);
        });
    }

    // The PDF remains a normal download link on phones; load the desktop embed nearby.
    const resumeFrame = document.querySelector('.resume-viewer iframe');
    if (resumeFrame) {
        const showResume = matchMedia('(min-width: 769px)');
        let resumeNearby = !('IntersectionObserver' in window);
        const loadResume = () => {
            if (!showResume.matches || !resumeNearby || !resumeFrame.dataset.src) return;
            // IntersectionObserver already deferred this request; avoid a second native delay.
            resumeFrame.loading = 'eager';
            resumeFrame.src = resumeFrame.dataset.src;
            delete resumeFrame.dataset.src;
        };
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                resumeNearby = entries[0].isIntersecting;
                loadResume();
                if (!resumeFrame.dataset.src) observer.disconnect();
            }, { rootMargin: '200px' });
            observer.observe(resumeFrame.parentElement);
        }
        showResume.addEventListener('change', loadResume);
        loadResume();
    }

    // Download the local, pinned image viewer only when someone opens a gallery.
    let viewerAssets;
    function loadViewer() {
        if (viewerAssets) return viewerAssets;
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = new URL('vendor/viewer-1.11.6.min.css', scriptURL).href;
        const script = document.createElement('script');
        script.src = new URL('vendor/viewer-1.11.6.min.js', scriptURL).href;
        script.async = true;
        viewerAssets = Promise.all([stylesheet, script].map(element => new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Image viewer timed out')), 10000);
            element.onload = () => { clearTimeout(timeout); resolve(); };
            element.onerror = () => { clearTimeout(timeout); reject(new Error('Image viewer unavailable')); };
            document.head.append(element);
        }))).catch(error => {
            stylesheet.remove();
            script.remove();
            viewerAssets = null;
            throw error;
        });
        return viewerAssets;
    }

    const sectionCoords = {
        introduction: { x: 0.13, y: 0.32, zoom: 0.45 },
        methods: { x: 0.50, y: 0.32, zoom: 0.5 },
        automation: { x: 0.13, y: 0.72, zoom: 0.35 },
        results: { x: 0.87, y: 0.32, zoom: 0.5 },
        future: { x: 0.62, y: 0.86, zoom: 0.3 },
    };
    const viewers = new Map();
    const pending = new Set();
    let targetSection = null;
    let lastControl = null;
    async function openGallery(gallery, control, section = null) {
        if (!gallery || pending.has(gallery)) return;
        pending.add(gallery);
        control.setAttribute('aria-busy', 'true');
        try {
            await loadViewer();
            let viewer = viewers.get(gallery);
            if (!viewer) {
                viewer = new Viewer(gallery, {
                    url: image => image.dataset.original || image.src,
                    // Responsive thumbnail candidates must never override the full-size URL.
                    inheritedAttributes: ['crossOrigin', 'decoding', 'referrerPolicy'],
                    navbar: false,
                    toolbar: {
                        zoomIn: true, zoomOut: true, oneToOne: true, reset: true,
                        prev: false, play: false, next: false,
                        rotateLeft: 4, rotateRight: 4, flipHorizontal: 4, flipVertical: 4,
                    },
                    transition: !reducedMotion.matches,
                    zoomRatio: 0.1, minZoomRatio: 0.1, maxZoomRatio: 5,
                    viewed() {
                        const coords = gallery.id === 'poster-gallery' && sectionCoords[targetSection];
                        if (!coords) return;
                        viewer.zoomTo(coords.zoom, false);
                        viewer.moveTo(
                            viewer.viewer.clientWidth / 2 - viewer.imageData.naturalWidth * coords.x * coords.zoom,
                            viewer.viewer.clientHeight / 2 - viewer.imageData.naturalHeight * coords.y * coords.zoom,
                        );
                    },
                    hidden() {
                        if (lastControl) lastControl.focus({ preventScroll: true });
                    },
                });
                viewers.set(gallery, viewer);
            }
            lastControl = control;
            targetSection = section;
            viewer.show();
        } catch (error) {
            // Preserve access to full-resolution images if the enhanced viewer fails.
            window.location.assign(gallery.href);
        } finally {
            pending.delete(gallery);
            control.removeAttribute('aria-busy');
        }
    }
    document.querySelectorAll('.poster-preview, .mems-image-container').forEach(gallery => {
        gallery.addEventListener('click', event => {
            // Avoid the viewer's own image click handler; modified clicks stay native links.
            event.stopImmediatePropagation();
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            openGallery(gallery, gallery);
        }, { capture: true });
    });
    document.querySelectorAll('.poster-btn').forEach(button => {
        button.addEventListener('click', () => {
            openGallery(document.getElementById('poster-gallery'), button, button.dataset.section);
        });
    });

    // Keep the original simulation, without loading WebGL on phones or reduced-data/motion visits.
    const desktop = matchMedia('(min-width: 1025px)');
    let flowStarted = false;
    let flowNearby = !('IntersectionObserver' in window);
    async function loadFlow() {
        if (!desktop.matches || reducedMotion.matches || navigator.connection?.saveData ||
            !flowNearby || document.hidden || flowStarted || !document.getElementById('liquid-flow-canvas')) return;
        flowStarted = true;
        try {
            const { startLiquidFlow } = await import(new URL('liquid-flow.js?v=3', scriptURL).href);
            startLiquidFlow();
        } catch (error) {
            flowStarted = false;
            console.warn('Liquid flow could not start:', error);
        }
    }
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            flowNearby = true;
            observer.disconnect();
            loadFlow();
        }, { rootMargin: '100px' });
        document.querySelectorAll('body > section.section').forEach(section => observer.observe(section));
    }
    desktop.addEventListener('change', loadFlow);
    reducedMotion.addEventListener('change', loadFlow);
    document.addEventListener('visibilitychange', loadFlow);
    loadFlow();
});
