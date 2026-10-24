import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setMaxListeners } from 'node:events';
import vm from 'node:vm';
import { BeadSimulation, FrameClock, RADII, STEP } from '../js/liquid-flow-physics.mjs';

function preview() {
    const callbacks = new Map();
    const metrics = { steps: 0, draws: 0 };
    let id = 0;
    const drawing = { beginPath() {}, arc() {}, fill() {}, clearRect() {}, drawImage() { metrics.draws++; } };
    function canvas() { return Object.assign(new EventTarget(), { width: 300, height: 150, style: {}, getContext: () => drawing }); }
    const mainCanvas = canvas();
    const container = { offsetWidth: 100, style: {}, getBoundingClientRect: () => ({ left: 0 }) };
    const about = { offsetTop: 800, offsetHeight: 300 };
    const experience = { offsetTop: 1100, offsetHeight: 1000 };
    const resume = { offsetTop: 3300, offsetHeight: 700 };
    const contact = { offsetTop: 4000, offsetHeight: 400 };
    const document = Object.assign(new EventTarget(), {
        hidden: false,
        getElementById: id => ({ 'liquid-flow-container': container, 'liquid-flow-canvas': mainCanvas, about, contact })[id],
        querySelector: () => ({ offsetHeight: 90 }),
        querySelectorAll: selector => selector.includes('.bg-light') ? [experience, resume] : [about, experience, resume, contact],
        createElement: canvas,
    });
    const desktop = Object.assign(new EventTarget(), { matches: true });
    const motion = Object.assign(new EventTarget(), { matches: false });
    const window = new EventTarget();
    class QuietAbortController extends AbortController {
        constructor() { super(); setMaxListeners(0, this.signal); }
    }
    class MeasuredSimulation extends BeadSimulation {
        step(...args) { metrics.steps++; super.step(...args); }
    }
    const context = vm.createContext({
        document, window, navigator: {}, scrollY: 850, innerHeight: 600, devicePixelRatio: 1.5,
        requestAnimationFrame: callback => { callbacks.set(++id, callback); return id; },
        cancelAnimationFrame: value => callbacks.delete(value),
        matchMedia: query => query.includes('min-width') ? desktop : motion,
        AbortController: QuietAbortController,
        BeadSimulation: MeasuredSimulation, FrameClock, RADII, STEP,
    });
    const source = readFileSync(new URL('../js/liquid-flow.js', import.meta.url), 'utf8')
        .replace(/^\uFEFF?import[^\n]+\n/, '').replace('export function', 'function');
    vm.runInContext(source, context);
    context.startLiquidFlow();
    return {
        context, document, window, desktop, motion, metrics, mainCanvas,
        get pending() { return callbacks.size; },
        tick(now) {
            const current = [...callbacks.values()];
            callbacks.clear();
            current.forEach(callback => callback(now));
        },
        event(target, name, properties = {}) { target.dispatchEvent(Object.assign(new Event(name), properties)); },
    };
}

test('render visible beads, sleep behind opaque panels, then resume without a time jump', () => {
    const page = preview();
    page.tick(0); page.tick(1000 / 60);
    assert.ok(page.metrics.draws > 0);
    assert.equal(page.metrics.steps, 1);
    page.context.scrollY = 1200;
    page.event(page.window, 'scroll');
    assert.equal(page.pending, 0);
    const steps = page.metrics.steps;
    page.tick(5000);
    assert.equal(page.metrics.steps, steps);
    page.context.scrollY = 850;
    page.event(page.window, 'scroll');
    assert.equal(page.pending, 1);
    page.tick(5000);
    assert.equal(page.metrics.steps, steps);
    page.tick(5000 + 1000 / 60);
    assert.equal(page.metrics.steps, steps + 1);
});

test('hidden tabs, reduced motion, and mobile layouts stop the animation loop', () => {
    const page = preview();
    page.document.hidden = true;
    page.event(page.document, 'visibilitychange');
    assert.equal(page.pending, 0);
    page.document.hidden = false;
    page.event(page.document, 'visibilitychange');
    assert.equal(page.pending, 1);
    page.motion.matches = true;
    page.event(page.motion, 'change');
    assert.equal(page.pending, 0);
    page.motion.matches = false;
    page.event(page.motion, 'change');
    page.desktop.matches = false;
    page.event(page.desktop, 'change');
    page.tick(0);
    assert.equal(page.pending, 0);
});

test('resize work is coalesced; page caching resumes; final unload releases resources', () => {
    const page = preview();
    for (let i = 0; i < 30; i++) page.event(page.window, 'resize');
    assert.equal(page.pending, 2); // one animation frame and one layout frame
    page.event(page.window, 'pagehide', { persisted: true });
    assert.equal(page.pending, 0);
    page.event(page.window, 'pageshow');
    page.tick(0);
    assert.equal(page.pending, 1);
    page.event(page.window, 'pagehide', { persisted: false });
    assert.equal(page.pending, 0);
    assert.equal(page.mainCanvas.width, 1);
    assert.equal(page.mainCanvas.height, 1);
    page.event(page.window, 'scroll');
    assert.equal(page.pending, 0);
});
