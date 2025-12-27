/**
 * État global du jeu - VERSION SIMPLIFIÉE
 *
 * AVANT: 20+ champs spécifiques aux manches (selectedThemes, listeTimer, vfAnswers, etc.)
 * APRÈS: Un seul champ `manchesMetadata` - chaque manche gère sa propre structure
 *
 * Principe: GameState ne connaît PAS les détails des manches.
 * Il fournit juste un espace de stockage que les manches utilisent librement.
 */
class GameState {
    constructor() {
        // État global du quiz
        this.scores = { player1: 0, player2: 0 };
        this.jokersUsed = { player1: false, player2: false };
        this.currentJokerMultiplier = 1;

        /**
         * Métadonnées des manches
         * Structure: { mancheIndex: metadata }
         * Chaque manche définit et gère sa propre structure de metadata
         */
        this.manchesMetadata = {};
    }

    /**
     * Réinitialise l'état du jeu pour un nouveau quiz
     */
    reset() {
        this.scores = { player1: 0, player2: 0 };
        this.jokersUsed = { player1: false, player2: false };
        this.currentJokerMultiplier = 1;
        this.manchesMetadata = {};
    }

    // ========== SCORE MANAGEMENT ==========

    /**
     * Incrémente le score d'un joueur
     * @param {string} player - 'player1' ou 'player2'
     * @param {number} points - Points à ajouter
     */
    incrementScore(player, points) {
        this.scores[player] += points;
    }

    /**
     * Récupère le score d'un joueur
     * @param {string} player - 'player1' ou 'player2'
     * @returns {number}
     */
    getScore(player) {
        return this.scores[player];
    }

    // ========== JOKER MANAGEMENT ==========

    /**
     * Utilise le joker d'un joueur
     * @param {string} player - 'player1' ou 'player2'
     */
    useJoker(player) {
        this.jokersUsed[player] = true;
        this.currentJokerMultiplier = 2;
    }

    /**
     * Vérifie si un joueur a encore son joker
     * @param {string} player - 'player1' ou 'player2'
     * @returns {boolean}
     */
    hasJoker(player) {
        return !this.jokersUsed[player];
    }

    /**
     * Vérifie si au moins un joueur a encore son joker
     * @returns {boolean}
     */
    hasAnyJokerAvailable() {
        return !this.jokersUsed.player1 || !this.jokersUsed.player2;
    }

    /**
     * Réinitialise le multiplicateur de joker à 1
     */
    resetJokerMultiplier() {
        this.currentJokerMultiplier = 1;
    }

    // ========== METADATA MANAGEMENT (Encapsulation des manches) ==========

    /**
     * Récupère les métadonnées d'une manche
     * @param {number} mancheIndex - Index de la manche
     * @returns {Object|undefined}
     */
    getMetadata(mancheIndex) {
        return this.manchesMetadata[mancheIndex];
    }

    /**
     * Sauvegarde les métadonnées d'une manche
     * @param {number} mancheIndex - Index de la manche
     * @param {Object} metadata - Métadonnées à sauvegarder
     */
    setMetadata(mancheIndex, metadata) {
        this.manchesMetadata[mancheIndex] = metadata;
    }

    /**
     * Supprime les métadonnées d'une manche
     * @param {number} mancheIndex - Index de la manche
     */
    clearMetadata(mancheIndex) {
        delete this.manchesMetadata[mancheIndex];
    }
}

// Export as singleton
export default new GameState();
