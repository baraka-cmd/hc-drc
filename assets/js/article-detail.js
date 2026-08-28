/* ============================================================
   HOPE CHILD-DRC — ARTICLE-DETAIL.JS
   Scripts Spécifiques de la Page Détail Article
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la page détail article,
                 partage social, copie de lien, lecture estimée,
                 navigation, articles similaires, animations
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION ARTICLE DÉTAIL
   ============================================================ */
const ArticleDetailConfig = {
    /* Partage social */
    share: {
        facebookUrl: 'https://www.facebook.com/sharer/sharer.php',
        linkedinUrl: 'https://www.linkedin.com/shareArticle',
        twitterUrl: 'https://twitter.com/intent/tweet',
        whatsappUrl: 'https://wa.me/',
        copySuccessDuration: 2000,
        copySuccessMessage: 'Lien copié !'
    },

    /* Lecture */
    reading: {
        wordsPerMinute: 200,
        minReadingTime: 1,
        readingTimeSuffix: 'min de lecture'
    },

    /* Animations */
    animations: {
        revealDuration: 600,
        staggerDelay: 150,
        hoverTransition: 300
    },

    /* Articles similaires */
    related: {
        maxArticles: 3,
        storageKey: 'hc_drc_viewed_articles'
    },

    /* Navigation */
    navigation: {
        scrollOffset: 100,
        keyboardEnabled: true
    }
};

/* ============================================================
   2. ÉTAT ARTICLE DÉTAIL
   ============================================================ */
const ArticleDetailState = {
    initialized: false,
    pageUrl: '',
    pageTitle: '',
    readingTime: 0,
    copyInProgress: false,
    shareButtonsInitialized: false,
    navigationInitialized: false,
    relatedInitialized: false
};

/* ============================================================
   3. CLASSE PRINCIPALE ARTICLE DÉTAIL
   ============================================================ */
class ArticleDetailPage {
    constructor() {
        /* Références DOM */
        this.shareButtons = [];
        this.copyLinkBtn = null;
        this.articleContent = null;
        this.articleTitle = null;
        this.readingTimeElement = null;
        this.articleNavLinks = [];
        this.relatedCards = [];
        this.backToTopBtn = null;

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
            if (!ArticleDetailState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        /* Récupérer les éléments DOM */
        this.cacheElements();

        /* Vérifier que les éléments essentiels existent */
        if (!this.articleContent) {
            console.warn('⚠️ Contenu de l\'article introuvable');
            return;
        }

        ArticleDetailState.initialized = true;

        /* Récupérer les informations de la page */
        this.capturePageInfo();

        /* Initialiser les modules */
        this.initReadingTime();
        this.initShareButtons();
        this.initCopyLink();
        this.initNavigation();
        this.initRelatedArticles();
        this.initScrollAnimations();
        this.initKeyboardNavigation();
        this.trackArticleView();

        console.log('✅ Page Détail Article initialisée');
        console.log('   - Titre : ' + ArticleDetailState.pageTitle);
        console.log('   - Lecture estimée : ' + ArticleDetailState.readingTime + ' min');
    }

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.shareButtons = Array.from(document.querySelectorAll('.share-btn'));
        this.copyLinkBtn = document.getElementById('copy-link-btn');
        this.articleContent = document.querySelector('.article-content');
        this.articleTitle = document.querySelector('.article-title');
        this.readingTimeElement = document.querySelector('.article-meta-item .fa-clock')?.parentElement;
        this.articleNavLinks = Array.from(document.querySelectorAll('.article-nav-link'));
        this.relatedCards = Array.from(document.querySelectorAll('.related-article-card'));
    }

    /* ========== CAPTURE DES INFOS DE LA PAGE ========== */
    capturePageInfo() {
        ArticleDetailState.pageUrl = window.location.href;
        ArticleDetailState.pageTitle = document.title || 'HOPE CHILD-DRC';

        /* Si le titre est trop long, le tronquer pour le partage */
        if (ArticleDetailState.pageTitle.length > 100) {
            ArticleDetailState.pageTitle = ArticleDetailState.pageTitle.substring(0, 97) + '...';
        }
    }

    /* ============================================================
       4. TEMPS DE LECTURE ESTIMÉ
       ============================================================ */
    initReadingTime() {
        if (!this.articleContent) return;

        /* Compter les mots du contenu */
        const text = this.articleContent.textContent || '';
        const wordCount = text.trim().split(/\s+/).length;

        /* Calculer le temps de lecture */
        const rawReadingTime = wordCount / ArticleDetailConfig.reading.wordsPerMinute;
        const readingTime = Math.max(
            ArticleDetailConfig.reading.minReadingTime,
            Math.ceil(rawReadingTime)
        );

        ArticleDetailState.readingTime = readingTime;

        /* Mettre à jour l'affichage si l'élément existe */
        if (this.readingTimeElement) {
            const timeText = this.readingTimeElement.querySelector('span');
            if (timeText) {
                timeText.textContent = readingTime + ' ' + ArticleDetailConfig.reading.readingTimeSuffix;
            }
        }

        console.log('   - Mots : ' + wordCount);
        console.log('   - Temps de lecture : ' + readingTime + ' min');
    }

