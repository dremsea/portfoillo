/* sync from clean version — safe to load by all pages */

let currentPage = null;

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Find target page; if not found do nothing
    const target = document.getElementById(pageId);
    if (!target) return;

    // Show selected page
    target.classList.add('active');

    // Update navigation (mark link active if its onclick matches)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') === `showPage('${pageId}')`) {
            link.classList.add('active');
        }
    });

    currentPage = pageId;

    // Move footer to the active page (if footer exists)
    const footer = document.getElementById('footer');
    if (footer && target) {
        target.appendChild(footer);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tout initialiser quand le DOM est prêt — évite les erreurs si certains éléments manquent
window.addEventListener('DOMContentLoaded', () => {
    // Footer / page par défaut
    const footer = document.getElementById('footer');
    const preferred = document.getElementById('home') || document.getElementById('page 1') || document.querySelector('.page');
    if (preferred) {
        preferred.classList.add('active');
        if (footer) {
            preferred.appendChild(footer);
            currentPage = preferred.id || null;
        }
    }

    // Parallax léger sur les formes d'arrière-plan (si présentes)
    const shapes = document.querySelectorAll('.shape');
    if (shapes.length) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                const xPos = (x - 0.5) * speed * 20;
                const yPos = (y - 0.5) * speed * 20;
                shape.style.transform = `translate(${xPos}px, ${yPos}px)`;
            });
        });
    }

    // Effet ripple sur éléments .glass
    document.querySelectorAll('.glass').forEach(element => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(253, 253, 253, 0.43);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1000;
            `;

            // ensure the element can contain absolutely positioned children
            if (getComputedStyle(this).position === 'static') {
                this.style.position = 'relative';
            }
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Keyframes pour ripple (ajouté une seule fois)
    if (!document.getElementById('tm-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'tm-ripple-style';
        style.textContent = `
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Gestion spécifique du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi...';
        }

        if (status) {
            status.className = 'form-status';
            status.textContent = '';
        }

        const formData = new FormData(contactForm);

        try {
            const response = await fetch('https://formsubmit.co/ajax/charriertudal2410@gmail.com', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (status) {
                    status.className = 'form-status success';
                    status.textContent = 'Votre message a bien été envoyé.';
                }
                contactForm.reset();
            } else {
                if (status) {
                    status.className = 'form-status error';
                    status.textContent = 'Une erreur est survenue. Vérifie votre connexion ou réessaie plus tard.';
                }
            }
        } catch (error) {
            if (status) {
                status.className = 'form-status error';
                status.textContent = 'Impossible d’envoyer le message pour le moment.';
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer votre message';
            }
        }
    });
});