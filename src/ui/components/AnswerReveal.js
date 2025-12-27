import { escapeHtml } from '../../utils/DOMHelpers.js';

/**
 * Composant AnswerReveal - Affichage animé de la réponse
 *
 * Composant simple mais répété dans plusieurs manches
 * Gère l'affichage et le masquage de la réponse avec animation
 */
export default class AnswerReveal {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     */
    constructor(container) {
        this.container = container;
        this.isVisible = false;
        this.setupContainer();
    }

    /**
     * Configure le conteneur avec les classes CSS
     */
    setupContainer() {
        this.container.classList.add('answer-reveal');
    }

    /**
     * Affiche la réponse avec animation
     * @param {string} answer - La réponse à afficher
     */
    show(answer) {
        this.container.innerHTML = `
            <div class="answer-content">
                <span class="answer-icon">✅</span>
                <span class="answer-text">${escapeHtml(answer)}</span>
            </div>
        `;
        this.container.classList.add('show');
        this.isVisible = true;
    }

    /**
     * Masque la réponse
     */
    hide() {
        this.container.classList.remove('show');
        this.isVisible = false;
        // Nettoyer après l'animation
        setTimeout(() => {
            if (!this.isVisible) {
                this.container.innerHTML = '';
            }
        }, 300);
    }

    /**
     * Vérifie si la réponse est visible
     * @returns {boolean}
     */
    isShown() {
        return this.isVisible;
    }

    /**
     * Toggle l'affichage de la réponse (affiche si caché, cache si affiché)
     * @param {string} answer - La réponse à afficher
     */
    toggle(answer) {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(answer);
        }
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        this.hide();
        this.container.classList.remove('answer-reveal');
    }
}
