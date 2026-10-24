import { BeadSimulation, FrameClock, RADII, STEP } from './liquid-flow-physics.mjs?v=1';

export function startLiquidFlow() {
    const container = document.getElementById('liquid-flow-container');
    const canvas = document.getElementById('liquid-flow-canvas');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    const desktop = matchMedia('(min-width: 1025px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const events = new AbortController();
    const signal = events.signal;
    const simulation = new BeadSimulation();
    const clock = new FrameClock();
    const colors = ['', '#0b5e2a', '#c8f5cc', '#8b5a2b'];
    let sprites = [], blocks = [], exposed = [];
    let width = 100, height = 1, viewHeight = 1, ratio = 1;
    let pageTop = 0, stripLeft = 0, navHeight = 0, viewTop = 0;
    let pointerX = null, pointerY = null;
    let frame = 0, layoutFrame = 0;
    let seeded = false, visible = false, disposed = false, contextLost = false;

    function makeSprites() {
        sprites = colors.map((color, type) => {
            if (!type) return null;
            const radius = RADII[type];
            const sprite = document.createElement('canvas');
            sprite.width = sprite.height = Math.ceil((radius * 2 + 2) * ratio);
            const ctx = sprite.getContext('2d');
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(sprite.width / 2, sprite.height / 2, radius * ratio, 0, Math.PI * 2);
            ctx.fill();
            return { image: sprite, half: sprite.width / 2 };
        });
    }

    function layout() {
        layoutFrame = 0;
        if (disposed || contextLost || !desktop.matches) { sync(); return; }
        const about = document.getElementById('about');
        const contact = document.getElementById('contact');
        if (!about || !contact) return;
        width = container.offsetWidth;
        pageTop = about.offsetTop;
        height = Math.max(1, contact.offsetTop + contact.offsetHeight - pageTop);
        navHeight = document.querySelector('nav').offsetHeight;
        container.style.top = `${pageTop}px`;
        container.style.height = `${height}px`;
        stripLeft = container.getBoundingClientRect().left;
        simulation.resize(width, height);
        if (!seeded) { simulation.seed(); seeded = true; }
        blocks = [...document.querySelectorAll('body > .bg-light')].map(section => ({
            start: section.offsetTop - pageTop,
            end: section.offsetTop + section.offsetHeight - pageTop,
        }));
        viewHeight = Math.min(height, innerHeight);
        const nextRatio = Math.min(devicePixelRatio || 1, 1.5);
        const pixelWidth = Math.ceil(width * nextRatio), pixelHeight = Math.ceil(viewHeight * nextRatio);
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight || ratio !== nextRatio) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            ratio = nextRatio;
            makeSprites();
        }
        if (!sprites.length) makeSprites();
        canvas.style.height = `${viewHeight}px`;
        updateView();
    }
    function queueLayout() {
        if (!disposed && !layoutFrame) layoutFrame = requestAnimationFrame(layout);
    }
    function updateView() {
        if (disposed) return;
        viewTop = Math.max(0, Math.min(height - viewHeight, scrollY - pageTop));
        canvas.style.transform = `translateY(${viewTop}px)`;
        const start = Math.max(0, scrollY + navHeight - pageTop);
        const end = Math.min(height, scrollY + innerHeight - pageTop);
        exposed.length = 0;
        let cursor = start;
        // Opaque panels already cover the canvas. Skip their pixels and stop when fully covered.
        for (const block of blocks) {
            if (block.end <= cursor) continue;
            if (block.start >= end) break;
            if (block.start > cursor) exposed.push(cursor, Math.min(end, block.start));
            cursor = Math.max(cursor, block.end);
        }
        if (cursor < end) exposed.push(cursor, end);
        visible = exposed.length > 0;
        sync();
    }
    function canRun() {
        return !disposed && !contextLost && desktop.matches && !reducedMotion.matches &&
            !navigator.connection?.saveData && !document.hidden && visible;
    }
    function sync() {
        if (canRun()) {
            if (!frame) frame = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(frame);
            frame = 0;
            clock.reset();
        }
    }
    function animate(now) {
        frame = 0;
        if (!canRun()) { clock.reset(); return; }
        let mouseX = null, mouseY = null;
        if (pointerX !== null) {
            const x = pointerX - stripLeft, y = pointerY + scrollY - pageTop;
            if (x >= 0 && x <= width) {
                for (let i = 0; i < exposed.length; i += 2) {
                    if (y >= exposed[i] && y <= exposed[i + 1]) { mouseX = x; mouseY = y; break; }
                }
            }
        }
        const steps = clock.consume(now);
        for (let i = 0; i < steps; i++) simulation.step(STEP, mouseX, mouseY);
        context.clearRect(0, 0, canvas.width, canvas.height);
        const alpha = clock.alpha;
        for (let n = 0; n < simulation.count; n++) {
            const p = simulation.particles[simulation.active[n]];
            const x = p.previousX + (p.x - p.previousX) * alpha;
            const y = p.previousY + (p.y - p.previousY) * alpha;
            const radius = RADII[p.type];
            let onScreen = false;
            for (let i = 0; i < exposed.length; i += 2) {
                if (y + radius >= exposed[i] && y - radius <= exposed[i + 1]) { onScreen = true; break; }
            }
            if (!onScreen) continue;
            const sprite = sprites[p.type];
            context.drawImage(sprite.image, x * ratio - sprite.half, (y - viewTop) * ratio - sprite.half);
        }
        frame = requestAnimationFrame(animate);
    }
    function pointer(event) {
        // Store input only. Coordinate conversion happens once per frame, without layout reads.
        if (event.pointerType === 'touch') return;
        pointerX = event.clientX; pointerY = event.clientY;
    }
    function leave() { pointerX = pointerY = null; }
    function pageHide(event) {
        cancelAnimationFrame(frame); cancelAnimationFrame(layoutFrame);
        frame = layoutFrame = 0;
        clock.reset();
        if (event.persisted) return;
        disposed = true;
        sizing?.disconnect();
        events.abort();
        sprites.length = 0;
        canvas.width = canvas.height = 1;
    }

    window.addEventListener('pointermove', pointer, { passive: true, capture: true, signal });
    document.addEventListener('pointerleave', leave, { signal });
    window.addEventListener('blur', leave, { signal });
    window.addEventListener('scroll', updateView, { passive: true, signal });
    window.addEventListener('resize', queueLayout, { signal });
    document.addEventListener('visibilitychange', sync, { signal });
    desktop.addEventListener('change', queueLayout, { signal });
    reducedMotion.addEventListener('change', sync, { signal });
    navigator.connection?.addEventListener('change', sync, { signal });
    window.addEventListener('pagehide', pageHide, { signal });
    window.addEventListener('pageshow', queueLayout, { signal });
    canvas.addEventListener('contextlost', event => { event.preventDefault(); contextLost = true; sync(); }, { signal });
    canvas.addEventListener('contextrestored', () => { contextLost = false; makeSprites(); queueLayout(); }, { signal });
    const sizing = 'ResizeObserver' in window ? new ResizeObserver(queueLayout) : null;
    document.querySelectorAll('body > .section, body > nav').forEach(section => sizing?.observe(section));
    document.fonts?.ready.then(queueLayout);
    layout();
}
