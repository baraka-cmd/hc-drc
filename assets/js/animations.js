/* ============================================================
   HOPE CHILD-DRC — ANIMATIONS.JS
   Animations au Scroll & Effets Dynamiques
   Version : 1.0.0
   Auteur : HOPE CHILD-DRC Web Team
   Description : Scroll reveal, compteurs animés,
                 parallax, effets au survol,
                 animations d'apparition
   ============================================================ */

'use strict';

/* ============================================================
   1. CLASSE SCROLL REVEAL (Apparition au défilement)
   ============================================================ */
class ScrollRevealManager {
    constructor(options = {}) {
        this.options = {
            selector: '[data-aos], .reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-zoom, .reveal-rotate, .reveal-flip',
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px',
            once: true,
            duration: 800,
            distance: '60px',
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            staggerDelay: 100,
            respectReducedMotion: true,
            ...options
        };

        this.elements = [];
        this.observer = null;
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur préfère réduire les animations
        if (this.options.respectReducedMotion && window.prefersReducedMotion?.()) {
            this.showAllElements();
            return;
        }

        // Créer l'IntersectionObserver
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );

        // Observer les éléments
        this.observeElements();

        // Observer les nouveaux éléments ajoutés
        this.observeDynamicElements();
    }

    observeElements() {
        this.elements = document.querySelectorAll(this.options.selector);
        
        this.elements.forEach((element, index) => {
            this.setupElement(element, index);
            this.observer.observe(element);
        });
    }

    setupElement(element, index = 0) {
        // Définir les styles initiaux
        element.style.opacity = '0';
        element.style.transition = `opacity ${this.options.duration}ms ${this.options.easing}, transform ${this.options.duration}ms ${this.options.easing}`;
        element.style.willChange = 'opacity, transform';

        // Définir la transformation initiale selon la direction
        const direction = this.getElementDirection(element);
        element.style.transform = direction;

        // Ajouter un délai si spécifié
        const delay = element.getAttribute('data-aos-delay') || element.getAttribute('data-delay');
        if (delay) {
            element.style.transitionDelay = `${delay}ms`;
        }

        // Stagger automatique pour les enfants d'un conteneur
        if (element.parentElement?.classList.contains('stagger-grid')) {
            const siblings = Array.from(element.parentElement.children);
            const childIndex = siblings.indexOf(element);
            element.style.transitionDelay = `${childIndex * this.options.staggerDelay}ms`;
        }
    }

    getElementDirection(element) {
        // Vérifier les attributs data-aos
        const aosType = element.getAttribute('data-aos');
        if (aosType) {
            switch (aosType) {
                case 'fade-up': return `translateY(${this.options.distance})`;
                case 'fade-down': return `translateY(-${this.options.distance})`;
                case 'fade-left': return `translateX(-${this.options.distance})`;
                case 'fade-right': return `translateX(${this.options.distance})`;
                case 'zoom-in': return 'scale(0.7)';
                case 'zoom-out': return 'scale(1.3)';
                case 'flip-left': return 'perspective(1000px) rotateY(-45deg)';
                case 'flip-right': return 'perspective(1000px) rotateY(45deg)';
                case 'rotate': return `rotate(-10deg) scale(0.8)`;
                default: return 'none';
            }
        }

        // Vérifier les classes reveal
        if (element.classList.contains('reveal-up')) {
            return `translateY(${this.options.distance})`;
        }
        if (element.classList.contains('reveal-down')) {
            return `translateY(-${this.options.distance})`;
        }
        if (element.classList.contains('reveal-left')) {
            return `translateX(-${this.options.distance})`;
        }
        if (element.classList.contains('reveal-right')) {
            return `translateX(${this.options.distance})`;
        }
        if (element.classList.contains('reveal-zoom')) {
            return 'scale(0.7)';
        }
        if (element.classList.contains('reveal-rotate')) {
            return 'rotate(-10deg) scale(0.8)';
        }
        if (element.classList.contains('reveal-flip')) {
            return 'perspective(1000px) rotateY(-45deg)';
        }

        // Par défaut : fade up
        return `translateY(${this.options.distance})`;
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.revealElement(entry.target);
                
                // Ne plus observer si once
                if (this.options.once) {
                    this.observer.unobserve(entry.target);
                }
            } else if (!this.options.once) {
                this.hideElement(entry.target);
            }
        });
    }

    revealElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        element.classList.add('revealed', 'aos-animate');
        
        // Dispatch un événement
        element.dispatchEvent(new CustomEvent('revealed', {
            bubbles: true
        }));
    }

    hideElement(element) {
        element.style.opacity = '0';
        const direction = this.getElementDirection(element);
        element.style.transform = direction;
        element.classList.remove('revealed', 'aos-animate');
    }

    showAllElements() {
        this.elements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.classList.add('revealed', 'aos-animate');
        });
    }

    observeDynamicElements() {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Vérifier le nœud lui-même
                        if (node.matches?.(this.options.selector)) {
                            this.setupElement(node);
                            this.observer.observe(node);
                        }
                        // Vérifier les descendants
                        node.querySelectorAll?.(this.options.selector)?.forEach(el => {
                            this.setupElement(el);
                            this.observer.observe(el);
                        });
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /* ========== MÉTHODES PUBLIQUES ========== */
    refresh() {
        this.observeElements();
    }

    revealAll() {
        this.showAllElements();
    }
}

