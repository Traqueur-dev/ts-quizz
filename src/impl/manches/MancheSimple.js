/**
 * MancheSimple - Implémentation de la manche de type "simple"
 *
 * Manche la plus basique du quiz:
 * - Affiche une question
 * - Bouton pour révéler la réponse
 * - Boutons pour attribuer la victoire à un joueur ou passer
 *
 * Sert de prototype pour valider l'architecture polymorphique
 */
import Manche from '../../api/Manche.js';
import { ControlButtons, AnswerReveal } from '../../ui/components/index.js';

export default class MancheSimple extends Manche {
    /**
     * Retourne le label d'affichage pour ce type de manche
     * @returns {string}
     */
    static getTypeLabel() {
        return 'Question simple';
    }

    /**
     * Initialise les métadonnées spécifiques à cette manche
     */
    loadMetadata() {
        this.metadata = {
            answerRevealed: false
        };
    }

    /**
     * Affiche l'UI de la manche simple
     */
    render() {
        const player1Name = this.getPlayerName('player1');
        const player2Name = this.getPlayerName('player2');

        // Créer la structure HTML
        this.container.innerHTML = `
            <div class="simple-manche">
                <div class="question-display">
                    <p class="question-text">${this.escapeHtml(this.mancheData.question)}</p>
                </div>
                <div id="answerReveal"></div>
                <div id="controls"></div>
            </div>
        `;

        // Initialiser le composant de révélation de réponse
        const answerRevealContainer = this.container.querySelector('#answerReveal');
        this.answerReveal = new AnswerReveal(answerRevealContainer);

        // Restaurer l'état si la réponse était déjà révélée
        if (this.metadata.answerRevealed && this.mancheData.answer) {
            this.answerReveal.show(this.mancheData.answer);
        }

        // Initialiser les boutons de contrôle
        const controlsContainer = this.container.querySelector('#controls');
        this.controlButtons = new ControlButtons(controlsContainer, [
            {
                text: '📖 Afficher/Masquer la réponse',
                type: 'info',
                onClick: () => this.toggleAnswer()
            },
            {
                text: `✅ ${player1Name} gagne`,
                type: 'success',
                onClick: () => this.awardWinner('player1')
            },
            {
                text: `✅ ${player2Name} gagne`,
                type: 'success',
                onClick: () => this.awardWinner('player2')
            },
            {
                text: '⏭️ Manche suivante',
                type: 'primary',
                onClick: () => this.skip()
            }
        ]);
    }

    /**
     * Toggle l'affichage de la réponse
     */
    toggleAnswer() {
        if (this.mancheData.answer) {
            this.answerReveal.toggle(this.mancheData.answer);
            this.metadata.answerRevealed = this.answerReveal.isShown();
        }
    }

    /**
     * Attribue la victoire à un joueur
     * @param {string} playerKey - 'player1' ou 'player2'
     */
    awardWinner(playerKey) {
        this.winner = playerKey;
        this.ended = true;
    }

    /**
     * Passe à la manche suivante sans attribuer de points
     */
    skip() {
        this.winner = null;
        this.ended = true;
    }

    /**
     * Retourne les résultats de la manche
     * @returns {Object} { winner, points }
     */
    onEnded() {
        return {
            winner: this.winner,
            points: this.winner ? this.mancheData.points : 0
        };
    }

    /**
     * Nettoie les ressources de la manche
     */
    cleanup() {
        if (this.controlButtons) {
            this.controlButtons.cleanup();
        }
        if (this.answerReveal) {
            this.answerReveal.cleanup();
        }
        super.cleanup();
    }

    /**
     * Échappe les caractères HTML pour éviter les injections
     * @param {string} text - Texte à échapper
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
