document.addEventListener('DOMContentLoaded', () => {
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
        'introduction': { x: 0.13, y: 0.32, zoom: 0.45 },      // Left column - Introduction & BBCPs
        'methods': { x: 0.50, y: 0.32, zoom: 0.5 },           // Middle column - Methods workflow
        'automation': { x: 0.13, y: 0.72, zoom: 0.35 },        // Left bottom - OT-2 Automation
        'results': { x: 0.87, y: 0.32, zoom: 0.5 },           // Right column - GPC Results
        'future': { x: 0.62, y: 0.86, zoom: 0.3 }             // Bottom center - Future Work
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

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('liquid-flow-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('liquid-flow-container');
    let width = container.offsetWidth;
    let height = document.body.scrollHeight;
    canvas.width = width;
    canvas.height = height;

    const particleCount = 300; // Increased particle count
    const allParticles = [];
    const particleRadius = 5;
    const baseSpeedY = 1.5;

    function createParticle(color, initialXRange) {
        for (let i = 0; i < particleCount / 2; i++) {
            allParticles.push({
                x: initialXRange[0] + Math.random() * (initialXRange[1] - initialXRange[0]),
                y: Math.random() * height,
                vy: baseSpeedY + (Math.random() - 0.5) * 0.5,
                vx: (Math.random() - 0.5) * 0.2,
                color: color
            });
        }
    }

    createParticle('#40916C', [width * 0.1, width * 0.45]); // First current
    createParticle('#52B788', [width * 0.55, width * 0.9]); // Second current

    function resolveCollision(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < particleRadius * 2) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate p1's position
            const pos0 = { x: 0, y: 0 };

            // Rotate p2's position
            const pos1 = { x: dx * cos + dy * sin, y: dy * cos - dx * sin };

            // Rotate p1's velocity
            const vel0 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin };

            // Rotate p2's velocity
            const vel1 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin };
            
            // Collision reaction
            const vxTotal = vel0.x - vel1.x;
            vel0.x = ((p1.mass - p2.mass) * vel0.x + 2 * p2.mass * vel1.x) / (p1.mass + p2.mass);
            vel1.x = vxTotal + vel0.x;
            
            // Move particles apart
            const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
            const overlap = (particleRadius * 2) - dist;
            p1.x -= (overlap / 2) * Math.cos(angle);
            p1.y -= (overlap / 2) * Math.sin(angle);
            p2.x += (overlap / 2) * Math.cos(angle);
            p2.y += (overlap / 2) * Math.sin(angle);

            // Rotate velocities back
            const vel0F = { x: vel0.x * cos - vel0.y * sin, y: vel0.y * cos + vel0.x * sin };
            const vel1F = { x: vel1.x * cos - vel1.y * sin, y: vel1.y * cos + vel1.x * sin };

            p1.vx = vel0F.x;
            p1.vy = vel0F.y;
            p2.vx = vel1F.x;
            p2.vy = vel1F.y;
        }
    }


    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 0.8;

        for (let i = 0; i < allParticles.length; i++) {
            let p = allParticles[i];

            p.y += p.vy;
            p.x += p.vx;

            // Damping
            p.vx *= 0.99;

            // Particle collisions
            for (let j = i + 1; j < allParticles.length; j++) {
                resolveCollision(p, allParticles[j]);
            }

            // Reset particle if it scrolls out of view
            if (p.y > window.scrollY + window.innerHeight + particleRadius) {
                 p.y = window.scrollY - particleRadius;
                 // Keep x within its initial range to maintain two streams
                 const initialXRange = (p.color === '#40916C') ? [width * 0.1, width * 0.45] : [width * 0.55, width * 0.9];
                 p.x = initialXRange[0] + Math.random() * (initialXRange[1] - initialXRange[0]);
                 p.vx = (Math.random() - 0.5) * 0.2;
                 p.vy = baseSpeedY + (Math.random() - 0.5) * 0.5;
            }
            
            // Wall collision
            if (p.x < particleRadius) {
                p.x = particleRadius;
                p.vx *= -0.5;
            } else if (p.x > width - particleRadius) {
                p.x = width - particleRadius;
                p.vx *= -0.5;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, particleRadius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    
    function resizeCanvas() {
        width = container.offsetWidth;
        height = document.body.scrollHeight;
        canvas.width = width;
        canvas.height = height;
        allParticles.length = 0;
        createParticle('#40916C', [width * 0.1, width * 0.45]);
        createParticle('#52B788', [width * 0.55, width * 0.9]);
    }

    window.addEventListener('resize', resizeCanvas);
    // Also resize on scroll to handle dynamic content loading
    window.addEventListener('scroll', () => {
        if (height !== document.body.scrollHeight) {
            resizeCanvas();
        }
    });


    animate();
});
