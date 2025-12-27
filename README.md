# 🎮 Quiz Interactif - Application Réutilisable

Une application de quiz interactive et entièrement personnalisable pour 2 joueurs avec différents types de manches et un système de jokers.

**Exemple fourni** : Quiz Taylor Swift pour Marie et Pauline

## 🎯 Objectif

Être le premier à atteindre le score de victoire (configurable) en répondant correctement aux questions à travers différentes manches.

## 📁 Architecture du Projet

```
ts-quizz/
├── README.md                   # Documentation du projet
├── ANSWERS.md                  # Fichier de réponses
├── public/                     # Fichiers publics
│   ├── index.html             # Point d'entrée HTML
│   └── styles.css             # Styles CSS
├── src/                       # Code source
│   ├── main.js               # Point d'entrée JavaScript
│   ├── config/               # Configuration
│   │   ├── config.js         # Configuration du jeu (noms, scores, paramètres)
│   │   └── quiz-data.js      # Données des questions du quiz
│   └── modules/              # Modules fonctionnels
│       ├── game-state.js     # Gestion de l'état du jeu
│       ├── ui-manager.js     # Gestion de l'interface utilisateur
│       └── quiz-logic.js     # Logique métier du quiz
└── assets/                    # Ressources (à venir)
    └── audio/                # Fichiers audio pour les blind tests
```

## 🏗️ Architecture Modulaire

### `public/`
Contient les fichiers accessibles depuis le navigateur.

### `src/config/`

#### `config.js` ⚙️ **À PERSONNALISER**
Configuration centralisée du jeu :
- **Noms des joueurs** : Personnalisez les noms (ex: Marie et Pauline)
- **Score de victoire** : Définissez le score pour gagner (ex: 9 points)
- **Paramètres de durée** : timers, animations, transitions

#### `quiz-data.js` 📝 **À PERSONNALISER**
Contient toutes les questions et manches du quiz organisées par type.
**C'est ici que vous ajoutez vos propres questions !**

### `src/modules/`

#### `game-state.js`
**Responsabilité** : Gestion de l'état du jeu
- Scores actuels des joueuses
- Progression dans les manches
- État des jokers (utilisés ou disponibles)
- État des questions en cours (thèmes, indices, vrai/faux, etc.)

**Méthodes principales** :
- `incrementScore(player, points)` - Ajouter des points
- `useJoker(player)` - Activer un joker
- `hasWinner()` - Vérifier s'il y a une gagnante
- `getWinner()` - Obtenir la gagnante

#### `ui-manager.js`
**Responsabilité** : Gestion de l'affichage
- Mise à jour des scores visuels
- Affichage des questions et réponses
- Animations et effets visuels (célébrations, confettis)
- Gestion du modal de victoire
- Contrôle de la progression visuelle

**Méthodes principales** :
- `updateScores()` - Mettre à jour l'affichage des scores
- `showMancheInfo(manche)` - Afficher les infos de la manche
- `celebratePlayer(player)` - Animation de célébration
- `showWinner(player)` - Afficher le modal de victoire

#### `quiz-logic.js`
**Responsabilité** : Logique métier du quiz
- Déroulement des manches
- Calcul des points avec multiplicateurs
- Gestion des différents types de questions
- Validation des réponses
- Transitions entre manches

**Méthodes principales** :
- `startQuiz()` - Démarrer le quiz
- `nextManche()` - Passer à la manche suivante
- `activateJoker(playerKey)` - Activer un joker
- `awardPoints(playerKey)` - Attribuer des points
- `loadControls(manche)` - Charger les contrôles selon le type de manche

#### `main.js`
**Responsabilité** : Point d'entrée et initialisation
- Initialise l'application
- Expose les contrôleurs globalement pour les événements HTML (via `window.quizController`)
- Connecte tous les modules ensemble

## 🎮 Types de Manches

| Manche | Type | Points | Description |
|--------|------|--------|-------------|
| 1 | **Rapidité** | 1 | Question simple, première à répondre gagne |
| 2 | **Les 4 Thèmes** | 2 | Choix de 4 thèmes (A, B, C, D) avec 2 questions par thème |
| 6 | **Blind Test** | 2 | Reconnaître une chanson à l'oreille |
| 7 | **Les Enchères** | 3 | Surenchérir sur le nombre de réponses possibles |
| 8 | **Le Carré d'As** | 3 | Deviner avec indices progressifs (4→3→2→1 points) |
| 9 | **La Liste** | 3 | Écrire le maximum de réponses en 45 secondes |
| 10 | **Vrai ou Faux** | 3 | Série d'affirmations (tout juste = 3 points, sinon 0) |

## ⭐ Système de Joker

- Chaque joueuse dispose d'**UN seul joker** par partie
- Le joker **double les points** de la manche
- Doit être activé **avant** le début de la manche
- Utilisation stratégique recommandée sur les manches à 3 points

## 🚀 Utilisation

1. Ouvrir [public/index.html](public/index.html) dans un navigateur moderne
2. Cliquer sur "🚀 Démarrer le Quiz"
3. Pour chaque manche :
   - Décider d'utiliser ou non un joker (si disponible)
   - Répondre aux questions
   - Attribuer les points à la bonne joueuse

## 🎨 Personnalisation Complète

### 1️⃣ Modifier les noms des joueurs

Éditer [src/config/config.json](src/config/config.json) :

```json
{
  "players": {
    "player1": {
      "name": "VotreNom1"
    },
    "player2": {
      "name": "VotreNom2"
    }
  },
  "game": {
    "listeTimerDuration": 45
  }
}
```

