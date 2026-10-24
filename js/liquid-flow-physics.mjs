export const STEP = 1 / 60;
export const RADII = [0, 6, 6, 8];
const CELL_SIZE = 16;

// Physics runs at a fixed rate; rendering can interpolate at the display's refresh rate.
export class FrameClock {
    constructor() { this.reset(); }
    reset() { this.previous = null; this.accumulator = 0; this.alpha = 0; }
    consume(now) {
        if (this.previous !== null) this.accumulator += Math.max(0, Math.min((now - this.previous) / 1000, 0.05));
        this.previous = now;
        const steps = Math.min(3, Math.floor((this.accumulator + 1e-10) / STEP));
        this.accumulator = Math.max(0, this.accumulator - steps * STEP);
        this.alpha = this.accumulator / STEP;
        return steps;
    }
}

export class BeadSimulation {
    constructor({ capacity = 600, random = Math.random } = {}) {
        this.capacity = capacity;
        this.random = random;
        this.particles = Array.from({ length: capacity }, () => ({
            x: 0, y: 0, previousX: 0, previousY: 0, vx: 0, vy: 0, phaseSin: 0, phaseCos: 0, type: 0,
        }));
        this.active = new Uint16Array(capacity);
        this.free = Uint16Array.from({ length: capacity }, (_, i) => capacity - 1 - i);
        this.next = new Int32Array(capacity);
        this.count = 0;
        this.freeCount = capacity;
        this.spawnTime = 0;
        this.time = 0;
        this.spawning = true;
        this.flow = true;
        this.width = 100;
        this.height = 1;
        this.resize(100, 1);
    }

    resize(width, height) {
        const scaleX = width / this.width, scaleY = height / this.height;
        this.width = Math.max(32, width);
        this.height = Math.max(1, height);
        for (let n = 0; n < this.count; n++) {
            const p = this.particles[this.active[n]];
            const radius = RADII[p.type];
            p.x = p.previousX = Math.max(radius, Math.min(this.width - radius, p.x * scaleX));
            p.y = p.previousY = p.y * scaleY;
        }
        this.columns = Math.ceil(this.width / CELL_SIZE);
        this.rows = Math.ceil(this.height / CELL_SIZE) + 2;
        const size = this.columns * this.rows;
        if (this.heads?.length !== size) {
            this.heads = new Int32Array(size).fill(-1);
        }
    }

    add(x, y, type, vx = 0, vy = 90) {
        if (!this.freeCount) return null;
        const id = this.free[--this.freeCount];
        const p = this.particles[id];
        p.x = p.previousX = x; p.y = p.previousY = y;
        p.type = type; p.vx = vx; p.vy = vy;
        const phase = this.random() * Math.PI * 2;
        p.phaseSin = Math.sin(phase); p.phaseCos = Math.cos(phase);
        this.active[this.count++] = id;
        return p;
    }

    seed() {
        // Start with a representative flow, including below deep links, without a costly pre-roll.
        const count = Math.min(Math.floor(this.capacity * 0.75), Math.floor(this.height * 0.12));
        for (let i = 0; i < count; i++) {
            const type = this.random() < 0.35 ? 3 : this.random() < 0.5 ? 1 : 2;
            const radius = RADII[type];
            this.add(radius + this.random() * (this.width - radius * 2),
                (i + this.random()) * this.height / count, type, (this.random() - 0.5) * 12,
                80 + this.random() * 20);
        }
    }

    spawn() {
        this.add(this.width * ((this.random() < 0.5 ? 0.1 : 0.55) + this.random() * 0.35),
            -6, this.random() < 0.5 ? 1 : 2, (this.random() - 0.5) * 12,
            90 + (this.random() - 0.5) * 30);
    }

