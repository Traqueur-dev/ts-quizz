/**
 * Factory pour créer des instances de manches selon leur type
 *
 * Pattern Factory: Centralise la création des manches et permet d'ajouter
 * de nouveaux types sans modifier le code existant (Open/Closed Principle)
 */
export default class MancheFactory {
    /**
     * Map des types de manches vers leurs classes
     * Structure: { 'simple': MancheSimple, 'themes': MancheThemes, ... }
     */
    static mancheTypes = {};

    /**
     * Enregistre un type de manche
     *
     * @param {string} type - Type de manche (ex: 'simple', 'themes', 'blindtest')
     * @param {class} MancheClass - Classe de la manche (doit extend Manche)
     */
    static register(type, MancheClass) {
        this.mancheTypes[type] = MancheClass;
    }

    /**
     * Crée une instance de manche selon son type
     *
     * @param {Object} mancheData - Données de configuration de la manche
     * @param {Object} config - Configuration globale du quiz
     * @returns {Manche} - Instance de la manche appropriée
     * @throws {Error} - Si le type de manche n'est pas reconnu
     */
    static create(mancheData, config) {
        const MancheClass = this.mancheTypes[mancheData.type];

        if (!MancheClass) {
            throw new Error(
                `Unknown manche type: "${mancheData.type}". ` +
                `Available types: ${Object.keys(this.mancheTypes).join(', ')}`
            );
        }

        return new MancheClass(mancheData, config);
    }

    /**
     * Vérifie si un type de manche est enregistré
     *
     * @param {string} type - Type de manche
     * @returns {boolean}
     */
    static isRegistered(type) {
        return type in this.mancheTypes;
    }

    /**
     * Liste tous les types de manches enregistrés
     *
     * @returns {string[]}
     */
    static getRegisteredTypes() {
        return Object.keys(this.mancheTypes);
    }

    /**
     * Récupère le label d'affichage pour un type de manche
     *
     * @param {string} type - Type de manche
     * @returns {string} - Label d'affichage
     */
    static getTypeLabel(type) {
        const MancheClass = this.mancheTypes[type];
        if (!MancheClass) {
            return type; // Fallback au type brut
        }
        return MancheClass.getTypeLabel();
    }
}
