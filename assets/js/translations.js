/* ============================================================
   HOPE CHILD-DRC — TRANSLATIONS.JS
   Moteur de Traduction FR/EN
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Système complet de traduction du site,
                 gestion des langues, persistance,
                 traduction dynamique du DOM
   ============================================================ */

'use strict';

/* ============================================================
   1. CLASSE PRINCIPALE DE TRADUCTION
   ============================================================ */
class TranslationManager {
    constructor(options = {}) {
        this.options = {
            defaultLanguage: CONFIG?.translation?.defaultLanguage || 'fr',
            supportedLanguages: CONFIG?.translation?.supportedLanguages || ['fr', 'en'],
            persistLanguage: CONFIG?.translation?.persistLanguage ?? true,
            storageKey: CONFIG?.translation?.storageKey || 'hc_drc_language',
            translationsFile: CONFIG?.translation?.translationsFile || 'data/translations.json',
            fallbackLanguage: CONFIG?.translation?.fallbackLanguage || 'fr',
            ...options
        };

        this.currentLanguage = this.options.defaultLanguage;
        this.translations = {};
        this.isLoaded = false;
        this.observers = [];
        this.translationAttributes = [
            'data-translate',
            'data-translate-title',
            'data-translate-placeholder',
            'data-translate-aria-label',
            'data-translate-alt',
            'data-translate-content',
            'data-translate-value'
        ];

        this.init();
    }

    /* ========== INITIALISATION ========== */
    async init() {
        // Récupérer la langue sauvegardée
        if (this.options.persistLanguage) {
            this.currentLanguage = this.getStoredLanguage();
        }

        // Récupérer la langue depuis l'URL (?lang=en)
        const urlLanguage = this.getLanguageFromUrl();
        if (urlLanguage && this.options.supportedLanguages.includes(urlLanguage)) {
            this.currentLanguage = urlLanguage;
            if (this.options.persistLanguage) {
                this.storeLanguage(urlLanguage);
            }
        }

        // Charger les traductions
        await this.loadTranslations();

        // Appliquer la langue
        this.applyLanguage(this.currentLanguage);

        // Mettre à jour l'attribut lang du HTML
        document.documentElement.setAttribute('lang', this.currentLanguage);

        // Notifier les observateurs
        this.notifyObservers(this.currentLanguage);

        // Log
        console.log(`🌐 Langue initialisée : ${this.currentLanguage}`);
    }

    /* ========== CHARGEMENT DES TRADUCTIONS ========== */
    async loadTranslations() {
        try {
            // Vérifier si les traductions sont déjà dans le cache global
            if (window.TRANSLATIONS_DATA) {
                this.translations = window.TRANSLATIONS_DATA;
                this.isLoaded = true;
                return;
            }

            // Essayer de charger depuis le fichier JSON
            const response = await fetch(this.options.translationsFile);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            this.translations = await response.json();
            this.isLoaded = true;
            
            // Mettre en cache
            window.TRANSLATIONS_DATA = this.translations;
            
            console.log('✅ Traductions chargées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement des traductions :', error);
            
            // Utiliser les traductions de secours intégrées
            this.translations = this.getFallbackTranslations();
            this.isLoaded = true;
        }
    }

