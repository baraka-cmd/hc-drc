/* ============================================================
   HOPE CHILD-DRC — MISSION.JS
   Scripts de la Page Mission & Vision
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Animations et interactions de la page Mission
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION MISSION
   ============================================================ */
const MissionConfig = {
    animations: {
        revealDuration: 600,
        staggerDelay: 150,
        sectionFadeDuration: 800
    },
    counters: {
        duration: 2000,
        startOnScroll: true,
        threshold: 0.3
    }
};

/* ============================================================
   2. ÉTAT MISSION
   ============================================================ */
const MissionState = {
    initialized: false,
    animationsInitialized: false
};

/* ============================================================
   3. CLASSE PRINCIPALE MISSION
   ============================================================ */
class MissionPage {
    constructor() {
        this.missionCards = [];
        this.objectiveItems = [];
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
            if (!MissionState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.cacheElements();

        if (this.missionCards.length === 0 && this.objectiveItems.length === 0) {
            console.warn('⚠️ Page Mission introuvable');
            return;
        }

        MissionState.initialized = true;

        this.initScrollAnimations();
        this.initHoverEffects();

        console.log('✅ Page Mission initialisée');
    }

    cacheElements() {
        this.missionCards = Array.from(document.querySelectorAll('.mission-card, .vision-card'));
        this.objectiveItems = Array.from(document.querySelectorAll('.objective-item'));
        this.ctaCard = document.querySelector('.mission-cta-card');
    }

    /* ============================================================
       4. ANIMATIONS AU SCROLL
       ============================================================ */
    initScrollAnimations() {
        MissionState.animationsInitialized = true;

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
        /* Effet sur les cartes Mission et Vision */
        this.missionCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(8, 38, 75, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });

        /* Effet sur les objectifs */
        this.objectiveItems.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-6px)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
            });
        });

        console.log('✅ Effets de survol initialisés');
    }

    /* ============================================================
       6. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...MissionState };
    }

    destroy() {
        MissionState.initialized = false;
        console.log('🗑️ Page Mission détruite');
    }
}

/* ============================================================
   7. EXPORTATION GLOBALE
   ============================================================ */
window.MissionPage = MissionPage;
window.MissionConfig = MissionConfig;
window.MissionState = MissionState;

/* ============================================================
   8. DÉMARRAGE
   ============================================================ */
let missionPageInstance = null;

function initMissionPage() {
    if (!missionPageInstance) {
        missionPageInstance = new MissionPage();
    }
    return missionPageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMissionPage();
    });
} else {
    initMissionPage();
}

document.addEventListener('layout-ready', () => {
    if (!MissionState.initialized) {
        initMissionPage();
    }
});

/* ============================================================
   FIN DU FICHIER MISSION.JS
   ============================================================ */