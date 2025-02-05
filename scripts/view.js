class View {
    constructor(widthCanvas, heightCanvas) {
        this._canvas = document.getElementById('my_canvas');
        this._ctx = this._canvas.getContext('2d');
        this._canvas.width = widthCanvas;
        this._canvas.height = heightCanvas;
        this._debugCheckbox = document.getElementById('toggle-hitbox');
        this._debug = this._debugCheckbox.checked;

        this._hold_right = false;
        this._hold_left = false;
        this._doodleLastDirection = 1;

        this._doodleLeft = this._loadImage('tiles/lik-left@2x.png');
        this._doodleRight = this._loadImage('tiles/lik-right@2x.png');
        this._HEXTILES_IMAGE = this._loadImage('tiles/game-tiles.png');

       

        // Plateformes
        this.greenProbElem = document.getElementById('prob-green'); 
        this.blueProbElem = document.getElementById('prob-blue');
        this.whiteProbElem = document.getElementById('prob-white');

        // Gaps
        this.gapMinElem = document.getElementById('gap-min');
        this.gapMaxElem = document.getElementById('gap-max');
        this.gapLastElem = document.getElementById('gap-last');

        // Récupération des éléments de l'overlay Game Over
        this.overlay = document.getElementById('game-over-overlay');
        this.finalScore = document.getElementById('final-score');
        this.resetButton = document.getElementById('overlay-reset');
        
        // Ajout de l'événement au bouton Reset de l'overlay
        this.resetButton.addEventListener('click', () => {
            this.overlay.style.display = 'none';
            this.reset();
        });

        // change the debug mode from the checkbox (id=toggle-hitbox)
        document.getElementById('toggle-hitbox').addEventListener('change', (evt) => {
            this._debug = evt.target.checked;
        });
                

        this._initEvents();
    }

    _loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    _resetGame() {
        this.overlay.style.display = 'none';
        this.reset();
    }
    

    bindGetPosition(callback) {
        this.getPosition = callback;
    }

    bindGetDirection(callback) {
        this.getDirection = callback;
    }

    bindGetPlatforms(callback) {
        this.getPlatforms = callback;
    }

    BindSetDirection(callback) {
        this.SetDirection = callback;
    }

    BindReset(callback) {
        this.reset = callback;
    }

    _initEvents() {
        document.addEventListener('keydown', (evt) => this._handleKeyDown(evt));
        document.addEventListener('keyup', (evt) => this._handleKeyUp(evt));
        document.getElementById('reset').addEventListener('click', () => this.reset());
 }

    _handleKeyDown(evt) {
        if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
            this._hold_left = evt.key === 'ArrowLeft';
            this._hold_right = evt.key === 'ArrowRight';
            this.SetDirection(this._hold_left ? -1 : 1);
        }
    }

    _handleKeyUp(evt) {
        if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
            if ((!this._hold_left && evt.key === 'ArrowRight') || (!this._hold_right && evt.key === 'ArrowLeft')) {
                this.SetDirection(0);
            }
            this._hold_left = evt.key !== 'ArrowLeft' ? this._hold_left : false;
            this._hold_right = evt.key !== 'ArrowRight' ? this._hold_right : false;
        }
    }

    _clearCanvas() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    showDoodle(position, direction) {
        let { x, y } = position;
        if (direction === 0) direction = this._doodleLastDirection;
        this._doodleLastDirection = direction;
        const doodleImage = direction === -1 ? this._doodleLeft : this._doodleRight;

        this._ctx.drawImage(doodleImage, x, y, 80, 80);

        // Dessiner la ligne des pieds (hitbox)
        if (this._debug) {
            this._ctx.strokeStyle = "red";
            this._ctx.beginPath();
            this._ctx.moveTo(x + (direction === -1 ? 16 : 23), y + 80);
            this._ctx.lineTo(x + (direction === -1 ? 57 : 64), y + 80);
            this._ctx.stroke();
            this._ctx.strokeStyle = "black";
        }

    }

    showPlatforms(platforms) {
        const platformTypes = { normal: 1, moving: 19, falling: 55 };

        platforms.forEach(({ x, y, width, height, type }) => {
            this._ctx.drawImage(this._HEXTILES_IMAGE, 1, platformTypes[type], 57, 15, x, y, width, height);
            if (this._debug) {
                this._ctx.beginPath();
                this._ctx.rect(x, y, width, height);
                this._ctx.stroke();
            }
                
        });
    }

    showDebug(ctx,data) {
        // if (this.ShowDebug) this.ShowDebug("gaps", { minGap, maxGap, gap });
        // if (this.game.ShowDebug) this.game.ShowDebug("prob", { normal: normalProbability, moving: movingProbability, falling: unstableProbability });


        if (ctx === "gaps") {
            this.gapMinElem.innerText = Math.floor(data.minGap) + "px";
            this.gapMaxElem.innerText = Math.floor(data.maxGap)+ "px";
            this.gapLastElem.innerText = Math.floor(data.gap)+ "px";
        }

        if (ctx === "prob") {
            this.greenProbElem.innerText = (data.normal * 100).toFixed(2) + "%";
            this.blueProbElem.innerText = (data.moving * 100).toFixed(2) + "%";
            this.whiteProbElem.innerText = (data.falling * 100).toFixed(2) + "%";
        }
    }

    Display(data) {
        if (!data.isAlive) {
            // Affichage du Game Over
            this.overlay.style.display = 'flex';
            this.finalScore.innerText = "Score: " + data.score;
            return;
        }
        this._clearCanvas();
        this.showPlatforms(data.platforms);
        this.showDoodle(data.position, data.direction);
        this.setScore(data.score);
    }

    setScore(score) {
        document.getElementById('score-value').innerText = score;
    }
}
