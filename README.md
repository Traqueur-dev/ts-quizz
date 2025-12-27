# 🎮 Quiz Interactif - Application Réutilisable

Une application de quiz interactive et entièrement personnalisable pour 2 joueurs avec différents types de manches et un système de jokers.

**Exemple fourni** : Quiz Taylor Swift pour Marie et Pauline

## 🎯 Objectif

Être le premier à atteindre le score de victoire (configurable) en répondant correctement aux questions à travers différentes manches.

## 📁 Architecture du Projet

```
ts-quizz/
├── README.md                      # Documentation du projet
├── ANSWERS.md                     # Fichier de réponses
├── public/                        # Fichiers publics
│   ├── index.html                # Point d'entrée HTML
│   └── assets/
│       └── styles/               # Styles CSS
│           ├── styles.css        # Styles globaux
│           └── manches/          # Styles spécifiques par type de manche
│               ├── simple.css
│               ├── themes.css
│               ├── blindtest.css
│               ├── indices.css
│               ├── liste.css
│               └── vraifaux.css
├── resources/                     # Configuration et données
│   ├── config.json               # Configuration du jeu (noms, scores)
│   └── quiz-data.json            # Questions et manches du quiz
└── src/                          # Code source
    ├── main.js                   # Point d'entrée et initialisation
    ├── api/                      # Interfaces et classes abstraites
    │   └── Manche.js            # Classe de base pour toutes les manches
    ├── core/                     # Cœur de l'application
    │   ├── GameState.js         # État global du jeu (singleton)
    │   ├── QuizController.js    # Contrôleur principal du quiz
    │   └── MancheFactory.js     # Factory pour créer les manches
    ├── ui/                       # Interface utilisateur
    │   ├── UIManager.js         # Gestionnaire UI global (singleton)
    │   └── components/          # Composants UI réutilisables
    │       ├── index.js         # Export centralisé
    │       ├── ControlButtons.js    # Boutons de contrôle
    │       ├── AnswerReveal.js      # Affichage des réponses
    │       ├── Timer.js             # Composant chronomètre
    │       ├── AudioPlayer.js       # Lecteur audio/YouTube
    │       ├── ThemeSelector.js     # Sélecteur de thèmes
    │       ├── IndicesDisplay.js    # Affichage des indices
    │       ├── ListeInput.js        # Zone de saisie pour "La Liste"
    │       └── VFButtons.js         # Boutons Vrai/Faux
    ├── impl/                     # Implémentations
    │   └── manches/             # Implémentations des manches
    │       ├── index.js         # Export centralisé
    │       ├── MancheSimple.js
    │       ├── MancheThemes.js
    │       ├── MancheBlindTest.js
    │       ├── MancheIndices.js
    │       ├── MancheListe.js
    │       └── MancheVraiFaux.js
    └── utils/                    # Utilitaires
        └── DOMHelpers.js        # Helpers pour manipulation DOM
```

## 🏗️ Architecture Modulaire Refactorisée

Cette application suit les principes **SOLID** et utilise des **design patterns** éprouvés pour une architecture maintenable et extensible.

### 🎨 Design Patterns Utilisés

#### **Factory Pattern** (`MancheFactory`)
Centralise la création des manches selon leur type, permettant d'ajouter de nouveaux types sans modifier le code existant.

#### **Template Method Pattern** (Classe `Manche`)
Classe abstraite définissant le cycle de vie standard d'une manche : `initialize() → render() → onEnded() → cleanup()`.

#### **Singleton Pattern** (`GameState`, `UIManager`)
Instances uniques partagées dans toute l'application.

#### **Component Pattern** (`src/ui/components/`)
Composants UI réutilisables encapsulant leur logique et rendu.

---

### 📂 Structure Détaillée

#### `resources/` ⚙️ **À PERSONNALISER**

##### `config.json`
Configuration centralisée du jeu :
```json
{
  "players": {
    "player1": { "name": "Marie" },
    "player2": { "name": "Pauline" }
  },
  "game": {
    "listeTimerDuration": 45
  }
}
```

##### `quiz-data.json` 📝 **À PERSONNALISER**
Contient toutes les manches et questions du quiz.
**C'est ici que vous ajoutez vos propres questions !**

---

#### `src/core/` - Cœur de l'Application

##### `QuizController.js` 🎮
**Orchestrateur principal du quiz**
- Gère la progression entre les manches
- Coordonne `GameState` et `UIManager`
- Délègue la logique métier aux instances de manches
- Système de polling pour détecter la fin des manches

**Méthodes clés** :
- `startQuiz()` - Lance le quiz
- `nextManche()` - Passe à la manche suivante
- `loadManche()` - Instancie la manche via la Factory
- `handleMancheEnd()` - Gère les résultats et attribution des points

