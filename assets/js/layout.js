/* ============================================================
   HOPE CHILD-DRC — LAYOUT.JS
   Système d'Injection Navbar & Footer
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Charge et injecte automatiquement
                 la navbar et le footer dans toutes les pages.
                 Gère aussi la navigation mobile, les dropdowns,
                 le loader, le scroll indicator, le back-to-top,
                 le sélecteur de langue et les cookies.
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION DU LAYOUT
   ============================================================ */
const LayoutConfig = {
    /* Chemins des fichiers à injecter */
    navbarUrl: 'includes/navbar.html',
    footerUrl: 'includes/footer.html',
    
    /* Sélecteurs des conteneurs */
    navbarContainerId: 'navbar-container',
    footerContainerId: 'footer-container',
    
    /* Délais et timeouts */
    injectionTimeout: 5000,
    loaderMinDuration: 1000,
    loaderFadeOutDuration: 500,
    
    /* Seuils */
    scrollThreshold: 50,
    backToTopShowAfter: 500,
    
    /* Classes CSS */
    activeClass: 'active',
    scrolledClass: 'scrolled',
    visibleClass: 'visible',
    hiddenClass: 'loader-hidden',
    menuOpenClass: 'active'
};

/* ============================================================
   2. ÉTAT GLOBAL
   ============================================================ */
const LayoutState = {
    navbarLoaded: false,
    footerLoaded: false,
    layoutReady: false,
    currentLanguage: localStorage.getItem('hc_drc_language') || 'fr',
    menuOpen: false,
    activeDropdown: null,
    scrollPosition: 0,
    loaderStartTime: Date.now()
};

/* ============================================================
   3. FONCTIONS D'INJECTION
   ============================================================ */

/**
 * Charge un fichier HTML via fetch
 * @param {string} url - URL du fichier à charger
 * @returns {Promise<string>} Contenu HTML du fichier
 */
async function fetchHtml(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status} pour ${url}`);
        }
        
        return await response.text();
        
    } catch (error) {
        console.error(`❌ Erreur de chargement : ${url}`, error);
        return null;
    }
}

/**
 * Injecte le HTML dans un conteneur spécifié
 * @param {string} containerId - ID du conteneur cible
 * @param {string} html - Contenu HTML à injecter
 * @param {string} componentName - Nom du composant (pour les logs)
 * @returns {boolean} True si injection réussie
 */
function injectHtml(containerId, html, componentName) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`⚠️ Conteneur #${containerId} introuvable pour ${componentName}`);
        return false;
    }
    
    if (!html) {
        console.error(`❌ HTML vide pour ${componentName}`);
        return false;
    }
    
    container.innerHTML = html;
    console.log(`✅ ${componentName} injecté dans #${containerId}`);
    return true;
}

/**
 * Injecte la navbar dans la page
 */
async function injectNavbar() {
    const html = await fetchHtml(LayoutConfig.navbarUrl);
    
    if (injectHtml(LayoutConfig.navbarContainerId, html, 'Navbar')) {
        LayoutState.navbarLoaded = true;
        initNavbarFunctionality();
    }
}

/**
 * Injecte le footer dans la page
 */
async function injectFooter() {
    const html = await fetchHtml(LayoutConfig.footerUrl);
    
    if (injectHtml(LayoutConfig.footerContainerId, html, 'Footer')) {
        LayoutState.footerLoaded = true;
        initFooterFunctionality();
    }
}

/**
 * Initialise tout le layout
 */
