/* ============================================================
   HOPE CHILD-DRC — PROJETS.JS
   Scripts Spécifiques de la Page Nos Projets
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion des filtres de projets,
                 pagination, animations des cartes,
                 interactions et scroll reveal
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION PROJETS
   ============================================================ */
const ProjetsConfig = {
    /* Filtres */
    filters: {
        defaultCategory: 'all',
        animationDuration: 350,
        staggerDelay: 100
    },

    /* Pagination */
    pagination: {
        itemsPerPage: 6,
        maxButtons: 5,
        showFirstLast: true,
        firstLabel: '«',
        lastLabel: '»'
    },

    /* Animations */
    animations: {
        staggerDelay: 150,
        revealDuration: 700,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    }
};

/* ============================================================
   2. ÉTAT PROJETS
   ============================================================ */
const ProjetsState = {
    initialized: false,
    currentFilter: 'all',
    currentPage: 1,
    totalPages: 1,
    isFiltering: false,
    totalCards: 0,
    visibleCards: 0,
    animationsInitialized: false
};

/* ============================================================
   3. CLASSE PRINCIPALE PROJETS
   ============================================================ */
class ProjetsPage {
    constructor() {
        this.filterButtons = [];
        this.projectCards = [];
        this.filterBar = null;
        this.grid = null;
        this.noResults = null;
        this.pagination = null;
        this.paginationButtons = [];
        
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
            if (!ProjetsState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.filterBar = document.getElementById('projects-filter-bar');
        this.filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        this.projectCards = Array.from(document.querySelectorAll('.project-card'));
        this.grid = document.getElementById('projects-grid');
        this.noResults = document.getElementById('projects-no-results');
        this.pagination = document.getElementById('projects-pagination');
        this.paginationButtons = Array.from(document.querySelectorAll('.pagination-btn'));
        
        ProjetsState.totalCards = this.projectCards.length;
        ProjetsState.visibleCards = this.projectCards.length;
        ProjetsState.totalPages = Math.ceil(this.projectCards.length / ProjetsConfig.pagination.itemsPerPage);
        
        // Initialiser les modules
        this.initFilters();
        this.initPagination();
        this.initScrollReveal();
        this.initCardAnimations();
        this.initSmoothScroll();
        
        ProjetsState.initialized = true;
        ProjetsState.animationsInitialized = true;
        
        console.log('✅ Page Nos Projets initialisée');
        console.log('📊 ' + ProjetsState.totalCards + ' projets chargés');
        console.log('📄 ' + ProjetsState.totalPages + ' page(s) de résultats');
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
        
        console.log('✅ Filtres initialisés');
    }

    /**
     * Applique un filtre aux cartes de projets
     * @param {string} filter - Statut à filtrer ('all', 'en-cours', 'termine', 'a-venir')
     */
    applyFilter(filter) {
        if (ProjetsState.isFiltering) return;
        
        ProjetsState.isFiltering = true;
        ProjetsState.currentFilter = filter;
        ProjetsState.currentPage = 1;
        
        // Mettre à jour les boutons
        this.updateFilterButtons(filter);
        
        let visibleCount = 0;
        
        this.projectCards.forEach((card, index) => {
            const status = card.getAttribute('data-status');
            
            if (filter === 'all' || status === filter) {
                this.showCard(card, index);
                visibleCount++;
            } else {
                this.hideCard(card);
            }
        });
        
        ProjetsState.visibleCards = visibleCount;
        
        // Mettre à jour la pagination
        this.updatePagination(visibleCount);
        
        // Afficher ou masquer le message "aucun résultat"
        setTimeout(() => {
            if (visibleCount === 0) {
                this.showNoResults();
            } else {
                this.hideNoResults();
            }
            
            ProjetsState.isFiltering = false;
        }, ProjetsConfig.filters.animationDuration + 100);
        
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
        }, index * ProjetsConfig.filters.staggerDelay);
    }

    hideCard(card) {
        card.classList.remove('filtering-in');
        card.classList.add('filtering-out');
        
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            card.style.display = 'none';
        }, ProjetsConfig.filters.animationDuration);
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

    showNoResults() {
        if (!this.noResults) return;
        
        this.noResults.style.display = '';
        this.noResults.classList.add('show');
        
        // Masquer la pagination
        if (this.pagination) {
            this.pagination.style.display = 'none';
        }
    }

    hideNoResults() {
        if (!this.noResults) return;
        
        this.noResults.classList.remove('show');
        setTimeout(() => {
            this.noResults.style.display = 'none';
        }, 300);
        
        // Afficher la pagination
        if (this.pagination) {
            this.pagination.style.display = '';
        }
    }

    /* ============================================================
       5. PAGINATION
       ============================================================ */
    initPagination() {
        if (this.paginationButtons.length === 0) return;
        
        this.paginationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.getAttribute('data-page'));
                this.goToPage(page);
            });
        });
        
        this.updatePagination(ProjetsState.totalCards);
        
        console.log('✅ Pagination initialisée');
    }

    /**
     * Met à jour l'état de la pagination
     * @param {number} totalItems - Nombre total d'éléments visibles
     */
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / ProjetsConfig.pagination.itemsPerPage);
        ProjetsState.totalPages = totalPages;
        
        // Afficher/masquer les boutons selon le nombre de pages
        this.paginationButtons.forEach(button => {
            const page = parseInt(button.getAttribute('data-page'));
            
            if (page <= totalPages) {
                button.style.display = '';
            } else {
                button.style.display = 'none';
            }
            
            // Marquer la page active
            if (page === ProjetsState.currentPage) {
                button.classList.add('active');
                button.setAttribute('aria-current', 'page');
            } else {
                button.classList.remove('active');
                button.removeAttribute('aria-current');
            }
        });
        
        console.log('📄 Pagination : page ' + ProjetsState.currentPage + '/' + totalPages);
    }

    /**
     * Navigue vers une page spécifique
     * @param {number} page - Numéro de page
     */
    goToPage(page) {
        if (page < 1 || page > ProjetsState.totalPages) return;
        
        ProjetsState.currentPage = page;
        
        // Mettre à jour les boutons
        this.paginationButtons.forEach(button => {
            const buttonPage = parseInt(button.getAttribute('data-page'));
            
            if (buttonPage === page) {
                button.classList.add('active');
                button.setAttribute('aria-current', 'page');
            } else {
                button.classList.remove('active');
                button.removeAttribute('aria-current');
            }
        });
        
        // Faire défiler vers le haut de la grille
        const gridTop = this.grid?.getBoundingClientRect().top + window.pageYOffset - 100;
        
        window.scrollTo({
            top: gridTop || 0,
            behavior: 'smooth'
        });
        
        console.log('📄 Navigation vers la page ' + page);
    }

    /* ============================================================
       6. SCROLL REVEAL GÉNÉRAL
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
            threshold: ProjetsConfig.animations.threshold,
            rootMargin: ProjetsConfig.animations.rootMargin
        });
        
        elements.forEach(element => {
            const animation = element.getAttribute('data-aos');
            
            element.style.transition = `all ${ProjetsConfig.animations.revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '0';
            
            switch (animation) {
                case 'fade-up':
                    element.style.transform = 'translateY(40px)';
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
       7. ANIMATIONS DES CARTES
       ============================================================ */
    initCardAnimations() {
        if (this.projectCards.length === 0) return;
        
        this.projectCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * ProjetsConfig.animations.staggerDelay);
                        
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
       10. COMPTEUR DE PROJETS
       ============================================================ */
    countProjectsByStatus() {
        const counts = {
            all: this.projectCards.length,
            'en-cours': 0,
            'termine': 0,
            'a-venir': 0
        };
        
        this.projectCards.forEach(card => {
            const status = card.getAttribute('data-status');
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });
        
        console.log('📊 Projets par statut :');
        console.log('   - En cours : ' + counts['en-cours']);
        console.log('   - Terminés : ' + counts['termine']);
        console.log('   - À venir : ' + counts['a-venir']);
        
        return counts;
    }

    /* ============================================================
       11. MÉTHODES PUBLIQUES
       ============================================================ */
    getCurrentFilter() {
        return ProjetsState.currentFilter;
    }

    getCurrentPage() {
        return ProjetsState.currentPage;
    }

    resetFilters() {
        this.applyFilter('all');
    }

    reinitialize() {
        this.setup();
    }

    destroy() {
        ProjetsState.initialized = false;
        ProjetsState.animationsInitialized = false;
        console.log('🗑️ Page Projets détruite');
    }
}

/* ============================================================
   12. DÉMARRAGE
   ============================================================ */
let projetsPageInstance = null;

function initProjetsPage() {
    if (!projetsPageInstance) {
        projetsPageInstance = new ProjetsPage();
        projetsPageInstance.animateHeroOnLoad();
        projetsPageInstance.countProjectsByStatus();
    }
    return projetsPageInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initProjetsPage();
    });
} else {
    initProjetsPage();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!ProjetsState.initialized) {
        initProjetsPage();
    }
});

/* ============================================================
   13. EXPORTATION GLOBALE
   ============================================================ */
window.ProjetsPage = ProjetsPage;
window.ProjetsConfig = ProjetsConfig;
window.ProjetsState = ProjetsState;
window.projetsPageInstance = projetsPageInstance;
window.initProjetsPage = initProjetsPage;

/* ============================================================
   FIN DU FICHIER PROJETS.JS
   ============================================================ */