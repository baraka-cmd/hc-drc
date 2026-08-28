/* ============================================================
   HOPE CHILD-DRC — NAVBAR.JS
   Fonctionnalités de la Barre de Navigation
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la navbar,
                 menu mobile, dropdowns, scroll effect,
                 scroll indicator, sélecteur de langue
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION NAVBAR
   ============================================================ */
const NavbarConfig = {
    breakpoint: 768,
    scrollThreshold: 50,
    closeOnClick: true,
    closeOnOutside: true,
    closeOnEscape: true,
    dropdownHover: true,
    animationDuration: 300,
    activeClass: 'active',
    scrolledClass: 'scrolled',
    menuOpenClass: 'active',
    openClass: 'open'
};

/* ============================================================
   2. ÉTAT NAVBAR
   ============================================================ */
const NavbarState = {
    menuOpen: false,
    activeDropdown: null,
    isScrolled: false,
    currentLanguage: localStorage.getItem('hc_drc_language') || 'fr',
    initialized: false
};

/* ============================================================
   3. CLASSE NAVBAR
   ============================================================ */
class Navbar {
    constructor() {
        this.navbar = null;
        this.menu = null;
        this.toggle = null;
        this.overlay = null;
        this.dropdowns = [];
        this.links = [];
        this.languageButtons = [];
        
        this.init();
    }

