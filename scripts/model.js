class Model {
    constructor(widthCanvas, heightCanvas) {
        this.widthCanvas = widthCanvas; // Largeur du canvas
        this.heightCanvas = heightCanvas; // Hauteur du canvas
        this.init(); // Initialisation des objets du jeu
    }

    init() {
        this.score = 0; // Initialisation du score
        this.platforms = []; // Liste des plateformes
        this.doodle = new Doodle(this); // Création du doodle
        this.generateInitialPlatforms(); // Génération des premières plateformes
    }

    generateInitialPlatforms() {
        // Génère des plateformes réparties sur toute la hauteur du canvas
        for (let y = this.heightCanvas - 30; y > 0; y -= Math.floor(Math.random() * (70 - 30) + 30)) {
            let x = Math.floor(Math.random() * (this.widthCanvas - 57)); // Position X aléatoire
            let platform = new Platform(this, x, y, this.score); // Création de la plateforme
            this.platforms.push(platform); // Ajout de la plateforme à la liste
        }
    }

    deletePlatform(platform) {
        // Supprime une plateforme de la liste
        for (let i = 0; i < this.platforms.length; i++) {
            if (platform === this.platforms[i]) {
                if (platform.interval) {
                    clearInterval(platform.interval); // Arrête l'animation si c'est une plateforme mobile
                }
                this.platforms.splice(i, 1); // Retire la plateforme de la liste
            }
        }
    }
    
    BindDisplay(callback) {
        this.b_Display = callback; // Associe une fonction d'affichage externe au modèle
    }

    BindDebug(callback) {
        this.ShowDebug = callback; // Associe une fonction de débogage externe au modèle
    }

    Move(fps) {
        if (!this.doodle.isAlive) return; // Arrête le jeu si le doodle est mort

        // Calcul dynamique des espacements entre plateformes en fonction du score
        let minGap = Math.min(30 + this.score / 20, 240); // Augmente plus vite
        let maxGap = Math.min(120 + this.score / 30, 280); // Augmente mais plus lentement
        
        let exponent = 1 - Math.min(this.score / 250, 0.8); // Ajusté pour garder une bonne distribution
        let gapFactor = Math.pow(Math.random(), exponent);
        let gap = Math.floor(minGap + gapFactor * (maxGap - minGap));
        
    
        if (this.platforms[this.platforms.length - 1].y > gap) {
            if (this.ShowDebug) this.ShowDebug("gaps", { minGap, maxGap, gap });
            this.generateNewPlatform(); // Génère une nouvelle plateforme si nécessaire
        }

        this.doodle.Move(fps); // Déplace le doodle

        this.b_Display({ // Mise à jour de l'affichage
            position: this.doodle.getPosition(),
            direction: this.doodle.getDirection(),
            platforms: this.platforms,
            score: this.score,
            isAlive: this.doodle.isAlive
        });
    }
    
    generateNewPlatform() {
        let x = Math.floor(Math.random() * (this.widthCanvas - 57)); // Position X aléatoire
        let y = -10; // Position Y en dehors du canvas pour apparaître progressivement
        let platform = new Platform(this, x, y, this.score);
        this.platforms.push(platform);
    }
    
    reset() {
        this.init(); // Réinitialisation complète du jeu
    }
}


class Doodle {
    static JUMP_FORCE = 850;
    static GRAVITY = 20;
    static SPEED = 300;
    static INITIAL_POSITION_X = 240;
    static INITIAL_POSITION_Y = 484;

    constructor(model) {
        this.model = model; // Référence au modèle principal
        this.x = Doodle.INITIAL_POSITION_X; // Position initiale X
        this.y = Doodle.INITIAL_POSITION_Y; // Position initiale Y
        this.width = 57;
        this.height = 50;
        this.direction = 0;
        this.gravitySpeed = 0;
        this.isAlive = true;
        this.lastDirection = 1; // Dernière direction utilisée pour l'animation
    }

    getPosition() {
        return {x: this.x, y: this.y};
    }

    getDirection() {
        return this.direction;
    }

    setDirection(newDirection) {
        this.direction = newDirection;
        if (newDirection !== 0) {
            this.lastDirection = newDirection; // Sauvegarde de la dernière direction utilisée
        }
    }
    
