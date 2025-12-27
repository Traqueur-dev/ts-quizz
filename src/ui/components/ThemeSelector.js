import { escapeHtml } from '../../utils/DOMHelpers.js';

/**
 * Composant ThemeSelector - Sélection de thèmes
 *
 * Affiche une grille de thèmes sélectionnables
 */
export default class ThemeSelector {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Object} options - Configuration
     *   - themes: Object - {themeKey: {title, description}}
     *   - selectedThemes: Array<string> - Thèmes déjà sélectionnés
     *   - currentPlayer: string - 'player1' ou 'player2'
     *   - onThemeSelect: Function - Callback appelé quand un thème est sélectionné
     */
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.selectedTheme = null;

        this.render();
    }

    /**
     * Affiche la grille de thèmes
     */
    render() {
        const themesKeys = Object.keys(this.options.themes);

        this.container.innerHTML = `
            <div class="themes-grid" id="themesGrid">
                ${themesKeys.map(themeKey => this.renderThemeCard(themeKey)).join('')}
            </div>
        `;

        this.bindEvents();
    }

    /**
     * Affiche une carte de thème
     * @param {string} themeKey - Clé du thème
     * @returns {string} HTML de la carte
     */
    renderThemeCard(themeKey) {
        const theme = this.options.themes[themeKey];
        const isSelected = this.options.selectedThemes.includes(themeKey);
        const classes = ['theme-card'];

        if (isSelected) {
            classes.push('disabled');
        }

        return `
            <div class="${classes.join(' ')}" data-theme="${themeKey}">
                <div class="theme-title">${escapeHtml(theme.title)}</div>
                <div class="theme-desc">${escapeHtml(theme.description)}</div>
            </div>
        `;
    }

    /**
     * Bind les événements
     */
    bindEvents() {
        const cards = this.container.querySelectorAll('.theme-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const themeKey = card.dataset.theme;
                if (!card.classList.contains('disabled')) {
                    this.selectTheme(themeKey);
                }
            });
        });
    }

    /**
     * Sélectionne un thème
     * @param {string} themeKey - Clé du thème
     */
    selectTheme(themeKey) {
        // Vérifier si déjà sélectionné globalement
        if (this.options.selectedThemes.includes(themeKey)) {
            alert('Ce thème a déjà été choisi !');
            return;
        }

        // Désélectionner tous les thèmes
        const cards = this.container.querySelectorAll('.theme-card');
        cards.forEach(card => {
            card.classList.remove('selected', 'player1-theme-temp', 'player2-theme-temp');
        });

        // Sélectionner le nouveau thème
        const card = this.container.querySelector(`[data-theme="${themeKey}"]`);
        if (card) {
            card.classList.add('selected', `${this.options.currentPlayer}-theme-temp`);
            this.selectedTheme = themeKey;

            if (this.options.onThemeSelect) {
                this.options.onThemeSelect(themeKey);
            }
        }
    }

    /**
     * Confirme le thème sélectionné
     * @param {string} player - 'player1' ou 'player2'
     */
    confirmTheme(player) {
        const cards = this.container.querySelectorAll('.theme-card');
        cards.forEach(card => {
            if (card.classList.contains(`${player}-theme-temp`)) {
                card.classList.remove(`${player}-theme-temp`);
                card.classList.add(`${player}-theme`, 'disabled');
            }
        });
        this.selectedTheme = null;
    }

    /**
     * Récupère le thème sélectionné
     * @returns {string|null}
     */
    getSelectedTheme() {
        return this.selectedTheme;
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
