/* ============================================================
   HOPE CHILD-DRC — CAROUSEL.JS
   Système de Sliders & Carrousels
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Hero slider, carrousels génériques,
                 témoignages, logos partenaires,
                 galerie avec lightbox
   ============================================================ */

'use strict';

/* ============================================================
   1. CLASSE CAROUSEL PRINCIPALE
   ============================================================ */
class Carousel {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            autoplay: false,
            autoplaySpeed: 5000,
            transitionSpeed: 800,
            infinite: true,
            showArrows: true,
            showDots: true,
            pauseOnHover: true,
            swipeEnabled: true,
            keyboardEnabled: true,
            swipeThreshold: 50,
            slidesToShow: 1,
            slidesToScroll: 1,
            gap: 0,
            responsive: [],
            ...options
        };

        this.currentIndex = 0;
        this.slides = [];
        this.dots = [];
        this.arrows = { prev: null, next: null };
        this.isPlaying = false;
        this.isPaused = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isDragging = false;

        this.init();
    }

    /* ========== INITIALISATION ========== */
    init() {
        this.setupSlides();
        this.createControls();
        this.bindEvents();
        this.goToSlide(0, false);
        
        if (this.options.autoplay) {
            this.startAutoplay();
        }

        console.log(`🎠 Carrousel initialisé : ${this.slides.length} slides`);
    }

    /* ========== CONFIGURATION DES SLIDES ========== */
    setupSlides() {
    const track = this.element.querySelector('.carousel-track') || this.element;
    
    // ✅ Ne sélectionner QUE les slides, exclure les contrôles
    const allChildren = Array.from(track.children);
    
    this.slides = allChildren.filter(child => {
        return !child.classList.contains('carousel-arrow') &&
               !child.classList.contains('carousel-dots') &&
               !child.classList.contains('carousel-dot') &&
               !child.classList.contains('hero-scroll-indicator');
    });
    
    this.slides.forEach((slide, index) => {
        slide.classList.add('carousel-slide');
        slide.setAttribute('data-slide-index', index);
    });
}

    setupInfiniteLoop() {
        const track = this.element.querySelector('.carousel-track');
        if (!track) return;

        // Cloner les premiers et derniers slides
        const firstClones = this.slides.slice(0, this.options.slidesToShow).map(slide => slide.cloneNode(true));
        const lastClones = this.slides.slice(-this.options.slidesToShow).map(slide => slide.cloneNode(true));

        firstClones.forEach(clone => {
            clone.classList.add('clone');
            track.appendChild(clone);
        });

        lastClones.forEach(clone => {
            clone.classList.add('clone');
            track.insertBefore(clone, track.firstChild);
        });

        // Mettre à jour la liste des slides
        this.slides = Array.from(track.children);
        
        // Ajuster l'index initial
        this.currentIndex = this.options.slidesToShow;
    }

    /* ========== CONTRÔLES ========== */
    createControls() {
        // Flèches
        if (this.options.showArrows) {
            this.createArrows();
        }

        // Dots
        if (this.options.showDots) {
            this.createDots();
        }
    }

    createArrows() {
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-arrow prev';
    prevButton.type = 'button';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.setAttribute('aria-label', 'Précédent');

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-arrow next';
    nextButton.type = 'button';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.setAttribute('aria-label', 'Suivant');

    // ✅ ATTACHER LES ÉVÉNEMENTS DIRECTEMENT
    prevButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.previous();
    };

    nextButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.next();
    };

    this.element.appendChild(prevButton);
    this.element.appendChild(nextButton);
    
    this.arrows.prev = prevButton;
    this.arrows.next = nextButton;
}

    createDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        
        const realSlidesCount = this.options.infinite 
            ? this.slides.length - (this.options.slidesToShow * 2)
            : this.slides.length;
        
        for (let i = 0; i < realSlidesCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('data-dot-index', i);
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            
            dot.addEventListener('click', () => {
                this.goToSlide(i + (this.options.infinite ? this.options.slidesToShow : 0));
            });
            
            dotsContainer.appendChild(dot);
            this.dots.push(dot);
        }
        
        this.element.appendChild(dotsContainer);
    }

    /* ========== ÉVÉNEMENTS ========== */
    bindEvents() {
        // Pause au survol
        if (this.options.pauseOnHover && this.options.autoplay) {
            this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.element.addEventListener('mouseleave', () => this.resumeAutoplay());
        }

        // Swipe tactile
        if (this.options.swipeEnabled) {
            this.element.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.isDragging = true;
            }, { passive: true });

            this.element.addEventListener('touchmove', (e) => {
                if (!this.isDragging) return;
                this.touchEndX = e.touches[0].clientX;
            }, { passive: true });

            this.element.addEventListener('touchend', () => {
                if (!this.isDragging) return;
                
                const swipeDistance = this.touchEndX - this.touchStartX;
                
                if (Math.abs(swipeDistance) > this.options.swipeThreshold) {
                    if (swipeDistance > 0) {
                        this.previous();
                    } else {
                        this.next();
                    }
                }
                
                this.isDragging = false;
                this.touchStartX = 0;
                this.touchEndX = 0;
            });
        }

        // Clavier
        if (this.options.keyboardEnabled) {
            this.element.setAttribute('tabindex', '0');
            
            this.element.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previous();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.next();
                        break;
                }
            });
        }

        // Redimensionnement
        window.addEventListener('resize', () => {
            this.updateLayout();
        }, { passive: true });
    }

    /* ========== NAVIGATION ========== */
    next() {
        const maxIndex = this.getMaxIndex();
        
        if (this.options.infinite) {
            this.currentIndex++;
            this.updatePosition(true);
        } else {
            if (this.currentIndex < maxIndex) {
                this.currentIndex++;
                this.updatePosition(false);
            }
        }
    }

    previous() {
        if (this.options.infinite) {
            this.currentIndex--;
            this.updatePosition(true);
        } else {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updatePosition(false);
            }
        }
    }

    goToSlide(index, animate = true) {
        if (index < 0 || index >= this.slides.length) return;
        
        this.currentIndex = index;
        this.updatePosition(animate);
        this.updateDots();
    }

    updatePosition(animate = true) {
        const track = this.element.querySelector('.carousel-track');
        if (!track) return;

        const slideWidth = this.slides[0]?.offsetWidth || 0;
        const offset = -(this.currentIndex * (slideWidth + this.options.gap));
        
        if (animate) {
            track.style.transition = `transform ${this.options.transitionSpeed}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        } else {
            track.style.transition = 'none';
        }
        
        track.style.transform = `translateX(${offset}px)`;
        
        // Gérer la boucle infinie après la transition
        if (this.options.infinite) {
            setTimeout(() => {
                const realSlidesCount = this.slides.length - (this.options.slidesToShow * 2);
                
                if (this.currentIndex >= this.slides.length - this.options.slidesToShow) {
                    this.currentIndex = realSlidesCount;
                    this.updatePosition(false);
                } else if (this.currentIndex < this.options.slidesToShow) {
                    this.currentIndex = this.options.slidesToShow + realSlidesCount - 1;
                    this.updatePosition(false);
                }
            }, this.options.transitionSpeed + 50);
        }
        
        this.updateDots();
    }

    getMaxIndex() {
        if (this.options.infinite) {
            return this.slides.length - 1;
        }
        return this.slides.length - this.options.slidesToShow;
    }

    updateDots() {
        if (this.dots.length === 0) return;
        
        const realIndex = this.getRealIndex();
        
        this.dots.forEach((dot, index) => {
            if (index === realIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });
    }

    getRealIndex() {
        if (this.options.infinite) {
            const offset = this.options.slidesToShow;
            const realSlidesCount = this.slides.length - (this.options.slidesToShow * 2);
            return ((this.currentIndex - offset) % realSlidesCount + realSlidesCount) % realSlidesCount;
        }
        return this.currentIndex;
    }

    updateLayout() {
        this.updatePosition(false);
    }

    /* ========== AUTOPLAY ========== */
    startAutoplay() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.autoplayTimer = setInterval(() => {
            if (!this.isPaused) {
                this.next();
            }
        }, this.options.autoplaySpeed);
    }

    pauseAutoplay() {
        this.isPaused = true;
    }

    resumeAutoplay() {
        this.isPaused = false;
    }

    stopAutoplay() {
        this.isPlaying = false;
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
    }

    /* ========== MÉTHODES PUBLIQUES ========== */
    getCurrentSlide() {
        return this.getRealIndex();
    }

    getTotalSlides() {
        return this.options.infinite 
            ? this.slides.length - (this.options.slidesToShow * 2)
            : this.slides.length;
    }

    destroy() {
        this.stopAutoplay();
        this.element.remove();
    }
}

/* ============================================================
   2. CLASSE HERO SLIDER (Spécial accueil)
   ============================================================ */
class HeroSlider extends Carousel {
    constructor(element, options = {}) {
        super(element, {
            autoplay: true,
            autoplaySpeed: 5000,
            transitionSpeed: 1000,
            infinite: false,  // ← Désactiver l'infini pour le hero (5 slides simples)
            showArrows: false,  // ← NE PAS créer de nouvelles flèches (elles existent déjà en HTML)
            showDots: false,    // ← NE PAS créer de nouveaux dots (ils existent déjà en HTML)
            pauseOnHover: true,
            swipeEnabled: true,
            keyboardEnabled: true,
            ...options
        });
    }

    // ✅ Redéfinir la navigation pour le hero
    next() {
        const total = this.slides.length;
        this.currentIndex = (this.currentIndex + 1) % total;
        this.updateHeroSlide();
    }

    previous() {
        const total = this.slides.length;
        this.currentIndex = (this.currentIndex - 1 + total) % total;
        this.updateHeroSlide();
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        this.currentIndex = index;
        this.updateHeroSlide();
    }

    updateHeroSlide() {
        // Mettre à jour les slides
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('active');
                slide.style.opacity = '1';
                slide.style.visibility = 'visible';
            } else {
                slide.classList.remove('active');
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
            }
        });

        // Mettre à jour les dots existants
        const dots = this.element.querySelectorAll('.carousel-dots .carousel-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-selected', 'false');
            }
        });
    }

    bindEvents() {
        // Lier les flèches EXISTANTES du HTML
        const prevBtn = this.element.querySelector('.carousel-arrow.prev');
        const nextBtn = this.element.querySelector('.carousel-arrow.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.previous();
                this.restartAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.next();
                this.restartAutoplay();
            });
        }

        // Lier les dots EXISTANTS
        const dots = this.element.querySelectorAll('.carousel-dots .carousel-dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index);
                this.restartAutoplay();
            });
        });

        // Clavier
        if (this.options.keyboardEnabled) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.previous();
                    this.restartAutoplay();
                } else if (e.key === 'ArrowRight') {
                    this.next();
                    this.restartAutoplay();
                }
            });
        }

        // Swipe tactile
        if (this.options.swipeEnabled) {
            let touchStartX = 0;
            
            this.element.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            this.element.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.previous();
                    }
                    this.restartAutoplay();
                }
            }, { passive: true });
        }

        // Pause au survol
        if (this.options.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => this.stopAutoplay());
            this.element.addEventListener('mouseleave', () => this.startAutoplay());
        }
    }

    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
}

/* ============================================================
   3. CLASSE TESTIMONIALS CAROUSEL
   ============================================================ */
class TestimonialsCarousel extends Carousel {
    constructor(element, options = {}) {
        super(element, {
            autoplay: true,
            autoplaySpeed: 6000,
            transitionSpeed: 600,
            infinite: true,
            showArrows: true,
            showDots: true,
            pauseOnHover: true,
            slidesToShow: 3,
            responsive: [
                { breakpoint: 1024, slidesToShow: 2 },
                { breakpoint: 768, slidesToShow: 1 }
            ],
            ...options
        });
    }
}

/* ============================================================
   4. CLASSE LOGOS CAROUSEL (Partenaires)
   ============================================================ */
class LogosCarousel extends Carousel {
    constructor(element, options = {}) {
        super(element, {
            autoplay: true,
            autoplaySpeed: 3000,
            transitionSpeed: 500,
            infinite: true,
            showArrows: false,
            showDots: false,
            pauseOnHover: true,
            slidesToShow: 5,
            responsive: [
                { breakpoint: 1200, slidesToShow: 4 },
                { breakpoint: 992, slidesToShow: 3 },
                { breakpoint: 768, slidesToShow: 2 },
                { breakpoint: 480, slidesToShow: 1 }
            ],
            ...options
        });
    }
}

/* ============================================================
   5. CLASSE GALLERY CAROUSEL (Avec lightbox)
   ============================================================ */
class GalleryCarousel {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            showLightbox: true,
            showCaption: true,
            showCounter: true,
            keyboardNavigation: true,
            closeOnOutsideClick: true,
            closeOnEscape: true,
            ...options
        };

        this.items = [];
        this.currentIndex = 0;
        this.lightbox = null;

        this.init();
    }

    init() {
        this.items = Array.from(this.element.querySelectorAll('.gallery-item, [data-gallery-item]'));
        this.bindEvents();
    }

    bindEvents() {
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openLightbox(index);
            });
        });
    }

    openLightbox(index) {
        if (!this.options.showLightbox) return;
        
        this.currentIndex = index;
        
        // Créer la lightbox
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        
        const image = this.items[index].querySelector('img');
        const imageSrc = image?.getAttribute('src') || image?.getAttribute('data-src');
        const caption = image?.getAttribute('alt') || '';
        
        this.lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Fermer">
                <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-prev" aria-label="Précédent">
                <i class="fas fa-chevron-left"></i>
            </button>
            <img src="${imageSrc}" alt="${caption}">
            <button class="lightbox-next" aria-label="Suivant">
                <i class="fas fa-chevron-right"></i>
            </button>
            ${this.options.showCounter ? `<div class="lightbox-counter">${this.currentIndex + 1} / ${this.items.length}</div>` : ''}
            ${this.options.showCaption && caption ? `<div class="lightbox-caption">${caption}</div>` : ''}
        `;
        
        document.body.appendChild(this.lightbox);
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            this.lightbox.classList.add('active');
        });
        
        this.bindLightboxEvents();
    }

    bindLightboxEvents() {
        if (!this.lightbox) return;

        // Fermer
        const closeBtn = this.lightbox.querySelector('.lightbox-close');
        closeBtn?.addEventListener('click', () => this.closeLightbox());

        // Navigation
        const prevBtn = this.lightbox.querySelector('.lightbox-prev');
        const nextBtn = this.lightbox.querySelector('.lightbox-next');
        
        prevBtn?.addEventListener('click', () => this.navigateLightbox(-1));
        nextBtn?.addEventListener('click', () => this.navigateLightbox(1));

        // Clavier
        if (this.options.keyboardNavigation) {
            document.addEventListener('keydown', this.handleKeydown);
        }

        // Clic extérieur
        if (this.options.closeOnOutsideClick) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
        }
    }

    handleKeydown = (e) => {
        switch (e.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                this.navigateLightbox(-1);
                break;
            case 'ArrowRight':
                this.navigateLightbox(1);
                break;
        }
    }

    navigateLightbox(direction) {
        this.currentIndex = (this.currentIndex + direction + this.items.length) % this.items.length;
        
        const image = this.items[this.currentIndex].querySelector('img');
        const imageSrc = image?.getAttribute('src') || image?.getAttribute('data-src');
        const caption = image?.getAttribute('alt') || '';
        
        const lightboxImg = this.lightbox.querySelector('img');
        const lightboxCaption = this.lightbox.querySelector('.lightbox-caption');
        const lightboxCounter = this.lightbox.querySelector('.lightbox-counter');
        
        if (lightboxImg) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = imageSrc;
                lightboxImg.alt = caption;
                lightboxImg.style.opacity = '1';
            }, 200);
        }
        
        if (lightboxCaption) lightboxCaption.textContent = caption;
        if (lightboxCounter) lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.items.length}`;
    }

    closeLightbox() {
        if (!this.lightbox) return;
        
        this.lightbox.classList.remove('active');
        document.removeEventListener('keydown', this.handleKeydown);
        document.body.style.overflow = '';
        
        setTimeout(() => {
            this.lightbox?.remove();
            this.lightbox = null;
        }, 300);
    }
}

/* ============================================================
   6. INITIALISATION AUTOMATIQUE DES CARROUSELS
   ============================================================ */
class CarouselInitializer {
    constructor() {
        this.carousels = [];
        this.init();
    }

    init() {
        // Hero Slider
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            this.carousels.push(new HeroSlider(heroSlider));
        }

        // Carrousels génériques avec data-carousel
        document.querySelectorAll('[data-carousel]').forEach(element => {
            const type = element.getAttribute('data-carousel');
            
            switch (type) {
                case 'testimonials':
                    this.carousels.push(new TestimonialsCarousel(element));
                    break;
                case 'logos':
                    this.carousels.push(new LogosCarousel(element));
                    break;
                case 'default':
                default:
                    this.carousels.push(new Carousel(element, {
                        autoplay: element.getAttribute('data-autoplay') === 'true',
                        autoplaySpeed: parseInt(element.getAttribute('data-autoplay-speed')) || 5000,
                        slidesToShow: parseInt(element.getAttribute('data-slides-to-show')) || 1
                    }));
                    break;
            }
        });

        // Galerie avec lightbox
        const gallery = document.querySelector('.gallery-grid, [data-gallery]');
        if (gallery) {
            this.carousels.push(new GalleryCarousel(gallery));
        }

        console.log(`🎠 ${this.carousels.length} carrousels initialisés`);
    }

    getCarousels() {
        return this.carousels;
    }
}

/* ============================================================
   7. EXPORTATION GLOBALE
   ============================================================ */
window.Carousel = Carousel;
window.HeroSlider = HeroSlider;
window.TestimonialsCarousel = TestimonialsCarousel;
window.LogosCarousel = LogosCarousel;
window.GalleryCarousel = GalleryCarousel;
window.CarouselInitializer = CarouselInitializer;

/* ============================================================
   8. INITIALISATION AUTOMATIQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    try {
        const initializer = new CarouselInitializer();
        window.carouselInitializer = initializer;
        
        console.log('✅ Carrousels initialisés avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des carrousels :', error);
    }
});

/* ============================================================
   9. STYLES DYNAMIQUES POUR LIGHTBOX
   ============================================================ */
const lightboxStyles = document.createElement('style');
lightboxStyles.textContent = `
    .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .lightbox.active {
        opacity: 1;
        visibility: visible;
    }
    
    .lightbox img {
        max-width: 85%;
        max-height: 85vh;
        border-radius: 8px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        transform: scale(0.9);
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .lightbox.active img {
        transform: scale(1);
    }
    
    .lightbox-close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    
    .lightbox-close:hover {
        background: #FF4500;
        transform: rotate(90deg);
    }
    
    .lightbox-prev,
    .lightbox-next {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    
    .lightbox-prev:hover,
    .lightbox-next:hover {
        background: #FFD13B;
        color: #08264B;
    }
    
    .lightbox-prev { left: 20px; }
    .lightbox-next { right: 20px; }
    
    .lightbox-counter {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        z-index: 10;
    }
    
    .lightbox-caption {
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-size: 16px;
        font-weight: 500;
        text-align: center;
        max-width: 80%;
        z-index: 10;
    }
    
    @media (max-width: 768px) {
        .lightbox img {
            max-width: 95%;
        }
        
        .lightbox-close {
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            font-size: 16px;
        }
        
        .lightbox-prev,
        .lightbox-next {
            width: 40px;
            height: 40px;
            font-size: 14px;
        }
        
        .lightbox-prev { left: 10px; }
        .lightbox-next { right: 10px; }
    }
`;
document.head.appendChild(lightboxStyles);

/* ============================================================
   FIN DU FICHIER CAROUSEL.JS
   ============================================================ */