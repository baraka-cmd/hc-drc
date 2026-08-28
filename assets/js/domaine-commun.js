/* ============================================================
   HOPE CHILD-DRC — DOMAINE-COMMUN.JS
   Scripts Partagés des Pages Domaines
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Animations et interactions communes
                 pour les 6 pages domaines
   ============================================================ */

'use strict';

const DomaineConfig = {
    animations: {
        staggerDelay: 100,
        revealDuration: 500
    }
};

const DomaineState = {
    initialized: false
};

class DomainePage {
    constructor() {
        this.sousDomaineCards = [];
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        document.addEventListener('layout-ready', () => {
            if (!DomaineState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.sousDomaineCards = Array.from(document.querySelectorAll('.sous-domaine-card'));

        if (this.sousDomaineCards.length === 0) {
            console.warn('⚠️ Page Domaine introuvable');
            return;
        }

        DomaineState.initialized = true;
        this.initHoverEffects();

        console.log('✅ Page Domaine initialisée');
        console.log('   - Sous-domaines : ' + this.sousDomaineCards.length);
    }

    initHoverEffects() {
        this.sousDomaineCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    getState() {
        return { ...DomaineState };
    }

    destroy() {
        DomaineState.initialized = false;
        console.log('🗑️ Page Domaine détruite');
    }
}

window.DomainePage = DomainePage;
window.DomaineConfig = DomaineConfig;
window.DomaineState = DomaineState;

let domainePageInstance = null;

function initDomainePage() {
    if (!domainePageInstance) {
        domainePageInstance = new DomainePage();
    }
    return domainePageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDomainePage());
} else {
    initDomainePage();
}

document.addEventListener('layout-ready', () => {
    if (!DomaineState.initialized) {
        initDomainePage();
    }
});