import { escapeHtml } from '../../utils/DOMHelpers.js';

/**
 * Composant IndicesDisplay - Affichage progressif d'indices
 *
 * Gère l'affichage de 4 indices avec révélation progressive
 * et points dégressifs associés
 */
export default class IndicesDisplay {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Object} options - Configuration
     *   - indices: Array<string> - Les 4 indices
     *   - pointsProgression: Array<number> - Points associés [4,3,2,1]
     *   - currentIndex: number - Index courant (0-4)
     */
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.currentIndex = options.currentIndex || 0;
        this.render();
    }

    /**
     * Affiche les 4 indices
     */
    render() {
        const indices = this.options.indices || [];
        const points = this.options.pointsProgression || [4, 3, 2, 1];

        this.container.innerHTML = `
            <div class="indices-container">
                ${indices.map((indice, index) => `
                    <div class="indice ${index < this.currentIndex ? 'visible' : ''}" id="indice${index + 1}">
                        <span class="indice-label">INDICE ${index + 1} (${points[index]} point${points[index] > 1 ? 's' : ''})</span>
                        <span class="indice-text">${escapeHtml(indice)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Révèle le prochain indice
     * @param {number} index - Index à révéler (1-4)
     */
    revealIndice(index) {
        const indiceElement = this.container.querySelector(`#indice${index}`);
        if (indiceElement) {
            indiceElement.classList.add('visible');
            this.currentIndex = index;
        }
    }

    /**
     * Récupère l'index courant
     * @returns {number}
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