    /* ========== INITIALISATION ========== */
    init() {
        // Attendre que la navbar soit injectée
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        // Attendre l'événement layout-ready si nécessaire
        document.addEventListener('layout-ready', () => {
            if (!NavbarState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.navbar = document.getElementById('navbar');
        this.menu = document.getElementById('navbar-menu');
        this.toggle = document.getElementById('navbar-toggle');
        this.overlay = document.getElementById('navbar-overlay');
        this.dropdowns = Array.from(document.querySelectorAll('.dropdown'));
        this.links = Array.from(document.querySelectorAll('.navbar-link'));
        this.languageButtons = Array.from(document.querySelectorAll('.language-btn'));
        
        if (!this.navbar) {
            console.warn('⚠️ Navbar introuvable');
            return;
        }
        
        // Initialiser les fonctionnalités
        this.initScrollEffect();
        this.initMobileMenu();
        this.initDropdowns();
        this.initLanguageSwitcher();
        this.initActiveLink();
        this.initKeyboardNavigation();
        this.initResizeHandler();
        
        NavbarState.initialized = true;
        console.log('✅ Navbar initialisée');
    }

    /* ========== EFFET DE SCROLL ========== */
    initScrollEffect() {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            
            if (scrollTop > NavbarConfig.scrollThreshold) {
                if (!NavbarState.isScrolled) {
                    this.navbar.classList.add(NavbarConfig.scrolledClass);
                    NavbarState.isScrolled = true;
                }
            } else {
                if (NavbarState.isScrolled) {
                    this.navbar.classList.remove(NavbarConfig.scrolledClass);
                    NavbarState.isScrolled = false;
                }
            }
        }, { passive: true });
        
        // Vérification initiale
        if (window.pageYOffset > NavbarConfig.scrollThreshold) {
            this.navbar.classList.add(NavbarConfig.scrolledClass);
            NavbarState.isScrolled = true;
        }
    }

    /* ========== MENU MOBILE ========== */
    initMobileMenu() {
        if (!this.toggle || !this.menu) return;
        
        const openMenu = () => {
            this.toggle.classList.add(NavbarConfig.activeClass);
            this.menu.classList.add(NavbarConfig.menuOpenClass);
            if (this.overlay) this.overlay.classList.add(NavbarConfig.activeClass);
            this.toggle.setAttribute('aria-expanded', 'true');
            this.toggle.setAttribute('aria-label', 'Fermer le menu');
            NavbarState.menuOpen = true;
            document.body.style.overflow = 'hidden';
        };
        
        const closeMenu = () => {
            this.toggle.classList.remove(NavbarConfig.activeClass);
            this.menu.classList.remove(NavbarConfig.menuOpenClass);
            if (this.overlay) this.overlay.classList.remove(NavbarConfig.activeClass);
            this.toggle.setAttribute('aria-expanded', 'false');
            this.toggle.setAttribute('aria-label', 'Ouvrir le menu');
            NavbarState.menuOpen = false;
            document.body.style.overflow = '';
            
            // Fermer les dropdowns ouverts
            this.closeAllDropdowns();
        };
        
        const toggleMenu = () => {
            if (NavbarState.menuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        };
        
        // Clic sur le hamburger
        this.toggle.addEventListener('click', toggleMenu);
        
        // Clic sur l'overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', closeMenu);
        }
        
        // Clic sur un lien (fermer le menu)
        if (NavbarConfig.closeOnClick) {
            this.links.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < NavbarConfig.breakpoint) {
                        closeMenu();
                    }
                });
            });
        }
        
        // Touche Escape
        if (NavbarConfig.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && NavbarState.menuOpen) {
                    closeMenu();
                }
            });
        }
        
        // Clic en dehors
        if (NavbarConfig.closeOnOutside) {
            document.addEventListener('click', (e) => {
                if (NavbarState.menuOpen && 
                    !this.menu.contains(e.target) && 
                    !this.toggle.contains(e.target)) {
                    closeMenu();
                }
            });
        }
    }

    /* ========== DROPDOWNS ========== */
    initDropdowns() {
        this.dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector(':scope > .navbar-link');
            const menu = dropdown.querySelector(':scope > .dropdown-menu');
            
            if (!link || !menu) return;
            
            // Desktop : hover
            if (NavbarConfig.dropdownHover && window.innerWidth >= NavbarConfig.breakpoint) {
                dropdown.addEventListener('mouseenter', () => {
                    this.closeAllDropdowns();
                    dropdown.classList.add(NavbarConfig.openClass);
                    link.setAttribute('aria-expanded', 'true');
                });
                
                dropdown.addEventListener('mouseleave', () => {
                    dropdown.classList.remove(NavbarConfig.openClass);
                    link.setAttribute('aria-expanded', 'false');
                });
            }
            
            // Mobile : clic sur le chevron ou le lien
            link.addEventListener('click', (e) => {
                if (window.innerWidth < NavbarConfig.breakpoint) {
                    const hasDropdown = dropdown.querySelector('.dropdown-menu');
                    
                    if (hasDropdown) {
                        e.preventDefault();
                        
                        const isOpen = dropdown.classList.contains(NavbarConfig.openClass);
                        
                        this.closeAllDropdowns();
                        
                        if (!isOpen) {
                            dropdown.classList.add(NavbarConfig.openClass);
                            link.setAttribute('aria-expanded', 'true');
                            NavbarState.activeDropdown = dropdown;
                        } else {
                            link.setAttribute('aria-expanded', 'false');
                            NavbarState.activeDropdown = null;
                        }
                    }
                }
            });
        });
    }

    closeAllDropdowns() {
        this.dropdowns.forEach(dropdown => {
            dropdown.classList.remove(NavbarConfig.openClass);
            const link = dropdown.querySelector(':scope > .navbar-link');
            if (link) link.setAttribute('aria-expanded', 'false');
        });
        NavbarState.activeDropdown = null;
    }

    /* ========== SÉLECTEUR DE LANGUE ========== */
    initLanguageSwitcher() {
        this.languageButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            
            // Marquer la langue active
            if (lang === NavbarState.currentLanguage) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }
            
            btn.addEventListener('click', () => {
                const newLang = btn.getAttribute('data-lang');
                
                if (newLang !== NavbarState.currentLanguage) {
                    NavbarState.currentLanguage = newLang;
                    localStorage.setItem('hc_drc_language', newLang);
                    
                    // Mettre à jour les boutons
                    this.languageButtons.forEach(b => {
                        if (b.getAttribute('data-lang') === newLang) {
                            b.classList.add('active');
                            b.setAttribute('aria-pressed', 'true');
                        } else {
                            b.classList.remove('active');
                            b.setAttribute('aria-pressed', 'false');
                        }
                    });
                    
                    // Mettre à jour l'attribut lang
                    document.documentElement.setAttribute('lang', newLang);
                    
                    // Appeler la fonction de traduction
                    if (typeof translatePage === 'function') {
                        translatePage(newLang);
                    }
                    
                    // Déclencher l'événement
                    document.dispatchEvent(new CustomEvent('language-changed', {
                        detail: { language: newLang }
                    }));
                    
                    console.log('🌐 Langue changée : ' + newLang);
                }
            });
        });
    }

    /* ========== LIEN ACTIF ========== */
    initActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const linkPage = href.split('/').pop() || 'index.html';
            
            if (linkPage === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
                
                // Activer le dropdown parent
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const parentLink = parentDropdown.querySelector(':scope > .navbar-link');
                    if (parentLink) parentLink.classList.add('active');
                }
            }
        });
    }

    /* ========== NAVIGATION CLAVIER ========== */
    initKeyboardNavigation() {
        if (!this.menu) return;
        
        this.menu.addEventListener('keydown', (e) => {
            const focusableLinks = Array.from(
                this.menu.querySelectorAll('a[role="menuitem"], .navbar-link, .dropdown-item')
            );
            const currentIndex = focusableLinks.indexOf(document.activeElement);
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < focusableLinks.length - 1) {
                        focusableLinks[currentIndex + 1].focus();
                    } else {
                        focusableLinks[0].focus();
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        focusableLinks[currentIndex - 1].focus();
                    } else {
                        focusableLinks[focusableLinks.length - 1].focus();
                    }
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    focusableLinks[0].focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    focusableLinks[focusableLinks.length - 1].focus();
                    break;
                    
                case 'Tab':
                    if (NavbarState.menuOpen && window.innerWidth < NavbarConfig.breakpoint) {
                        const firstLink = focusableLinks[0];
                        const lastLink = focusableLinks[focusableLinks.length - 1];
                        
                        if (e.shiftKey && document.activeElement === firstLink) {
                            e.preventDefault();
                            lastLink.focus();
                        } else if (!e.shiftKey && document.activeElement === lastLink) {
                            e.preventDefault();
                            firstLink.focus();
                        }
                    }
                    break;
            }
        });
    }

    /* ========== GESTION DU REDIMENSIONNEMENT ========== */
    initResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            
            resizeTimeout = setTimeout(() => {
                // Fermer le menu mobile si on passe en desktop
                if (window.innerWidth >= NavbarConfig.breakpoint) {
                    if (NavbarState.menuOpen) {
                        this.toggle?.classList.remove(NavbarConfig.activeClass);
                        this.menu?.classList.remove(NavbarConfig.menuOpenClass);
                        this.overlay?.classList.remove(NavbarConfig.activeClass);
                        NavbarState.menuOpen = false;
                        document.body.style.overflow = '';
                    }
                    
                    this.closeAllDropdowns();
                }
            }, 250);
        });
    }

    /* ========== MÉTHODES PUBLIQUES ========== */
    openMenu() {
        if (this.toggle) this.toggle.click();
    }

    closeMenu() {
        if (NavbarState.menuOpen) {
            this.toggle?.classList.remove(NavbarConfig.activeClass);
            this.menu?.classList.remove(NavbarConfig.menuOpenClass);
            this.overlay?.classList.remove(NavbarConfig.activeClass);
            NavbarState.menuOpen = false;
            document.body.style.overflow = '';
        }
    }

    toggleMenu() {
        if (this.toggle) this.toggle.click();
    }

    destroy() {
        NavbarState.initialized = false;
        console.log('🗑️ Navbar détruite');
    }
}

/* ============================================================
   4. INITIALISATION AUTOMATIQUE
   ============================================================ */
let navbarInstance = null;

function initNavbar() {
    if (!navbarInstance) {
        navbarInstance = new Navbar();
    }
    return navbarInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!NavbarState.initialized) {
        initNavbar();
    }
});

/* ============================================================
   5. EXPORTATION GLOBALE
   ============================================================ */
window.Navbar = Navbar;
window.NavbarConfig = NavbarConfig;
window.NavbarState = NavbarState;
window.navbarInstance = navbarInstance;
window.initNavbar = initNavbar;

/* ============================================================
   FIN DU FICHIER NAVBAR.JS
   ============================================================ */