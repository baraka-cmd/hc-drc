/* ============================================================
   HOPE CHILD-DRC — INDEX.JS (CORRIGÉ)
   Scripts Spécifiques de la Page d'Accueil
   Version : 1.1.0
   ============================================================ */

'use strict';

/* ============================================================
   1. CONFIGURATION INDEX
   ============================================================ */
const IndexConfig = {
    hero: {
        autoplay: true,
        autoplaySpeed: 6000,
        transitionSpeed: 1200,
        pauseOnHover: true,
        swipeEnabled: true,
        keyboardEnabled: true,
        currentSlide: 0,
        totalSlides: 5
    },
    counters: {
        duration: 2000,
        easing: 'easeInOutCubic',
        startOnScroll: true,
        threshold: 0.3
    },
    animations: {
        staggerDelay: 150,
        revealDistance: '50px',
        revealDuration: 800
    },
    newsletter: {
        storageKey: 'hc_drc_newsletter',
        successDuration: 5000,
        errorDuration: 5000
    },
    donate: {
        amounts: [10, 25, 50, 100],
        selectedAmount: null
    }
};

/* ============================================================
   2. ÉTAT INDEX
   ============================================================ */
const IndexState = {
    heroInitialized: false,
    countersInitialized: false,
    countersAnimated: false,
    testimonialsInitialized: false,
    newsletterSubscribed: false,
    selectedDonateAmount: null,
    isHeroPlaying: true,
    heroInterval: null
};

/* ============================================================
   3. CLASSE PRINCIPALE INDEX
   ============================================================ */