### 2️⃣ Personnaliser vos questions

Éditer [src/config/quiz-data.json](src/config/quiz-data.json) - **Voici tous les types de manches disponibles** :

#### 📌 Question Simple
```javascript
{
    id: 1,
    title: "VOTRE TITRE",
    points: 1,
    type: "simple",
    question: "Votre question ?",
    answer: "Votre réponse"
}
```

#### 🎯 Les 4 Thèmes
```javascript
{
    id: 2,
    type: "themes",
    title: "LES 4 THÈMES",
    points: 2,
    themes: {
        A: {
            title: "🎵 VOTRE THÈME A",
            description: "Description du thème",
            questions: [
                { question: "Question 1 ?", answer: "Réponse 1" },
                { question: "Question 2 ?", answer: "Réponse 2" }
            ]
        },
        B: { title: "...", description: "...", questions: [...] },
        C: { title: "...", description: "...", questions: [...] },
        D: { title: "...", description: "...", questions: [...] }
    }
}
```

#### 🎵 Blind Test (MP3 ou YouTube)
```javascript
{
    id: 6,
    type: "blindtest",
    title: "BLIND TEST",
    points: 2,
    question: "🎵 Écoutez et devinez !",
    answer: "Titre de la chanson",

    // Option 1 : Fichier MP3 local
    audioFile: "../../assets/audio/votre-fichier.mp3",

    // Option 2 : Vidéo YouTube (l'ID est dans l'URL youtube.com/watch?v=ID)
    youtubeId: "b1kbLwvqugk",
    startTime: 30  // Optionnel : démarrer à X secondes
}
```

#### 💡 Indices Progressifs
```javascript
{
    id: 8,
    type: "indices",
    title: "LE CARRÉ D'AS",
    points: 3,
    question: "Devinez avec les indices",
    indices: [
        "Premier indice (vague)",
        "Deuxième indice (plus précis)",
        "Troisième indice (encore plus précis)",
        "Quatrième indice (très précis)"
    ],
    answer: "La réponse",
    pointsProgression: [4, 3, 2, 1]  // Points selon l'indice utilisé
}
```

#### 📝 La Liste
```javascript
{
    id: 9,
    type: "liste",
    title: "LA LISTE",
    points: 3,
    question: "Citez le maximum de... (chrono 45s)",
    answer: "Liste complète des réponses possibles pour référence..."
}
```

#### ✅❌ Vrai ou Faux
```javascript
{
    id: 10,
    type: "vraifaux",
    title: "VRAI OU FAUX",
    points: 3,
    questions: [
        {
            question: "Affirmation 1",
            answer: true,  // ou false
            explanation: "Explication (optionnel)"
        },
        {
            question: "Affirmation 2",
            answer: false,
            explanation: "Autre explication"
        }
        // Ajoutez autant de questions V/F que vous voulez
    ],
    note: "Tout juste = points complets, sinon 0"
}
```

## 🔧 Technologies Utilisées

- **HTML5** - Structure sémantique
- **CSS3** - Styles avec gradients, animations, et responsive design
- **JavaScript ES6+** - Modules, classes, imports/exports
- **Architecture MVC** - Séparation claire des responsabilités
  - **Model** : `game-state.js`
  - **View** : `ui-manager.js`
  - **Controller** : `quiz-logic.js`

## ✨ Fonctionnalités

- ✅ **100% Personnalisable** : Noms, questions, thèmes configurables
- ✅ **6 Types de Manches** : Simple, Thèmes, Blind Test, Indices, Liste, Vrai/Faux
- ✅ **Support YouTube** : Utilisez des liens YouTube pour les blind tests
- ✅ **Support MP3** : Ou utilisez vos propres fichiers audio
- ✅ **Système de Jokers** : Doublez les points d'une manche
- ✅ **Interface Responsive** : Fonctionne sur tous les écrans
- ✅ **Animations** : Célébrations, confettis, transitions fluides

## 📝 Améliorations Futures

- [ ] Système de sauvegarde des scores (LocalStorage)
- [ ] Historique des parties jouées
- [ ] Mode multijoueur en ligne
- [ ] Mode sombre / personnalisation des couleurs
- [ ] Statistiques détaillées par joueur
- [ ] Export des résultats en PDF
- [ ] Support de plus de 2 joueurs

## 👩‍💻 Développement

Le projet utilise des modules ES6. Pour le développer localement :

1. Utiliser un serveur HTTP local :
   - **VS Code** : Extension "Live Server"
   - **Python** : `python -m http.server 8000`
   - **Node.js** : `npx serve`

2. Ouvrir `http://localhost:8000/public/index.html` dans le navigateur

3. Les modifications dans les modules sont automatiquement prises en compte au rechargement

### Prérequis

- Navigateur moderne supportant les modules ES6 (Chrome, Firefox, Safari, Edge)
- Serveur HTTP local pour éviter les erreurs CORS

## 📄 Licence

Projet personnel - Marie & Pauline

---

## 🚀 Démarrage Rapide

1. **Personnalisez les joueurs** dans `src/config/config.js`
2. **Ajoutez vos questions** dans `src/config/quiz-data.js`
3. **Lancez un serveur** (voir section Développement ci-dessus)
4. **Jouez !** 🎮

---

**Bon quiz ! Que le meilleur gagne ! 🎉**

_Exemple fourni : Quiz Taylor Swift - Marie VS Pauline_
