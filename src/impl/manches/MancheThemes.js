/**
 * MancheThemes - Manche avec sélection de 4 thèmes
 *
 * Phase 1: Sélection alternée de 4 thèmes (2 par joueur)
 * Phase 2: Questions (2 par thème, alternance joueurs)
 * Phase 3: Résultats et détermination du gagnant
 */
import Manche from '../../api/Manche.js';
import { ControlButtons, AnswerReveal, ThemeSelector } from '../../ui/components/index.js';

export default class MancheThemes extends Manche {
    /**
     * Retourne le label d'affichage pour ce type de manche
     * @returns {string}
     */
    static getTypeLabel() {
        return '4 Thèmes';
    }

    /**
     * Initialise les métadonnées spécifiques aux thèmes
     */
    loadMetadata() {
        this.metadata = {
            selectedThemes: [],
            playerThemes: { player1: [], player2: [] },
            themeOwners: {}, // Qui a choisi quel thème
            currentPlayer: 'player1',
            themeSelectionTurn: 0,
            themeScores: { player1: 0, player2: 0 },
            currentThemeIndex: 0,
            currentQuestionIndex: 0,
            phase: 'selection', // 'selection' | 'playing' | 'results'
            currentThemeSelection: null
        };
    }

    /**
     * Affiche l'interface selon la phase
     */
    render() {
        if (this.metadata.phase === 'selection') {
            this.renderThemeSelection();
        } else if (this.metadata.phase === 'playing') {
            this.renderQuestions();
        } else {
            this.renderResults();
        }
    }

    /**
     * Phase 1: Sélection des thèmes
     */
    renderThemeSelection() {
        const playerName = this.config.players[this.metadata.currentPlayer].name;
        const themeNumber = this.metadata.playerThemes[this.metadata.currentPlayer].length + 1;

        this.container.innerHTML = `
            <div class="themes-manche">
                <div class="question-display">
                    <p class="question-text">${this.escapeHtml(playerName)} : Choisissez votre thème (${themeNumber}/2)</p>
                </div>
                <div id="themeSelectorContainer"></div>
                <div id="controls"></div>
            </div>
        `;

        // Instancier ThemeSelector
        this.themeSelector = new ThemeSelector(
            this.container.querySelector('#themeSelectorContainer'),
            {
                themes: this.mancheData.themes,
                selectedThemes: this.metadata.selectedThemes,
                currentPlayer: this.metadata.currentPlayer,
                onThemeSelect: (themeKey) => {
                    this.metadata.currentThemeSelection = themeKey;
                }
            }
        );

        // Créer les boutons de contrôle
        const buttonsConfig = [
            {
                text: '✅ Confirmer mon thème',
                type: 'primary',
                onClick: () => this.confirmPlayerTheme()
            }
        ];

        this.controlButtons = new ControlButtons(
            this.container.querySelector('#controls'),
            buttonsConfig
        );
    }

    /**
     * Confirme le thème sélectionné par le joueur actuel
     */
    confirmPlayerTheme() {
        if (!this.metadata.currentThemeSelection) {
            alert('Vous devez choisir un thème !');
            return;
        }

        // Sauvegarder le thème et son propriétaire
        this.metadata.selectedThemes.push(this.metadata.currentThemeSelection);
        this.metadata.playerThemes[this.metadata.currentPlayer].push(this.metadata.currentThemeSelection);
        this.metadata.themeOwners[this.metadata.currentThemeSelection] = this.metadata.currentPlayer;

        // Confirmer visuellement
        this.themeSelector.confirmTheme(this.metadata.currentPlayer);

        this.metadata.currentThemeSelection = null;
        this.metadata.themeSelectionTurn++;

        // Alterner entre les joueurs
        if (this.metadata.themeSelectionTurn < 4) {
            this.metadata.currentPlayer = this.metadata.currentPlayer === 'player1' ? 'player2' : 'player1';
            this.render();
        } else {
            // Tous les thèmes sont choisis, passer aux questions
            this.metadata.phase = 'playing';
            // Le joueur actuel est le propriétaire du premier thème
            const firstTheme = this.metadata.selectedThemes[0];
            this.metadata.currentPlayer = this.metadata.themeOwners[firstTheme];
            this.metadata.currentThemeIndex = 0;
            this.metadata.currentQuestionIndex = 0;
            this.render();
        }
    }