class IndexPage {
    constructor() {
        this.heroSlider = null;
        this.heroSlides = [];
        this.heroDots = [];
        this.heroPrev = null;
        this.heroNext = null;
        this.counters = [];
        this.testimonialCards = [];
        this.newsletterForm = null;
        this.donateAmounts = [];
        this.galleryPreviewItems = [];
        
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
            if (!IndexState.heroInitialized) {
                this.setup();
            }
        });
    }

    setup() {
        // Récupérer les éléments
        this.heroSlider = document.getElementById('hero-slider');
        this.heroSlides = Array.from(document.querySelectorAll('.hero-slide:not(.carousel-arrow)'));
        this.heroDots = Array.from(document.querySelectorAll('.carousel-dots .carousel-dot'));
        this.heroPrev = document.getElementById('hero-prev');
        this.heroNext = document.getElementById('hero-next');
        this.counters = Array.from(document.querySelectorAll('.counter'));
        this.testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
        this.newsletterForm = document.getElementById('newsletter-form');
        this.donateAmounts = Array.from(document.querySelectorAll('.donate-amount-item'));
        this.galleryPreviewItems = Array.from(document.querySelectorAll('.gallery-preview-item')); // ✅ AJOUTÉ
        
        // Initialiser les modules
        this.initHeroSlider();
        this.initCounters();
        this.initTestimonials();
        this.initNewsletter();
        this.initDonateAmounts();
        this.initSmoothScroll();
        this.initParallaxEffect();
        this.initGalleryPreview();  // ✅ CORRIGÉ : appel de la méthode
        
        console.log('✅ Page d\'accueil initialisée');
    }

    /* ============================================================
       4. HERO SLIDER
       ============================================================ */
    initHeroSlider() {
        if (!this.heroSlider || this.heroSlides.length === 0) {
            console.warn('⚠️ Hero slider introuvable');
            return;
        }
        
        IndexState.heroInitialized = true;
        
        // Positionner les slides
        this.heroSlides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Événements des flèches
        if (this.heroPrev) {
            this.heroPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevSlide();
            });
        }
        
        if (this.heroNext) {
            this.heroNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
            });
        }
        
        // Événements des dots
        this.heroDots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(dot.getAttribute('data-slide'));
                this.goToSlide(index);
            });
        });
        
        // Navigation clavier
        if (IndexConfig.hero.keyboardEnabled) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                }
            });
        }
        
        // Swipe mobile
        if (IndexConfig.hero.swipeEnabled) {
            this.initSwipeNavigation();
        }
        
        // Pause au survol
        if (IndexConfig.hero.pauseOnHover) {
            this.heroSlider.addEventListener('mouseenter', () => {
                this.stopAutoplay();
            });
            
            this.heroSlider.addEventListener('mouseleave', () => {
                this.startAutoplay();
            });
        }
        
        // Démarrer l'autoplay
        this.startAutoplay();
        
        console.log('✅ Hero slider initialisé');
    }

    goToSlide(index) {
        if (index === IndexConfig.hero.currentSlide) return;
        if (index < 0) index = IndexConfig.hero.totalSlides - 1;
        if (index >= IndexConfig.hero.totalSlides) index = 0;
        
        this.heroSlides.forEach(slide => slide.classList.remove('active'));
        this.heroDots.forEach(dot => {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        });
        
        this.heroSlides[index].classList.add('active');
        this.heroDots[index].classList.add('active');
        this.heroDots[index].setAttribute('aria-selected', 'true');
        
        IndexConfig.hero.currentSlide = index;
        this.restartAutoplay();
    }

    nextSlide() {
        const next = (IndexConfig.hero.currentSlide + 1) % IndexConfig.hero.totalSlides;
        this.goToSlide(next);
    }

    prevSlide() {
        const prev = (IndexConfig.hero.currentSlide - 1 + IndexConfig.hero.totalSlides) % IndexConfig.hero.totalSlides;
        this.goToSlide(prev);
    }

    startAutoplay() {
        if (!IndexConfig.hero.autoplay || IndexState.heroInterval) return;
        
        IndexState.heroInterval = setInterval(() => {
            this.nextSlide();
        }, IndexConfig.hero.autoplaySpeed);
        
        IndexState.isHeroPlaying = true;
    }

    stopAutoplay() {
        if (IndexState.heroInterval) {
            clearInterval(IndexState.heroInterval);
            IndexState.heroInterval = null;
        }
        IndexState.isHeroPlaying = false;
    }

    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    initSwipeNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50;
        
        this.heroSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.heroSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }, { passive: true });
    }

    /* ============================================================
       5. COMPTEURS ANIMÉS
       ============================================================ */
    initCounters() {
        if (this.counters.length === 0) return;
        
        IndexState.countersInitialized = true;
        
        if (IndexConfig.counters.startOnScroll) {
            this.initCounterObserver();
        } else {
            this.animateAllCounters();
        }
    }

    initCounterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !IndexState.countersAnimated) {
                    this.animateAllCounters();
                    IndexState.countersAnimated = true;
                    observer.disconnect();
                }
            });
        }, {
            threshold: IndexConfig.counters.threshold
        });
        
        const impactSection = document.querySelector('.impact-section');
        if (impactSection) {
            observer.observe(impactSection);
        } else {
            this.animateAllCounters();
        }
    }

    animateAllCounters() {
        this.counters.forEach(counter => {
            this.animateCounter(counter);
        });
    }

    animateCounter(counterElement) {
    const target = parseInt(counterElement.getAttribute('data-target'));
    const duration = parseInt(counterElement.getAttribute('data-duration')) || IndexConfig.counters.duration;
    
    // ✅ Vérifier si target est valide
    if (isNaN(target) || target === 0) {
        console.warn('⚠️ Cible invalide pour le compteur:', counterElement);
        return;
    }
    
    const startTime = performance.now();
    const startValue = 0;
    
    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        const currentValue = Math.round(startValue + (target - startValue) * easedProgress);
        
        counterElement.textContent = currentValue.toLocaleString('fr-FR');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            counterElement.textContent = target.toLocaleString('fr-FR');
        }
    };
    
    requestAnimationFrame(updateCounter);
}

    /* ============================================================
       6. TÉMOIGNAGES
       ============================================================ */
    initTestimonials() {
        if (this.testimonialCards.length === 0) return;
        
        IndexState.testimonialsInitialized = true;
        
        this.testimonialCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            card.style.transitionDelay = (index * IndexConfig.animations.staggerDelay) + 'ms';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * IndexConfig.animations.staggerDelay));
        });
    }

    /* ============================================================
       7. NEWSLETTER
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
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    subscribeNewsletter(email) {
        const existing = localStorage.getItem(IndexConfig.newsletter.storageKey);
        
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
        
        setTimeout(() => {
            localStorage.setItem(IndexConfig.newsletter.storageKey, JSON.stringify({
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
            ${type === 'success' ? 'background: rgba(40, 167, 69, 0.15); color: #28A745; border-left: 3px solid #28A745;' : ''}
            ${type === 'error' ? 'background: rgba(220, 53, 69, 0.15); color: #DC3545; border-left: 3px solid #DC3545;' : ''}
        `;
        
        this.newsletterForm.appendChild(messageEl);
        
        const duration = type === 'success' ? 
            IndexConfig.newsletter.successDuration : 
            IndexConfig.newsletter.errorDuration;
        
        setTimeout(() => {
            messageEl.remove();
        }, duration);
    }

    /* ============================================================
       8. MONTANTS DE DON
       ============================================================ */
    initDonateAmounts() {
        if (this.donateAmounts.length === 0) return;
        
        this.donateAmounts.forEach(item => {
            item.addEventListener('click', () => {
                this.donateAmounts.forEach(amount => {
                    amount.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    amount.style.background = 'rgba(255, 255, 255, 0.08)';
                });
                
                item.style.borderColor = '#FFD13B';
                item.style.background = '#FFD13B';
                
                const value = item.querySelector('.amount-value');
                const equivalent = item.querySelector('.amount-equivalent');
                
                if (value) value.style.color = '#08264B';
                if (equivalent) equivalent.style.color = '#08264B';
                
                const amountText = value ? value.textContent.trim() : '';
                const amount = parseInt(amountText.replace(/[^0-9]/g, ''));
                
                IndexState.selectedDonateAmount = amount;
            });
        });
    }

    /* ============================================================
       9. SMOOTH SCROLL
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
            });
        });
    }

    /* ============================================================
       10. EFFET PARALLAX
       ============================================================ */
    initParallaxEffect() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const heroSlides = document.querySelectorAll('.hero-slide:not(.carousel-arrow)');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            
            if (scrollY < window.innerHeight) {
                heroSlides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        const parallaxOffset = scrollY * 0.3;
                        slide.style.backgroundPosition = `center calc(50% + ${parallaxOffset}px)`;
                    }
                });
            }
        }, { passive: true });
    }

    /* ============================================================
       11. GALERIE APERÇU
       ============================================================ */
    initGalleryPreview() {
        if (this.galleryPreviewItems.length === 0) return;
        
        this.galleryPreviewItems.forEach((item) => {
            item.addEventListener('click', () => {
                window.location.href = 'galerie.html';
            });
            
            item.addEventListener('touchstart', () => {
                item.classList.add('touch-hover');
            }, { passive: true });
            
            item.addEventListener('touchend', () => {
                setTimeout(() => {
                    item.classList.remove('touch-hover');
                }, 300);
            }, { passive: true });
        });
        
        console.log('✅ Galerie aperçu initialisée');
    }

    /* ============================================================
       12. MÉTHODES PUBLIQUES
       ============================================================ */
    goToHeroSlide(index) {
        this.goToSlide(index);
    }

    destroy() {
        this.stopAutoplay();
        IndexState.heroInitialized = false;
        IndexState.countersInitialized = false;
        console.log('🗑️ Page d\'accueil détruite');
    }
}

