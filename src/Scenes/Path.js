class Path extends Phaser.Scene {
    // Class variable definitions -- these are all "undefined" to start
    graphics;
    curve;
    path;

    constructor(){
        super("pathMaker");
    }

    preload() {
        this.load.setPath("./assets/");                        // Set load path
        this.load.image("x-mark", "numeralX.png");             // x marks the spot
        this.load.image("enemyShip", "enemyGreen1.png");       // spaceship that runs along the path
    }

    create() {
        // Create a curve, for use with the path
        // Initial set of points are only used to ensure there is something on screen to begin with.
        // No need to save these values.
        this.points = [
            20, 20,
            80, 400,
            300, 750
        ];
        this.curve = new Phaser.Curves.Spline(this.points);

        // Initialize Phaser graphics, used to draw lines
        this.graphics = this.add.graphics();

        // Define key bindings
        this.ESCKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        // Draw initial graphics
        this.xImages = [];
        this.drawPoints();
        this.drawLine();

        // Create mouse event handler
        // We create this in create() since we only want one active in this scene
        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            this.addPoint({x: pointer.x, y: pointer.y});
            this.drawLine();
        });

        // TODO:
        this.runMode = false;

        // Create enemyShip as a follower type of sprite
        // Call startFollow() on enemyShip to have it follow the curve
        my.sprite.enemyShip = this.add.follower(this.curve, 10, 10, "enemyShip");
        my.sprite.enemyShip.visible = false;

        document.getElementById('description').innerHTML = '<h2>Path.js</h2><br>ESC: Clear points <br>O - output points <br>R - run mode';
    }

    // Draws an x mark at every point along the spline.
    drawPoints() {
        for (let point of this.curve.points) {
            this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
        }
    }

    // Clear points
    // Removes all of the points, and then clears the line and x-marks
    clearPoints() {
        this.curve.points = [];
        this.graphics.clear();
        for (let img of this.xImages) {
            img.destroy();
        }
    }

    // Add a point to the spline
    addPoint(point) {
        this.curve.addPoint(point);
        this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
    }

    // Draws the spline
    drawLine() {
        this.graphics.clear();                      // Clear the existing line
        this.graphics.lineStyle(2, 0xffffff, 1);    // A white line
        this.curve.draw(this.graphics, 32);         // Draw the spline
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.ESCKey)) {
            console.log("Clear path");
            if (!this.runMode) {
                this.clearPoints();
            }
            this.clearPoints();

        }



        if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
            console.log("Output the points");

            let pointsOutStr = "[\n";
            for (let point of this.curve.points) {
                pointsOutStr += "\t" + point.x + ", " + point.y + ",\n";
            }

            pointsOutStr = pointsOutStr.slice(0, -2);
            pointsOutStr += "\n]";

            console.log(pointsOutStr);
        }   

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            console.log("Run mode");
            if (!this.runMode) {
                if (this.curve.points.length > 0) {
                    this.runMode = true;
                    my.sprite.enemyShip.visible = true;
                    my.sprite.enemyShip.setPosition(this.curve.points[0].x, this.curve.points[0].y);
                    my.sprite.enemyShip.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 2000,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true,
                        rotateToPath: true,
                        rotationOffset: -90
                    });
                }
            } else {
                this.runMode = false;
                my.sprite.enemyShip.stopFollow();
                my.sprite.enemyShip.visible = false;
            }
        }
    }

}