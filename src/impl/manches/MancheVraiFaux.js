/**
 * MancheVraiFaux - Manche avec questions Vrai/Faux
 *
 * Les deux joueurs répondent à chaque question
 * On compare ensuite les bonnes réponses
 */
import Manche from '../../api/Manche.js';
import { ControlButtons, VFButtons } from '../../ui/components/index.js';

export default class MancheVraiFaux extends Manche {
    /**
     * Retourne le label d'affichage pour ce type de manche
     * @returns {string}
     */
    static getTypeLabel() {
        return 'Vrai ou Faux';
    }

    /**
     * Initialise les métadonnées spécifiques au vrai/faux
     */
    loadMetadata() {
        this.metadata = {
            currentPlayer: 'player1',
            vfQuestionIndex: 0,
            vfAnswers: [], // [{player1: bool, player2: bool}, ...]
            vfPlayerAnswers: { player1: null, player2: null },
            finalScores: { player1: 0, player2: 0 },
            phase: 'answering' // 'answering' | 'results'
        };
    }

    /**
     * Affiche l'interface de la manche
     */
    render() {
        if (this.metadata.phase === 'answering') {
            this.renderQuestion();
        } else {
            this.renderResults();
        }
    }

    /**
     * Affiche une question pour le joueur actuel
     */
    renderQuestion() {
        const playerKey = this.metadata.currentPlayer;
        const playerName = this.config.players[playerKey].name;
        const currentQuestion = this.mancheData.questions[this.metadata.vfQuestionIndex];

        this.container.innerHTML = `
            <div class="vraifaux-manche">
                <div class="question-display">
                    <div class="vf-player-name">${this.escapeHtml(playerName)}, à vous de répondre :</div>
                    <p class="question-text">${this.escapeHtml(currentQuestion.question)}</p>
                </div>
                <div id="vfButtonsContainer"></div>
                <div id="controls"></div>
            </div>
        `;

        // Instancier VFButtons
        this.vfButtons = new VFButtons(
            this.container.querySelector('#vfButtonsContainer'),
            (answer) => this.answerVF(answer)
        );

        // Créer les boutons de contrôle
        const buttonsConfig = [
            {
                text: '✅ Confirmer ma réponse',
                type: 'info',
                onClick: () => this.confirmVFAnswer()
            }
        ];

        this.controlButtons = new ControlButtons(
            this.container.querySelector('#controls'),
            buttonsConfig
        );
    }

    /**
     * Enregistre la réponse du joueur actuel
     * @param {boolean} answer - true pour Vrai, false pour Faux
     */
    answerVF(answer) {
        this.metadata.vfPlayerAnswers[this.metadata.currentPlayer] = answer;
    }

    /**
     * Confirme la réponse et passe au joueur suivant ou à la question suivante
     */
    confirmVFAnswer() {
        const playerAnswer = this.metadata.vfPlayerAnswers[this.metadata.currentPlayer];

        if (playerAnswer === null) {
            alert('Veuillez choisir une réponse (VRAI ou FAUX) avant de confirmer !');
            return;
        }

        // Passer au joueur suivant ou à la question suivante
        if (this.metadata.currentPlayer === 'player1') {
            // Passer au joueur 2
            this.metadata.currentPlayer = 'player2';
            this.render();
        } else {
            // Les deux ont répondu à cette question
            this.metadata.vfAnswers.push({
                player1: this.metadata.vfPlayerAnswers.player1,
                player2: this.metadata.vfPlayerAnswers.player2
            });

            // Réinitialiser les réponses
            this.metadata.vfPlayerAnswers = { player1: null, player2: null };

            // Passer à la question suivante
            this.metadata.vfQuestionIndex++;

            if (this.metadata.vfQuestionIndex < this.mancheData.questions.length) {
                // Il reste des questions
                this.metadata.currentPlayer = 'player1';
                this.render();
            } else {
                // Toutes les questions ont été répondues
                this.metadata.phase = 'results';
                this.calculateScores();
                this.render();
            }
        }
    }

    /**
     * Calcule les scores finaux
     */
    calculateScores() {
        this.metadata.finalScores = { player1: 0, player2: 0 };

        this.mancheData.questions.forEach((question, index) => {
            const answers = this.metadata.vfAnswers[index];
            const correctAnswer = question.answer;

            if (answers.player1 === correctAnswer) {
                this.metadata.finalScores.player1++;
            }
            if (answers.player2 === correctAnswer) {
                this.metadata.finalScores.player2++;
            }
        });
    }

    /**
     * Affiche les résultats
     */
    renderResults() {
        const player1Name = this.config.players.player1.name;
        const player2Name = this.config.players.player2.name;
        const score1 = this.metadata.finalScores.player1;
        const score2 = this.metadata.finalScores.player2;

        // Générer le HTML des questions avec les réponses
        let questionsHTML = '';
        this.mancheData.questions.forEach((question, index) => {
            const answers = this.metadata.vfAnswers[index];
            const correctAnswer = question.answer;
            const player1Correct = answers.player1 === correctAnswer;
            const player2Correct = answers.player2 === correctAnswer;

            const answerText = correctAnswer ? 'VRAI ✓' : 'FAUX ✗';
            const player1AnswerText = answers.player1 ? 'VRAI' : 'FAUX';
            const player2AnswerText = answers.player2 ? 'VRAI' : 'FAUX';

            questionsHTML += `
                <div class="vf-question-result">
                    <div class="vf-question-title">Question ${index + 1}: ${this.escapeHtml(question.question)}</div>
                    <div class="vf-correct-answer">Bonne réponse : ${answerText}</div>
                    <div class="vf-player-answers">
                        <div class="vf-player-answer ${player1Correct ? 'correct' : 'incorrect'}">
                            ${this.escapeHtml(player1Name)}: ${player1AnswerText} ${player1Correct ? '✓' : '✗'}
                        </div>
                        <div class="vf-player-answer ${player2Correct ? 'correct' : 'incorrect'}">
                            ${this.escapeHtml(player2Name)}: ${player2AnswerText} ${player2Correct ? '✓' : '✗'}
                        </div>
                    </div>
                </div>
            `;
        });

        this.container.innerHTML = `
            <div class="vraifaux-manche">
                <div class="question-display">
                    <p class="question-text">Résultats</p>
                </div>
                <div class="vf-scores">
                    <div class="vf-score-card ${score1 > score2 ? 'winner' : ''}">
                        <h3>${this.escapeHtml(player1Name)}</h3>
                        <div class="vf-score">${score1}</div>
                        <div class="vf-score-label">/ ${this.mancheData.questions.length}</div>
                    </div>
                    <div class="vf-score-card ${score2 > score1 ? 'winner' : ''}">
                        <h3>${this.escapeHtml(player2Name)}</h3>
                        <div class="vf-score">${score2}</div>
                        <div class="vf-score-label">/ ${this.mancheData.questions.length}</div>
                    </div>
                </div>
                <div class="vf-questions-results">
                    ${questionsHTML}
                </div>
                <div id="controls"></div>
            </div>
        `;

        // Créer les boutons de contrôle
        const buttonsConfig = [
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
     * Détermine le gagnant selon les scores
     */
    determineWinner() {
        const score1 = this.metadata.finalScores.player1;
        const score2 = this.metadata.finalScores.player2;

        if (score1 > score2) {
            this.winner = 'player1';
        } else if (score2 > score1) {
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
        return './assets/styles/manches/vraifaux.css';
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        if (this.vfButtons) {
            this.vfButtons.cleanup();
        }
        if (this.controlButtons) {
            this.controlButtons.cleanup();
        }
        super.cleanup();
    }
}