/* ============================================================
   2. CLASSE COMPTEURS ANIMÉS
   ============================================================ */
class CounterAnimator {
    constructor(options = {}) {
        this.options = {
            selector: '.counter, .stat-number, .counter-animate',
            duration: 2000,
            easing: 'easeOutExpo',
            startOnView: true,
            threshold: 0.3,
            ...options
        };

        this.counters = [];
        this.observer = null;
        this.init();
    }

    init() {
        this.counters = document.querySelectorAll(this.options.selector);
        
        if (this.options.startOnView) {
            this.initObserver();
        } else {
            this.animateAll();
        }
    }

    initObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: this.options.threshold }
        );

        this.counters.forEach(counter => {
            this.observer.observe(counter);
        });
    }

    animateAll() {
        this.counters.forEach(counter => this.animateCounter(counter));
    }

    animateCounter(counter) {
        const targetValue = this.getTargetValue(counter);
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const duration = parseInt(counter.getAttribute('data-duration')) || this.options.duration;
        const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;

        const startTime = performance.now();
        const startValue = 0;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeInOutExpo(progress);
            const currentValue = startValue + (targetValue - startValue) * easedProgress;

            // Formater le nombre
            counter.textContent = prefix + this.formatNumber(currentValue, decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Valeur finale
                counter.textContent = prefix + this.formatNumber(targetValue, decimals) + suffix;
                counter.classList.add('counter-done');
                
                // Dispatch un événement
                counter.dispatchEvent(new CustomEvent('counterComplete', {
                    bubbles: true,
                    detail: { value: targetValue }
                }));
            }
        };

        requestAnimationFrame(updateCounter);
    }

    getTargetValue(counter) {
        const text = counter.textContent.trim();
        const cleaned = text.replace(/[^0-9.]/g, '');
        const value = parseFloat(cleaned);
        return isNaN(value) ? 0 : value;
    }

    formatNumber(value, decimals = 0) {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    easeInOutExpo(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2;
    }

    easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
}

/* ============================================================
   3. CLASSE PARALLAX
   ============================================================ */
class ParallaxManager {
    constructor(options = {}) {
        this.options = {
            selector: '[data-parallax]',
            speed: 0.5,
            enabled: true,
            ...options
        };

        this.elements = [];
        this.init();
    }

    init() {
        if (!this.options.enabled) return;
        if (window.prefersReducedMotion?.()) return;

        this.elements = document.querySelectorAll(this.options.selector);

        if (this.elements.length === 0) return;

        window.addEventListener('scroll', () => {
            this.updatePositions();
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.updatePositions();
        }, { passive: true });
    }

