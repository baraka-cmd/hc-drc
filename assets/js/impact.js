/* ============================================================
   HOPE CHILD-DRC — IMPACT.JS
   Scripts Spécifiques de la Page Notre Impact
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la page Impact,
                 compteurs animés, graphiques animés,
                 timeline, animations au scroll
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION IMPACT
   ============================================================ */
const ImpactConfig = {
    /* Compteurs */
    counters: {
        duration: 2000,
        easing: 'easeInOutCubic',
        startOnScroll: true,
        threshold: 0.3,
        respectReducedMotion: true
    },

    /* Barres de graphique */
    bars: {
        animationDuration: 1500,
        startOnScroll: true,
        threshold: 0.3,
        staggerDelay: 100
    },

    /* Timeline */
    timeline: {
        animationDuration: 600,
        startOnScroll: true,
        threshold: 0.2,
        staggerDelay: 150
    },

    /* Animations */
    animations: {
        revealDuration: 600,
        sectionFadeDuration: 800
    }
};

/* ============================================================
   2. ÉTAT IMPACT
   ============================================================ */
const ImpactState = {
    initialized: false,
    countersAnimated: false,
    barsAnimated: false,
    timelineAnimated: false
};

/* ============================================================
   3. CLASSE PRINCIPALE IMPACT
   ============================================================ */
class ImpactPage {
    constructor() {
        /* Références DOM */
        this.counters = [];
        this.chartBars = [];
        this.timelineItems = [];
        this.chartDoughnut = null;

        this.init();
    }