    Move(fps) {
        this.gravitySpeed += Doodle.GRAVITY; // Ajout de la gravité
        this.y += this.gravitySpeed / fps; // Mise à jour de la position verticale
        this.x += this.direction * Doodle.SPEED / fps; // Déplacement horizontal

        // Gestion du scrolling si le doodle atteint une certaine hauteur
        if (this.y < this.model.heightCanvas * 0.35) {
            this.y = this.model.heightCanvas * 0.35;
            let M = Math.abs(this.gravitySpeed) / fps;
            this.model.platforms.forEach(platform => platform.scrollDown(M));
            this.model.score += Math.floor(M / 5); // Mise à jour du score
        }

        // Détection des collisions avec les plateformes
        if (this.gravitySpeed > 0 && this.collision()) {
            this.Jump();
        }

        // Gestion du passage d'un bord à l'autre du canvas
        if (this.x > this.model.widthCanvas - 30) this.x = -30;
        if (this.x < -30) this.x = this.model.widthCanvas - 30;

        // Si le doodle tombe hors du canvas, il meurt
        if (this.y > this.model.heightCanvas) this.isAlive = false;
    }

    Jump() {
        this.gravitySpeed = -Doodle.JUMP_FORCE; // Applique une force vers le haut
    }

    collision() {
        let res = null;
        let doodleFeetLine = { x1: this.x + 16, x2: this.x + 57, y: this.y + 80 };

        this.model.platforms.forEach(platform => {
            let platformTopLine = { x1: platform.x, x2: platform.x + platform.width, y: platform.y };
            let platformBottomLine = { x1: platform.x, x2: platform.x + platform.width, y: platform.y + platform.height };

            if (doodleFeetLine.y >= platformTopLine.y && doodleFeetLine.y <= platformBottomLine.y) {
                if ((doodleFeetLine.x1 >= platformTopLine.x1 && doodleFeetLine.x1 <= platformTopLine.x2) ||
                    (doodleFeetLine.x2 >= platformTopLine.x1 && doodleFeetLine.x2 <= platformTopLine.x2)) {
                    res = platform;
                }
            }
        });

        if (res && res.type === "falling") {
            res.interval = setInterval(res.scrollDown.bind(res), 1000 / 60, 5);
        }
        return res;
    }

    reset() {
        this.x = Doodle.INITIAL_POSITION_X;
        this.y = Doodle.INITIAL_POSITION_Y;
        this.direction = 0;
        this.gravitySpeed = 0;
        this.isAlive = true;
    }
}


class Platform {
    constructor(game, x, y, score) {
        this.game = game; // Référence au jeu (modèle principal)
        this.width = 57; // Largeur fixe de la plateforme
        this.height = 17; // Hauteur fixe de la plateforme
        this.x = x; // Position horizontale
        this.y = y; // Position verticale
        this.type = this.setRandomType(score); // Détermine le type de la plateforme en fonction du score
        this.interval = null; // Stocke l'intervalle d'animation si nécessaire
        this.direction = 1; // Direction initiale pour les plateformes mobiles

        // Si la plateforme est de type "moving", on initialise son mouvement
        if (this.type === "moving") {
            this.interval = setInterval(this.move.bind(this), 1000 / 60);
        }
    }

    scrollDown(y) {
        // Fait descendre la plateforme d'un certain nombre de pixels
        this.y += y;
        
        // Si la plateforme sort de l'écran (en bas), on la supprime
        if (this.y > this.game.heightCanvas) {
            this.game.deletePlatform(this);
        }
    }

    move() {
        // Fait bouger la plateforme horizontalement de 5px à chaque appel
        this.x += this.direction * 3;
        
        // Si la plateforme atteint le bord droit de l'écran, elle change de direction
        if (this.x > this.game.widthCanvas - this.width) {
            this.direction = -1;
        }
        
        // Si la plateforme atteint le bord gauche de l'écran, elle change de direction
        if (this.x < 0) {
            this.direction = 1;
        }
    }

    setRandomType(score) {
        // Progression de difficulté (de 0 à 1)
        let difficultyFactor = Math.min(score / 5000, 1); 
    
        // Probabilités progressives (au début 100% normal, puis équilibre 1/3 à haut score)
        let normalProbability = Math.max(1 - difficultyFactor * 1.5, 0.2); // Diminue jusqu'à 20%
        let movingProbability = Math.min(difficultyFactor * 0.8, 0.4); // Monte jusqu'à 40%
        let unstableProbability = Math.min(difficultyFactor * 0.7, 0.4); // Monte jusqu'à 40%
    
        // Normalisation pour s'assurer que la somme = 1
        let total = normalProbability + movingProbability + unstableProbability;
        normalProbability /= total;
        movingProbability /= total;
        unstableProbability /= total;
    
        // Débogage des probabilités
        if (this.game.ShowDebug) this.game.ShowDebug("prob", { normal: normalProbability, moving: movingProbability, falling: unstableProbability });
        // Génération aléatoire du type
        let random = Math.random();
        if (random < normalProbability) {
            return "normal";
        }
        if (random < normalProbability + movingProbability) {
            return "moving";
        }
        return "falling";
    }
    
};