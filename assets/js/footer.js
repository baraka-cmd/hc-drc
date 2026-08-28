/* ============================================================
   HOPE CHILD-DRC — FOOTER.JS
   Fonctionnalités du Pied de Page
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète du footer,
                 newsletter, année dynamique,
                 back-to-top, cookie banner
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION FOOTER
   ============================================================ */
const FooterConfig = {
    backToTopShowAfter: 500,
    backToTopScrollDuration: 500,
    newsletterStorageKey: 'hc_drc_newsletter',
    newsletterSuccessDuration: 5000,
    newsletterErrorDuration: 5000,
    cookieStorageKey: 'hc_drc_cookies_consent',
    cookieExpirationDays: 365,
    cookieShowDelay: 2000
};

/* ============================================================
   2. ÉTAT FOOTER
   ============================================================ */
const FooterState = {
    backToTopVisible: false,
    newsletterSubscribed: false,
    cookieConsent: null,
    initialized: false
};

/* ============================================================
   3. CLASSE FOOTER
   ============================================================ */
class Footer {
    constructor() {
        this.footer = null;
        this.backToTopBtn = null;
        this.newsletterForm = null;
        this.cookieBanner = null;
        
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
            if (!FooterState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        this.footer = document.getElementById('footer');
        this.backToTopBtn = document.getElementById('back-to-top');
        this.newsletterForm = document.getElementById('footer-newsletter-form');
        this.cookieBanner = document.getElementById('cookie-banner');
        
        if (!this.footer && !this.backToTopBtn && !this.newsletterForm) {
            console.warn('⚠️ Footer introuvable');
            return;
        }
        
        this.initBackToTop();
        this.initNewsletter();
        this.initCookieBanner();
        this.initDynamicYear();
        this.initExternalLinks();
        
        FooterState.initialized = true;
        console.log('✅ Footer initialisé');
    }

    /* ========== BOUTON RETOUR EN HAUT ========== */
    initBackToTop() {
        if (!this.backToTopBtn) return;
        
        // Afficher/masquer au scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > FooterConfig.backToTopShowAfter) {
                if (!FooterState.backToTopVisible) {
                    this.backToTopBtn.classList.add('visible');
                    this.backToTopBtn.setAttribute('aria-hidden', 'false');
                    FooterState.backToTopVisible = true;
                }
            } else {
                if (FooterState.backToTopVisible) {
                    this.backToTopBtn.classList.remove('visible');
                    this.backToTopBtn.setAttribute('aria-hidden', 'true');
                    FooterState.backToTopVisible = false;
                }
            }
        }, { passive: true });
        
        // Action de clic avec animation fluide
        this.backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.smoothScrollToTop();
        });
    }

    smoothScrollToTop() {
        const duration = FooterConfig.backToTopScrollDuration;
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        
        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition * (1 - easedProgress));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /* ========== NEWSLETTER ========== */
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
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    subscribeNewsletter(email) {
        // Vérifier si déjà inscrit
        const existing = localStorage.getItem(FooterConfig.newsletterStorageKey);
        
        if (existing) {
            const data = JSON.parse(existing);
            if (data.email === email) {
                this.showNewsletterMessage('✅ Vous êtes déjà inscrit !', 'success');
                return;
            }
        }
        
        // Désactiver le bouton pendant la simulation
        const submitBtn = this.newsletterForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn ? submitBtn.innerHTML : '';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        // Simuler une requête API
        setTimeout(() => {
            // Sauvegarder l'inscription
            localStorage.setItem(FooterConfig.newsletterStorageKey, JSON.stringify({
                email: email,
                date: new Date().toISOString()
            }));
            
            FooterState.newsletterSubscribed = true;
            
            // Restaurer le bouton
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Inscrit !';
            }
            
            this.showNewsletterMessage('🎉 Merci pour votre inscription !', 'success');
            
            // Réinitialiser le formulaire
            this.newsletterForm.reset();
            
            // Restaurer le bouton original après 3 secondes
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = originalHtml;
                }
            }, 3000);
            
        }, 1500);
    }

    showNewsletterMessage(message, type) {
        // Supprimer l'ancien message
        const existing = this.newsletterForm.querySelector('.newsletter-message');
        if (existing) existing.remove();
        
        // Créer le nouveau message
        const messageEl = document.createElement('div');
        messageEl.className = 'newsletter-message';
        messageEl.textContent = message;
        
        // Styles selon le type
        if (type === 'success') {
            messageEl.style.cssText = `
                background: rgba(40, 167, 69, 0.15);
                color: #28A745;
                border-left: 3px solid #28A745;
            `;
        } else {
            messageEl.style.cssText = `
                background: rgba(220, 53, 69, 0.15);
                color: #DC3545;
                border-left: 3px solid #DC3545;
            `;
        }
        
        this.newsletterForm.appendChild(messageEl);
        
        // Auto-suppression
        const duration = type === 'success' ? 
            FooterConfig.newsletterSuccessDuration : 
            FooterConfig.newsletterErrorDuration;
        
        setTimeout(() => {
            messageEl.remove();
        }, duration);
    }

    /* ========== COOKIE BANNER ========== */
    initCookieBanner() {
        // Vérifier le consentement existant
        const consent = localStorage.getItem(FooterConfig.cookieStorageKey);
        
        if (consent) {
            FooterState.cookieConsent = JSON.parse(consent);
            return;
        }
        
        // Créer la bannière si elle n'existe pas
        if (!this.cookieBanner) {
            this.createCookieBanner();
            return;
        }
        
        // Afficher la bannière après un délai
        setTimeout(() => {
            this.cookieBanner.classList.add('visible');
        }, FooterConfig.cookieShowDelay);
    }

    createCookieBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Bannière de cookies');
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="cookie-banner-text">
                    <h4>🍪 Utilisation des cookies</h4>
                    <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site.</p>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn btn-secondary btn-sm cookie-accept">
                        <i class="fas fa-check"></i> Accepter
                    </button>
                    <button class="btn btn-outline-white btn-sm cookie-reject">
                        <i class="fas fa-times"></i> Refuser
                    </button>
                    <a href="politique-cookies.html" class="cookie-learn-more">
                        En savoir plus
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        this.cookieBanner = banner;
        
        // Événements
        const acceptBtn = banner.querySelector('.cookie-accept');
        const rejectBtn = banner.querySelector('.cookie-reject');
        
        acceptBtn.addEventListener('click', () => {
            this.setCookieConsent('accepted');
        });
        
        rejectBtn.addEventListener('click', () => {
            this.setCookieConsent('rejected');
        });
        
        // Afficher
        setTimeout(() => {
            banner.classList.add('visible');
        }, FooterConfig.cookieShowDelay);
        
        console.log('✅ Cookie banner créé');
    }

    setCookieConsent(consent) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + FooterConfig.cookieExpirationDays);
        
        const consentData = {
            consent: consent,
            date: new Date().toISOString(),
            expires: expirationDate.toISOString()
        };
        
        localStorage.setItem(FooterConfig.cookieStorageKey, JSON.stringify(consentData));
        FooterState.cookieConsent = consentData;
        
        // Masquer la bannière
        if (this.cookieBanner) {
            this.cookieBanner.classList.remove('visible');
            
            setTimeout(() => {
                this.cookieBanner.remove();
            }, 500);
        }
        
        console.log('🍪 Consentement cookies : ' + consent);
    }

    /* ========== ANNÉE DYNAMIQUE ========== */
    initDynamicYear() {
        const currentYear = new Date().getFullYear();
        
        document.querySelectorAll('.footer-copyright').forEach(el => {
            // Remplacer 2024 ou toute autre année par l'année actuelle
            el.innerHTML = el.innerHTML.replace(/20\d{2}/g, currentYear);
        });
        
        console.log('✅ Année dynamique : ' + currentYear);
    }

    /* ========== LIENS EXTERNES ========== */
    initExternalLinks() {
        this.footer?.querySelectorAll('a[href^="http"]').forEach(link => {
            const url = new URL(link.href);
            
            if (url.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    /* ========== MÉTHODES PUBLIQUES ========== */
    scrollToTop() {
        this.smoothScrollToTop();
    }

    destroy() {
        FooterState.initialized = false;
        console.log('🗑️ Footer détruit');
    }
}

/* ============================================================
   4. INITIALISATION AUTOMATIQUE
   ============================================================ */
let footerInstance = null;

function initFooter() {
    if (!footerInstance) {
        footerInstance = new Footer();
    }
    return footerInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
} else {
    initFooter();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!FooterState.initialized) {
        initFooter();
    }
});

/* ============================================================
   5. EXPORTATION GLOBALE
   ============================================================ */
window.Footer = Footer;
window.FooterConfig = FooterConfig;
window.FooterState = FooterState;
window.footerInstance = footerInstance;
window.initFooter = initFooter;

/* ============================================================
   FIN DU FICHIER FOOTER.JS
   ============================================================ */