    /* ============================================================
       5. BOUTONS DE PARTAGE SOCIAL
       ============================================================ */
    initShareButtons() {
        if (this.shareButtons.length === 0) return;

        ArticleDetailState.shareButtonsInitialized = true;

        /* Mettre à jour les URLs de partage dynamiquement */
        this.shareButtons.forEach((button) => {
            /* Ne pas traiter le bouton copier */
            if (button.id === 'copy-link-btn') return;

            const href = button.getAttribute('href');
            if (!href) return;

            /* Remplacer l'URL placeholder par l'URL actuelle */
            const currentUrl = encodeURIComponent(ArticleDetailState.pageUrl);
            const currentTitle = encodeURIComponent(ArticleDetailState.pageTitle);

            let shareUrl = '';

            if (button.classList.contains('share-facebook')) {
                shareUrl = ArticleDetailConfig.share.facebookUrl + '?u=' + currentUrl;
            } else if (button.classList.contains('share-linkedin')) {
                shareUrl = ArticleDetailConfig.share.linkedinUrl + '?mini=true&url=' + currentUrl;
            } else if (button.classList.contains('share-twitter')) {
                shareUrl = ArticleDetailConfig.share.twitterUrl + '?url=' + currentUrl + '&text=' + currentTitle;
            } else if (button.classList.contains('share-whatsapp')) {
                shareUrl = ArticleDetailConfig.share.whatsappUrl + '?text=' + currentTitle + '%20' + currentUrl;
            }

            if (shareUrl) {
                button.setAttribute('href', shareUrl);
            }

            /* Ajouter l'attribut title */
            const buttonText = button.querySelector('span');
            if (buttonText) {
                button.setAttribute('title', 'Partager : ' + buttonText.textContent);
            }
        });

        console.log('✅ Boutons de partage initialisés');
    }

