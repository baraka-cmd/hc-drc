/* ============================================================
   HOPE CHILD-DRC — OU-NOUS-TRAVAILLONS.JS
   Scripts de la Page Zones d'Intervention
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Animations et interactions de la page Zones
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION ZONES
   ============================================================ */
const ZonesConfig = {
    animations: {
        revealDuration: 600,
        staggerDelay: 150,
        sectionFadeDuration: 800
    },
    map: {
        googleMapsUrl: 'https://maps.google.com/?q=Goma,Nord-Kivu,RDC'
    }
};

/* ============================================================
   2. ÉTAT ZONES
   ============================================================ */
const ZonesState = {
    initialized: false,
    animationsInitialized: false
};

/* ============================================================
   3. CLASSE PRINCIPALE ZONES
   ============================================================ */
class ZonesPage {
    constructor() {
        this.zoneCards = [];
        this.mapContainer = null;
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
            if (!ZonesState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.cacheElements();

        if (this.zoneCards.length === 0) {
            console.warn('⚠️ Page Zones introuvable');
            return;
        }

        ZonesState.initialized = true;

        this.initScrollAnimations();
        this.initHoverEffects();
        this.initMapInteraction();

        console.log('✅ Page Zones initialisée');
        console.log('   - Zones : ' + this.zoneCards.length);
    }

    cacheElements() {
        this.zoneCards = Array.from(document.querySelectorAll('.zone-card'));
        this.mapContainer = document.querySelector('.zone-map-placeholder');
        this.ctaCard = document.querySelector('.zones-cta-card');
    }

    /* ============================================================
       4. ANIMATIONS AU SCROLL
       ============================================================ */
    initScrollAnimations() {
        ZonesState.animationsInitialized = true;

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
        this.zoneCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(8, 38, 75, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });

            /* Animation d'entrée */
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            card.style.transitionDelay = (index * ZonesConfig.animations.staggerDelay) + 'ms';

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * ZonesConfig.animations.staggerDelay));
        });

        console.log('✅ Effets de survol initialisés');
    }

    /* ============================================================
       6. INTERACTION CARTE
       ============================================================ */
    initMapInteraction() {
        if (!this.mapContainer) return;

        this.mapContainer.addEventListener('click', () => {
            window.open(ZonesConfig.map.googleMapsUrl, '_blank');
        });

        this.mapContainer.style.cursor = 'pointer';

        console.log('✅ Interaction carte initialisée');
    }

    /* ============================================================
       7. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...ZonesState };
    }

    destroy() {
        ZonesState.initialized = false;
        console.log('🗑️ Page Zones détruite');
    }
}

/* ============================================================
   8. EXPORTATION GLOBALE
   ============================================================ */
window.ZonesPage = ZonesPage;
window.ZonesConfig = ZonesConfig;
window.ZonesState = ZonesState;

/* ============================================================
   9. DÉMARRAGE
   ============================================================ */
let zonesPageInstance = null;

function initZonesPage() {
    if (!zonesPageInstance) {
        zonesPageInstance = new ZonesPage();
    }
    return zonesPageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initZonesPage();
    });
} else {
    initZonesPage();
}

document.addEventListener('layout-ready', () => {
    if (!ZonesState.initialized) {
        initZonesPage();
    }
});

/* ============================================================
   FIN DU FICHIER OU-NOUS-TRAVAILLONS.JS
   ============================================================ */