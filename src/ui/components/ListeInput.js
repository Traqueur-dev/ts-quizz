import { escapeHtml } from '../../utils/DOMHelpers.js';
import Timer from './Timer.js';

/**
 * Composant ListeInput - Saisie de liste avec chronomètre
 *
 * Permet à un joueur de saisir une liste d'items avec un timer
 */
export default class ListeInput {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Object} options - Configuration
     *   - playerName: string - Nom du joueur
     *   - timerDuration: number - Durée du timer en secondes
     *   - initialValue: string - Valeur initiale du textarea
     *   - onTextChange: Function - Callback appelé quand le texte change
     *   - onTimerComplete: Function - Callback appelé quand le timer se termine
     */
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.timerStarted = false;

        this.render();
    }

    /**
     * Affiche l'interface de saisie
     */
    render() {
        this.container.innerHTML = `
            <div class="liste-input">
                <div class="liste-header">
                    <h3 class="liste-player-name">${escapeHtml(this.options.playerName)}</h3>
                    <p class="liste-instructions">Écrivez votre liste (un item par ligne)</p>
                </div>
                <div id="timerContainer"></div>
                <textarea
                    class="liste-textarea"
                    id="listeTextarea"
                    placeholder="Exemple:&#10;Item 1&#10;Item 2&#10;Item 3&#10;..."
                    rows="10"
                >${escapeHtml(this.options.initialValue || '')}</textarea>
                <div class="liste-count" id="listeCount">0 items</div>
            </div>
        `;

        this.textarea = this.container.querySelector('#listeTextarea');
        this.countDisplay = this.container.querySelector('#listeCount');

        // Instancier le timer
        this.timer = new Timer(
            this.container.querySelector('#timerContainer'),
            {
                duration: this.options.timerDuration,
                onTick: (timeRemaining) => this.onTimerTick(timeRemaining),
                onComplete: () => this.onTimerComplete()
            }
        );

        this.bindEvents();
        this.updateCount();
    }

    /**
     * Bind les événements
     */
    bindEvents() {
        this.textarea.addEventListener('input', () => {
            this.updateCount();
            if (this.options.onTextChange) {
                this.options.onTextChange(this.textarea.value);
            }
        });
    }

    /**
     * Met à jour le compte d'items
     */
    updateCount() {
        const items = this.getItems();
        const count = items.length;
        this.countDisplay.textContent = `${count} item${count > 1 ? 's' : ''}`;
    }

    /**
     * Récupère les items non vides de la liste
     * @returns {Array<string>}
     */
    getItems() {
        const text = this.textarea.value;
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    /**
     * Démarre le timer
     */
    startTimer() {
        if (!this.timerStarted) {
            this.timer.start();
            this.timerStarted = true;
            this.textarea.focus();
        }
    }

    /**
     * Callback appelé à chaque tick du timer
     */
    onTimerTick(timeRemaining) {
        // On pourrait ajouter des effets visuels ici
        if (timeRemaining <= 10) {
            this.textarea.classList.add('warning');
        }
    }

    /**
     * Callback appelé quand le timer se termine
     */
    onTimerComplete() {
        // Désactiver le textarea
        this.textarea.disabled = true;
        this.textarea.classList.add('disabled');
        this.textarea.classList.remove('warning');

        // Callback externe
        if (this.options.onTimerComplete) {
            this.options.onTimerComplete();
        }
    }

    /**
     * Récupère la valeur du textarea
     * @returns {string}
     */
    getValue() {
        return this.textarea.value;
    }

    /**
     * Définit la valeur du textarea
     * @param {string} value
     */
    setValue(value) {
        this.textarea.value = value;
        this.updateCount();
    }

    /**
     * Compte le nombre d'items
     * @returns {number}
     */
    getItemCount() {
        return this.getItems().length;
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        if (this.timer) {
            this.timer.cleanup();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
