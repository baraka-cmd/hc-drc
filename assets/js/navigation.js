/* ============================================================
   HOPE CHILD-DRC — NAVIGATION.JS
   Gestion de la Barre de Navigation
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion complète de la navbar,
                 menu mobile, dropdowns, scroll effects,
                 active links, langues, bouton don
   ============================================================ */

'use strict';

/* ============================================================
   1. CLASSE PRINCIPALE DE NAVIGATION
   ============================================================ */
class NavigationManager {
    constructor(options = {}) {
        this.options = {
            navbarSelector: '.navbar',
            menuSelector: '.navbar-menu',
            toggleSelector: '.navbar-toggle',
            dropdownSelector: '.dropdown',
            dropdownMenuSelector: '.dropdown-menu',
            linkSelector: '.navbar-link',
            activeClass: 'active',
            scrolledClass: 'scrolled',
            menuOpenClass: 'active',
            dropdownOpenClass: 'active',
            scrollThreshold: 50,
            closeOnClick: true,
            closeOnOutside: true,
            dropdownOnHover: true,
            dropdownOnClickMobile: true,
            animationDuration: 300,
            breakpoint: 768,
            ...options
        };

        this.navbar = document.querySelector(this.options.navbarSelector);
        this.menu = document.querySelector(this.options.menuSelector);
        this.toggle = document.querySelector(this.options.toggleSelector);
        this.dropdowns = document.querySelectorAll(this.options.dropdownSelector);
        this.links = document.querySelectorAll(this.options.linkSelector);
        
        this.isMenuOpen = false;
        this.isScrolled = false;
        this.lastScrollTop = 0;
        this.currentPage = this.getCurrentPage();

        this.init();
    }

    /* ========== INITIALISATION ========== */
    init() {
        if (!this.navbar) {
            console.warn('⚠️ Navbar non trouvée');
            return;
        }

        this.bindEvents();
        this.setActiveLink();
        this.initDropdowns();
        this.checkScroll();
        
        console.log('✅ Navigation initialisée');
    }