async function initLayout() {
    console.log('🔄 Initialisation du layout...');
    
    const startTime = Date.now();
    
    // Charger navbar et footer en parallèle
    await Promise.all([
        injectNavbar(),
        injectFooter()
    ]);
    
    // Vérifier que tout est chargé
    if (LayoutState.navbarLoaded && LayoutState.footerLoaded) {
        LayoutState.layoutReady = true;
        console.log('✅ Layout complet chargé');
        
        // Initialiser les fonctionnalités globales
        initGlobalFunctionality();
        initLanguageSwitcher();
        initActiveNavLink();
        initDropdownMobile();
        
        // Masquer le loader
        hideLoader();
        
        // Déclencher l'événement layout-ready
        document.dispatchEvent(new CustomEvent('layout-ready'));
        
    } else {
        console.error('❌ Erreur de chargement du layout');
        
        // Masquer le loader quand même
        hideLoader();
    }
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Layout chargé en ${loadTime}ms`);
}

/* ============================================================
   4. FONCTIONNALITÉS DE LA NAVBAR
   ============================================================ */

/**
 * Initialise toutes les fonctionnalités de la navbar
 */
function initNavbarFunctionality() {
    initNavbarScroll();
    initMobileMenu();
    initDropdownHover();
    initNavbarAccessibility();
    initScrollIndicator();
    initBackToTop();
    initSmoothScroll();
}

/**
 * Gère l'effet de scroll sur la navbar
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        LayoutState.scrollPosition = window.pageYOffset;
        
        // Ajouter/retirer la classe scrolled
        if (window.pageYOffset > LayoutConfig.scrollThreshold) {
            navbar.classList.add(LayoutConfig.scrolledClass);
        } else {
            navbar.classList.remove(LayoutConfig.scrolledClass);
        }
        
        // Mettre à jour le scroll indicator
        updateScrollIndicator();
        
        // Afficher/masquer le back-to-top
        updateBackToTop();
    }, { passive: true });
    
    console.log('✅ Navbar scroll effect initialisé');
}

/**
 * Gère le menu mobile (hamburger)
 */
function initMobileMenu() {
    const toggle = document.getElementById('navbar-toggle');
    const menu = document.getElementById('navbar-menu');
    const overlay = document.getElementById('navbar-overlay');
    
    if (!toggle || !menu) return;
    
    const closeMenu = () => {
        toggle.classList.remove(LayoutConfig.activeClass);
        menu.classList.remove(LayoutConfig.activeClass);
        if (overlay) overlay.classList.remove(LayoutConfig.activeClass);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
        LayoutState.menuOpen = false;
        document.body.style.overflow = '';
    };
    
    const openMenu = () => {
        toggle.classList.add(LayoutConfig.activeClass);
        menu.classList.add(LayoutConfig.activeClass);
        if (overlay) overlay.classList.add(LayoutConfig.activeClass);
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Fermer le menu');
        LayoutState.menuOpen = true;
        document.body.style.overflow = 'hidden';
    };
    
    toggle.addEventListener('click', () => {
        if (LayoutState.menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Fermer le menu si on clique sur l'overlay
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // Fermer le menu si on clique sur un lien
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && LayoutState.menuOpen) {
            closeMenu();
        }
    });
    
    // Fermer le menu si on redimensionne en desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && LayoutState.menuOpen) {
            closeMenu();
        }
    });
    
    console.log('✅ Menu mobile initialisé');
}

/**
 * Gère les dropdowns au survol (desktop)
 */
function initDropdownHover() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.navbar-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!link || !menu) return;
        
        // Desktop : hover
        if (window.innerWidth >= 768) {
            dropdown.addEventListener('mouseenter', () => {
                dropdown.classList.add('open');
                link.setAttribute('aria-expanded', 'true');
            });
            
            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('open');
                link.setAttribute('aria-expanded', 'false');
            });
        }
        
        // Mobile : click
        link.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault();
                
                const isActive = dropdown.classList.contains('open');
                
                // Fermer tous les dropdowns
                dropdowns.forEach(d => {
                    d.classList.remove('open');
                    const l = d.querySelector('.navbar-link');
                    if (l) l.setAttribute('aria-expanded', 'false');
                });
                
                // Ouvrir le dropdown cliqué
                if (!isActive) {
                    dropdown.classList.add('open');
                    link.setAttribute('aria-expanded', 'true');
                }
            }
        });
    });
    
    console.log('✅ Dropdowns initialisés');
}

/**
 * Initialise les dropdowns mobiles (méthode alternative)
 */
function initDropdownMobile() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.navbar-link');
        const chevron = dropdown.querySelector('.fa-chevron-down');
        
        if (!link || !chevron) return;
        
        // Sur mobile, le chevron sert de toggle
        chevron.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault();
                e.stopPropagation();
                
                dropdown.classList.toggle('open');
                
                const isOpen = dropdown.classList.contains('open');
                link.setAttribute('aria-expanded', String(isOpen));
            }
        });
    });
}

/**
 * Améliore l'accessibilité de la navbar
 */
function initNavbarAccessibility() {
    // Support clavier pour les dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const link = dropdown.querySelector('.navbar-link');
        
        if (!link) return;
        
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (window.innerWidth >= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            }
        });
    });
    
    // Navigation au clavier dans le menu
    const menu = document.getElementById('navbar-menu');
    if (!menu) return;
    
    menu.addEventListener('keydown', (e) => {
        const links = Array.from(menu.querySelectorAll('a[role="menuitem"]'));
        const currentIndex = links.indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < links.length - 1) {
                    links[currentIndex + 1].focus();
                } else {
                    links[0].focus();
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    links[currentIndex - 1].focus();
                } else {
                    links[links.length - 1].focus();
                }
                break;
                
            case 'Home':
                e.preventDefault();
                links[0].focus();
                break;
                
            case 'End':
                e.preventDefault();
                links[links.length - 1].focus();
                break;
        }
    });
    
    console.log('✅ Accessibilité navbar initialisée');
}

/**
 * Met en évidence le lien de navigation actif
 */
function initActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (!href) return;
        
        // Normaliser les URLs
        const linkPage = href.split('/').pop() || 'index.html';
        
        // Vérifier si le lien correspond à la page actuelle
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
            
            // Activer aussi le parent dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentLink = parentDropdown.querySelector(':scope > .navbar-link');
                if (parentLink) {
                    parentLink.classList.add('active');
                }
            }
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
    
    console.log('✅ Lien actif : ' + currentPage);
}

/* ============================================================
   5. FONCTIONNALITÉS DU FOOTER
   ============================================================ */

/**
 * Initialise toutes les fonctionnalités du footer
 */
function initFooterFunctionality() {
    initFooterNewsletter();
    initFooterYear();
}

/**
 * Gère le formulaire newsletter du footer
 */
function initFooterNewsletter() {
    const form = document.getElementById('footer-newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailInput) return;
        
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            showNewsletterMessage(form, '⚠️ Veuillez entrer un email valide', 'error');
            return;
        }
        
        // Vérifier si déjà inscrit
        const existing = localStorage.getItem('hc_drc_newsletter');
        if (existing) {
            const data = JSON.parse(existing);
            if (data.email === email) {
                showNewsletterMessage(form, '✅ Vous êtes déjà inscrit !', 'success');
                return;
            }
        }
        
        // Simuler l'inscription
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        setTimeout(() => {
            // Sauvegarder
            localStorage.setItem('hc_drc_newsletter', JSON.stringify({
                email: email,
                date: new Date().toISOString()
            }));
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Inscrit !';
            
            showNewsletterMessage(form, '🎉 Merci pour votre inscription !', 'success');
            form.reset();
            
            setTimeout(() => {
                submitBtn.innerHTML = originalHtml;
            }, 3000);
            
        }, 1500);
    });
    
    console.log('✅ Newsletter footer initialisée');
}

/**
 * Affiche un message dans le formulaire newsletter
 */
function showNewsletterMessage(form, message, type) {
    const existing = form.querySelector('.newsletter-message');
    if (existing) existing.remove();
    
    const messageEl = document.createElement('div');
    messageEl.className = 'newsletter-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        margin-top: 0.75rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.85rem;
        animation: fadeIn 0.3s ease;
        ${type === 'success' ? 'background: rgba(40, 167, 69, 0.1); color: #28A745;' : ''}
        ${type === 'error' ? 'background: rgba(220, 53, 69, 0.1); color: #DC3545;' : ''}
    `;
    
    form.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

/**
 * Met à jour l'année dynamiquement
 */
function initFooterYear() {
    const yearElements = document.querySelectorAll('.footer-copyright');
    
    yearElements.forEach(el => {
        const currentYear = new Date().getFullYear();
        el.innerHTML = el.innerHTML.replace('2024', currentYear);
    });
}

/* ============================================================
   6. FONCTIONNALITÉS GLOBALES
   ============================================================ */

/**
 * Initialise les fonctionnalités globales (loader, scroll, etc.)
 */
function initGlobalFunctionality() {
    initLoader();
    initScrollIndicator();
    initBackToTop();
    initSmoothScroll();
    initExternalLinks();
}

/**
 * Gère le loader (écran de chargement)
 */
function initLoader() {
    const loader = document.getElementById('loader-wrapper');
    if (!loader) return;
    
    const startTime = LayoutState.loaderStartTime;
    const minDuration = LayoutConfig.loaderMinDuration;
    const fadeOutDuration = LayoutConfig.loaderFadeOutDuration;
    
    const hideLoader = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDuration - elapsed);
        
        setTimeout(() => {
            loader.classList.add(LayoutConfig.hiddenClass);
            
            setTimeout(() => {
                loader.remove();
                console.log('✅ Loader masqué');
            }, fadeOutDuration);
            
        }, remaining);
    };
    
    // Masquer après le chargement complet
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
    
    // Fallback de sécurité
    setTimeout(() => {
        if (loader && loader.parentNode) {
            loader.classList.add(LayoutConfig.hiddenClass);
            setTimeout(() => loader.remove(), fadeOutDuration);
        }
    }, LayoutConfig.injectionTimeout);
    
    console.log('✅ Loader initialisé');
}

