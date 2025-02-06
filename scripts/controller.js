class Controller {
    constructor(model,view) {
        this.model = model;
        this.view = view;

        this.startTime     = Date.now();
        this.lag           = 0;
        this.fps           = 60; 
        this.frameDuration = 1000 / this.fps;

        // Connexion de la vue avec le controller
        this.view.bindSetDirection(this.SetDirection.bind(this));
        this.view.bindReset(this.reset.bind(this));

        // Connexion du model avec le controller
        this.model.BindDebug(this.showDebug.bind(this));
        this.model.BindDisplay(this.display.bind(this));

    }

    Display(position) {
        this.view.Display(position);
    }

    SetDirection(newDirection) {
        this.model.doodle.setDirection(newDirection);
    }
    showDebug(ctx,data) {
        this.view.showDebug(ctx,data);
    }
    reset() {
        this.model.reset();
    }

    display(data) {
        this.view.display(data);
    }
    

    Update() {
        /* Calcul du deltaTime */
        let currentTime = Date.now();
        let deltaTime   = currentTime - this.startTime; // La durée entre deux appels (entre 2 frames).
        
        this.lag += deltaTime;
        this.startTime = currentTime;

        /* Mettre à jour la logique si la variable _lag est supérieure ou égale à la durée d'une frame */
        while (this.lag >= this.frameDuration) {
            /* Mise à jour de la logique */

            this.model.Move(this.fps);
            /* Réduire la variable _lag par la durée d'une frame */
            this.lag -= this.frameDuration;
        }
        
        requestAnimationFrame(this.Update.bind(this)); // La fonction de rappel est généralement appelée 60 fois par seconde.
    }
}