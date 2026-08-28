/* ============================================================
   HOPE CHILD-DRC — ACTUALITES.JS
   Scripts Spécifiques de la Page Actualités
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la page Actualités,
                 filtres par catégorie, recherche en temps réel,
                 pagination, animations, newsletter
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION ACTUALITÉS
   ============================================================ */
const ActualitesConfig = {
    /* Filtres */
    filters: {
        defaultCategory: 'tous',
        animationDuration: 300,
        storageKey: 'hc_drc_actualites_filter'
    },

    /* Recherche */
    search: {
        minLength: 2,
        debounceDelay: 300,
        placeholder: 'Rechercher un article...',
        highlightMatches: true,
        searchInTitle: true,
        searchInExcerpt: true,
        searchInAuthor: true
    },

    /* Pagination */
    pagination: {
        itemsPerPage: 6,
        maxButtons: 5,
        showFirstLast: true,
        showPrevNext: true,
        scrollToTop: true,
        scrollOffset: 150
    },

    /* Animations */
    animations: {
        staggerDelay: 100,
        revealDuration: 400,
        filterFadeDuration: 300
    },

    /* Newsletter */
    newsletter: {
        storageKey: 'hc_drc_newsletter',
        successDuration: 5000,
        errorDuration: 5000
    }
};

/* ============================================================
   2. ÉTAT ACTUALITÉS
   ============================================================ */
const ActualitesState = {
    currentFilter: 'tous',
    currentSearch: '',
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    filteredArticles: [],
    initialized: false,
    isFiltering: false,
    isSearching: false
};

/* ============================================================
   3. CLASSE PRINCIPALE ACTUALITÉS
   ============================================================ */
class ActualitesPage {
    constructor() {
        /* Références DOM */
        this.filterBar = null;
        this.filterButtons = [];
        this.searchInput = null;
        this.searchClearBtn = null;
        this.articlesGrid = null;
        this.articleCards = [];
        this.noResults = null;
        this.resetFiltersBtn = null;
        this.pagination = null;
        this.paginationButtons = [];
        this.newsletterForm = null;

        /* Timer de recherche */
        this.searchDebounceTimer = null;

        this.init();
    }