    /**
     * Phase 2: Questions
     */
    renderQuestions() {
        const themeKey = this.metadata.selectedThemes[this.metadata.currentThemeIndex];
        const theme = this.mancheData.themes[themeKey];
        const question = theme.questions[this.metadata.currentQuestionIndex];
        const playerName = this.config.players[this.metadata.currentPlayer].name;
        const player1Name = this.config.players.player1.name;
        const player2Name = this.config.players.player2.name;

        this.container.innerHTML = `
            <div class="themes-manche">
                <div class="themes-header">
                    <div class="theme-title-display">${this.escapeHtml(theme.title)}</div>
                    <div class="theme-progress">Question ${this.metadata.currentQuestionIndex + 1}/2 - ${this.escapeHtml(playerName)}</div>
                </div>
                <div class="question-display">
                    <p class="question-text">${this.escapeHtml(question.question)}</p>
                </div>
                <div class="themes-score">
                    <div class="themes-player-score">${this.escapeHtml(player1Name)}: ${this.metadata.themeScores.player1}</div>
                    <div class="themes-player-score">${this.escapeHtml(player2Name)}: ${this.metadata.themeScores.player2}</div>
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
                text: '📖 Afficher/Masquer la réponse',
                type: 'info',
                onClick: () => this.toggleAnswer(question.answer)
            },
            {
                text: `✅ ${playerName} trouve`,
                type: 'success',
                onClick: () => this.answerQuestion(true)
            },
            {
                text: `❌ ${playerName} ne trouve pas`,
                type: 'danger',
                onClick: () => this.answerQuestion(false)
            }
        ];

        this.controlButtons = new ControlButtons(
            this.container.querySelector('#controls'),
            buttonsConfig
        );
    }

    /**
     * Toggle l'affichage de la réponse
     */
    toggleAnswer(answer) {
        if (this.answerReveal) {
            this.answerReveal.toggle(answer);
        }
    }

    /**
     * Enregistre la réponse à la question et passe à la suivante
     * @param {boolean} isCorrect - Le joueur a-t-il trouvé la réponse ?
     */
    answerQuestion(isCorrect) {
        if (isCorrect) {
            this.metadata.themeScores[this.metadata.currentPlayer]++;
        }

        // Passer à la question suivante
        this.metadata.currentQuestionIndex++;

        if (this.metadata.currentQuestionIndex < 2) {
            // Il reste une question dans ce thème, même joueur continue
            this.render();
        } else {
            // Thème terminé, passer au thème suivant
            this.metadata.currentThemeIndex++;
            this.metadata.currentQuestionIndex = 0;

            if (this.metadata.currentThemeIndex < 4) {
                // Il reste des thèmes, passer au propriétaire du prochain thème
                const nextTheme = this.metadata.selectedThemes[this.metadata.currentThemeIndex];
                this.metadata.currentPlayer = this.metadata.themeOwners[nextTheme];
                this.render();
            } else {
                // Tous les thèmes terminés, passer aux résultats
                this.metadata.phase = 'results';
                this.render();
            }
        }
    }

    /**
     * Phase 3: Résultats
     */
    renderResults() {
        const player1Name = this.config.players.player1.name;
        const player2Name = this.config.players.player2.name;
        const score1 = this.metadata.themeScores.player1;
        const score2 = this.metadata.themeScores.player2;

        this.container.innerHTML = `
            <div class="themes-manche">
                <div class="question-display">
                    <p class="question-text">Résultats des Thèmes</p>
                </div>
                <div class="themes-final-scores">
                    <div class="themes-final-card ${score1 > score2 ? 'winner' : ''}">
                        <h3>${this.escapeHtml(player1Name)}</h3>
                        <div class="themes-final-score">${score1}</div>
                        <div class="themes-final-label">bonne${score1 > 1 ? 's' : ''} réponse${score1 > 1 ? 's' : ''}</div>
                    </div>
                    <div class="themes-final-card ${score2 > score1 ? 'winner' : ''}">
                        <h3>${this.escapeHtml(player2Name)}</h3>
                        <div class="themes-final-score">${score2}</div>
                        <div class="themes-final-label">bonne${score2 > 1 ? 's' : ''} réponse${score2 > 1 ? 's' : ''}</div>
                    </div>
                </div>
            </div>
        `;

        // Déterminer automatiquement le gagnant après 5 secondes pour laisser le temps de voir les résultats
        setTimeout(() => {
            this.determineWinner();
        }, 5000);
    }

    /**
     * Détermine le gagnant selon les scores et attribue les points
     */
    determineWinner() {
        const score1 = this.metadata.themeScores.player1;
        const score2 = this.metadata.themeScores.player2;

        if (score1 > score2) {
            this.winner = 'player1';
        } else if (score2 > score1) {
            this.winner = 'player2';
        } else {
            this.winner = null; // Égalité
        }

        this.ended = true;

        // Attribuer les points au gagnant
        if (this.winner) {
            this.gameState.addPoints(this.winner, this.mancheData.points);
        }
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
        return './assets/styles/manches/themes.css';
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        if (this.themeSelector) {
            this.themeSelector.cleanup();
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
