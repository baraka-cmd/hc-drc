/* ============================================================
   HOPE CHILD-DRC — GALERIE.JS (CORRIGÉ)
   Scripts Spécifiques de la Page Galerie Médias
   Version : 2.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion de la galerie avec support
                 vidéos MP4 locales ET vidéos YouTube
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION GALERIE
   ============================================================ */
const GalerieConfig = {
    /* Filtres */
    filters: {
        defaultCategory: 'tous',
        animationDuration: 300,
        storageKey: 'hc_drc_galerie_filter'
    },

    /* Lightbox */
    lightbox: {
        animationDuration: 300,
        closeOnEscape: true,
        closeOnOutsideClick: true,
        keyboardNavigation: true,
        swipeEnabled: true,
        swipeThreshold: 50,
        showCounter: true,
        showCaption: true
    },

    /* Vidéos */
    video: {
        autoplay: true,
        youtubeBaseUrl: 'https://www.youtube.com/embed/'
    },

    /* Animations */
    animations: {
        staggerDelay: 50,
        filterFadeDuration: 250
    }
};

/* ============================================================
   2. ÉTAT GALERIE
   ============================================================ */
const GalerieState = {
    currentFilter: 'tous',
    currentIndex: 0,
    visibleItems: [],
    initialized: false,
    isLightboxOpen: false,
    isFiltering: false,
    touchStartX: 0,
    touchEndX: 0
};

/* ============================================================
   3. CLASSE PRINCIPALE GALERIE
   ============================================================ */
class GaleriePage {
    constructor() {
        /* Références DOM */
        this.filterBar = null;
        this.filterButtons = [];
        this.galerieGrid = null;
        this.galerieItems = [];
        this.noResults = null;
        this.lightbox = null;
        this.lightboxImageContent = null;
        this.lightboxVideoContent = null;
        this.lightboxImage = null;
        this.lightboxCaption = null;
        this.lightboxVideoIframe = null;
        this.lightboxVideoPlayer = null;  /* ✅ AJOUTÉ */
        this.lightboxClose = null;
        this.lightboxPrev = null;
        this.lightboxNext = null;
        this.lightboxCounter = null;
        this.lightboxCurrent = null;
        this.lightboxTotal = null;

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
            if (!GalerieState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.cacheElements();

        if (!this.galerieGrid || this.galerieItems.length === 0) {
            console.warn('⚠️ Grille de galerie introuvable');
            return;
        }

        GalerieState.initialized = true;

        this.restoreFilter();
        this.initFilters();
        this.initLightbox();
        this.initItemClicks();
        this.initKeyboardNavigation();
        this.initSwipeNavigation();
        this.applyFilter(GalerieState.currentFilter, false);

        console.log('✅ Page Galerie initialisée');
        console.log('   - Médias : ' + this.galerieItems.length);
        console.log('   - Filtres : ' + this.filterButtons.length);
    }

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.filterBar = document.getElementById('galerie-filter-bar');
        this.filterButtons = Array.from(document.querySelectorAll('.galerie-filter-bar .filter-btn'));
        this.galerieGrid = document.getElementById('galerie-grid');
        this.galerieItems = Array.from(document.querySelectorAll('.galerie-item'));
        this.noResults = document.getElementById('galerie-no-results');
        
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImageContent = document.getElementById('lightbox-image-content');
        this.lightboxVideoContent = document.getElementById('lightbox-video-content');
        this.lightboxImage = document.getElementById('lightbox-image');
        this.lightboxCaption = document.getElementById('lightbox-caption');
        this.lightboxVideoIframe = document.getElementById('lightbox-video-iframe');
        this.lightboxVideoPlayer = document.getElementById('lightbox-video-player'); /* ✅ AJOUTÉ */
        this.lightboxClose = document.getElementById('lightbox-close');
        this.lightboxPrev = document.getElementById('lightbox-prev');
        this.lightboxNext = document.getElementById('lightbox-next');
        this.lightboxCounter = document.getElementById('lightbox-counter');
        this.lightboxCurrent = document.getElementById('lightbox-current');
        this.lightboxTotal = document.getElementById('lightbox-total');
    }

    /* ========== FILTRES ========== */
    restoreFilter() {
        const savedFilter = localStorage.getItem(GalerieConfig.filters.storageKey);
        if (savedFilter && this.isValidFilter(savedFilter)) {
            GalerieState.currentFilter = savedFilter;
        }
    }

    isValidFilter(filter) {
        return ['tous', 'photos', 'videos', 'rapports', 'infographies'].includes(filter);
    }