    step(dt = STEP, mouseX = null, mouseY = null) {
        this.time += dt;
        if (this.spawning) {
            this.spawnTime += dt;
            while (this.spawnTime + 1e-10 >= 0.05) { this.spawn(); this.spawnTime -= 0.05; }
        }
        this.heads.fill(-1);
        const damping = Math.exp(-0.603 * dt);
        const settling = 1 - Math.exp(-0.7 * dt);
        const swaySin = Math.sin(this.time * 0.45) * 4 * dt;
        const swayCos = Math.cos(this.time * 0.45) * 4 * dt;
        for (let n = 0; n < this.count; n++) {
            const id = this.active[n], p = this.particles[id];
            p.previousX = p.x; p.previousY = p.y;
            if (mouseX !== null) {
                const dx = p.x - mouseX, dy = p.y - mouseY, squared = dx * dx + dy * dy;
                if (squared > 0 && squared < 1600) {
                    const distance = Math.sqrt(squared), t = 1 - distance / 40;
                    const force = t * t * (3 - 2 * t) * 360 * dt / distance;
                    p.vx += dx * force; p.vy += dy * force;
                }
            }
            if (this.flow) {
                p.vx = (p.vx + p.phaseSin * swayCos + p.phaseCos * swaySin) * damping;
                p.vy += (90 - p.vy) * settling;
            }
            p.vx = Math.max(-180, Math.min(180, p.vx));
            p.vy = Math.max(-180, Math.min(180, p.vy));
            p.x += p.vx * dt; p.y += p.vy * dt;
            const radius = RADII[p.type];
            if (p.y > this.height + radius || p.y < -40) { p.type = 0; continue; }
            this.boundary(p);
            const row = Math.max(0, Math.min(this.rows - 1, Math.floor(p.y / CELL_SIZE)));
            const cell = row * this.columns + Math.floor(p.x / CELL_SIZE);
            this.next[id] = this.heads[cell];
            this.heads[cell] = id;
        }
        for (let n = 0; n < this.count; n++) {
            const id = this.active[n], p = this.particles[id];
            if (!p.type) continue;
            const cx = Math.floor(p.x / CELL_SIZE), cy = Math.max(0, Math.floor(p.y / CELL_SIZE));
            for (let y = Math.max(0, cy - 1); y <= Math.min(this.rows - 1, cy + 1); y++) {
                for (let x = Math.max(0, cx - 1); x <= Math.min(this.columns - 1, cx + 1); x++) {
                    for (let j = this.heads[y * this.columns + x]; j !== -1; j = this.next[j]) {
                        if (j <= id) continue;
                        const q = this.particles[j];
                        if (!q.type) continue;
                        const dx = q.x - p.x, dy = q.y - p.y;
                        const minimum = RADII[p.type] + RADII[q.type], squared = dx * dx + dy * dy;
                        if (squared < minimum * minimum) this.collide(p, q, dx, dy, minimum, squared);
                    }
                }
            }
        }
        let count = 0;
        for (let n = 0; n < this.count; n++) {
            const id = this.active[n], p = this.particles[id];
            if (!p.type) { this.free[this.freeCount++] = id; continue; }
            this.boundary(p); // Collision correction must not push beads through a wall.
            this.active[count++] = id;
        }
        this.count = count;
    }

    boundary(p) {
        const radius = RADII[p.type];
        if (p.x < radius) { p.x = radius; p.vx = Math.abs(p.vx) * 0.65; }
        if (p.x > this.width - radius) { p.x = this.width - radius; p.vx = -Math.abs(p.vx) * 0.65; }
    }

    collide(p, q, dx, dy, minimum, squared) {
        if (p.type !== 3 && q.type !== 3 && p.type !== q.type) {
            p.x = p.previousX = (p.x + q.x) / 2;
            p.y = p.previousY = (p.y + q.y) / 2;
            p.vx = (p.vx + q.vx) / 2; p.vy = (p.vy + q.vy) / 2;
            p.type = 3; q.type = 0;
            return;
        }
        const distance = Math.sqrt(squared);
        dx = distance ? dx / distance : 1; dy = distance ? dy / distance : 0;
        const massP = p.type === 3 ? 2 : 1, massQ = q.type === 3 ? 2 : 1;
        const total = massP + massQ, overlap = Math.max(0, minimum - distance - 0.05);
        p.x -= dx * overlap * massQ / total; p.y -= dy * overlap * massQ / total;
        q.x += dx * overlap * massP / total; q.y += dy * overlap * massP / total;
        const approach = (q.vx - p.vx) * dx + (q.vy - p.vy) * dy;
        if (approach < 0) {
            const impulse = 1.85 * approach / total;
            p.vx += impulse * massQ * dx; p.vy += impulse * massQ * dy;
            q.vx -= impulse * massP * dx; q.vy -= impulse * massP * dy;
        }
    }
}
