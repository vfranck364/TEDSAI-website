/**
 * Simple EN/FR Toggle System for TEDSAI
 * Lightweight bilingual system with blue toggle button
 */

class BilingualToggle {
    constructor() {
        this.currentLang = 'en'; // Default: English
        this.translations = { en: {}, fr: {} };
    }

    async init() {
        // Load both languages
        await Promise.all([
            this.loadLanguage('en'),
            this.loadLanguage('fr')
        ]);

        // Get saved language or default to English
        const savedLang = localStorage.getItem('site_lang') || 'en';
        this.currentLang = savedLang;

        // Apply translations
        this.applyTranslations();
        this.updateButton();
    }

    async loadLanguage(lang) {
        try {
            const isSubDir = window.location.pathname.includes('/pages/');
            const path = isSubDir ? `../assets/i18n/${lang}.json` : `assets/i18n/${lang}.json`;

            const response = await fetch(path);
            if (response.ok) {
                this.translations[lang] = await response.json();
            }
        } catch (error) {
            console.warn(`Failed to load ${lang}.json`);
        }
    }

    toggle() {
        // Switch between EN and FR
        this.currentLang = this.currentLang === 'en' ? 'fr' : 'en';
        localStorage.setItem('site_lang', this.currentLang);

        this.applyTranslations();
        this.updateButton();
    }

    applyTranslations() {
        const translations = this.translations[this.currentLang];

        // Translate all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.getTranslation(key);
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = text;
                    }
                } else {
                    el.textContent = text;
                }
            }
        });

        // Translate HTML content
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const text = this.getTranslation(key);
            if (text) {
                el.innerHTML = text;
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return null;
            }
        }

        return value;
    }

    updateButton() {
        const btn = document.getElementById('lang-toggle-btn');
        if (btn) {
            // Show the language we'll switch TO
            const nextLang = this.currentLang === 'en' ? 'FR' : 'EN';
            btn.innerHTML = `<i class="fa-solid fa-language"></i> ${nextLang}`;
            btn.title = this.currentLang === 'en' ? 'Passer en Français' : 'Switch to English';
        }
    }
}

// Global instance
const langToggle = new BilingualToggle();

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => langToggle.init());
} else {
    langToggle.init();
}

// Global toggle function
function toggleLanguage() {
    langToggle.toggle();
}
