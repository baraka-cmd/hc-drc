/* ============================================================
   HOPE CHILD-DRC — FAQ.JS
   Scripts Spécifiques de la Page FAQ
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion de l'accordéon FAQ, filtres
                 par catégorie, animations
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION FAQ
   ============================================================ */
const FaqConfig = {
    filters: {
        defaultCategory: 'tous',
        animationDuration: 300,
        storageKey: 'hc_drc_faq_filter'
    },
    accordion: {
        maxHeight: 400,
        animationDuration: 500,
        closeOthers: true
    }
};

/* ============================================================
   2. ÉTAT FAQ
   ============================================================ */
const FaqState = {
    initialized: false,
    currentFilter: 'tous',
    openItem: null,
    isAnimating: false
};

/* ============================================================
   3. CLASSE PRINCIPALE FAQ
   ============================================================ */
class FaqPage {
    constructor() {
        this.filterBar = null;
        this.filterButtons = [];
        this.accordion = null;
        this.faqItems = [];
        this.noResults = null;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        document.addEventListener('layout-ready', () => {
            if (!FaqState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.cacheElements();

        if (!this.accordion || this.faqItems.length === 0) {
            console.warn('⚠️ Accordéon FAQ introuvable');
            return;
        }

        FaqState.initialized = true;

        this.restoreFilter();
        this.initFilters();
        this.initAccordion();
        this.applyFilter(FaqState.currentFilter, false);

        console.log('✅ Page FAQ initialisée');
        console.log('   - Questions : ' + this.faqItems.length);
    }

    cacheElements() {
        this.filterBar = document.getElementById('faq-filter-bar');
        this.filterButtons = Array.from(document.querySelectorAll('.faq-filter-bar .filter-btn'));
        this.accordion = document.getElementById('faq-accordion');
        this.faqItems = Array.from(document.querySelectorAll('#faq-accordion .faq-item'));
        this.noResults = document.getElementById('faq-no-results');
    }

    restoreFilter() {
        const savedFilter = localStorage.getItem(FaqConfig.filters.storageKey);
        if (savedFilter && this.isValidFilter(savedFilter)) {
            FaqState.currentFilter = savedFilter;
        }
    }

    isValidFilter(filter) {
        const validFilters = ['tous', 'dons', 'benevolat', 'partenariats', 'projets', 'general'];
        return validFilters.includes(filter);
    }

    /* ============================================================
       4. FILTRES
       ============================================================ */
    initFilters() {
        if (!this.filterBar || this.filterButtons.length === 0) return;

        this.filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                if (!filter) return;
                this.applyFilter(filter, true);
            });
        });

        console.log('✅ Filtres FAQ initialisés');
    }

    applyFilter(filter, animate = true) {
        FaqState.currentFilter = filter;
        localStorage.setItem(FaqConfig.filters.storageKey, filter);

        this.updateFilterButtonsUI();

        let visibleCount = 0;

        this.faqItems.forEach((item) => {
            const category = item.getAttribute('data-category');
            const isVisible = filter === 'tous' || category === filter;

            if (isVisible) {
                visibleCount++;
                if (animate) {
                    this.showItem(item);
                } else {
                    item.style.display = '';
                    item.style.opacity = '1';
                }
            } else {
                if (animate) {
                    this.hideItem(item);
                } else {
                    item.style.display = 'none';
                }
            }
        });

        this.toggleNoResults(visibleCount === 0);

        console.log('🔍 Filtre FAQ : ' + filter);
        console.log('   - Visibles : ' + visibleCount);
    }

    updateFilterButtonsUI() {
        this.filterButtons.forEach((button) => {
            const buttonFilter = button.getAttribute('data-filter');
            const isActive = buttonFilter === FaqState.currentFilter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    showItem(item) {
        item.style.display = '';
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = `all ${FaqConfig.filters.animationDuration}ms ease`;

        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 10);
    }

    hideItem(item) {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.98)';
        item.style.transition = `all ${FaqConfig.filters.animationDuration}ms ease`;

        setTimeout(() => {
            item.style.display = 'none';
        }, FaqConfig.filters.animationDuration);
    }

    toggleNoResults(show) {
        if (!this.noResults) return;
        this.noResults.style.display = show ? 'block' : 'none';
    }

    /* ============================================================
       5. ACCORDÉON
       ============================================================ */
    initAccordion() {
        this.faqItems.forEach((item) => {
            const header = item.querySelector('.faq-header');
            if (!header) return;

            header.addEventListener('click', () => {
                this.toggleItem(item);
            });
        });

        /* Ouvrir le premier item par défaut */
        if (this.faqItems.length > 0) {
            this.openItem(this.faqItems[0], false);
        }

        console.log('✅ Accordéon FAQ initialisé');
    }

    toggleItem(item) {
        if (FaqState.isAnimating) return;

        const isActive = item.classList.contains('active');

        if (isActive) {
            this.closeItem(item);
        } else {
            if (FaqConfig.accordion.closeOthers) {
                this.closeAllItemsExcept(item);
            }
            this.openItem(item, true);
        }
    }

    openItem(item, animate = true) {
        FaqState.isAnimating = true;
        item.classList.add('active');

        const content = item.querySelector('.faq-content');
        if (content) {
            content.style.maxHeight = FaqConfig.accordion.maxHeight + 'px';
        }

        FaqState.openItem = item;

        setTimeout(() => {
            FaqState.isAnimating = false;
        }, FaqConfig.accordion.animationDuration);
    }

    closeItem(item) {
        FaqState.isAnimating = true;
        item.classList.remove('active');

        const content = item.querySelector('.faq-content');
        if (content) {
            content.style.maxHeight = '0';
        }

        FaqState.openItem = null;

        setTimeout(() => {
            FaqState.isAnimating = false;
        }, FaqConfig.accordion.animationDuration);
    }

    closeAllItemsExcept(exceptionItem) {
        this.faqItems.forEach((item) => {
            if (item !== exceptionItem && item.classList.contains('active')) {
                item.classList.remove('active');
                const content = item.querySelector('.faq-content');
                if (content) {
                    content.style.maxHeight = '0';
                }
            }
        });
    }

    /* ============================================================
       6. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...FaqState };
    }

    openAll() {
        this.faqItems.forEach((item) => {
            this.openItem(item, false);
        });
    }

    closeAll() {
        this.faqItems.forEach((item) => {
            this.closeItem(item);
        });
    }

    destroy() {
        FaqState.initialized = false;
        FaqState.openItem = null;
        console.log('🗑️ Page FAQ détruite');
    }
}

/* ============================================================
   7. EXPORTATION GLOBALE
   ============================================================ */
window.FaqPage = FaqPage;
window.FaqConfig = FaqConfig;
window.FaqState = FaqState;

/* ============================================================
   8. DÉMARRAGE
   ============================================================ */
let faqPageInstance = null;

function initFaqPage() {
    if (!faqPageInstance) {
        faqPageInstance = new FaqPage();
    }
    return faqPageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initFaqPage();
    });
} else {
    initFaqPage();
}

document.addEventListener('layout-ready', () => {
    if (!FaqState.initialized) {
        initFaqPage();
    }
});

/* ============================================================
   FIN DU FICHIER FAQ.JS
   ============================================================ */