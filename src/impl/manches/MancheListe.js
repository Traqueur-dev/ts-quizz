/**
 * MancheListe - Manche avec saisie de liste chronométrée
 *
 * Les deux joueurs écrivent une liste d'items (un par ligne)
 * avec un chronomètre. Le joueur avec le plus d'items gagne.
 */
import Manche from '../../api/Manche.js';
import { ControlButtons, AnswerReveal, ListeInput } from '../../ui/components/index.js';

export default class MancheListe extends Manche {
    /**
     * Retourne le label d'affichage pour ce type de manche
     * @returns {string}
     */
    static getTypeLabel() {
        return 'Liste';
    }

    /**
     * Initialise les métadonnées spécifiques à la liste
     */
    loadMetadata() {
        this.metadata = {
            currentPlayer: 'player1',
            listeAnswers: { player1: '', player2: '' },
            listeScores: { player1: 0, player2: 0 },
            phase: 'input', // 'input' | 'results'
            answerRevealed: false
        };
    }

    /**
     * Affiche l'interface de la manche
     */
    render() {
        if (this.metadata.phase === 'input') {
            this.renderInput();
        } else {
            this.renderResults();
        }
    }

    /**
     * Affiche l'interface de saisie pour un joueur
     */
    renderInput() {
        const playerKey = this.metadata.currentPlayer;
        const playerName = this.config.players[playerKey].name;
        const timerDuration = this.config.game.listeTimerDuration;

        this.container.innerHTML = `
            <div class="liste-manche">
                <div class="question-display">
                    <p class="question-text">${this.escapeHtml(this.mancheData.question)}</p>
                </div>
                <div id="listeInputContainer"></div>
                <div id="controls"></div>
            </div>
        `;

        // Instancier ListeInput
        this.listeInput = new ListeInput(
            this.container.querySelector('#listeInputContainer'),
            {
                playerName: playerName,
                timerDuration: timerDuration,
                initialValue: this.metadata.listeAnswers[playerKey],
                onTextChange: (text) => {
                    this.metadata.listeAnswers[playerKey] = text;
                },
                onTimerComplete: () => {
                    // Optionnel: auto-passer au joueur suivant
                }
            }
        );

        // Créer les boutons de contrôle
        const buttonsConfig = [
            {
                text: `⏱️ Démarrer le chrono (${timerDuration}s)`,
                type: 'warning',
                onClick: () => this.startTimer()
            },
            {
                text: '✅ Terminer et passer au joueur suivant',
                type: 'primary',
                onClick: () => this.switchPlayer()
            }
        ];

        this.controlButtons = new ControlButtons(
            this.container.querySelector('#controls'),
            buttonsConfig
        );
    }

    /**
     * Démarre le timer
     */
    startTimer() {
        if (this.listeInput) {
            this.listeInput.startTimer();
        }
    }

    /**
     * Passe au joueur suivant ou affiche les résultats
     */
    switchPlayer() {
        if (this.metadata.currentPlayer === 'player1') {
            // Passer au joueur 2
            this.metadata.currentPlayer = 'player2';
            this.render();
        } else {
            // Les deux joueurs ont fini, passer aux résultats
            this.metadata.phase = 'results';
            this.calculateScores();
            this.render();
        }
    }

    /**
     * Calcule les scores (nombre d'items non vides)
     */
    calculateScores() {
        const text1 = this.metadata.listeAnswers.player1;
        const text2 = this.metadata.listeAnswers.player2;

        this.metadata.listeScores.player1 = text1
            .split('\n')
            .filter(line => line.trim().length > 0).length;

        this.metadata.listeScores.player2 = text2
            .split('\n')
            .filter(line => line.trim().length > 0).length;
    }

    /**
     * Affiche les résultats
     */
    renderResults() {
        const player1Name = this.config.players.player1.name;
        const player2Name = this.config.players.player2.name;
        const count1 = this.metadata.listeScores.player1;
        const count2 = this.metadata.listeScores.player2;

        // Préparer les listes de réponses
        const answers1 = this.metadata.listeAnswers.player1
            .split('\n')
            .filter(line => line.trim().length > 0);
        const answers2 = this.metadata.listeAnswers.player2
            .split('\n')
            .filter(line => line.trim().length > 0);

        this.container.innerHTML = `
            <div class="liste-manche">
                <div class="question-display">
                    <p class="question-text">Résultats</p>
                </div>
                <div class="liste-results">
                    <div class="liste-result-card">
                        <h3>${this.escapeHtml(player1Name)}</h3>
                        <div class="liste-score">${count1}</div>
                        <div class="liste-label">item${count1 > 1 ? 's' : ''}</div>
                        <div class="liste-answers">
                            ${answers1.map(answer => `<div class="liste-answer-item">• ${this.escapeHtml(answer)}</div>`).join('')}
                        </div>
                    </div>
                    <div class="liste-result-card">
                        <h3>${this.escapeHtml(player2Name)}</h3>
                        <div class="liste-score">${count2}</div>
                        <div class="liste-label">item${count2 > 1 ? 's' : ''}</div>
                        <div class="liste-answers">
                            ${answers2.map(answer => `<div class="liste-answer-item">• ${this.escapeHtml(answer)}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div id="answerReveal"></div>
                <div id="controls"></div>
            </div>
        `;

        // Instancier AnswerReveal
        this.answerReveal = new AnswerReveal(
            this.container.querySelector('#answerReveal')
        );

        // Créer les boutons de contrôle
        const buttonsConfig = [
            {
                text: '📖 Afficher/Masquer la réponse attendue',
                type: 'info',
                onClick: () => this.toggleAnswer()
            },
            {
                text: '🏆 Déterminer le gagnant',
                type: 'success',
                onClick: () => this.determineWinner()
            }
        ];

        this.controlButtons = new ControlButtons(
            this.container.querySelector('#controls'),
            buttonsConfig
        );
    }

    /**
     * Toggle l'affichage de la réponse attendue
     */
    toggleAnswer() {
        this.answerReveal.toggle(this.mancheData.answer);
        this.metadata.answerRevealed = this.answerReveal.isShown();
    }

    /**
     * Détermine le gagnant selon le nombre d'items
     */
    determineWinner() {
        const count1 = this.metadata.listeScores.player1;
        const count2 = this.metadata.listeScores.player2;

        if (count1 > count2) {
            this.winner = 'player1';
        } else if (count2 > count1) {
            this.winner = 'player2';
        } else {
            this.winner = null; // Égalité
        }

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
        return './assets/styles/manches/liste.css';
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        if (this.listeInput) {
            this.listeInput.cleanup();
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
