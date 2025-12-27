/**
 * Contrôleur principal du quiz - VERSION REFACTORISÉE
 *
 * Rôle: Orchestration du quiz
 * - Gère la progression entre les manches
 * - Coordonne GameState et UIManager
 * - Délègue la logique métier aux manches
 *
 * Ce qu'il NE fait PAS (contrairement à l'ancien quiz-logic.js):
 * - Connaître les détails des manches
 * - Manipuler le DOM directement
 * - Gérer les métadonnées des manches
 */
import gameState from './GameState.js';
import MancheFactory from './MancheFactory.js';

export default class QuizController {
    /**
     * @param {Object} quizData - Données du quiz (depuis quiz-data.json)
     * @param {Object} config - Configuration globale (depuis config.json)
     * @param {Object} uiManager - Gestionnaire d'interface utilisateur
     */
    constructor(quizData, config, uiManager) {
        this.quizData = quizData;
        this.config = config;
        this.uiManager = uiManager;
        this.gameState = gameState;
        this.mancheIndex = 0;
        this.currentManche = null;
        this.pollInterval = null;
    }

    /**
     * Démarre le quiz
     */
    startQuiz() {
        // Cacher la liste des manches
        const manchesList = document.getElementById('manchesList');
        if (manchesList) {
            manchesList.classList.add('hidden');
        }

        this.gameState.reset();
        this.mancheIndex = 0;
        this.nextManche();
    }

    /**
     * Passe à la manche suivante
     */
    async nextManche() {
        // Cleanup de la manche précédente
        if (this.currentManche) {
            this.currentManche.cleanup();
            this.currentManche = null;
        }

        // Vérifie si le quiz est terminé
        if (this.mancheIndex >= this.quizData.manches.length) {
            this.showFinalResults();
            return;
        }

        // Reset UI et mise à jour de la progression
        this.uiManager.resetUI();
        this.uiManager.updateProgress(this.mancheIndex, this.quizData.manches.length);

        // Gestion des jokers
        if (this.gameState.hasAnyJokerAvailable()) {
            await this.showJokerPanel();
        } else {
            this.gameState.resetJokerMultiplier();
            this.loadManche();
        }
    }

    /**
     * Affiche le panneau de sélection de joker
     * @returns {Promise<void>}
     */
    async showJokerPanel() {
        const player1HasJoker = this.gameState.hasJoker('player1');
        const player2HasJoker = this.gameState.hasJoker('player2');

        // Récupérer les informations de la prochaine manche
        const nextMancheData = this.quizData.manches[this.mancheIndex];
        const manchePreview = `
            <div class="joker-preview">
                <div class="preview-label">🎯 Prochaine manche :</div>
                <div class="preview-info">
                    <span class="preview-title">${nextMancheData.title}</span>
                    <span class="preview-points">${nextMancheData.points} point${nextMancheData.points > 1 ? 's' : ''}</span>
                </div>
            </div>
        `;

        // Créer les boutons dynamiquement
        let buttonsHTML = '<div class="joker-buttons">';

        if (player1HasJoker) {
            buttonsHTML += `<button class="btn btn-warning" data-joker="player1">${this.config.players.player1.name} utilise son JOKER</button>`;
        }

        if (player2HasJoker) {
            buttonsHTML += `<button class="btn btn-warning" data-joker="player2">${this.config.players.player2.name} utilise son JOKER</button>`;
        }

        buttonsHTML += `<button class="btn btn-info" data-joker="none" style="grid-column: 1 / -1;">Personne n'utilise de JOKER</button>`;
        buttonsHTML += '</div>';

        const jokerPanel = document.getElementById('jokerPanel');
        jokerPanel.innerHTML = `
            <div class="joker-text">⚠️ Une joueuse souhaite-t-elle utiliser son JOKER pour doubler les points de cette manche ?</div>
            ${manchePreview}
            ${buttonsHTML}
        `;

        // Bind événements
        jokerPanel.querySelectorAll('button[data-joker]').forEach(btn => {
            btn.addEventListener('click', () => {
                const playerKey = btn.getAttribute('data-joker');
                this.handleJokerSelection(playerKey);
            });
        });

        this.uiManager.showJokerPanel();
    }

    /**
     * Gère la sélection du joker
     * @param {string} playerKey - 'player1', 'player2', ou 'none'
     */
    handleJokerSelection(playerKey) {
        if (playerKey === 'none') {
            this.gameState.resetJokerMultiplier();
            this.uiManager.hideJokerPanel();
            this.loadManche();
            return;
        }

        if (!this.gameState.hasJoker(playerKey)) {
            alert(`${this.config.players[playerKey].name} a déjà utilisé son joker !`);
            return;
        }

        this.gameState.resetJokerMultiplier();
        this.gameState.useJoker(playerKey);
        this.uiManager.markJokerUsed(playerKey);
        this.uiManager.hideJokerPanel();
        this.loadManche();
    }

    /**
     * Charge la manche courante
     */
    loadManche() {
        const mancheData = this.quizData.manches[this.mancheIndex];

        // Créer l'instance de manche via la factory
        try {
            this.currentManche = MancheFactory.create(mancheData, this.config);
        } catch (error) {
            console.error('Error creating manche:', error);
            alert(`Erreur: Type de manche inconnu "${mancheData.type}"`);
            return;
        }

        // Charger les métadonnées depuis GameState
        const savedMetadata = this.gameState.getMetadata(this.mancheIndex);
        if (savedMetadata) {
            this.currentManche.metadata = savedMetadata;
        }

        // Définir le container
        const container = this.uiManager.getMancheContainer();
        this.currentManche.setContainer(container);

        // Afficher les informations de la manche
        this.uiManager.showMancheInfo(mancheData, this.gameState.currentJokerMultiplier);

        // Initialiser et afficher la manche
        this.currentManche.initialize();

        // Démarrer le polling pour détecter la fin de la manche
        this.pollMancheEnd();
    }

    /**
     * Polling pour détecter quand la manche se termine
     * Alternative à un système d'événements (plus simple pour MVP)
     */
    pollMancheEnd() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }

        this.pollInterval = setInterval(() => {
            if (this.currentManche && this.currentManche.ended) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
                this.handleMancheEnd();
            }
        }, 100);
    }

    /**
     * Gère la fin d'une manche
     */
    handleMancheEnd() {
        if (!this.currentManche) return;

        // Récupérer les résultats
        const result = this.currentManche.onEnded();

        // Sauvegarder les métadonnées
        this.gameState.setMetadata(
            this.mancheIndex,
            this.currentManche.saveMetadata()
        );

        // Attribuer les points
        if (result.winner) {
            const points = result.points * this.gameState.currentJokerMultiplier;
            this.gameState.incrementScore(result.winner, points);
            this.uiManager.updateScores(this.gameState.scores);
            this.uiManager.celebratePlayer(result.winner);
        }

        // Passer à la manche suivante après un délai
        setTimeout(() => {
            this.mancheIndex++;
            this.nextManche();
        }, 2000);
    }

    /**
     * Affiche les résultats finaux
     */
    showFinalResults() {
        const score1 = this.gameState.getScore('player1');
        const score2 = this.gameState.getScore('player2');

        if (score1 > score2) {
            this.uiManager.showWinner('player1');
        } else if (score2 > score1) {
            this.uiManager.showWinner('player2');
        } else {
            alert('Égalité parfaite ! 🏆');
        }
    }

    /**
     * Nettoie les ressources (à appeler quand le quiz est terminé)
     */
    cleanup() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        if (this.currentManche) {
            this.currentManche.cleanup();
            this.currentManche = null;
        }
    }
}