    /* ========== ÉVÉNEMENTS ========== */
    bindEvents() {
        // Toggle menu mobile
        if (this.toggle) {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Fermer le menu au clic sur un lien
        if (this.options.closeOnClick && this.menu) {
            this.menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < this.options.breakpoint) {
                        this.closeMenu();
                    }
                });
            });
        }

        // Fermer le menu au clic à l'extérieur
        if (this.options.closeOnOutside) {
            document.addEventListener('click', (e) => {
                if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                    this.closeMenu();
                }
                // Fermer les dropdowns au clic extérieur
                this.dropdowns.forEach(dropdown => {
                    if (!dropdown.contains(e.target)) {
                        this.closeDropdown(dropdown);
                    }
                });
            });
        }

        // Scroll effect
        window.addEventListener('scroll', () => {
            this.checkScroll();
        }, { passive: true });

        // Redimensionnement
        window.addEventListener('resize', () => {
            this.checkBreakpoint();
        }, { passive: true });

        // Touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
                this.dropdowns.forEach(dropdown => this.closeDropdown(dropdown));
            }
        });
    }

    /* ========== MENU MOBILE ========== */
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        this.menu?.classList.add(this.options.menuOpenClass);
        this.toggle?.classList.add(this.options.menuOpenClass);
        this.toggle?.setAttribute('aria-expanded', 'true');
        this.toggle?.setAttribute('aria-label', 'Fermer le menu');
        
        // Bloquer le scroll du body
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée des liens
        this.animateMenuLinks(true);
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.menu?.classList.remove(this.options.menuOpenClass);
        this.toggle?.classList.remove(this.options.menuOpenClass);
        this.toggle?.setAttribute('aria-expanded', 'false');
        this.toggle?.setAttribute('aria-label', 'Ouvrir le menu');
        
        // Restaurer le scroll du body
        document.body.style.overflow = '';
        
        // Fermer les dropdowns ouverts
        this.dropdowns.forEach(dropdown => this.closeDropdown(dropdown));
    }

    animateMenuLinks(show) {
        const links = this.menu?.querySelectorAll('.navbar-item');
        if (!links) return;

        links.forEach((link, index) => {
            if (show) {
                link.style.opacity = '0';
                link.style.transform = 'translateX(-20px)';
                link.style.transition = `all ${this.options.animationDuration}ms ease ${index * 50}ms`;
                
                requestAnimationFrame(() => {
                    link.style.opacity = '1';
                    link.style.transform = 'translateX(0)';
                });
            } else {
                link.style.opacity = '';
                link.style.transform = '';
                link.style.transition = '';
            }
        });
    }

    /* ========== DROPDOWNS ========== */
    initDropdowns() {
        this.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.navbar-link');
            const menu = dropdown.querySelector(this.options.dropdownMenuSelector);
            
            if (!toggle || !menu) return;

            if (this.options.dropdownOnHover && window.innerWidth >= this.options.breakpoint) {
                // Desktop : hover
                dropdown.addEventListener('mouseenter', () => {
                    this.openDropdown(dropdown);
                });

                dropdown.addEventListener('mouseleave', () => {
                    this.closeDropdown(dropdown);
                });
            }

            if (window.innerWidth < this.options.breakpoint) {
                // Mobile : clic
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isOpen = dropdown.classList.contains(this.options.dropdownOpenClass);
                    
                    // Fermer tous les dropdowns
                    this.dropdowns.forEach(d => this.closeDropdown(d));
                    
                    // Ouvrir/fermer le dropdown cliqué
                    if (!isOpen) {
                        this.openDropdown(dropdown);
                    }
                });
            }

            // Sous-dropdowns
            dropdown.querySelectorAll('.dropdown-submenu').forEach(submenu => {
                const subToggle = submenu.querySelector('.dropdown-item');
                const subMenu = submenu.querySelector(this.options.dropdownMenuSelector);
                
                if (subToggle && subMenu) {
                    subToggle.addEventListener('click', (e) => {
                        if (window.innerWidth < this.options.breakpoint) {
                            e.preventDefault();
                            e.stopPropagation();
                            submenu.classList.toggle(this.options.dropdownOpenClass);
                        }
                    });
                }
            });
        });
    }

    openDropdown(dropdown) {
        dropdown.classList.add(this.options.dropdownOpenClass);
        const toggle = dropdown.querySelector('.navbar-link');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove(this.options.dropdownOpenClass);
        const toggle = dropdown.querySelector('.navbar-link');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    /* ========== SCROLL EFFECT ========== */
    checkScroll() {
        const scrollTop = window.scrollY || window.pageYOffset;
        
        // Vérifier si on a dépassé le seuil
        if (scrollTop > this.options.scrollThreshold) {
            if (!this.isScrolled) {
                this.isScrolled = true;
                this.navbar.classList.add(this.options.scrolledClass);
                this.onScrolled();
            }
        } else {
            if (this.isScrolled) {
                this.isScrolled = false;
                this.navbar.classList.remove(this.options.scrolledClass);
                this.onUnscrolled();
            }
        }
        
        // Mettre à jour le dernier scroll
        this.lastScrollTop = scrollTop;
    }

    onScrolled() {
        // Hook pour les effets au scroll
        document.dispatchEvent(new CustomEvent('navbarScrolled', {
            detail: { scrolled: true }
        }));
    }

    onUnscrolled() {
        // Hook pour les effets au scroll
        document.dispatchEvent(new CustomEvent('navbarScrolled', {
            detail: { scrolled: false }
        }));
    }

    /* ========== LIEN ACTIF ========== */
    getCurrentPage() {
        const path = window.location.pathname;
        let filename = path.split('/').pop() || 'index.html';
        
        // Si pas de fichier, c'est la page d'accueil
        if (filename === '' || filename === '/') {
            filename = 'index.html';
        }
        
        return filename;
    }

    setActiveLink() {
        if (!this.menu) return;

        this.menu.querySelectorAll('.navbar-link').forEach(link => {
            const href = link.getAttribute('href');
            
            if (!href || href === '#') return;
            
            // Vérifier si le lien correspond à la page actuelle
            const linkFile = href.split('/').pop().split('?')[0];
            
            if (linkFile === this.currentPage) {
                link.classList.add(this.options.activeClass);
            } else if (this.currentPage === 'index.html' && linkFile === 'index.html') {
                link.classList.add(this.options.activeClass);
            }
        });
    }

    /* ========== BREAKPOINT ========== */
    checkBreakpoint() {
        const isMobile = window.innerWidth < this.options.breakpoint;
        
        if (isMobile && this.isMenuOpen) {
            // Garder le menu ouvert en mobile
        } else if (!isMobile && this.isMenuOpen) {
            // Fermer le menu en passant en desktop
            this.closeMenu();
        }
        
        // Réinitialiser les dropdowns
        this.initDropdowns();
    }

    /* ========== MÉTHODES PUBLIQUES ========== */
    getNavbar() {
        return this.navbar;
    }

    getMenu() {
        return this.menu;
    }

    isMenuOpened() {
        return this.isMenuOpen;
    }

    isNavbarScrolled() {
        return this.isScrolled;
    }
}

