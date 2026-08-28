/* ============================================================
   HOPE CHILD-DRC — MAIN.JS
   Initialisation Globale & Orchestration
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Point d'entrée principal du site,
                 initialisation de tous les modules,
                 loader, back-to-top, scroll indicator,
                 cookies, newsletter, gestion globale
   ============================================================ */

'use strict';

/* ============================================================
   1. INITIALISATION GLOBALE
   ============================================================ */
const App = {
    /* ========== ÉTAT GLOBAL ========== */
    state: {
        initialized: false,
        language: 'fr',
        theme: 'light',
        scrollPosition: 0,
        pageLoaded: false,
        modulesLoaded: {}
    },

    /* ========== RÉFÉRENCES DOM ========== */
    elements: {
        body: null,
        html: null,
        loader: null,
        navbar: null,
        backToTop: null,
        scrollIndicator: null,
        cookieBanner: null
    },

    /* ========== INITIALISATION PRINCIPALE ========== */
    init() {
        if (this.state.initialized) return;
        
        console.log('🚀 Initialisation de ' + CONFIG.site.name + '...');
        
        // Récupérer les références DOM
        this.cacheElements();
        
        // Initialiser les modules
        this.initLoader();
        this.initScrollIndicator();
        this.initBackToTop();
        this.initCookieBanner();
        this.initNewsletter();
        this.initSmoothScroll();
        this.initExternalLinks();
        this.initKeyboardShortcuts();
        
        // Marquer comme initialisé
        this.state.initialized = true;
        this.state.pageLoaded = true;
        
        console.log('✅ ' + CONFIG.site.name + ' initialisé avec succès');
    },

    /* ========== CACHE DES ÉLÉMENTS DOM ========== */
    cacheElements() {
        this.elements.body = document.body;
        this.elements.html = document.documentElement;
        this.elements.loader = document.getElementById('loader-wrapper') || document.querySelector('.loader-wrapper');
        this.elements.navbar = document.getElementById('navbar') || document.querySelector('.navbar');
        this.elements.backToTop = document.getElementById('back-to-top') || document.querySelector('.back-to-top');
        this.elements.scrollIndicator = document.getElementById('scroll-indicator') || document.querySelector('.scroll-indicator');
        this.elements.cookieBanner = document.getElementById('cookie-banner') || document.querySelector('.cookie-banner');
    },

    /* ============================================================
       2. LOADER (Écran de chargement)
       ============================================================ */
    initLoader() {
        if (!CONFIG.loader.enabled) return;
        
        const loader = this.elements.loader;
        if (!loader) {
            console.warn('⚠️ Loader non trouvé dans le DOM');
            return;
        }
        
        const startTime = Date.now();
        const minDuration = CONFIG.loader.minDuration;
        const fadeOutDuration = CONFIG.loader.fadeOutDuration;
        
        // Masquer le loader après le chargement de la page
        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDuration - elapsedTime);
            
            setTimeout(() => {
                // Ajouter la classe de masquage
                loader.classList.add('loader-hidden');
                
                // Supprimer le loader du DOM après la transition
                setTimeout(() => {
                    loader.remove();
                    console.log('✅ Loader masqué');
                }, fadeOutDuration);
                
            }, remainingTime);
        });
        
        // Fallback si load ne se déclenche pas
        setTimeout(() => {
            if (loader && document.readyState === 'complete') {
                loader.classList.add('loader-hidden');
                setTimeout(() => loader.remove(), fadeOutDuration);
            }
        }, CONFIG.loader.maxDuration);
    },

    /* ============================================================
       3. SCROLL INDICATOR (Barre de progression du scroll)
       ============================================================ */
    initScrollIndicator() {
        if (!CONFIG.scrollIndicator.enabled) return;
        
        const indicator = this.elements.scrollIndicator;
        if (!indicator) return;
        
        // Appliquer les styles de base
        indicator.style.position = 'fixed';
        indicator.style.top = '0';
        indicator.style.left = '0';
        indicator.style.height = CONFIG.scrollIndicator.height;
        indicator.style.width = '0%';
        indicator.style.background = CONFIG.scrollIndicator.color;
        indicator.style.zIndex = '9999';
        indicator.style.transition = 'width 0.1s linear';
        
        // Mettre à jour la largeur au scroll
        window.addEventListener('scroll', () => {
            this.updateScrollIndicator();
        });
        
        // Mise à jour initiale
        this.updateScrollIndicator();
        
        console.log('✅ Scroll Indicator initialisé');
    },

    updateScrollIndicator() {
        const indicator = this.elements.scrollIndicator;
        if (!indicator) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        indicator.style.width = scrollPercentage + '%';
        
        // Changer la couleur selon le pourcentage
        if (scrollPercentage > 80) {
            indicator.style.background = CONFIG.colors.accent;
        } else if (scrollPercentage > 50) {
            indicator.style.background = CONFIG.colors.secondary;
        } else {
            indicator.style.background = CONFIG.scrollIndicator.color;
        }
    },

    /* ============================================================
       4. BACK TO TOP (Retour en haut)
       ============================================================ */
    initBackToTop() {
        if (!CONFIG.backToTop.enabled) return;
        
        const backToTopBtn = this.elements.backToTop;
        if (!backToTopBtn) {
            // Créer le bouton s'il n'existe pas
            this.createBackToTopButton();
            return;
        }
        
        const showAfter = CONFIG.backToTop.showAfter;
        
        // Afficher/masquer le bouton au scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > showAfter) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Action de clic
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
        
        console.log('✅ Back to Top initialisé');
    },

    createBackToTopButton() {
        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Retour en haut');
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        
        document.body.appendChild(button);
        this.elements.backToTop = button;
        
        // Réinitialiser avec le nouveau bouton
        this.initBackToTop();
    },

    scrollToTop() {
        const duration = CONFIG.backToTop.scrollDuration;
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition * (1 - easedProgress));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        }
        
        requestAnimationFrame(animateScroll);
    },

    /* ============================================================
       5. COOKIE BANNER
       ============================================================ */
    initCookieBanner() {
        if (!CONFIG.cookies.enabled) return;
        
        // Vérifier si le consentement a déjà été donné
        const consent = localStorage.getItem(CONFIG.cookies.storageKey);
        if (consent) return;
        
        // Créer la bannière si elle n'existe pas
        if (!this.elements.cookieBanner) {
            this.createCookieBanner();
            return;
        }
        
        // Afficher la bannière
        setTimeout(() => {
            this.elements.cookieBanner.classList.add('visible');
        }, 2000);
        
        console.log('✅ Cookie Banner initialisé');
    },

    createCookieBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="cookie-banner-text">
                    <h4>${CONFIG.cookies.bannerTitle}</h4>
                    <p>${CONFIG.cookies.bannerText}</p>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn btn-secondary btn-sm cookie-accept">
                        ${CONFIG.cookies.acceptButtonLabel}
                    </button>
                    <button class="btn btn-outline-white btn-sm cookie-reject">
                        ${CONFIG.cookies.rejectButtonLabel}
                    </button>
                    <a href="${CONFIG.cookies.learnMoreUrl}" class="cookie-learn-more">
                        ${CONFIG.cookies.learnMoreUrl ? 'En savoir plus' : ''}
                    </a>
                </div>
            </div>
        `;
        
        // Styles inline pour la bannière
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            max-width: 600px;
            margin: 0 auto;
            background: ${CONFIG.colors.white};
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 9998;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.5s ease;
        `;
        
        document.body.appendChild(banner);
        this.elements.cookieBanner = banner;
        
        // Ajouter les styles pour le contenu
        const style = document.createElement('style');
        style.textContent = `
            .cookie-banner.visible {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) !important;
            }
            .cookie-banner-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
            }
            .cookie-banner-icon {
                font-size: 2rem;
                color: ${CONFIG.colors.secondary};
                flex-shrink: 0;
            }
            .cookie-banner-text h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1rem;
                color: ${CONFIG.colors.primary};
            }
            .cookie-banner-text p {
                margin: 0;
                font-size: 0.85rem;
                color: ${CONFIG.colors.grayDark};
            }
            .cookie-banner-actions {
                display: flex;
                gap: 0.5rem;
                flex-shrink: 0;
                flex-direction: column;
            }
            .cookie-learn-more {
                font-size: 0.75rem;
                color: ${CONFIG.colors.gray};
                text-decoration: underline;
            }
            @media (max-width: 480px) {
                .cookie-banner-content {
                    flex-direction: column;
                    text-align: center;
                }
                .cookie-banner-actions {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Événements
        const acceptBtn = banner.querySelector('.cookie-accept');
        const rejectBtn = banner.querySelector('.cookie-reject');
        
        acceptBtn.addEventListener('click', () => {
            this.setCookieConsent('accepted');
        });
        
        rejectBtn.addEventListener('click', () => {
            this.setCookieConsent('rejected');
        });
        
        // Afficher après un délai
        setTimeout(() => {
            banner.classList.add('visible');
        }, 2000);
        
        console.log('✅ Cookie Banner créé');
    },

    setCookieConsent(consent) {
        const expirationDays = CONFIG.cookies.expirationDays;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);
        
        localStorage.setItem(CONFIG.cookies.storageKey, JSON.stringify({
            consent: consent,
            date: new Date().toISOString(),
            expires: expirationDate.toISOString()
        }));
        
        // Masquer la bannière
        if (this.elements.cookieBanner) {
            this.elements.cookieBanner.classList.remove('visible');
            setTimeout(() => {
                this.elements.cookieBanner.remove();
            }, 500);
        }
        
        console.log('🍪 Consentement cookies : ' + consent);
    },

    /* ============================================================
       6. NEWSLETTER
       ============================================================ */
    initNewsletter() {
    if (!CONFIG.newsletter.enabled) return;
    
    const newsletterForms = document.querySelectorAll('.newsletter-form, .footer-newsletter form');
    
    newsletterForms.forEach((form) => {
        form.addEventListener('submit', (e) => {
            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;
            
            const email = emailInput.value.trim();
            
            /* ✅ Valider l'email */
            if (!this.validateEmail(email)) {
                e.preventDefault();  // ✅ Bloque UNIQUEMENT si invalide
                this.showNewsletterError(form, '⚠️ Email invalide');
                return;
            }
            
            /* ✅ Si valide → NE PAS preventDefault → Netlify Forms capture */
            console.log('📧 Newsletter soumise → Netlify Forms : ' + email);
            /* PAS de toast "Merci" ici — Netlify redirige vers action="/index.html" */
        });
    });
    
    console.log('✅ Newsletter initialisée (Netlify Compatible)');
},

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    

    showNewsletterSuccess(form, message) {
        const existingMessage = form.querySelector('.newsletter-message');
        if (existingMessage) existingMessage.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = 'newsletter-message newsletter-message-success';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #28A745;
            animation: fadeIn 0.3s ease;
        `;
        
        form.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, CONFIG.forms.successMessageDuration);
    },

    showNewsletterError(form, message) {
        const existingMessage = form.querySelector('.newsletter-message');
        if (existingMessage) existingMessage.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = 'newsletter-message newsletter-message-error';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #DC3545;
            animation: fadeIn 0.3s ease;
        `;
        
        form.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, CONFIG.forms.errorMessageDuration);
    },

    /* ============================================================
       7. SMOOTH SCROLL (Défilement fluide pour les ancres)
       ============================================================ */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;
                
                e.preventDefault();
                
                const navbarHeight = CONFIG.navbar ? 
                    (window.innerWidth < 768 ? 64 : 80) : 0;
                
                const targetPosition = targetElement.getBoundingClientRect().top + 
                    window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Mettre à jour l'URL sans recharger
                history.pushState(null, null, targetId);
            });
        });
        
        console.log('✅ Smooth Scroll initialisé');
    },

    /* ============================================================
       8. LIENS EXTERNES
       ============================================================ */
    initExternalLinks() {
        document.querySelectorAll('a[href^="http"]').forEach((link) => {
            const url = new URL(link.href);
            
            // Ouvrir les liens externes dans un nouvel onglet
            if (url.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
        
        console.log('✅ Liens externes configurés');
    },

    /* ============================================================
       9. RACCOURCIS CLAVIER
       ============================================================ */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC : Fermer les modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Alt + F : Focus sur la recherche
            if (e.altKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-bar input, input[type="search"]');
                if (searchInput) searchInput.focus();
            }
            
            // Alt + H : Retour à l'accueil
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = 'index.html';
            }
            
            // Alt + D : Page de don
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                window.location.href = 'don.html';
            }
            
            // Alt + C : Page de contact
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                window.location.href = 'contact.html';
            }
        });
        
        console.log('✅ Raccourcis clavier initialisés');
    },

    closeAllModals() {
        // Fermer les modals
        document.querySelectorAll('.modal-overlay.active').forEach((modal) => {
            modal.classList.remove('active');
        });
        
        // Fermer les lightboxes
        document.querySelectorAll('.lightbox.active').forEach((lightbox) => {
            lightbox.classList.remove('active');
        });
        
        // Fermer le menu mobile
        const navMenu = document.querySelector('.navbar-menu.active');
        if (navMenu) navMenu.classList.remove('active');
        
        const navbarToggle = document.querySelector('.navbar-toggle.active');
        if (navbarToggle) navbarToggle.classList.remove('active');
    },

    /* ============================================================
       10. GESTION DES ERREURS GLOBALES
       ============================================================ */
    handleGlobalErrors() {
        window.addEventListener('error', (e) => {
            console.error('❌ Erreur globale :', e.message);
            
            // Afficher un toast d'erreur si disponible
            if (typeof showToast === 'function') {
                showToast('Une erreur est survenue', 'error');
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('❌ Promesse non gérée :', e.reason);
            
            if (typeof showToast === 'function') {
                showToast('Une erreur est survenue', 'error');
            }
        });
    },

    /* ============================================================
       11. PERFORMANCE MONITORING
       ============================================================ */
    logPerformance() {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            console.log('📊 Performance :');
            console.log('   - Temps de chargement : ' + pageLoadTime + 'ms');
            console.log('   - DOM prêt : ' + domReadyTime + 'ms');
            
            // Envoyer à Google Analytics si disponible
            if (typeof gtag === 'function') {
                gtag('event', 'timing_complete', {
                    'name': 'load',
                    'value': pageLoadTime,
                    'event_category': 'Performance'
                });
            }
        }
    },

    /* ============================================================
       12. RESIZE HANDLER
       ============================================================ */
    initResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            
            resizeTimeout = setTimeout(() => {
                // Mettre à jour les éléments dépendant de la taille
                this.state.deviceType = getDeviceType();
                
                // Fermer le menu mobile si on passe en desktop
                if (window.innerWidth >= CONFIG.navigation.breakpoint) {
                    const navMenu = document.querySelector('.navbar-menu.active');
                    if (navMenu) navMenu.classList.remove('active');
                    
                    const navbarToggle = document.querySelector('.navbar-toggle.active');
                    if (navbarToggle) navbarToggle.classList.remove('active');
                }
                
                console.log('📱 Appareil : ' + this.state.deviceType);
                
            }, 250);
        });
    },

    /* ============================================================
       13. VISIBILITY CHANGE HANDLER
       ============================================================ */
    initVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page masquée - mettre en pause les animations
                document.body.classList.add('page-hidden');
            } else {
                // Page visible - reprendre les animations
                document.body.classList.remove('page-hidden');
            }
        });
    },

    /* ============================================================
       14. ONLINE/OFFLINE HANDLER
       ============================================================ */
    initConnectionHandler() {
        window.addEventListener('online', () => {
            console.log('🌐 Connexion rétablie');
            if (typeof showToast === 'function') {
                showToast('Connexion rétablie', 'success');
            }
        });
        
        window.addEventListener('offline', () => {
            console.warn('📡 Connexion perdue');
            if (typeof showToast === 'function') {
                showToast('Connexion perdue', 'error');
            }
        });
    }
};

/* ============================================================
   15. DÉMARRAGE DE L'APPLICATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Fallback si DOMContentLoaded déjà passé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

/* ============================================================
   16. EXPORTATION GLOBALE
   ============================================================ */
window.App = App;

/* ============================================================
   FIN DU FICHIER MAIN.JS
   ============================================================ */