    initFilters() {
        if (!this.filterBar || this.filterButtons.length === 0) return;

        this.filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                if (!filter) return;
                this.applyFilter(filter, true);
            });
        });
    }

    applyFilter(filter, animate = true) {
        if (GalerieState.isFiltering) return;

        GalerieState.isFiltering = true;
        GalerieState.currentFilter = filter;
        localStorage.setItem(GalerieConfig.filters.storageKey, filter);
        this.updateFilterButtonsUI();

        let visibleItems = [];

        this.galerieItems.forEach((item) => {
            const category = item.getAttribute('data-category');
            const isVisible = filter === 'tous' || category === filter;

            if (isVisible) {
                visibleItems.push(item);
                item.style.display = '';
                if (animate) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.style.transition = `all ${GalerieConfig.animations.filterFadeDuration}ms ease`;
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    item.style.opacity = '1';
                    item.style.transform = 'none';
                }
            } else {
                item.style.display = 'none';
            }
        });

        GalerieState.visibleItems = visibleItems;
        this.toggleNoResults(visibleItems.length === 0);
        
        if (this.lightboxTotal) {
            this.lightboxTotal.textContent = visibleItems.length;
        }

        setTimeout(() => {
            GalerieState.isFiltering = false;
        }, GalerieConfig.animations.filterFadeDuration + 50);
    }

    updateFilterButtonsUI() {
        this.filterButtons.forEach((button) => {
            const buttonFilter = button.getAttribute('data-filter');
            const isActive = buttonFilter === GalerieState.currentFilter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    toggleNoResults(show) {
        if (!this.noResults) return;
        this.noResults.style.display = show ? 'block' : 'none';
    }

    /* ========== CLICS SUR LES ITEMS ========== */
    initItemClicks() {
        this.galerieItems.forEach((item) => {
            const type = item.getAttribute('data-type');
            if (type === 'rapport') return;

            item.addEventListener('click', () => {
                const visibleIndex = GalerieState.visibleItems.indexOf(item);
                if (visibleIndex >= 0) {
                    this.openLightbox(visibleIndex);
                }
            });
        });
    }

    /* ========== LIGHTBOX ========== */
    initLightbox() {
        if (!this.lightbox) return;

        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        if (this.lightboxPrev) {
            this.lightboxPrev.addEventListener('click', () => this.navigateLightbox(-1));
        }

        if (this.lightboxNext) {
            this.lightboxNext.addEventListener('click', () => this.navigateLightbox(1));
        }

        if (GalerieConfig.lightbox.closeOnOutsideClick) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) this.closeLightbox();
            });
        }

        if (GalerieConfig.lightbox.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && GalerieState.isLightboxOpen) {
                    this.closeLightbox();
                }
            });
        }
    }

    openLightbox(index) {
        if (!this.lightbox || GalerieState.visibleItems.length === 0) return;

        GalerieState.currentIndex = index;
        GalerieState.isLightboxOpen = true;

        const item = GalerieState.visibleItems[index];
        if (!item) return;

        const type = item.getAttribute('data-type');
        const caption = item.getAttribute('data-caption') || '';
        const videoUrl = item.getAttribute('data-video-url');

        if (type === 'video') {
            this.showVideoContent(videoUrl, caption);
        } else {
            this.showImageContent(item, caption);
        }

        this.updateLightboxCounter();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.lightbox.setAttribute('aria-hidden', 'false');
    }

    /* ✅ AFFICHER UNE IMAGE */
    showImageContent(item, caption) {
        /* Masquer toutes les vidéos */
        if (this.lightboxVideoContent) this.lightboxVideoContent.style.display = 'none';
        if (this.lightboxVideoIframe) {
            this.lightboxVideoIframe.src = '';
            this.lightboxVideoIframe.style.display = 'none';
        }
        if (this.lightboxVideoPlayer) {
            this.lightboxVideoPlayer.pause();
            this.lightboxVideoPlayer.src = '';
            this.lightboxVideoPlayer.style.display = 'none';
        }

        /* Afficher l'image */
        if (this.lightboxImageContent) this.lightboxImageContent.style.display = 'block';

        const img = item.querySelector('img');
        const imgSrc = img ? img.getAttribute('src') : '';

        if (this.lightboxImage && imgSrc) {
            this.lightboxImage.src = imgSrc;
            this.lightboxImage.alt = caption;
        }

        if (this.lightboxCaption) this.lightboxCaption.textContent = caption;
    }

    /* ✅ AFFICHER UNE VIDÉO (YouTube OU MP4 locale) */
    showVideoContent(videoUrl, caption) {
        /* Masquer l'image */
        if (this.lightboxImageContent) this.lightboxImageContent.style.display = 'none';

        /* Afficher le conteneur vidéo */
        if (this.lightboxVideoContent) this.lightboxVideoContent.style.display = 'block';

        if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
            /* ✅ VIDÉO YOUTUBE */
            if (this.lightboxVideoIframe) {
                this.lightboxVideoIframe.style.display = 'block';
                this.lightboxVideoIframe.src = videoUrl + (GalerieConfig.video.autoplay ? '?autoplay=1' : '');
            }
            if (this.lightboxVideoPlayer) {
                this.lightboxVideoPlayer.pause();
                this.lightboxVideoPlayer.src = '';
                this.lightboxVideoPlayer.style.display = 'none';
            }
        } else if (videoUrl) {
            /* ✅ VIDÉO MP4 LOCALE */
            if (this.lightboxVideoIframe) {
                this.lightboxVideoIframe.src = '';
                this.lightboxVideoIframe.style.display = 'none';
            }
            if (this.lightboxVideoPlayer) {
                this.lightboxVideoPlayer.style.display = 'block';
                this.lightboxVideoPlayer.src = videoUrl;
                this.lightboxVideoPlayer.setAttribute('controls', '');
                this.lightboxVideoPlayer.setAttribute('playsinline', '');
                
                if (GalerieConfig.video.autoplay) {
                    this.lightboxVideoPlayer.muted = true;
                    this.lightboxVideoPlayer.play().catch(() => {
                        console.log('▶️ Cliquez sur Play pour démarrer');
                    });
                }
            }
        }

        if (this.lightboxCaption) this.lightboxCaption.textContent = caption;
    }

    closeLightbox() {
        if (!this.lightbox || !GalerieState.isLightboxOpen) return;

        this.lightbox.classList.remove('active');
        GalerieState.isLightboxOpen = false;
        document.body.style.overflow = '';

        /* Arrêter toutes les vidéos */
        if (this.lightboxVideoIframe) this.lightboxVideoIframe.src = '';
        if (this.lightboxVideoPlayer) {
            this.lightboxVideoPlayer.pause();
            this.lightboxVideoPlayer.src = '';
        }

        this.lightbox.setAttribute('aria-hidden', 'true');
    }

    navigateLightbox(direction) {
        if (!GalerieState.isLightboxOpen) return;
        if (GalerieState.visibleItems.length === 0) return;

        let newIndex = GalerieState.currentIndex + direction;
        if (newIndex < 0) newIndex = GalerieState.visibleItems.length - 1;
        if (newIndex >= GalerieState.visibleItems.length) newIndex = 0;

        GalerieState.currentIndex = newIndex;

        const item = GalerieState.visibleItems[newIndex];
        if (!item) return;

        const type = item.getAttribute('data-type');
        const caption = item.getAttribute('data-caption') || '';
        const videoUrl = item.getAttribute('data-video-url');

        if (type === 'video') {
            this.showVideoContent(videoUrl, caption);
        } else {
            this.showImageContent(item, caption);
        }

        this.updateLightboxCounter();
    }

    updateLightboxCounter() {
        if (!this.lightboxCurrent || !this.lightboxTotal) return;
        this.lightboxCurrent.textContent = GalerieState.currentIndex + 1;
        this.lightboxTotal.textContent = GalerieState.visibleItems.length;
    }

    /* ========== NAVIGATION CLAVIER ========== */
    initKeyboardNavigation() {
        if (!GalerieConfig.lightbox.keyboardNavigation) return;

        document.addEventListener('keydown', (e) => {
            if (!GalerieState.isLightboxOpen) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateLightbox(1);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeLightbox();
            }
        });
    }

    /* ========== NAVIGATION TACTILE ========== */
    initSwipeNavigation() {
        if (!GalerieConfig.lightbox.swipeEnabled || !this.lightbox) return;

        this.lightbox.addEventListener('touchstart', (e) => {
            GalerieState.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.lightbox.addEventListener('touchend', (e) => {
            GalerieState.touchEndX = e.changedTouches[0].screenX;
            const diff = GalerieState.touchStartX - GalerieState.touchEndX;

            if (Math.abs(diff) > GalerieConfig.lightbox.swipeThreshold) {
                this.navigateLightbox(diff > 0 ? 1 : -1);
            }
        }, { passive: true });
    }

    /* ========== MÉTHODES PUBLIQUES ========== */
    getState() { return { ...GalerieState }; }
    getVisibleItems() { return [...GalerieState.visibleItems]; }
    refresh() { this.applyFilter(GalerieState.currentFilter, false); }

    destroy() {
        GalerieState.initialized = false;
        GalerieState.isLightboxOpen = false;
        document.body.style.overflow = '';

        if (this.lightboxVideoIframe) this.lightboxVideoIframe.src = '';
        if (this.lightboxVideoPlayer) {
            this.lightboxVideoPlayer.pause();
            this.lightboxVideoPlayer.src = '';
        }
    }
}

/* ========== EXPORTATION ========== */
window.GaleriePage = GaleriePage;
window.GalerieConfig = GalerieConfig;
window.GalerieState = GalerieState;

/* ========== DÉMARRAGE ========== */
let galeriePageInstance = null;

function initGaleriePage() {
    if (!galeriePageInstance) {
        galeriePageInstance = new GaleriePage();
    }
    return galeriePageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initGaleriePage());
} else {
    initGaleriePage();
}

document.addEventListener('layout-ready', () => {
    if (!GalerieState.initialized) initGaleriePage();
});

/* ============================================================
   FIN DU FICHIER GALERIE.JS
   ============================================================ */