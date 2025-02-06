class View {
    constructor(width, height) {
        // Initialisation du canvas et du contexte
        this.canvas = document.getElementById('my_canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Initialisation du mode debug
        this.debugCheckbox = document.getElementById('toggle-hitbox');
        this.debug = this.debugCheckbox.checked;
        this.debugCheckbox.addEventListener('change', (evt) => {
            this.debug = evt.target.checked;
        });
        
        // Chargement des images
        this.doodleLeftImg = this._loadImage('/tiles/lik-left@2x.png');
        this.doodleRightImg = this._loadImage('/tiles/lik-right@2x.png');
        this.tilesetImg = this._loadImage('/tiles/game-tiles.png');
        
        // État des touches
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.lastDirection = 1;
        
        // Élément de score
        this.scoreElem = document.getElementById('score-value');
        
        // Probabilités des plateformes
        this.greenProbElem = document.getElementById('prob-green'); 
        this.blueProbElem = document.getElementById('prob-blue');
        this.whiteProbElem = document.getElementById('prob-white');
        
        // Espacement des plateformes
        this.gapMinElem = document.getElementById('gap-min');
        this.gapMaxElem = document.getElementById('gap-max');
        this.gapLastElem = document.getElementById('gap-last');
        
        // Overlay Game Over
        this.overlay = document.getElementById('game-over-overlay');
        this.finalScoreElem = document.getElementById('final-score');
        this.resetButton = document.getElementById('overlay-reset');
        this.resetButton.addEventListener('click', () => this._resetGame());
        
        // Initialisation des événements
        this._initEvents();
    }

    /**
     * Charge une image et retourne l'objet Image correspondant
     */
    _loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }
    
    /**
     * Réinitialise le jeu
     */
    _resetGame() {
        this.overlay.style.display = 'none';
        this.resetCallback();
    }
    
    /**
     * Bind des callbacks pour la logique du jeu
     */
    bindReset(callback) {
        this.resetCallback = callback;
    }

    bindSetDirection(callback) {
        this.setDirectionCallback = callback;
    }
    
    /**
     * Gestion des événements clavier
     */
    _initEvents() {
        document.addEventListener('keydown', (evt) => this._handleKeyDown(evt));
        document.addEventListener('keyup', (evt) => this._handleKeyUp(evt));
        document.getElementById('reset').addEventListener('click', () => this.resetCallback());
    }

    _handleKeyDown(evt) {
        if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
            this.isMovingLeft = evt.key === 'ArrowLeft';
            this.isMovingRight = evt.key === 'ArrowRight';
            this.setDirectionCallback(this.isMovingLeft ? -1 : 1);
        }
    }

    _handleKeyUp(evt) {
        if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
            if ((!this.isMovingLeft && evt.key === 'ArrowRight') || (!this.isMovingRight && evt.key === 'ArrowLeft')) {
                this.setDirectionCallback(0);
            }
            this.isMovingLeft = evt.key !== 'ArrowLeft' ? this.isMovingLeft : false;
            this.isMovingRight = evt.key !== 'ArrowRight' ? this.isMovingRight : false;
        }
    }
    
    /**
     * Nettoie le canvas
     */
    _clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Affiche le personnage principal
     */
    showDoodle(position, direction) {
        let { x, y } = position;
        if (direction === 0) direction = this.lastDirection;
        this.lastDirection = direction;
        const doodleImage = direction === -1 ? this.doodleLeftImg : this.doodleRightImg;

        this.ctx.drawImage(doodleImage, x, y, 80, 80);
        
        if (this.debug) {
            this.ctx.strokeStyle = "red";
            this.ctx.beginPath();
            this.ctx.moveTo(x + (direction === -1 ? 16 : 23), y + 80);
            this.ctx.lineTo(x + (direction === -1 ? 57 : 64), y + 80);
            this.ctx.stroke();
            this.ctx.strokeStyle = "black";
        }
    }
    
    /**
     * Affiche les plateformes
     */
    showPlatforms(platforms) {
        const platformTypes = { normal: 1, moving: 19, falling: 55 };
        
        platforms.forEach(({ x, y, width, height, type }) => {
            this.ctx.drawImage(this.tilesetImg, 1, platformTypes[type], 57, 15, x, y, width, height);
            if (this.debug) {
                this.ctx.strokeStyle = "blue";
                this.ctx.strokeRect(x, y, width, height);
            }
        });
    }
    
    /**
     * Affiche les données de debug
     */
    showDebug(context, data) {
        if (context === "gaps") {
            this.gapMinElem.innerText = `${Math.floor(data.minGap)}px`;
            this.gapMaxElem.innerText = `${Math.floor(data.maxGap)}px`;
            this.gapLastElem.innerText = `${Math.floor(data.gap)}px`;
        } else if (context === "prob") {
            this.greenProbElem.innerText = `${(data.normal * 100).toFixed(2)}%`;
            this.blueProbElem.innerText = `${(data.moving * 100).toFixed(2)}%`;
            this.whiteProbElem.innerText = `${(data.falling * 100).toFixed(2)}%`;
        }
    }
    
    /**
     * Met à jour l'affichage du jeu
     */
    display(data) {
        if (!data.isAlive) {
            this.overlay.style.display = 'flex';
            this.finalScoreElem.innerText = `Score: ${data.score}`;
            return;
        }
        this._clearCanvas();
        this.showPlatforms(data.platforms);
        this.showDoodle(data.position, data.direction);
        this.setScore(data.score);
    }
    
    /**
     * Met à jour l'affichage du score
     */
    setScore(score) {
        this.scoreElem.innerText = score;
    }
}