    updatePositions() {
        this.elements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax-speed')) || this.options.speed;
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
            const translateY = -centerOffset * speed;

            element.style.transform = `translate3d(0, ${translateY}px, 0)`;
            element.style.willChange = 'transform';
        });
    }
}

/* ============================================================
   4. CLASSE TILT EFFECT (Effet 3D au survol)
   ============================================================ */
class TiltEffect {
    constructor(options = {}) {
        this.options = {
            selector: '[data-tilt]',
            maxTilt: 10,
            perspective: 1000,
            scale: 1.02,
            speed: 300,
            ...options
        };

        this.init();
    }

    init() {
        const elements = document.querySelectorAll(this.options.selector);
        
        elements.forEach(element => {
            element.style.transformStyle = 'preserve-3d';
            element.style.transition = `transform ${this.options.speed}ms ease`;
            
            element.addEventListener('mousemove', (e) => {
                this.handleMouseMove(e, element);
            });

            element.addEventListener('mouseleave', () => {
                this.resetTilt(element);
            });
        });
    }

    handleMouseMove(e, element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / (rect.height / 2)) * this.options.maxTilt;
        const rotateY = -(mouseX / (rect.width / 2)) * this.options.maxTilt;
        
        element.style.transform = `perspective(${this.options.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.options.scale})`;
    }

    resetTilt(element) {
        element.style.transform = `perspective(${this.options.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
}

/* ============================================================
   5. CLASSE TYPEWRITER (Effet machine à écrire)
   ============================================================ */
class TypewriterEffect {
    constructor(options = {}) {
        this.options = {
            selector: '[data-typewriter]',
            speed: 80,
            startDelay: 500,
            loop: false,
            loopDelay: 3000,
            ...options
        };

        this.init();
    }

    init() {
        const elements = document.querySelectorAll(this.options.selector);
        
        elements.forEach(element => {
            const text = element.getAttribute('data-typewriter-text') || element.textContent;
            element.textContent = '';
            
            setTimeout(() => {
                this.startTyping(element, text);
            }, this.options.startDelay);
        });
    }

    async startTyping(element, text) {
        element.classList.add('typing');
        
        for (let i = 0; i < text.length; i++) {
            element.textContent = text.substring(0, i + 1);
            await this.sleep(this.options.speed);
        }
        
        element.classList.remove('typing');
        element.classList.add('typed');
        
        if (this.options.loop) {
            setTimeout(() => {
                this.startDeleting(element, text);
            }, this.options.loopDelay);
        }
    }

    async startDeleting(element, text) {
        element.classList.add('deleting');
        
        for (let i = text.length; i >= 0; i--) {
            element.textContent = text.substring(0, i);
            await this.sleep(this.options.speed / 2);
        }
        
        element.classList.remove('deleting');
        this.startTyping(element, text);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/* ============================================================
   6. CLASSE TEXT SPLIT (Animation lettre par lettre)
   ============================================================ */
class TextSplitAnimator {
    constructor(options = {}) {
        this.options = {
            selector: '[data-split-text]',
            staggerDelay: 50,
            duration: 600,
            triggerOnView: true,
            ...options
        };

        this.init();
    }

    init() {
        const elements = document.querySelectorAll(this.options.selector);
        
        elements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.setAttribute('aria-label', text);
            
            // Diviser en lettres
            const chars = text.split('');
            
            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'text-split-letter';
                span.style.transitionDelay = `${index * this.options.staggerDelay}ms`;
                span.style.transitionDuration = `${this.options.duration}ms`;
                element.appendChild(span);
            });
            
            if (this.options.triggerOnView) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animate(element);
                            observer.unobserve(element);
                        }
                    });
                });
                observer.observe(element);
            } else {
                this.animate(element);
            }
        });
    }

    animate(element) {
        element.classList.add('animated');
        element.querySelectorAll('.text-split-letter').forEach(span => {
            span.classList.add('animated');
        });
    }
}

/* ============================================================
   7. CLASSE RIFFLE EFFECT (Effet au clic)
   ============================================================ */
class RippleEffect {
    constructor(options = {}) {
        this.options = {
            selector: '.btn, .effect-ripple, [data-ripple]',
            color: 'rgba(255, 255, 255, 0.5)',
            duration: 600,
            ...options
        };

        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest(this.options.selector);
            
            if (target) {
                this.createRipple(target, e);
            }
        });
    }

    createRipple(element, event) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-circle';
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            top: ${y}px;
            left: ${x}px;
            width: ${size}px;
            height: ${size}px;
            background: ${this.options.color};
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect ${this.options.duration}ms ease-out;
            pointer-events: none;
        `;
        
        element.style.position = element.style.position || 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, this.options.duration);
    }
}

