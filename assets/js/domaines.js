/* ============================================================
   HOPE CHILD-DRC — DOMAINES.JS
   Scripts Spécifiques de la Page Domaines d'Intervention
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion des filtres de domaines,
                 animations des cartes, approche intégrée,
                 interactions et scroll reveal
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION DOMAINES
   ============================================================ */
const DomainesConfig = {
    /* Filtres */
    filters: {
        defaultCategory: 'all',
        animationDuration: 350,
        staggerDelay: 100,
        enableKeyboardNavigation: true,
        enableUrlHash: true
    },

    /* Animations */
    animations: {
        staggerDelay: 150,
        revealDuration: 700,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    },

    /* Diagramme d'approche */
    approach: {
        enableHoverEffects: true,
        enablePulse: true
    }
};

/* ============================================================
   2. ÉTAT DOMAINES
   ============================================================ */
const DomainesState = {
    initialized: false,
    currentFilter: 'all',
    isFiltering: false,
    animationsInitialized: false,
    totalCards: 0,
    visibleCards: 0
};

/* ============================================================
   3. CLASSE PRINCIPALE DOMAINES
   ============================================================ */
class DomainesPage {
    constructor() {
        this.filterButtons = [];
        this.domainCards = [];
        this.filterBar = null;
        this.grid = null;
        this.noResults = null;
        this.approachBranches = [];
        
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
            if (!DomainesState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.filterBar = document.getElementById('domains-filter-bar');
        this.filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        this.domainCards = Array.from(document.querySelectorAll('.domain-detail-card'));
        this.grid = document.getElementById('domains-grid');
        this.noResults = document.getElementById('domains-no-results');
        this.approachBranches = Array.from(document.querySelectorAll('.approach-branch'));
        
        DomainesState.totalCards = this.domainCards.length;
        DomainesState.visibleCards = this.domainCards.length;
        
        // Initialiser les modules
        this.initFilters();
        this.initScrollReveal();
        this.initCardAnimations();
        this.initApproachDiagram();
        this.initSmoothScroll();
        this.initHashNavigation();
        
        DomainesState.initialized = true;
        DomainesState.animationsInitialized = true;
        
        console.log('✅ Page Domaines d\'Intervention initialisée');
        console.log('📊 ' + DomainesState.totalCards + ' domaines chargés');
    }

    /* ============================================================
       4. SYSTÈME DE FILTRES
       ============================================================ */
    initFilters() {
        if (this.filterButtons.length === 0) return;
        
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.applyFilter(filter);
            });
        });
        
        // Navigation clavier
        if (DomainesConfig.filters.enableKeyboardNavigation) {
            this.initKeyboardNavigation();
        }
        
        // Restaurer le filtre depuis l'URL si présent
        if (DomainesConfig.filters.enableUrlHash) {
            this.restoreFilterFromHash();
        }
        
        console.log('✅ Filtres initialisés');
    }

    /**
     * Applique un filtre aux cartes de domaines
     * @param {string} filter - Catégorie à filtrer ('all' ou nom du domaine)
     */
    applyFilter(filter) {
        if (DomainesState.isFiltering) return;
        
        DomainesState.isFiltering = true;
        DomainesState.currentFilter = filter;
        
        // Mettre à jour les boutons
        this.updateFilterButtons(filter);
        
        // Mettre à jour l'URL
        if (DomainesConfig.filters.enableUrlHash) {
            this.updateHash(filter);
        }
        
        let visibleCount = 0;
        
        this.domainCards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                // Afficher la carte
                this.showCard(card, index);
                visibleCount++;
            } else {
                // Masquer la carte
                this.hideCard(card, index);
            }
        });
        
        DomainesState.visibleCards = visibleCount;
        
        // Afficher ou masquer le message "aucun résultat"
        setTimeout(() => {
            if (visibleCount === 0) {
                this.showNoResults();
            } else {
                this.hideNoResults();
            }
            
            DomainesState.isFiltering = false;
        }, DomainesConfig.filters.animationDuration + 100);
        
        console.log('🔍 Filtre appliqué : ' + filter + ' (' + visibleCount + ' résultats)');
    }

    showCard(card, index) {
        card.style.display = '';
        
        // Forcer un reflow pour l'animation
        void card.offsetWidth;
        
        card.classList.remove('filtering-out');
        card.classList.add('filtering-in');
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * DomainesConfig.filters.staggerDelay);
    }

    hideCard(card, index) {
        card.classList.remove('filtering-in');
        card.classList.add('filtering-out');
        
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            card.style.display = 'none';
        }, DomainesConfig.filters.animationDuration);
    }

    updateFilterButtons(activeFilter) {
        this.filterButtons.forEach(button => {
            const filter = button.getAttribute('data-filter');
            
            if (filter === activeFilter) {
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        });
    }

    updateHash(filter) {
        if (filter === 'all') {
            history.pushState(null, null, window.location.pathname);
        } else {
            history.pushState(null, null, '#domaine-' + filter);
        }
    }

    restoreFilterFromHash() {
        const hash = window.location.hash;
        
        if (hash && hash.startsWith('#domaine-')) {
            const filter = hash.replace('#domaine-', '');
            
            // Vérifier que le filtre existe
            const validFilters = this.filterButtons.map(btn => btn.getAttribute('data-filter'));
            
            if (validFilters.includes(filter)) {
                setTimeout(() => {
                    this.applyFilter(filter);
                }, 500);
            }
        }
    }

    initKeyboardNavigation() {
        this.filterBar?.addEventListener('keydown', (e) => {
            const buttons = Array.from(this.filterBar.querySelectorAll('.filter-btn'));
            const currentIndex = buttons.indexOf(document.activeElement);
            
            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentIndex < buttons.length - 1) {
                        buttons[currentIndex + 1].focus();
                    } else {
                        buttons[0].focus();
                    }
                    break;
                    
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        buttons[currentIndex - 1].focus();
                    } else {
                        buttons[buttons.length - 1].focus();
                    }
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    buttons[0].focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    buttons[buttons.length - 1].focus();
                    break;
            }
        });
    }

    showNoResults() {
        if (!this.noResults) return;
        
        this.noResults.style.display = '';
        this.noResults.classList.add('show');
    }

    hideNoResults() {
        if (!this.noResults) return;
        
        this.noResults.classList.remove('show');
        setTimeout(() => {
            this.noResults.style.display = 'none';
        }, 300);
    }

    /* ============================================================
       5. SCROLL REVEAL GÉNÉRAL
       ============================================================ */
    initScrollReveal() {
        const elements = document.querySelectorAll('[data-aos]');
        
        if (elements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.getAttribute('data-aos');
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('aos-animate');
                        element.style.opacity = '1';
                        element.style.transform = 'none';
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: DomainesConfig.animations.threshold,
            rootMargin: DomainesConfig.animations.rootMargin
        });
        
        elements.forEach(element => {
            const animation = element.getAttribute('data-aos');
            
            element.style.transition = `all ${DomainesConfig.animations.revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '0';
            
            switch (animation) {
                case 'fade-up':
                    element.style.transform = 'translateY(40px)';
                    break;
                case 'fade-down':
                    element.style.transform = 'translateY(-40px)';
                    break;
                case 'zoom-in':
                    element.style.transform = 'scale(0.85)';
                    break;
                default:
                    element.style.transform = 'translateY(40px)';
            }
            
            observer.observe(element);
        });
        
        console.log('✅ Scroll reveal initialisé');
    }

    /* ============================================================
       6. ANIMATIONS DES CARTES
       ============================================================ */
    initCardAnimations() {
        if (this.domainCards.length === 0) return;
        
        this.domainCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * DomainesConfig.animations.staggerDelay);
                        
                        observer.unobserve(card);
                    }
                });
            }, {
                threshold: 0.15
            });
            
            observer.observe(card);
        });
        
        console.log('✅ Animations des cartes initialisées');
    }

    /* ============================================================
       7. DIAGRAMME D'APPROCHE INTÉGRÉE
       ============================================================ */
    initApproachDiagram() {
        if (this.approachBranches.length === 0) return;
        
        this.approachBranches.forEach((branch, index) => {
            // Animation d'entrée
            branch.style.opacity = '0';
            branch.style.transform = 'translateY(20px)';
            branch.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            branch.style.opacity = '1';
                            branch.style.transform = 'translateY(0)';
                        }, index * 100);
                        
                        observer.unobserve(branch);
                    }
                });
            }, {
                threshold: 0.3
            });
            
            observer.observe(branch);
            
            // Effet de survol
            if (DomainesConfig.approach.enableHoverEffects) {
                branch.addEventListener('mouseenter', () => {
                    branch.style.transform = 'translateY(-5px) scale(1.03)';
                });
                
                branch.addEventListener('mouseleave', () => {
                    branch.style.transform = 'translateY(0) scale(1)';
                });
            }
        });
        
        console.log('✅ Diagramme d\'approche initialisé');
    }

    /* ============================================================
       8. ANIMATION DU HERO AU CHARGEMENT
       ============================================================ */
    animateHeroOnLoad() {
        const title = document.querySelector('.page-hero-title');
        const subtitle = document.querySelector('.page-hero-subtitle');
        const breadcrumb = document.querySelector('.page-hero .breadcrumb');
        
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(30px)';
            title.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 100);
        }
        
        if (subtitle) {
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translateY(20px)';
            subtitle.style.transition = 'all 0.8s ease-out 0.2s';
            
            setTimeout(() => {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 300);
        }
        
        if (breadcrumb) {
            breadcrumb.style.opacity = '0';
            breadcrumb.style.transition = 'all 0.5s ease-out';
            
            setTimeout(() => {
                breadcrumb.style.opacity = '1';
            }, 200);
        }
    }

    /* ============================================================
       9. SMOOTH SCROLL POUR LES ANCRES
       ============================================================ */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                history.pushState(null, null, href);
            });
        });
        
        console.log('✅ Smooth scroll initialisé');
    }

    /* ============================================================
       10. NAVIGATION PAR HASH (Liens directs vers domaines)
       ============================================================ */
    initHashNavigation() {
        // Écouter les changements de hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            
            if (hash && hash.startsWith('#domaine-')) {
                const filter = hash.replace('#domaine-', '');
                this.applyFilter(filter);
            } else if (hash === '' || hash === '#') {
                this.applyFilter('all');
            } else if (hash && !hash.startsWith('#domaine-')) {
                // Hash d'une ancre (ex: #protection)
                const targetCard = document.getElementById(hash.replace('#', ''));
                
                if (targetCard && targetCard.classList.contains('domain-detail-card')) {
                    const category = targetCard.getAttribute('data-category');
                    this.applyFilter(category);
                    
                    // Faire défiler vers la carte
                    setTimeout(() => {
                        const navbar = document.getElementById('navbar');
                        const navbarHeight = navbar ? navbar.offsetHeight : 80;
                        const position = targetCard.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                        
                        window.scrollTo({
                            top: position,
                            behavior: 'smooth'
                        });
                    }, 500);
                }
            }
        });
        
        console.log('✅ Navigation par hash initialisée');
    }

    /* ============================================================
       11. COMPTEUR DE DOMAINES
       ============================================================ */
    countVisibleDomains() {
        const visible = this.domainCards.filter(card => card.style.display !== 'none').length;
        
        console.log('📊 Domaines visibles : ' + visible + '/' + DomainesState.totalCards);
        
        return visible;
    }

    /* ============================================================
       12. MÉTHODES PUBLIQUES
       ============================================================ */
    getCurrentFilter() {
        return DomainesState.currentFilter;
    }

    resetFilters() {
        this.applyFilter('all');
    }

    reinitialize() {
        this.setup();
    }

    destroy() {
        DomainesState.initialized = false;
        DomainesState.animationsInitialized = false;
        console.log('🗑️ Page Domaines détruite');
    }
}

/* ============================================================
   13. DÉMARRAGE
   ============================================================ */
let domainesPageInstance = null;

function initDomainesPage() {
    if (!domainesPageInstance) {
        domainesPageInstance = new DomainesPage();
        domainesPageInstance.animateHeroOnLoad();
    }
    return domainesPageInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initDomainesPage();
    });
} else {
    initDomainesPage();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!DomainesState.initialized) {
        initDomainesPage();
    }
});

/* ============================================================
   14. EXPORTATION GLOBALE
   ============================================================ */
window.DomainesPage = DomainesPage;
window.DomainesConfig = DomainesConfig;
window.DomainesState = DomainesState;
window.domainesPageInstance = domainesPageInstance;
window.initDomainesPage = initDomainesPage;

/* ============================================================
   FIN DU FICHIER DOMAINES.JS
   ============================================================ */