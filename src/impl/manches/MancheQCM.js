/**
 * Manche QCM (Questions à Choix Multiples)
 *
 * Fonctionnement :
 * - Chaque joueuse répond à tour de rôle
 * - 4 choix proposés (A, B, C, D)
 * - Il peut y avoir plusieurs bonnes réponses
 * - Après chaque réponse, la bonne réponse est révélée
 * - Points distribués si la réponse est correcte
 */
import Manche from '../../api/Manche.js';
import { ControlButtons } from '../../ui/components/index.js';

export default class MancheQCM extends Manche {
    static getTypeLabel() {
        return 'QCM - Questions à Choix Multiples';
    }

    loadMetadata() {
        this.metadata = {
            currentQuestionIndex: 0,
            currentPlayerTurn: 'player1', // Alterne entre player1 et player2
            scores: { player1: 0, player2: 0 },
            answeredQuestions: [] // Historique des réponses
        };
    }

    render() {
        const question = this.getCurrentQuestion();
        if (!question) {
            this.showResults();
            return;
        }

        const currentPlayer = this.metadata.currentPlayerTurn;
        const playerName = this.getPlayerName(currentPlayer);

        this.container.innerHTML = `
            <div class="qcm-container">
                <div class="qcm-header">
                    <div class="qcm-question-number">
                        Question ${this.metadata.currentQuestionIndex + 1}/${this.mancheData.questions.length}
                    </div>
                    <div class="qcm-player-turn">
                        Au tour de : <strong>${playerName}</strong>
                    </div>
                </div>

                <div class="qcm-question">
                    ${this.escapeHtml(question.question)}
                </div>

                <div class="qcm-choices" id="qcmChoices">
                    ${this.renderChoices(question)}
                </div>

                <div id="qcmFeedback" class="qcm-feedback hidden"></div>

                <div id="qcmControls" class="qcm-controls">
                    <button class="btn btn-primary" id="qcmValidate" disabled>
                        Valider la réponse
                    </button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderChoices(question) {
        const choices = ['A', 'B', 'C', 'D'];
        return choices.map(letter => {
            const choice = question.choices[letter];
            if (!choice) return '';

            return `
                <div class="qcm-choice" data-choice="${letter}">
                    <div class="qcm-choice-letter">${letter}</div>
                    <div class="qcm-choice-text">${this.escapeHtml(choice)}</div>
                </div>
            `;
        }).join('');
    }

    attachEventListeners() {
        const choicesContainer = document.getElementById('qcmChoices');
        const validateBtn = document.getElementById('qcmValidate');

        // Sélection des choix
        choicesContainer.addEventListener('click', (e) => {
            const choiceElement = e.target.closest('.qcm-choice');
            if (!choiceElement) return;

            choiceElement.classList.toggle('selected');

            // Activer/désactiver le bouton de validation
            const hasSelection = choicesContainer.querySelectorAll('.qcm-choice.selected').length > 0;
            validateBtn.disabled = !hasSelection;
        });

        // Validation de la réponse
        validateBtn.addEventListener('click', () => {
            this.validateAnswer();
        });
    }

    validateAnswer() {
        const question = this.getCurrentQuestion();
        const selectedChoices = Array.from(document.querySelectorAll('.qcm-choice.selected'))
            .map(el => el.getAttribute('data-choice'));

        // Normaliser les réponses correctes (array)
        const correctAnswers = Array.isArray(question.answer)
            ? question.answer
            : [question.answer];

        // Vérifier si la réponse est correcte
        const isCorrect = this.arraysEqual(selectedChoices.sort(), correctAnswers.sort());

        // Afficher le feedback
        this.showFeedback(isCorrect, correctAnswers, selectedChoices);

        // Enregistrer la réponse
        this.metadata.answeredQuestions.push({
            questionIndex: this.metadata.currentQuestionIndex,
            player: this.metadata.currentPlayerTurn,
            selected: selectedChoices,
            correct: correctAnswers,
            isCorrect: isCorrect
        });

        // Attribuer les points si correct
        if (isCorrect) {
            this.metadata.scores[this.metadata.currentPlayerTurn]++;
        }
    }

    showFeedback(isCorrect, correctAnswers, selectedChoices) {
        const feedback = document.getElementById('qcmFeedback');
        const choicesContainer = document.getElementById('qcmChoices');

        // Désactiver les choix
        choicesContainer.style.pointerEvents = 'none';

        // Marquer visuellement les bonnes et mauvaises réponses
        document.querySelectorAll('.qcm-choice').forEach(choiceEl => {
            const letter = choiceEl.getAttribute('data-choice');
            const isCorrectChoice = correctAnswers.includes(letter);
            const wasSelected = selectedChoices.includes(letter);

            if (isCorrectChoice) {
                choiceEl.classList.add('correct');
            }
            if (wasSelected && !isCorrectChoice) {
                choiceEl.classList.add('incorrect');
            }
            choiceEl.classList.remove('selected');
        });

        // Message de feedback
        const correctAnswersText = correctAnswers.length > 1
            ? `Bonnes réponses : ${correctAnswers.join(', ')}`
            : `Bonne réponse : ${correctAnswers[0]}`;

        feedback.innerHTML = `
            <div class="qcm-feedback-${isCorrect ? 'correct' : 'incorrect'}">
                <div class="qcm-feedback-result">
                    ${isCorrect ? '✅ Correct !' : '❌ Incorrect'}
                </div>
                <div class="qcm-feedback-answer">
                    ${correctAnswersText}
                </div>
            </div>
        `;
        feedback.classList.remove('hidden');

        // Remplacer le bouton de validation par "Question suivante"
        const controls = document.getElementById('qcmControls');
        controls.innerHTML = `
            <button class="btn btn-success" id="qcmNext">
                Question suivante →
            </button>
        `;

        document.getElementById('qcmNext').addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    nextQuestion() {
        // Alterner le tour
        this.metadata.currentPlayerTurn =
            this.metadata.currentPlayerTurn === 'player1' ? 'player2' : 'player1';

        // Passer à la question suivante
        this.metadata.currentQuestionIndex++;

        // Recharger l'UI
        this.render();
    }

    showResults() {
        const score1 = this.metadata.scores.player1;
        const score2 = this.metadata.scores.player2;
        const player1Name = this.getPlayerName('player1');
        const player2Name = this.getPlayerName('player2');

        let winnerText = '';

        if (score1 > score2) {
            winnerText = `${player1Name} gagne !`;
        } else if (score2 > score1) {
            winnerText = `${player2Name} gagne !`;
        } else {
            winnerText = 'Égalité !';
        }

        this.container.innerHTML = `
            <div class="qcm-results">
                <div class="qcm-results-title">📊 Résultats</div>
                <div class="qcm-results-scores">
                    <div class="qcm-result-player">
                        <div class="qcm-result-name">${player1Name}</div>
                        <div class="qcm-result-score">${score1} / ${this.mancheData.questions.length}</div>
                    </div>
                    <div class="qcm-result-vs">VS</div>
                    <div class="qcm-result-player">
                        <div class="qcm-result-name">${player2Name}</div>
                        <div class="qcm-result-score">${score2} / ${this.mancheData.questions.length}</div>
                    </div>
                </div>
                <div class="qcm-results-winner">${winnerText}</div>
            </div>
        `;

        // Utiliser ControlButtons pour attribuer les points
        const controlsDiv = document.createElement('div');
        this.container.appendChild(controlsDiv);

        const buttonsConfig = [
            {
                text: `✅ ${player1Name} gagne`,
                type: 'success',
                onClick: () => {
                    this.winner = 'player1';
                    this.ended = true;
                }
            },
            {
                text: `✅ ${player2Name} gagne`,
                type: 'success',
                onClick: () => {
                    this.winner = 'player2';
                    this.ended = true;
                }
            },
            {
                text: '⏭️ Égalité - Manche suivante',
                type: 'primary',
                onClick: () => {
                    this.winner = null;
                    this.ended = true;
                }
            }
        ];

        this.controlButtons = new ControlButtons(controlsDiv, buttonsConfig);
    }

    onEnded() {
        return {
            winner: this.winner,
            points: this.mancheData.points,
            details: {
                scores: this.metadata.scores,
                answeredQuestions: this.metadata.answeredQuestions
            }
        };
    }

    cleanup() {
        super.cleanup();
        // Pas de timers ou listeners globaux à nettoyer
    }

    // ===== HELPERS =====

    getCurrentQuestion() {
        if (this.metadata.currentQuestionIndex >= this.mancheData.questions.length) {
            return null;
        }
        return this.mancheData.questions[this.metadata.currentQuestionIndex];
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
}