/* ============================================================
   2. GESTION DU BOUTON DON (ANIMATION SPECIALE)
   ============================================================ */
class DonateButtonManager {
    constructor(selector = '.navbar-donate') {
        this.button = document.querySelector(selector);
        this.init();
    }

    init() {
        if (!this.button) return;
        
        // Effet au survol
        this.button.addEventListener('mouseenter', () => {
            this.button.style.animation = 'none';
            this.button.style.transform = 'scale(1.05)';
        });

        this.button.addEventListener('mouseleave', () => {
            this.button.style.animation = '';
            this.button.style.transform = '';
        });

        // Effet au clic
        this.button.addEventListener('click', (e) => {
            // Petit effet de pulsation
            this.button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.button.style.transform = '';
            }, 200);
        });
    }
}

/* ============================================================
   3. GESTION DU DROPDOWN LANGUE
   ============================================================ */
class LanguageDropdownManager {
    constructor(selector = '.language-switcher') {
        this.container = document.querySelector(selector);
        this.translator = window.translator || null;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.bindEvents();
        this.updateActiveState();
        
        // Observer les changements de langue
        if (this.translator) {
            this.translator.addObserver(() => {
                this.updateActiveState();
            });
        }
    }

    bindEvents() {
        this.container.querySelectorAll('.language-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-language');
                
                // Mettre à jour la langue via le traducteur
                if (this.translator) {
                    this.translator.setLanguage(lang);
                } else if (window.setLanguage) {
                    window.setLanguage(lang);
                }
                
                this.updateActiveState();
            });
        });
    }

    updateActiveState() {
        const currentLang = this.translator?.getLanguage() || window.getCurrentLanguage?.() || 'fr';
        
        this.container.querySelectorAll('.language-btn').forEach(btn => {
            const lang = btn.getAttribute('data-language');
            
            if (lang === currentLang) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }
}

/* ============================================================
   4. SCROLL INDICATOR (Barre de progression du scroll)
   ============================================================ */
class ScrollIndicatorManager {
    constructor(options = {}) {
        this.options = {
            selector: '.scroll-indicator',
            color: '#FFD13B',
            height: '4px',
            showAfter: 100,
            ...options
        };

        this.indicator = document.querySelector(this.options.selector);
        this.init();
    }

    init() {
        if (!this.indicator) {
            // Créer l'indicateur s'il n'existe pas
            this.createIndicator();
        }

        this.styleIndicator();
        this.bindEvents();
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'scroll-indicator';
        document.body.appendChild(this.indicator);
    }

    styleIndicator() {
        if (!this.indicator) return;
        
        Object.assign(this.indicator.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '0%',
            height: this.options.height,
            background: this.options.color,
            zIndex: '10000',
            transition: 'width 0.1s linear'
        });
    }

    bindEvents() {
        window.addEventListener('scroll', () => {
            this.updateProgress();
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.updateProgress();
        }, { passive: true });
    }

    updateProgress() {
        if (!this.indicator) return;
        
        const scrollTop = window.scrollY || window.pageYOffset;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        
        this.indicator.style.width = `${progress}%`;
    }
}

