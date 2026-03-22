import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laszlo Edgar Dobra | Chemical Engineering</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <div class="logo">Laszlo Edgar Dobra</div>
        <ul class="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#resume">Resume</a></li>
        </ul>
    </nav>

    <header id="home" class="hero section animate-on-scroll">
        <h1>Hi, I'm Edgar</h1>
        <p>Chemical Engineering Student & Semiconductor Engineering Minor at the University of Illinois Urbana-Champaign</p>
        <div class="resume-links" style="margin-top: 1rem;">
            <a href="#projects" class="btn">View My Work</a>
            <a href="YOUR_LINKEDIN_LINK_HERE" class="btn btn-outline" target="_blank">LinkedIn</a>
        </div>
    </header>

    <section id="about" class="section animate-on-scroll">
        <h2>About Me</h2>
        <p>I am a chemical engineering student (GPA: 3.97) passionate about solving complex problems in material science, process control, and reaction engineering. My academic focus bridges the gap between fundamental chemistry and practical applications in semiconductors and precision polymers. I enjoy leveraging computational tools (Python, MATLAB, JavaScript) and analytical chemistry techniques (HPLC, GC, GPC, NMR) to model systems, visualize data, and automate research processes.</p>
    </section>

    <section id="experience" class="section bg-light animate-on-scroll">
        <h2>Experience</h2>
        <div class="timeline">
            <div class="timeline-item">
                <h3>R&D Intern | Rust-Oleum</h3>
                <p class="date">June 2025 – August 2025</p>
                <ul>
                    <li>Spearheaded formulation of the company's first silicate-based waterborne paint for the global architectural mineral coatings market.</li>
                    <li>Engineered a 90% reduction in product viscosity via advanced rheological analysis, enabling seamless scale-up.</li>
                    <li>Modeled critical ionic interactions within complex coating systems to resolve curing anomalies and boost stability.</li>
                </ul>
            </div>
            <div class="timeline-item">
                <h3>Research Assistant | Guironnet Research Group</h3>
                <p class="date">October 2023 – Present</p>
                <ul>
                    <li>Designed liquid handler robotics for automated high-throughput synthesis of 100+ precision polymers.</li>
                    <li>Automated air- and moisture-sensitive polymerizations using complex glovebox and vacuum systems.</li>
                    <li>Developed a GPC deconvolution algorithm and deployed it as a web app, accelerating data analysis by 50x.</li>
                </ul>
            </div>
        </div>
    </section>

    <section id="projects" class="section animate-on-scroll">
        <h2>Featured Projects</h2>
        <div class="grid">
            <div class="card">
                <h3>Gaussian Deconvolution Tool</h3>
                <p>A Streamlit web application that breaks down GPC chromatogram data into separate Gaussian peaks. It quantifies overlapping signals, corrects baselines, and calculates Mn, Mw, and dispersity based on original data and calibration curves.</p>
                <a href="https://gaussian.streamlit.app/" class="project-link" target="_blank">View on Streamlit &rarr;</a>
                <p style="font-size: 0.8rem; color: #666; margin-top: 10px;"><em>Note: The app may take 1-2 minutes to wake up on first load. If it seems stuck, simply close and reopen the link.</em></p>
            </div>
            <div class="card">
                <h3>MEMS and NEMS Fabrication</h3>
                <p>Engineered pressure sensors on nitride-coated wafers via cleanroom processes (photolithography, PVD, wet/dry etching) and architected PDMS microfluidic mixers using Fusion 360 and K-Layout.</p>
            </div>
            <div class="card">
                <h3>mRNA Delivery Mechanism Visualization</h3>
                <p>Designed scientific figures illustrating complex biological mechanisms, specifically focusing on turning tumors into "drug factories" and the immune response to mRNA delivery.</p>
            </div>
        </div>
    </section>

    <section id="resume" class="section bg-light animate-on-scroll">
        <h2>Professional Profile</h2>
        <p><strong>Technical Skills:</strong> Analytical Chemistry, Rheology, ASTM Testing, Cleanroom Protocols, UV Lithography, CVD, PVD.</p>
        <p><strong>Programming & Software:</strong> Python, MATLAB, JavaScript, HTML, SAP, Fusion 360, Siemens NX, ChemDraw.</p>
        <p><strong>Languages:</strong> English (Fluent), Hungarian (Fluent), Romanian (Fluent), German (Intermediate).</p>
        <div class="resume-links">
            <a href="Resume_General.pdf" class="btn" target="_blank">Download Full Resume (PDF)</a>
        </div>
    </section>

    <footer>
        <p>&copy; 2026 Laszlo Edgar Dobra. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
"""

css_content = """/* Base Styles & Typography */
:root {
    --primary: #13294B; 
    --accent: #E84A27;  
    --text: #333;
    --bg: #fff;
    --bg-light: #f4f4f9;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    color: var(--text);
    line-height: 1.6;
}

/* Navigation */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 5%;
    background: var(--primary);
    color: white;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.logo {
    font-weight: bold;
    font-size: 1.2rem;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 2rem;
}

.nav-links a {
    color: white;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s ease;
}

.nav-links a:hover {
    color: var(--accent);
}

/* Sections & Layout */
.section {
    padding: 5rem 5%;
    max-width: 1200px;
    margin: 0 auto;
}

.bg-light {
    background-color: var(--bg-light);
    max-width: 100%;
}

.hero {
    height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
}

.hero h1 {
    font-size: 4rem;
    color: var(--primary);
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    max-width: 700px;
    margin-bottom: 1rem;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background: var(--accent);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    transition: transform 0.2s ease, background 0.3s;
}

.btn:hover {
    background: #c73e1f;
    transform: translateY(-2px);
}

.btn-outline {
    background: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);
}

.btn-outline:hover {
    background: var(--primary);
    color: white;
}

/* Timeline */
.timeline {
    margin-top: 2rem;
    border-left: 3px solid var(--primary);
    padding-left: 1.5rem;
}

.timeline-item {
    margin-bottom: 2rem;
    position: relative;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: -1.95rem;
    top: 0.3rem;
    width: 15px;
    height: 15px;
    background: var(--accent);
    border-radius: 50%;
}

.timeline-item h3 {
    color: var(--primary);
}

.timeline-item .date {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.timeline-item ul {
    margin-left: 1.5rem;
    margin-top: 0.5rem;
}

/* Grid & Cards for Projects */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
}

.card h3 {
    margin-bottom: 1rem;
    color: var(--primary);
}

.card:hover {
    transform: translateY(-5px);
}

.project-link {
    display: inline-block;
    margin-top: auto;
    padding-top: 1rem;
    color: var(--accent);
    text-decoration: none;
    font-weight: bold;
}

.resume-links {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

footer {
    text-align: center;
    padding: 2rem;
    background: var(--primary);
    color: white;
}

/* Scroll Animation Classes */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.animate-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav-links {
        gap: 1rem;
        font-size: 0.9rem;
    }
    .hero h1 {
        font-size: 2.5rem;
    }
    .resume-links {
        flex-direction: column;
    }
}
"""

js_content = """document.addEventListener('DOMContentLoaded', () => {
    const observerElements = document.querySelectorAll('.animate-on-scroll');

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
});
"""

# Write files
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_content)
with open("style.css", "w", encoding="utf-8") as f:
    f.write(css_content)
with open("script.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("✅ Success! index.html, style.css, and script.js have been updated with your resume and Streamlit details.")