/* ============================================================
   HOPE CHILD-DRC — VALEURS.JS
   Scripts de la Page Nos Valeurs
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Animations et interactions de la page Valeurs
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION VALEURS
   ============================================================ */
const ValeursConfig = {
    animations: {
        revealDuration: 600,
        staggerDelay: 150
    }
};

/* ============================================================
   2. ÉTAT VALEURS
   ============================================================ */
const ValeursState = {
    initialized: false,
    animationsInitialized: false
};

/* ============================================================
   3. CLASSE PRINCIPALE VALEURS
   ============================================================ */
class ValeursPage {
    constructor() {
        this.valeurCards = [];
        this.ctaCard = null;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        document.addEventListener('layout-ready', () => {
            if (!ValeursState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.cacheElements();

        if (this.valeurCards.length === 0) {
            console.warn('⚠️ Page Valeurs introuvable');
            return;
        }

        ValeursState.initialized = true;

        this.initScrollAnimations();
        this.initHoverEffects();

        console.log('✅ Page Valeurs initialisée');
        console.log('   - Valeurs : ' + this.valeurCards.length);
    }

    cacheElements() {
        this.valeurCards = Array.from(document.querySelectorAll('.valeur-card'));
        this.ctaCard = document.querySelector('.valeurs-cta-card');
    }

    /* ============================================================
       4. ANIMATIONS AU SCROLL
       ============================================================ */
    initScrollAnimations() {
        ValeursState.animationsInitialized = true;

        const elements = document.querySelectorAll('[data-aos]');

        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;

                    setTimeout(() => {
                        element.classList.add('aos-animate');
                    }, delay);

                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach((element) => {
            observer.observe(element);
        });

        console.log('✅ Animations au scroll initialisées');
    }

    /* ============================================================
       5. EFFETS DE SURVOL
       ============================================================ */
    initHoverEffects() {
        this.valeurCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(8, 38, 75, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });

            /* Animation d'entrée avec délai */
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            card.style.transitionDelay = (index * ValeursConfig.animations.staggerDelay) + 'ms';

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * ValeursConfig.animations.staggerDelay));
        });

        console.log('✅ Effets de survol initialisés');
    }

    /* ============================================================
       6. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...ValeursState };
    }

    destroy() {
        ValeursState.initialized = false;
        console.log('🗑️ Page Valeurs détruite');
    }
}

/* ============================================================
   7. EXPORTATION GLOBALE
   ============================================================ */
window.ValeursPage = ValeursPage;
window.ValeursConfig = ValeursConfig;
window.ValeursState = ValeursState;

/* ============================================================
   8. DÉMARRAGE
   ============================================================ */
let valeursPageInstance = null;

function initValeursPage() {
    if (!valeursPageInstance) {
        valeursPageInstance = new ValeursPage();
    }
    return valeursPageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initValeursPage();
    });
} else {
    initValeursPage();
}

document.addEventListener('layout-ready', () => {
    if (!ValeursState.initialized) {
        initValeursPage();
    }
});

/* ============================================================
   FIN DU FICHIER VALEURS.JS
   ============================================================ */