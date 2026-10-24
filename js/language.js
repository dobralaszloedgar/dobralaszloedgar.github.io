document.addEventListener('DOMContentLoaded', () => {
    const selected = document.querySelector('.select-selected');
    const items = document.querySelector('.select-items');
    if (!selected || !items) return;
    const links = [...items.querySelectorAll('a')];
    function setOpen(open, focusIndex) {
        items.classList.toggle('select-hide', !open);
        selected.setAttribute('aria-expanded', String(open));
        if (open && focusIndex !== undefined) links[focusIndex].focus();
    }
    selected.addEventListener('click', () => setOpen(items.classList.contains('select-hide')));
    selected.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        setOpen(true, event.key === 'ArrowDown' ? 0 : links.length - 1);
    });
    items.addEventListener('keydown', event => {
        const index = links.indexOf(document.activeElement);
        let next;
        if (event.key === 'ArrowDown') next = (index + 1) % links.length;
        if (event.key === 'ArrowUp') next = (index - 1 + links.length) % links.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = links.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        links[next].focus();
    });
    links.forEach(link => link.addEventListener('click', () => {
        // Keep the visitor in the same section when changing languages.
        link.hash = window.location.hash;
    }));
    document.addEventListener('click', event => {
        if (!event.target.closest('.custom-select')) setOpen(false);
    });
    document.querySelector('.custom-select').addEventListener('focusout', event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !items.classList.contains('select-hide')) {
            setOpen(false);
            selected.focus();
        }
    });
});
