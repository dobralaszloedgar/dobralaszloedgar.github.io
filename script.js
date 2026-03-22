document.addEventListener('DOMContentLoaded', () => {
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
