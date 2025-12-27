/**
 * Composant VFButtons - Boutons Vrai/Faux pour répondre aux questions
 *
 * Affiche deux boutons (Vrai/Faux) et permet de sélectionner une réponse
 */
export default class VFButtons {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Function} onAnswer - Callback appelé quand une réponse est sélectionnée
     */
    constructor(container, onAnswer) {
        this.container = container;
        this.onAnswer = onAnswer;
        this.selectedAnswer = null;

        this.render();
    }

    /**
     * Affiche les boutons Vrai/Faux
     */
    render() {
        this.container.innerHTML = `
            <div class="vf-buttons">
                <button class="vf-button vf-true" id="btnTrue" data-value="true">
                    <span class="vf-icon">✓</span>
                    <span class="vf-label">VRAI</span>
                </button>
                <button class="vf-button vf-false" id="btnFalse" data-value="false">
                    <span class="vf-icon">✗</span>
                    <span class="vf-label">FAUX</span>
                </button>
            </div>
        `;

        this.bindEvents();
    }

    /**
     * Bind les événements
     */
    bindEvents() {
        const btnTrue = this.container.querySelector('#btnTrue');
        const btnFalse = this.container.querySelector('#btnFalse');

        btnTrue.addEventListener('click', () => this.selectAnswer(true));
        btnFalse.addEventListener('click', () => this.selectAnswer(false));
    }

    /**
     * Sélectionne une réponse
     * @param {boolean} value - true pour Vrai, false pour Faux
     */
    selectAnswer(value) {
        this.selectedAnswer = value;
        this.highlight(value);

        if (this.onAnswer) {
            this.onAnswer(value);
        }
    }

    /**
     * Met en surbrillance le bouton sélectionné
     * @param {boolean} value - true pour Vrai, false pour Faux
     */
    highlight(value) {
        const btnTrue = this.container.querySelector('#btnTrue');
        const btnFalse = this.container.querySelector('#btnFalse');

        btnTrue.classList.remove('selected');
        btnFalse.classList.remove('selected');

        if (value === true) {
            btnTrue.classList.add('selected');
        } else if (value === false) {
            btnFalse.classList.add('selected');
        }
    }

    /**
     * Désactive les boutons
     */
    disable() {
        const buttons = this.container.querySelectorAll('.vf-button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }

    /**
     * Active les boutons
     */
    enable() {
        const buttons = this.container.querySelectorAll('.vf-button');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
    }

    /**
     * Réinitialise la sélection
     */
    reset() {
        this.selectedAnswer = null;
        const buttons = this.container.querySelectorAll('.vf-button');
        buttons.forEach(btn => btn.classList.remove('selected'));
    }

    /**
     * Récupère la réponse sélectionnée
     * @returns {boolean|null}
     */
    getSelectedAnswer() {
        return this.selectedAnswer;
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
