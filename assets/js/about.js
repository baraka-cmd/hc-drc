/* ============================================================
   HOPE CHILD-DRC — ABOUT.JS
   Scripts Spécifiques de la Page À Propos
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Gestion de la timeline, des animations,
                 des cartes mission/vision, des valeurs,
                 et des interactions de la page À Propos
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION ABOUT
   ============================================================ */
const AboutConfig = {
    /* Timeline */
    timeline: {
        animateOnScroll: true,
        staggerDelay: 200,
        revealDistance: '40px'
    },

    /* Animations */
    animations: {
        staggerDelay: 150,
        revealDuration: 800,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    },

    /* Compteurs de la section chiffres */
    stats: {
        animateOnScroll: true,
        duration: 1500,
        threshold: 0.3
    },

    /* Cartes Mission & Vision */
    cards: {
        hoverEffect: true,
        tiltEffect: false
    }
};

/* ============================================================
   2. ÉTAT ABOUT
   ============================================================ */
const AboutState = {
    timelineInitialized: false,
    timelineItemsAnimated: false,
    animationsInitialized: false,
    statsAnimated: false,
    hoverEffectsBound: false
};

/* ============================================================
   3. CLASSE PRINCIPALE ABOUT
   ============================================================ */
class AboutPage {
    constructor() {
        this.timelineItems = [];
        this.timeline = null;
        this.valueCards = [];
        this.missionCard = null;
        this.visionCard = null;
        this.statItems = [];
        
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
            if (!AboutState.timelineInitialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.timeline = document.getElementById('history-timeline');
        this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        this.valueCards = Array.from(document.querySelectorAll('.value-card'));
        this.missionCard = document.querySelector('.mission-card');
        this.visionCard = document.querySelector('.vision-card');
        this.statItems = Array.from(document.querySelectorAll('.about-stat-item'));
        
        // Initialiser les modules
        this.initTimelineAnimations();
        this.initScrollReveal();
        this.initValueCards();
        this.initStatHover();
        this.initCardHoverEffects();
        this.initSmoothScroll();
        
        AboutState.timelineInitialized = true;
        AboutState.animationsInitialized = true;
        
        console.log('✅ Page À Propos initialisée');
    }

    /* ============================================================
       4. ANIMATIONS DE LA TIMELINE
       ============================================================ */
    initTimelineAnimations() {
        if (this.timelineItems.length === 0) return;
        
        // Ajouter les classes d'animation initiales
        this.timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = index % 2 === 0 ? 'translateX(-40px)' : 'translateX(40px)';
            item.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            item.style.transitionDelay = '0s';
        });
        
        // Observer pour déclencher les animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const index = this.timelineItems.indexOf(item);
                    
                    // Délai en cascade
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, index * AboutConfig.timeline.staggerDelay);
                    
                    observer.unobserve(item);
                }
            });
        }, {
            threshold: AboutConfig.timeline.animateOnScroll ? 0.2 : 0,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.timelineItems.forEach(item => {
            observer.observe(item);
        });
        
        AboutState.timelineItemsAnimated = true;
        console.log('✅ Timeline animée initialisée');
    }

    /* ============================================================
       5. SCROLL REVEAL GÉNÉRAL
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
            threshold: AboutConfig.animations.threshold,
            rootMargin: AboutConfig.animations.rootMargin
        });
        
        elements.forEach(element => {
            // Styles initiaux selon le type d'animation
            const animation = element.getAttribute('data-aos');
            
            element.style.transition = `all ${AboutConfig.animations.revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
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
                case 'zoom-out':
                    element.style.transform = 'scale(1.15)';
                    break;
                default:
                    element.style.transform = 'translateY(40px)';
            }
            
            observer.observe(element);
        });
        
        console.log('✅ Scroll reveal initialisé');
    }

    /* ============================================================
       6. CARTES DE VALEURS
       ============================================================ */
    initValueCards() {
        if (this.valueCards.length === 0) return;
        
        this.valueCards.forEach((card, index) => {
            // Animation d'entrée
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * AboutConfig.animations.staggerDelay);
                        
                        observer.unobserve(card);
                    }
                });
            }, {
                threshold: 0.2
            });
            
            observer.observe(card);
            
            // Effet de survol
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.value-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.15) rotate(8deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.value-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
        
        console.log('✅ Cartes de valeurs initialisées');
    }

    /* ============================================================
       7. SURVOL DES STATISTIQUES
       ============================================================ */
    initStatHover() {
        if (this.statItems.length === 0) return;
        
        this.statItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('.about-stat-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.15)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('.about-stat-icon');
                if (icon) {
                    icon.style.transform = 'scale(1)';
                }
            });
        });
        
        console.log('✅ Survol des statistiques initialisé');
    }

    /* ============================================================
       8. EFFETS DE SURVOL DES CARTES MISSION/VISION
       ============================================================ */
    initCardHoverEffects() {
        if (!AboutConfig.cards.hoverEffect) return;
        
        const cards = [this.missionCard, this.visionCard].filter(Boolean);
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.mission-card-icon, .vision-card-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
                
                const line = card.querySelector('.mission-card-line, .vision-card-line');
                if (line) {
                    line.style.width = '100px';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.mission-card-icon, .vision-card-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
                
                const line = card.querySelector('.mission-card-line, .vision-card-line');
                if (line) {
                    line.style.width = '50px';
                }
            });
        });
        
        console.log('✅ Effets de survol des cartes initialisés');
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
       10. ANIMATION DU HERO AU CHARGEMENT
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
       11. MÉTHODES PUBLIQUES
       ============================================================ */
    reinitialize() {
        this.setup();
    }

    destroy() {
        AboutState.timelineInitialized = false;
        AboutState.animationsInitialized = false;
        console.log('🗑️ Page À Propos détruite');
    }
}

/* ============================================================
   12. INITIALISATION DES DONNÉES TIMELINE
   ============================================================ */

/**
 * Ajoute des événements à la timeline dynamiquement
 * @param {Array} events - Liste des événements
 */
function populateTimeline(events) {
    const timeline = document.getElementById('history-timeline');
    if (!timeline) return;
    
    events.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = `timeline-item ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'}`;
        item.setAttribute('data-aos', index % 2 === 0 ? 'fade-right' : 'fade-left');
        item.innerHTML = `
            <div class="timeline-dot">
                <i class="${event.icon}"></i>
            </div>
            <div class="timeline-date">${event.date}</div>
            <div class="timeline-content">
                <h3 class="timeline-title">${event.title}</h3>
                <p class="timeline-text">${event.description}</p>
            </div>
        `;
        timeline.appendChild(item);
    });
}

/* ============================================================
   13. DÉMARRAGE
   ============================================================ */
let aboutPageInstance = null;

function initAboutPage() {
    if (!aboutPageInstance) {
        aboutPageInstance = new AboutPage();
        aboutPageInstance.animateHeroOnLoad();
    }
    return aboutPageInstance;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAboutPage();
    });
} else {
    initAboutPage();
}

// Réinitialiser quand le layout est prêt
document.addEventListener('layout-ready', () => {
    if (!AboutState.timelineInitialized) {
        initAboutPage();
    }
});

/* ============================================================
   14. EXPORTATION GLOBALE
   ============================================================ */
window.AboutPage = AboutPage;
window.AboutConfig = AboutConfig;
window.AboutState = AboutState;
window.aboutPageInstance = aboutPageInstance;
window.initAboutPage = initAboutPage;
window.populateTimeline = populateTimeline;

/* ============================================================
   FIN DU FICHIER ABOUT.JS
   ============================================================ */