##### `GameState.js` (Singleton)
**État global du jeu - VERSION SIMPLIFIÉE**
- ✅ Scores des joueurs
- ✅ Jokers disponibles/utilisés
- ✅ Métadonnées des manches (stockage générique)

**Ce qu'il ne contient PLUS** :
- ❌ Plus de champs spécifiques aux manches (thèmes, indices, timer...)
- ❌ Chaque manche gère maintenant ses propres métadonnées

**Méthodes principales** :
- `incrementScore(player, points)` - Ajouter des points
- `useJoker(player)` - Activer un joker
- `getMetadata(index)` / `setMetadata(index, data)` - Stockage générique

##### `MancheFactory.js` (Pattern Factory)
**Factory pour créer des instances de manches**
- Enregistrement dynamique des types de manches
- Création d'instances selon le type
- Récupération des labels d'affichage

**Méthodes** :
- `register(type, MancheClass)` - Enregistre un type
- `create(mancheData, config)` - Crée une instance
- `getTypeLabel(type)` - Obtient le label d'affichage

---

#### `src/api/` - Classes Abstraites

##### `Manche.js` (Classe Abstraite)
**Template Method Pattern** - Définit le cycle de vie d'une manche

**Lifecycle** :
1. `initialize()` - Charge métadonnées, CSS, et affiche l'UI
2. `render()` - ⚠️ À implémenter par les sous-classes
3. `onEnded()` - ⚠️ À implémenter - Retourne `{ winner, points }`
4. `cleanup()` - Nettoie ressources (timers, listeners, CSS)

**Gestion métadonnées** :
- `loadMetadata()` - Initialise l'état de la manche
- `saveMetadata()` - Sauvegarde pour GameState

**Helpers** :
- `loadCSS()` / `unloadCSS()` - Chargement dynamique des styles
- `escapeHtml(text)` - Protection XSS

---

#### `src/impl/manches/` - Implémentations des Manches

Chaque manche hérite de `Manche` et implémente :
- `static getTypeLabel()` - Label d'affichage
- `render()` - Interface utilisateur
- `onEnded()` - Logique de fin et résultats

**Types disponibles** :
- `MancheSimple` - Question simple (avec bouton révéler)
- `MancheThemes` - 4 thèmes avec 2 questions chacun
- `MancheBlindTest` - Reconnaissance audio (MP3/YouTube)
- `MancheIndices` - Indices progressifs (4→3→2→1 points)
- `MancheListe` - Chrono 45s pour lister des réponses (avec bouton révéler)
- `MancheVraiFaux` - Série d'affirmations V/F
- `MancheQCM` - Questions à choix multiples, tour par tour

---

#### `src/ui/` - Interface Utilisateur

##### `UIManager.js` (Singleton)
**Responsabilités réduites aux éléments GLOBAUX uniquement**
- ✅ Scores des joueurs
- ✅ Barre de progression
- ✅ Panneau de jokers
- ✅ Célébrations et confettis
- ✅ Modal de victoire finale

**Ce qu'il ne gère PLUS** :
- ❌ Contrôles spécifiques aux manches (déplacé dans chaque `Manche`)
- ❌ Templates HTML des manches (géré par `render()`)

##### `src/ui/components/` - Composants Réutilisables
Composants UI encapsulés utilisés par les manches :
- `ControlButtons` - Boutons attribuer points / passer
- `AnswerReveal` - Affichage de la réponse
- `Timer` - Chronomètre visuel
- `AudioPlayer` - Lecteur MP3/YouTube
- `ThemeSelector` - Sélection de thèmes A/B/C/D
- `IndicesDisplay` - Affichage indices progressifs
- `ListeInput` - Zone de texte avec chrono
- `VFButtons` - Boutons Vrai/Faux

---

#### `src/main.js`
**Point d'entrée et bootstrap de l'application**
- Charge `config.json` et `quiz-data.json`
- Enregistre les types de manches dans la Factory
- Initialise l'UI (noms joueurs, liste des manches)
- Expose `window.quizController.startQuiz()`

---

### ✨ Avantages de l'Architecture Refactorisée

✅ **Extensibilité** : Ajouter un nouveau type de manche = créer une classe + l'enregistrer
✅ **Séparation des responsabilités** : Chaque classe a un rôle unique et clair
✅ **Maintenabilité** : Code organisé, facile à comprendre et modifier
✅ **Réutilisabilité** : Composants UI réutilisables entre manches
✅ **CSS modulaire** : Chaque manche charge son propre CSS dynamiquement
✅ **Testabilité** : Classes découplées, faciles à tester unitairement

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

