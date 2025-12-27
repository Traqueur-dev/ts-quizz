import { escapeHtml } from '../utils/DOMHelpers.js';

/**
 * Classe abstraite de base pour toutes les manches du quiz
 *
 * Principe d'encapsulation : Chaque manche connaît et gère ses propres métadonnées,
 * son UI, et son comportement. Le GameState ne contient qu'un champ `metadata` générique
 * que seule la manche active sait interpréter.
 */
export default class Manche {
    /**
     * @param {Object} mancheData - Données de configuration de la manche (depuis quiz-data.json)
     * @param {Object} config - Configuration globale du quiz (noms joueurs, etc.)
     */
    constructor(mancheData, config) {
        this.mancheData = mancheData;  // { id, title, points, type, question, ... }
        this.config = config;           // Global CONFIG object
        this.metadata = {};             // État spécifique à cette manche
        this.container = null;          // DOM container for this manche
        this.styleElement = null;       // Dynamic CSS <link> element
        this.ended = false;             // Flag indiquant si la manche est terminée
        this.winner = null;             // 'player1', 'player2', ou null
    }

    /**
     * Retourne le label d'affichage pour ce type de manche
     * DOIT être implémentée comme méthode statique dans les sous-classes
     * @returns {string}
     */
    static getTypeLabel() {
        throw new Error('getTypeLabel() must be implemented as static method by subclass');
    }

    // ========== LIFECYCLE METHODS (Abstract) ==========

    /**
     * Appelée quand la manche est chargée pour la première fois
     * Initialise les métadonnées, charge le CSS, et affiche l'UI
     */
    async initialize() {
        this.loadMetadata();
        this.loadCSS();
        this.render();
    }

    /**
     * Affiche l'UI de la manche dans le container
     * DOIT être implémentée par les sous-classes
     */
    render() {
        throw new Error('render() must be implemented by subclass');
    }

    /**
     * Appelée quand la manche se termine (joueur gagne, skip, etc.)
     * Retourne les résultats de la manche
     *
     * @returns {Object} { winner: 'player1'|'player2'|null, points: number, details?: Object }
     */
    onEnded() {
        throw new Error('onEnded() must be implemented by subclass');
    }

    /**
     * Nettoie les ressources avant de passer à la manche suivante
     * (timers, event listeners, lecteurs audio/vidéo, etc.)
     */
    cleanup() {
        this.unloadCSS();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    // ========== METADATA MANAGEMENT ==========

    /**
     * Charge l'état de la manche depuis GameState.metadata
     * Chaque sous-classe définit sa propre structure de métadonnées
     *
     * Par défaut, initialise avec un objet vide
     * Les sous-classes doivent override pour définir leur structure
     */
    loadMetadata() {
        this.metadata = {};
    }

    /**
     * Sauvegarde l'état de la manche pour GameState.metadata
     *
     * @returns {Object} - Objet sérialisable contenant les métadonnées
     */
    saveMetadata() {
        return this.metadata;
    }

    // ========== CSS MANAGEMENT ==========

    /**
     * Charge dynamiquement le CSS spécifique à cette manche
     */
    loadCSS() {
        const cssPath = this.getCSSPath();
        if (!cssPath) return;

        // Évite les doublons
        const existingLink = document.querySelector(`link[data-manche-type="${this.mancheData.type}"]`);
        if (existingLink) return;

        this.styleElement = document.createElement('link');
        this.styleElement.rel = 'stylesheet';
        this.styleElement.href = cssPath;
        this.styleElement.setAttribute('data-manche-type', this.mancheData.type);
        document.head.appendChild(this.styleElement);
    }

    /**
     * Retourne le chemin vers le fichier CSS de cette manche
     * Les sous-classes peuvent override pour personnaliser
     *
     * @returns {string|null}
     */
    getCSSPath() {
        // Chemin relatif depuis public/index.html
        return `./assets/styles/manches/${this.mancheData.type}.css`;
    }

    /**
     * Retire le CSS dynamiquement chargé
     */
    unloadCSS() {
        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
    }

    // ========== HELPERS ==========

    /**
     * Définit le conteneur DOM pour cette manche
     * @param {HTMLElement} containerElement
     */
    setContainer(containerElement) {
        this.container = containerElement;
    }

    /**
     * Récupère le nom d'un joueur par sa clé
     * @param {string} playerKey - 'player1' ou 'player2'
     * @returns {string}
     */
    getPlayerName(playerKey) {
        return this.config.players[playerKey].name;
    }

    /**
     * Calcule les points finaux avec le multiplicateur de joker
     * @param {number} jokerMultiplier - 1 ou 2
     * @returns {number}
     */
    calculatePoints(jokerMultiplier) {
        return this.mancheData.points * jokerMultiplier;
    }

    /**
     * Échappe les caractères HTML pour éviter les injections XSS
     * Utilise l'utilitaire importé de DOMHelpers
     * @param {string} text - Texte à échapper
     * @returns {string} - Texte échappé
     */
    escapeHtml(text) {
        return escapeHtml(text);
    }
}