/* ============================================================
   13. ANIMATIONS AU SCROLL
   ============================================================ */
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');
    
    if (elements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add('aos-animate');
                }, parseInt(delay));
                
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

/* ============================================================
   14. COMPTEUR DE VISITES
   ============================================================ */
function initVisitCounter() {
    const storageKey = 'hc_drc_visit_count';
    let visitCount = parseInt(localStorage.getItem(storageKey)) || 0;
    visitCount++;
    localStorage.setItem(storageKey, visitCount);
    console.log('📊 Visite n°' + visitCount);
}

/* ============================================================
   15. DÉMARRAGE
   ============================================================ */
let indexPageInstance = null;

function initIndexPage() {
    if (!indexPageInstance) {
        indexPageInstance = new IndexPage();
    }
    return indexPageInstance;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initIndexPage();
        initScrollAnimations();
        initVisitCounter();
    });
} else {
    initIndexPage();
    initScrollAnimations();
    initVisitCounter();
}

document.addEventListener('layout-ready', () => {
    if (!IndexState.heroInitialized) {
        initIndexPage();
    }
    initScrollAnimations();
});

/* ============================================================
   16. EXPORTATION GLOBALE
   ============================================================ */
window.IndexPage = IndexPage;
window.IndexConfig = IndexConfig;
window.IndexState = IndexState;
window.indexPageInstance = indexPageInstance;
window.initIndexPage = initIndexPage;
window.initScrollAnimations = initScrollAnimations;

/* ============================================================
   FIN DU FICHIER INDEX.JS
   ============================================================ */