/* ============================================================
   5. GESTION DU MENU STICKY (Cache/Show au scroll)
   ============================================================ */
class StickyMenuManager {
    constructor(options = {}) {
        this.options = {
            navbarSelector: '.navbar',
            hideOnScrollDown: true,
            showOnScrollUp: true,
            hideOffset: 100,
            showOffset: 50,
            hideDuration: 300,
            ...options
        };

        this.navbar = document.querySelector(this.options.navbarSelector);
        this.lastScrollTop = 0;
        this.isHidden = false;
        this.init();
    }

    init() {
        if (!this.navbar) return;
        if (!this.options.hideOnScrollDown && !this.options.showOnScrollUp) return;
        
        window.addEventListener('scroll', () => {
            this.checkScroll();
        }, { passive: true });
    }

    checkScroll() {
        const scrollTop = window.scrollY || window.pageYOffset;
        
        if (scrollTop > this.lastScrollTop && scrollTop > this.options.hideOffset) {
            // Scroll vers le bas - cacher
            if (!this.isHidden && this.options.hideOnScrollDown) {
                this.hide();
            }
        } else if (scrollTop < this.lastScrollTop || scrollTop < this.options.showOffset) {
            // Scroll vers le haut - montrer
            if (this.isHidden && this.options.showOnScrollUp) {
                this.show();
            }
        }
        
        this.lastScrollTop = scrollTop;
    }

    hide() {
        this.isHidden = true;
        this.navbar.style.transform = `translateY(-100%)`;
        this.navbar.style.transition = `transform ${this.options.hideDuration}ms ease`;
    }

    show() {
        this.isHidden = false;
        this.navbar.style.transform = `translateY(0)`;
        this.navbar.style.transition = `transform ${this.options.hideDuration}ms ease`;
    }
}

/* ============================================================
   6. EXPORTATION GLOBALE
   ============================================================ */
window.NavigationManager = NavigationManager;
window.DonateButtonManager = DonateButtonManager;
window.LanguageDropdownManager = LanguageDropdownManager;
window.ScrollIndicatorManager = ScrollIndicatorManager;
window.StickyMenuManager = StickyMenuManager;

/* ============================================================
   7. INITIALISATION AUTOMATIQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialiser la navigation
        const navigation = new NavigationManager();
        
        // Initialiser le bouton don
        const donateButton = new DonateButtonManager();
        
        // Initialiser le dropdown langue
        const languageDropdown = new LanguageDropdownManager();
        
        // Initialiser l'indicateur de scroll
        const scrollIndicator = new ScrollIndicatorManager();
        
        // Initialiser le menu sticky
        const stickyMenu = new StickyMenuManager({
            hideOnScrollDown: false,
            showOnScrollUp: true
        });
        
        // Exposer les instances globalement
        window.navigation = navigation;
        window.donateButton = donateButton;
        window.languageDropdown = languageDropdown;
        window.scrollIndicator = scrollIndicator;
        window.stickyMenu = stickyMenu;
        
        console.log('✅ Navigation initialisée avec succès');
        console.log(`📄 Page actuelle : ${navigation.currentPage}`);
        console.log(`📱 Mode : ${window.innerWidth < 768 ? 'Mobile' : 'Desktop'}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la navigation :', error);
    }
});

/* ============================================================
   FIN DU FICHIER NAVIGATION.JS
   ============================================================ */