    /* ========== CHANGEMENT DE LANGUE ========== */
    setLanguage(language, options = {}) {
        const {
            persist = true,
            updateUrl = true,
            reloadPage = false
        } = options;

        if (!this.options.supportedLanguages.includes(language)) {
            console.warn(`⚠️ Langue non supportée : ${language}`);
            return false;
        }

        if (language === this.currentLanguage) {
            console.log(`ℹ️ La langue ${language} est déjà active`);
            return true;
        }

        this.currentLanguage = language;

        // Persister la langue
        if (persist && this.options.persistLanguage) {
            this.storeLanguage(language);
        }

        // Mettre à jour l'URL
        if (updateUrl) {
            this.updateUrlLanguage(language);
        }

        // Appliquer la langue au DOM
        this.applyLanguage(language);

        // Mettre à jour l'attribut lang
        document.documentElement.setAttribute('lang', language);

        // Notifier les observateurs
        this.notifyObservers(language);

        // Dispatch un événement personnalisé
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: language }
        }));

        console.log(`🌐 Langue changée : ${language}`);

        return true;
    }

    toggleLanguage() {
        const currentIndex = this.options.supportedLanguages.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % this.options.supportedLanguages.length;
        const nextLanguage = this.options.supportedLanguages[nextIndex];
        return this.setLanguage(nextLanguage);
    }

    getLanguage() {
        return this.currentLanguage;
    }

    /* ========== APPLICATION DE LA LANGUE ========== */
    applyLanguage(language) {
        if (!this.isLoaded) {
            console.warn('⚠️ Traductions non chargées');
            return;
        }

        const translations = this.translations[language] || this.translations[this.options.fallbackLanguage] || {};
        
        // Traduire tous les éléments avec data-translate
        this.translateElements(translations);
        
        // Traduire les attributs
        this.translateAttributes(translations);
        
        // Mettre à jour le titre de la page
        this.updatePageTitle(translations);
        
        // Mettre à jour les meta description
        this.updateMetaDescription(translations);
    }

    /* ========== TRADUCTION DES ÉLÉMENTS ========== */
    translateElements(translations) {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getNestedTranslation(translations, key);
            
            if (translation) {
                // Vérifier si l'élément contient du HTML
                const hasHtml = element.hasAttribute('data-translate-html');
                
                if (hasHtml) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    translateAttributes(translations) {
        // Traduire les attributs title
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.getAttribute('data-translate-title');
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                element.setAttribute('title', translation);
            }
        });

        // Traduire les placeholders
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                element.setAttribute('placeholder', translation);
            }
        });

        // Traduire les aria-labels
        document.querySelectorAll('[data-translate-aria-label]').forEach(element => {
            const key = element.getAttribute('data-translate-aria-label');
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Traduire les alt d'images
        document.querySelectorAll('[data-translate-alt]').forEach(element => {
            const key = element.getAttribute('data-translate-alt');
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                element.setAttribute('alt', translation);
            }
        });

        // Traduire les valeurs (pour les inputs)
        document.querySelectorAll('[data-translate-value]').forEach(element => {
            const key = element.getAttribute('data-translate-value');
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                element.setAttribute('value', translation);
            }
        });

        // Traduire les attributs data-content (pour les pseudo-éléments)
        document.querySelectorAll('[data-translate-content]').forEach(element => {
            const key = element.getAttribute('data-translate-content');
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                element.setAttribute('data-content', translation);
            }
        });
    }

    updatePageTitle(translations) {
        // Chercher une traduction SEO spécifique pour la page actuelle
        const currentPage = this.getCurrentPageName();
        const seoTitleKey = `seo.${currentPage}_title`;
        const seoTitle = this.getNestedTranslation(translations, seoTitleKey);
        
        if (seoTitle) {
            document.title = seoTitle;
        }
    }

    updateMetaDescription(translations) {
        const currentPage = this.getCurrentPageName();
        const seoDescKey = `seo.${currentPage}_description`;
        const seoDesc = this.getNestedTranslation(translations, seoDescKey);
        
        if (seoDesc) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', seoDesc);
            }
        }
    }

    /* ========== TRADUCTION DYNAMIQUE ========== */
    translate(key, language = this.currentLanguage) {
        const translations = this.translations[language] || this.translations[this.options.fallbackLanguage] || {};
        return this.getNestedTranslation(translations, key) || key;
    }

    translateTo(language, key) {
        return this.translate(key, language);
    }

    /* ========== OUTILS ========== */
    getNestedTranslation(translations, key) {
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return typeof value === 'string' ? value : null;
    }

    getStoredLanguage() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored && this.options.supportedLanguages.includes(stored)) {
                return stored;
            }
        } catch (error) {
            console.warn('⚠️ Impossible de lire le localStorage');
        }
        return this.options.defaultLanguage;
    }

    storeLanguage(language) {
        try {
            localStorage.setItem(this.options.storageKey, language);
        } catch (error) {
            console.warn('⚠️ Impossible d\'écrire dans le localStorage');
        }
    }

    getLanguageFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('lang');
    }

    updateUrlLanguage(language) {
        try {
            const url = new URL(window.location);
            url.searchParams.set('lang', language);
            window.history.replaceState({}, '', url);
        } catch (error) {
            console.warn('⚠️ Impossible de mettre à jour l\'URL');
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const pageName = filename.replace('.html', '');
        
        const pageMap = {
            'index': 'home',
            'about': 'about',
            'projets': 'projects',
            'projet-detail': 'projects',
            'domaines': 'domains',
            'contact': 'contact',
            'don': 'donate'
        };
        
        return pageMap[pageName] || pageName;
    }

    /* ========== OBSERVATEURS ========== */
    addObserver(callback) {
        if (typeof callback === 'function' && !this.observers.includes(callback)) {
            this.observers.push(callback);
        }
    }

    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    notifyObservers(language) {
        this.observers.forEach(callback => {
            try {
                callback(language);
            } catch (error) {
                console.error('❌ Erreur dans un observateur :', error);
            }
        });
    }

    /* ========== TRADUCTIONS DE SECOURS ========== */
    getFallbackTranslations() {
        return {
            fr: {
                'nav.home': 'Accueil',
                'nav.about': 'À Propos',
                'nav.projects': 'Nos Projets',
                'nav.contact': 'Contact',
                'nav.donate': 'Faire un Don',
                'hero.title_1': 'Sauvons des',
                'hero.title_highlight': 'vies',
                'hero.title_2': 'ensemble',
                'buttons.donate': 'Faire un Don',
                'buttons.contact': 'Nous Contacter'
            },
            en: {
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.projects': 'Our Projects',
                'nav.contact': 'Contact',
                'nav.donate': 'Donate',
                'hero.title_1': "Let's Save",
                'hero.title_highlight': 'Lives',
                'hero.title_2': 'Together',
                'buttons.donate': 'Donate',
                'buttons.contact': 'Contact Us'
            }
        };
    }
}