    /* ============================================================
       6. COPIER LE LIEN
       ============================================================ */
    initCopyLink() {
        if (!this.copyLinkBtn) return;

        this.copyLinkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyPageLink();
        });

        console.log('✅ Copie de lien initialisée');
    }

    copyPageLink() {
        if (ArticleDetailState.copyInProgress) return;

        ArticleDetailState.copyInProgress = true;

        /* Utiliser l'API Clipboard si disponible */
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ArticleDetailState.pageUrl)
                .then(() => {
                    this.showCopySuccess();
                })
                .catch(() => {
                    this.fallbackCopyLink();
                });
        } else {
            this.fallbackCopyLink();
        }
    }

    fallbackCopyLink() {
        /* Méthode de secours avec textarea */
        const textarea = document.createElement('textarea');
        textarea.value = ArticleDetailState.pageUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            this.showCopyError();
        }

        document.body.removeChild(textarea);
    }

    showCopySuccess() {
        if (!this.copyLinkBtn) return;

        /* Ajouter la classe "copied" */
        this.copyLinkBtn.classList.add('copied');

        /* Changer le contenu du bouton */
        const originalContent = this.copyLinkBtn.innerHTML;
        this.copyLinkBtn.innerHTML = '<i class="fas fa-check"></i><span>Lien copié !</span>';

        /* Restaurer après un délai */
        setTimeout(() => {
            this.copyLinkBtn.classList.remove('copied');
            this.copyLinkBtn.innerHTML = originalContent;
            ArticleDetailState.copyInProgress = false;
        }, ArticleDetailConfig.share.copySuccessDuration);

        console.log('✅ ' + ArticleDetailConfig.share.copySuccessMessage);
    }

    showCopyError() {
        if (!this.copyLinkBtn) return;

        this.copyLinkBtn.innerHTML = '<i class="fas fa-times"></i><span>Erreur</span>';

        setTimeout(() => {
            this.copyLinkBtn.innerHTML = '<i class="fas fa-link"></i><span>Copier le lien</span>';
            ArticleDetailState.copyInProgress = false;
        }, ArticleDetailConfig.share.copySuccessDuration);

        console.error('❌ Impossible de copier le lien');
    }

    /* ============================================================
       7. NAVIGATION ENTRE ARTICLES
       ============================================================ */
    initNavigation() {
        if (this.articleNavLinks.length === 0) return;

        ArticleDetailState.navigationInitialized = true;

        this.articleNavLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                /* Ajouter une animation de sortie */
                e.preventDefault();

                const targetUrl = link.getAttribute('href');
                if (!targetUrl || targetUrl === '#') return;

                /* Animation de transition */
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';

                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 300);
            });
        });

        console.log('✅ Navigation entre articles initialisée');
    }

    /* ============================================================
       8. ARTICLES SIMILAIRES
       ============================================================ */
    initRelatedArticles() {
        if (this.relatedCards.length === 0) return;

        ArticleDetailState.relatedInitialized = true;

        this.relatedCards.forEach((card) => {
            /* Navigation par clic sur la carte */
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;

                const link = card.querySelector('.related-article-link');
                if (link) {
                    window.location.href = link.getAttribute('href');
                }
            });

            /* Effet de survol */
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(8, 38, 75, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 8px rgba(8, 38, 75, 0.08)';
            });
        });

        console.log('✅ Articles similaires initialisés');
    }

    /* ============================================================
       9. ANIMATIONS AU SCROLL
       ============================================================ */
    initScrollAnimations() {
        /* Utiliser IntersectionObserver pour les éléments à animer */
        const elementsToAnimate = document.querySelectorAll('[data-aos]');

        if (elementsToAnimate.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.getAttribute('data-aos');
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

        elementsToAnimate.forEach((element) => {
            observer.observe(element);
        });

        console.log('✅ Animations au scroll initialisées');
    }

    /* ============================================================
       10. NAVIGATION CLAVIER
       ============================================================ */
    initKeyboardNavigation() {
        if (!ArticleDetailConfig.navigation.keyboardEnabled) return;

        document.addEventListener('keydown', (e) => {
            /* Flèche gauche : article précédent */
            if (e.key === 'ArrowLeft' && !this.isTyping(e)) {
                const prevLink = document.querySelector('.article-nav-prev');
                if (prevLink) {
                    e.preventDefault();
                    window.location.href = prevLink.getAttribute('href');
                }
            }

            /* Flèche droite : article suivant */
            if (e.key === 'ArrowRight' && !this.isTyping(e)) {
                const nextLink = document.querySelector('.article-nav-next');
                if (nextLink) {
                    e.preventDefault();
                    window.location.href = nextLink.getAttribute('href');
                }
            }
        });

        console.log('✅ Navigation clavier initialisée');
    }

    isTyping(e) {
        const target = e.target;
        return target.tagName === 'INPUT' || 
               target.tagName === 'TEXTAREA' || 
               target.isContentEditable;
    }

    /* ============================================================
       11. SUIVI DES ARTICLES LUS
       ============================================================ */
    trackArticleView() {
        const storageKey = ArticleDetailConfig.related.storageKey;
        const articleId = this.getArticleId();

        if (!articleId) return;

        /* Récupérer les articles déjà vus */
        let viewedArticles = [];
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                viewedArticles = JSON.parse(stored);
            }
        } catch (err) {
            viewedArticles = [];
        }

        /* Ajouter l'article actuel s'il n'est pas déjà présent */
        if (!viewedArticles.includes(articleId)) {
            viewedArticles.unshift(articleId);

            /* Limiter à 20 articles */
            if (viewedArticles.length > 20) {
                viewedArticles = viewedArticles.slice(0, 20);
            }

            localStorage.setItem(storageKey, JSON.stringify(viewedArticles));
        }

        console.log('   - Article suivi : ' + articleId);
    }

    getArticleId() {
        /* Utiliser le slug de l'URL */
        const url = new URL(window.location.href);
        const path = url.pathname;

        /* Extraire le nom du fichier sans extension */
        const filename = path.split('/').pop() || 'article';
        return filename.replace('.html', '');
    }

    /* ============================================================
       12. MÉTHODES PUBLIQUES
       ============================================================ */
    getState() {
        return { ...ArticleDetailState };
    }

    refresh() {
        this.setup();
    }

    destroy() {
        ArticleDetailState.initialized = false;
        ArticleDetailState.shareButtonsInitialized = false;
        ArticleDetailState.navigationInitialized = false;
        ArticleDetailState.relatedInitialized = false;

        console.log('🗑️ Page Détail Article détruite');
    }
}

/* ============================================================
   13. EXPORTATION GLOBALE
   ============================================================ */
window.ArticleDetailPage = ArticleDetailPage;
window.ArticleDetailConfig = ArticleDetailConfig;
window.ArticleDetailState = ArticleDetailState;

/* ============================================================
   14. DÉMARRAGE
   ============================================================ */
let articleDetailPageInstance = null;

function initArticleDetailPage() {
    if (!articleDetailPageInstance) {
        articleDetailPageInstance = new ArticleDetailPage();
    }
    return articleDetailPageInstance;
}

/* Initialiser au chargement */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initArticleDetailPage();
    });
} else {
    initArticleDetailPage();
}

/* Réinitialiser quand le layout est prêt */
document.addEventListener('layout-ready', () => {
    if (!ArticleDetailState.initialized) {
        initArticleDetailPage();
    }
});

/* ============================================================
   FIN DU FICHIER ARTICLE-DETAIL.JS
   ============================================================ */