    /* ========== INITIALISATION ========== */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        document.addEventListener('layout-ready', () => {
            if (!ImpactState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        /* Récupérer les éléments DOM */
        this.cacheElements();

        /* Vérifier que les éléments essentiels existent */
        if (this.counters.length === 0 && this.chartBars.length === 0) {
            console.warn('⚠️ Page Impact introuvable');
            return;
        }

        ImpactState.initialized = true;

        /* Initialiser les modules */
        this.initCounters();
        this.initChartBars();
        this.initTimeline();
        this.initDoughnutAnimation();

        console.log('✅ Page Impact initialisée');
        console.log('   - Compteurs : ' + this.counters.length);
        console.log('   - Barres : ' + this.chartBars.length);
        console.log('   - Timeline : ' + this.timelineItems.length);
    }

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.counters = Array.from(document.querySelectorAll('.counter'));
        this.chartBars = Array.from(document.querySelectorAll('.chart-bar-fill'));
        this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        this.chartDoughnut = document.querySelector('.chart-doughnut');
    }

    /* ============================================================
       4. COMPTEURS ANIMÉS
       ============================================================ */
    initCounters() {
        if (this.counters.length === 0) return;

        /* Vérifier si l'utilisateur préfère réduire les animations */
        if (ImpactConfig.counters.respectReducedMotion &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            /* Afficher directement les valeurs finales */
            this.counters.forEach((counter) => {
                const target = parseInt(counter.getAttribute('data-target'));
                counter.textContent = target.toLocaleString('fr-FR');
            });
            ImpactState.countersAnimated = true;
            console.log('✅ Compteurs affichés (mouvement réduit)');
            return;
        }

        if (ImpactConfig.counters.startOnScroll) {
            this.initCounterObserver();
        } else {
            this.animateAllCounters();
        }

        console.log('✅ Compteurs initialisés');
    }

    initCounterObserver() {
        const countersSection = document.querySelector('.impact-counters-section');
        if (!countersSection) {
            this.animateAllCounters();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !ImpactState.countersAnimated) {
                    this.animateAllCounters();
                    ImpactState.countersAnimated = true;
                    observer.disconnect();
                }
            });
        }, {
            threshold: ImpactConfig.counters.threshold
        });

        observer.observe(countersSection);
    }

    animateAllCounters() {
        this.counters.forEach((counter, index) => {
            const delay = index * 100;
            setTimeout(() => {
                this.animateCounter(counter);
            }, delay);
        });
    }

    animateCounter(counterElement) {
        const target = parseInt(counterElement.getAttribute('data-target'));
        const duration = parseInt(counterElement.getAttribute('data-duration')) || 
            ImpactConfig.counters.duration;
        const startTime = performance.now();
        const startValue = 0;

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);
            const currentValue = Math.round(startValue + (target - startValue) * easedProgress);

            counterElement.textContent = currentValue.toLocaleString('fr-FR');

            if (progress === 1) {
                /* Animation de fin */
                counterElement.classList.add('animated');
                setTimeout(() => {
                    counterElement.classList.remove('animated');
                }, 300);
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    /* ============================================================
       5. BARRES DE GRAPHIQUE ANIMÉES
       ============================================================ */
    initChartBars() {
        if (this.chartBars.length === 0) return;

        /* Réinitialiser les largeurs à 0 pour l'animation */
        this.chartBars.forEach((bar) => {
            const targetWidth = bar.getAttribute('data-width') || bar.style.width;
            bar.setAttribute('data-width', targetWidth);
            bar.style.width = '0';
        });

        if (ImpactConfig.bars.startOnScroll) {
            this.initBarsObserver();
        } else {
            this.animateAllBars();
        }

        console.log('✅ Barres de graphique initialisées');
    }

    initBarsObserver() {
        const chartsSection = document.querySelector('.impact-charts-section');
        if (!chartsSection) {
            this.animateAllBars();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !ImpactState.barsAnimated) {
                    this.animateAllBars();
                    ImpactState.barsAnimated = true;
                    observer.disconnect();
                }
            });
        }, {
            threshold: ImpactConfig.bars.threshold
        });

        observer.observe(chartsSection);
    }

    animateAllBars() {
        this.chartBars.forEach((bar, index) => {
            const delay = index * ImpactConfig.bars.staggerDelay;
            
            setTimeout(() => {
                const targetWidth = bar.getAttribute('data-width') || '50%';
                bar.style.transition = `width ${ImpactConfig.bars.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                bar.style.width = targetWidth;
            }, delay);
        });
    }

    /* ============================================================
       6. TIMELINE ANIMÉE
       ============================================================ */
    initTimeline() {
        if (this.timelineItems.length === 0) return;

        /* Initialiser l'état des items */
        this.timelineItems.forEach((item) => {
            item.classList.add('timeline-item-animate');
        });

        if (ImpactConfig.timeline.startOnScroll) {
            this.initTimelineObserver();
        } else {
            this.revealAllTimelineItems();
        }

        console.log('✅ Timeline initialisée');
    }

    initTimelineObserver() {
        const timelineSection = document.querySelector('.impact-timeline-section');
        if (!timelineSection) {
            this.revealAllTimelineItems();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const index = this.timelineItems.indexOf(item);
                    const delay = index * ImpactConfig.timeline.staggerDelay;

                    setTimeout(() => {
                        item.classList.add('revealed');
                    }, delay);

                    observer.unobserve(item);
                }
            });
        }, {
            threshold: ImpactConfig.timeline.threshold
        });

        this.timelineItems.forEach((item) => {
            observer.observe(item);
        });

        ImpactState.timelineAnimated = true;
    }

    revealAllTimelineItems() {
        this.timelineItems.forEach((item, index) => {
            const delay = index * ImpactConfig.timeline.staggerDelay;
            setTimeout(() => {
                item.classList.add('revealed');
            }, delay);
        });
    }

    /* ============================================================
       7. ANIMATION DOUGHNUT
       ============================================================ */
    initDoughnutAnimation() {
        if (!this.chartDoughnut) return;

        /* Observer pour animer le doughnut */
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.chartDoughnut.classList.add('doughnut-animated');
                    observer.disconnect();
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(this.chartDoughnut);
    }

    /* ============================================================
       8. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...ImpactState };
    }

    refresh() {
        /* Réinitialiser et relancer les animations */
        ImpactState.countersAnimated = false;
        ImpactState.barsAnimated = false;
        ImpactState.timelineAnimated = false;

        this.animateAllCounters();
        this.animateAllBars();
        this.revealAllTimelineItems();
    }

    destroy() {
        ImpactState.initialized = false;
        console.log('🗑️ Page Impact détruite');
    }
}

/* ============================================================
   9. EXPORTATION GLOBALE
   ============================================================ */
window.ImpactPage = ImpactPage;
window.ImpactConfig = ImpactConfig;
window.ImpactState = ImpactState;

/* ============================================================
   10. DÉMARRAGE
   ============================================================ */
let impactPageInstance = null;

function initImpactPage() {
    if (!impactPageInstance) {
        impactPageInstance = new ImpactPage();
    }
    return impactPageInstance;
}

/* Initialiser au chargement */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initImpactPage();
    });
} else {
    initImpactPage();
}

/* Réinitialiser quand le layout est prêt */
document.addEventListener('layout-ready', () => {
    if (!ImpactState.initialized) {
        initImpactPage();
    }
});

/* ============================================================
   FIN DU FICHIER IMPACT.JS
   ============================================================ */