/* ============================================================
   2. FONCTIONS GLOBALES DE TRADUCTION
   ============================================================ */

let translationManagerInstance = null;

/**
 * Initialise le gestionnaire de traduction
 * @returns {TranslationManager} Instance du gestionnaire
 */
function initTranslations() {
    if (!translationManagerInstance) {
        translationManagerInstance = new TranslationManager();
    }
    return translationManagerInstance;
}

/**
 * Récupère l'instance du gestionnaire de traduction
 * @returns {TranslationManager} Instance du gestionnaire
 */
function getTranslator() {
    if (!translationManagerInstance) {
        return initTranslations();
    }
    return translationManagerInstance;
}

/**
 * Change la langue du site
 * @param {string} language - Code de langue ('fr' ou 'en')
 */
function setLanguage(language) {
    const translator = getTranslator();
    return translator.setLanguage(language);
}

/**
 * Bascule entre les langues disponibles
 */
function toggleLanguage() {
    const translator = getTranslator();
    return translator.toggleLanguage();
}

/**
 * Traduit une clé de traduction
 * @param {string} key - Clé de traduction (ex: 'nav.home')
 * @returns {string} Texte traduit
 */
function translate(key) {
    const translator = getTranslator();
    return translator.translate(key);
}

/**
 * Raccourci pour translate
 */
function t(key) {
    return translate(key);
}

/* ============================================================
   3. SÉLECTEUR DE LANGUE (UI)
   ============================================================ */
class LanguageSwitcher {
    constructor(selector = '.language-switcher') {
        this.container = document.querySelector(selector);
        this.translator = getTranslator();
        
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.renderButtons();
        this.bindEvents();
        this.updateActiveButton();
        
        // Observer les changements de langue
        this.translator.addObserver((language) => {
            this.updateActiveButton();
        });
    }

    renderButtons() {
        const languages = this.translator.options.supportedLanguages;
        
        this.container.innerHTML = languages.map(lang => {
            const isActive = lang === this.translator.currentLanguage;
            const langName = lang.toUpperCase();
            return `
                <button class="language-btn ${isActive ? 'active' : ''}" 
                        data-language="${lang}" 
                        type="button"
                        aria-label="Switch to ${langName}">
                    ${langName}
                </button>
            `;
        }).join('');
    }

