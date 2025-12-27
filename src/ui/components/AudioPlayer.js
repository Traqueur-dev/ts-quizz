/**
 * Composant AudioPlayer - Lecteur audio/YouTube avec contrôles de volume
 *
 * Gère deux types de médias:
 * - Vidéos YouTube (via YouTube IFrame API)
 * - Fichiers audio MP3
 */
export default class AudioPlayer {
    /**
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Object} options - Configuration
     *   - youtubeId: string - ID vidéo YouTube (optionnel)
     *   - audioFile: string - Chemin vers fichier audio (optionnel)
     *   - startTime: number - Temps de départ en secondes (défaut: 0)
     *   - volume: number - Volume initial (0-100, défaut: 50)
     *   - onVolumeChange: Function - Callback appelé quand le volume change
     */
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.volume = options.volume || 50;
        this.isPlaying = false;
        this.youtubePlayer = null;
        this.audioElement = null;

        this.render();
    }

    /**
     * Affiche l'interface du lecteur
     */
    render() {
        this.container.innerHTML = `
            <div class="audio-player">
                <div id="youtubePlayerContainer"></div>
                <button class="play-button" id="playButton">▶</button>
                <p class="audio-status" id="audioStatus">Cliquez pour lancer l'extrait audio</p>
                <div class="volume-control">
                    <span class="volume-icon" id="volumeIcon">🔊</span>
                    <input type="range" class="volume-slider" id="volumeSlider"
                           min="0" max="100" value="${this.volume}">
                    <span class="volume-value" id="volumeValue">${this.volume}%</span>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    /**
     * Bind les événements
     */
    bindEvents() {
        const playButton = this.container.querySelector('#playButton');
        const volumeSlider = this.container.querySelector('#volumeSlider');

        playButton.addEventListener('click', () => this.togglePlayback());
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }

    /**
     * Toggle lecture/arrêt
     */
    togglePlayback() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    /**
     * Lance la lecture
     */
    async play() {
        if (this.options.youtubeId) {
            await this.playYouTube();
        } else if (this.options.audioFile) {
            this.playAudio();
        } else {
            alert('🎵 Média non disponible. Jouez manuellement l\'extrait');
        }
    }

    /**
     * Lance la lecture YouTube
     */
    async playYouTube() {
        // Charger l'API YouTube si nécessaire
        if (!window.YT) {
            await this.loadYouTubeAPI();
        }

        // Créer le player si nécessaire
        if (!this.youtubePlayer) {
            await this.createYouTubePlayer();
        } else {
            // Charger et jouer la nouvelle vidéo
            this.youtubePlayer.loadVideoById({
                videoId: this.options.youtubeId,
                startSeconds: this.options.startTime || 0
            });
            this.youtubePlayer.playVideo();
        }

        this.isPlaying = true;
        this.updatePlayingUI();
    }

    /**
     * Charge l'API YouTube IFrame
     * @returns {Promise}
     */
    loadYouTubeAPI() {
        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                resolve();
                return;
            }

            // Créer le script tag
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Callback quand l'API est prête
            window.onYouTubeIframeAPIReady = () => {
                resolve();
            };
        });
    }

    /**
     * Crée le player YouTube
     * @returns {Promise}
     */
    createYouTubePlayer() {
        return new Promise((resolve) => {
            // Vérifier que le conteneur existe
            const container = document.getElementById('youtubePlayerContainer');
            if (!container) {
                console.error('Container youtubePlayerContainer introuvable');
                resolve();
                return;
            }

            this.youtubePlayer = new YT.Player('youtubePlayerContainer', {
                height: '0',
                width: '0',
                videoId: this.options.youtubeId,
                playerVars: {
                    start: this.options.startTime || 0,
                    autoplay: 1,
                    controls: 0
                },
                events: {
                    onReady: (event) => {
                        event.target.setVolume(this.volume);
                        resolve();
                    },
                    onError: (event) => {
                        console.error('YouTube Error Code:', event.data);
                        resolve(); // Résoudre quand même pour ne pas bloquer
                    }
                }
            });
        });
    }

    /**
     * Lance la lecture d'un fichier audio
     */
    playAudio() {
        // Créer l'élément audio si nécessaire
        if (!this.audioElement) {
            this.audioElement = new Audio();
            this.audioElement.volume = this.volume / 100;
        }

        this.audioElement.src = this.options.audioFile;
        this.audioElement.currentTime = this.options.startTime || 0;
        this.audioElement.play();

        this.isPlaying = true;
        this.updatePlayingUI();
    }

    /**
     * Arrête la lecture
     */
    stop() {
        // Arrêter YouTube
        if (this.youtubePlayer && this.youtubePlayer.stopVideo) {
            this.youtubePlayer.stopVideo();
        }

        // Arrêter l'audio
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }

        this.isPlaying = false;
        this.updateStoppedUI();
    }

    /**
     * Met à jour l'UI pendant le chargement
     */
    updateLoadingUI() {
        const playButton = this.container.querySelector('#playButton');
        const audioStatus = this.container.querySelector('#audioStatus');

        playButton.textContent = '⏳';
        playButton.disabled = true;
        audioStatus.textContent = 'Chargement de la vidéo YouTube...';
    }

    /**
     * Met à jour l'UI quand la musique joue
     */
    updatePlayingUI() {
        const playButton = this.container.querySelector('#playButton');
        const audioStatus = this.container.querySelector('#audioStatus');

        playButton.textContent = '⏹';
        playButton.disabled = false;
        playButton.classList.add('playing');
        audioStatus.textContent = 'Musique en cours...';
    }

    /**
     * Met à jour l'UI quand la musique est arrêtée
     */
    updateStoppedUI() {
        const playButton = this.container.querySelector('#playButton');
        const audioStatus = this.container.querySelector('#audioStatus');

        playButton.textContent = '▶';
        playButton.disabled = false;
        playButton.classList.remove('playing');
        audioStatus.textContent = 'Cliquez pour lancer l\'extrait audio';
    }

    /**
     * Met à jour l'UI en cas d'erreur
     */
    updateErrorUI(message) {
        const playButton = this.container.querySelector('#playButton');
        const audioStatus = this.container.querySelector('#audioStatus');

        playButton.textContent = '❌';
        playButton.disabled = false;
        playButton.classList.remove('playing');

        const youtubeUrl = `https://www.youtube.com/watch?v=${this.options.youtubeId}`;
        audioStatus.innerHTML = `⚠️ ${message}<br><a href="${youtubeUrl}" target="_blank" style="color: #ff6b6b; text-decoration: underline;">Ouvrir sur YouTube</a>`;

        this.isPlaying = false;
    }

    /**
     * Définit le volume
     * @param {number} value - Volume (0-100)
     */
    setVolume(value) {
        this.volume = parseInt(value);

        // Mettre à jour l'affichage
        const volumeValue = this.container.querySelector('#volumeValue');
        const volumeIcon = this.container.querySelector('#volumeIcon');

        if (volumeValue) {
            volumeValue.textContent = `${this.volume}%`;
        }

        // Mettre à jour l'icône
        if (volumeIcon) {
            if (this.volume === 0) {
                volumeIcon.textContent = '🔇';
            } else if (this.volume < 50) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        }

        // Appliquer le volume au YouTube player
        if (this.youtubePlayer && this.youtubePlayer.setVolume) {
            this.youtubePlayer.setVolume(this.volume);
        }

        // Appliquer le volume à l'audio
        if (this.audioElement) {
            this.audioElement.volume = this.volume / 100;
        }

        // Callback si défini
        if (this.options.onVolumeChange) {
            this.options.onVolumeChange(this.volume);
        }
    }

    /**
     * Retourne le volume actuel
     * @returns {number}
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Nettoie le composant
     */
    cleanup() {
        // Arrêter d'abord
        this.stop();

        // Détruire le player YouTube
        if (this.youtubePlayer && this.youtubePlayer.destroy) {
            this.youtubePlayer.destroy();
            this.youtubePlayer = null;
        }

        // Nettoyer l'audio
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
            this.audioElement = null;
        }

        // Vider le container
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