/* ============================================================
   8. CLASSE ANIMATE ON HOVER (Animation au survol)
   ============================================================ */
class HoverAnimator {
    constructor(options = {}) {
        this.options = {
            selector: '[data-hover-animate]',
            ...options
        };

        this.init();
    }

    init() {
        const elements = document.querySelectorAll(this.options.selector);
        
        elements.forEach(element => {
            const animation = element.getAttribute('data-hover-animate');
            
            element.addEventListener('mouseenter', () => {
                element.style.animation = `${animation} 0.6s ease`;
            });

            element.addEventListener('animationend', () => {
                element.style.animation = '';
            });
        });
    }
}

/* ============================================================
   9. EXPORTATION GLOBALE
   ============================================================ */
window.ScrollRevealManager = ScrollRevealManager;
window.CounterAnimator = CounterAnimator;
window.ParallaxManager = ParallaxManager;
window.TiltEffect = TiltEffect;
window.TypewriterEffect = TypewriterEffect;
window.TextSplitAnimator = TextSplitAnimator;
window.RippleEffect = RippleEffect;
window.HoverAnimator = HoverAnimator;

/* ============================================================
   10. INITIALISATION AUTOMATIQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialiser le scroll reveal
        const scrollReveal = new ScrollRevealManager();
        
        // Initialiser les compteurs animés
        const counterAnimator = new CounterAnimator();
        
        // Initialiser le parallax
        const parallaxManager = new ParallaxManager();
        
        // Initialiser les effets tilt
        const tiltEffect = new TiltEffect();
        
        // Initialiser les effets typewriter
        const typewriterEffect = new TypewriterEffect();
        
        // Initialiser les textes split
        const textSplitAnimator = new TextSplitAnimator();
        
        // Initialiser les effets ripple
        const rippleEffect = new RippleEffect();
        
        // Initialiser les animations hover
        const hoverAnimator = new HoverAnimator();
        
        // Exposer les instances globalement
        window.scrollReveal = scrollReveal;
        window.counterAnimator = counterAnimator;
        window.parallaxManager = parallaxManager;
        window.tiltEffect = tiltEffect;
        window.typewriterEffect = typewriterEffect;
        window.textSplitAnimator = textSplitAnimator;
        window.rippleEffect = rippleEffect;
        window.hoverAnimator = hoverAnimator;
        
        console.log('✅ Animations initialisées avec succès');
        console.log(`📊 Compteurs : ${document.querySelectorAll('.counter, .stat-number').length} trouvés`);
        console.log(`👁️ Éléments reveal : ${document.querySelectorAll('[data-aos], .reveal').length} trouvés`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des animations :', error);
    }
});

/* ============================================================
   11. RÉDUCTION DE MOUVEMENT
   ============================================================ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Désactiver toutes les animations
    document.querySelectorAll('[data-aos], .reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-zoom, .reveal-rotate, .reveal-flip').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('revealed', 'aos-animate');
    });
    
    // Désactiver le parallax
    document.querySelectorAll('[data-parallax]').forEach(el => {
        el.style.transform = 'none';
    });
}

/* ============================================================
   FIN DU FICHIER ANIMATIONS.JS
   ============================================================ */