Éditer [resources/config.json](resources/config.json) :

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

Éditer [resources/quiz-data.json](resources/quiz-data.json) - **Voici tous les types de manches disponibles** :

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

#### 🎯 QCM - Questions à Choix Multiples
```javascript
{
    id: 11,
    type: "qcm",
    title: "QCM",
    points: 2,
    questions: [
        {
            question: "Votre question ici ?",
            choices: {
                A: "Première option",
                B: "Deuxième option",
                C: "Troisième option",
                D: "Quatrième option"
            },
            // Une seule bonne réponse
            answer: "A"

            // OU plusieurs bonnes réponses
            // answer: ["A", "C"]
        },
        {
            question: "Question 2 avec plusieurs réponses ?",
            choices: {
                A: "Option 1",
                B: "Option 2",
                C: "Option 3",
                D: "Option 4"
            },
            answer: ["B", "D"]  // Plusieurs bonnes réponses
        }
        // Autant de questions que souhaité
    ],
    note: "Les joueuses répondent à tour de rôle. La bonne réponse est révélée après chaque question."
}
```

## 🔧 Technologies & Patterns Utilisés

- **HTML5** - Structure sémantique
- **CSS3** - Styles modulaires avec chargement dynamique par manche
- **JavaScript ES6+** - Modules, classes, imports/exports
- **Design Patterns** :
  - **Factory Pattern** : Création des manches (`MancheFactory`)
  - **Template Method** : Cycle de vie des manches (`Manche`)
  - **Singleton** : État global (`GameState`, `UIManager`)
  - **Component Pattern** : Composants UI réutilisables
- **Architecture Modulaire** :
  - **Core** : Orchestration et état (`QuizController`, `GameState`)
  - **API** : Interfaces abstraites (`Manche`)
  - **UI** : Gestion de l'affichage (`UIManager`, `components/`)
  - **Impl** : Implémentations concrètes (`manches/`)

## ✨ Fonctionnalités

- ✅ **100% Personnalisable** : Noms, questions, thèmes configurables
- ✅ **7 Types de Manches** : Simple, Thèmes, Blind Test, Indices, Liste, Vrai/Faux, QCM
- ✅ **Support YouTube** : Utilisez des liens YouTube pour les blind tests
- ✅ **Support MP3** : Ou utilisez vos propres fichiers audio
- ✅ **Système de Jokers** : Doublez les points d'une manche
- ✅ **Interface Responsive** : Fonctionne sur tous les écrans
- ✅ **Animations** : Célébrations, confettis, transitions fluides
- ✅ **Architecture Extensible** : Ajoutez facilement de nouveaux types de manches
- ✅ **CSS Modulaire** : Chaque manche charge son propre style dynamiquement
- ✅ **Composants Réutilisables** : Bibliothèque de composants UI

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

### Ajouter un Nouveau Type de Manche

Grâce à l'architecture modulaire, ajouter un nouveau type de manche est simple :

1. **Créer la classe** dans `src/impl/manches/MancheMonType.js` :
```javascript
import Manche from '../../api/Manche.js';

export default class MancheMonType extends Manche {
    static getTypeLabel() {
        return 'Mon Type de Manche';
    }

    loadMetadata() {
        this.metadata = { /* état initial */ };
    }

    render() {
        this.container.innerHTML = `<div>Mon UI</div>`;
        // Ajouter les event listeners
    }

    onEnded() {
        return { winner: 'player1', points: this.mancheData.points };
    }

    cleanup() {
        super.cleanup();
        // Nettoyage spécifique (timers, listeners...)
    }
}
```

2. **Exporter** dans `src/impl/manches/index.js` :
```javascript
export { default as MancheMonType } from './MancheMonType.js';
```

3. **Enregistrer** dans `src/main.js` :
```javascript
MancheFactory.register('montype', Manches.MancheMonType);
```

4. **Créer le CSS** (optionnel) dans `public/assets/styles/manches/montype.css`

5. **Utiliser** dans `resources/quiz-data.json` :
```json
{
  "id": 11,
  "type": "montype",
  "title": "MA NOUVELLE MANCHE",
  "points": 2,
  "question": "..."
}
```

## 📄 Licence

Projet personnel - Marie & Pauline

---

## 🚀 Démarrage Rapide

1. **Personnalisez les joueurs** dans `resources/config.json`
2. **Ajoutez vos questions** dans `resources/quiz-data.json`
3. **Lancez un serveur** (voir section Développement ci-dessus)
4. **Jouez !** 🎮

---

**Bon quiz ! Que le meilleur gagne ! 🎉**

_Exemple fourni : Quiz Taylor Swift - Marie VS Pauline_
