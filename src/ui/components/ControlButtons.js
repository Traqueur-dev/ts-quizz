/**
 * Composant ControlButtons - Générateur de boutons configurables
 *
 * Élimine la duplication massive de création de boutons à travers les manches
 * Avant: 6+ duplications de patterns de boutons dans quiz-logic.js
 * Après: Un seul composant réutilisable
 */
export default class ControlButtons {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Array<Object>} buttonsConfig - Configuration des boutons
     *   Structure: [{ text: string, type: string, onClick: function, disabled?: boolean, id?: string }]
     *   Types disponibles: 'primary', 'success', 'warning', 'info', 'danger'
     */
    constructor(container, buttonsConfig) {
        this.container = container;
        this.buttonsConfig = buttonsConfig;
        this.buttons = [];
        this.render();
    }

    /**
     * Génère et affiche les boutons
     */
    render() {
        // Créer un conteneur pour les boutons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'controls-buttons';

        this.buttonsConfig.forEach((config, index) => {
            const button = this.createButton(config, index);
            this.buttons.push(button);
            buttonsContainer.appendChild(button);
        });

        this.container.innerHTML = '';
        this.container.appendChild(buttonsContainer);
    }

    /**
     * Crée un bouton selon sa configuration
     * @param {Object} config - Configuration du bouton
     * @param {number} index - Index du bouton
     * @returns {HTMLButtonElement}
     */
    createButton(config, index) {
        const button = document.createElement('button');

        // Classes CSS
        button.className = `btn btn-${config.type || 'primary'}`;

        // Texte
        button.textContent = config.text;

        // ID optionnel
        if (config.id) {
            button.id = config.id;
        } else {
            button.setAttribute('data-btn-index', index);
        }

        // Désactivation
        if (config.disabled) {
            button.disabled = true;
        }

        // Style optionnel
        if (config.style) {
            Object.assign(button.style, config.style);
        }

        // Event listener
        if (config.onClick && !config.disabled) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                config.onClick(e);
            });
        }

        return button;
    }

    /**
     * Active ou désactive un bouton par son index
     * @param {number} index - Index du bouton
     * @param {boolean} enabled - true pour activer, false pour désactiver
     */
    setButtonEnabled(index, enabled) {
        if (this.buttons[index]) {
            this.buttons[index].disabled = !enabled;
        }
    }

    /**
     * Change le texte d'un bouton
     * @param {number} index - Index du bouton
     * @param {string} text - Nouveau texte
     */
    setButtonText(index, text) {
        if (this.buttons[index]) {
            this.buttons[index].textContent = text;
        }
    }

    /**
     * Récupère un bouton par son index
     * @param {number} index - Index du bouton
     * @returns {HTMLButtonElement|null}
     */
    getButton(index) {
        return this.buttons[index] || null;
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        // Les event listeners sont automatiquement supprimés quand les éléments sont retirés du DOM
        this.buttons = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Re-render le composant avec une nouvelle configuration
     * @param {Array<Object>} newConfig - Nouvelle configuration
     */
    update(newConfig) {
        this.cleanup();
        this.buttonsConfig = newConfig;
        this.render();
    }
}
