/**
 * Composant Timer - Chronomètre dégressif
 *
 * Affiche un compte à rebours et déclenche un callback à la fin
 */
export default class Timer {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Object} options - Configuration
     *   - duration: number - Durée en secondes
     *   - onTick: Function - Callback appelé à chaque seconde (optionnel)
     *   - onComplete: Function - Callback appelé à la fin
     */
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.duration = options.duration;
        this.timeRemaining = this.duration;
        this.interval = null;
        this.isRunning = false;

        this.render();
    }

    /**
     * Affiche le timer
     */
    render() {
        this.container.innerHTML = `
            <div class="timer-display">
                <div class="timer-value" id="timerValue">${this.formatTime(this.timeRemaining)}</div>
                <div class="timer-label">Temps restant</div>
            </div>
        `;
    }

    /**
     * Démarre le timer
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    /**
     * Tick du timer
     */
    tick() {
        this.timeRemaining--;

        // Mettre à jour l'affichage
        this.updateDisplay();

        // Callback onTick
        if (this.options.onTick) {
            this.options.onTick(this.timeRemaining);
        }

        // Vérifier si terminé
        if (this.timeRemaining <= 0) {
            this.stop();
            if (this.options.onComplete) {
                this.options.onComplete();
            }
        }
    }

    /**
     * Met à jour l'affichage du timer
     */
    updateDisplay() {
        const timerValue = this.container.querySelector('#timerValue');
        if (timerValue) {
            timerValue.textContent = this.formatTime(this.timeRemaining);

            // Ajouter une classe warning si < 10 secondes
            if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
                timerValue.classList.add('warning');
            } else {
                timerValue.classList.remove('warning');
            }

            // Ajouter une classe danger si terminé
            if (this.timeRemaining <= 0) {
                timerValue.classList.add('danger');
            }
        }
    }

    /**
     * Arrête le timer
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    /**
     * Réinitialise le timer
     */
    reset() {
        this.stop();
        this.timeRemaining = this.duration;
        this.updateDisplay();
    }

    /**
     * Formate le temps en MM:SS
     * @param {number} seconds - Secondes
     * @returns {string}
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * Retourne le temps restant
     * @returns {number}
     */
    getTimeRemaining() {
        return this.timeRemaining;
    }

    /**
     * Vérifie si le timer est en cours
     * @returns {boolean}
     */
    isRunning() {
        return this.isRunning;
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        this.stop();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
