import * as THREE from './vendor/three.module.min.js';

export function startLiquidFlow() {
    const container = document.getElementById('liquid-flow-container');
    const canvas = document.getElementById('liquid-flow-canvas');
    const desktop = matchMedia('(min-width: 1025px)');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 100, 0, 1, -1, 1);
    const capacity = 600;
    const cellSize = 16; // Largest particle diameter; only neighboring cells can collide.
    const particles = Array.from({ length: capacity }, () => ({ x: 0, y: 0, vx: 0, vy: 0, type: 0 }));
    const next = new Int32Array(capacity);
    const positions = new Float32Array(capacity * 3);
    const styles = new Float32Array(capacity * 2);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('style', new THREE.BufferAttribute(styles, 2).setUsage(THREE.DynamicDrawUsage));
    const uniforms = { viewTop: { value: 0 }, pixelRatio: { value: 1 } };
    const material = new THREE.ShaderMaterial({
        uniforms, transparent: true, depthTest: false, depthWrite: false,
        vertexShader: `
            attribute vec2 style;
            uniform float viewTop;
            uniform float pixelRatio;
            varying vec3 tint;
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y - viewTop, 0.0, 1.0);
                gl_PointSize = style.x * 2.0 * pixelRatio;
                tint = style.y < 1.5 ? vec3(11.0, 94.0, 42.0) / 255.0
                    : style.y < 2.5 ? vec3(200.0, 245.0, 204.0) / 255.0
                    : vec3(139.0, 90.0, 43.0) / 255.0;
            }
        `,
        fragmentShader: `
            varying vec3 tint;
            void main() {
                float radius = length(gl_PointCoord - 0.5);
                if (radius > 0.5) discard;
                gl_FragColor = vec4(tint, 0.8 * (1.0 - smoothstep(0.43, 0.5, radius)));
            }
        `
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    let width = 100, height = 1, columns = 7, rows = 1;
    let heads = new Int32Array(columns);
    let cursor = 0, spawnTime = 0, accumulator = 0, previous = 0, frame = 0;
    let visible = false, contextLost = false, disposed = false;
    let mouseX = null, mouseY = null;
    let pointerX = null, pointerY = null;
    function layout() {
        const about = document.getElementById('about');
        const contact = document.getElementById('contact');
        if (!about || !contact || !desktop.matches || disposed || contextLost) return;
        width = container.offsetWidth;
        const top = about.offsetTop;
        height = Math.max(1, contact.offsetTop + contact.offsetHeight - top);
        container.style.top = `${top}px`;
        container.style.height = `${height}px`;
        columns = Math.ceil(width / cellSize);
        rows = Math.ceil(height / cellSize) + 2;
        if (heads.length !== columns * rows) heads = new Int32Array(columns * rows);
        // Keep the GPU canvas viewport-sized, rather than allocating a page-tall texture.
        const viewHeight = Math.min(height, window.innerHeight);
        canvas.style.height = `${viewHeight}px`;
        const ratio = Math.min(devicePixelRatio || 1, 1.5);
        renderer.setSize(Math.round(width * ratio), Math.round(viewHeight * ratio), false);
        uniforms.pixelRatio.value = ratio;
        camera.right = width;
        camera.bottom = viewHeight;
        camera.updateProjectionMatrix();
        scroll();
    }
    function scroll() {
        if (!desktop.matches || disposed || contextLost) return;
        uniforms.viewTop.value = Math.max(0, Math.min(height - Math.min(height, innerHeight), -container.getBoundingClientRect().top));
        canvas.style.top = `${uniforms.viewTop.value}px`;
        updatePointer();
    }
    function spawn() {
        // Reuse inactive slots; at capacity, recycle instead of allocating or shifting arrays.
        for (let i = 0; i < capacity; i++) {
            if (!particles[cursor].type) break;
            cursor = (cursor + 1) % capacity;
        }
        const p = particles[cursor];
        cursor = (cursor + 1) % capacity;
        p.type = Math.random() < 0.5 ? 1 : 2;
        p.x = width * ((Math.random() < 0.5 ? 0.1 : 0.55) + Math.random() * 0.35);
        p.y = -6;
        p.vx = (Math.random() - 0.5) * 12;
        p.vy = 90 + (Math.random() - 0.5) * 30;
    }
    function step(dt) {
        spawnTime += dt;
        while (spawnTime >= 0.05) { spawn(); spawnTime -= 0.05; }
        heads.fill(-1);
        for (let i = 0; i < capacity; i++) {
            const p = particles[i];
            if (!p.type) continue;
            if (mouseX !== null) {
                const dx = p.x - mouseX, dy = p.y - mouseY;
                const distance = Math.hypot(dx, dy);
                if (distance > 0 && distance < 40) {
                    const force = (1 - distance / 40) * 360 * dt / distance;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }
            }
            p.vx *= 0.99;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            const radius = p.type === 3 ? 8 : 6;
            if (p.y > height + radius || p.y < -40) { p.type = 0; continue; }
            if (p.x < radius) { p.x = radius; p.vx = Math.abs(p.vx) * 0.5; }
            if (p.x > width - radius) { p.x = width - radius; p.vx = -Math.abs(p.vx) * 0.5; }
            const cell = Math.max(0, Math.floor(p.y / cellSize)) * columns + Math.floor(p.x / cellSize);
            next[i] = heads[cell];
            heads[cell] = i;
        }
        for (let i = 0; i < capacity; i++) {
            const p = particles[i];
            if (!p.type) continue;
            const cx = Math.floor(p.x / cellSize), cy = Math.max(0, Math.floor(p.y / cellSize));
            for (let y = Math.max(0, cy - 1); y <= Math.min(rows - 1, cy + 1); y++) {
                for (let x = Math.max(0, cx - 1); x <= Math.min(columns - 1, cx + 1); x++) {
                    for (let j = heads[y * columns + x]; j !== -1; j = next[j]) {
                        if (j <= i || !particles[j].type) continue;
                        const q = particles[j];
                        let dx = q.x - p.x, dy = q.y - p.y;
                        const minDistance = (p.type === 3 ? 8 : 6) + (q.type === 3 ? 8 : 6);
                        const squared = dx * dx + dy * dy;
                        if (squared >= minDistance * minDistance) continue;
                        if (p.type !== 3 && q.type !== 3 && p.type !== q.type) {
                            p.x = (p.x + q.x) / 2; p.y = (p.y + q.y) / 2;
                            p.vx = (p.vx + q.vx) / 2; p.vy = (p.vy + q.vy) / 2;
                            p.type = 3; q.type = 0;
                            continue;
                        }
                        const distance = Math.sqrt(squared);
                        dx = distance ? dx / distance : 1; dy = distance ? dy / distance : 0;
                        const overlap = (minDistance - distance) / 2;
                        p.x -= dx * overlap; p.y -= dy * overlap;
                        q.x += dx * overlap; q.y += dy * overlap;
                        const approach = (q.vx - p.vx) * dx + (q.vy - p.vy) * dy;
                        if (approach < 0) {
                            const massP = p.type === 3 ? 3 : 1.5, massQ = q.type === 3 ? 3 : 1.5;
                            const impulse = 2 * approach / (massP + massQ);
                            p.vx += impulse * massQ * dx; p.vy += impulse * massQ * dy;
                            q.vx -= impulse * massP * dx; q.vy -= impulse * massP * dy;
                        }
                    }
                }
            }
        }
    }
    function animate(now) {
        accumulator += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
        previous = now;
        while (accumulator >= 1 / 60) { step(1 / 60); accumulator -= 1 / 60; }
        let count = 0;
        for (const p of particles) {
            if (!p.type) continue;
            positions[count * 3] = p.x; positions[count * 3 + 1] = p.y;
            styles[count * 2] = p.type === 3 ? 8 : 6; styles[count * 2 + 1] = p.type;
            count++;
        }
        geometry.setDrawRange(0, count);
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.style.needsUpdate = true;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
    }
    function sync() {
        cancelAnimationFrame(frame);
        previous = accumulator = 0;
        if (!disposed && desktop.matches && visible && !document.hidden && !contextLost) frame = requestAnimationFrame(animate);
    }
    function resize() { layout(); sync(); }
    function updatePointer() {
        mouseX = mouseY = null;
        if (pointerX === null || !desktop.matches) return;
        const rect = container.getBoundingClientRect();
        const x = pointerX - rect.left, y = pointerY - rect.top;
        if (x >= 0 && x <= width && y >= 0 && y <= height) {
            mouseX = x; mouseY = y;
        }
    }
    function pointer(event) {
        pointerX = event.clientX; pointerY = event.clientY;
        updatePointer();
    }
    function leave() { pointerX = pointerY = mouseX = mouseY = null; }
    // Page sections overlap the background strip and receive its pointer events.
    // Observe the real pointer without changing stacking or blocking page controls.
    window.addEventListener('pointermove', pointer, { passive: true, capture: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', sync);
    desktop.addEventListener('change', resize);
    const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    const sizing = new ResizeObserver(layout);
    visibility.observe(container);
    document.querySelectorAll('body > .section, body > header, body > nav').forEach(section => sizing.observe(section));
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; sync(); });
    canvas.addEventListener('webglcontextrestored', () => { contextLost = false; resize(); });
    function pageHide(event) {
        cancelAnimationFrame(frame);
        if (event.persisted) return;
        disposed = true;
        visibility.disconnect(); sizing.disconnect();
        window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize);
        window.removeEventListener('pageshow', resize); window.removeEventListener('pagehide', pageHide);
        document.removeEventListener('visibilitychange', sync); desktop.removeEventListener('change', resize);
        window.removeEventListener('pointermove', pointer, true);
        document.removeEventListener('pointerleave', leave); window.removeEventListener('blur', leave);
        geometry.dispose(); material.dispose(); renderer.dispose();
    }
    window.addEventListener('pagehide', pageHide);
    window.addEventListener('pageshow', resize);
    layout();
}
