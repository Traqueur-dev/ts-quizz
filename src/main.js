// Point d'entrée principal de l'application - VERSION REFACTORISÉE
import QuizController from './core/QuizController.js';
import MancheFactory from './core/MancheFactory.js';
import uiManager from './ui/UIManager.js';

// Importer toutes les implémentations de manches via l'index
import * as Manches from './impl/manches/index.js';

// Enregistrer les manches dans la factory
MancheFactory.register('simple', Manches.MancheSimple);
MancheFactory.register('indices', Manches.MancheIndices);
MancheFactory.register('blindtest', Manches.MancheBlindTest);
MancheFactory.register('liste', Manches.MancheListe);
MancheFactory.register('vraifaux', Manches.MancheVraiFaux);
MancheFactory.register('themes', Manches.MancheThemes);

// Variables globales
let CONFIG = null;
let quizData = null;
let quizController = null;

/**
 * Charge la configuration depuis config.json
 */
async function loadConfig() {
    const response = await fetch('../resources/config.json');
    CONFIG = await response.json();
    window.CONFIG = CONFIG; // Garder pour compatibilité temporaire
    return CONFIG;
}

/**
 * Charge les données du quiz depuis quiz-data.json
 */
async function loadQuizData() {
    const response = await fetch('../resources/quiz-data.json');
    quizData = await response.json();
    window.quizData = quizData; // Garder pour compatibilité temporaire
    return quizData;
}

/**
 * Initialise les noms des joueurs dans l'UI
 */
function initializePlayerNames() {
    document.getElementById('player1Name').textContent = CONFIG.players.player1.name;
    document.getElementById('player2Name').textContent = CONFIG.players.player2.name;
}

/**
 * Affiche la liste des manches au chargement
 */
async function displayManchesList() {
    const manchesGrid = document.getElementById('manchesGrid');
    if (!manchesGrid) return;

    manchesGrid.innerHTML = quizData.manches.map(manche => {
        // Récupérer le label depuis la classe de manche elle-même
        const typeLabel = MancheFactory.getTypeLabel(manche.type);

        return `
            <div class="manche-card">
                <div class="manche-card-header">
                    <span class="manche-number">Manche ${manche.id}</span>
                    <span class="manche-card-points">${manche.points} pt${manche.points > 1 ? 's' : ''}</span>
                </div>
                <div class="manche-card-title">${manche.title}</div>
                <div class="manche-card-type">${typeLabel}</div>
            </div>
        `;
    }).join('');
}

/**
 * Démarre le quiz
 */
function startQuiz() {
    if (!quizController) {
        quizController = new QuizController(quizData, CONFIG, uiManager);
    }
    quizController.startQuiz();
}

/**
 * Expose les fonctions nécessaires pour les boutons HTML
 */
window.quizController = {
    startQuiz: startQuiz
};

/**
 * Initialise l'application au chargement
 */
async function initializeApp() {
    try {
        await loadConfig();
        await loadQuizData();
        initializePlayerNames();
        await displayManchesList();
        console.log(`🎮 Quiz initialisé - ${CONFIG.players.player1.name} VS ${CONFIG.players.player2.name}`);
        console.log(`📦 Manches enregistrées: ${MancheFactory.getRegisteredTypes().join(', ')}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        alert('Erreur lors du chargement du quiz. Vérifiez la console pour plus de détails.');
    }
}

// Appeler l'initialisation au chargement de la page
initializeApp();