    /* ========== INITIALISATION ========== */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        /* Réessayer quand le layout est prêt */
        document.addEventListener('layout-ready', () => {
            if (!ActualitesState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        /* Récupérer les éléments DOM */
        this.cacheElements();

        /* Vérifier que les éléments essentiels existent */
        if (!this.articlesGrid || this.articleCards.length === 0) {
            console.warn('⚠️ Grille d\'articles introuvable');
            return;
        }

        ActualitesState.initialized = true;
        ActualitesState.totalArticles = this.articleCards.length;
        ActualitesState.filteredArticles = [...this.articleCards];

        /* Initialiser les modules */
        this.restoreState();
        this.initFilters();
        this.initSearch();
        this.initPagination();
        this.initNewsletter();
        this.initCardAnimations();
        this.applyFilters();

        console.log('✅ Page Actualités initialisée');
        console.log('   - Articles : ' + ActualitesState.totalArticles);
        console.log('   - Filtres : ' + this.filterButtons.length);
    }

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.filterBar = document.getElementById('actualites-filter-bar');
        this.filterButtons = Array.from(document.querySelectorAll('.actualites-filter-bar .filter-btn'));
        this.searchInput = document.getElementById('actualites-search-input');
        this.searchClearBtn = document.getElementById('search-clear-btn');
        this.articlesGrid = document.getElementById('actualites-grid');
        this.articleCards = Array.from(document.querySelectorAll('.actualite-card'));
        this.noResults = document.getElementById('actualites-no-results');
        this.resetFiltersBtn = document.getElementById('reset-filters-btn');
        this.pagination = document.getElementById('actualites-pagination');
        this.paginationButtons = Array.from(document.querySelectorAll('#actualites-pagination .pagination-btn'));
        this.newsletterForm = document.getElementById('newsletter-form');
    }

    /* ============================================================
       4. RESTAURATION DE L'ÉTAT (localStorage)
       ============================================================ */
    restoreState() {
        /* Restaurer le filtre */
        const savedFilter = localStorage.getItem(ActualitesConfig.filters.storageKey);
        if (savedFilter && this.isValidFilter(savedFilter)) {
            ActualitesState.currentFilter = savedFilter;
        }

        /* Restaurer la recherche */
        const savedSearch = localStorage.getItem('hc_drc_actualites_search');
        if (savedSearch) {
            ActualitesState.currentSearch = savedSearch;
            if (this.searchInput) {
                this.searchInput.value = savedSearch;
                this.toggleClearButton();
            }
        }

        /* Restaurer la page */
        const savedPage = parseInt(localStorage.getItem('hc_drc_actualites_page'));
        if (savedPage && savedPage > 0) {
            ActualitesState.currentPage = savedPage;
        }
    }

    isValidFilter(filter) {
        const validFilters = ['tous', 'projets', 'terrain', 'institutionnel', 'publications'];
        return validFilters.includes(filter);
    }

    /* ============================================================
       5. FILTRES PAR CATÉGORIE
       ============================================================ */
    initFilters() {
        if (!this.filterBar || this.filterButtons.length === 0) return;

        this.filterButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const filter = button.getAttribute('data-filter');
                if (!filter) return;

                this.setFilter(filter);
            });
        });

        /* Bouton réinitialiser */
        if (this.resetFiltersBtn) {
            this.resetFiltersBtn.addEventListener('click', () => {
                this.resetAllFilters();
            });
        }

        console.log('✅ Filtres initialisés');
    }

    setFilter(filter) {
        if (ActualitesState.isFiltering) return;
        if (filter === ActualitesState.currentFilter) return;

        ActualitesState.isFiltering = true;
        ActualitesState.currentFilter = filter;
        ActualitesState.currentPage = 1;

        /* Sauvegarder le filtre */
        localStorage.setItem(ActualitesConfig.filters.storageKey, filter);

        /* Mettre à jour l'UI des boutons */
        this.updateFilterButtonsUI();

        /* Appliquer les filtres avec animation */
        this.applyFilters(() => {
            ActualitesState.isFiltering = false;
        });

        console.log('🔍 Filtre sélectionné : ' + filter);
    }

    updateFilterButtonsUI() {
        this.filterButtons.forEach((button) => {
            const buttonFilter = button.getAttribute('data-filter');
            const isActive = buttonFilter === ActualitesState.currentFilter;

            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    resetAllFilters() {
        /* Réinitialiser le filtre */
        ActualitesState.currentFilter = 'tous';
        localStorage.removeItem(ActualitesConfig.filters.storageKey);
        this.updateFilterButtonsUI();

        /* Réinitialiser la recherche */
        ActualitesState.currentSearch = '';
        localStorage.removeItem('hc_drc_actualites_search');
        if (this.searchInput) {
            this.searchInput.value = '';
            this.toggleClearButton();
        }

        /* Réinitialiser la page */
        ActualitesState.currentPage = 1;
        localStorage.removeItem('hc_drc_actualites_page');

        /* Appliquer */
        this.applyFilters();

        console.log('🔄 Filtres réinitialisés');
    }

    /* ============================================================
       6. RECHERCHE EN TEMPS RÉEL
       ============================================================ */
    initSearch() {
        if (!this.searchInput) return;

        /* Événement input avec debounce */
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounceTimer);

            const query = e.target.value.trim();

            this.searchDebounceTimer = setTimeout(() => {
                this.setSearch(query);
            }, ActualitesConfig.search.debounceDelay);

            /* Afficher/masquer le bouton effacer */
            this.toggleClearButton();
        });

        /* Événement touche Échap pour effacer */
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.clearSearch();
            }
        });

        /* Bouton effacer */
        if (this.searchClearBtn) {
            this.searchClearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        console.log('✅ Recherche initialisée');
    }

    setSearch(query) {
        ActualitesState.currentSearch = query.toLowerCase();
        ActualitesState.currentPage = 1;

        /* Sauvegarder la recherche */
        if (query) {
            localStorage.setItem('hc_drc_actualites_search', query);
        } else {
            localStorage.removeItem('hc_drc_actualites_search');
        }

        /* Appliquer les filtres */
        this.applyFilters();

        console.log('🔎 Recherche : "' + query + '"');
    }

    clearSearch() {
        if (!this.searchInput) return;

        this.searchInput.value = '';
        ActualitesState.currentSearch = '';
        localStorage.removeItem('hc_drc_actualites_search');
        this.toggleClearButton();

        /* Focus sur l'input */
        this.searchInput.focus();

        /* Appliquer */
        this.applyFilters();

        console.log('🗑️ Recherche effacée');
    }

    toggleClearButton() {
        if (!this.searchClearBtn) return;

        if (this.searchInput && this.searchInput.value.length > 0) {
            this.searchClearBtn.style.display = 'flex';
        } else {
            this.searchClearBtn.style.display = 'none';
        }
    }

    /* ============================================================
       7. FILTRAGE ET RECHERCHE COMBINÉS
       ============================================================ */
    applyFilters(callback) {
        if (!this.articlesGrid || this.articleCards.length === 0) return;

        /* Filtrer les articles */
        let filtered = this.articleCards.filter((card) => {
            /* Filtre par catégorie */
            const category = card.getAttribute('data-category');
            const categoryMatch = ActualitesState.currentFilter === 'tous' || 
                                  category === ActualitesState.currentFilter;

            if (!categoryMatch) return false;

            /* Filtre par recherche */
            if (ActualitesState.currentSearch) {
                const searchMatch = this.matchesSearch(card, ActualitesState.currentSearch);
                if (!searchMatch) return false;
            }

            return true;
        });

        ActualitesState.filteredArticles = filtered;
        ActualitesState.totalArticles = filtered.length;
        ActualitesState.totalPages = Math.max(1, Math.ceil(filtered.length / ActualitesConfig.pagination.itemsPerPage));

        /* Ajuster la page actuelle */
        if (ActualitesState.currentPage > ActualitesState.totalPages) {
            ActualitesState.currentPage = ActualitesState.totalPages;
        }

        /* Afficher/masquer les cartes avec animation */
        this.renderArticles();

        /* Mettre à jour la pagination */
        this.updatePagination();

        /* Afficher/masquer le message aucun résultat */
        this.toggleNoResults();

        /* Scroll vers le haut de la grille */
        if (ActualitesConfig.pagination.scrollToTop) {
            this.scrollToArticlesTop();
        }

        if (callback) callback();
    }

    matchesSearch(card, query) {
        if (!query || query.length < ActualitesConfig.search.minLength) return true;

        /* Titre */
        const title = card.querySelector('.actualite-title');
        const titleText = title ? title.textContent.toLowerCase() : '';
        const dataTitle = card.getAttribute('data-title') || '';

        /* Extrait */
        const excerpt = card.querySelector('.actualite-excerpt');
        const excerptText = excerpt ? excerpt.textContent.toLowerCase() : '';

        /* Auteur */
        const author = card.querySelector('.actualite-author');
        const authorText = author ? author.textContent.toLowerCase() : '';

        /* Vérifier les correspondances */
        if (ActualitesConfig.search.searchInTitle) {
            if (titleText.includes(query) || dataTitle.includes(query)) return true;
        }

        if (ActualitesConfig.search.searchInExcerpt) {
            if (excerptText.includes(query)) return true;
        }

        if (ActualitesConfig.search.searchInAuthor) {
            if (authorText.includes(query)) return true;
        }

        return false;
    }

    /* ============================================================
       8. RENDU DES ARTICLES
       ============================================================ */
    renderArticles() {
        const itemsPerPage = ActualitesConfig.pagination.itemsPerPage;
        const startIndex = (ActualitesState.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, ActualitesState.filteredArticles.length);

        /* Masquer tous les articles d'abord */
        this.articleCards.forEach((card) => {
            card.style.display = 'none';
            card.classList.remove('visible');
        });

        /* Afficher uniquement les articles de la page actuelle */
        const articlesToShow = ActualitesState.filteredArticles.slice(startIndex, endIndex);

        articlesToShow.forEach((card, index) => {
            card.style.display = 'flex';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `all ${ActualitesConfig.animations.filterFadeDuration}ms ease`;

            /* Délai en cascade */
            const delay = index * ActualitesConfig.animations.staggerDelay;

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.classList.add('visible');
            }, delay);
        });

        console.log('   - Affichage de ' + articlesToShow.length + ' article(s)');
    }

    /* ============================================================
       9. PAGINATION
       ============================================================ */
    initPagination() {
        if (!this.pagination) return;

        this.paginationButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const pageAttr = button.getAttribute('data-page');

                if (pageAttr === 'prev') {
                    this.goToPage(ActualitesState.currentPage - 1);
                } else if (pageAttr === 'next') {
                    this.goToPage(ActualitesState.currentPage + 1);
                } else {
                    const page = parseInt(pageAttr);
                    if (!isNaN(page)) {
                        this.goToPage(page);
                    }
                }
            });
        });

        console.log('✅ Pagination initialisée');
    }

    goToPage(page) {
        if (page < 1 || page > ActualitesState.totalPages) return;
        if (page === ActualitesState.currentPage) return;

        ActualitesState.currentPage = page;

        /* Sauvegarder la page */
        localStorage.setItem('hc_drc_actualites_page', page);

        /* Mettre à jour l'UI */
        this.updatePaginationUI();
        this.renderArticles();

        /* Scroll vers le haut */
        if (ActualitesConfig.pagination.scrollToTop) {
            this.scrollToArticlesTop();
        }

        console.log('📄 Page : ' + page + ' / ' + ActualitesState.totalPages);
    }

    updatePagination() {
        this.updatePaginationUI();
    }

    updatePaginationUI() {
        if (!this.pagination) return;

        const currentPage = ActualitesState.currentPage;
        const totalPages = ActualitesState.totalPages;

        this.paginationButtons.forEach((button) => {
            const pageAttr = button.getAttribute('data-page');
            let isActive = false;

            if (pageAttr === 'prev') {
                button.disabled = currentPage <= 1;
            } else if (pageAttr === 'next') {
                button.disabled = currentPage >= totalPages;
            } else {
                const page = parseInt(pageAttr);
                isActive = page === currentPage;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-current', isActive ? 'page' : 'false');
                button.setAttribute('aria-label', 'Page ' + page);
            }
        });
    }

    /* ============================================================
       10. MESSAGE AUCUN RÉSULTAT
       ============================================================ */
    toggleNoResults() {
        if (!this.noResults) return;

        if (ActualitesState.filteredArticles.length === 0) {
            this.noResults.style.display = 'block';
        } else {
            this.noResults.style.display = 'none';
        }
    }

    /* ============================================================
       11. SCROLL VERS LE HAUT DE LA GRILLE
       ============================================================ */
    scrollToArticlesTop() {
        if (!this.articlesGrid) return;

        const gridPosition = this.articlesGrid.getBoundingClientRect().top + window.pageYOffset;
        const scrollOffset = ActualitesConfig.pagination.scrollOffset;
        const navbarHeight = 80;

        window.scrollTo({
            top: gridPosition - navbarHeight - scrollOffset,
            behavior: 'smooth'
        });
    }

    /* ============================================================
       12. ANIMATIONS DES CARTES AU SURVOL
       ============================================================ */
    initCardAnimations() {
        this.articleCards.forEach((card) => {
            /* Effet de survol */
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(8, 38, 75, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 8px rgba(8, 38, 75, 0.08)';
            });

            /* Navigation vers l'article */
            card.addEventListener('click', (e) => {
                /* Ne pas naviguer si on clique sur un lien */
                if (e.target.closest('a')) return;

                const link = card.querySelector('.actualite-link');
                if (link) {
                    window.location.href = link.getAttribute('href');
                }
            });
        });

        console.log('✅ Animations des cartes initialisées');
    }

    /* ============================================================
       13. NEWSLETTER
       ============================================================ */
    initNewsletter() {
        if (!this.newsletterForm) return;

        this.newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = this.newsletterForm.querySelector('input[type="email"]');
            if (!emailInput) return;

            const email = emailInput.value.trim();

            if (!this.validateEmail(email)) {
                this.showNewsletterMessage('⚠️ Veuillez entrer un email valide', 'error');
                return;
            }

            this.subscribeNewsletter(email);
        });

        console.log('✅ Newsletter initialisée');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    subscribeNewsletter(email) {
        /* Vérifier si déjà inscrit */
        const existing = localStorage.getItem(ActualitesConfig.newsletter.storageKey);

        if (existing) {
            const data = JSON.parse(existing);
            if (data.email === email) {
                this.showNewsletterMessage('✅ Vous êtes déjà inscrit !', 'success');
                return;
            }
        }

        const submitBtn = this.newsletterForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
        }

        /* Simuler une requête */
        setTimeout(() => {
            localStorage.setItem(ActualitesConfig.newsletter.storageKey, JSON.stringify({
                email: email,
                date: new Date().toISOString()
            }));

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Inscrit !';
            }

            this.showNewsletterMessage('🎉 Merci pour votre inscription !', 'success');
            this.newsletterForm.reset();

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalHtml;
                }
            }, 3000);

        }, 1500);
    }

    showNewsletterMessage(message, type) {
        const existing = this.newsletterForm.querySelector('.newsletter-message');
        if (existing) existing.remove();

        const messageEl = document.createElement('div');
        messageEl.className = 'newsletter-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            animation: fadeIn 0.3s ease;
            text-align: center;
            ${type === 'success' ? 'background: rgba(40, 167, 69, 0.15); color: #28A745; border-left: 3px solid #28A745;' : ''}
            ${type === 'error' ? 'background: rgba(220, 53, 69, 0.15); color: #DC3545; border-left: 3px solid #DC3545;' : ''}
        `;

        this.newsletterForm.appendChild(messageEl);

        const duration = type === 'success' ?
            ActualitesConfig.newsletter.successDuration :
            ActualitesConfig.newsletter.errorDuration;

        setTimeout(() => {
            messageEl.remove();
        }, duration);
    }

    /* ============================================================
       14. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...ActualitesState };
    }

    refresh() {
        this.applyFilters();
    }

    destroy() {
        /* Nettoyer les timers */
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }

        ActualitesState.initialized = false;
        console.log('🗑️ Page Actualités détruite');
    }
}

/* ============================================================
   15. EXPORTATION GLOBALE
   ============================================================ */
window.ActualitesPage = ActualitesPage;
window.ActualitesConfig = ActualitesConfig;
window.ActualitesState = ActualitesState;

/* ============================================================
   16. DÉMARRAGE
   ============================================================ */
let actualitesPageInstance = null;

function initActualitesPage() {
    if (!actualitesPageInstance) {
        actualitesPageInstance = new ActualitesPage();
    }
    return actualitesPageInstance;
}

/* Initialiser au chargement */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initActualitesPage();
    });
} else {
    initActualitesPage();
}

/* Réinitialiser quand le layout est prêt */
document.addEventListener('layout-ready', () => {
    if (!ActualitesState.initialized) {
        initActualitesPage();
    }
});

/* ============================================================
   FIN DU FICHIER ACTUALITES.JS
   ============================================================ */