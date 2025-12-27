/**
 * MancheIndices - Manche avec indices progressifs
 *
 * Affiche 4 indices progressivement avec points dégressifs [4, 3, 2, 1]
 * Le joueur peut demander des indices, mais perd des points à chaque révélation
 */
import Manche from '../../api/Manche.js';
import { ControlButtons, AnswerReveal, IndicesDisplay } from '../../ui/components/index.js';

export default class MancheIndices extends Manche {
    /**
     * Retourne le label d'affichage pour ce type de manche
     * @returns {string}
     */
    static getTypeLabel() {
        return 'Indices progressifs';
    }

    /**
     * Initialise les métadonnées spécifiques aux indices
     */
    loadMetadata() {
        this.metadata = {
            indiceIndex: 0,      // Nombre d'indices révélés (0-4)
            answerRevealed: false
        };
    }

    /**
     * Affiche l'interface de la manche indices
     */
    render() {
        const player1Name = this.config.players.player1.name;
        const player2Name = this.config.players.player2.name;

        // Structure HTML de la manche
        this.container.innerHTML = `
            <div class="indices-manche">
                <div class="question-display">
                    <p class="question-text">${this.escapeHtml(this.mancheData.question)}</p>
                </div>
                <div id="indicesContainer"></div>
                <div id="answerReveal"></div>
                <div id="controls"></div>
            </div>
        `;

        // Instancier IndicesDisplay
        this.indicesDisplay = new IndicesDisplay(
            this.container.querySelector('#indicesContainer'),
            {
                indices: this.mancheData.indices,
                pointsProgression: this.mancheData.pointsProgression || [4, 3, 2, 1],
                currentIndex: this.metadata.indiceIndex
            }
        );

        // Instancier AnswerReveal
        this.answerReveal = new AnswerReveal(
            this.container.querySelector('#answerReveal')
        );

        // Créer les boutons de contrôle
        this.createControls(player1Name, player2Name);
    }

    /**
     * Crée les boutons de contrôle
     */
    createControls(player1Name, player2Name) {
        const buttonsConfig = [
            {
                text: '💡 Indice suivant',
                type: 'info',
                onClick: () => this.showNextIndice(),
                disabled: this.metadata.indiceIndex >= 4,
                id: 'btnNextIndice'
            },
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
        ];

        this.controlButtons = new ControlButtons(
            this.container.querySelector('#controls'),
            buttonsConfig
        );
    }

    /**
     * Révèle l'indice suivant
     */
    showNextIndice() {
        if (this.metadata.indiceIndex < 4) {
            this.metadata.indiceIndex++;
            this.indicesDisplay.revealIndice(this.metadata.indiceIndex);

            // Désactiver le bouton si tous les indices sont révélés
            if (this.metadata.indiceIndex >= 4) {
                const btnNextIndice = this.container.querySelector('#btnNextIndice');
                if (btnNextIndice) {
                    btnNextIndice.disabled = true;
                    btnNextIndice.classList.add('disabled');
                }
            }
        }
    }

    /**
     * Toggle l'affichage de la réponse
     */
    toggleAnswer() {
        this.answerReveal.toggle(this.mancheData.answer);
        this.metadata.answerRevealed = this.answerReveal.isShown();
    }

    /**
     * Attribue la victoire à un joueur
     * @param {string} playerKey - 'player1' ou 'player2'
     */
    awardWinner(playerKey) {
        this.winner = playerKey;
        this.winnerIndiceCount = this.metadata.indiceIndex;
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
     * Callback appelé quand la manche se termine
     * @returns {Object} { winner, points }
     */
    onEnded() {
        const pointsProgression = this.mancheData.pointsProgression || [4, 3, 2, 1];

        // Calculer les points selon le nombre d'indices révélés
        let points = 0;
        if (this.winner) {
            // Si aucun indice révélé, donner les points max (4)
            // Si 1 indice révélé, donner pointsProgression[0] = 4
            // Si 2 indices révélés, donner pointsProgression[1] = 3
            // etc.
            if (this.winnerIndiceCount === 0) {
                points = pointsProgression[0];
            } else {
                points = pointsProgression[this.winnerIndiceCount - 1] || 1;
            }
        }

        return {
            winner: this.winner,
            points: points
        };
    }

    /**
     * Retourne le chemin du fichier CSS
     * @returns {string}
     */
    getCSSPath() {
        return './assets/styles/manches/indices.css';
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        if (this.indicesDisplay) {
            this.indicesDisplay.cleanup();
        }
        if (this.answerReveal) {
            this.answerReveal.cleanup();
        }
        if (this.controlButtons) {
            this.controlButtons.cleanup();
        }
        super.cleanup();
    }
}
