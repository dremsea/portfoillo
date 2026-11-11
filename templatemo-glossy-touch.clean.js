/* nettoyé — version conservatrice
   - regroupe les initialisations dans DOMContentLoaded
   - protège les sélecteurs qui peuvent être absents (ex: form)
   - conserve la fonction showPage au cas où elle serait appelée dynamiquement
*/

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

    // Gestion d'un formulaire si présent
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Create success message
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(23, 195, 238, 0.9);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                backdrop-filter: blur(20px);
                z-index: 10000;
                animation: fadeIn 0.7s ease;
            `;
            successMsg.textContent = 'message envoyé avec succès !';

            document.body.appendChild(successMsg);

            // Remove message after 3 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 3000);

            // Reset form
            try { this.reset(); } catch (err) { /* ignore */ }
        });

        // Keyframes pour fadeIn (ajouté une seule fois)
        if (!document.getElementById('tm-fade-style')) {
            const fadeStyle = document.createElement('style');
            fadeStyle.id = 'tm-fade-style';
            fadeStyle.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(fadeStyle);
        }
    }
});
