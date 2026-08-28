/* ============================================================
   HOPE CHILD-DRC — EQUIPE.JS
   Scripts Spécifiques de la Page Notre Équipe
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion des cartes membres, animations,
                 filtres éventuels, interactions de la page
                 Équipe, hover effects, scroll reveal
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION EQUIPE
   ============================================================ */
const EquipeConfig = {
    /* Animations */
    animations: {
        staggerDelay: 150,
        revealDuration: 700,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    },

    /* Cartes membres */
    cards: {
        hoverEffect: true,
        tiltEffect: false,
        photoZoom: true
    },

    /* Filtres d'équipe (si activés plus tard) */
    filters: {
        enabled: false,
        defaultCategory: 'all'
    }
};

/* ============================================================
   2. ÉTAT EQUIPE
   ============================================================ */
const EquipeState = {
    initialized: false,
    animationsInitialized: false,
    hoverEffectsBound: false,
    currentFilter: 'all'
};

/* ============================================================
   3. CLASSE PRINCIPALE EQUIPE
   ============================================================ */
class EquipePage {
    constructor() {
        this.memberCards = [];
        this.boardCards = [];
        this.commissionCards = [];
        this.coordinationCard = null;
        this.volunteersCard = null;
        this.joinCtaCard = null;
        
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
            if (!EquipeState.initialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.memberCards = Array.from(document.querySelectorAll('.team-member-card'));
        this.boardCards = Array.from(document.querySelectorAll('.board-card'));
        this.commissionCards = Array.from(document.querySelectorAll('.commission-card'));
        this.coordinationCard = document.querySelector('.coordination-card');
        this.volunteersCard = document.querySelector('.volunteers-card');
        this.joinCtaCard = document.querySelector('.join-cta-card');
        
        // Initialiser les modules
        this.initScrollReveal();
        this.initCardAnimations();
        this.initHoverEffects();
        this.initCoordinationCard();
        this.initSmoothScroll();
        
        EquipeState.initialized = true;
        EquipeState.animationsInitialized = true;
        
        console.log('✅ Page Notre Équipe initialisée');
    }

    /* ============================================================
       4. SCROLL REVEAL GÉNÉRAL
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
            threshold: EquipeConfig.animations.threshold,
            rootMargin: EquipeConfig.animations.rootMargin
        });
        
        elements.forEach(element => {
            const animation = element.getAttribute('data-aos');
            
            element.style.transition = `all ${EquipeConfig.animations.revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '0';
            
            switch (animation) {
                case 'fade-up':
                    element.style.transform = 'translateY(40px)';
                    break;
                case 'fade-down':
                    element.style.transform = 'translateY(-40px)';
                    break;
                case 'fade-left':
                    element.style.transform = 'translateX(-40px)';
                    break;
                case 'fade-right':
                    element.style.transform = 'translateX(40px)';
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
       5. ANIMATIONS DES CARTES MEMBRES
       ============================================================ */
    initCardAnimations() {
        // Animation des cartes membres d'équipe
        this.memberCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * EquipeConfig.animations.staggerDelay);
                        
                        observer.unobserve(card);
                    }
                });
            }, {
                threshold: 0.2
            });
            
            observer.observe(card);
        });
        
        // Animation des cartes du conseil d'administration
        this.boardCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, index * 100);
                        
                        observer.unobserve(card);
                    }
                });
            }, {
                threshold: 0.2
            });
            
            observer.observe(card);
        });
        
        // Animation des cartes de la commission
        this.commissionCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 150);
                        
                        observer.unobserve(card);
                    }
                });
            }, {
                threshold: 0.2
            });
            
            observer.observe(card);
        });
        
        console.log('✅ Animations des cartes initialisées');
    }

    /* ============================================================
       6. EFFETS DE SURVOL
       ============================================================ */
    initHoverEffects() {
        if (!EquipeConfig.cards.hoverEffect) return;
        
        // Survol des cartes membres
        this.memberCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const photo = card.querySelector('.team-member-photo img');
                if (photo && EquipeConfig.cards.photoZoom) {
                    photo.style.transform = 'scale(1.08)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const photo = card.querySelector('.team-member-photo img');
                if (photo) {
                    photo.style.transform = 'scale(1)';
                }
            });
        });
        
        // Survol des cartes du conseil
        this.boardCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const photo = card.querySelector('.board-photo');
                if (photo) {
                    photo.style.transform = 'scale(1.08)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const photo = card.querySelector('.board-photo');
                if (photo) {
                    photo.style.transform = 'scale(1)';
                }
            });
        });
        
        // Survol des cartes de la commission
        this.commissionCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const photo = card.querySelector('.commission-photo');
                if (photo) {
                    photo.style.transform = 'scale(1.08)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const photo = card.querySelector('.commission-photo');
                if (photo) {
                    photo.style.transform = 'scale(1)';
                }
            });
        });
        
        EquipeState.hoverEffectsBound = true;
        console.log('✅ Effets de survol initialisés');
    }

    /* ============================================================
       7. CARTE COORDINATION
       ============================================================ */
    initCoordinationCard() {
        if (!this.coordinationCard) return;
        
        // Animation d'entrée
        this.coordinationCard.style.opacity = '0';
        this.coordinationCard.style.transform = 'translateY(40px)';
        this.coordinationCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        this.coordinationCard.style.opacity = '1';
                        this.coordinationCard.style.transform = 'translateY(0)';
                    }, 200);
                    
                    observer.unobserve(this.coordinationCard);
                }
            });
        }, {
            threshold: 0.3
        });
        
        observer.observe(this.coordinationCard);
        
        console.log('✅ Carte coordination initialisée');
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
       10. FILTRE D'ÉQUIPE (Fonctionnalité future)
       ============================================================ */

    /**
     * Filtre les membres d'équipe par catégorie
     * @param {string} category - Catégorie à filtrer
     */
    filterTeam(category) {
        if (!EquipeConfig.filters.enabled) return;
        
        EquipeState.currentFilter = category;
        
        this.memberCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category') || 'all';
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = '';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        console.log('🔍 Filtre équipe : ' + category);
    }

    /* ============================================================
       11. COMPTEUR DE MEMBRES
       ============================================================ */
    countTeamMembers() {
        const totalMembers = this.memberCards.length + this.boardCards.length + this.commissionCards.length;
        const totalPhotos = document.querySelectorAll('.team-member-photo img, .board-photo img, .commission-photo img').length;
        
        console.log('📊 Équipe : ' + totalMembers + ' membres');
        console.log('📷 Photos : ' + totalPhotos + ' photos ajoutées');
        
        return {
            totalMembers: totalMembers,
            totalPhotos: totalPhotos
        };
    }

    /* ============================================================
       12. MÉTHODES PUBLIQUES
       ============================================================ */
    reinitialize() {
        this.setup();
    }

    getMemberCount() {
        return this.countTeamMembers();
    }

    destroy() {
        EquipeState.initialized = false;
        EquipeState.animationsInitialized = false;
        EquipeState.hoverEffectsBound = false;
        console.log('🗑️ Page Notre Équipe détruite');
    }
}

/* ============================================================
   13. DÉMARRAGE
   ============================================================ */
let equipePageInstance = null;

function initEquipePage() {
    if (!equipePageInstance) {
        equipePageInstance = new EquipePage();
        equipePageInstance.animateHeroOnLoad();
    }
    return equipePageInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initEquipePage();
    });
} else {
    initEquipePage();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!EquipeState.initialized) {
        initEquipePage();
    }
});

/* ============================================================
   14. EXPORTATION GLOBALE
   ============================================================ */
window.EquipePage = EquipePage;
window.EquipeConfig = EquipeConfig;
window.EquipeState = EquipeState;
window.equipePageInstance = equipePageInstance;
window.initEquipePage = initEquipePage;

/* ============================================================
   FIN DU FICHIER EQUIPE.JS
   ============================================================ */