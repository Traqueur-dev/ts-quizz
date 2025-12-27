/**
 * UIManager - VERSION REFACTORISÉE
 *
 * Responsabilités réduites aux éléments GLOBAUX uniquement:
 * - Scores des joueurs
 * - Barre de progression
 * - Panel de jokers
 * - Célébrations de victoire
 * - Modal de fin de jeu
 *
 * Ce qu'il ne fait PLUS (déplacé dans les manches):
 * - Gestion des contrôles spécifiques aux manches
 * - Affichage des éléments spécifiques (thèmes, indices, etc.)
 * - Templates HTML des manches
 */
class UIManager {
    constructor() {
        // Cache minimal des éléments DOM globaux
        this.elements = {
            jokerPanel: document.getElementById('jokerPanel'),
            jokerOverlay: document.getElementById('jokerOverlay'),
            mancheTitle: document.getElementById('mancheTitle'),
            manchePoints: document.getElementById('manchePoints'),
            questionText: document.getElementById('questionText'),
            progressFill: document.getElementById('progressFill'),
            winnerModal: document.getElementById('winnerModal'),
            winnerName: document.getElementById('winnerName'),
            questionContainer: document.getElementById('questionContainer')
        };
    }

    // ========== SCORES ==========

    /**
     * Met à jour l'affichage des scores
     * @param {Object} scores - { player1: number, player2: number }
     */
    updateScores(scores) {
        document.getElementById('score1').textContent = scores.player1;
        document.getElementById('score2').textContent = scores.player2;
    }

    // ========== PROGRESSION ==========

    /**
     * Met à jour la barre de progression
     * @param {number} currentManche - Index de la manche actuelle
     * @param {number} totalManches - Nombre total de manches
     */
    updateProgress(currentManche, totalManches) {
        const progress = ((currentManche + 1) / totalManches) * 100;
        this.elements.progressFill.style.width = progress + '%';
        this.elements.progressFill.setAttribute('data-text', `Manche ${currentManche + 1}/${totalManches}`);
    }

    // ========== JOKERS ==========

    /**
     * Affiche le panneau de sélection de joker
     */
    showJokerPanel() {
        this.elements.jokerPanel.classList.add('show');
        this.elements.jokerOverlay.classList.add('show');
    }

    /**
     * Masque le panneau de sélection de joker
     */
    hideJokerPanel() {
        this.elements.jokerPanel.classList.remove('show');
        this.elements.jokerOverlay.classList.remove('show');
    }

    /**
     * Marque visuellement qu'un joker a été utilisé
     * @param {string} playerKey - 'player1' ou 'player2'
     */
    markJokerUsed(playerKey) {
        const playerId = playerKey === 'player1' ? 1 : 2;
        const jokerElement = document.getElementById(`joker${playerId}`);
        if (jokerElement) {
            jokerElement.classList.add('used');
            jokerElement.textContent = '❌ JOKER UTILISÉ';
        }
    }

    // ========== INFORMATIONS DE MANCHE ==========

    /**
     * Affiche les informations de la manche en cours
     * @param {Object} mancheData - Données de la manche
     * @param {number} jokerMultiplier - Multiplicateur de joker (1 ou 2)
     */
    showMancheInfo(mancheData, jokerMultiplier = 1) {
        this.elements.mancheTitle.textContent = `MANCHE ${mancheData.id} : ${mancheData.title}`;

        const basePoints = mancheData.points;
        const displayPoints = basePoints * jokerMultiplier;

        this.elements.manchePoints.textContent = jokerMultiplier > 1
            ? `${displayPoints} POINTS (JOKER x2 !)`
            : `${basePoints} POINT${basePoints > 1 ? 'S' : ''}`;

        if (mancheData.question) {
            this.elements.questionText.textContent = mancheData.question;
        }
    }

    // ========== CONTAINER DE MANCHE ==========

    /**
     * Retourne le conteneur DOM pour les manches
     * @returns {HTMLElement}
     */
    getMancheContainer() {
        // Chercher le conteneur, soit depuis le cache, soit depuis le DOM
        if (this.elements.questionContainer) {
            return this.elements.questionContainer;
        }
        // Fallback: chercher dans le DOM si pas dans le cache
        const container = document.getElementById('questionContainer');
        if (!container) {
            console.error('questionContainer not found in DOM!');
        }
        return container;
    }

    /**
     * Réinitialise l'UI entre les manches
     */
    resetUI() {
        // Nettoie le conteneur de la manche
        if (this.elements.questionContainer) {
            this.elements.questionContainer.innerHTML = '';
        }
    }

    // ========== CÉLÉBRATIONS ==========

    /**
     * Célèbre la victoire d'un joueur avec animation
     * @param {string} playerKey - 'player1' ou 'player2'
     */
    celebratePlayer(playerKey) {
        const playerElement = document.getElementById(playerKey);
        if (playerElement) {
            playerElement.classList.add('celebrate');
            setTimeout(() => {
                playerElement.classList.remove('celebrate');
            }, 500);
        }
    }

    /**
     * Affiche le modal de victoire finale
     * @param {string} playerKey - 'player1' ou 'player2'
     */
    showWinner(playerKey) {
        const CONFIG = window.CONFIG;
        const playerName = CONFIG.players[playerKey].name;
        this.elements.winnerName.textContent = playerName;
        this.elements.winnerModal.classList.add('show');
        this.createConfetti();
    }

    /**
     * Crée l'animation de confettis
     */
    createConfetti() {
        const colors = ['#667eea', '#764ba2', '#84fab0', '#f093fb'];
        const confettiCount = 50;
        const confettiDuration = 3000;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), confettiDuration);
        }
    }
}

// Export as singleton
export default new UIManager();
