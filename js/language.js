const translations = {};
let currentLang = 'en';

const flags = {
    'en': 'https://flagcdn.com/w20/us.png',
    'hu': 'https://flagcdn.com/w20/hu.png',
    'de': 'https://flagcdn.com/w20/de.png'
};
const texts = {
    'en': 'EN',
    'hu': 'HU',
    'de': 'DE'
};

// Check if we are inside a subdirectory like /en/ or /hu/
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const langSegment = pathSegments.find(segment => ['en', 'hu', 'de'].includes(segment));
const inSubdir = !!langSegment;
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
        flagEl.src = flags[lang] || flags['en'];
        textEl.textContent = texts[lang] || texts['en'];
    }
}

function updateResumeLink(lang) {
    const resumeIframe = document.querySelector('.resume-viewer iframe');
    const resumeLink = document.querySelector('.resume-links a.btn[target="_blank"][href*="Resume"]');
    
    let pdfFile = 'Laszlo_Edgar_Dobra_Resume.pdf';
    if (lang === 'hu') {
        pdfFile = 'Laszlo_Edgar_Dobra_Resume_HU.pdf';
    } else if (lang === 'de') {
        pdfFile = 'Laszlo_Edgar_Dobra_Resume_EN.pdf';
    }
    const pdfPath = prefix + 'doc/' + pdfFile;
    
    if (resumeIframe) {
        resumeIframe.src = pdfPath;
    }
    if (resumeLink) {
        resumeLink.href = pdfPath;
    }
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(prefix + `json/${lang}.json`);
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
        initialLang = langSegment;
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