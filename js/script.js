document.addEventListener('DOMContentLoaded', () => {
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

    // Liquid flow animation
    const canvas = document.getElementById('liquid-flow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = document.getElementById('liquid-flow-container');
    let width = container.offsetWidth;
    let height;

    const particleCount = 500;
    const allParticles = [];
    const particleRadius = 6;
    const brownRadius = 8;
    const brownMass = 3;
    const brownColor = '#8B5A2B';
    const color1 = '#0B5E2A';
    const color2 = '#C8F5CC';
    const baseSpeedY = 1.5;

    const mouse = {
        x: null,
        y: null,
        radius: 40
    };

    function setCanvasSize() {
        const aboutSection = document.getElementById('about');
        const contactSection = document.getElementById('contact');
        const startY = aboutSection ? aboutSection.offsetTop : 0;
        const endY = contactSection ? contactSection.offsetTop + contactSection.offsetHeight : document.body.scrollHeight;
        container.style.top = `${startY}px`;
        const canvasHeight = endY - startY;
        container.style.height = `${canvasHeight}px`;
        canvas.height = canvasHeight;
        height = canvasHeight;
    }

    setCanvasSize();
    canvas.width = width;

    container.addEventListener('mousemove', (event) => {
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;
    });

    container.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function createParticle(color, initialXRange) {
        const count = particleCount / 2;
        for (let i = 0; i < count; i++) {
            allParticles.push({
                x: initialXRange[0] + Math.random() * (initialXRange[1] - initialXRange[0]),
                y: Math.random() * height,
                vy: baseSpeedY + (Math.random() - 0.5) * 0.5,
                vx: (Math.random() - 0.5) * 0.2,
                color: color,
                mass: 1.5,
                radius: particleRadius
            });
        }
    }

    createParticle(color1, [width * 0.1, width * 0.45]);
    createParticle(color2, [width * 0.55, width * 0.9]);

    function resolveCollision(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0) {
            // Cross-color merge: two different original-color particles combine into brown
            if (p1.color !== brownColor && p2.color !== brownColor && p1.color !== p2.color) {
                return 'merge';
            }

            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            const vel0 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin };
            const vel1 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin };

            const vxTotal = vel0.x - vel1.x;
            vel0.x = ((p1.mass - p2.mass) * vel0.x + 2 * p2.mass * vel1.x) / (p1.mass + p2.mass);
            vel1.x = vxTotal + vel0.x;

            const overlap = minDist - dist;
            p1.x -= (overlap / 2) * Math.cos(angle);
            p1.y -= (overlap / 2) * Math.sin(angle);
            p2.x += (overlap / 2) * Math.cos(angle);
            p2.y += (overlap / 2) * Math.sin(angle);

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

        const toRemove = new Set();
        const toAdd = [];

        for (let i = 0; i < allParticles.length; i++) {
            if (toRemove.has(i)) continue;
            let p = allParticles[i];

            p.y += p.vy;
            p.x += p.vx;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const forceDirectionX = dx / dist;
                    const forceDirectionY = dy / dist;
                    const force = (mouse.radius - dist) / mouse.radius;
                    p.vx += forceDirectionX * force * 0.1;
                    p.vy += forceDirectionY * force * 0.1;
                }
            }

            p.vx *= 0.99;

            let merged = false;
            for (let j = i + 1; j < allParticles.length; j++) {
                if (toRemove.has(j)) continue;
                const result = resolveCollision(p, allParticles[j]);
                if (result === 'merge') {
                    const p2 = allParticles[j];
                    // Momentum conservation: m_new * v_new = m1*v1 + m2*v2
                    // brownMass = 2x single particle mass (3 vs 1.5)
                    const newVx = (p.mass * p.vx + p2.mass * p2.vx) / brownMass;
                    const newVy = (p.mass * p.vy + p2.mass * p2.vy) / brownMass;
                    toAdd.push({
                        x: (p.x + p2.x) / 2,
                        y: (p.y + p2.y) / 2,
                        vx: newVx,
                        vy: newVy,
                        color: brownColor,
                        mass: brownMass,
                        radius: brownRadius
                    });
                    toRemove.add(i);
                    toRemove.add(j);
                    merged = true;
                    break;
                }
            }

            if (merged) continue;

            if (p.y > height + p.radius) {
                p.y = -p.radius;
            } else if (p.y < -p.radius) {
                p.y = height + p.radius;
            }

            if (p.x < p.radius) {
                p.x = p.radius;
                p.vx *= -0.5;
            } else if (p.x > width - p.radius) {
                p.x = width - p.radius;
                p.vx *= -0.5;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        // Process merges: remove consumed particles and add brown ones
        const sortedRemove = [...toRemove].sort((a, b) => b - a);
        for (const idx of sortedRemove) {
            allParticles.splice(idx, 1);
        }
        for (const np of toAdd) {
            allParticles.push(np);
            ctx.beginPath();
            ctx.arc(np.x, np.y, np.radius, 0, Math.PI * 2);
            ctx.fillStyle = np.color;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        width = container.offsetWidth;
        setCanvasSize();
        canvas.width = width;
        allParticles.length = 0;
        createParticle(color1, [width * 0.1, width * 0.45]);
        createParticle(color2, [width * 0.55, width * 0.9]);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', () => {
        const aboutSection = document.getElementById('about');
        const contactSection = document.getElementById('contact');
        if (aboutSection && contactSection) {
            const startY = aboutSection.offsetTop;
            const desiredHeight = contactSection.offsetTop + contactSection.offsetHeight - startY;
            if (height !== desiredHeight) {
                resizeCanvas();
            }
        }
    });

    animate();
});

