const translations = {};
let currentLang = 'en';

const flags = {
    'en': '🇺🇸',
    'hu': '🇭🇺',
    'de': '🇩🇪'
};
const texts = {
    'en': 'EN',
    'hu': 'HU',
    'de': 'DE'
};

// Check if we are inside a subdirectory like /en/ or /hu/
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const lastSegment = pathSegments[pathSegments.length - 1];
const inSubdir = ['en', 'hu', 'de'].includes(lastSegment);
const prefix = inSubdir ? '../' : '';

async function setLanguage(lang) {
    currentLang = lang;
    await loadTranslations(lang);
    updateContent();
    updateDropdown(lang);
    updateResumeLink(lang);
    if (typeof initializePage === 'function') {
        initializePage();
    }
}

function updateDropdown(lang) {
    const flagEl = document.getElementById('current-lang-flag');
    const textEl = document.getElementById('current-lang-text');
    if (flagEl && textEl) {
        flagEl.className = `fi ${flags[lang] || flags['en']}`;
        textEl.textContent = texts[lang] || texts['en'];
    }
}

function updateResumeLink(lang) {
    const resumeIframe = document.querySelector('.resume-viewer iframe');
    const resumeLink = document.querySelector('.resume-links a.btn[target="_blank"][href*="Resume"]');
    const pdfPath = lang === 'hu' ? prefix + 'doc/Resume_General_HU.pdf' : prefix + 'doc/Resume_General.pdf';
    
    if (resumeIframe) {
        resumeIframe.src = pdfPath;
    }
    if (resumeLink) {
        resumeLink.href = pdfPath;
    }
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(prefix + `${lang}.json`);
        translations[lang] = await response.json();
    } catch (error) {
        console.error(`Could not load translations for ${lang}`, error);
    }
}

function updateContent() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLang] && translations[currentLang][key]) {
             element.innerHTML = translations[currentLang][key];
        }
    });
    if (translations[currentLang] && translations[currentLang]['title']) {
         document.title = translations[currentLang]['title'];
    }
}

function getLanguageFromLocation() {
    const browserLang = navigator.language || navigator.userLanguage || '';
    const langLower = browserLang.toLowerCase();
    
    if (langLower.startsWith('hu')) return 'hu';
    if (langLower.startsWith('de') || langLower === 'de-at' || langLower === 'de-ch') return 'de';
    return 'en';
}

document.addEventListener('DOMContentLoaded', () => {
    let initialLang = 'en';
    
    if (inSubdir) {
        initialLang = lastSegment;
    } else {
        // If we are at the root, redirect based on location
        if (window.location.protocol !== 'file:') {
            initialLang = getLanguageFromLocation();
            window.location.replace(`${initialLang}/`);
            return;
        } else {
            // Local file testing, don't redirect to folder
            initialLang = getLanguageFromLocation();
        }
    }

    setLanguage(initialLang);

    const selected = document.querySelector('.select-selected');
    const items = document.querySelector('.select-items');
    
    if (selected && items) {
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            items.classList.toggle('select-hide');
        });

        document.querySelectorAll('.select-items div').forEach(item => {
            item.addEventListener('click', () => {
                const lang = item.getAttribute('data-lang');
                if (window.location.protocol !== 'file:') {
                    window.location.href = prefix + `${lang}/`;
                } else {
                    setLanguage(lang);
                    items.classList.add('select-hide');
                }
            });
        });

        document.addEventListener('click', () => {
            items.classList.add('select-hide');
        });
    }
});