    bindEvents() {
        this.container.querySelectorAll('.language-btn').forEach(button => {
            button.addEventListener('click', () => {
                const language = button.getAttribute('data-language');
                this.translator.setLanguage(language);
            });
        });
    }

    updateActiveButton() {
        const currentLanguage = this.translator.currentLanguage;
        
        this.container.querySelectorAll('.language-btn').forEach(button => {
            const lang = button.getAttribute('data-language');
            if (lang === currentLanguage) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        });
    }
}

/* ============================================================
   4. TRADUCTION DYNAMIQUE POUR CONTENU AJOUTÉ
   ============================================================ */
class DynamicContentTranslator {
    constructor() {
        this.translator = getTranslator();
        this.observer = null;
        this.init();
    }

    init() {
        // Observer les changements dans le DOM
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.translateNode(node);
                        }
                    });
                }
            });
        });

        // Observer tout le document
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    translateNode(node) {
        // Traduire le nœud lui-même
        this.translateElement(node);
        
        // Traduire tous les descendants
        node.querySelectorAll('[data-translate], [data-translate-title], [data-translate-placeholder], [data-translate-aria-label], [data-translate-alt], [data-translate-value]').forEach(el => {
            this.translateElement(el);
        });
    }

    translateElement(element) {
        const language = this.translator.currentLanguage;
        const translations = this.translator.translations[language] || this.translator.translations[this.translator.options.fallbackLanguage] || {};
        
        // data-translate
        if (element.hasAttribute('data-translate')) {
            const key = element.getAttribute('data-translate');
            const translation = this.translator.getNestedTranslation(translations, key);
            if (translation) {
                if (element.hasAttribute('data-translate-html')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        }
        
        // data-translate-title
        if (element.hasAttribute('data-translate-title')) {
            const key = element.getAttribute('data-translate-title');
            const translation = this.translator.getNestedTranslation(translations, key);
            if (translation) element.setAttribute('title', translation);
        }
        
        // data-translate-placeholder
        if (element.hasAttribute('data-translate-placeholder')) {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.translator.getNestedTranslation(translations, key);
            if (translation) element.setAttribute('placeholder', translation);
        }
        
        // data-translate-aria-label
        if (element.hasAttribute('data-translate-aria-label')) {
            const key = element.getAttribute('data-translate-aria-label');
            const translation = this.translator.getNestedTranslation(translations, key);
            if (translation) element.setAttribute('aria-label', translation);
        }
        
        // data-translate-alt
        if (element.hasAttribute('data-translate-alt')) {
            const key = element.getAttribute('data-translate-alt');
            const translation = this.translator.getNestedTranslation(translations, key);
            if (translation) element.setAttribute('alt', translation);
        }
    }
}

/* ============================================================
   5. EXPORTATION GLOBALE
   ============================================================ */
window.TranslationManager = TranslationManager;
window.LanguageSwitcher = LanguageSwitcher;
window.DynamicContentTranslator = DynamicContentTranslator;
window.initTranslations = initTranslations;
window.getTranslator = getTranslator;
window.setLanguage = setLanguage;
window.toggleLanguage = toggleLanguage;
window.translate = translate;
window.t = t;

/* ============================================================
   6. INITIALISATION AUTOMATIQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialiser le gestionnaire de traduction
        const translator = initTranslations();
        
        // Attendre que les traductions soient chargées
        await translator.loadTranslations();
        
        // Initialiser le sélecteur de langue
        const languageSwitcher = new LanguageSwitcher();
        
        // Initialiser le traducteur de contenu dynamique
        const dynamicTranslator = new DynamicContentTranslator();
        
        // Exposer les instances globalement
        window.translator = translator;
        window.languageSwitcher = languageSwitcher;
        window.dynamicTranslator = dynamicTranslator;
        
        console.log('✅ Système de traduction initialisé');
        console.log(`🌐 Langue actuelle : ${translator.currentLanguage}`);
        console.log(`📚 Langues disponibles : ${translator.options.supportedLanguages.join(', ')}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la traduction :', error);
    }
});

/* ============================================================
   FIN DU FICHIER TRANSLATIONS.JS
   ============================================================ */