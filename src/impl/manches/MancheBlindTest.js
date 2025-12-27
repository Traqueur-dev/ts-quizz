/**
 * MancheBlindTest - Manche avec lecteur audio/YouTube
 *
 * Gère la lecture d'extraits audio (YouTube ou MP3)
 * avec contrôle du volume
 */
import Manche from '../../api/Manche.js';
import { ControlButtons, AnswerReveal, AudioPlayer } from '../../ui/components/index.js';

export default class MancheBlindTest extends Manche {
    /**
     * Retourne le label d'affichage pour ce type de manche
     * @returns {string}
     */
    static getTypeLabel() {
        return 'Blind test';
    }

    /**
     * Initialise les métadonnées spécifiques au blind test
     */
    loadMetadata() {
        this.metadata = {
            volume: 50,
            answerRevealed: false
        };
    }

    /**
     * Affiche l'interface de la manche blind test
     */
    render() {
        const player1Name = this.config.players.player1.name;
        const player2Name = this.config.players.player2.name;

        // Structure HTML de la manche
        this.container.innerHTML = `
            <div class="blindtest-manche">
                <div class="question-display">
                    <p class="question-text">${this.escapeHtml(this.mancheData.question)}</p>
                </div>
                <div id="audioPlayerContainer"></div>
                <div id="answerReveal"></div>
                <div id="controls"></div>
            </div>
        `;

        // Instancier AudioPlayer
        this.audioPlayer = new AudioPlayer(
            this.container.querySelector('#audioPlayerContainer'),
            {
                youtubeId: this.mancheData.youtubeId,
                audioFile: this.mancheData.audioFile,
                startTime: this.mancheData.startTime || 0,
                volume: this.metadata.volume,
                onVolumeChange: (vol) => {
                    this.metadata.volume = vol;
                }
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
                text: '📖 Révéler la réponse',
                type: 'info',
                onClick: () => this.revealAnswer()
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
     * Révèle la réponse
     */
    revealAnswer() {
        if (!this.metadata.answerRevealed) {
            this.answerReveal.show(this.mancheData.answer);
            this.metadata.answerRevealed = true;
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
     * Callback appelé quand la manche se termine
     * @returns {Object} { winner, points }
     */
    onEnded() {
        return {
            winner: this.winner,
            points: this.winner ? this.mancheData.points : 0
        };
    }

    /**
     * Retourne le chemin du fichier CSS
     * @returns {string}
     */
    getCSSPath() {
        return './assets/styles/manches/blindtest.css';
    }

    /**
     * Nettoie les ressources
     * IMPORTANT: Détruire le player YouTube pour éviter les fuites mémoire
     */
    cleanup() {
        if (this.audioPlayer) {
            this.audioPlayer.cleanup();
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
