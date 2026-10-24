import test from 'node:test';
import assert from 'node:assert/strict';
import { BeadSimulation, FrameClock, RADII, STEP } from '../js/liquid-flow-physics.mjs';

function random(seed = 42) {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
function isolated() {
    const simulation = new BeadSimulation({ random: random() });
    simulation.resize(100, 1000);
    simulation.flow = simulation.spawning = false;
    return simulation;
}

test('same-type collisions separate and lose energy without losing momentum', () => {
    const sim = isolated();
    const p = sim.add(45, 100, 1, 20, 0), q = sim.add(55, 100, 1, -20, 0);
    sim.step();
    assert.equal(sim.count, 2);
    assert.ok(q.x - p.x >= 11.9);
    assert.ok(p.vx < 0 && q.vx > 0);
    assert.ok(p.vx ** 2 + q.vx ** 2 < 800);
    assert.ok(Math.abs(p.vx + q.vx) < 1e-9);
});

test('different reagents merge into one brown bead and conserve momentum', () => {
    const sim = isolated();
    sim.add(45, 100, 1, 30, 0);
    sim.add(55, 100, 2, -10, 0);
    sim.step();
    assert.equal(sim.count, 1);
    const bead = sim.particles[sim.active[0]];
    assert.equal(bead.type, 3);
    assert.equal(bead.vx, 10);
    assert.equal(sim.freeCount, sim.capacity - 1);
});

test('coincident beads and wall collisions remain finite and inside the strip', () => {
    const sim = isolated();
    sim.add(1, 100, 3, -100, 0);
    sim.add(1, 100, 3, -100, 0);
    for (let i = 0; i < 120; i++) sim.step();
    for (let i = 0; i < sim.count; i++) {
        const p = sim.particles[sim.active[i]];
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
        assert.ok(p.x >= RADII[p.type] && p.x <= sim.width - RADII[p.type]);
    }
});

test('pointer repulsion is bounded and downward flow recovers after interaction', () => {
    const sim = isolated();
    const p = sim.add(60, 100, 1, 0, 0);
    sim.step(STEP, 50, 100);
    assert.ok(p.vx > 0 && p.vx <= 180);
    p.vy = -80;
    sim.flow = true;
    for (let i = 0; i < 300; i++) sim.step();
    assert.ok(p.vy > 80 && p.vy < 100);
});

test('60 Hz and 144 Hz displays produce the same physics after ten seconds', () => {
    function run(hz) {
        const sim = new BeadSimulation({ random: random() });
        sim.resize(100, 4000);
        sim.seed();
        const clock = new FrameClock();
        let ticks = 0;
        for (let i = 0; i <= hz * 10; i++) {
            const steps = clock.consume(i * 1000 / hz);
            for (let n = 0; n < steps; n++) { sim.step(); ticks++; }
            assert.ok(clock.alpha >= 0 && clock.alpha < 1.000001);
        }
        return { ticks, beads: [...sim.active.slice(0, sim.count)].map(id => ({ ...sim.particles[id] })) };
    }
    const at60 = run(60), at144 = run(144);
    assert.equal(at60.ticks, 600);
    assert.deepEqual(at144, at60);
});

test('long frames and tab resumes cannot trigger unbounded catch-up work', () => {
    const clock = new FrameClock();
    assert.equal(clock.consume(0), 0);
    assert.equal(clock.consume(5000), 3);
    clock.reset();
    assert.equal(clock.consume(30000), 0);
    assert.equal(clock.consume(30000 + 1000 / 60), 1);
});

test('two minutes of flow, merging, recycling, and resizing preserve the particle pool', () => {
    const sim = new BeadSimulation({ random: random() });
    sim.resize(100, 5000);
    sim.seed();
    assert.ok(sim.count > 0);
    for (let tick = 0; tick < 7200; tick++) {
        if (tick === 1800) sim.resize(100, 7000);
        if (tick === 3600) sim.resize(100, 3000);
        sim.step(STEP, tick % 240 < 120 ? 50 : null, 500);
        assert.ok(sim.count <= sim.capacity);
        assert.equal(sim.count + sim.freeCount, sim.capacity);
        if (tick % 60) continue;
        const active = [...sim.active.slice(0, sim.count)];
        const free = [...sim.free.slice(0, sim.freeCount)];
        assert.equal(new Set([...active, ...free]).size, sim.capacity);
        for (const id of active) {
            const p = sim.particles[id];
            assert.ok(Number.isFinite(p.x + p.y + p.vx + p.vy));
            assert.ok(p.type >= 1 && p.type <= 3);
            assert.ok(p.x >= RADII[p.type] && p.x <= sim.width - RADII[p.type]);
        }
    }
});