/**
 * Gère l'indicateur de scroll
 */
function initScrollIndicator() {
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;
    
    // Styles de base
    indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        width: 0%;
        background: linear-gradient(90deg, #FFD13B, #FF4500);
        z-index: 9999;
        transition: width 0.1s linear;
        border-radius: 0 4px 4px 0;
    `;
    
    window.addEventListener('scroll', updateScrollIndicator, { passive: true });
    
    console.log('✅ Scroll indicator initialisé');
}

/**
 * Met à jour la largeur de l'indicateur de scroll
 */
function updateScrollIndicator() {
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    indicator.style.width = percentage + '%';
}

/**
 * Gère le bouton retour en haut
 */
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        
        const duration = 500;
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition * (1 - eased));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    });
    
    console.log('✅ Back to top initialisé');
}

/**
 * Affiche/masque le bouton retour en haut
 */
function updateBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    if (window.pageYOffset > LayoutConfig.backToTopShowAfter) {
        backToTop.classList.add(LayoutConfig.visibleClass);
        backToTop.setAttribute('aria-hidden', 'false');
    } else {
        backToTop.classList.remove(LayoutConfig.visibleClass);
        backToTop.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Gère le défilement fluide pour les ancres
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            
            const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
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

/**
 * Configure les liens externes
 */
function initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        const url = new URL(link.href);
        
        if (url.hostname !== window.location.hostname) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    console.log('✅ Liens externes configurés');
}

/* ============================================================
   7. SÉLECTEUR DE LANGUE
   ============================================================ */

/**
 * Initialise le sélecteur de langue FR/EN
 */
function initLanguageSwitcher() {
    const languageButtons = document.querySelectorAll('.language-btn');
    
    if (languageButtons.length === 0) return;
    
    // Marquer la langue active
    languageButtons.forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        
        if (lang === LayoutState.currentLanguage) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
        
        btn.addEventListener('click', () => {
            const newLang = btn.getAttribute('data-lang');
            changeLanguage(newLang);
        });
    });
    
    console.log('✅ Sélecteur de langue initialisé : ' + LayoutState.currentLanguage);
}

/**
 * Change la langue du site
 * @param {string} lang - Code de langue ('fr' ou 'en')
 */
function changeLanguage(lang) {
    if (lang === LayoutState.currentLanguage) return;
    
    console.log('🔄 Changement de langue : ' + LayoutState.currentLanguage + ' → ' + lang);
    
    // Sauvegarder la langue
    LayoutState.currentLanguage = lang;
    localStorage.setItem('hc_drc_language', lang);
    
    // Mettre à jour l'attribut lang de la page
    document.documentElement.setAttribute('lang', lang);
    
    // Mettre à jour les boutons
    document.querySelectorAll('.language-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        
        if (btnLang === lang) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
    
    // Si le système de traduction est disponible
    if (typeof translatePage === 'function') {
        translatePage(lang);
    }
    
    // Déclencher l'événement
    document.dispatchEvent(new CustomEvent('language-changed', {
        detail: { language: lang }
    }));
}

/**
 * Masque le loader
 */
function hideLoader() {
    const loader = document.getElementById('loader-wrapper');
    if (!loader) return;
    
    loader.classList.add(LayoutConfig.hiddenClass);
    
    setTimeout(() => {
        loader.remove();
    }, LayoutConfig.loaderFadeOutDuration);
}

/* ============================================================
   8. DÉMARRAGE AUTOMATIQUE
   ============================================================ */

/**
 * Point d'entrée principal
 */
function startLayout() {
    console.log('🚀 Démarrage du layout HOPE CHILD-DRC...');
    
    // Vérifier que les conteneurs existent
    const navbarContainer = document.getElementById(LayoutConfig.navbarContainerId);
    const footerContainer = document.getElementById(LayoutConfig.footerContainerId);
    
    if (!navbarContainer) {
        console.error('❌ Conteneur navbar #' + LayoutConfig.navbarContainerId + ' introuvable');
    }
    
    if (!footerContainer) {
        console.error('❌ Conteneur footer #' + LayoutConfig.footerContainerId + ' introuvable');
    }
    
    if (!navbarContainer && !footerContainer) {
        console.error('❌ Aucun conteneur trouvé. Vérifiez que les divs #navbar-container et #footer-container existent dans votre HTML.');
        return;
    }
    
    // Démarrer l'injection
    initLayout();
}

/* ============================================================
   9. INITIALISATION AU CHARGEMENT
   ============================================================ */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLayout);
} else {
    startLayout();
}

/* ============================================================
   10. EXPORTATION GLOBALE
   ============================================================ */
window.LayoutConfig = LayoutConfig;
window.LayoutState = LayoutState;
window.injectNavbar = injectNavbar;
window.injectFooter = injectFooter;
window.initLayout = initLayout;
window.changeLanguage = changeLanguage;

/* ============================================================
   FIN DU FICHIER LAYOUT.JS
   ============================================================ */